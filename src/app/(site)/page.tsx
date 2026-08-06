import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, Activity, Apple, BarChart3, CalendarCheck, Dumbbell, Flame, HeartPulse, QrCode,
  ShieldCheck, Smartphone, Sparkles, Star, Trophy, Users, Zap, ChevronRight,
} from "lucide-react";
import { getDB } from "@/lib/db/store";
import { CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { Testimonials } from "@/components/site/Testimonials";
import { Counter } from "@/components/Counter";
import { SectionHeading, Badge } from "@/components/ui";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium Gym & Fitness Club in Bengaluru",
  description:
    "Train at Bengaluru's most advanced fitness club — certified trainers, group classes, personal training, nutrition coaching, body scanning and a member app that tracks everything.",
};

const FEATURES = [
  { icon: Smartphone, title: "Member App", desc: "QR check-in, workout tracker, diet logger, bookings and AI coaching in your pocket." },
  { icon: QrCode, title: "QR / RFID Check-in", desc: "Touchless entry. Your streak, attendance and reminders update the second you scan." },
  { icon: BarChart3, title: "Body Scans & Analytics", desc: "Monthly InBody scans with muscle, fat and water % trends plotted on your dashboard." },
  { icon: CalendarCheck, title: "Smart Booking", desc: "Book classes, PT sessions, assessments and physio — reschedule and cancel in one tap." },
  { icon: ShieldCheck, title: "Recovery Suite", desc: "Compression boots, ice baths, foam-rolling zone and physio-led recovery sessions." },
  { icon: Trophy, title: "Challenges & Rewards", desc: "XP, badges, leaderboards and monthly challenges that make consistency fun." },
];

const CLASSES_PREVIEW = [
  { name: "HIIT Blast", tag: "High intensity", color: "from-orange-500 to-red-500", count: "12 classes / wk" },
  { name: "CrossFit WOD", tag: "Barbell + engine", color: "from-red-500 to-rose-600", count: "9 classes / wk" },
  { name: "Sunrise Yoga", tag: "Mind + mobility", color: "from-emerald-500 to-green-600", count: "10 classes / wk" },
  { name: "Boxing", tag: "Combat cardio", color: "from-slate-600 to-slate-800", count: "6 classes / wk" },
];

