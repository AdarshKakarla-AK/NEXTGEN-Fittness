"use client";

import * as React from "react";
import {
  CalendarCheck, CalendarClock, CircleDollarSign, ClipboardList, Medal, Star, Users, Clock4, Flame, TrendingDown,
} from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

type Kpis = {
  todaysClasses: number;
  todayUpcomingSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  ptRevenue: number;
  membersCount: number;
};

type TrainerProps = {
  name: string;
  rating: number;
  reviewCount: number;
  yearsExp: number;
  specialization: string[];
  hourlyRate: number;
  kpis: Kpis;
  todaysSlots: { classId: string; className: string; color: string; time: string; durationMin: number; capacity: number }[];
  upcomingSessions: { id: string; ref: string; date: string; time: string; durationMin: number; member: string; price: number; status: string }[];
  plannedMembers: { memberId: string; name: string; avatarColor?: string; planName: string; goal: string; attendance: number; currentWeight?: number; startWeight?: number }[];
  reviews: { id: string; memberName: string; rating: number; comment: string; createdAt: string }[];
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function KpiCard({ icon, label, value, sub, tone = "green" }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; tone?: "green" | "blue" | "gold" | "orange" | "purple" }) {
  const tones = {
    green: "bg-volt-100 text-volt-700 dark:bg-volt-800/40 dark:text-volt-400",
    blue: "bg-accent-100 text-accent-700 dark:bg-accent-800/40 dark:text-accent-400",
    gold: "bg-gold-100 text-gold-700 dark:bg-gold-800/40 dark:text-gold-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex size-10 items-center justify-center rounded-xl", tones[tone])}>{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-bold text-ink-900 dark:text-ink-700">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </Card>
  );
}

const avatarColors = ["#22c55e", "#3385ff", "#f97316", "#a855f7", "#14b8a6", "#eab308", "#ef4444", "#6366f1"];

