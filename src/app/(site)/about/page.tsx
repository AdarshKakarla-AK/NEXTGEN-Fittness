import Link from "next/link";
import { Target, ShieldCheck, HeartHandshake, Lightbulb, MapPin, Users, Award, Dumbbell } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { Counter } from "@/components/Counter";
import { Stagger, StaggerItem } from "@/components/motion";

export const metadata = {
  title: "About NEXTGEN FITNESS | Premium Gym in Bengaluru",
  description:
    "NEXTGEN FITNESS is a 30,000 sq ft premium gym in Bengaluru — coaching, community and technology for 1,200+ members since 2016.",
};

const VALUES = [
  { icon: Target, title: "Results first", desc: "We measure outcomes — strength, body composition, attendance — and we publish them to your dashboard." },
  { icon: ShieldCheck, title: "Safety & science", desc: "Movement screens, qualified coaches, audited programming. No bro-science, no shortcuts." },
  { icon: HeartHandshake, title: "Community, not crowds", desc: "Capped class sizes and a culture where members actually know each other's names." },
  { icon: Lightbulb, title: "Tech that helps", desc: "QR check-in, app-based coaching and analytics that put your progress at your fingertips." },
];

const TIMELINE = [
  { year: "2016", event: "NEXTGEN opens a 6,000 sq ft studio on MG Road with 3 coaches and 140 members." },
  { year: "2018", event: "Second floor added — HIIT deck, boxing ring and recovery suite. 500+ members." },
  { year: "2020", event: "Launch of the NEXTGEN member app with QR check-in and live class booking." },
  { year: "2022", event: "Full renovation to 30,000 sq ft. Nutrition desk and physio-on-floor introduced." },
  { year: "2024", event: "CrossFit, boxing and rehab academies launched. 1,200+ active members." },
  { year: "2026", event: "Three floors of training, 50+ weekly classes, 18 certified coaches. Here we are." },
];

export default function AboutPage() {
  const db = getDB();
  const branch = db.settings.branches[0];
  const teamCount = db.users.filter((u) => u.role === "trainer").length;
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Built for people who"
        highlight="show up."
        subtitle="NEXTGEN FITNESS started in 2016 as a single studio with a simple bet: honest coaching, serious equipment and technology that respects your time."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <img src="/images/hero-gym.svg" alt="NEXTGEN FITNESS floor" className="w-full rounded-3xl border border-ink-100 object-cover shadow-2xl dark:border-ink-100" loading="lazy" />
              <div className="card-shadow absolute -bottom-6 -right-4 rounded-2xl border border-ink-100 bg-card px-6 py-4 dark:border-ink-100 sm:right-6">
                <p className="font-display text-3xl font-extrabold text-gradient"><Counter value={9} suffix=" yrs" /></p>
                <p className="text-xs font-semibold text-ink-400">of coaching excellence</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Who we are</p>
              <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">A 30,000 sq ft training floor in the heart of Bengaluru</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-500">
                We&apos;re a team of {teamCount}+ full-time coaches, physios and nutritionists who believe a gym should be measured by what its members
                achieve — not how many memberships it sells. Since 2016, we&apos;ve coached everyone from first-timers to national-level athletes,
                and our retention numbers say more than any tagline.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Today the club spans three floors — strength and cardio on one, studios and boxing on another, and recovery, physio and nutrition on the third.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-ink-100 bg-card p-4 dark:border-ink-100">
                <MapPin className="mt-0.5 size-5 shrink-0 text-volt-500" />
                <p className="text-sm text-ink-600 dark:text-ink-600">
                  <span className="font-bold text-ink-900 dark:text-ink-700">{branch.address}</span>
                  <span className="block text-ink-400">Call us at {db.settings.phone} · {db.settings.hours}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">What we stand for</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">Four values, zero compromise</h2>
          </div>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card-shadow h-full rounded-3xl border border-ink-100 bg-paper p-6 dark:border-ink-100">
                  <span className="inline-flex rounded-2xl bg-gradient-to-r from-volt-500 to-volt-600 p-3"><v.icon className="size-6 text-white" /></span>
                  <h3 className="font-display mt-4 text-lg font-bold text-ink-900 dark:text-ink-700">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-night-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-400">The journey</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold sm:text-4xl">One decade, three floors</h2>
          </div>
          <div className="mt-14 space-y-0">
            {TIMELINE.map((t) => (
              <div key={t.year} className="relative grid gap-3 border-l-2 border-white/10 pb-10 pl-8 last:pb-0 sm:grid-cols-[100px_1fr] sm:gap-6">
                <span className="absolute -left-[7px] top-1 size-3 rounded-full bg-volt-500 ring-4 ring-volt-500/20" />
                <p className="font-display text-xl font-extrabold text-gradient">{t.year}</p>
                <p className="text-sm leading-relaxed text-white/70">{t.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="card-shadow grid gap-8 rounded-3xl border border-ink-100 bg-card p-8 dark:border-ink-100 sm:grid-cols-3">
            {[
              { icon: Users, value: 1200, suffix: "+", label: "Active members" },
              { icon: Award, value: 18, suffix: "", label: "Certified coaches" },
              { icon: Dumbbell, value: 50, suffix: "+", label: "Weekly classes" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="rounded-2xl bg-volt-500/10 p-3"><s.icon className="size-6 text-volt-500" /></span>
                <div>
                  <p className="font-display text-3xl font-extrabold text-ink-900 dark:text-ink-700"><Counter value={s.value} suffix={s.suffix} /></p>
                  <p className="text-sm text-ink-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/membership" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-8 py-4 text-base font-bold text-white shadow-glow transition hover:from-volt-600 hover:to-volt-500">
              Come see us — book a free tour
            </Link>
          </div>
        </div>
      </section>
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
