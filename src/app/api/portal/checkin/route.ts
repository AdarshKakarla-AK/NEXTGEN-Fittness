import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { mutate, uid, today, nowISO } from "@/lib/db/store";
import { audit } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireUser(["member"]);
    const date = today();
    const qr = await QRCode.toDataURL(`${user.memberId ?? user.id}|${date}`, { width: 512, margin: 1 });
    mutate((d) => {
      if (d.attendance.some((a) => a.memberId === user.id && a.date === date)) return;
      d.attendance.push({
        id: uid("att"), memberId: user.id, date,
        checkIn: nowISO(), method: "qr",
      });
      const m = d.users.find((u) => u.id === user.id);
      if (m) {
        m.lastCheckInDate = date;
        m.streak = (m.streak ?? 0) + 1;
        m.xp = (m.xp ?? 0) + 15;
        m.level = Math.min(10, Math.floor((m.xp ?? 0) / 300) + 1);
      }
      audit(d, user.id, user.name, "member.checkin", user.memberId, "QR turnstile");
    });
    return NextResponse.json({ ok: true, qrDataUrl: qr });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Check-in failed." }, { status: 401 });
  }
}
