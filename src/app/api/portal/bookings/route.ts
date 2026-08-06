import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid, today, nowISO, nextCounter } from "@/lib/db/store";
import { audit, dispatch, pushNotification } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser(["member"]);
    const body = await req.json().catch(() => ({}));
    const classId = String(body.classId ?? "");
    const date = String(body.date ?? "");
    if (!classId || !date || date < today()) {
      return NextResponse.json({ error: "Choose a valid future class date." }, { status: 400 });
    }
    const db = getDB();
    const cls = db.classes.find((c) => c.id === classId && c.active);
    if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
    const slot = cls.schedule.find((s) => {
      const dayNum = new Date(`${date}T10:00:00`).getDay();
      return s.day === dayNum;
    });
    const time = slot?.time ?? "06:30";

    let result: { status: string } | null = null;
    mutate((d) => {
      const already = d.bookings.some((b) => b.memberId === user.id && b.classId === classId && b.date === date && ["upcoming", "waitlisted", "confirmed"].includes(b.status));
      if (already) return;
      const bookedCount = d.bookings.filter((b) => b.classId === classId && b.date === date && ["upcoming", "confirmed", "waitlisted"].includes(b.status)).length;
      const waitlist = bookedCount >= cls.capacity;
      const seq = nextCounter(d, "bookingSeq");
      const booking = {
        id: uid("bk"),
        ref: `BK-${String(seq).padStart(5, "0")}`,
        memberId: user.id,
        classId,
        trainerId: cls.trainerId,
        type: "class" as const,
        date,
        time,
        durationMin: cls.durationMin,
        status: waitlist ? ("waitlisted" as const) : ("upcoming" as const),
        price: 0,
        paid: 0,
        createdAt: nowISO(),
      };
      d.bookings.push(booking);
      result = { status: booking.status };
      audit(d, user.id, user.name, "booking.created", booking.ref, `${cls.name} ${date} ${time}`);
      pushNotification(d, user.id, waitlist ? "Added to waitlist" : "Class booked!", waitlist ? `You're on the waitlist for ${cls.name} on ${date}.` : `${cls.name} on ${date} at ${time}. See you there!`);
      dispatch(d, { type: "booking_confirmed", channel: "whatsapp", recipient: `+91 ${user.phone}`, summary: `${cls.name} booked for ${date} ${time}.` });
    });
    if (!result) {
      return NextResponse.json({ error: "You're already booked for this class." }, { status: 409 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("BOOKING ERROR", err);
    return NextResponse.json({ error: "Could not book the class." }, { status: 500 });
  }
}
