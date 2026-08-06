import "server-only";
import type { DB } from "./db/types";
import { pushNotification, dispatch, audit } from "./notify";

/**
 * When a slot frees up (member cancels, or admin raises capacity), promote the
 * oldest waitlisted booking for that class + date to confirmed, in order.
 */
export function promoteWaitlist(d: DB, classId: string, date: string): void {
  const cls = d.classes.find((c) => c.id === classId);
  if (!cls) return;
  const booked = d.bookings.filter((b) => b.classId === classId && b.date === date && (b.status === "upcoming" || b.status === "confirmed")).length;
  let slots = cls.capacity - booked;
  if (slots <= 0) return;
  const waitlisted = d.bookings
    .filter((b) => b.classId === classId && b.date === date && b.status === "waitlisted")
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  for (const booking of waitlisted) {
    if (slots <= 0) break;
    booking.status = "upcoming";
    booking.updatedAt = new Date().toISOString();
    const member = d.users.find((u) => u.id === booking.memberId);
    pushNotification(
      d,
      booking.memberId,
      "You're in! 🎉",
      `A spot just opened up for ${cls.name} on ${date} — you've been moved from the waitlist to confirmed.`
    );
    dispatch(d, {
      type: "booking_confirmed",
      channel: "whatsapp",
      recipient: member?.phone ? `+91 ${member.phone}` : "member",
      summary: `${cls.name} waitlist → confirmed for ${date}. See you at the class!`,
    });
    audit(d, booking.memberId, member?.name ?? "Member", "booking.waitlist_promoted", booking.ref, `${cls.name} ${date}`);
    slots--;
  }
}
