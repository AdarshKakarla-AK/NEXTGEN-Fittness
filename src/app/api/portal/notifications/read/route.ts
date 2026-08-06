import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate } from "@/lib/db/store";

export const runtime = "nodejs";

export async function POST() {
  const user = await requireUser();
  mutate((d) => {
    d.notifications.forEach((n) => {
      if (n.userId === user.id) n.read = true;
    });
  });
  return NextResponse.json({ ok: true });
}