export function TrainerDashboard({ name, rating, reviewCount, yearsExp, specialization, hourlyRate, kpis, todaysSlots, upcomingSessions, plannedMembers, reviews }: TrainerProps) {
  const [tab, setTab] = React.useState<"day" | "sessions" | "members" | "reviews">("day");
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const tabs = [
    { id: "day" as const, label: "Today" },
    { id: "sessions" as const, label: "Sessions" },
    { id: "members" as const, label: "My members" },
    { id: "reviews" as const, label: "Reviews" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-900">Hey coach {name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-400">{todayLabel} · {specialization.join(" · ") || "General coaching"} · {yearsExp} yrs experience</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="gold"><Star className="size-3.5 fill-current" /> {rating.toFixed(1)} ({reviewCount})</Badge>
          <Badge tone="blue">{inr(hourlyRate)}/hr</Badge>
        </div>
      </div>

      <div className="flex rounded-xl border border-ink-100 bg-card p-1 dark:border-ink-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("rounded-lg px-3.5 py-2 text-sm font-semibold transition", tab === t.id ? "bg-ink-900 text-white dark:bg-ink-700" : "text-ink-400 hover:text-ink-700")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "day" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <KpiCard icon={<CalendarClock className="size-5" />} label="Classes today" value={kpis.todaysClasses} tone="blue" />
            <KpiCard icon={<Flame className="size-5" />} label="Sessions today" value={kpis.todayUpcomingSessions} tone="orange" />
            <KpiCard icon={<CalendarCheck className="size-5" />} label="Upcoming sessions" value={kpis.upcomingSessions} tone="green" />
            <KpiCard icon={<Medal className="size-5" />} label="Completed sessions" value={kpis.completedSessions} tone="gold" />
            <KpiCard icon={<CircleDollarSign className="size-5" />} label="PT revenue" value={inr(kpis.ptRevenue)} tone="green" />
            <KpiCard icon={<Users className="size-5" />} label="Members coached" value={kpis.membersCount} tone="purple" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Today&apos;s classes</h2>
              {todaysSlots.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-400">No classes scheduled today. Rest day, coach!</p>
              ) : (
                <div className="space-y-3">
                  {todaysSlots.map((s) => (
                    <div key={`${s.classId}-${s.time}`} className="flex items-center gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: s.color }}>
                        {s.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink-900 dark:text-ink-700">{s.className}</p>
                        <p className="text-xs text-ink-400">{s.durationMin} min · capacity {s.capacity}</p>
                      </div>
                      <Badge tone="green">On schedule</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Today&apos;s PT sessions</h2>
              {upcomingSessions.filter((s) => s.date === new Date().toISOString().slice(0, 10)).length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-400">No one-on-one sessions today.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions
                    .filter((s) => s.date === new Date().toISOString().slice(0, 10))
                    .map((s) => (
                      <div key={s.id} className="flex items-center gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-xs font-bold text-accent-600 dark:bg-accent-800/40 dark:text-accent-400">{s.time}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-ink-900 dark:text-ink-700">{s.member}</p>
                          <p className="text-xs text-ink-400">{s.durationMin} min · {s.ref}</p>
                        </div>
                        <Badge tone="blue">{inr(s.price)}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Upcoming PT sessions</h2>
            {upcomingSessions.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-400">No upcoming sessions.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                      <th className="pb-2.5 pr-4 font-semibold">Ref</th>
                      <th className="pb-2.5 pr-4 font-semibold">Member</th>
                      <th className="pb-2.5 pr-4 font-semibold">Date</th>
                      <th className="pb-2.5 pr-4 font-semibold">Time</th>
                      <th className="pb-2.5 pr-4 font-semibold">Duration</th>
                      <th className="pb-2.5 pr-4 font-semibold">Fee</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingSessions.map((s) => (
                      <tr key={s.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-accent-600 dark:text-accent-400">{s.ref}</td>
                        <td className="py-3 pr-4 font-semibold text-ink-700">{s.member}</td>
                        <td className="py-3 pr-4 text-ink-500">{s.date}</td>
                        <td className="py-3 pr-4 text-ink-500">{s.time}</td>
                        <td className="py-3 pr-4 text-ink-400">{s.durationMin} min</td>
                        <td className="py-3 pr-4 font-bold text-ink-700">{inr(s.price)}</td>
                        <td className="py-3">
                          <Badge tone={s.status === "confirmed" ? "blue" : "green"} className="capitalize">{s.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === "sessions" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">All upcoming sessions</h2>
            <Badge tone="green">{kpis.upcomingSessions} upcoming</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink-900 dark:text-ink-700">{s.member}</p>
                  <Badge tone={s.status === "confirmed" ? "blue" : "green"} className="capitalize">{s.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-400">{s.ref}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
                    <CalendarClock className="size-4 text-accent-500" /> {s.date} · {s.time}
                  </span>
                  <span className="font-bold text-ink-700">{inr(s.price)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-400">{s.durationMin} minutes</p>
              </div>
            ))}
          </div>
          {upcomingSessions.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No upcoming sessions.</p>}
        </Card>
      )}

      {tab === "members" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Members on your plan</h2>
            <Badge tone="blue">{plannedMembers.length} active plans</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plannedMembers.map((m, i) => {
              const delta = m.startWeight && m.currentWeight ? +(m.currentWeight - m.startWeight).toFixed(1) : undefined;
              return (
                <div key={m.memberId} className="rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: m.avatarColor ?? avatarColors[i % avatarColors.length] }}>
                      {m.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-900 dark:text-ink-700">{m.name}</p>
                      <p className="text-xs text-ink-400">{m.goal}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-accent-600 dark:text-accent-400">{m.planName}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-ink-50 p-2 dark:bg-ink-100">
                      <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{m.attendance}</p>
                      <p className="text-[10px] uppercase tracking-wide text-ink-400">Visits</p>
                    </div>
                    <div className="rounded-lg bg-ink-50 p-2 dark:bg-ink-100">
                      <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{m.currentWeight ?? "—"}<span className="text-xs font-normal text-ink-400"> kg</span></p>
                      <p className="text-[10px] uppercase tracking-wide text-ink-400">Current</p>
                    </div>
                    <div className="rounded-lg bg-ink-50 p-2 dark:bg-ink-100">
                      {delta === undefined ? (
                        <p className="text-sm font-bold text-ink-900 dark:text-ink-700">—</p>
                      ) : (
                        <p className={cn("inline-flex items-center gap-0.5 text-sm font-bold", delta <= 0 ? "text-volt-600 dark:text-volt-400" : "text-stop-500")}>
                          {delta > 0 && "+"}{delta} kg
                        </p>
                      )}
                      <p className="text-[10px] uppercase tracking-wide text-ink-400">Change</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {plannedMembers.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No members assigned yet.</p>}
        </Card>
      )}

      {tab === "reviews" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard icon={<Star className="size-5" />} label="Rating" value={rating.toFixed(1)} sub={`${reviewCount} reviews`} tone="gold" />
            <KpiCard icon={<Medal className="size-5" />} label="Years experience" value={yearsExp} tone="blue" />
            <KpiCard icon={<ClipboardList className="size-5" />} label="Specializations" value={specialization.length} sub={specialization.slice(0, 2).join(", ")} tone="purple" />
            <KpiCard icon={<TrendingDown className="size-5" />} label="Hourly rate" value={inr(hourlyRate)} tone="green" />
          </div>
          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Member feedback</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-ink-900 dark:text-ink-700">{r.memberName}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-gold-500">
                      <Star className="size-4 fill-current" /> {r.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{r.comment}</p>
                  <p className="mt-3 text-xs text-ink-400">{r.createdAt.slice(0, 10)}</p>
                </div>
              ))}
            </div>
            {reviews.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No reviews yet.</p>}
          </Card>
        </>
      )}

      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <Clock4 className="size-3.5" /> Tip: mark sessions completed from the reception desk or mobile app to track your monthly PT revenue.
      </p>
    </div>
  );
}
