import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid, today, nowISO } from "@/lib/db/store";
import { pushNotification } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser(["member"]);
    const db = getDB();
    const logs = db.workoutLogs
      .filter((l) => l.memberId === user.id)
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 20);
    const month = today().slice(0, 7);
    const minutesThisMonth = logs.filter((l) => l.date.slice(0, 7) === month).reduce((s, l) => s + l.durationMin, 0);
    return NextResponse.json({
      logs: logs.map((l) => ({ id: l.id, date: l.date, day: l.day ?? "", durationMin: l.durationMin, caloriesBurned: l.caloriesBurned, exerciseCount: l.exercises.length })),
      minutesThisMonth,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load workouts." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["member"]);
    const body = await req.json().catch(() => ({}));
    const durationMin = Math.max(1, Math.min(240, Number(body.durationMin) || 30));
    const caloriesBurned = Math.max(0, Number(body.caloriesBurned) || 0);
    const date = String(body.date ?? today()).slice(0, 10);
    const exercisesRaw = Array.isArray(body.exercises) ? body.exercises.slice(0, 20) : [];
    const exercises: { name: string; sets: number; reps: string; weightKg?: number; completed: boolean }[] = exercisesRaw.map((e: { name?: string; sets?: number; reps?: string; weightKg?: number }) => ({
      name: String(e.name ?? "Exercise").slice(0, 60),
      sets: Math.max(1, Number(e.sets) || 3),
      reps: String(e.reps ?? "10").slice(0, 20),
      weightKg: e.weightKg ? Math.max(0, Number(e.weightKg)) : undefined,
      completed: true,
    }));

    let awarded: { xp: number; newAchievements: string[]; level: number } | null = null;

    mutate((d) => {
      const m = d.users.find((u) => u.id === user.id);
      d.workoutLogs.push({
        id: uid("wl"),
        memberId: user.id,
        date,
        durationMin,
        caloriesBurned: caloriesBurned || Math.round(durationMin * 8),
        exercises,
        createdAt: nowISO(),
      });

      const newAchievements: string[] = [];
      const add = (badge: string, title: string, desc: string, xp: number) => {
        if (d.achievements.some((a) => a.memberId === user.id && a.badge === badge)) return;
        d.achievements.push({ id: uid("ach"), memberId: user.id, badge, title, description: desc, xp, unlockedAt: nowISO() });
        pushNotification(d, user.id, `Achievement unlocked: ${title}`, `${desc} · +${xp} XP`);
        newAchievements.push(title);
      };

      const allLogs = d.workoutLogs.filter((l) => l.memberId === user.id);
      if (allLogs.length === 1) add("first-session", "First Session", "Complete your first workout", 50);

      const month = date.slice(0, 7);
      const workoutsThisMonth = allLogs.filter((l) => l.date.slice(0, 7) === month).length;
      if (workoutsThisMonth >= 30) add("consistency-30", "30-Day Consistency", "Complete 30 workouts in a month", 150);

      const totalVolume = exercises.reduce((s, e) => s + (e.weightKg ?? 0) * e.sets, 0);
      if (totalVolume >= 1000) add("strength-lift", "Weightlifter", "Log 1,000 kg total volume in a session", 100);

      if (m) {
        if (m.lastCheckInDate !== date) m.streak = 1;
        else if (d.attendance.some((a) => a.memberId === user.id && a.date === date)) m.streak = (m.streak ?? 0) + 1;
        m.xp = (m.xp ?? 0) + durationMin * 2;
        const newLevel = Math.min(10, Math.floor((m.xp ?? 0) / 300) + 1);
        if (newLevel > (m.level ?? 1)) {
          m.level = newLevel;
          pushNotification(d, user.id, `Level up! You're now Level ${newLevel}`, `Keep stacking XP — your next badge is close.`);
        }
        awarded = { xp: durationMin * 2, newAchievements, level: m.level ?? 1 };
      }
    });

    return NextResponse.json({ ok: true, ...(awarded ?? {}) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not log workout." }, { status: 401 });
  }
}
