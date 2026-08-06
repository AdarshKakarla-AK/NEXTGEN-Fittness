import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import { TrainerDashboard } from "@/components/portal/TrainerDashboard";

export const dynamic = "force-dynamic";

export default async function TrainerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "trainer") redirect("/portal");

  const db = getDB();
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const todayDay = today.getDay();
  const userById = Object.fromEntries(db.users.map((u) => [u.id, u]));

  const classes = db.classes.filter((c) => c.trainerId === user.id && c.active);
  const todaysSlots = classes.flatMap((c) =>
    c.schedule
      .filter((s) => s.day === todayDay)
      .map((s) => ({ classId: c.id, className: c.name, color: c.color, time: s.time, durationMin: c.durationMin, capacity: c.capacity }))
      .sort((a, b) => a.time.localeCompare(b.time))
  );

  const ptBookings = db.bookings
    .filter((b) => b.trainerId === user.id && b.type === "pt_session")
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const upcoming = ptBookings.filter((b) => b.status === "upcoming" || b.status === "confirmed");
  const completed = ptBookings.filter((b) => b.status === "completed" || b.status === "no_show");
  const ptRevenue = ptBookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.price, 0);

  const plannedMembers = db.workoutPlans
    .filter((p) => p.trainerId === user.id && p.active)
    .map((p) => {
      const m = userById[p.memberId];
      const attendance = db.attendance.filter((a) => a.memberId === p.memberId).length;
      const lastWeight = db.measurements
        .filter((x) => x.memberId === p.memberId)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      const startWeight = db.measurements
        .filter((x) => x.memberId === p.memberId)
        .slice()
        .sort((a, b) => (a.date > b.date ? 1 : -1))[0];
      return {
        memberId: p.memberId,
        name: m?.name ?? "Member",
        avatarColor: m?.avatarColor,
        planName: p.name,
        goal: p.goal,
        attendance,
        currentWeight: lastWeight?.weightKg,
        startWeight: startWeight?.weightKg,
      };
    });

  const todayUpcoming = upcoming.filter((b) => b.date === todayISO);

  const appReviews = db.reviews
    .filter((r) => r.channel === "app")
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  return (
    <TrainerDashboard
      name={user.name}
      rating={user.rating ?? 0}
      reviewCount={user.reviewCount ?? 0}
      yearsExp={user.yearsExp ?? 0}
      specialization={user.specialization ?? []}
      hourlyRate={user.hourlyRate ?? 0}
      kpis={{
        todaysClasses: todaysSlots.length,
        todayUpcomingSessions: todayUpcoming.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        ptRevenue,
        membersCount: plannedMembers.length,
      }}
      todaysSlots={todaysSlots}
      upcomingSessions={upcoming.map((b) => ({
        id: b.id,
        ref: b.ref,
        date: b.date,
        time: b.time,
        durationMin: b.durationMin,
        member: userById[b.memberId]?.name ?? "Member",
        memberPhone: userById[b.memberId]?.phone,
        price: b.price,
        status: b.status,
      }))}
      plannedMembers={plannedMembers}
      reviews={appReviews.map((r) => ({ id: r.id, memberName: r.memberName, rating: r.rating, comment: r.comment, createdAt: r.createdAt }))}
    />
  );
}
