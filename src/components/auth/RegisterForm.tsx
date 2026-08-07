"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Check } from "lucide-react";
import { Field, Input, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { errMsg } from "@/lib/client";
import type { MembershipPlan } from "@/lib/db/types";

export function RegisterForm({ plans, initialPlanId = "plan_student" }: { plans: MembershipPlan[]; initialPlanId?: string }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [planId, setPlanId] = React.useState(initialPlanId);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      data.planId = planId;
      data.agreed = "true";
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create your account.");
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Pick a plan and you&apos;re in — instant member ID and QR check-in.</p>
        </div>

        <form onSubmit={submit} className="card-shadow rounded-3xl border border-ink-100 bg-card p-8 dark:border-ink-100">
          <div className="space-y-4">
            <div>
              <Field label="Full name" required>
                <Input name="name" required autoComplete="name" placeholder="e.g. Aditi Sharma" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" required>
                <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
              </Field>
              <Field label="Phone" required>
                <Input name="phone" required inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" />
              </Field>
            </div>
            <Field label="Password" required>
              <Input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Min 6 characters" />
            </Field>
          </div>

          <p className="mt-7 text-sm font-bold text-ink-700 dark:text-ink-600">Choose your plan</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                <p className="mt-1 text-xs text-ink-400">{p.tagline ?? `${p.durationMonths} month${p.durationMonths > 1 ? "s" : ""}`}</p>
                <p className="font-display mt-2 text-xl font-extrabold text-ink-900 dark:text-ink-700">₹{p.price.toLocaleString("en-IN")}</p>
              </button>
            ))}
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-2xl border border-ink-200 bg-paper p-4 text-xs leading-relaxed text-ink-500">
            <input type="checkbox" required className="mt-0.5 accent-volt-500" />
            <span>I confirm I am physically fit to exercise and I agree to the membership terms and liability waiver.</span>
          </label>

          {error && <p className="mt-4 rounded-xl border border-stop-500/25 bg-stop-500/5 px-4 py-3 text-sm font-medium text-stop-500">{error}</p>}

          <Button type="submit" className="mt-6 w-full" disabled={busy}>
            {busy ? <><Loader2 className="size-4 animate-spin" /> Creating your account…</> : "Create my account"}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <ShieldCheck className="size-4 text-volt-500" /> No joining fee. Your membership is activated instantly.
          </p>
        </form>
      </div>
    </div>
  );
}
