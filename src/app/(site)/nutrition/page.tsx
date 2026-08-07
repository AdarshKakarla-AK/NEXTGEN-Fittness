import Link from "next/link";
import Image from "next/image";
import { Apple, Salad, UtensilsCrossed, Droplets, ChartNoAxesCombined } from "lucide-react";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { FAQSection } from "@/components/site/FAQ";
import { Stagger, StaggerItem } from "@/components/motion";

export const metadata = {
  title: "Nutrition Coaching | NEXTGEN FITNESS",
  description:
    "Evidence-based nutrition coaching in Bengaluru — custom diet plans, macro tracking in the app, and a dedicated nutrition coach for sustainable results.",
};

const PRINCIPLES = [
  { icon: ChartNoAxesCombined, title: "Measured, not guessed", desc: "Every plan starts with your actual calorie burn and macros — tracked in the app, not based on trends." },
  { icon: Apple, title: "Real Indian food", desc: "Dosa, dal, roti and paneer are all on the menu. We adapt to your kitchen, not the other way round." },
  { icon: UtensilsCrossed, title: "80/20 sustainable", desc: "Flexible eating with room for your favourites. Crash diets fail; habits don't." },
  { icon: Droplets, title: "Hydration & habits", desc: "Water, sleep and meal timing built into your daily plan with app reminders." },
];

const TRACKS = [
  { name: "Nutrition Basics", price: "Free with yearly+", tag: "App only", features: ["Macro targets from your assessment", "Food diary + photo logging", "Monthly habit reviews", "Weekly micro-tips"] },
  { name: "Guided Coaching", price: "₹3,999", tag: "3 months", features: ["1-on-1 monthly consultations", "Custom meal plan, revised monthly", "WhatApp support 6 days a week", "Grocery + eating-out playbook"] },
  { name: "Performance Nutrition", price: "₹7,499", tag: "3 months", features: ["Sport-specific fueling plans", "Pre/post workout nutrition protocols", "Body scan analysis each month", "Priority coach access"] },
];

export default function NutritionPage() {
  return (
    <>
      <PageHero
        eyebrow="Nutrition"
        title="Abs are made"
        highlight="in the kitchen."
        subtitle="Sustainable, evidence-based nutrition coaching — custom plans built around Indian food, tracked daily in the member app."
        crumbs={[{ label: "Home", href: "/" }, { label: "Nutrition" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p) => (
              <StaggerItem key={p.title}>
                <div className="card-shadow h-full rounded-2xl border border-ink-100 bg-card p-6 dark:border-ink-100">
                  <p.icon className="size-7 text-volt-500" />
                  <h3 className="font-display mt-4 font-bold text-ink-900 dark:text-ink-700">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Sample day · Fat-loss plan</p>
              <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">A day in your member app</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Every member with a nutrition plan sees this in the app — meals, macros, water and habit check-ins. Coaches review your logs and tweak as you progress.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { t: "07:30", m: "Egg white omelette + multigrain toast", kcal: "320 kcal · P28 · C26 · F11" },
                  { t: "11:00", m: "Greek yogurt + berries + flax", kcal: "180 kcal · P16 · C18 · F5" },
                  { t: "13:30", m: "Grilled fish + quinoa + salad", kcal: "420 kcal · P40 · C24 · F16" },
                  { t: "17:30", m: "Apple (pre-workout)", kcal: "100 kcal · C25" },
                  { t: "19:00", m: "Whey lite shake (post-workout)", kcal: "140 kcal · P24" },
                  { t: "20:30", m: "Dal + veggies + khichdi", kcal: "490 kcal · P24 · C62 · F14" },
                ].map((row) => (
                  <div key={row.t} className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-paper p-4 dark:border-ink-100">
                    <span className="font-display w-14 shrink-0 text-sm font-extrabold text-volt-600 dark:text-volt-400">{row.t}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-700">{row.m}</p>
                      <p className="text-xs text-ink-400">{row.kcal}</p>
                    </div>
                    <Salad className="size-4 shrink-0 text-volt-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="card-shadow overflow-hidden rounded-3xl border border-ink-100 bg-paper dark:border-ink-100">
              <div className="relative h-60 w-full"><Image src="/images/class-yoga.svg" alt="Healthy meal prep" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" /></div>
              <div className="p-8">
                <h3 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Nutrition tracks</h3>
                <div className="mt-5 space-y-4">
                  {TRACKS.map((t) => (
                    <div key={t.name} className="flex items-center justify-between rounded-2xl border border-ink-100 bg-card p-4 dark:border-ink-100">
                      <div>
                        <p className="font-bold text-ink-900 dark:text-ink-700">{t.name}</p>
                        <p className="text-xs text-ink-400">{t.tag} · {t.features.length} inclusions</p>
                      </div>
                      <p className="font-display font-extrabold text-volt-600 dark:text-volt-400">{t.price}</p>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-6 py-3.5 text-sm font-bold text-white transition hover:from-volt-600 hover:to-volt-500">
                  Talk to a nutrition coach
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection title="Nutrition questions" subtitle="Plans, dietary preferences, and how coaching fits with your goal." />
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
