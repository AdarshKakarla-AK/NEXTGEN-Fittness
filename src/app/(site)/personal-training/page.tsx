import Link from "next/link";
import Image from "next/image";
import { Check, ClipboardList, Activity, Salad, HeartPulse, TrendingUp, Dumbbell } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { FAQSection } from "@/components/site/FAQ";
import { Stagger, StaggerItem } from "@/components/motion";
import { Avatar } from "@/components/ui";

export const metadata = {
  title: "Personal Training | NEXTGEN FITNESS",
  description:
    "One-on-one personal training in Bengaluru with certified coaches — strength, fat loss, rehab, boxing and nutrition-first transformation programs.",
};

const PLANS = [
  { name: "Starter Pack", sessions: 4, price: 4999, per: "valid 2 weeks", features: ["1-on-1 sessions (4 × 60 min)", "Full assessment + goal setting", "Basic workout template", "Check-in calls"] },
  { name: "Accelerator", sessions: 12, price: 13999, per: "valid 8 weeks", popular: true, features: ["1-on-1 sessions (12 × 60 min)", "Custom program, reviewed weekly", "Nutrition micro-plan", "Progress photos + measurements", "24×7 WhatsApp support"] },
  { name: "Transformation", sessions: 24, price: 24999, per: "valid 16 weeks", features: ["1-on-1 sessions (24 × 60 min)", "Bespoke diet plan (weekly updates)", "Recovery + mobility sessions", "Monthly body scan", "Priority trainer access"] },
];

export default function PersonalTrainingPage() {
  const db = getDB();
  const trainers = db.users.filter((u) => u.role === "trainer");
  return (
    <>
      <PageHero
        eyebrow="Personal Training"
        title="Your goals,"
        highlight="your coach."
        subtitle="PT that's actually personal — a full-time coach, a custom program, weekly reviews and accountability that keeps you consistent."
        crumbs={[{ label: "Home", href: "/" }, { label: "Personal Training" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-shadow overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100">
              <div className="relative h-64 w-full"><Image src="/images/class-strength.svg" alt="One-on-one strength coaching" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div>
              <div className="p-8">
                <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">Why one-on-one works</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  Group classes get you 80% there. The final 20% — technique, intensity, nutrition and recovery — is where personal training pays for itself.
                  Every NEXTGEN PT session is logged in the app, so your coach (and you) can see progress week over week.
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    { icon: ClipboardList, t: "Custom programming", d: "Built for your body, schedule and goal — not a template." },
                    { icon: Activity, t: "Form correction in real time", d: "Every rep coached, every lift safer, every session harder than the last." },
                    { icon: Salad, t: "Nutrition that fits", d: "Sustainable eating plans aligned to training, not crash diets." },
                    { icon: HeartPulse, t: "Accountability that lasts", d: "Weekly weigh-ins, check-ins and plan reviews keep you honest." },
                  ].map((f) => (
                    <li key={f.t} className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-xl bg-volt-500/10 p-2"><f.icon className="size-4 text-volt-500" /></span>
                      <div>
                        <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{f.t}</p>
                        <p className="text-xs leading-relaxed text-ink-400">{f.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card-shadow overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100">
              <div className="relative h-64 w-full"><Image src="/images/class-boxing.svg" alt="Boxing conditioning session" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div>
              <div className="p-8">
                <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">How it works</h2>
                <ol className="mt-5 space-y-4">
                  {[
                    { t: "Free consultation", d: "Tell us your goal — strength, fat loss, rehab, sport. We match you with a specialist." },
                    { t: "Full assessment", d: "Body scan, movement screen, strength baseline. Your starting line is honest." },
                    { t: "Program + app setup", d: "You get a written plan and the member app tracks every session, meal and measurement." },
                    { t: "Weekly reviews", d: "Coaches review logs and adjust. Progress is measured, not guessed." },
                  ].map((s, i) => (
                    <li key={s.t} className="flex items-start gap-4">
                      <span className="font-display flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-volt-500 to-volt-600 text-sm font-extrabold text-white">{i + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{s.t}</p>
                        <p className="text-xs leading-relaxed text-ink-400">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Pricing</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">PT packs that stack up</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500">All packs include a free assessment and the NEXTGEN member app. Split payments available at reception.</p>
          </div>
          <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <StaggerItem key={p.name} className={p.popular ? "lg:scale-[1.03]" : ""}>
                <div className="card-shadow relative flex h-full flex-col rounded-3xl border border-ink-100 bg-paper p-7 dark:border-ink-100">
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-volt-500 to-volt-600 px-4 py-1 text-xs font-bold text-white shadow">Best value</span>
                  )}
                  <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">{p.name}</h3>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-ink-900 dark:text-ink-700">₹{p.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-ink-400">{p.per}</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{p.sessions} sessions · ₹{(p.price / p.sessions).toLocaleString("en-IN")}/session</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-600">
                        <Check className="mt-0.5 size-4 shrink-0 text-volt-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="mt-7 inline-flex items-center justify-center rounded-xl border border-volt-500/40 bg-volt-500/5 px-6 py-3.5 text-sm font-bold text-volt-600 transition hover:bg-volt-500 hover:text-white dark:text-volt-400">
                    Book a consult
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Specialists</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">Match with a specialist</h2>
          </div>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((t) => (
              <StaggerItem key={t.id}>
                <div className="card-shadow flex h-full items-center gap-4 rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
                  <Avatar name={t.name} color={t.avatarColor} className="size-16 shrink-0 text-xl" />
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900 dark:text-ink-700">{t.name}</p>
                    <p className="truncate text-xs text-volt-600 dark:text-volt-400">{t.specialization?.join(" · ")}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-400"><Dumbbell className="size-3.5" /> {t.yearsExp} yrs · ₹{t.hourlyRate}/hr</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="card-shadow mt-10 flex flex-col items-center gap-4 rounded-3xl border border-ink-100 bg-gradient-to-r from-accent-500 to-accent-600 p-8 text-center dark:border-ink-100">
            <TrendingUp className="size-10 text-white/90" />
            <p className="font-display text-2xl font-extrabold text-white">Members who stick with PT are 3× more likely to hit their 6-month goal.</p>
            <Link href="/contact" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-accent-600 shadow-lg transition hover:bg-white/90">
              Start with a free consult
            </Link>
          </div>
        </div>
      </section>

      <FAQSection title="Personal training questions" subtitle="Packs, scheduling, refunds and what happens between sessions." />
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
