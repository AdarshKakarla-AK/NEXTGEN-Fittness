import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate, uid, nowISO } from "@/lib/db/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser(["member"]);
    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject ?? "").trim();
    const text = String(body.body ?? "").trim();
    if (!subject || !text) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }
    const now = nowISO();
    let created: { id: string; subject: string; status: string; priority: string; updatedAt: string; replyCount: number } | null = null;
    mutate((d) => {
      const ticket = {
        id: uid("tkt"),
        memberId: user.id,
        subject,
        body: text,
        status: "open" as const,
        priority: "medium" as const,
        assigneeId: d.users.find((u) => u.role === "receptionist")?.id,
        replies: [],
        createdAt: now,
        updatedAt: now,
      };
      d.tickets.push(ticket);
      created = { id: ticket.id, subject, status: ticket.status, priority: ticket.priority, updatedAt: now, replyCount: 0 };
    });
    return NextResponse.json({ ok: true, ticket: created });
  } catch {
    return NextResponse.json({ error: "Could not create ticket." }, { status: 500 });
  }
}
