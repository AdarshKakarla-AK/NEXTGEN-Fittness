"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarCheck, CircleDollarSign, Clock4,
  CreditCard, Flame, Percent, ReceiptText, RotateCcw, ShieldAlert, Ticket, TrendingUp, Users, Boxes,
  Wrench, Wallet, Plus, Banknote,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { DonutChart, TrendAreaChart, WorkoutBarsChart } from "@/components/portal/PortalCharts";
import { useToast } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { EquipmentStatus, ExpenseCategory } from "@/lib/db/types";

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
  trainers: { id: string; name: string; specialization: string; rating: number; reviewCount: number; upcoming: number; completed: number; revenue: number; utilization: number; specializations: string[]; languages: string[]; bio: string; phone: string; email: string; hourlyRate: number; yearsExp: number; active: boolean }[];
  payments: { id: string; ref: string; description: string; amount: number; method: string; status: string; createdAt: string; member: string; invoiceNo?: string }[];
  recentAudit: { id: string; action: string; actor: string; meta?: string; createdAt: string }[];
  equipment: { id: string; name: string; category: string; status: EquipmentStatus; usageHours: number; lastMaintenance: string | null; nextMaintenance: string | null; warrantyExpiry: string | null; amcProvider: string | null; notes: string | null }[];
  expenses: { id: string; category: string; description: string; amount: number; date: string }[];
  monthlyExpenses: number;
  dailyReminder: { enabled: boolean; time: string; message: string; lastSentAt: string | null; memberCount: number };
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

