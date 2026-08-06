"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, Crown, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/lib/db/types";

const ALL_FEATURES = [
  "Full gym floor & cardio deck access",
  "Locker + towel service",
  "Group classes (1/day)",
  "Group classes (unlimited)",
  "Mobile check-in + fitness dashboard",
  "Fitness assessment",
  "Body scan (quarterly)",
  "Body scan (monthly)",
  "PT sessions",
  "Dedicated coach / weekly PT",
  "Nutrition plan",
  "Bespoke diet plan",
  "Freeze days",
  "Priority booking",
  "Guest passes",
  "Shop discount",
  "Recovery suite access",
  "24×7 club access",
];

const planFeatureMap: Record<string, string[]> = {
  student: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (1/day)", "Mobile check-in + fitness dashboard"],
  monthly: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (1/day)", "Mobile check-in + fitness dashboard", "Guest passes"],
  quarterly: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (unlimited)", "Mobile check-in + fitness dashboard", "Fitness assessment", "Body scan (quarterly)", "Freeze days"],
  half_yearly: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (unlimited)", "Mobile check-in + fitness dashboard", "Fitness assessment", "Body scan (quarterly)", "Freeze days", "Priority booking"],
  yearly: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (unlimited)", "Mobile check-in + fitness dashboard", "Fitness assessment", "Body scan (quarterly)", "PT sessions", "Nutrition plan", "Freeze days", "Priority booking", "Shop discount"],
  premium: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (unlimited)", "Mobile check-in + fitness dashboard", "Fitness assessment", "Body scan (monthly)", "Dedicated coach / weekly PT", "Bespoke diet plan", "Freeze days", "Priority booking", "Guest passes", "Shop discount", "Recovery suite access"],
  elite: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (unlimited)", "Mobile check-in + fitness dashboard", "Fitness assessment", "Body scan (monthly)", "Dedicated coach / weekly PT", "Bespoke diet plan", "Freeze days", "Priority booking", "Guest passes", "Shop discount", "Recovery suite access", "24×7 club access"],
  family: ["Full gym floor & cardio deck access", "Locker + towel service", "Group classes (1/day)", "Mobile check-in + fitness dashboard", "Guest passes"],
};

export function PlansSection({ plans }: { plans: MembershipPlan[] }) {
  const [yearly, setYearly] = React.useState(true);
  const visible = yearly ? plans.filter((p) => p.durationMonths >= 6 || p.gold) : plans.filter((p) => p.durationMonths <= 3);
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-ink-200 bg-card p-1">
          <button
            onClick={() => setYearly(false)}
            className={cn("rounded-full px-5 py-2 text-sm font-semibold transition", !yearly ? "bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow" : "text-ink-500")}
          >
            Monthly / short-term
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn("rounded-full px-5 py-2 text-sm font-semibold transition", yearly ? "bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow" : "text-ink-500")}
          >
            Annual / premium
          </button>
        </div>

        <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
          {visible.map((p) => (
            <StaggerItem key={p.id} className={cn(p.popular || p.gold ? "lg:scale-[1.03]" : "")}>
              <div className={cn("card-shadow relative flex h-full flex-col rounded-3xl border bg-card p-7", p.gold ? "gold-border border-gold-500/30" : "border-ink-100 dark:border-ink-100")}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-volt-500 to-volt-600 px-4 py-1 text-xs font-bold text-white shadow">
                    <Sparkles className="mr-1 inline size-3" /> Most popular
                  </span>
                )}
                {p.gold && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-1 text-xs font-bold text-white shadow">
                    <Crown className="mr-1 inline size-3" /> Premium
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">{p.name}</h3>
                  {p.gold && <Crown className="size-5 text-gold-500" />}
                </div>
                <p className="mt-1.5 text-sm text-ink-400">{p.tagline}</p>
                <div className="mt-5">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-ink-900 dark:text-ink-700">₹{p.price.toLocaleString("en-IN")}</span>
                    {p.originalPrice && <span className="text-base text-ink-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">per {p.durationMonths} month{p.durationMonths > 1 ? "s" : ""} · one-time payment</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-500 dark:text-ink-500">{p.description}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-600">
                      <Check className="mt-0.5 size-4 shrink-0 text-volt-500" /> {f}
                    </li>
                  ))}
                  {(p.excluded ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-400">
                      <X className="mt-0.5 size-4 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={cn(
                    "mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition",
                    p.gold
                      ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg hover:from-gold-500 hover:to-gold-600"
                      : p.popular
                        ? "bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow-glow hover:from-volt-600 hover:to-volt-500"
                        : "border border-ink-300 text-ink-700 hover:border-ink-400 dark:text-ink-600"
                  )}
                >
                  Choose {p.name} <ArrowRight className="size-4" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-8 text-center text-sm text-ink-400">
          Looking for Student or Family plans? <Link href="/faq" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">See the full list →</Link>
        </p>
      </div>
    </section>
  );
}

export function CompareTable({ plans, gstin }: { plans: MembershipPlan[]; gstin: string }) {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="py-4 pr-4 text-left text-sm font-semibold text-ink-400">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className={cn("px-3 py-4 text-center", (p.popular || p.gold) && "text-volt-600 dark:text-volt-400")}>
                    <span className="font-display block text-base font-bold">{p.name}</span>
                    <span className="block text-xs font-medium text-ink-400">₹{p.price.toLocaleString("en-IN")}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((f) => (
                <tr key={f} className="border-b border-ink-100/60 last:border-0">
                  <td className="py-3.5 pr-4 font-medium text-ink-700 dark:text-ink-600">{f}</td>
                  {plans.map((p) => {
                    const has = planFeatureMap[p.tier]?.includes(f);
                    const isPartial = (p.tier === "premium" || p.tier === "elite") && f === "PT sessions";
                    return (
                      <td key={p.id} className="px-3 py-3.5 text-center">
                        {isPartial ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-gold-500">Included</span>
                        ) : has ? (
                          <Check className="mx-auto size-4.5 text-volt-500" />
                        ) : (
                          <X className="mx-auto size-4 text-ink-300 dark:text-ink-300" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">Prices include GST. Terms apply — see our Terms & Conditions. GSTIN {gstin}</p>
      </div>
    </section>
  );
}

export function PlanPerks() {
  return (
    <section className="bg-paper py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Freeze anytime", desc: "Pause your plan for holidays or travel — no questions, no fees (within policy)." },
            { title: "Coupons & referrals", desc: "Apply coupon codes at checkout and earn ₹500 credit per successful referral." },
            { title: "Upgrade / downgrade", desc: "Change plans anytime from the member dashboard; we prorate the difference." },
            { title: "Auto-renewal off", desc: "Prefer manual renewals? Toggle auto-renew off and we'll remind you before expiry." },
          ].map((c) => (
            <div key={c.title} className="card-shadow rounded-2xl border border-ink-100 bg-card p-6 dark:border-ink-100">
              <BadgeCheck className="size-6 text-volt-500" />
              <h3 className="font-display mt-3 font-bold text-ink-900 dark:text-ink-700">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
