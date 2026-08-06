import "server-only";
import type { DB } from "./db/types";

export function monthKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthsRange(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

export function revenueByMonth(db: DB, count = 12) {
  const months = monthsRange(count);
  const paid = db.payments.filter((p) => p.status === "paid");
  const map = new Map<string, { revenue: number; count: number }>();
  months.forEach((m) => map.set(m, { revenue: 0, count: 0 }));
  paid.forEach((p) => {
    const k = monthKey(p.createdAt);
    if (!map.has(k)) return;
    const cur = map.get(k)!;
    cur.revenue += p.paidAmount;
    cur.count += 1;
  });
  return months.map((m) => ({ month: m, label: new Date(m + "-01").toLocaleDateString("en-IN", { month: "short" }), ...map.get(m)! }));
}

export function memberGrowth(db: DB, count = 12) {
  const months = monthsRange(count);
  const users = db.users.filter((u) => u.role === "member");
  const map = new Map<string, { joined: number }>();
  months.forEach((m) => map.set(m, { joined: 0 }));
  users.forEach((u) => {
    const k = monthKey(u.createdAt);
    if (!map.has(k)) return;
    map.get(k)!.joined += 1;
  });
  let cumulative = 0;
  return months.map((m) => {
    cumulative += map.get(m)!.joined;
    return { month: m, label: new Date(m + "-01").toLocaleDateString("en-IN", { month: "short" }), joined: map.get(m)!.joined, total: cumulative };
  });
}

export function attendanceByWeekday(db: DB) {
  const days = [0, 0, 0, 0, 0, 0, 0];
  db.attendance.forEach((a) => {
    const d = new Date(`${a.date}T10:00:00`);
    const idx = d.getDay();
    days[idx === 0 ? 6 : idx - 1] += 1; // Monday-first
  });
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({ label, value: days[i] }));
}

export function attendanceByHour(db: DB) {
  const buckets: Record<string, number> = {};
  db.attendance.forEach((a) => {
    const h = new Date(a.checkIn).getHours();
    const k = `${String(h).padStart(2, "0")}:00`;
    buckets[k] = (buckets[k] ?? 0) + 1;
  });
  return Object.entries(buckets)
    .map(([time, value]) => ({ time, value }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function leadFunnel(db: DB) {
  const statuses: (keyof typeof counts)[] = ["new", "contacted", "interested", "demo_booked", "negotiation", "won", "lost"];
  const counts: Record<string, number> = { new: 0, contacted: 0, interested: 0, demo_booked: 0, negotiation: 0, won: 0, lost: 0 };
  db.leads.forEach((l) => {
    if (counts[l.status] !== undefined) counts[l.status] += 1;
  });
  return statuses.map((s) => ({ status: s, value: counts[s] }));
}

export function leadBySource(db: DB) {
  const map: Record<string, number> = {};
  db.leads.forEach((l) => {
    map[l.source] = (map[l.source] ?? 0) + 1;
  });
  return Object.entries(map).map(([source, value]) => ({ source, value }));
}

export function conversionRate(db: DB) {
  const won = db.leads.filter((l) => l.status === "won").length;
  return db.leads.length ? Math.round((won / db.leads.length) * 1000) / 10 : 0;
}

export function retentionRate(db: DB, months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const joined = db.users.filter((u) => u.role === "member" && new Date(u.createdAt) < since).length;
  if (!joined) return 0;
  const active = db.memberships.filter((m) => m.status === "active").length;
  return Math.round((active / joined) * 100);
}

export function monthlyRecurringRevenue(db: DB) {
  return db.memberships.filter((m) => m.status === "active").reduce((sum, m) => sum + m.price, 0);
}

export function activeMembersCount(db: DB) {
  return db.memberships.filter((m) => m.status === "active").length;
}

export function revenueTotals(db: DB) {
  const paid = db.payments.filter((p) => p.status === "paid");
  const total = paid.reduce((s, p) => s + p.paidAmount, 0);
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const thisYear = paid.filter((p) => p.createdAt >= yearStart).reduce((s, p) => s + p.paidAmount, 0);
  const monthStart = `${new Date().toISOString().slice(0, 7)}-01`;
  const thisMonth = paid.filter((p) => p.createdAt >= monthStart).reduce((s, p) => s + p.paidAmount, 0);
  return { total, thisYear, thisMonth };
}

export function planDistribution(db: DB) {
  const map: Record<string, number> = {};
  db.memberships.filter((m) => m.status === "active").forEach((m) => {
    map[m.planName] = (map[m.planName] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function trainerUtilization(db: DB) {
  return db.users
    .filter((u) => u.role === "trainer")
    .map((t) => {
      const bookings = db.bookings.filter((b) => b.trainerId === t.id && b.status !== "cancelled");
      const upcoming = bookings.filter((b) => b.status === "upcoming").length;
      const completed = bookings.filter((b) => b.status === "completed").length;
      const revenue = bookings
        .filter((b) => b.status === "completed")
        .reduce((s, b) => s + b.price, 0);
      return {
        id: t.id,
        name: t.name,
        specialization: t.specialization?.[0] ?? "General",
        rating: t.rating ?? 0,
        reviewCount: t.reviewCount ?? 0,
        upcoming,
        completed,
        revenue,
        utilization: Math.min(100, Math.round(((upcoming + completed) / 40) * 100)),
      };
    });
}

export function avgRevenuePerMember(db: DB) {
  const active = activeMembersCount(db);
  return active ? Math.round(monthlyRecurringRevenue(db) / active) : 0;
}

export function churnRate(db: DB, months = 3) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const expiredInWindow = db.memberships.filter((m) => m.status === "expired" && new Date(m.updatedAt) > since).length;
  const totalMembers = db.users.filter((u) => u.role === "member").length;
  return totalMembers ? Math.round((expiredInWindow / totalMembers) * 100) : 0;
}
