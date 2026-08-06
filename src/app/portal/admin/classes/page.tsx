import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import { AdminToolNav } from "@/components/portal/AdminToolNav";
import { ClassesAdmin } from "@/components/portal/ClassesAdmin";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function AdminClassesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/portal");

  const db = getDB();
  const today = new Date().toISOString().slice(0, 10);
  const classes = db.classes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => {
      const trainer = db.users.find((u) => u.id === c.trainerId);
      const room = db.rooms.find((r) => r.id === c.roomId);
      const upcoming = db.bookings.filter((b) => b.classId === c.id && b.date >= today && b.status !== "cancelled").length;
      return {
        id: c.id,
        name: c.name,
        category: c.category,
        durationMin: c.durationMin,
        intensity: c.intensity,
        capacity: c.capacity,
        color: c.color,
        active: c.active,
        trainer: trainer?.name ?? "—",
        room: room?.name ?? "—",
        schedule: c.schedule.map((s) => ({ day: DAY_LABELS[s.day], time: s.time })),
        upcoming,
        fillRate: c.capacity ? Math.min(100, Math.round((upcoming / c.capacity) * 100)) : 0,
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-900">Classes & timetable</h1>
          <p className="mt-1 text-sm text-ink-400">{classes.length} classes · capacity and publishing controls</p>
        </div>
        <AdminToolNav active="classes" />
      </div>
      <ClassesAdmin classes={classes} />
    </div>
  );
}