function RemindersPanel({ initialDaily }: { initialDaily: AdminProps["dailyReminder"] }) {
  const [bookings, setBookings] = React.useState<{ id: string; ref: string; member: string; phone: string; type: string; time: string; class: string; reminded: boolean }[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [daily, setDaily] = React.useState(initialDaily);
  const [dailyForm, setDailyForm] = React.useState({ enabled: initialDaily.enabled, time: initialDaily.time, message: initialDaily.message });
  const [savingDaily, setSavingDaily] = React.useState(false);
  const [sendingDaily, setSendingDaily] = React.useState(false);

  const applyDaily = (d: { enabled?: boolean; time?: string; message?: string; lastSentAt?: string | null; memberCount?: number }) => {
    setDaily({ enabled: !!d.enabled, time: d.time ?? "09:00", message: d.message ?? "", lastSentAt: d.lastSentAt ?? null, memberCount: d.memberCount ?? 0 });
    setDailyForm({ enabled: !!d.enabled, time: d.time ?? "09:00", message: d.message ?? "" });
  };

  const load = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reminders");
      if (res.ok) {
        const d = await res.json();
        setBookings(d.bookings ?? []);
      }
    } finally {
      setBusy(false);
      setLoaded(true);
    }
  };

  const loadDaily = async () => {
    const res = await fetch("/api/admin/daily-reminders");
    if (res.ok) applyDaily(await res.json());
  };

  React.useEffect(() => {
    let active = true;
    (async () => {
      const [bookRes, dailyRes] = await Promise.all([fetch("/api/admin/reminders"), fetch("/api/admin/daily-reminders")]);
      if (!active) return;
      if (bookRes.ok) {
        const d = await bookRes.json();
        setBookings(d.bookings ?? []);
      }
      if (dailyRes.ok) applyDaily(await dailyRes.json());
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const send = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/admin/reminders", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      await load();
      alert(`Reminders sent to ${d.sent} member(s) via WhatsApp.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send reminders");
    } finally {
      setSending(false);
    }
  };

  const saveDaily = async () => {
    setSavingDaily(true);
    try {
      const res = await fetch("/api/admin/daily-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "settings", ...dailyForm }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not save.");
      await loadDaily();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setSavingDaily(false);
    }
  };

  const sendDaily = async () => {
    setSendingDaily(true);
    try {
      const res = await fetch("/api/admin/daily-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setDaily((prev) => ({ ...prev, lastSentAt: new Date().toISOString() }));
      alert(`Daily reminder sent to ${d.sent} member(s) via WhatsApp.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSendingDaily(false);
    }
  };

  return (
    <>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Class reminders — tomorrow</h2>
            <p className="mt-0.5 text-sm text-ink-400">WhatsApp nudges for tomorrow&apos;s bookings. Sent once per booking.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={busy} className="rounded-lg border border-ink-100 px-3 py-1.5 text-xs font-bold text-ink-500 transition hover:bg-ink-100 dark:border-ink-100">
              {busy ? "Loading…" : "Refresh"}
            </button>
            <Button onClick={send} disabled={sending || busy || bookings.filter((b) => !b.reminded).length === 0}>
              {sending ? "Sending…" : `Send ${bookings.filter((b) => !b.reminded).length} reminder(s)`}
            </Button>
          </div>
        </div>
        {loaded && bookings.length === 0 && (
          <p className="mt-4 rounded-xl bg-ink-50 p-4 text-center text-sm text-ink-400 dark:bg-ink-100">No bookings scheduled for tomorrow.</p>
        )}
        {bookings.length > 0 && (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((b) => (
              <div key={b.id} className={cn("rounded-xl border p-3.5", b.reminded ? "border-ink-100 bg-ink-50/60 dark:border-ink-100 dark:bg-ink-100" : "border-ink-100 dark:border-ink-100")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-ink-900 dark:text-ink-700">{b.member}</p>
                  <Badge tone={b.reminded ? "green" : "orange"}>{b.reminded ? "Reminded" : "Pending"}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-400">{b.class} · {b.time} · {b.ref}</p>
                <p className="mt-1 text-xs text-ink-400">{b.phone}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Daily WhatsApp reminder — all clients</h2>
            <p className="mt-0.5 text-sm text-ink-400">Automated nudge sent to every active member via WhatsApp, once a day.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void loadDaily()} disabled={savingDaily} className="rounded-lg border border-ink-100 px-3 py-1.5 text-xs font-bold text-ink-500 transition hover:bg-ink-100 dark:border-ink-100">
              Refresh
            </button>
            <Button onClick={() => void sendDaily()} disabled={sendingDaily || !daily.enabled}>{sendingDaily ? "Sending…" : "Send now"}</Button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void saveDaily(); }} className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-paper p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-ink-100">
          <label className="flex items-center gap-2 self-end rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm font-semibold text-ink-700">
            <input type="checkbox" checked={dailyForm.enabled} onChange={(e) => setDailyForm((f) => ({ ...f, enabled: e.target.checked }))} className="size-4 accent-volt-500" />
            Automation on
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-ink-500">Send time</span>
            <input type="time" value={dailyForm.time} onChange={(e) => setDailyForm((f) => ({ ...f, time: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-ink-500">Message</span>
            <textarea value={dailyForm.message} onChange={(e) => setDailyForm((f) => ({ ...f, message: e.target.value }))} rows={2} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={savingDaily}>{savingDaily ? "Saving…" : "Save settings"}</Button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-ink-400">
          <span>Recipients: <b className="text-ink-700">{daily.memberCount} active members</b></span>
          <span>Status: <b className={cn(daily.enabled ? "text-volt-600 dark:text-volt-400" : "text-ink-500")}>{daily.enabled ? `Automation ON — fires daily at ${daily.time}` : "Automation OFF"}</b></span>
          <span>Last sent: <b className="text-ink-700">{daily.lastSentAt ? new Date(daily.lastSentAt).toLocaleString("en-IN") : "Never"}</b></span>
        </div>
      </Card>
    </>
  );
}

const EQUIP_STATUSES: EquipmentStatus[] = ["operational", "maintenance", "repair", "out_of_service"];

type EquipmentRow = AdminProps["equipment"][number];

function EquipmentPanel({ initialEquipment }: { initialEquipment: EquipmentRow[] }) {
  const [items, setItems] = React.useState<EquipmentRow[]>(initialEquipment);
  const [busy, setBusy] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", category: "Strength", status: "operational" as EquipmentStatus, usageHours: "", amcProvider: "", notes: "" });

  const load = async () => {
    const res = await fetch("/api/admin/equipment");
    if (res.ok) {
      const d = await res.json();
      setItems(d.equipment ?? []);
    }
  };

  const setStatus = async (id: string, status: EquipmentStatus) => {
    await fetch("/api/admin/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id, status }),
    });
    void load();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...form, usageHours: Number(form.usageHours) || 0 }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Could not add equipment.");
      }
      setForm({ name: "", category: "Strength", status: "operational", usageHours: "", amcProvider: "", notes: "" });
      setAdding(false);
      void load();
    } finally {
      setBusy(false);
    }
  };

  const attention = items.filter((i) => i.status !== "operational").length;
  const needsService = items.filter((i) => i.nextMaintenance && i.nextMaintenance <= new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={<Wrench className="size-5" />} label="Total equipment" value={items.length} tone="blue" />
        <KpiCard icon={<Activity className="size-5" />} label="Operational" value={items.filter((i) => i.status === "operational").length} tone="green" />
        <KpiCard icon={<ShieldAlert className="size-5" />} label="Needs attention" value={attention} tone="orange" />
        <KpiCard icon={<Clock4 className="size-5" />} label="Service due" value={needsService} tone="red" />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Equipment list</h2>
            <p className="mt-0.5 text-sm text-ink-400">Status, usage hours and maintenance schedule across the club.</p>
          </div>
          <Button onClick={() => setAdding((v) => !v)} disabled={busy}>
            <Plus className="size-4" /> {adding ? "Cancel" : "Add equipment"}
          </Button>
        </div>

        {adding && (
          <form onSubmit={add} className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-paper p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-ink-100">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-500">Name</span>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Treadmill — Matrix T75" className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Category</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500">
                {["Strength", "Cardio", "Boxing", "Functional", "Recovery"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Status</span>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EquipmentStatus }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500">
                {EQUIP_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Usage hours</span>
              <input type="number" min={0} value={form.usageHours} onChange={(e) => setForm((f) => ({ ...f, usageHours: e.target.value }))} placeholder="0" className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">AMC provider (optional)</span>
              <input value={form.amcProvider} onChange={(e) => setForm((f) => ({ ...f, amcProvider: e.target.value }))} placeholder="e.g. Matrix AMC" className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <label className="lg:col-span-3">
              <span className="mb-1 block text-xs font-semibold text-ink-500">Notes (optional)</span>
              <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Condition, serial, location…" className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save equipment"}</Button>
            </div>
          </form>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                <th className="pb-2.5 pr-4 font-semibold">Equipment</th>
                <th className="pb-2.5 pr-4 font-semibold">Category</th>
                <th className="pb-2.5 pr-4 font-semibold">Status</th>
                <th className="pb-2.5 pr-4 font-semibold">Usage</th>
                <th className="pb-2.5 pr-4 font-semibold">Last service</th>
                <th className="pb-2.5 pr-4 font-semibold">Next service</th>
                <th className="pb-2.5 font-semibold">AMC</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-ink-700">{item.name}</p>
                    {item.notes && <p className="text-xs text-ink-400">{item.notes}</p>}
                  </td>
                  <td className="py-3 pr-4"><Badge tone="gray">{item.category}</Badge></td>
                  <td className="py-3 pr-4">
                    <select
                      value={item.status}
                      onChange={(e) => setStatus(item.id, e.target.value as EquipmentStatus)}
                      className={cn("rounded-lg border px-2 py-1.5 text-xs font-bold capitalize outline-none", item.status === "operational" ? "border-volt-500/30 bg-volt-500/10 text-volt-700 dark:text-volt-400" : item.status === "maintenance" ? "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400" : item.status === "repair" ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" : "border-ink-200 bg-ink-50 text-ink-400")}
                    >
                      {EQUIP_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-4 text-ink-500">{item.usageHours.toLocaleString()} h</td>
                  <td className="py-3 pr-4 text-ink-400">{item.lastMaintenance ? item.lastMaintenance.slice(5) : "—"}</td>
                  <td className={cn("py-3 pr-4", item.nextMaintenance && item.nextMaintenance <= new Date().toISOString().slice(0, 10) ? "font-bold text-stop-500" : "text-ink-400")}>
                    {item.nextMaintenance ? item.nextMaintenance.slice(5) : "—"}
                  </td>
                  <td className="py-3 text-ink-400">{item.amcProvider ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="py-8 text-center text-sm text-ink-400">Loading equipment…</p>}
        </div>
      </Card>
    </div>
  );
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "rent", label: "Rent" },
  { value: "salaries", label: "Salaries" },
  { value: "utilities", label: "Utilities" },
  { value: "equipment", label: "Equipment" },
  { value: "marketing", label: "Marketing" },
  { value: "supplements", label: "Supplements" },
  { value: "misc", label: "Other" },
];

function FinancePanel({ monthlyRevenue, initialExpenses, initialMonthlyExpenses }: { monthlyRevenue: number; initialExpenses: AdminProps["expenses"]; initialMonthlyExpenses: number }) {
  const [expenses, setExpenses] = React.useState(initialExpenses);
  const [monthly, setMonthly] = React.useState(initialMonthlyExpenses);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({ description: "", category: "misc" as ExpenseCategory, amount: "", date: "" });
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ description: "", category: "misc" as ExpenseCategory, amount: "", date: "" });
  const [savingEdit, setSavingEdit] = React.useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/expenses");
    if (res.ok) {
      const d = await res.json();
      setExpenses(d.expenses ?? []);
      setMonthly(d.monthlyTotal ?? 0);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) || 0 }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Could not add the expense.");
      }
      setForm({ description: "", category: "misc", amount: "", date: "" });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (e: (typeof expenses)[number]) => {
    setEditForm({ description: e.description, category: e.category as ExpenseCategory, amount: String(e.amount), date: e.date });
    setEditId(e.id);
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: editId, ...editForm, amount: Number(editForm.amount) || 0 }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not save the expense.");
      setEditId(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save the expense.");
    } finally {
      setSavingEdit(false);
    }
  };

  const month = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const monthlyRows = expenses.filter((e) => e.date.slice(0, 7) === month);
  const net = monthlyRevenue - monthly;
  const margin = monthlyRevenue > 0 ? (net / monthlyRevenue) * 100 : 0;
  const catTotals = EXPENSE_CATEGORIES.map(({ value, label }) => ({
    label,
    total: monthlyRows.filter((e) => e.category === value).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);
  const maxCat = Math.max(1, ...catTotals.map((c) => c.total));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard icon={<TrendingUp className="size-5" />} label={`Revenue · ${monthLabel}`} value={inr(monthlyRevenue)} tone="green" />
        <KpiCard icon={<Wallet className="size-5" />} label={`Expenses · ${monthLabel}`} value={inr(monthly)} tone="red" />
        <KpiCard icon={<Banknote className="size-5" />} label="Net profit" value={inr(net)} tone={net >= 0 ? "blue" : "red"} />
        <KpiCard icon={<Percent className="size-5" />} label="Profit margin" value={`${margin.toFixed(1)}%`} tone={margin >= 0 ? "gold" : "red"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Expense breakdown — {monthLabel}</h2>
            <Badge tone="red">{inr(monthly)}</Badge>
          </div>
          <div className="space-y-3">
            {catTotals.length === 0 && <p className="text-sm text-ink-400">No expenses recorded this month yet.</p>}
            {catTotals.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold capitalize text-ink-500">{c.label}</span>
                  <span className="font-bold text-ink-700">{inr(c.total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-500" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-ink-900">Add expense</h2>
          <form onSubmit={add} className="space-y-3">
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Description</span>
              <input required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Electricity bill" className="w-full rounded-lg border border-ink-200 bg-paper px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Category</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))} className="w-full rounded-lg border border-ink-200 bg-paper px-3 py-2 text-sm outline-none focus:border-volt-500">
                {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Amount (₹)</span>
              <input required type="number" min={1} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 25000" className="w-full rounded-lg border border-ink-200 bg-paper px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-500">Date</span>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-paper px-3 py-2 text-sm outline-none focus:border-volt-500" />
            </label>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Add expense"}</Button>
          </form>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">This month&apos;s expenses</h2>
          <Badge tone="gray">{monthlyRows.length} entries</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
                <th className="pb-2.5 pr-4 font-semibold">Date</th>
                <th className="pb-2.5 pr-4 font-semibold">Description</th>
                <th className="pb-2.5 pr-4 font-semibold">Category</th>
                <th className="pb-2.5 pr-4 text-right font-semibold">Amount</th>
                <th className="pb-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((e) =>
                editId === e.id ? (
                  <tr key={e.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                    <td className="py-3 pr-4">
                      <input type="date" value={editForm.date} onChange={(ev) => setEditForm((f) => ({ ...f, date: ev.target.value }))} className="w-full rounded-lg border border-ink-200 bg-paper px-2 py-1.5 text-sm outline-none focus:border-volt-500" />
                    </td>
                    <td className="py-3 pr-4">
                      <input value={editForm.description} onChange={(ev) => setEditForm((f) => ({ ...f, description: ev.target.value }))} className="w-full rounded-lg border border-ink-200 bg-paper px-2 py-1.5 text-sm outline-none focus:border-volt-500" />
                    </td>
                    <td className="py-3 pr-4">
                      <select value={editForm.category} onChange={(ev) => setEditForm((f) => ({ ...f, category: ev.target.value as ExpenseCategory }))} className="w-full rounded-lg border border-ink-200 bg-paper px-2 py-1.5 text-sm outline-none focus:border-volt-500">
                        {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <input type="number" min={1} value={editForm.amount} onChange={(ev) => setEditForm((f) => ({ ...f, amount: ev.target.value }))} className="w-full rounded-lg border border-ink-200 bg-paper px-2 py-1.5 text-right text-sm outline-none focus:border-volt-500" />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => void saveEdit()} disabled={savingEdit} className="inline-flex items-center gap-1 text-xs font-bold text-volt-600 hover:underline disabled:opacity-50 dark:text-volt-400">
                          {savingEdit ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setEditId(null)} className="text-xs font-bold text-ink-400 hover:underline">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={e.id} className="border-b border-ink-100 last:border-0 dark:border-ink-100">
                    <td className="py-3 pr-4 text-ink-400">{e.date.slice(5)}</td>
                    <td className="py-3 pr-4 font-semibold text-ink-700">{e.description}</td>
                    <td className="py-3 pr-4"><Badge tone="gray" className="capitalize">{e.category}</Badge></td>
                    <td className="py-3 pr-4 text-right font-bold text-ink-700">{inr(e.amount)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => startEdit(e)} className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 hover:underline dark:text-accent-400">
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              )}
              {monthlyRows.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-ink-400">No expenses added for this month.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminDashboard({ name, kpis, revenue, growth, attendanceWeekday, attendanceHour, funnel, leadSource, planDist, trainers, payments, recentAudit, equipment, expenses, monthlyExpenses, dailyReminder }: AdminProps) {
  const [tab, setTab] = React.useState<"overview" | "operations" | "trainers" | "payments" | "equipment" | "finance">("overview");
  const { push } = useToast();
  const [refunding, setRefunding] = React.useState<string | null>(null);
  const [trainerList, setTrainerList] = React.useState(trainers);
  const [editTrainerId, setEditTrainerId] = React.useState<string | null>(null);
  const [savingTrainer, setSavingTrainer] = React.useState(false);
  const [trainerDraft, setTrainerDraft] = React.useState({
    name: "", phone: "", email: "", specialization: "", languages: "", hourlyRate: "", yearsExp: "", rating: "", reviewCount: "", bio: "", active: true,
  });

  const startEditTrainer = (t: AdminProps["trainers"][number]) => {
    setTrainerDraft({
      name: t.name, phone: t.phone, email: t.email,
      specialization: t.specializations.join(", "), languages: t.languages.join(", "),
      hourlyRate: String(t.hourlyRate), yearsExp: String(t.yearsExp), rating: String(t.rating), reviewCount: String(t.reviewCount),
      bio: t.bio, active: t.active,
    });
    setEditTrainerId(t.id);
  };

  const saveTrainer = async (id: string) => {
    setSavingTrainer(true);
    try {
      const specializations = trainerDraft.specialization.split(",").map((s) => s.trim()).filter(Boolean);
      const languages = trainerDraft.languages.split(",").map((s) => s.trim()).filter(Boolean);
      const hourlyRate = Number(trainerDraft.hourlyRate) || 0;
      const yearsExp = Number(trainerDraft.yearsExp) || 0;
      const rating = Number(trainerDraft.rating) || 0;
      const reviewCount = Number(trainerDraft.reviewCount) || 0;
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update", id,
          name: trainerDraft.name, phone: trainerDraft.phone, email: trainerDraft.email,
          specializations, languages, hourlyRate, yearsExp, rating, reviewCount,
          bio: trainerDraft.bio, active: trainerDraft.active,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not update the trainer.");
      setTrainerList((prev) => prev.map((t) =>
        t.id === id
          ? { ...t, name: trainerDraft.name, phone: trainerDraft.phone, email: trainerDraft.email, specialization: specializations[0] ?? "General", specializations, languages, hourlyRate, yearsExp, rating, reviewCount, active: trainerDraft.active, bio: trainerDraft.bio }
          : t
      ));
      setEditTrainerId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update the trainer.");
    } finally {
      setSavingTrainer(false);
    }
  };

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
  const maxTrainerUtil = Math.max(1, ...trainerList.map((t) => t.utilization));

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "operations" as const, label: "Operations" },
    { id: "trainers" as const, label: "Trainers" },
    { id: "payments" as const, label: "Payments" },
    { id: "equipment" as const, label: "Equipment" },
    { id: "finance" as const, label: "Finance" },
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

          <RemindersPanel initialDaily={dailyReminder} />

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
            <KpiCard icon={<Activity className="size-5" />} label="Trainers" value={trainerList.length} tone="blue" />
            <KpiCard icon={<CalendarCheck className="size-5" />} label="Upcoming sessions" value={trainerList.reduce((s, t) => s + t.upcoming, 0)} tone="green" />
            <KpiCard icon={<ReceiptText className="size-5" />} label="Sessions completed" value={trainerList.reduce((s, t) => s + t.completed, 0)} tone="gold" />
            <KpiCard icon={<CreditCard className="size-5" />} label="PT revenue" value={inr(trainerList.reduce((s, t) => s + t.revenue, 0))} tone="green" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {trainerList.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">{t.name}</h3>
                      {!t.active && <Badge tone="gray">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-ink-400">{t.specialization}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone="gold">★ {t.rating.toFixed(1)} · {t.reviewCount}</Badge>
                    <button onClick={() => startEditTrainer(t)} disabled={savingTrainer && editTrainerId === t.id} className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 hover:underline disabled:opacity-50 dark:text-accent-400">
                      Edit
                    </button>
                  </div>
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

                {editTrainerId === t.id && (
                  <form
                    onSubmit={(e) => { e.preventDefault(); void saveTrainer(t.id); }}
                    className="mt-4 grid gap-3 rounded-2xl border border-volt-500/30 bg-paper p-4 sm:grid-cols-2 dark:border-volt-500/30"
                  >
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Full name</span>
                      <input required value={trainerDraft.name} onChange={(e) => setTrainerDraft((d) => ({ ...d, name: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Phone</span>
                      <input required value={trainerDraft.phone} onChange={(e) => setTrainerDraft((d) => ({ ...d, phone: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Email</span>
                      <input type="email" value={trainerDraft.email} onChange={(e) => setTrainerDraft((d) => ({ ...d, email: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Hourly rate (₹)</span>
                      <input type="number" min={0} value={trainerDraft.hourlyRate} onChange={(e) => setTrainerDraft((d) => ({ ...d, hourlyRate: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Years experience</span>
                      <input type="number" min={0} value={trainerDraft.yearsExp} onChange={(e) => setTrainerDraft((d) => ({ ...d, yearsExp: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Rating (0–5)</span>
                      <input type="number" step="0.1" min={0} max={5} value={trainerDraft.rating} onChange={(e) => setTrainerDraft((d) => ({ ...d, rating: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Review count</span>
                      <input type="number" min={0} value={trainerDraft.reviewCount} onChange={(e) => setTrainerDraft((d) => ({ ...d, reviewCount: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Status</span>
                      <select value={trainerDraft.active ? "active" : "inactive"} onChange={(e) => setTrainerDraft((d) => ({ ...d, active: e.target.value === "active" }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Specializations (comma separated)</span>
                      <input value={trainerDraft.specialization} onChange={(e) => setTrainerDraft((d) => ({ ...d, specialization: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Languages (comma separated)</span>
                      <input value={trainerDraft.languages} onChange={(e) => setTrainerDraft((d) => ({ ...d, languages: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-ink-500">Bio</span>
                      <textarea rows={2} value={trainerDraft.bio} onChange={(e) => setTrainerDraft((d) => ({ ...d, bio: e.target.value }))} className="w-full rounded-lg border border-ink-200 bg-card px-3 py-2 text-sm outline-none focus:border-volt-500" />
                    </label>
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="submit" disabled={savingTrainer}>{savingTrainer ? "Saving…" : "Save changes"}</Button>
                      <button type="button" onClick={() => setEditTrainerId(null)} className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-bold text-ink-500 transition hover:bg-ink-100 dark:border-ink-100">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
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

      {tab === "equipment" && <EquipmentPanel initialEquipment={equipment} />}

      {tab === "finance" && (
        <FinancePanel monthlyRevenue={kpis.thisMonthRevenue} initialExpenses={expenses} initialMonthlyExpenses={monthlyExpenses} />
      )}
    </div>
  );
}
