import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB, mutate, uid, today, nextCounter } from "@/lib/db/store";
import { createSessionToken, sessionKey } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { audit, dispatch, pushNotification } from "@/lib/notify";
import type { User } from "@/lib/db/types";

export const runtime = "nodejs";

const AVATAR_COLORS = ["#22c55e", "#3385ff", "#f97316", "#a855f7", "#14b8a6", "#ef4444", "#eab308", "#06b6d4"];
const COOKIE = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentRef = String(body.paymentRef ?? "");
    const paymentId = String(body.razorpayPaymentId ?? "");
    const signature = String(body.razorpaySignature ?? "");
    const form = (body.form ?? {}) as Record<string, unknown>;

    if (!paymentRef || !paymentId) return NextResponse.json({ error: "Missing payment details." }, { status: 400 });

    const db = getDB();
    const payment = db.payments.find((p) => p.ref === paymentRef);
    if (!payment) return NextResponse.json({ error: "Payment order not found." }, { status: 404 });

    // Idempotent path — the same order was already captured for this member.
    if (payment.status === "paid" && payment.memberId) {
      const existing = db.users.find((u) => u.id === payment.memberId);
      if (existing) {
        const token = createSessionToken({ id: existing.id, role: existing.role });
        const res = NextResponse.json({ user: existing, memberId: existing.memberId, paymentRef, invoiceNo: payment.invoiceNo });
        res.cookies.set(sessionKey, token, COOKIE);
        return res;
      }
    }
    if (payment.status !== "pending") return NextResponse.json({ error: "This payment order has already been used." }, { status: 409 });

    const name = String(form.name ?? "").trim();
    const email = String(form.email ?? "").trim().toLowerCase();
    const phone = String(form.phone ?? "").trim();
    const password = String(form.password ?? "");
    const agreed = Boolean(form.agreed);
    if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    if (!agreed) return NextResponse.json({ error: "Please accept the liability waiver and terms." }, { status: 400 });
    if (db.users.some((u) => u.email?.toLowerCase() === email)) {
      return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
    }

    const meta = JSON.parse(payment.meta ?? "{}") as { planId?: string; couponCode?: string };
    const plan = db.plans.find((p) => p.id === meta.planId);
    if (!plan) return NextResponse.json({ error: "Plan no longer available." }, { status: 400 });

    const coupon = meta.couponCode ? db.coupons.find((c) => c.code === meta.couponCode && c.active) : undefined;
    const discount = coupon ? (coupon.type === "percent" ? Math.round((plan.price * coupon.value) / 100) : Math.min(coupon.value, plan.price)) : 0;
    const total = plan.price - discount;
    if (total !== payment.amount) return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });

    if (payment.razorpayOrderId?.startsWith("rzp_demo_")) {
      if (!paymentId.startsWith("pay_")) return NextResponse.json({ error: "Invalid demo payment reference." }, { status: 400 });
    } else {
      const ok = verifyRazorpaySignature({ orderId: payment.razorpayOrderId ?? "", paymentId, signature });
      if (!ok) return NextResponse.json({ error: "Payment verification failed. Please try again." }, { status: 400 });
    }

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
        age: toNum(form.age), dob: String(form.dob ?? ""), gender: String(form.gender ?? "") as User["gender"],
        heightCm: toNum(form.heightCm), weightKg: toNum(form.weightKg),
        fitnessGoal: String(form.fitnessGoal ?? "") as User["fitnessGoal"],
        medicalConditions: String(form.medicalConditions ?? ""), allergies: String(form.allergies ?? ""),
        emergencyContactName: String(form.emergencyContactName ?? ""), emergencyContactPhone: String(form.emergencyContactPhone ?? ""),
        occupation: String(form.occupation ?? ""), address: String(form.address ?? ""), city: String(form.city ?? "Bengaluru"),
        signedWaiver: true, signedAt: now, xp: 0, level: 1, streak: 0,
        createdAt: now, updatedAt: now,
      };
      d.users.push(user);

      d.memberships.push({
        id: uid("mem"), memberId, planId: plan.id, planName: plan.name, tier: plan.tier, status: "active",
        startDate, endDate: end, autoRenew: true, price: total, paid: total,
        paymentMethod: payment.method, couponCode: meta.couponCode, createdAt: now, updatedAt: now,
      });

      const pay = d.payments.find((p) => p.id === payment.id)!;
      pay.status = "paid";
      pay.paidAmount = total;
      pay.memberId = memberId;
      pay.membershipId = d.memberships[d.memberships.length - 1].id;
      pay.razorpayPaymentId = paymentId;

      const invSeq = nextCounter(d, "invoiceSeq");
      const subtotal = Math.round(total / 1.18);
      const gst = total - subtotal;
      pay.invoiceNo = `NF-INV-${String(invSeq).padStart(5, "0")}`;
      d.invoices.push({
        id: uid("inv"), number: pay.invoiceNo, memberId, paymentId: pay.id,
        items: [{ name: `${plan.name} Membership`, qty: 1, amount: subtotal }], subtotal, gst, total,
        issuedAt: now,
      });

      pushNotification(d, user.id, "Welcome to NEXTGEN FITNESS 🎉", `Your membership is active. Member ID ${memberId} — scan your QR card at the turnstile to check in.`);
      dispatch(d, { type: "welcome", channel: "email", recipient: email, summary: `Welcome ${name}! Membership ${memberId} activated (${plan.name}).` });
      dispatch(d, { type: "welcome_whatsapp", channel: "whatsapp", recipient: `+91 ${phone}`, summary: `Hi ${name}! Your NEXTGEN FITNESS membership is live. Check in with QR ${memberId}.` });
      dispatch(d, { type: "invoice", channel: "email", recipient: email, summary: `Invoice ${pay.invoiceNo} issued for ${plan.name} (₹${total.toLocaleString("en-IN")}).` });
      if (coupon) coupon.uses += 1;
      audit(d, user.id, name, "member.registered", memberId, JSON.stringify({ planId: plan.id, total, coupon: meta.couponCode }));
      return { user, memberId, total, paymentRef, invoiceNo: pay.invoiceNo };
    });

    const token = createSessionToken({ id: result.user.id, role: result.user.role });
    const res = NextResponse.json({ user: result.user, memberId: result.memberId, total: result.total, paymentRef: result.paymentRef, invoiceNo: result.invoiceNo });
    res.cookies.set(sessionKey, token, COOKIE);
    return res;
  } catch (err) {
    console.error("CAPTURE ERROR", err);
    return NextResponse.json({ error: "Could not complete your payment." }, { status: 500 });
  }
}

function toNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
