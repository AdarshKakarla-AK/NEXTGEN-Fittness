import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, nowISO } from "@/lib/db/store";
import { refundRazorpayPayment, razorpayConfigured } from "@/lib/razorpay";
import { audit, pushNotification } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const paymentId = String(body.paymentId ?? "");
    if (!paymentId) return NextResponse.json({ error: "Missing payment id." }, { status: 400 });

    const db = getDB();
    const payment = db.payments.find((p) => p.id === paymentId);
    if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    if (payment.status !== "paid") return NextResponse.json({ error: "Only paid payments can be refunded." }, { status: 400 });

    let refundRef = `rf_demo_${payment.ref}`;
    const livePaymentId = payment.razorpayPaymentId && !payment.razorpayPaymentId.startsWith("rzp_pay_demo") ? payment.razorpayPaymentId : undefined;
    if (livePaymentId && razorpayConfigured()) {
      const r = await refundRazorpayPayment({ paymentId: livePaymentId, notes: `Admin refund for ${payment.ref}` });
      refundRef = r.id;
    }

    mutate((d) => {
      const p = d.payments.find((x) => x.id === paymentId)!;
      p.status = "refunded";
      p.refundedAt = nowISO();
      p.refundRef = refundRef;
      if (p.membershipId) {
        const m = d.memberships.find((x) => x.id === p.membershipId);
        if (m) {
          m.status = "cancelled";
          m.endDate = new Date().toISOString().slice(0, 10);
        }
      }
      audit(d, user.id, user.name, "payment.refunded", p.ref, `₹${p.amount} refunded`);
      if (p.memberId) {
        pushNotification(d, p.memberId, "Refund issued 💸", `Your payment ${p.ref} of ₹${p.amount.toLocaleString("en-IN")} has been refunded.`);
      }
    });
    return NextResponse.json({ ok: true, refundRef });
  } catch (err) {
    console.error("REFUND ERROR", err);
    return NextResponse.json({ error: "Could not process the refund." }, { status: 500 });
  }
}
