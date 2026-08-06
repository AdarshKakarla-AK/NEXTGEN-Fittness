import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate } from "@/lib/db/store";
import { audit } from "@/lib/notify";

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
        booking.status = "cancelled";
        audit(d, user.id, user.name, "booking.cancelled", booking.ref);
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update booking." }, { status: 400 });
  }
}
