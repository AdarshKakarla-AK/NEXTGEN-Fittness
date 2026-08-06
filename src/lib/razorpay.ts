import "server-only";
import crypto from "node:crypto";

/**
 * Thin Razorpay Orders / Refunds / Signature client.
 *
 * When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are unset the app runs in
 * sandbox/demo mode — checkout orders are simulated and signatures skipped.
 */

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader(): string {
  return "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
}

async function rzpFetch(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(`https://api.razorpay.com${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Razorpay ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

export async function createRazorpayOrder(opts: {
  amountPaisa: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string; status: string; receipt?: string }> {
  const order = await rzpFetch("/v1/orders", {
    method: "POST",
    body: JSON.stringify({ amount: opts.amountPaisa, currency: "INR", receipt: opts.receipt, notes: opts.notes }),
  });
  return order as unknown as { id: string; amount: number; currency: string; status: string; receipt?: string };
}

export function verifyRazorpaySignature(opts: { orderId: string; paymentId: string; signature: string }): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const expected = crypto.createHmac("sha256", secret).update(`${opts.orderId}|${opts.paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(opts.signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function refundRazorpayPayment(opts: { paymentId: string; amountPaisa?: number; notes?: string }): Promise<{ id: string; status: string; amount: number }> {
  const refund = await rzpFetch(`/v1/payments/${opts.paymentId}/refunds`, {
    method: "POST",
    body: JSON.stringify({ amount: opts.amountPaisa, notes: opts.notes }),
  });
  return refund as unknown as { id: string; status: string; amount: number };
}
