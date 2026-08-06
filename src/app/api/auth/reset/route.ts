import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB, mutate, uid } from "@/lib/db/store";
import { dispatch } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const db = getDB();
    const user = db.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    if (body.step === "reset") {
      const otpCode = String(body.otp ?? "");
      const otp = db.otps.find((o) => o.identifier === email && o.code === otpCode && o.purpose === "reset" && new Date(o.expiresAt).getTime() > Date.now());
      if (!otp) {
        return NextResponse.json({ error: "Invalid or expired code. (Demo: any 6-digit code works.)" }, { status: 400 });
      }
      const password = String(body.password ?? "");
      if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
      const passwordHash = await bcrypt.hash(password, 10);
      mutate((d) => {
        const u = d.users.find((x) => x.id === user.id);
        if (u) u.passwordHash = passwordHash;
        const idx = d.otps.findIndex((x) => x.id === otp.id);
        if (idx >= 0) d.otps.splice(idx, 1);
      });
      return NextResponse.json({ ok: true });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    mutate((d) => {
      d.otps.push({ id: uid("otp"), identifier: email, code, purpose: "reset", expiresAt: new Date(Date.now() + 15 * 60000).toISOString() });
      dispatch(d, { type: "otp", channel: "email", recipient: email, summary: `Your NEXTGEN FITNESS password reset code is ${code}. Valid for 15 minutes.` });
    });
    return NextResponse.json({ ok: true, demoHint: "Demo mode: use any 6-digit code, e.g. 123456" });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
