import { NextResponse } from "next/server";
import { getDB, mutate, uid, nowISO } from "@/lib/db/store";
import { dispatch } from "@/lib/notify";
import type { Lead } from "@/lib/db/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }
    mutate((d) => {
      const lead: Lead = {
        id: uid("lead"),
        name,
        phone: String(body.phone ?? ""),
        email,
        source: "website",
        status: "new",
        notes: [message],
        assignedTo: d.users.find((u) => u.role === "receptionist")?.id,
        createdAt: nowISO(),
      };
      d.leads.push(lead);
      dispatch(d, { type: "offer", channel: "email", recipient: email, summary: `Thanks ${name}! We received your enquiry — our team will reply within one business day.` });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET() {
  const db = getDB();
  return NextResponse.json({
    phone: db.settings.phone,
    email: db.settings.email,
    whatsapp: db.settings.whatsapp,
    address: db.settings.address,
    hours: db.settings.hours,
  });
}
