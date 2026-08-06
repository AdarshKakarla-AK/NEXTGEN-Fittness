import { NextResponse } from "next/server";
import { getDB, mutate, uid, today, nextCounter, nowISO } from "@/lib/db/store";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";
import { audit } from "@/lib/notify";
import type { Payment, PayMethod } from "@/lib/db/types";

export const runtime = "nodejs";

const PAY_METHODS = ["upi", "card", "netbanking", "wallet", "emi"];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const planId = String(body.planId ?? "");
    const agreed = Boolean(body.agreed);
    const couponCode = String(body.couponCode ?? "").trim().toUpperCase();
    const paymentMethod = String(body.paymentMethod ?? "upi");

    if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    if (!planId) return NextResponse.json({ error: "Please choose a membership plan." }, { status: 400 });
    if (!agreed) return NextResponse.json({ error: "Please accept the liability waiver and terms." }, { status: 400 });
    if (!PAY_METHODS.includes(paymentMethod)) return NextResponse.json({ error: "Choose a valid payment method." }, { status: 400 });

    const db = getDB();
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    if (db.users.some((u) => u.email?.toLowerCase() === email)) {
      return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
    }

    const coupon = couponCode ? db.coupons.find((c) => c.code === couponCode && c.active) : undefined;
    if (couponCode && !coupon) {
      const exists = db.coupons.find((c) => c.code === couponCode);
      return NextResponse.json({ error: exists ? "This coupon has expired." : "Invalid coupon code." }, { status: 400 });
    }
    if (coupon && coupon.uses >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }
    if (coupon && (coupon.validFrom > today() || coupon.validTo < today())) {
      return NextResponse.json({ error: "This coupon is not currently valid." }, { status: 400 });
    }
    const discount = coupon ? (coupon.type === "percent" ? Math.round((plan.price * coupon.value) / 100) : Math.min(coupon.value, plan.price)) : 0;
    const total = plan.price - discount;
    if (total < 0) return NextResponse.json({ error: "Coupon exceeds the plan price." }, { status: 400 });

    const mode = razorpayConfigured() ? "razorpay" : "demo";

    const { paymentRef, paymentId } = mutate((d) => {
      const seq = nextCounter(d, "paymentSeq");
      const ref = `PYMT-${String(seq).padStart(5, "0")}`;
      const pay: Payment = {
        id: uid("pay"),
        ref,
        description: `${plan.name} — ${plan.durationMonths} month(s)`,
        amount: total,
        paidAmount: 0,
        method: paymentMethod as PayMethod,
        status: "pending",
        payerEmail: email,
        payerPhone: phone,
        meta: JSON.stringify({ planId, couponCode: couponCode || undefined }),
        createdAt: nowISO(),
      };
      if (mode === "demo") {
        pay.orderId = `rzp_demo_${ref}`;
        pay.razorpayOrderId = pay.orderId;
      }
      d.payments.push(pay);
      audit(d, "guest", name, "payment.order_created", ref, `${plan.name} ₹${total}`);
      return { paymentRef: ref, paymentId: pay.id };
    });

    let orderId = mode === "demo" ? `rzp_demo_${paymentRef}` : "";
    if (mode === "razorpay") {
      const order = await createRazorpayOrder({
        amountPaisa: Math.round(total * 100),
        receipt: paymentRef,
        notes: { member: name, email },
      });
      orderId = order.id;
      mutate((d) => {
        const pay = d.payments.find((p) => p.id === paymentId);
        if (pay) {
          pay.orderId = order.id;
          pay.razorpayOrderId = order.id;
        }
      });
    }

    return NextResponse.json({
      paymentRef,
      orderId,
      amount: total,
      currency: "INR",
      mode,
      keyId: process.env.RAZORPAY_KEY_ID ?? "",
      plan: plan.name,
    });
  } catch (err) {
    console.error("ORDER ERROR", err);
    return NextResponse.json({ error: "Could not create the payment order." }, { status: 500 });
  }
}
