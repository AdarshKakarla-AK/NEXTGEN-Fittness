import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB } from "@/lib/db/store";
import { createSessionToken, sessionKey } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const db = getDB();
    const user = db.users.find((u) => u.email?.toLowerCase() === email);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (!user.active) {
      return NextResponse.json({ error: "This account is inactive. Contact reception." }, { status: 403 });
    }
    const token = createSessionToken({ id: user.id, role: user.role });
    const res = NextResponse.json({ user: safe(user), redirect: portalRoute(user.role) });
    res.cookies.set(sessionKey, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

function safe(user: { id: string; name: string; email?: string; phone: string; role: string; memberId?: string; avatarColor?: string }) {
  const { ...rest } = user;
  return rest;
}

function portalRoute(role: string): string {
  switch (role) {
    case "admin":
      return "/portal/admin";
    case "trainer":
      return "/portal/trainer";
    case "receptionist":
      return "/portal/receptionist";
    default:
      return "/portal";
  }
}
