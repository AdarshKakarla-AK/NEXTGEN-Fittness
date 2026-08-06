"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarCheck, CircleDollarSign, Clock4,
  CreditCard, Flame, Percent, ReceiptText, RotateCcw, ShieldAlert, Ticket, TrendingUp, Users, Boxes,
} from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { DonutChart, TrendAreaChart, WorkoutBarsChart } from "@/components/portal/PortalCharts";
import { useToast } from "@/lib/client";
import { cn } from "@/lib/utils";

type Kpis = {
  activeMembers: number;
  totalMembers: number;
  mrr: number;
  thisMonthRevenue: number;
  thisYearRevenue: number;
  arpm: number;
  churn: number;
  retention: number;
  conversion: number;
  todaysCheckins: number;
  openTickets: number;
  newLeads30: number;
  lowStock: number;
};

type AdminProps = {
  name: string;
  kpis: Kpis;
  revenue: { label: string; revenue: number; count: number }[];
  growth: { label: string; joined: number; total: number }[];
  attendanceWeekday: { label: string; value: number }[];
  attendanceHour: { time: string; value: number }[];
  funnel: { status: string; value: number }[];
  leadSource: { source: string; value: number }[];
  planDist: { name: string; value: number }[];
  trainers: { id: string; name: string; specialization: string; rating: number; reviewCount: number; upcoming: number; completed: number; revenue: number; utilization: number }[];
  payments: { id: string; ref: string; description: string; amount: number; method: string; status: string; createdAt: string; member: string; invoiceNo?: string }[];
  recentAudit: { id: string; action: string; actor: string; meta?: string; createdAt: string }[];
};

