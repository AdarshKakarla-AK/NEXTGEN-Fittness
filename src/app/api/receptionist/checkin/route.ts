import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate, uid, today, nowISO, getDB } from "@/lib/db/store";
import { audit } from "@/lib/notify";

export const runtime = "nodejs";

function levelFromXp(xp: number) {
  return Math.min(10, Math.floor(xp / 300) + 1);
}

export async function GET(req: NextRequest) {
  try {
    await requireUser(["receptionist", "admin", "trainer"]);
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
    const db = getDB();
    if (!q) return NextResponse.json({ members: [] });
    const members = db.users
      .filter((u) => u.role === "member" && u.active)
      .filter((u) =>
        u.name.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q) ||
        (u.memberId ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((u) => {
        const m = db.memberships.find((x) => x.memberId === u.id && x.status === "active");
        const todayAtt = db.attendance.find((a) => a.memberId === u.id && a.date === today());
        return {
          id: u.id, name: u.name, phone: u.phone, memberId: u.memberId,
          membershipStatus: m?.status ?? "inactive", planName: m?.planName ?? null,
          checkedIn: !!todayAtt, checkInTime: todayAtt?.checkIn ?? null, checkOutTime: todayAtt?.checkOut ?? null,
          avatarColor: u.avatarColor,
        };
      });
    return NextResponse.json({ members });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Search failed." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["receptionist", "admin"]);
    const body = await req.json();
    const { action, memberId, workoutMinutes } = body ?? {};
    if (!memberId) return NextResponse.json({ error: "Missing member." }, { status: 400 });

    let result: { ok: boolean; checkedIn?: boolean; checkedOut?: boolean; xp?: number } = { ok: false };

    mutate((d) => {
      const m = d.users.find((u) => u.id === memberId);
      if (!m || m.role !== "member") {
        result = { ok: false };
        return;
      }
      const date = today();
      const rec = d.attendance.find((a) => a.memberId === memberId && a.date === date);

      if (action === "checkin") {
        if (rec?.checkOut) {
          d.attendance.push({ id: uid("att"), memberId, date, checkIn: nowISO(), method: "manual" });
          m.lastCheckInDate = date;
          m.streak = (m.streak ?? 0) + 1;
          m.xp = (m.xp ?? 0) + 15;
          result = { ok: true, checkedIn: true, xp: 15 };
        } else if (rec) {
          result = { ok: true, checkedIn: true, xp: 0 };
        } else {
          d.attendance.push({ id: uid("att"), memberId, date, checkIn: nowISO(), method: "manual" });
          m.lastCheckInDate = date;
          m.streak = (m.streak ?? 0) + 1;
          m.xp = (m.xp ?? 0) + 15;
          result = { ok: true, checkedIn: true, xp: 15 };
        }
        m.level = levelFromXp(m.xp ?? 0);
        audit(d, user.id, user.name, "member.checkin", memberId, "Manual front-desk check-in");
      } else if (action === "checkout") {
        if (!rec) {
          d.attendance.push({ id: uid("att"), memberId, date, checkIn: nowISO(), method: "manual", checkOut: nowISO(), workoutMinutes: workoutMinutes ?? 0 });
        } else if (!rec.checkOut) {
          rec.checkOut = nowISO();
          rec.workoutMinutes = workoutMinutes ?? Math.max(30, Math.round((Date.now() - new Date(rec.checkIn).getTime()) / 60000));
        }
        result = { ok: true, checkedOut: true };
        audit(d, user.id, user.name, "member.checkout", memberId, "Manual front-desk check-out");
      }
    });

    if (!result.ok) return NextResponse.json({ error: "Member not found." }, { status: 404 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Check-in failed." }, { status: 401 });
  }
}
