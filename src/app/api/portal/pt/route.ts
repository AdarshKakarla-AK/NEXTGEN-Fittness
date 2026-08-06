import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid, today, nextCounter, nowISO } from "@/lib/db/store";
import { audit, dispatch, pushNotification } from "@/lib/notify";

export const runtime = "nodejs";

const SLOT_REGEX = /^([01]\d|2[0-3]):00$/;

export async function GET() {
  try {
    await requireUser(["member", "trainer"]);
    const db = getDB();
    const start = today();
    const end = new Date(Date.now() + 13 * 86400000).toISOString().slice(0, 10);
    const trainers = db.users
      .filter((u) => u.role === "trainer" && u.active)
      .map((u) => ({
        id: u.id,
        name: u.name,
        specialization: u.specialization ?? [],
        rating: u.rating ?? 0,
        reviewCount: u.reviewCount ?? 0,
        hourlyRate: u.hourlyRate ?? 0,
        languages: u.languages ?? [],
        bio: u.bio ?? "",
        avatarColor: u.avatarColor,
      }));
    const sessions = db.bookings
      .filter((b) => b.type === "pt_session" && b.date >= start && b.date <= end && (b.status === "upcoming" || b.status === "confirmed"))
      .map((b) => ({ trainerId: b.trainerId ?? "", date: b.date, time: b.time, memberId: b.memberId }));
    return NextResponse.json({ trainers, sessions });
  } catch (err) {
    console.error("PT GET ERROR", err);
    return NextResponse.json({ error: "Could not load trainers." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(["member"]);
    const body = await req.json().catch(() => ({}));
    const trainerId = String(body.trainerId ?? "");
    const date = String(body.date ?? "");
    const time = String(body.time ?? "");
    const notes = String(body.notes ?? "").trim();

    if (!trainerId || !date || !time) return NextResponse.json({ error: "Choose a trainer, date and time." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date <= today()) return NextResponse.json({ error: "Pick a future date." }, { status: 400 });
    if (new Date(`${date}T10:00:00`).getDay() === 0) return NextResponse.json({ error: "The gym is closed on Sundays." }, { status: 400 });
    const dayDiff = (Date.parse(date) - Date.parse(today())) / 86400000;
    if (dayDiff > 13) return NextResponse.json({ error: "Choose a date within the next two weeks." }, { status: 400 });
    if (!SLOT_REGEX.test(time)) return NextResponse.json({ error: "Choose an available time slot." }, { status: 400 });

    const db = getDB();
    const trainer = db.users.find((u) => u.id === trainerId && u.role === "trainer" && u.active);
    if (!trainer) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });

    const membership = db.memberships.find((m) => m.memberId === user.id && m.status === "active");
    if (!membership) return NextResponse.json({ error: "An active membership is required to book PT sessions." }, { status: 400 });

    const trainerBusy = db.bookings.some((b) => b.trainerId === trainerId && b.date === date && b.time === time && (b.status === "upcoming" || b.status === "confirmed"));
    if (trainerBusy) return NextResponse.json({ error: "That slot is already taken." }, { status: 409 });
    const memberBusy = db.bookings.some((b) => b.memberId === user.id && b.date === date && b.time === time && (b.status === "upcoming" || b.status === "confirmed" || b.status === "waitlisted"));
    if (memberBusy) return NextResponse.json({ error: "You already have a session at that time." }, { status: 409 });

    const ref = mutate((d) => {
      const seq = nextCounter(d, "bookingSeq");
      const booking = {
        id: uid("bk"),
        ref: `BK-${String(seq).padStart(5, "0")}`,
        memberId: user.id,
        trainerId,
        type: "pt_session" as const,
        date,
        time,
        durationMin: 60,
        status: "confirmed" as const,
        price: trainer.hourlyRate ?? 0,
        paid: 0,
        notes: notes || undefined,
        createdAt: nowISO(),
      };
      d.bookings.push(booking);
      audit(d, user.id, user.name, "pt.booked", booking.ref, `${trainer.name} ${date} ${time}`);
      pushNotification(d, user.id, "PT session booked 💪", `Confirmed: ${trainer.name} on ${date} at ${time}.`);
      pushNotification(d, trainer.id, "New PT session 📅", `${user.name} booked a session on ${date} at ${time}.`);
      dispatch(d, {
        type: "appointment_reminder",
        channel: "whatsapp",
        recipient: `+91 ${user.phone}`,
        summary: `PT with ${trainer.name} on ${date} ${time} — confirmed.`,
      });
      return booking.ref;
    });

    return NextResponse.json({ ok: true, ref });
  } catch (err) {
    console.error("PT POST ERROR", err);
    return NextResponse.json({ error: "Could not book the PT session." }, { status: 500 });
  }
}
