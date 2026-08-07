import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, nowISO } from "@/lib/db/store";
import { isoDaysFromNow } from "@/lib/utils";
import { dispatch, audit } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser(["admin", "receptionist"]);
    const db = getDB();
    const tomorrow = isoDaysFromNow(1);
    const bookings = db.bookings
      .filter((b) => b.date === tomorrow && (b.status === "upcoming" || b.status === "confirmed"))
      .map((b) => {
        const member = db.users.find((u) => u.id === b.memberId);
        const cls = b.classId ? db.classes.find((c) => c.id === b.classId) : undefined;
        return {
          id: b.id,
          ref: b.ref,
          member: member?.name ?? "Member",
          phone: member?.phone ?? "",
          type: b.type,
          time: b.time ?? "",
          class: cls?.name ?? "Personal training",
          reminded: !!b.reminderSentAt,
        };
      });
    return NextResponse.json({ bookings });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load reminders." }, { status: 401 });
  }
}

export async function POST() {
  try {
    const user = await requireUser(["admin", "receptionist"]);
    let sent = 0;
    mutate((d) => {
      const tomorrow = isoDaysFromNow(1);
      const targets = d.bookings.filter((b) => b.date === tomorrow && (b.status === "upcoming" || b.status === "confirmed") && !b.reminderSentAt);
      targets.forEach((b) => {
        const member = d.users.find((u) => u.id === b.memberId);
        const cls = b.classId ? d.classes.find((c) => c.id === b.classId) : undefined;
        const label = cls?.name ?? "your PT session";
        const summary = `Reminder: ${label} tomorrow at ${b.time ?? ""}. See you at ${d.settings.name}! (Ref ${b.ref})`;
        dispatch(d, { type: "class_reminder", channel: "whatsapp", recipient: member?.phone ?? "—", summary });
        b.reminderSentAt = nowISO();
        sent += 1;
      });
      if (sent > 0) audit(d, user.id, user.name, "reminder.batch", undefined, `${sent} class reminder(s) sent for tomorrow`);
    });
    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to send reminders." }, { status: 401 });
  }
}
