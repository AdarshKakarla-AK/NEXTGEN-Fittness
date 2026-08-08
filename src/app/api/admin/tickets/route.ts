import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, nowISO } from "@/lib/db/store";
import { audit, pushNotification } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser(["admin"]);
    const db = getDB();
    const userById = Object.fromEntries(db.users.map((u) => [u.id, u]));
    const tickets = db.tickets
      .slice()
      .sort((a, b) => ((a.updatedAt ?? a.createdAt) < (b.updatedAt ?? b.createdAt) ? 1 : -1))
      .map((t) => ({
        id: t.id,
        subject: t.subject,
        body: t.body,
        status: t.status,
        priority: t.priority,
        member: (t.memberId && userById[t.memberId]?.name) ?? "Member",
        memberId: t.memberId ?? null,
        replies: t.replies,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt ?? t.createdAt,
      }));
    return NextResponse.json({ tickets });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load tickets." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const action = String(body.action ?? "reply");

    if (!id) return NextResponse.json({ error: "Ticket id is required." }, { status: 400 });

    let found = false;
    let memberId: string | undefined;

    if (action === "status") {
      const status = String(body.status ?? "");
      if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      mutate((d) => {
        const t = d.tickets.find((x) => x.id === id);
        if (!t) return;
        found = true;
        memberId = t.memberId;
        t.status = status as typeof t.status;
        t.updatedAt = nowISO();
        audit(d, user.id, user.name, "ticket.status", id, status);
      });
      if (!found) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    const text = String(body.text ?? "").trim();
    if (!text) return NextResponse.json({ error: "Reply text is required." }, { status: 400 });

    mutate((d) => {
      const t = d.tickets.find((x) => x.id === id);
      if (!t) return;
      found = true;
      memberId = t.memberId;
      t.replies.push({ authorId: user.id, text, createdAt: nowISO() });
      if (t.status === "open") t.status = "in_progress";
      t.updatedAt = nowISO();
      audit(d, user.id, user.name, "ticket.reply", id, text.slice(0, 120));
      if (t.memberId) pushNotification(d, t.memberId, "Support reply", `Re: ${t.subject} — ${text}`, "/portal");
    });
    if (!found) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    return NextResponse.json({ ok: true, memberId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not update the ticket." }, { status: 401 });
  }
}
