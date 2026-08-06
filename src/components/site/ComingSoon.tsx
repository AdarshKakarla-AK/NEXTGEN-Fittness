"use client";

import * as React from "react";
import Link from "next/link";
import { Hammer, ArrowRight, Bell } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Input, Button } from "@/components/ui";

export function ComingSoon({
  eyebrow,
  title,
  highlight,
  subtitle,
  what,
  targets = [],
  preview = [],
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  what: string;
  targets: string[];
  preview: string[];
}) {
  const [done, setDone] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries())) }).catch(() => {});
    setBusy(false);
    setDone(true);
  };
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} highlight={highlight} subtitle={subtitle} crumbs={[{ label: "Home", href: "/" }, { label: eyebrow }]} />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <Hammer className="size-3.5" /> Coming soon
              </span>
              <h2 className="font-display mt-5 text-3xl font-extrabold leading-tight text-ink-900 dark:text-ink-700">
                {what}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-500">
                This experience is being built right now — in production, on this very platform. Join the early-access list and we&apos;ll
                notify you the moment it goes live, with a members-only launch offer.
              </p>
              <div className="mt-6">
                {done ? (
                  <p className="rounded-2xl border border-volt-500/30 bg-volt-500/10 px-5 py-4 text-sm font-semibold text-volt-600 dark:text-volt-400">
                    You&apos;re on the list! We&apos;ll email you at launch.
                  </p>
                ) : (
                  <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3 sm:flex-row">
                    <Input name="email" type="email" required placeholder="you@example.com" className="h-12" aria-label="Email address" />
                    <Button type="submit" className="h-12 shrink-0" disabled={busy}>
                      <Bell className="size-4" /> {busy ? "Joining…" : "Get notified"}
                    </Button>
                  </form>
                )}
              </div>
              <div className="mt-8 space-y-3">
                {targets.map((t) => (
                  <p key={t} className="flex items-center gap-3 text-sm text-ink-600 dark:text-ink-600">
                    <ArrowRight className="size-4 text-volt-500" /> {t}
                  </p>
                ))}
              </div>
            </div>
            <div className="grid content-start gap-4">
              {preview.map((p, i) => (
                <div key={p} className="card-shadow flex items-center gap-4 rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
                  <img src={`/images/gallery-${(i % 8) + 1}.svg`} alt="" className="h-16 w-24 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{p}</p>
                    <p className="text-xs text-ink-400">Preview · launching soon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-ink-400">
            Meanwhile, explore <Link href="/membership" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">membership plans</Link> or{" "}
            <Link href="/classes" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">the class schedule</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
