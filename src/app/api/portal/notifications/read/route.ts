import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate } from "@/lib/db/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  mutate((d) => {
    d.notifications.forEach((n) => {
      if (n.userId === user.id && (!id || n.id === id)) n.read = true;
    });
  });
  return NextResponse.json({ ok: true });
}
