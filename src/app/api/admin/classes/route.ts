import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate } from "@/lib/db/store";
import { audit } from "@/lib/notify";
import { promoteWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function GET() {
  try {
    await requireUser(["admin"]);
    const db = getDB();
    const classes = db.classes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => {
        const trainer = db.users.find((u) => u.id === c.trainerId);
        const room = db.rooms.find((r) => r.id === c.roomId);
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = db.bookings.filter((b) => b.classId === c.id && b.date >= today && b.status !== "cancelled").length;
        const allBookings = db.bookings.filter((b) => b.classId === c.id).length;
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
          allBookings,
          fillRate: c.capacity ? Math.min(100, Math.round((upcoming / c.capacity) * 100)) : 0,
        };
      });
    return NextResponse.json({ classes });
  } catch (err) {
    console.error("ADMIN CLASSES GET", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const action = String(body.action ?? "");
    const value = body.value;
    if (!id || !action) return NextResponse.json({ error: "Missing id or action." }, { status: 400 });
    mutate((d) => {
      const cls = d.classes.find((c) => c.id === id);
      if (!cls) return;
      if (action === "toggle-active") {
        cls.active = !cls.active;
        audit(d, user.id, user.name, "class.toggled", cls.name, cls.active ? "published" : "hidden");
      } else if (action === "set-capacity") {
        const cap = Number(value);
        if (Number.isInteger(cap) && cap >= 1 && cap <= 200) {
          cls.capacity = cap;
          audit(d, user.id, user.name, "class.capacity_changed", cls.name, `capacity ${cap}`);
          const dates = Array.from(new Set(d.bookings.filter((b) => b.classId === id && b.status === "waitlisted").map((b) => b.date)));
          for (const date of dates) promoteWaitlist(d, id, date);
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ADMIN CLASSES PATCH", err);
    return NextResponse.json({ error: "Could not update class." }, { status: 500 });
  }
}
