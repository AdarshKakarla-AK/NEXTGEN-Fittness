"use client";

import * as React from "react";
import {
  LayoutDashboard, CalendarDays, TrendingUp, Bell, Trophy, Flame,
  QrCode, CheckCircle2, Zap, Target, Clock, MapPin, MessageSquarePlus, ArrowRight,
  Dumbbell, Receipt, Printer, Loader2, IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/client";
import { Button, Badge, Avatar } from "@/components/ui";
import { WeightTrendChart, WorkoutBarsChart } from "@/components/portal/PortalCharts";

type P = {
  user: { name: string; email?: string; phone: string; memberId?: string; avatarColor?: string; level?: number; xp?: number; streak?: number };
  membership: { planName: string; status: string; startDate: string; endDate: string; autoRenew: boolean } | null;
  plan: { name: string; price: number; durationMonths: number } | null;
  stats: { streak: number; xp: number; level: number; workoutsThisMonth: number; attendanceThisMonth: number; pastSessions: number; unread: number };
  todayWorkout: { day: string; focus: string; exercises: { name: string; sets: number; reps: string; weightKg?: number }[] } | null;
  weightTrend: { label: string; weight: number; bodyFat?: number }[];
  weekStats: { label: string; minutes: number; sessions: number }[];
  recentLogs: { id: string; date: string; day: string; durationMin: number; caloriesBurned: number; exerciseCount: number }[];
  notifications: { id: string; title: string; body: string; link?: string; read: boolean; createdAt: string }[];
  tickets: { id: string; subject: string; status: string; priority: string; updatedAt?: string; replyCount: number }[];
  achievements: { id: string; title: string; badge: string; unlockedAt: string }[];
  bookings: { id: string; ref: string; type: string; date: string; time: string; durationMin: number; status: string; class?: string; trainer?: string }[];
  checkedInToday: boolean;
  branchName?: string;
  bookableClasses: { id: string; name: string; durationMin: number }[];
  ptTrainers: { id: string; name: string; specialization: string[]; rating: number; reviewCount: number; hourlyRate: number; avatarColor?: string }[];
  ptSessions: { trainerId: string; date: string; time: string }[];
  payments: { id: string; ref: string; description: string; amount: number; status: string; method: string; invoiceNo?: string; createdAt: string }[];
  invoices: { id: string; number: string; items: { name: string; qty: number; amount: number }[]; subtotal: number; gst: number; total: number; issuedAt: string }[];
  gstin: string;
};

const TABS = [
  { key: "dash", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "Bookings", icon: CalendarDays },
  { key: "training", label: "Training", icon: Dumbbell },
  { key: "progress", label: "Progress", icon: TrendingUp },
  { key: "payments", label: "Payments", icon: IndianRupee },
  { key: "alerts", label: "Alerts", icon: Bell },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Stat({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tint: string }) {
  return (
    <div className="card-shadow flex items-center gap-3.5 rounded-2xl border border-ink-100 bg-card p-4 dark:border-ink-100">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tint)}>
        <Icon className="size-5 text-white" />
      </span>
      <div className="min-w-0">
        <p className="font-display truncate text-xl font-extrabold text-ink-900 dark:text-ink-700">{value}</p>
        <p className="truncate text-xs text-ink-400">{label}</p>
      </div>
    </div>
  );
}

