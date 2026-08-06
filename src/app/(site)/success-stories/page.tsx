import { Star, Quote } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/motion";
import { Avatar } from "@/components/ui";

export const metadata = {
  title: "Success Stories | NEXTGEN FITNESS",
  description:
    "Real transformations from NEXTGEN FITNESS members — weight loss, muscle gain, rehab and endurance, tracked and measured in the member app.",
};

const STORIES = [
  {
    name: "Sneha Kulkarni",
    role: "Product Manager · 31",
    program: "Fat Loss + Nutrition",
    coach: "Meera Krishnan",
    image: "/images/story-1.svg",
    change: "-7.6 kg in 4 months",
    stats: [
      { label: "Starting weight", value: "68 kg" },
      { label: "Body fat", value: "31% → 24%" },
      { label: "Sessions", value: "64 workouts" },
    ],
    quote: "Meera's diet plan and the body scan reports kept me accountable. The app makes it impossible to lie to yourself.",
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer · 28",
    program: "Muscle Gain + Strength",
    coach: "Karan Malhotra",
    image: "/images/story-2.svg",
    change: "+4 kg clean mass in 5 months",
    stats: [
      { label: "Bench press", value: "60 → 100 kg" },
      { label: "Squat", value: "80 → 140 kg" },
      { label: "Weekly sessions", value: "5" },
    ],
    quote: "My coach adjusts the hypertrophy split weekly. 14 months in, I've never been this consistent.",
  },
  {
    name: "Sanjay Gupta",
    role: "Chartered Accountant · 45",
    program: "Rehab + Fat Loss",
    coach: "Nisha Kapoor",
    image: "/images/story-3.svg",
    change: "-8 kg, knees pain-free",
    stats: [
      { label: "Starting weight", value: "96 kg" },
      { label: "Waist", value: "108 → 96 cm" },
      { label: "Squat depth", value: "Full ROM" },
    ],
    quote: "As a 45-year-old I was terrified of the gym. The team built a plan around my knees. Down 8kg and feeling 10 years younger.",
  },
  {
    name: "Ravi Shastri",
    role: "Architect · 41",
    program: "Post-surgery Rehab",
    coach: "Nisha Kapoor",
    image: "/images/story-4.svg",
    change: "Back to 5×5 squats post-op",
    stats: [
      { label: "Rehab sessions", value: "48" },
      { label: "Pain score", value: "8/10 → 1/10" },
      { label: "Return to sport", value: "Basketball" },
    ],
    quote: "Post-surgery rehab here was life-changing. Nisha is a miracle worker. My surgeon asked what gym I used.",
  },
];

export default function SuccessStoriesPage() {
  const db = getDB();
  const reviews = db.reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <>
      <PageHero
        eyebrow="Success stories"
        title="Proof over promises."
        highlight="Real people."
        subtitle="Measured results from real members — the kind you can verify, because every one is tracked in the NEXTGEN app."
        crumbs={[{ label: "Home", href: "/" }, { label: "Success Stories" }]}
      />

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Stagger className="grid gap-6 lg:grid-cols-2">
            {STORIES.map((s) => (
              <StaggerItem key={s.name}>
                <div className="card-shadow flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100 sm:flex-row">
                  <div className="sm:w-2/5">
                    <img src={s.image} alt={s.name} className="h-52 w-full object-cover sm:h-full" loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="w-fit rounded-full bg-volt-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-volt-600 dark:text-volt-400">
                      {s.change}
                    </span>
                    <h3 className="font-display mt-3 text-xl font-extrabold text-ink-900 dark:text-ink-700">{s.name}</h3>
                    <p className="text-xs text-ink-400">{s.role} · {s.program} with {s.coach}</p>
                    <blockquote className="mt-3 flex-1">
                      <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-600">
                        <Quote className="mr-1 inline size-3.5 text-volt-500" />
                        {s.quote}
                      </p>
                    </blockquote>
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4 dark:border-ink-100">
                      {s.stats.map((st) => (
                        <div key={st.label}>
                          <p className="text-xs font-bold text-ink-900 dark:text-ink-700">{st.value}</p>
                          <p className="text-[11px] text-ink-400">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Member reviews</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">From the floor</h2>
          </div>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <StaggerItem key={r.id}>
                <div className="card-shadow flex h-full flex-col rounded-3xl border border-ink-100 bg-paper p-6 dark:border-ink-100">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-4 ${i < r.rating ? "fill-gold-400 text-gold-400" : "text-ink-300"}`} />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-600">“{r.comment}”</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4 dark:border-ink-100">
                    <Avatar name={r.memberName} className="size-10 text-sm" />
                    <div>
                      <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{r.memberName}</p>
                      <p className="text-[11px] capitalize text-ink-400">via {r.channel}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
