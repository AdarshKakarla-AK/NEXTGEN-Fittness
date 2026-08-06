import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB, mutate, uid, today, nextCounter } from "@/lib/db/store";
import { createSessionToken, sessionKey } from "@/lib/auth";
import { dispatch, pushNotification, audit } from "@/lib/notify";
import type { User, Payment } from "@/lib/db/types";

export const runtime = "nodejs";

const AVATAR_COLORS = ["#22c55e", "#3385ff", "#f97316", "#a855f7", "#14b8a6", "#ef4444", "#eab308", "#06b6d4"];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const planId = String(body.planId ?? "");
    const agreed = Boolean(body.agreed);

    if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    if (!planId) return NextResponse.json({ error: "Please choose a membership plan." }, { status: 400 });
    if (!agreed) return NextResponse.json({ error: "Please accept the liability waiver and terms." }, { status: 400 });

    const db = getDB();
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    if (db.users.some((u) => u.email?.toLowerCase() === email)) {
      return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
    }

    const coupon = body.couponCode ? db.coupons.find((c) => c.code === String(body.couponCode).toUpperCase() && c.active) : undefined;
    if (body.couponCode && !coupon) {
      const raw = String(body.couponCode).toUpperCase();
      const exists = db.coupons.find((c) => c.code === raw);
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

    const passwordHash = await bcrypt.hash(password, 10);
    const result = mutate((d) => {
      const memberSeq = nextCounter(d, "memberSeq");
      const memberId = `NF-2026-${String(memberSeq).padStart(4, "0")}`;
      const now = new Date().toISOString();
      const startDate = today();
      const end = new Date(new Date(`${startDate}T00:00:00Z`).getTime() + plan.durationMonths * 30 * 86400000).toISOString().slice(0, 10);

      const user: User = {
        id: uid("usr"), name, email, phone, passwordHash, role: "member", verified: true, active: true,
        avatarColor: AVATAR_COLORS[memberSeq % AVATAR_COLORS.length], twoFA: false,
        memberId,
        referralCode: `NF${String(memberSeq).padStart(3, "0")}`,
        age: toNum(body.age), dob: String(body.dob ?? ""), gender: String(body.gender ?? "") as User["gender"],
        heightCm: toNum(body.heightCm), weightKg: toNum(body.weightKg),
        fitnessGoal: String(body.fitnessGoal ?? "") as User["fitnessGoal"],
        medicalConditions: String(body.medicalConditions ?? ""), allergies: String(body.allergies ?? ""),
        emergencyContactName: String(body.emergencyContactName ?? ""), emergencyContactPhone: String(body.emergencyContactPhone ?? ""),
        occupation: String(body.occupation ?? ""), address: String(body.address ?? ""), city: String(body.city ?? "Bengaluru"),
        signedWaiver: true, signedAt: now, xp: 0, level: 1, streak: 0,
        createdAt: now, updatedAt: now,
      };
      d.users.push(user);

      d.memberships.push({
        id: uid("mem"), memberId, planId: plan.id, planName: plan.name, tier: plan.tier, status: "active",
        startDate, endDate: end, autoRenew: true, price: total, paid: total,
        paymentMethod: String(body.paymentMethod ?? "upi"), couponCode: coupon?.code, createdAt: now, updatedAt: now,
      });

      const paySeq = nextCounter(d, "paymentSeq");
      const paymentRef = `PYMT-${String(paySeq).padStart(5, "0")}`;
      const payment: Payment = {
        id: uid("pay"), ref: paymentRef, memberId, membershipId: d.memberships[d.memberships.length - 1].id,
        description: `${plan.name} — ${plan.durationMonths} month(s)`, amount: total, paidAmount: total,
        method: "demo", status: "paid", razorpayOrderId: `rzp_demo_${paymentRef}`, razorpayPaymentId: `rzp_pay_${paymentRef}`,
        invoiceNo: "", createdAt: now,
      };
      d.payments.push(payment);

      const invSeq = nextCounter(d, "invoiceSeq");
      const subtotal = Math.round(total / 1.18);
      const gst = total - subtotal;
      payment.invoiceNo = `NF-INV-${String(invSeq).padStart(5, "0")}`;
      d.invoices.push({
        id: uid("inv"), number: payment.invoiceNo, memberId, paymentId: payment.id,
        items: [{ name: `${plan.name} Membership`, qty: 1, amount: subtotal }], subtotal, gst, total,
        issuedAt: now,
      });

      pushNotification(d, user.id, "Welcome to NEXTGEN FITNESS 🎉", `Your membership is active. Member ID ${memberId} — scan your QR card at the turnstile to check in.`);
      dispatch(d, { type: "welcome", channel: "email", recipient: email, summary: `Welcome ${name}! Membership ${memberId} activated (${plan.name}).` });
      dispatch(d, { type: "welcome_whatsapp", channel: "whatsapp", recipient: `+91 ${phone}`, summary: `Hi ${name}! Your NEXTGEN FITNESS membership is live. Check in with QR ${memberId}.` });
      dispatch(d, { type: "invoice", channel: "email", recipient: email, summary: `Invoice ${payment.invoiceNo} issued for ${plan.name} (₹${total.toLocaleString("en-IN")}).` });
      if (coupon) coupon.uses += 1;
      audit(d, user.id, name, "member.registered", memberId, JSON.stringify({ planId, total, coupon: coupon?.code }));
      return { user, memberId, total, paymentRef, invoiceNo: payment.invoiceNo };
    });

    const token = createSessionToken({ id: result.user.id, role: result.user.role });
    const res = NextResponse.json({ user: result.user, memberId: result.memberId, total: result.total, paymentRef: result.paymentRef, invoiceNo: result.invoiceNo });
    res.cookies.set(sessionKey, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

function toNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
