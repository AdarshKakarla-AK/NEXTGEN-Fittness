import Image from "next/image";
import { Star, Quote, PlayCircle } from "lucide-react";
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
    video: { id: "aqz-KE-bpKQ", title: "Sneha's 4-month fat loss journey" },
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
    video: { id: "aqz-KE-bpKQ", title: "Rahul's strength rebuild — 60kg to 100kg bench" },
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
    video: { id: "aqz-KE-bpKQ", title: "Sanjay's knee-friendly transformation" },
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
  {
    name: "Ananya Rao",
    role: "Marketing Lead · 34",
    program: "Hybrid Training (Lift + Run)",
    coach: "Dev Patel",
    image: "/images/story-1.svg",
    change: "Half-marathon in 5 months",
    stats: [
      { label: "5K time", value: "34 → 27 min" },
      { label: "Squat", value: "70 → 95 kg" },
      { label: "Body fat", value: "28% → 22%" },
    ],
    quote: "I used to think I had to choose between lifting and running. Dev showed me I could do both — and get better at each.",
    video: { id: "aqz-KE-bpKQ", title: "Ananya's hybrid athlete journey" },
  },
  {
    name: "Pooja Desai",
    role: "Dentist · 38",
    program: "Strength + Posture",
    coach: "Nisha Kapoor",
    image: "/images/story-3.svg",
    change: "Zero back pain in 6 months",
    stats: [
      { label: "Pain days/month", value: "14 → 0" },
      { label: "Deadlift", value: "0 → 80 kg" },
      { label: "Posture score", value: "3.1 → 8.4" },
    ],
    quote: "Eight hours hunched over patients had wrecked my back. The posture protocol rebuilt me from the ground up.",
    video: { id: "aqz-KE-bpKQ", title: "Pooja's posture recovery" },
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
                <div className="card-shadow flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100">
                  <div className="relative aspect-[16/9]">
                    <Image src={s.image} alt={s.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" loading="lazy" />
                    {s.video && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-night-950/80 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                        <PlayCircle className="size-3.5 text-volt-400" /> Video story
                      </span>
                    )}
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
                    {s.video && (
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-400">{s.video.title}</p>
                        <div className="aspect-video overflow-hidden rounded-xl bg-night-950">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${s.video.id}`}
                            title={s.video.title}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="size-full"
                          />
                        </div>
                      </div>
                    )}
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
