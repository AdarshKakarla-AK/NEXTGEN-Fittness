import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { ClassGallery, ClassSchedule, type ClassCardData } from "@/components/site/ClassSchedule";
import type { ScheduleEntry } from "@/components/site/ClassSchedule";

export const metadata = {
  title: "Group Classes & Timetable | NEXTGEN FITNESS",
  description:
    "Nine signature group classes in Bengaluru — yoga, CrossFit, HIIT, Zumba, pilates, boxing and more. See the live weekly timetable and book your spot.",
};

const CLASS_IMAGE: Record<string, string> = {
  yoga: "/images/class-yoga.svg",
  crossfit: "/images/class-crossfit.svg",
  hiit: "/images/class-hiit.svg",
  zumba: "/images/class-zumba.svg",
  pilates: "/images/class-yoga.svg",
  strength: "/images/class-strength.svg",
  boxing: "/images/class-boxing.svg",
  functional: "/images/class-crossfit.svg",
  cardio: "/images/class-hiit.svg",
};

export default function ClassesPage() {
  const db = getDB();
  const users = Object.fromEntries(db.users.map((u) => [u.id, u]));
  const rooms = Object.fromEntries(db.rooms.map((r) => [r.id, r]));
  const classes: ClassCardData[] = db.classes
    .filter((c) => c.active)
    .map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      durationMin: c.durationMin,
      intensity: c.intensity,
      capacity: c.capacity,
      trainerName: users[c.trainerId]?.name ?? "Coach",
      roomName: rooms[c.roomId]?.name ?? "Main Floor",
      image: CLASS_IMAGE[c.category] ?? "/images/class-hiit.svg",
      color: c.color,
      days: Array.from(new Set(c.schedule.map((s) => s.day))).sort(),
    }));

  const days = [1, 2, 3, 4, 5, 6];
  const scheduleMap: Record<number, ScheduleEntry[]> = {};
  for (const c of db.classes) {
    for (const slot of c.schedule) {
      if (slot.day === 0) continue;
      scheduleMap[slot.day] = [...(scheduleMap[slot.day] ?? []), { classId: c.id, time: slot.time }];
    }
  }
  const classById = Object.fromEntries(classes.map((c) => [c.id, c]));

  return (
    <>
      <PageHero
        eyebrow="Classes"
        title="Find your class."
        highlight="Find your energy."
        subtitle="Yoga at 6am, boxing at 6pm, HIIT at lunch — nine coached classes, six days a week, all included with your membership."
        crumbs={[{ label: "Home", href: "/" }, { label: "Classes" }]}
      />
      <ClassGallery classes={classes} />
      <ClassSchedule days={days} scheduleMap={scheduleMap} classById={classById} />
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
