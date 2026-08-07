import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import {
  revenueByMonth, memberGrowth, attendanceByWeekday, attendanceByHour, leadFunnel, leadBySource,
  conversionRate, retentionRate, monthlyRecurringRevenue, activeMembersCount, revenueTotals,
  planDistribution, trainerUtilization, avgRevenuePerMember, churnRate,
} from "@/lib/analytics";
import { isoDaysFromNow } from "@/lib/utils";
import { AdminDashboard } from "@/components/portal/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/portal");

  const db = getDB();
  const members = db.users.filter((u) => u.role === "member");
  const activeMembers = activeMembersCount(db);
  const mrr = monthlyRecurringRevenue(db);
  const revenue = revenueTotals(db);
  const payments = db.payments
    .filter((p) => p.status !== "pending")
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);
  const userById = Object.fromEntries(db.users.map((u) => [u.id, u]));

  const today = new Date().toISOString().slice(0, 10);
  const todaysCheckins = db.attendance.filter((a) => a.date === today).length;
  const openTickets = db.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const newLeads30 = db.leads.filter((l) => l.createdAt.slice(0, 10) >= isoDaysFromNow(-30)).length;
  const lowStock = db.inventory.filter((i) => i.stock <= i.lowStockThreshold).length;

  const expenses = db.expenses
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((e) => ({ id: e.id, category: e.category, description: e.description, amount: e.amount, date: e.date }));
  const monthlyExpenses = expenses
    .filter((e) => e.date.slice(0, 7) === today.slice(0, 7))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <AdminDashboard
      name={user.name}
      kpis={{
        activeMembers,
        mrr,
        thisMonthRevenue: revenue.thisMonth,
        thisYearRevenue: revenue.thisYear,
        arpm: avgRevenuePerMember(db),
        churn: churnRate(db),
        retention: retentionRate(db),
        conversion: conversionRate(db),
        todaysCheckins,
        openTickets,
        newLeads30,
        lowStock,
        totalMembers: members.length,
      }}
      revenue={revenueByMonth(db)}
      growth={memberGrowth(db)}
      attendanceWeekday={attendanceByWeekday(db)}
      attendanceHour={attendanceByHour(db)}
      funnel={leadFunnel(db)}
      leadSource={leadBySource(db)}
      planDist={planDistribution(db)}
      trainers={trainerUtilization(db)}
      payments={payments.map((p) => ({
        id: p.id,
        ref: p.ref,
        description: p.description,
        amount: p.paidAmount,
        method: p.method,
        status: p.status,
        createdAt: p.createdAt,
        member: p.memberId ? userById[p.memberId]?.name ?? "—" : "Guest",
        invoiceNo: p.invoiceNo,
      }))}
      recentAudit={db.auditLogs.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8).map((l) => ({ id: l.id, action: l.action, actor: l.actorName ?? l.actorId, meta: l.meta, createdAt: l.createdAt }))}
      equipment={db.equipment.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        status: e.status,
        usageHours: e.usageHours,
        lastMaintenance: e.lastMaintenance ?? null,
        nextMaintenance: e.nextMaintenance ?? null,
        warrantyExpiry: e.warrantyExpiry ?? null,
        amcProvider: e.amcProvider ?? null,
        notes: e.notes ?? null,
      }))}
      expenses={expenses}
      monthlyExpenses={monthlyExpenses}
    />
  );
}
