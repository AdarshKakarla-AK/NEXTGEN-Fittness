import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid, today, nextCounter } from "@/lib/db/store";
import { audit } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser(["admin"]);
    const db = getDB();
    const coupons = db.coupons
      .slice()
      .sort((a, b) => (b.validFrom < a.validFrom ? 1 : -1))
      .map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        maxUses: c.maxUses,
        uses: c.uses,
        validFrom: c.validFrom,
        validTo: c.validTo,
        active: c.active,
        status: c.active ? (c.uses >= c.maxUses ? "exhausted" : c.validTo < today() ? "expired" : "active") : "disabled",
      }));
    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("ADMIN COUPONS GET", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const code = String(body.code ?? "").toUpperCase().trim();
    const type = String(body.type ?? "");
    const value = Number(body.value);
    const maxUses = Number(body.maxUses ?? 100);
    const validDays = Number(body.validDays ?? 30);
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return NextResponse.json({ error: "Code must be 3–20 letters, numbers, dash or underscore." }, { status: 400 });
    if (!["percent", "flat"].includes(type)) return NextResponse.json({ error: "Type must be percent or flat." }, { status: 400 });
    if (!Number.isFinite(value) || value <= 0 || (type === "percent" && value > 100)) {
      return NextResponse.json({ error: "Invalid discount value." }, { status: 400 });
    }

    const db = getDB();
    if (db.coupons.some((c) => c.code === code)) return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });

    const from = today();
    const to = new Date(new Date(`${from}T00:00:00Z`).getTime() + validDays * 86400000).toISOString().slice(0, 10);
    mutate((d) => {
      d.coupons.push({ id: uid("cup"), code, type: type as "percent" | "flat", value, maxUses, uses: 0, validFrom: from, validTo: to, active: true });
      nextCounter(d, "couponSeq");
      audit(d, user.id, user.name, "coupon.created", code, `${type} ${value} · ${maxUses} uses · till ${to}`);
    });
    return NextResponse.json({ ok: true, code });
  } catch (err) {
    console.error("ADMIN COUPONS POST", err);
    return NextResponse.json({ error: "Could not create coupon." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const action = String(body.action ?? "");
    if (!id || action !== "toggle-active") return NextResponse.json({ error: "Missing id or action." }, { status: 400 });
    mutate((d) => {
      const coupon = d.coupons.find((c) => c.id === id);
      if (!coupon) return;
      coupon.active = !coupon.active;
      audit(d, user.id, user.name, "coupon.toggled", coupon.code, coupon.active ? "enabled" : "disabled");
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ADMIN COUPONS PATCH", err);
    return NextResponse.json({ error: "Could not update coupon." }, { status: 500 });
  }
}
