import { NextResponse } from "next/server";
import { sessionKey } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionKey, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
