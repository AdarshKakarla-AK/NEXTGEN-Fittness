import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid } from "@/lib/db/store";
import { pushNotification, audit } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser(["member"]);
    const db = getDB();
    const referral = db.referrals.find((r) => r.ownerId === user.id);
    const referred = user.referredBy ? db.users.find((u) => u.id === user.referredBy) : undefined;
    return NextResponse.json({
      code: user.referralCode ?? referral?.code ?? null,
      uses: referral?.uses ?? 0,
      rewardPoints: referral?.rewardPoints ?? 0,
      totalRewarded: referral?.totalRewarded ?? 0,
      referredByName: referred?.name ?? null,
      discountPct: db.settings.referralDiscountPct ?? 10,
      referralCount: db.users.filter((u) => u.referredBy === user.id).length,
      link: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/register?ref=${user.referralCode ?? referral?.code ?? ""}`,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load referral info." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["member"]);
    const body = await req.json().catch(() => ({}));
    const code = String(body.code ?? "").trim().toUpperCase();

    let applied = false;
    mutate((d) => {
      const owner = d.users.find((u) => (u.referralCode ?? "").toUpperCase() === code || d.referrals.some((r) => r.ownerId === u.id && r.code.toUpperCase() === code));
      if (!owner || owner.id === user.id) return;
      const me = d.users.find((u) => u.id === user.id);
      if (!me || me.referredBy) return;

      me.referredBy = owner.id;
      const ownerRef = d.referrals.find((r) => r.ownerId === owner.id);
      const points = 200;
      if (ownerRef) {
        ownerRef.uses += 1;
        ownerRef.rewardPoints += points;
      } else {
        d.referrals.push({ id: uid("ref"), code: owner.referralCode ?? code, ownerId: owner.id, uses: 1, rewardPoints: points, totalRewarded: 0 });
      }
      pushNotification(d, owner.id, `You got a referral!`, `${me.name} joined with your code — +${points} reward points (${d.settings.referralDiscountPct}% off next renewal).`);
      pushNotification(d, user.id, "Referral applied", `You're now connected to ${owner.name}. Enjoy ${d.settings.referralDiscountPct}% off your next renewal.`);
      audit(d, user.id, user.name, "referral.applied", owner.id, `Code ${code}`);
      applied = true;
    });

    if (!applied) return NextResponse.json({ error: "That referral code is invalid or already used." }, { status: 400 });
    return NextResponse.json({ ok: true, message: "Referral applied!" });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not apply referral." }, { status: 401 });
  }
}
