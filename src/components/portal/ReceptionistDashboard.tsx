"use client";

import * as React from "react";
import { BellRing, Boxes, CalendarCheck, PhoneCall, Ticket, UserCheck, Users } from "lucide-react";
import { Card, Badge, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

type Kpis = {
  membersPresent: number;
  todaysCheckins: number;
  newLeadsToday: number;
  expiringSoon: number;
  openTickets: number;
  activeMembers: number;
  lowStock: number;
};

type ReceptionistProps = {
  name: string;
  kpis: Kpis;
  todaysAttendance: { id: string; memberId: string; name: string; checkIn: string; method: string; workoutMinutes: number; membershipStatus?: string }[];
  leads: { id: string; name: string; phone: string; source: string; status: string; createdAt: string }[];
  expiring: { id: string; memberId: string; name: string; planName: string; endDate: string; status: string }[];
  upcomingToday: { id: string; ref: string; member: string; type: string; time: string; durationMin: number; status: string }[];
  tickets: { id: string; subject: string; priority: string; status: string; member: string; createdAt: string }[];
  lowStock: { id: string; name: string; quantity: number; reorderLevel: number }[];
};

function KpiCard({ icon, label, value, sub, tone = "green" }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; tone?: "green" | "blue" | "gold" | "orange" | "red" | "purple" }) {
  const tones = {
    green: "bg-volt-100 text-volt-700 dark:bg-volt-800/40 dark:text-volt-400",
    blue: "bg-accent-100 text-accent-700 dark:bg-accent-800/40 dark:text-accent-400",
    gold: "bg-gold-100 text-gold-700 dark:bg-gold-800/40 dark:text-gold-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };
  return (
    <Card className="p-5">
      <span className={cn("inline-flex size-10 items-center justify-center rounded-xl", tones[tone])}>{icon}</span>
      <p className="mt-4 text-2xl font-bold text-ink-900 dark:text-ink-700">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </Card>
  );
}

const avatarColors = ["#22c55e", "#3385ff", "#f97316", "#a855f7", "#14b8a6", "#eab308", "#ef4444", "#6366f1"];

export function ReceptionistDashboard({ name, kpis, todaysAttendance, leads, expiring, upcomingToday, tickets, lowStock }: ReceptionistProps) {
  const [tab, setTab] = React.useState<"desk" | "leads" | "expiring" | "tickets" | "stock">("desk");
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const tabs = [
    { id: "desk" as const, label: "Front desk" },
    { id: "leads" as const, label: "Leads" },
    { id: "expiring" as const, label: "Expiring" },
    { id: "tickets" as const, label: "Tickets" },
    { id: "stock" as const, label: "Inventory" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-900">Front desk, {name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-400">{todayLabel} · {kpis.membersPresent} members in the gym right now</p>
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
      </div>

      {tab === "desk" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <KpiCard icon={<UserCheck className="size-5" />} label="Members inside" value={kpis.membersPresent} tone="green" />
            <KpiCard icon={<CalendarCheck className="size-5" />} label="Check-ins today" value={kpis.todaysCheckins} tone="blue" />
            <KpiCard icon={<Users className="size-5" />} label="Active members" value={kpis.activeMembers} tone="purple" />
            <KpiCard icon={<PhoneCall className="size-5" />} label="New leads today" value={kpis.newLeadsToday} tone="gold" />
            <KpiCard icon={<BellRing className="size-5" />} label="Expiring in 7 days" value={kpis.expiringSoon} tone="orange" />
            <KpiCard icon={<Ticket className="size-5" />} label="Open tickets" value={kpis.openTickets} tone="red" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Live check-ins</h2>
                <Badge tone="green">{todaysAttendance.length} today</Badge>
              </div>
              <div className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
                {todaysAttendance.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-100">
                    <Avatar name={a.name} className="size-9 text-xs" color={avatarColors[i % avatarColors.length]} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 dark:text-ink-700">{a.name}</p>
                      <p className="text-xs text-ink-400">{a.checkIn.slice(11, 16)} · {a.workoutMinutes} min</p>
                    </div>
                    <Badge tone="blue" className="capitalize">{a.method}</Badge>
                    <Badge tone={a.membershipStatus === "active" ? "green" : "red"} className="capitalize">{a.membershipStatus ?? "—"}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Bookings today</h2>
              <div className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
                {upcomingToday.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-100">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-xs font-bold text-accent-600 dark:bg-accent-800/40 dark:text-accent-400">{b.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 dark:text-ink-700">{b.member}</p>
                      <p className="text-xs text-ink-400 capitalize">{b.type.replace("_", " ")} · {b.durationMin} min · {b.ref}</p>
                    </div>
                    <Badge tone={b.status === "confirmed" ? "blue" : "green"} className="capitalize">{b.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "leads" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">New leads to follow up</h2>
            <Badge tone="gold">{leads.length} pending</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                  <th className="pb-2.5 pr-4 font-semibold">Name</th>
                  <th className="pb-2.5 pr-4 font-semibold">Phone</th>
                  <th className="pb-2.5 pr-4 font-semibold">Source</th>
                  <th className="pb-2.5 pr-4 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                    <td className="py-3 pr-4 font-semibold text-ink-700">{l.name}</td>
                    <td className="py-3 pr-4 text-ink-500">{l.phone}</td>
                    <td className="py-3 pr-4">
                      <Badge tone="blue" className="capitalize">{l.source}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-ink-400">{l.createdAt.slice(0, 10)}</td>
                    <td className="py-3">
                      <Badge tone={l.status === "new" ? "orange" : "blue"} className="capitalize">{l.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length === 0 && <p className="py-8 text-center text-sm text-ink-400">All caught up — no pending leads.</p>}
        </Card>
      )}

      {tab === "expiring" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Memberships expiring within 7 days</h2>
            <Badge tone="orange">{expiring.length} to renew</Badge>
          </div>
          <div className="space-y-3">
            {expiring.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink-900 dark:text-ink-700">{m.name}</p>
                  <p className="text-sm text-ink-400">{m.planName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stop-500">Expires {m.endDate}</p>
                  <p className="text-xs text-ink-400">renewal window open</p>
                </div>
                <Badge tone={m.status === "active" ? "green" : "orange"} className="capitalize">{m.status}</Badge>
              </div>
            ))}
          </div>
          {expiring.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No memberships expiring this week.</p>}
        </Card>
      )}

      {tab === "tickets" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Support tickets</h2>
            <Badge tone="red">{tickets.length} open</Badge>
          </div>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-start gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink-900 dark:text-ink-700">{t.subject}</p>
                    <Badge tone={t.priority === "high" ? "red" : t.priority === "medium" ? "orange" : "gray"} className="capitalize">{t.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-400">{t.member} · {t.createdAt.slice(0, 10)}</p>
                </div>
                <Badge tone={t.status === "open" ? "red" : "blue"} className="capitalize">{t.status.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
          {tickets.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No open tickets. Smooth day!</p>}
        </Card>
      )}

      {tab === "stock" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Inventory below reorder level</h2>
            <Badge tone="gold">{lowStock.length} SKUs</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((s) => (
              <div key={s.id} className="rounded-xl border border-ink-100 p-4 dark:border-ink-100">
                <p className="font-bold text-ink-900 dark:text-ink-700">{s.name}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink-400">On hand</span>
                  <span className="font-bold text-stop-500">{s.quantity}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-400">Reorder level</span>
                  <span className="font-semibold text-ink-600">{s.reorderLevel}</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-500">
                  <Boxes className="size-3.5" /> Restock recommended
                </div>
              </div>
            ))}
          </div>
          {lowStock.length === 0 && <p className="py-8 text-center text-sm text-ink-400">All stock levels healthy.</p>}
        </Card>
      )}
    </div>
  );
}
