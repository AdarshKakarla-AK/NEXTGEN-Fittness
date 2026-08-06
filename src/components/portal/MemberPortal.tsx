"use client";

import * as React from "react";
import {
  LayoutDashboard, CalendarDays, TrendingUp, Salad, Bell, LifeBuoy, Trophy, Flame,
  QrCode, CheckCircle2, Zap, Target, Clock, MapPin, MessageSquarePlus, ArrowRight,
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
  diet: { name: string; dailyCalories: number; goal: string; meals: { type: string; name: string; time: string; calories: number; protein: number }[] } | null;
  weightTrend: { label: string; weight: number; bodyFat?: number }[];
  weekStats: { label: string; minutes: number; sessions: number }[];
  recentLogs: { id: string; date: string; day: string; durationMin: number; caloriesBurned: number; exerciseCount: number }[];
  mealLogDays: { date: string; calories: number; protein: number; meals: { type: string; name: string; calories: number; protein: number }[] }[];
  notifications: { id: string; title: string; body: string; link?: string; read: boolean; createdAt: string }[];
  tickets: { id: string; subject: string; status: string; priority: string; updatedAt?: string; replyCount: number }[];
  achievements: { id: string; title: string; badge: string; unlockedAt: string }[];
  bookings: { id: string; ref: string; type: string; date: string; time: string; durationMin: number; status: string; class?: string; trainer?: string }[];
  checkedInToday: boolean;
  branchName?: string;
  bookableClasses: { id: string; name: string; durationMin: number }[];
};

const TABS = [
  { key: "dash", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "Bookings", icon: CalendarDays },
  { key: "progress", label: "Progress", icon: TrendingUp },
  { key: "nutrition", label: "Nutrition", icon: Salad },
  { key: "notifications", label: "Alerts", icon: Bell },
  { key: "tickets", label: "Support", icon: LifeBuoy },
  { key: "achievements", label: "Achievements", icon: Trophy },
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
              {t.key === "notifications" && p.stats.unread > 0 && (
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
          </div>
        )}

        {tab === "nutrition" && (
          <div className="space-y-6">
            {p.diet ? (
              <>
                <div className="card-shadow rounded-3xl border border-ink-100 bg-card p-6 dark:border-ink-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">{p.diet.name}</h3>
                      <p className="text-sm text-ink-400">Goal: {p.diet.goal}</p>
                    </div>
                    <Badge className="bg-volt-500/10 text-volt-600 dark:text-volt-400">{p.diet.dailyCalories} kcal / day</Badge>
                  </div>
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {p.diet.meals.map((m, i) => (
                      <div key={m.name + i} className="rounded-xl border border-ink-100 bg-paper p-4 dark:border-ink-100">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-volt-600 dark:text-volt-400">{m.type} · {m.time}</p>
                        <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-700">{m.name}</p>
                        <p className="mt-1 text-xs text-ink-400">{m.calories} kcal · {m.protein}g protein</p>
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-ink-700">Recent food logs</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {p.mealLogDays.map((d) => (
                    <div key={d.date} className="card-shadow rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{d.date}</p>
                        <p className="text-xs text-ink-400">{d.calories} kcal · {d.protein}g P</p>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {d.meals.map((m, i) => (
                          <p key={i} className="text-xs text-ink-500"><span className="font-semibold capitalize">{m.type}:</span> {m.name}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400">
                No active nutrition plan. Add nutrition coaching from the Nutrition page.
              </p>
            )}
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Notifications</h2>
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
        )}

        {tab === "tickets" && (
          <TicketPanel tickets={p.tickets} push={push} />
        )}

        {tab === "achievements" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Achievements</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
        )}
      </div>

      {/* QR modal */}
      {qr && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-night-950/90 p-4 backdrop-blur" onClick={() => setQr(null)}>
          <div className="card-shadow w-full max-w-sm rounded-3xl border border-ink-100 bg-card p-8 text-center dark:border-ink-100" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="mx-auto size-12 text-volt-500" />
            <h3 className="font-display mt-3 text-xl font-extrabold text-ink-900 dark:text-ink-700">You&apos;re checked in!</h3>
            <p className="mt-1 text-sm text-ink-400">Show this code at the turnstile or save it for future check-ins.</p>
            <img src={qr} alt="Member QR code" className="mx-auto mt-5 w-44 rounded-2xl bg-white p-3" />
            <p className="mt-3 font-mono text-xs text-ink-400">{p.user.memberId}</p>
            <Button className="mt-5 w-full" onClick={() => setQr(null)}>Done</Button>
          </div>
        </div>
      )}
    </div>
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
