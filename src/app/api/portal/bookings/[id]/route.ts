import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate } from "@/lib/db/store";
import { audit } from "@/lib/notify";
import { promoteWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(["member"]);
    const { id } = await params;
    const action = (await req.json().catch(() => ({}))).action;
    mutate((d) => {
      const booking = d.bookings.find((b) => b.id === id && b.memberId === user.id);
      if (!booking) return;
      if (action === "cancel" && (booking.status === "upcoming" || booking.status === "waitlisted")) {
        const classId = booking.classId;
        const date = booking.date;
        booking.status = "cancelled";
        booking.updatedAt = new Date().toISOString();
        audit(d, user.id, user.name, "booking.cancelled", booking.ref);
        if (classId) promoteWaitlist(d, classId, date);
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update booking." }, { status: 400 });
  }
}
