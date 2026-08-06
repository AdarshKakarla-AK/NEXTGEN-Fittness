import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import { isoDaysFromNow } from "@/lib/utils";
import { ReceptionistDashboard } from "@/components/portal/ReceptionistDashboard";

export const dynamic = "force-dynamic";

export default async function ReceptionistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "receptionist") redirect("/portal");

  const db = getDB();
  const today = new Date().toISOString().slice(0, 10);
  const userById = Object.fromEntries(db.users.map((u) => [u.id, u]));
  const todayById = new Map<string, number>();

  const todaysAttendance = db.attendance
    .filter((a) => a.date === today)
    .sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1))
    .map((a) => {
      todayById.set(a.memberId, (todayById.get(a.memberId) ?? 0) + 1);
      const m = userById[a.memberId];
      return { id: a.id, memberId: a.memberId, name: m?.name ?? "Member", checkIn: a.checkIn, method: a.method, workoutMinutes: a.workoutMinutes ?? 0, membershipStatus: db.memberships.find((mm) => mm.memberId === a.memberId)?.status };
    });

  const leads = db.leads
    .filter((l) => l.status === "new" || l.status === "contacted")
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 8)
    .map((l) => ({ id: l.id, name: l.name, phone: l.phone, source: l.source, status: l.status, createdAt: l.createdAt }));

  const memberships = db.memberships.filter((m) => m.status === "active");
  const expiring = memberships
    .filter((m) => m.endDate <= isoDaysFromNow(7))
    .slice()
    .sort((a, b) => (a.endDate < b.endDate ? 1 : -1))
    .slice(0, 8)
    .map((m) => ({ id: m.id, memberId: m.memberId, name: userById[m.memberId]?.name ?? "Member", planName: m.planName, endDate: m.endDate, status: m.status }));

  const upcomingToday = db.bookings
    .filter((b) => b.date === today && (b.status === "upcoming" || b.status === "confirmed"))
    .slice()
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 8)
    .map((b) => ({ id: b.id, ref: b.ref, member: userById[b.memberId]?.name ?? "Member", type: b.type, time: b.time, durationMin: b.durationMin, status: b.status }));

  const tickets = db.tickets
    .filter((t) => t.status === "open" || t.status === "in_progress")
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6)
    .map((t) => ({ id: t.id, subject: t.subject, priority: t.priority, status: t.status, member: (t.memberId && userById[t.memberId]?.name) ?? "Member", createdAt: t.createdAt }));

  const lowStock = db.inventory
    .filter((i) => i.stock <= i.lowStockThreshold)
    .map((i) => ({ id: i.id, name: i.name, quantity: i.stock, reorderLevel: i.lowStockThreshold }));

  const activeMembers = db.memberships.filter((m) => m.status === "active").length;
  const newLeadsToday = db.leads.filter((l) => l.createdAt.slice(0, 10) === today).length;
  const membersPresent = new Set(todaysAttendance.map((a) => a.memberId)).size;

  return (
    <ReceptionistDashboard
      name={user.name}
      kpis={{
        membersPresent,
        todaysCheckins: todaysAttendance.length,
        newLeadsToday,
        expiringSoon: expiring.length,
        openTickets: tickets.length,
        activeMembers,
        lowStock: lowStock.length,
      }}
      todaysAttendance={todaysAttendance}
      leads={leads}
      expiring={expiring}
      upcomingToday={upcomingToday}
      tickets={tickets}
      lowStock={lowStock}
    />
  );
}
