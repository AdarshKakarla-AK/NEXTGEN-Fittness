"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRound, Ruler, PhoneCall, CreditCard, PartyPopper, Check, ShieldCheck, Loader2 } from "lucide-react";
import { Field, Input, Select, Textarea, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { errMsg } from "@/lib/client";
import type { MembershipPlan } from "@/lib/db/types";

const GOALS = ["Muscle Gain", "Fat Loss", "Strength", "Endurance", "General Fitness", "Rehab"];

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  on(event: string, callback: () => void): void;
  open(): void;
}

interface WindowWithRazorpay extends Window {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}

type OrderResp = {
  paymentRef: string;
  orderId: string;
  amount: number;
  currency: string;
  mode: "razorpay" | "demo";
  keyId: string;
  plan: string;
};

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as WindowWithRazorpay).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment gateway. Check your connection."));
    document.body.appendChild(s);
  });
}

function StepBadge({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-bold", active ? "text-volt-600 dark:text-volt-400" : "text-ink-400")}>
      <span className={cn("flex size-6 items-center justify-center rounded-full text-[11px]", active ? "bg-gradient-to-r from-volt-500 to-volt-600 text-white" : "bg-ink-100 text-ink-500 dark:bg-ink-100")}>
        {n}
      </span>
      {label}
    </div>
  );
}

