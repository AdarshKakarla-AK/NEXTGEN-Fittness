"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui";

export const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "What are the club timings?", a: "The club runs Monday–Saturday, 5:00 AM to 11:00 PM. Sundays are open 8:00 AM to 2:00 PM for members, with classes from 8 AM." },
  { q: "Is there a joining fee?", a: "Currently we're running a zero joining fee offer on all annual plans. Monthly and quarterly plans carry a small one-time onboarding fee of ₹500 which includes your RFID tag and QR membership card." },
  { q: "Can I freeze or pause my membership?", a: "Yes. Annual and half-yearly members can freeze for up to 30 days and 14 days respectively per year, free of charge. Pausing is available on any plan from the member dashboard in one tap." },
  { q: "Do you have personal trainers and nutritionists?", a: "We have 16+ certified trainers and 4 in-house nutritionists. Personal training and diet plans can be added to any membership from the plans page or the member app." },
  { q: "What is the body scan and is it included?", a: "Our InBody-style body composition scanner measures weight, body fat, muscle, water and visceral fat. Quarterly and higher plans include quarterly scans; Premium and Elite include monthly scans." },
  { q: "How does check-in work?", a: "Every member gets a QR card plus app-based check-in. Just scan at the entry turnstile — attendance, streak and reminders update automatically." },
  { q: "Can I cancel anytime?", a: "Monthly plans can be cancelled before the next billing cycle. Annual plans can be cancelled after 3 months with a pro-rata refund minus a 15% processing fee, per our cancellation and refund policies." },
  { q: "Do you offer corporate memberships?", a: "Yes — we partner with 40+ companies in Bengaluru. Check the Corporate page or write to corporate@nextgenfitness.in for group rates, on-site programs and HR dashboards." },
];

export function FAQ({ items = FAQ_ITEMS, className }: { items?: { q: string; a: string }[]; className?: string }) {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className={cn("mx-auto max-w-3xl", className)}>
      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="overflow-hidden rounded-2xl border border-ink-100 bg-card card-shadow dark:border-ink-100">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-ink-900 dark:text-ink-700">{item.q}</span>
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition-transform dark:bg-ink-100", isOpen && "rotate-180 bg-volt-100 text-volt-700 dark:text-volt-400")}>
                  <ChevronDown className="size-4" />
                </span>
              </button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500 dark:text-ink-500">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FAQSection({ title, subtitle }: { title?: React.ReactNode; subtitle?: string }) {
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading center eyebrow="FAQ" title={title ?? "Questions, answered."} subtitle={subtitle} />
        <FAQ className="mt-12" />
      </div>
    </section>
  );
}
