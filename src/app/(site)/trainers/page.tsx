import Link from "next/link";
import { Star, Award, Languages, BadgeCheck, ArrowRight, TrendingUp } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/motion";
import { Avatar } from "@/components/ui";
import type { User } from "@/lib/db/types";

export const metadata = {
  title: "Meet the Trainers | NEXTGEN FITNESS",
  description:
    "Six certified, full-time coaches at NEXTGEN FITNESS Bengaluru — strength, yoga, HIIT, boxing, rehab and nutrition specialists.",
};

function TrainerCard({ trainer }: { trainer: User }) {
  return (
    <StaggerItem>
      <div className="card-shadow group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100">
        <div className="relative flex items-center justify-center bg-gradient-to-br from-ink-800 via-ink-900 to-accent-900 px-6 py-10">
          <Avatar name={trainer.name} color={trainer.avatarColor} className="size-28 text-3xl ring-4 ring-white/10" />
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-night/70 px-3 py-1 text-xs font-bold text-gold-400 backdrop-blur">
            <Star className="size-3.5 fill-gold-400" /> {trainer.rating?.toFixed(1)} <span className="font-medium text-white/60">({trainer.reviewCount})</span>
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">{trainer.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-volt-600 dark:text-volt-400">{trainer.specialization?.[0]}</p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{trainer.bio}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {trainer.specialization?.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-volt-500/10 px-2.5 py-1 text-[11px] font-semibold text-volt-600 dark:text-volt-400">{s}</span>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-xs text-ink-500 dark:border-ink-100">
            <p className="flex items-center gap-2"><Award className="size-4 text-gold-500" /> {trainer.certifications?.join(", ")}</p>
            <p className="flex items-center gap-2"><TrendingUp className="size-4 text-volt-500" /> {trainer.yearsExp}+ years coaching</p>
            <p className="flex items-center gap-2"><Languages className="size-4 text-volt-500" /> {trainer.languages?.join(" · ")}</p>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900 dark:text-ink-700">₹{trainer.hourlyRate}/hr <span className="text-xs font-medium text-ink-400">PT</span></p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-4 py-2.5 text-xs font-bold text-white transition hover:from-volt-600 hover:to-volt-500"
            >
              Book {trainer.name.split(" ")[0]} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </StaggerItem>
  );
}

export default function TrainersPage() {
  const db = getDB();
  const trainers = db.users.filter((u) => u.role === "trainer").sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return (
    <>
      <PageHero
        eyebrow="Coaches"
        title="Coached by the best,"
        highlight="not the nearest."
        subtitle="Six full-time, certified coaches on the floor — not freelancers who rush between gyms. Every trainer is background-verified and audited monthly."
        crumbs={[{ label: "Home", href: "/" }, { label: "Trainers" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Certifications", value: "18+", desc: "ACE, NASM, RYT, DPT and more" },
              { label: "Average rating", value: "4.9★", desc: "across 1,064 member reviews" },
              { label: "Average tenure", value: "7 yrs", desc: "coaching experience per trainer" },
              { label: "Sessions / month", value: "900+", desc: "one-on-one and group coached" },
            ].map((s) => (
              <div key={s.label} className="card-shadow rounded-2xl border border-ink-100 bg-card p-6 dark:border-ink-100">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{s.label}</p>
                <p className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">{s.value}</p>
                <p className="mt-1 text-sm text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((t) => (
              <TrainerCard key={t.id} trainer={t} />
            ))}
          </Stagger>

          <div className="card-shadow mt-12 flex flex-col items-center gap-4 rounded-3xl border border-ink-100 bg-gradient-to-r from-volt-500 to-volt-600 p-8 text-center dark:border-ink-100">
            <BadgeCheck className="size-10 text-white/90" />
            <p className="font-display text-2xl font-extrabold text-white">Not sure which coach fits your goal?</p>
            <p className="max-w-xl text-sm text-white/80">Book a free 20-minute consultation and we&apos;ll pair you with the right specialist — no charge, no pressure.</p>
            <Link href="/contact" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-volt-600 shadow-lg transition hover:bg-white/90">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