export function RegisterForm({ plans, initialPlanId = "plan_monthly" }: { plans: MembershipPlan[]; initialPlanId?: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState<{ memberId: string; invoiceNo: string; total: number } | null>(null);
  const [planId, setPlanId] = React.useState(initialPlanId);
  const [sandbox, setSandbox] = React.useState<{ order: OrderResp; form: Record<string, string> } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const capture = async (opts: { paymentRef: string; form: Record<string, string>; paymentId: string; signature: string }) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentRef: opts.paymentRef, form: opts.form, razorpayPaymentId: opts.paymentId, razorpaySignature: opts.signature }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Payment verification failed.");
      setDone({ memberId: json.memberId, invoiceNo: json.invoiceNo, total: json.total });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const openRazorpay = (order: OrderResp, form: Record<string, string>) =>
    new Promise<void>((resolve) => {
      loadRazorpayScript()
        .then(() => {
          const Ctor = (window as WindowWithRazorpay).Razorpay;
          if (!Ctor) {
            setError("The payment gateway could not be loaded.");
            return resolve();
          }
          const rzp = new Ctor({
            key: order.keyId,
            amount: order.amount * 100,
            currency: order.currency,
            name: "NEXTGEN FITNESS",
            description: order.plan,
            order_id: order.orderId,
            prefill: { name: form.name, email: form.email, contact: form.phone },
            theme: { color: "#059669" },
            handler: (response) => {
              void capture({ paymentRef: order.paymentRef, form, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature });
              resolve();
            },
            modal: { ondismiss: () => resolve() },
          });
          rzp.on("payment.failed", () => {
            setError("Payment failed. Please try again.");
          });
          rzp.open();
        })
        .catch((err) => {
          setError(errMsg(err));
          resolve();
        });
    });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      data.planId = planId;
      data.agreed = "true";
      const res = await fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create the payment order.");
      const order = json as OrderResp;
      setBusy(false);
      if (order.mode === "razorpay") {
        await openRazorpay(order, data as unknown as Record<string, string>);
      } else {
        setSandbox({ order, form: data as unknown as Record<string, string> });
      }
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const confirmSandbox = async () => {
    if (!sandbox) return;
    await capture({
      paymentRef: sandbox.order.paymentRef,
      form: sandbox.form,
      paymentId: `pay_demo_${Date.now().toString(36)}`,
      signature: "demo",
    });
    setSandbox(null);
  };

  if (done) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="card-shadow w-full max-w-lg rounded-3xl border border-ink-100 bg-card p-10 text-center dark:border-ink-100">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow-glow">
            <PartyPopper className="size-8" />
          </span>
          <h2 className="font-display mt-5 text-3xl font-extrabold text-ink-900 dark:text-ink-700">You&apos;re in!</h2>
          <p className="mt-2 text-sm text-ink-500">Payment received. Welcome to NEXTGEN FITNESS — here&apos;s your membership card, keep it for check-in.</p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-ink-100 bg-paper p-5 text-left dark:border-ink-100">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Amount paid</p>
            <p className="font-display text-2xl font-extrabold text-volt-600 dark:text-volt-400">₹{done.total.toLocaleString("en-IN")}</p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-ink-400">Member ID</p>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-600">{done.memberId}</p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-ink-400">Invoice</p>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-600">{done.invoiceNo}</p>
            <p className="mt-3 text-[11px] text-ink-400">Welcome email, WhatsApp message and your GST receipt are available in your dashboard.</p>
          </div>
          <Button className="mt-7 w-full" onClick={() => router.push("/portal")}>
            Open my dashboard <span aria-hidden>→</span>
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Personal" },
    { label: "Fitness" },
    { label: "Contact" },
    { label: "Plan & pay" },
  ];

  return (
    <div className="flex min-h-[70vh] items-start justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">Join NEXTGEN FITNESS</h1>
          <div className="hidden items-center gap-2 sm:flex">
            {steps.map((s, i) => (
              <StepBadge key={s.label} n={i + 1} label={s.label} active={i === step} />
            ))}
          </div>
        </div>

        <form ref={formRef} onSubmit={submit} className="card-shadow rounded-3xl border border-ink-100 bg-card p-8 dark:border-ink-100">
          {step === 0 && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-600"><UserRound className="size-4 text-volt-500" /> Tell us about you</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full name" required><Input name="name" required autoComplete="name" placeholder="e.g. Aditi Sharma" /></Field>
                </div>
                <Field label="Email" required><Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></Field>
                <Field label="Phone" required><Input name="phone" required inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" /></Field>
                <Field label="Date of birth"><Input name="dob" type="date" /></Field>
                <Field label="Gender">
                  <Select name="gender" defaultValue=""><option value="" disabled>Select…</option><option>Male</option><option>Female</option><option>Other</option></Select>
                </Field>
                <Field label="Age"><Input name="age" type="number" inputMode="numeric" min={15} max={100} placeholder="e.g. 28" /></Field>
                <Field label="Occupation"><Input name="occupation" placeholder="e.g. Software Engineer" /></Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-600"><Ruler className="size-4 text-volt-500" /> Your starting line</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Height (cm)"><Input name="heightCm" type="number" inputMode="numeric" placeholder="e.g. 165" /></Field>
                <Field label="Weight (kg)"><Input name="weightKg" type="number" inputMode="numeric" placeholder="e.g. 68" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Primary goal">
                    <Select name="fitnessGoal" defaultValue=""><option value="" disabled>Select your goal…</option>{GOALS.map((g) => <option key={g} value={g}>{g}</option>)}</Select>
                  </Field>
                </div>
                <Field label="Medical conditions (optional)"><Input name="medicalConditions" placeholder="Injuries, surgery, conditions…" /></Field>
                <Field label="Allergies (optional)"><Input name="allergies" placeholder="Food / skin / latex…" /></Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-600"><PhoneCall className="size-4 text-volt-500" /> Emergency & contact</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Emergency contact name" required><Input name="emergencyContactName" required placeholder="Someone close" /></Field>
                <Field label="Emergency contact phone" required><Input name="emergencyContactPhone" required inputMode="tel" placeholder="10-digit mobile" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Address"><Textarea name="address" rows={2} placeholder="Street, area…" /></Field>
                </div>
                <Field label="City"><Input name="city" defaultValue="Bengaluru" /></Field>
                <Field label="Password" required><Input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Min 6 characters" /></Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-600"><CreditCard className="size-4 text-volt-500" /> Choose your plan</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={cn(
                      "relative rounded-2xl border p-4 text-left transition",
                      planId === p.id ? "border-volt-500 bg-volt-500/5 ring-2 ring-volt-500/20" : "border-ink-200 hover:border-ink-300"
                    )}
                  >
                    {planId === p.id && <Check className="absolute right-3 top-3 size-5 text-volt-500" />}
                    <p className="font-bold text-ink-900 dark:text-ink-700">{p.name}</p>
                    <p className="mt-1 text-xs text-ink-400">{p.durationMonths} month{p.durationMonths > 1 ? "s" : ""}</p>
                    <p className="font-display mt-2 text-xl font-extrabold text-ink-900 dark:text-ink-700">₹{p.price.toLocaleString("en-IN")}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Coupon code (optional)"><Input name="couponCode" placeholder="e.g. WELCOME100" /></Field>
                <Field label="Payment method">
                  <Select name="paymentMethod" defaultValue="upi">
                    <option value="upi">UPI</option><option value="card">Credit / Debit Card</option><option value="netbanking">Net Banking</option><option value="emi">EMI</option>
                  </Select>
                </Field>
                <Field label="Referred by (optional)"><Input name="referredBy" placeholder="Referral code" /></Field>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-paper p-4 text-xs leading-relaxed text-ink-500">
                <input type="checkbox" required className="mt-0.5 accent-volt-500" />
                <span>
                  I confirm I am physically fit to exercise, I have disclosed relevant medical conditions, I accept the{" "}
                  <a href="/terms" target="_blank" className="font-semibold text-volt-600 dark:text-volt-400">Terms of Service</a> and the{" "}
                  <a href="/privacy-policy" target="_blank" className="font-semibold text-volt-600 dark:text-volt-400">Privacy Policy</a>, and I agree to the liability waiver.
                </span>
              </label>
              <p className="flex items-center gap-1.5 text-xs text-ink-400">
                <ShieldCheck className="size-4 text-volt-500" /> Payment is processed securely via Razorpay. In sandbox demo mode no real charge is made.
              </p>
            </div>
          )}

          {error && <p className="mt-4 rounded-xl border border-stop-500/25 bg-stop-500/5 px-4 py-3 text-sm font-medium text-stop-500">{error}</p>}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-100 pt-6 dark:border-ink-100">
            {step > 0 ? (
              <Button type="button" variant="secondary" onClick={back}>Back</Button>
            ) : (
              <span className="text-xs text-ink-400">Step {step + 1} of 4</span>
            )}
            {step < 3 ? (
              <Button type="button" onClick={next}>Continue <span aria-hidden>→</span></Button>
            ) : (
              <Button type="submit" disabled={busy}>
                {busy ? (<><Loader2 className="size-4 animate-spin" /> Creating your payment…</>) : ("Join & pay securely")}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Sandbox demo payment overlay */}
      {sandbox && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-night-950/90 p-4 backdrop-blur" onClick={() => !busy && setSandbox(null)}>
          <div className="card-shadow w-full max-w-sm rounded-3xl border border-ink-100 bg-card p-8 text-center dark:border-ink-100" onClick={(e) => e.stopPropagation()}>
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-volt-500 to-accent-600 text-white">
              <ShieldCheck className="size-7" />
            </span>
            <p className="font-display mt-4 text-lg font-extrabold text-ink-900 dark:text-ink-700">NEXTGEN FITNESS</p>
            <p className="mt-1 text-sm text-ink-400">Sandbox payment gateway (demo — no real charge)</p>
            <div className="mt-5 rounded-2xl border border-ink-100 bg-paper p-4 dark:border-ink-100">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Amount payable</p>
              <p className="font-display text-3xl font-extrabold text-ink-900 dark:text-ink-700">₹{sandbox.order.amount.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-ink-400">{sandbox.order.plan} · {sandbox.form.paymentMethod ?? "UPI"}</p>
            </div>
            <Button className="mt-6 w-full" onClick={confirmSandbox} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : `Pay ₹${sandbox.order.amount.toLocaleString("en-IN")}`} {!busy && "— Simulate success"}
            </Button>
            <button onClick={() => setSandbox(null)} disabled={busy} className="mt-3 text-xs font-semibold text-ink-400 hover:text-ink-600">
              Cancel payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