export default function HomePage() {
  const db = getDB();
  const activeMembers = db.memberships.filter((m) => m.status === "active").length;
  const trainers = db.users.filter((u) => u.role === "trainer").length;
  const classCount = db.classes.reduce((s, c) => s + c.schedule.length, 0);
  const avgRating = db.reviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, db.reviews.length);
  const plan = db.plans.find((p) => p.popular);

  return (
    <>
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative overflow-hidden bg-night-950 text-white">
        <div className="bg-grid-dark absolute inset-0" />
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-volt-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-32 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-40">
          <div>
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-volt-500/30 bg-volt-500/10 px-4 py-1.5 text-xs font-semibold text-volt-400">
                <Sparkles className="size-3.5" /> No joining fee this month · Offer ends soon
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="font-display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
                Train harder.
                <br />
                Recover faster.
                <br />
                <span className="text-gradient">Live stronger.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
                A 30,000 sq ft performance club with world-class coaching, a member app that tracks every rep and meal, and a community that keeps you coming back.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-8 py-4 text-base font-bold text-white shadow-glow transition hover:from-volt-600 hover:to-volt-500"
                >
                  Start Free Trial <ArrowRight className="size-5" />
                </Link>
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-8 py-4 text-base font-semibold text-white/85 transition hover:bg-white/5"
                >
                  View Membership Plans
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <HeroStat icon={Users} value={activeMembers} suffix="+" label="Members" />
                <HeroStat icon={Activity} value={classCount} suffix="" label="Classes / week" />
                <HeroStat icon={Dumbbell} value={trainers} suffix="+" label="Trainers" />
                <HeroStat icon={Star} value={Math.round(avgRating * 10) / 10} suffix="" label="Google rating" decimals={1} />
              </div>
            </FadeIn>
          </div>

          {/* Hero visual card */}
          <FadeIn delay={0.2} className="relative hidden lg:block">
            <div className="relative mx-auto max-w-md">
              <div className="animate-float-slow absolute -left-8 top-10 z-10 w-56 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/70">Calories today</p>
                  <Flame className="size-4 text-orange-400" />
                </div>
                <p className="font-display mt-1 text-2xl font-bold">684 <span className="text-xs font-medium text-white/50">kcal</span></p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
                </div>
              </div>

              <div className="card-shadow-lg overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-night-800 to-night-900">
                <div className="bg-grid-dark relative h-80">
                  <img src="/images/hero-gym.svg" alt="Inside NEXTGEN FITNESS" className="h-full w-full object-cover opacity-80" loading="eager" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-volt-500" /> LIVE · 34 training now
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-bold">Today&apos;s Top Class</p>
                      <p className="text-sm text-white/50">CrossFit WOD · Studio 2 · 7:00 PM</p>
                    </div>
                    <Link href="/classes" className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt-500/15 text-volt-400 transition hover:bg-volt-500/25">
                      <ChevronRight className="size-5" />
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                      <Users className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Seats left</p>
                      <div className="mt-1 h-1.5 w-36 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-2/3 rounded-full bg-accent-500" />
                      </div>
                    </div>
                    <span className="ml-auto rounded-full bg-volt-500/15 px-2.5 py-1 text-xs font-bold text-volt-400">12 / 30</span>
                  </div>
                </div>
              </div>

              <div className="animate-float absolute -right-6 bottom-14 z-10 w-52 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt-500/15 text-volt-400">
                    <Zap className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white/70">7-day streak</p>
                    <p className="font-display text-lg font-bold">1,240 XP</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <span key={d} className={cn("h-1.5 flex-1 rounded-full", d < 6 ? "bg-volt-500" : "bg-volt-500/30")} />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --------------------------- TRUST MARQUEE -------------------------- */}
      <section className="border-y border-ink-100 bg-card py-5 dark:border-ink-100">
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-16">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex gap-16" aria-hidden={dup === 1}>
                {["40+ corporate partners", "Rated 4.9★ on Google", "16+ certified trainers", "30,000 sq ft facility", "InBody body scanning", "24×7 recovery suite", "AI-assisted coaching", "Zero lock-in contracts"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2.5 text-sm font-semibold text-ink-500 dark:text-ink-500">
                    <Zap className="size-4 text-volt-500" fill="currentColor" /> {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ FEATURES ----------------------------- */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            center
            eyebrow="Why NEXTGEN"
            title={<>More than a gym. <span className="text-gradient">An operating system</span> for your fitness.</>}
            subtitle="Every square foot and every line of code is built to remove friction between you and your goals."
          />
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="card-shadow group h-full rounded-2xl border border-ink-100 bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-volt-300/50 hover:shadow-lg dark:border-ink-100 dark:hover:border-volt-700/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500/15 to-accent-500/15 text-volt-600 transition group-hover:from-volt-500 group-hover:to-accent-500 group-hover:text-white dark:text-volt-400">
                    <f.icon className="size-5.5" />
                  </span>
                  <h3 className="font-display mt-5 text-lg font-bold text-ink-900 dark:text-ink-700">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-500">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------ CLASSES ------------------------------ */}
      <section className="bg-night-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              light
              eyebrow="Group classes"
              title={<>Classes that feel <span className="text-gradient">addictive.</span></>}
              subtitle="Live availability, waitlists and seat counters — book from the app in seconds."
            />
            <Link href="/classes" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/5">
              Full schedule <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CLASSES_PREVIEW.map((c, i) => (
              <FadeIn key={c.name} delay={i * 0.06}>
                <Link href="/classes" className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-volt-500/40">
                  <div className={cn("relative h-36 bg-gradient-to-br", c.color)}>
                    <div className="bg-grid-dark absolute inset-0" />
                    <Dumbbell className="absolute bottom-4 right-4 size-14 text-white/25 transition group-hover:scale-110" />
                    <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur">{c.tag}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold">{c.name}</h3>
                    <p className="mt-1 text-sm text-white/50">{c.count}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- APP SHOWCASE ---------------------------- */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Member app"
                title={<>Your coach, nutritionist and <span className="text-gradient">gym manager — in one app.</span></>}
                subtitle="Scan in, train, log, book and measure. Your trainer sees your progress in real time and adjusts your plan between sessions."
              />
              <div className="mt-8 space-y-4">
                {[
                  { icon: HeartPulse, title: "Fitness dashboard", desc: "Weight, BMI, body fat %, muscle %, water, calories, steps, heart-rate readiness and PR records on animated charts." },
                  { icon: Apple, title: "Diet tracker", desc: "Meal logging, macros, water intake, supplements and dietitian feedback with an 80%+ nutrition score." },
                  { icon: Trophy, title: "Gamification", desc: "Badges, XP, levels, leaderboards and monthly challenges with real rewards." },
                ].map((f, i) => (
                  <FadeIn key={f.title} delay={i * 0.08}>
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500/15 to-accent-500/15 text-volt-600 dark:text-volt-400">
                        <f.icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-ink-900 dark:text-ink-700">{f.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-500">{f.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Badge tone="green">QR check-in</Badge>
                <Badge tone="blue">Body scan reports</Badge>
                <Badge tone="gold">PT chat</Badge>
                <Badge tone="orange">AI workout generator</Badge>
              </div>
            </div>

            <FadeIn delay={0.15} className="relative">
              <div className="card-shadow-lg relative mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-ink-100 bg-night-950 p-2.5 dark:border-ink-100">
                <div className="rounded-[1.6rem] bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ink-400">Welcome back</p>
                      <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-700">Rahul Verma</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500 to-accent-600 text-sm font-bold text-white">RV</span>
                  </div>
                  <div className="mt-5 rounded-2xl bg-gradient-to-br from-volt-500 to-accent-600 p-4 text-white">
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>NEXTGEN MEMBER</span>
                      <span>NF-2026-0001</span>
                    </div>
                    <p className="mt-2 text-xs text-white/80">Rahul Verma</p>
                    <p className="font-mono mt-3 text-[10px] tracking-widest text-white/60">•••• •••• •••• 2026</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-white/70">
                      <span>Valid till 12 Aug 2026</span>
                      <span className="flex items-center gap-1"><QrCode className="size-4" /> Scan to enter</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                      <p className="text-xs text-ink-400">This week</p>
                      <p className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">4 <span className="text-xs font-medium text-ink-400">/ 5 workouts</span></p>
                    </div>
                    <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                      <p className="text-xs text-ink-400">Calories avg</p>
                      <p className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">2,180 <span className="text-xs font-medium text-ink-400">kcal</span></p>
                    </div>
                    <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                      <p className="text-xs text-ink-400">Current weight</p>
                      <p className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">78.2 <span className="text-xs font-medium text-ink-400">kg</span></p>
                    </div>
                    <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                      <p className="text-xs text-ink-400">Streak</p>
                      <p className="font-display text-xl font-bold text-volt-600 dark:text-volt-400">7 days</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-float absolute -left-6 bottom-8 z-10 rounded-2xl border border-ink-100 bg-card p-4 shadow-xl dark:border-ink-100">
                <p className="text-xs font-semibold text-ink-400">Monthly body scan</p>
                <p className="font-display mt-1 text-2xl font-bold text-ink-900 dark:text-ink-700">-3.4 <span className="text-xs font-medium text-ink-400">kg fat</span></p>
                <p className="mt-1 text-xs font-semibold text-volt-600 dark:text-volt-400">↑ 1.8 kg muscle</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ------------------------------ PLANS ------------------------------ */}
      <section className="bg-night-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            light
            center
            eyebrow="Membership"
            title={<>Simple plans. <span className="text-gradient">Serious results.</span></>}
            subtitle="Every plan includes full floor access, the member app and one group class a day."
          />
          {plan && (
            <div className="card-shadow-lg gradient-border mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl bg-night-800/60">
              <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Badge tone="gold">{plan.tagline}</Badge>
                    {plan.popular && <Badge tone="green">Most popular</Badge>}
                  </div>
                  <h3 className="font-display mt-3 text-2xl font-bold">{plan.name} Plan</h3>
                  <p className="mt-2 text-sm text-white/60">{plan.description}</p>
                  <p className="mt-4">
                    <span className="font-display text-4xl font-extrabold">₹{plan.price.toLocaleString("en-IN")}</span>
                    {plan.originalPrice && <span className="ml-2 text-lg text-white/40 line-through">₹{plan.originalPrice.toLocaleString("en-IN")}</span>}
                    <span className="ml-2 text-sm text-white/50">/ {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3">
                  <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-8 py-4 font-bold text-white shadow-glow transition hover:from-volt-600 hover:to-volt-500">
                    Get started <ArrowRight className="size-5" />
                  </Link>
                  <Link href="/membership" className="text-center text-sm font-semibold text-white/60 transition hover:text-volt-400">
                    Compare all plans →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------ TESTIMONIALS ----------------------------- */}
      <Testimonials limit={3} />

      {/* ------------------------------ STATS ------------------------------ */}
      <CTAStrip />

      <FinalCTA />
    </>
  );
}

function HeroStat({
  icon: Icon,
  value,
  suffix,
  label,
  decimals = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-volt-400">
        <Icon className="size-4.5" />
      </span>
      <div>
        <p className="font-display text-lg font-bold leading-none">
          <Counter value={value} suffix={suffix} decimals={decimals} />
        </p>
        <p className="mt-1 text-xs text-white/50">{label}</p>
      </div>
    </div>
  );
}
