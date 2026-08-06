import Link from "next/link";
import { ChevronRight, ArrowRight, CalendarCheck, ShieldCheck, Smartphone } from "lucide-react";
import { Counter } from "@/components/Counter";

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-night-950 pt-32 pb-20 text-white">
      <div className="bg-grid-dark absolute inset-0" />
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-volt-500/10 blur-3xl" />
      <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-white/50">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5" />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-volt-400">{c.label}</Link>
                ) : (
                  <span className="text-white/80">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-volt-400">{eyebrow}</p>}
        <h1 className="font-display max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">{subtitle}</p>}
      </div>
    </section>
  );
}

export function CTAStrip() {
  const stats = [
    { value: 1200, suffix: "+", label: "Active members" },
    { value: 50, suffix: "+", label: "Classes weekly" },
    { value: 16, suffix: "", label: "Certified trainers" },
    { value: 12, suffix: " kg", label: "Avg. fat lost (6mo)" },
  ];
  return (
    <section className="relative overflow-hidden bg-night-950 py-14 text-white">
      <div className="bg-grid-dark absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur">
              <p className="font-display text-4xl font-extrabold text-gradient">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-night-950 py-24 text-white">
      <div className="bg-grid-dark absolute inset-0" />
      <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-volt-500/15 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          Your transformation starts <span className="text-gradient">today.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">
          No joining fee this month. Free fitness assessment, QR check-in and a member app that tracks every rep, meal and milestone.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-8 py-4 text-base font-bold text-white shadow-glow transition hover:from-volt-600 hover:to-volt-500 sm:w-auto"
          >
            Claim a Free Trial <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-8 py-4 text-base font-semibold text-white/80 transition hover:bg-white/5 sm:w-auto"
          >
            Book a Facility Tour
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/55">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-volt-400" /> No lock-in contracts</span>
          <span className="inline-flex items-center gap-2"><Smartphone className="size-4 text-accent-400" /> Member app included</span>
          <span className="inline-flex items-center gap-2"><CalendarCheck className="size-4 text-gold-400" /> Freeze anytime</span>
        </div>
      </div>
    </section>
  );
}