function KpiCard({ icon, label, value, sub, delta, tone = "green" }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; delta?: number; tone?: "green" | "blue" | "gold" | "red" | "orange" }) {
  const tones = {
    green: "bg-volt-100 text-volt-700 dark:bg-volt-800/40 dark:text-volt-400",
    blue: "bg-accent-100 text-accent-700 dark:bg-accent-800/40 dark:text-accent-400",
    gold: "bg-gold-100 text-gold-700 dark:bg-gold-800/40 dark:text-gold-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex size-10 items-center justify-center rounded-xl", tones[tone])}>{icon}</span>
        {typeof delta === "number" && (
          <span className={cn("inline-flex items-center gap-1 text-xs font-bold", delta >= 0 ? "text-volt-600 dark:text-volt-400" : "text-stop-500")}>
            {delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-ink-900 dark:text-ink-700">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </Card>
  );
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function AdminDashboard({ name, kpis, revenue, growth, attendanceWeekday, attendanceHour, funnel, leadSource, planDist, trainers, payments, recentAudit }: AdminProps) {
  const [tab, setTab] = React.useState<"overview" | "operations" | "trainers" | "payments">("overview");
  const { push } = useToast();
  const [refunding, setRefunding] = React.useState<string | null>(null);

  const refund = async (id: string) => {
    if (!window.confirm("Refund this payment and cancel the linked membership?")) return;
    setRefunding(id);
    try {
      const res = await fetch("/api/payments/refund", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId: id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Refund failed");
      push("Payment refunded");
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      push(err instanceof Error ? err.message : "Refund failed", "error");
      setRefunding(null);
    }
  };

  const funnelColors: Record<string, string> = { new: "#3385ff", contacted: "#22c55e", interested: "#eab308", demo_booked: "#f97316", negotiation: "#a855f7", won: "#22c55e", lost: "#ef4444" };
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));
  const maxTrainerUtil = Math.max(1, ...trainers.map((t) => t.utilization));

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "operations" as const, label: "Operations" },
    { id: "trainers" as const, label: "Trainers" },
    { id: "payments" as const, label: "Payments" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-900">Welcome back, {name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-400">Live business overview — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
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

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            <KpiCard icon={<Users className="size-5" />} label="Active members" value={kpis.activeMembers} sub={`${kpis.totalMembers} total members`} tone="green" />
            <KpiCard icon={<CircleDollarSign className="size-5" />} label="Monthly recurring revenue" value={inr(kpis.mrr)} sub={`ARPM ${inr(kpis.arpm)}`} tone="blue" />
            <KpiCard icon={<TrendingUp className="size-5" />} label="Revenue this month" value={inr(kpis.thisMonthRevenue)} sub={`₹${(kpis.thisYearRevenue / 100000).toFixed(1)}L this year`} tone="gold" />
            <KpiCard icon={<Activity className="size-5" />} label="Check-ins today" value={kpis.todaysCheckins} sub="across all classes" tone="green" />
            <KpiCard icon={<CalendarCheck className="size-5" />} label="Lead conversion" value={`${kpis.conversion}%`} sub={`${kpis.newLeads30} leads in 30 days`} tone="blue" />
            <KpiCard icon={<RotateCcw className="size-5" />} label="Retention (6 mo)" value={`${kpis.retention}%`} sub="active / joined" tone="gold" />
            <KpiCard icon={<Percent className="size-5" />} label="Churn (3 mo)" value={`${kpis.churn}%`} sub="expired memberships" tone="red" />
            <KpiCard icon={<Ticket className="size-5" />} label="Open tickets" value={kpis.openTickets} sub="awaiting response" tone="red" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Revenue (12 months)</h2>
                <Badge tone="green">{revenue.reduce((s, r) => s + r.revenue, 0).toLocaleString("en-IN")} total</Badge>
              </div>
              <TrendAreaChart
                data={revenue.map((r) => ({ label: r.label, Revenue: r.revenue }))}
                series={[{ key: "Revenue", name: "Revenue (₹)", color: "#22c55e" }]}
              />
            </Card>
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Plan distribution</h2>
                <Badge tone="blue">{kpis.activeMembers} active</Badge>
              </div>
              <DonutChart data={planDist.map((p) => ({ label: p.name, value: p.value }))} />
              <div className="mt-3 space-y-1.5">
                {planDist.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">{p.name}</span>
                    <span className="font-bold text-ink-700">{p.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Member growth</h2>
                <Badge tone="blue">cumulative</Badge>
              </div>
              <TrendAreaChart
                data={growth.map((g) => ({ label: g.label, Joined: g.joined, Total: g.total }))}
                series={[
                  { key: "Joined", name: "New joins", color: "#3385ff" },
                  { key: "Total", name: "Total members", color: "#22c55e" },
                ]}
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Lead funnel</h2>
              <div className="space-y-2.5">
                {funnel.map((f) => (
                  <div key={f.status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="capitalize font-semibold text-ink-500">{f.status.replace("_", " ")}</span>
                      <span className="font-bold text-ink-700">{f.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(f.value / maxFunnel) * 100}%`, backgroundColor: funnelColors[f.status] }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Recent payments</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                    <th className="pb-2.5 pr-4 font-semibold">Ref</th>
                    <th className="pb-2.5 pr-4 font-semibold">Member</th>
                    <th className="pb-2.5 pr-4 font-semibold">Description</th>
                    <th className="pb-2.5 pr-4 font-semibold">Method</th>
                    <th className="pb-2.5 pr-4 font-semibold">Date</th>
                    <th className="pb-2.5 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-accent-600 dark:text-accent-400">{p.ref}</td>
                      <td className="py-3 pr-4 font-semibold text-ink-700">{p.member}</td>
                      <td className="py-3 pr-4 text-ink-500">{p.description}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={p.method === "upi" ? "green" : p.method === "card" ? "blue" : p.method === "demo" ? "gold" : "gray"} className="capitalize">{p.method}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-ink-400">{p.createdAt.slice(0, 10)}</td>
                      <td className="py-3 text-right font-bold text-ink-700">{inr(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "operations" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard icon={<Users className="size-5" />} label="Active members" value={kpis.activeMembers} tone="green" />
            <KpiCard icon={<Flame className="size-5" />} label="Check-ins today" value={kpis.todaysCheckins} tone="orange" />
            <KpiCard icon={<Ticket className="size-5" />} label="Open tickets" value={kpis.openTickets} tone="red" />
            <KpiCard icon={<Boxes className="size-5" />} label="Low stock SKUs" value={kpis.lowStock} tone="gold" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Attendance by weekday</h2>
              <WorkoutBarsChart data={attendanceWeekday.map((a) => ({ label: a.label, minutes: a.value, sessions: 0 }))} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Footfall by hour</h2>
              <WorkoutBarsChart data={attendanceHour.map((h) => ({ label: h.time, minutes: h.value, sessions: 0 }))} />
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Leads by source</h2>
              <DonutChart data={leadSource.map((l) => ({ label: l.source, value: l.value }))} />
              <div className="mt-3 space-y-1.5">
                {leadSource.map((l) => (
                  <div key={l.source} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-ink-500">{l.source}</span>
                    <span className="font-bold text-ink-700">{l.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Recent activity</h2>
                <Badge tone="gray">audit log</Badge>
              </div>
              <div className="space-y-3">
                {recentAudit.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-100">
                      <Activity className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-700">
                        {a.action.replaceAll("_", " ")}
                        {a.meta ? <span className="ml-1 font-normal text-ink-400">· {a.meta.length > 60 ? `${a.meta.slice(0, 60)}…` : a.meta}</span> : null}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">{a.actor} · {a.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "trainers" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard icon={<Activity className="size-5" />} label="Trainers" value={trainers.length} tone="blue" />
            <KpiCard icon={<CalendarCheck className="size-5" />} label="Upcoming sessions" value={trainers.reduce((s, t) => s + t.upcoming, 0)} tone="green" />
            <KpiCard icon={<ReceiptText className="size-5" />} label="Sessions completed" value={trainers.reduce((s, t) => s + t.completed, 0)} tone="gold" />
            <KpiCard icon={<CreditCard className="size-5" />} label="PT revenue" value={inr(trainers.reduce((s, t) => s + t.revenue, 0))} tone="green" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {trainers.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">{t.name}</h3>
                    <p className="text-sm text-ink-400">{t.specialization}</p>
                  </div>
                  <Badge tone="gold">★ {t.rating.toFixed(1)} · {t.reviewCount}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                    <p className="text-xl font-bold text-ink-900 dark:text-ink-700">{t.upcoming}</p>
                    <p className="text-xs text-ink-400">Upcoming</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                    <p className="text-xl font-bold text-ink-900 dark:text-ink-700">{t.completed}</p>
                    <p className="text-xs text-ink-400">Completed</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-100">
                    <p className="text-xl font-bold text-ink-900 dark:text-ink-700">{inr(t.revenue)}</p>
                    <p className="text-xs text-ink-400">Revenue</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                    <span className="text-ink-400">Utilization</span>
                    <span className="text-ink-700">{t.utilization}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-volt-500 to-accent-500" style={{ width: `${(t.utilization / maxTrainerUtil) * 100}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "payments" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard icon={<CreditCard className="size-5" />} label="Total revenue" value={inr(kpis.thisYearRevenue + kpis.thisMonthRevenue)} sub="lifetime (demo)" tone="gold" />
            <KpiCard icon={<Clock4 className="size-5" />} label="Avg revenue / member" value={inr(kpis.arpm)} tone="blue" />
            <KpiCard icon={<ShieldAlert className="size-5" />} label="MRR" value={inr(kpis.mrr)} tone="green" />
            <KpiCard icon={<Percent className="size-5" />} label="Lead conversion" value={`${kpis.conversion}%`} tone="green" />
          </div>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Payment ledger</h2>
              <Badge tone="green">{payments.length} recent</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                    <th className="pb-2.5 pr-4 font-semibold">Ref</th>
                    <th className="pb-2.5 pr-4 font-semibold">Member</th>
                    <th className="pb-2.5 pr-4 font-semibold">Invoice</th>
                    <th className="pb-2.5 pr-4 font-semibold">Description</th>
                    <th className="pb-2.5 pr-4 font-semibold">Method</th>
                    <th className="pb-2.5 pr-4 font-semibold">Status</th>
                    <th className="pb-2.5 pr-4 font-semibold">Date</th>
                    <th className="pb-2.5 text-right font-semibold">Amount</th>
                    <th className="pb-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-accent-600 dark:text-accent-400">{p.ref}</td>
                      <td className="py-3 pr-4 font-semibold text-ink-700">{p.member}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-ink-400">{p.invoiceNo ?? "—"}</td>
                      <td className="py-3 pr-4 text-ink-500">{p.description}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={p.method === "upi" ? "green" : p.method === "card" ? "blue" : p.method === "demo" ? "gold" : "gray"} className="capitalize">{p.method}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={p.status === "paid" ? "green" : p.status === "pending" ? "orange" : p.status === "refunded" ? "gray" : "red"} className="capitalize">{p.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-ink-400">{p.createdAt.slice(0, 10)}</td>
                      <td className="py-3 pr-4 text-right font-bold text-ink-700">{inr(p.amount)}</td>
                      <td className="py-3 text-right">
                        {p.status === "paid" && (
                          <button
                            onClick={() => refund(p.id)}
                            disabled={refunding === p.id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-stop-500 hover:underline disabled:opacity-50"
                          >
                            <RotateCcw className="size-3.5" /> {refunding === p.id ? "Refunding…" : "Refund"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-sm text-ink-400">
              Need member management, coupons or class scheduling?{" "}
              <Link href="/portal/admin/members" className="font-semibold text-accent-600 hover:underline dark:text-accent-400">Open full admin tools</Link>
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