export function MemberPortal(p: P) {
  const { push } = useToast();
  const [tab, setTab] = React.useState<TabKey>("dash");
  const [checkedIn, setCheckedIn] = React.useState(p.checkedInToday);
  const [qr, setQr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const checkIn = async () => {
    if (checkedIn) return;
    setBusy(true);
    try {
      const res = await fetch("/api/portal/checkin", { method: "POST", headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Check-in failed");
      setQr(json.qrDataUrl);
      setCheckedIn(true);
      push("Checked in! Have a great workout 💪");
    } catch (e) {
      push(e instanceof Error ? e.message : "Check-in failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const cancelBooking = async (id: string) => {
    const res = await fetch(`/api/portal/bookings/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) });
    const json = await res.json();
    if (!res.ok) return push(json.error || "Could not cancel", "error");
    push("Booking cancelled");
    setTimeout(() => window.location.reload(), 700);
  };

  const markRead = async () => {
    await fetch("/api/portal/notifications/read", { method: "POST" }).catch(() => {});
    push("All caught up");
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={p.user.name} color={p.user.avatarColor} className="size-14 text-2xl" />
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">Hey, {p.user.name.split(" ")[0]}!</h1>
            <p className="text-sm text-ink-400">
              Member {p.user.memberId} · Level {p.user.level} · {p.user.xp} XP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("capitalize", p.membership?.status === "active" ? "bg-volt-500/10 text-volt-600 dark:text-volt-400" : "bg-amber-500/10 text-amber-600")}>
            {p.membership?.status} member
          </Badge>
          <Button onClick={checkIn} disabled={checkedIn || busy} className="relative overflow-hidden">
            <QrCode className="size-4" /> {checkedIn ? "Checked in today" : "Check in"}
            {!checkedIn && (
              <span className="absolute inset-0 -z-0 animate-pulse bg-white/10" aria-hidden />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-30 -mx-4 mt-6 overflow-x-auto border-b border-ink-100 bg-paper/90 px-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-2 dark:border-ink-100">
        <div className="flex gap-1 py-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                tab === t.key ? "bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow" : "text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-100"
              )}
            >
              <t.icon className="size-4" />
              {t.label}
              {t.key === "alerts" && p.stats.unread > 0 && (
                <span className="rounded-full bg-stop-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{p.stats.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "dash" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Flame} label="Day streak" value={`${p.stats.streak} days`} tint="bg-gradient-to-r from-orange-500 to-red-500" />
              <Stat icon={Zap} label="Workouts this month" value={String(p.stats.workoutsThisMonth)} tint="bg-gradient-to-r from-volt-500 to-volt-600" />
              <Stat icon={Target} label="Sessions completed" value={String(p.stats.pastSessions)} tint="bg-gradient-to-r from-accent-500 to-accent-600" />
              <Stat icon={Trophy} label="Level" value={String(p.user.level)} tint="bg-gradient-to-r from-gold-400 to-gold-500" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Membership card */}
              <div className="card-shadow overflow-hidden rounded-3xl border border-ink-100 bg-night-950 p-6 text-white lg:col-span-1 dark:border-ink-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-400">Membership card</p>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70">RFID + QR</span>
                </div>
                <p className="font-display mt-6 text-2xl font-extrabold tracking-tight">{p.user.name}</p>
                <p className="mt-1 text-sm text-white/60">{p.user.memberId} · {p.membership?.planName}</p>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/50">Valid till</p>
                    <p className="text-sm font-bold">{p.membership?.endDate ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-2">
                    <QrCode className="size-14 text-night-950" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-white/60">
                  <span>{p.branchName ?? "MG Road"} · {p.user.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3.5 text-volt-400" /> Level 4</span>
                </div>
              </div>

              {/* Today's workout */}
              <div className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 lg:col-span-2 dark:border-ink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-volt-600 dark:text-volt-400">Today&apos;s program</p>
                    <h3 className="font-display mt-1 text-xl font-extrabold text-ink-900 dark:text-ink-700">{p.todayWorkout?.day ?? "Rest day"}</h3>
                    <p className="text-sm text-ink-400">{p.todayWorkout?.focus ?? "No active workout plan — ask a trainer to assign one."}</p>
                  </div>
                  <Flame className="size-7 text-volt-500" />
                </div>
                {p.todayWorkout && (
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {p.todayWorkout.exercises.map((e, i) => (
                      <div key={e.name + i} className="flex items-center justify-between rounded-xl border border-ink-100 bg-paper px-4 py-3 dark:border-ink-100">
                        <div>
                          <p className="text-sm font-semibold text-ink-900 dark:text-ink-700">{e.name}</p>
                          <p className="text-xs text-ink-400">{e.sets} sets × {e.reps}</p>
                        </div>
                        {e.weightKg ? <span className="text-sm font-bold text-volt-600 dark:text-volt-400">{e.weightKg} kg</span> : <CheckCircle2 className="size-4 text-volt-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 dark:border-ink-100">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Weight trend</p>
                <WeightTrendChart data={p.weightTrend.length ? p.weightTrend : [{ label: "—", weight: 0 }]} />
              </div>
              <div className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 lg:col-span-2 dark:border-ink-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Weekly training volume</p>
                  <span className="text-xs text-ink-400">{p.stats.attendanceThisMonth} check-ins this month</span>
                </div>
                <WorkoutBarsChart data={p.weekStats} />
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Upcoming bookings</h2>
            </div>
            <ClassBookingForm classes={p.bookableClasses} push={push} />
            {p.bookings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400">No upcoming bookings. Book a class above and claim your spot.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {p.bookings.map((b) => (
                  <div key={b.id} className="card-shadow rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-ink-400">{b.ref} · <span className="capitalize">{b.type.replace("_", " ")}</span></p>
                        <h3 className="font-display mt-1 font-extrabold text-ink-900 dark:text-ink-700">{b.class ?? "Personal training"}</h3>
                        <p className="mt-0.5 text-sm text-ink-500">{b.trainer ?? ""}</p>
                      </div>
                      <Badge className={cn("capitalize", b.status === "waitlisted" ? "bg-amber-500/10 text-amber-600" : "bg-volt-500/10 text-volt-600 dark:text-volt-400")}>{b.status}</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-sm dark:border-ink-100">
                      <span className="flex items-center gap-1.5 text-ink-500"><Clock className="size-4 text-volt-500" /> {b.date} · {b.time}</span>
                      <button onClick={() => cancelBooking(b.id)} className="text-xs font-semibold text-stop-500 hover:underline">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "training" && (
          <div className="space-y-6">
            <WorkoutLogForm push={push} />
            <PtBookingPanel trainers={p.ptTrainers} sessions={p.ptSessions} bookings={p.bookings} push={push} />
          </div>
        )}

        {tab === "payments" && (
          <PaymentsPanel
            user={{ name: p.user.name, memberId: p.user.memberId ?? "", phone: p.user.phone }}
            payments={p.payments}
            invoices={p.invoices}
            gstin={p.gstin}
          />
        )}

        {tab === "progress" && (
          <div className="space-y-6">
            <div className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 dark:border-ink-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Body composition</p>
                <span className="text-xs text-ink-400">Source: monthly InBody-style scan</span>
              </div>
              <WeightTrendChart data={p.weightTrend.length ? p.weightTrend : [{ label: "—", weight: 0 }]} />
            </div>
            <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-ink-700">Recent workouts</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {p.recentLogs.length === 0 && <p className="text-sm text-ink-400">No logged workouts yet.</p>}
              {p.recentLogs.map((l) => (
                <div key={l.id} className="card-shadow flex items-center justify-between rounded-2xl border border-ink-100 bg-card p-4 dark:border-ink-100">
                  <div>
                    <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{l.day || "Workout"}</p>
                    <p className="text-xs text-ink-400">{l.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-volt-600 dark:text-volt-400">{l.durationMin} min</p>
                    <p className="text-xs text-ink-400">{l.caloriesBurned} kcal · {l.exerciseCount} moves</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-ink-700">Achievements</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {p.achievements.map((a) => (
                  <div key={a.id} className="card-shadow flex flex-col items-center rounded-2xl border border-ink-100 bg-card p-5 text-center dark:border-ink-100">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 text-white">
                      <Trophy className="size-6" />
                    </span>
                    <p className="mt-3 text-sm font-bold text-ink-900 dark:text-ink-700">{a.title}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">{a.unlockedAt.slice(0, 10)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Alerts</h2>
                <Button size="sm" variant="outline" onClick={markRead}>Mark all read</Button>
              </div>
              <div className="space-y-2.5">
                {p.notifications.map((n) => (
                  <div key={n.id} className={cn("card-shadow flex gap-3 rounded-2xl border p-4", n.read ? "border-ink-100 bg-card dark:border-ink-100" : "border-volt-500/25 bg-volt-500/5")}>
                    <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", n.read ? "bg-ink-300" : "bg-volt-500")} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{n.title}</p>
                      <p className="text-sm text-ink-500">{n.body}</p>
                      <p className="mt-1 text-[11px] text-ink-400">{new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <TicketPanel tickets={p.tickets} push={push} />
          </div>
        )}
      </div>

      {/* QR modal */}
      {qr && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-night-950/90 p-4 backdrop-blur" onClick={() => setQr(null)}>
          <div className="card-shadow w-full max-w-sm rounded-3xl border border-ink-100 bg-card p-8 text-center dark:border-ink-100" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="mx-auto size-12 text-volt-500" />
            <h3 className="font-display mt-3 text-xl font-extrabold text-ink-900 dark:text-ink-700">You&apos;re checked in!</h3>
            <p className="mt-1 text-sm text-ink-400">Show this code at the turnstile or save it for future check-ins.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Member QR code" className="mx-auto mt-5 w-44 rounded-2xl bg-white p-3" />
            <p className="mt-3 font-mono text-xs text-ink-400">{p.user.memberId}</p>
            <Button className="mt-5 w-full" onClick={() => setQr(null)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutLogForm({ push }: { push: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [durationMin, setDurationMin] = React.useState(45);
  const [calories, setCalories] = React.useState("");
  const [exercises, setExercises] = React.useState([{ name: "", sets: 3, reps: "10", weight: "" }]);
  const [busy, setBusy] = React.useState(false);

  const setEx = (i: number, patch: Partial<{ name: string; sets: number; reps: string; weight: string }>) =>
    setExercises((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filled = exercises.filter((x) => x.name.trim());
    setBusy(true);
    const res = await fetch("/api/portal/workout-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMin,
        caloriesBurned: Number(calories) || 0,
        exercises: filled.map((x) => ({ name: x.name, sets: x.sets, reps: x.reps, weightKg: Number(x.weight) || undefined })),
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return push(json.error || "Could not log workout", "error");
    const bonus = json.newAchievements?.length ? ` · ${json.newAchievements.join(", ")} unlocked!` : "";
    push(`Workout logged (+${json.xp} XP)${bonus}`);
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <form onSubmit={submit} className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 dark:border-ink-100">
      <div className="flex items-center gap-2">
        <Flame className="size-5 text-volt-500" />
        <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-ink-700">Log a workout</h3>
        <span className="text-xs text-ink-400">2 XP per minute</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-500">Duration (minutes)</span>
          <input type="number" min={1} max={240} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}
            className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none" />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-500">Calories burned (optional)</span>
          <input type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} placeholder={`≈ ${Math.round((durationMin || 45) * 8)} kcal`}
            className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none" />
        </label>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-500">Exercises</span>
          <button type="button" onClick={() => setExercises((xs) => [...xs, { name: "", sets: 3, reps: "10", weight: "" }])}
            className="text-xs font-bold text-volt-600 hover:underline dark:text-volt-400">+ Add exercise</button>
        </div>
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="grid grid-cols-[1fr_3.5rem_4rem_5rem_2rem] items-center gap-2">
              <input value={ex.name} onChange={(e) => setEx(i, { name: e.target.value })} placeholder={`Exercise ${i + 1} name`}
                className="rounded-xl border border-ink-200 bg-paper px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:outline-none" />
              <input type="number" min={1} value={ex.sets} onChange={(e) => setEx(i, { sets: Number(e.target.value) })} title="Sets"
                className="w-full rounded-xl border border-ink-200 bg-paper px-2 py-2 text-center text-sm text-ink-900 focus:border-volt-500 focus:outline-none" />
              <input value={ex.reps} onChange={(e) => setEx(i, { reps: e.target.value })} placeholder="Reps" title="Reps"
                className="w-full rounded-xl border border-ink-200 bg-paper px-2 py-2 text-center text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:outline-none" />
              <input value={ex.weight} onChange={(e) => setEx(i, { weight: e.target.value })} placeholder="kg" title="Weight kg"
                className="w-full rounded-xl border border-ink-200 bg-paper px-2 py-2 text-center text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:outline-none" />
              <button type="button" onClick={() => setExercises((xs) => xs.filter((_, j) => j !== i))} disabled={exercises.length === 1}
                className="text-sm text-stop-500 disabled:opacity-30" aria-label="Remove exercise">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <Button type="submit" disabled={busy}><Dumbbell className="size-4" /> {busy ? "Logging…" : "Log workout"}</Button>
      </div>
    </form>
  );
}

function TicketPanel({ tickets, push }: { tickets: P["tickets"]; push: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setBusy(true);
    const res = await fetch("/api/portal/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return push(json.error || "Could not create ticket", "error");
    push("Ticket created — we'll reply soon");
    setSubject("");
    setBody("");
    setTimeout(() => window.location.reload(), 700);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquarePlus className="size-5 text-volt-500" />
        <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Support tickets</h2>
      </div>
      <form onSubmit={submit} className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 dark:border-ink-100">
        <p className="text-sm font-bold text-ink-900 dark:text-ink-700">Open a ticket</p>
        <div className="mt-4 grid gap-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject — e.g. Change my PT day"
            className="rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Tell us what you need…"
            className="rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none"
          />
          <div>
            <Button type="submit" disabled={busy}><ArrowRight className="size-4" /> {busy ? "Creating…" : "Submit ticket"}</Button>
          </div>
        </div>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {tickets.map((t) => (
          <div key={t.id} className="card-shadow rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-ink-900 dark:text-ink-700">{t.subject}</p>
              <Badge className={cn("capitalize", t.status === "resolved" ? "bg-volt-500/10 text-volt-600 dark:text-volt-400" : t.status === "open" ? "bg-amber-500/10 text-amber-600" : "bg-accent-500/10 text-accent-600")}>{t.status}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
              <span className="capitalize">Priority: {t.priority} · {t.replyCount} reply{t.replyCount === 1 ? "" : "s"}</span>
              <span>{t.updatedAt?.slice(0, 10)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassBookingForm({ classes, push }: { classes: { id: string; name: string; durationMin: number }[]; push: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [classId, setClassId] = React.useState(classes[0]?.id ?? "");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);
  const today = new Date();
  const dates: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d.toISOString().slice(0, 10));
  }
  const [date, setDate] = React.useState(dates[0] ?? "");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !date) return;
    setBusy(true);
    const res = await fetch("/api/portal/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, date }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return push(json.error || "Could not book", "error");
    push(json.status === "waitlisted" ? "Added to waitlist" : "Class booked!");
    setDone(json.status === "waitlisted" ? "waitlisted" : "confirmed");
    setTimeout(() => window.location.reload(), 800);
  };
  return (
    <form onSubmit={submit} className="card-shadow rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-52 flex-1">
          <span className="mb-1.5 block text-xs font-semibold text-ink-500">Class</span>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} · {c.durationMin} min</option>
            ))}
          </select>
        </label>
        <label className="min-w-36 flex-1">
          <span className="mb-1.5 block text-xs font-semibold text-ink-500">Date</span>
          <select value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none">
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={busy || !classId || !date || !!done}>
          {done ? (done === "waitlisted" ? "On waitlist ✓" : "Booked ✓") : busy ? "Booking…" : "Book a class"}
        </Button>
      </div>
    </form>
  );
}

function nextDates(count = 7): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function PtBookingPanel({
  trainers,
  sessions,
  bookings,
  push,
}: {
  trainers: P["ptTrainers"];
  sessions: P["ptSessions"];
  bookings: P["bookings"];
  push: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const dates = nextDates(7);
  const [trainerId, setTrainerId] = React.useState(trainers[0]?.id ?? "");
  const [date, setDate] = React.useState(dates[0] ?? "");
  const [time, setTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);

  const trainer = trainers.find((t) => t.id === trainerId);
  const taken = trainerId && date ? sessions.filter((s) => s.trainerId === trainerId && s.date === date).map((s) => s.time) : [];
  const myBusy = date ? bookings.filter((b) => b.date === date && (b.status === "upcoming" || b.status === "confirmed" || b.status === "waitlisted")).map((b) => b.time) : [];
  const slots = Array.from({ length: 15 }, (_, i) => `${String(6 + i).padStart(2, "0")}:00`);
  const disabled = (t: string) => taken.includes(t) || myBusy.includes(t);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId || !date || !time) return push("Pick a trainer, date and time slot.", "error");
    setBusy(true);
    const res = await fetch("/api/portal/pt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trainerId, date, time, notes }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return push(json.error || "Could not book the session.", "error");
    push(`PT session confirmed — ${trainer?.name ?? "trainer"} on ${date} at ${time}.`);
    setDone(json.ref ?? "booked");
    setTime("");
    setNotes("");
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Dumbbell className="size-5 text-volt-500" />
        <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Book a personal training session</h2>
      </div>

      <form onSubmit={submit} className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 dark:border-ink-100">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-500">Coach</span>
            <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none">
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} · ₹{t.hourlyRate.toLocaleString("en-IN")}/hr</option>
              ))}
            </select>
            {trainer && (
              <span className="mt-1.5 block text-[11px] text-ink-400">
                {trainer.specialization.join(", ")} · ⭐ {trainer.rating.toFixed(1)} ({trainer.reviewCount})
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-500">Date</span>
            <select value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none">
              {dates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-500">Notes (optional)</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Goal, injury, focus…" className="w-full rounded-xl border border-ink-200 bg-paper px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none" />
          </label>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-400">Pick a 60-min slot ({trainer?.name ?? "coach"})</p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {slots.map((t) => {
            const off = disabled(t);
            return (
              <button
                key={t}
                type="button"
                disabled={off}
                onClick={() => setTime(t)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-sm font-semibold transition",
                  time === t
                    ? "border-volt-500 bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow"
                    : off
                      ? "cursor-not-allowed border-ink-100 bg-ink-50 text-ink-300 line-through dark:border-ink-100 dark:bg-ink-100"
                      : "border-ink-200 bg-paper text-ink-700 hover:border-volt-500/50"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-ink-400">Slots shown as booked are unavailable. The coach sees your booking on their schedule instantly.</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500">Pay at the front desk — <span className="font-bold text-ink-700 dark:text-ink-600">₹{(trainer?.hourlyRate ?? 0).toLocaleString("en-IN")}/hr</span></p>
          <Button type="submit" disabled={busy || !trainerId || !date || !time || !!done}>
            {done ? "Booked ✓" : busy ? (<><Loader2 className="size-4 animate-spin" /> Booking…</>) : "Book session"}
          </Button>
        </div>
      </form>
    </div>
  );
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function PaymentsPanel({ user, payments, invoices, gstin }: { user: { name: string; memberId: string; phone: string }; payments: P["payments"]; invoices: P["invoices"]; gstin: string }) {
  const [receipt, setReceipt] = React.useState<{ payment: P["payments"][number]; invoice: P["invoices"][number] | undefined } | null>(null);
  const invoiceByNumber = new Map(invoices.map((i) => [i.number, i]));
  const badgeTone = (status: string) =>
    status === "paid" ? "bg-volt-500/10 text-volt-600 dark:text-volt-400" : status === "pending" ? "bg-amber-500/10 text-amber-600" : status === "refunded" ? "bg-ink-500/10 text-ink-500" : "bg-stop-500/10 text-stop-500";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Receipt className="size-5 text-volt-500" />
        <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Payments & receipts</h2>
      </div>

      {payments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400">No payments yet.</p>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                <th className="px-5 py-3.5 font-semibold">Ref</th>
                <th className="px-5 py-3.5 font-semibold">Description</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Amount</th>
                <th className="px-5 py-3.5 text-right font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const invoice = p.invoiceNo ? invoiceByNumber.get(p.invoiceNo) : undefined;
                return (
                  <tr key={p.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-accent-600 dark:text-accent-400">{p.ref}</td>
                    <td className="px-5 py-3.5 text-ink-700 dark:text-ink-600">{p.description}</td>
                    <td className="px-5 py-3.5 text-ink-400">{p.createdAt.slice(0, 10)}</td>
                    <td className="px-5 py-3.5"><span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize", badgeTone(p.status))}>{p.status}</span></td>
                    <td className="px-5 py-3.5 text-right font-bold text-ink-700 dark:text-ink-600">{inr(p.amount)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {invoice ? (
                        <button onClick={() => setReceipt({ payment: p, invoice })} className="text-xs font-bold text-volt-600 hover:underline dark:text-volt-400">
                          View invoice
                        </button>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-night-950/80 p-4 backdrop-blur" onClick={() => setReceipt(null)}>
          <div className="card-shadow my-8 w-full max-w-xl rounded-3xl border border-ink-100 bg-white p-8 text-night-950 dark:border-ink-100" onClick={(e) => e.stopPropagation()}>
            <div className="print-area">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-extrabold">NEXTGEN FITNESS</p>
                  <p className="mt-0.5 text-xs text-ink-500">Premium Health Club · GSTIN {gstin}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Tax invoice</p>
                  <p className="font-mono text-sm font-bold">{receipt.invoice?.number ?? receipt.payment.ref}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Billed to</p>
                  <p className="mt-1 font-semibold">{user.name}</p>
                  <p className="text-xs text-ink-500">Member {user.memberId} · {user.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Issued</p>
                  <p className="mt-1 font-semibold">{receipt.invoice?.issuedAt.slice(0, 10) ?? receipt.payment.createdAt.slice(0, 10)}</p>
                  <p className="text-xs text-ink-500">{receipt.payment.method.toUpperCase()} · {receipt.payment.ref}</p>
                </div>
              </div>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="pb-2 text-left font-semibold">Item</th>
                    <th className="pb-2 text-right font-semibold">Qty</th>
                    <th className="pb-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(receipt.invoice?.items ?? [{ name: receipt.payment.description, qty: 1, amount: receipt.invoice?.subtotal ?? receipt.payment.amount }]).map((it, i) => (
                    <tr key={i} className="border-b border-ink-100">
                      <td className="py-2.5">{it.name}</td>
                      <td className="py-2.5 text-right">{it.qty}</td>
                      <td className="py-2.5 text-right font-semibold">{inr(it.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-ink-100 text-ink-500">
                    <td className="py-2.5">Subtotal</td><td></td>
                    <td className="py-2.5 text-right">{inr(receipt.invoice?.subtotal ?? receipt.payment.amount)}</td>
                  </tr>
                  <tr className="border-b border-ink-100 text-ink-500">
                    <td className="py-2.5">GST (18%)</td><td></td>
                    <td className="py-2.5 text-right">{inr(receipt.invoice?.gst ?? 0)}</td>
                  </tr>
                  <tr className="text-ink-900">
                    <td className="py-2.5 font-bold">Total</td><td></td>
                    <td className="py-2.5 text-right font-extrabold">{inr(receipt.invoice?.total ?? receipt.payment.amount)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-6 border-t border-ink-100 pt-4 text-center text-[11px] text-ink-400">Thank you for training with NEXTGEN FITNESS. This is a computer-generated invoice.</p>
            </div>
            <div className="no-print mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setReceipt(null)}>Close</Button>
              <Button onClick={() => window.print()}> <Printer className="size-4" /> Print receipt</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
