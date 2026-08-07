import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import { MemberPortal } from "@/components/portal/MemberPortal";
import type { Booking } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "member") {
    redirect(user.role === "admin" ? "/portal/admin" : user.role === "trainer" ? "/portal/trainer" : "/portal/receptionist");
  }
  const db = getDB();
  const memberId = user.id;

  const membership = db.memberships.find((m) => m.memberId === memberId);
  const plan = membership ? db.plans.find((p) => p.id === membership.planId) : undefined;

  const bookings = db.bookings
    .filter((b) => b.memberId === memberId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const upcoming = bookings
    .filter((b) => b.status === "upcoming" || b.status === "waitlisted")
    .slice(0, 6);
  const past = bookings.filter((b) => b.status === "completed");

  const workoutPlan = db.workoutPlans.find((p) => p.memberId === memberId && p.active);
  const todayIndex = new Date().getDay(); // 0..6
  const todayWorkout = workoutPlan?.days?.[todayIndex % (workoutPlan.days.length || 1)] ?? workoutPlan?.days?.[0];
  const exerciseName = (id: string) => db.exercises.find((e) => e.id === id)?.name ?? id;

  const dietPlan = db.dietPlans.find((p) => p.memberId === memberId && p.active);

  const measurements = db.measurements
    .filter((m) => m.memberId === memberId)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-8);
  const weightTrend = measurements.map((m) => ({ label: m.date.slice(5).replace("-", "/"), weight: m.weightKg, bodyFat: m.bodyFat }));

  const weeks: { label: string; minutes: number; sessions: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date();
    start.setDate(start.getDate() - w * 7);
    const day = new Date(start);
    const end = new Date(day);
    end.setDate(day.getDate() + 6);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const logs = db.workoutLogs.filter((l) => l.memberId === memberId && l.date >= iso(day) && l.date <= iso(end));
    weeks.push({
      label: `W${4 - w}`,
      minutes: logs.reduce((s, l) => s + l.durationMin, 0),
      sessions: logs.length,
    });
  }

  const workoutLogs = db.workoutLogs
    .filter((l) => l.memberId === memberId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4);

  const mealLogs = db.mealLogs
    .filter((l) => l.memberId === memberId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 14);
  const mealLogByDay = new Map<string, (typeof mealLogs)[number][]>();
  mealLogs.forEach((l) => {
    const list = mealLogByDay.get(l.date) ?? [];
    list.push(l);
    mealLogByDay.set(l.date, list);
  });

  const notifications = db.notifications
    .filter((n) => n.userId === memberId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tickets = db.tickets
    .filter((t) => t.memberId === memberId)
    .slice()
    .sort((a, b) => ((a.updatedAt ?? "") < (b.updatedAt ?? "") ? 1 : -1));

  const achievements = db.achievements.filter((a) => a.memberId === memberId);

  const myReferral = db.referrals.find((r) => r.ownerId === memberId);
  const referredCount = db.users.filter((u) => u.referredBy === memberId).length;
  const referredBy = user.referredBy ? db.users.find((u) => u.id === user.referredBy) : undefined;

  const todayISO = new Date().toISOString().slice(0, 10);
  const checkedInToday = db.attendance.some((a) => a.memberId === memberId && a.date === todayISO);

  const classesById = Object.fromEntries(db.classes.map((c) => [c.id, c]));
  const trainersById = Object.fromEntries(db.users.map((u) => [u.id, u]));

  const bookingRows = upcoming.map((b: Booking) => ({
    id: b.id,
    ref: b.ref,
    type: b.type,
    date: b.date,
    time: b.time ?? "",
    durationMin: b.durationMin,
    status: b.status,
    class: b.classId ? classesById[b.classId]?.name : "Personal training",
    trainer: b.trainerId ? trainersById[b.trainerId]?.name : undefined,
  }));

  const bookableClasses = db.classes.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name, durationMin: c.durationMin }));

  const ptTrainers = db.users
    .filter((u) => u.role === "trainer" && u.active)
    .map((u) => ({
      id: u.id,
      name: u.name,
      specialization: u.specialization ?? [],
      rating: u.rating ?? 0,
      reviewCount: u.reviewCount ?? 0,
      hourlyRate: u.hourlyRate ?? 0,
      avatarColor: u.avatarColor,
    }));
  const ptSessions = db.bookings
    .filter((b) => b.type === "pt_session" && b.date >= todayISO && (b.status === "upcoming" || b.status === "confirmed"))
    .map((b) => ({ trainerId: b.trainerId ?? "", date: b.date, time: b.time }));
  const memberPayments = db.payments
    .filter((p) => p.memberId === memberId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const memberInvoices = db.invoices.filter((i) => i.memberId === memberId);

  return (
    <MemberPortal
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberId: user.memberId,
        avatarColor: user.avatarColor,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
      }}
      membership={membership ? { planName: membership.planName, status: membership.status, startDate: membership.startDate, endDate: membership.endDate, autoRenew: membership.autoRenew } : null}
      plan={plan ? { name: plan.name, price: plan.price, durationMonths: plan.durationMonths } : null}
      stats={{
        streak: user.streak ?? 0,
        xp: user.xp ?? 0,
        level: user.level ?? 1,
        workoutsThisMonth: db.workoutLogs.filter((l) => l.memberId === memberId && l.date.slice(0, 7) === todayISO.slice(0, 7)).length,
        attendanceThisMonth: db.attendance.filter((a) => a.memberId === memberId && a.date.slice(0, 7) === todayISO.slice(0, 7)).length,
        pastSessions: past.length,
        unread: unreadCount,
      }}
      todayWorkout={todayWorkout ? { day: todayWorkout.day, focus: todayWorkout.focus, exercises: todayWorkout.exercises.map((e) => ({ name: exerciseName(e.exerciseId), sets: e.sets, reps: e.reps, weightKg: e.weightKg })) } : null}
      diet={dietPlan ? { name: dietPlan.name, dailyCalories: dietPlan.dailyCalories, goal: dietPlan.goal, meals: dietPlan.meals } : null}
      weightTrend={weightTrend}
      weekStats={weeks}
      recentLogs={workoutLogs.map((l) => ({ id: l.id, date: l.date, day: l.day ?? "", durationMin: l.durationMin, caloriesBurned: l.caloriesBurned, exerciseCount: l.exercises.length }))}
      mealLogDays={Array.from(mealLogByDay.entries()).map(([date, logs]) => ({ date, calories: logs.reduce((s, l) => s + l.calories, 0), protein: logs.reduce((s, l) => s + l.protein, 0), meals: logs.map((l) => ({ type: l.mealType, name: l.items.join(", ") || l.mealType, calories: l.calories, protein: l.protein })) }))}
      notifications={notifications.slice(0, 12).map((n) => ({ id: n.id, title: n.title, body: n.body, link: n.link, read: n.read, createdAt: n.createdAt }))}
      tickets={tickets.slice(0, 6).map((t) => ({ id: t.id, subject: t.subject, status: t.status, priority: t.priority, updatedAt: t.updatedAt, replyCount: t.replies.length }))}
      achievements={achievements.slice(0, 9).map((a) => ({ id: a.id, title: a.title, badge: a.badge, unlockedAt: a.unlockedAt }))}
      referrals={{
        code: user.referralCode ?? myReferral?.code ?? null,
        uses: myReferral?.uses ?? 0,
        rewardPoints: myReferral?.rewardPoints ?? 0,
        totalRewarded: myReferral?.totalRewarded ?? 0,
        referredByName: referredBy?.name ?? null,
        discountPct: db.settings.referralDiscountPct,
        referralCount: referredCount,
      }}
      bookings={bookingRows}
      checkedInToday={checkedInToday}
      branchName={db.settings.branches[0]?.name}
      bookableClasses={bookableClasses}
      ptTrainers={ptTrainers}
      ptSessions={ptSessions}
      payments={memberPayments.map((p) => ({
        id: p.id,
        ref: p.ref,
        description: p.description,
        amount: p.amount,
        status: p.status,
        method: p.method,
        invoiceNo: p.invoiceNo,
        createdAt: p.createdAt,
      }))}
      invoices={memberInvoices.map((i) => ({
        id: i.id,
        number: i.number,
        items: i.items,
        subtotal: i.subtotal,
        gst: i.gst,
        total: i.total,
        issuedAt: i.issuedAt,
      }))}
      gstin={db.settings.gstin}
    />
  );
}
