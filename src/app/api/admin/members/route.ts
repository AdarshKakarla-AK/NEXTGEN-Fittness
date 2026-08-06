import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, nowISO } from "@/lib/db/store";
import { audit } from "@/lib/notify";
import type { MembershipStatus } from "@/lib/db/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser(["admin"]);
    const db = getDB();
    const members = db.users
      .filter((u) => u.role === "member")
      .map((m) => {
        const membership = db.memberships.find((ms) => ms.memberId === m.id);
        const lastVisit = db.attendance
          .filter((a) => a.memberId === m.id)
          .map((a) => a.date)
          .sort()
          .at(-1);
        return {
          id: m.id,
          memberId: m.memberId,
          name: m.name,
          email: m.email,
          phone: m.phone,
          gender: m.gender,
          age: m.age,
          fitnessGoal: m.fitnessGoal,
          avatarColor: m.avatarColor,
          active: m.active,
          joined: m.createdAt.slice(0, 10),
          planName: membership?.planName,
          status: membership?.status,
          endDate: membership?.endDate,
          autoRenew: membership?.autoRenew,
          lastVisit: lastVisit ?? null,
          visits: db.attendance.filter((a) => a.memberId === m.id).length,
        };
      })
      .sort((a, b) => (a.joined < b.joined ? 1 : -1));
    return NextResponse.json({ members });
  } catch (err) {
    console.error("ADMIN MEMBERS GET", err);
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

    const db = getDB();
    mutate((d) => {
      const member = d.users.find((u) => u.id === id && u.role === "member");
      if (!member) return;
      if (action === "toggle-active") {
        member.active = !member.active;
        audit(d, user.id, user.name, "member.status_changed", member.name, `${member.active ? "activated" : "deactivated"}`);
      } else if (action === "set-status") {
        const membership = d.memberships.find((ms) => ms.memberId === id);
        if (membership && ["active", "frozen", "paused", "expired", "cancelled"].includes(String(value))) {
          membership.status = String(value) as MembershipStatus;
          membership.updatedAt = nowISO();
          audit(d, user.id, user.name, "membership.status_changed", member.name, `set to ${value}`);
        }
      } else if (action === "renew") {
        const membership = d.memberships.find((ms) => ms.memberId === id);
        if (membership) {
          const plan = d.plans.find((p) => p.id === membership.planId);
          const end = new Date(membership.endDate + "T00:00:00Z");
          end.setUTCMonth(end.getUTCMonth() + (plan?.durationMonths ?? 1));
          membership.endDate = end.toISOString().slice(0, 10);
          membership.status = "active";
          membership.updatedAt = nowISO();
          audit(d, user.id, user.name, "membership.renewed", member.name, `extended to ${membership.endDate}`);
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ADMIN MEMBERS PATCH", err);
    return NextResponse.json({ error: "Could not update member." }, { status: 500 });
  }
}
