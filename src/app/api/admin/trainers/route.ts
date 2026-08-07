import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, nowISO } from "@/lib/db/store";
import { audit } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser(["admin"]);
    const db = getDB();
    return NextResponse.json({
      trainers: db.users
        .filter((u) => u.role === "trainer")
        .map((t) => ({
          id: t.id,
          name: t.name,
          phone: t.phone,
          email: t.email ?? "",
          specialization: t.specialization ?? [],
          languages: t.languages ?? [],
          certifications: t.certifications ?? [],
          hourlyRate: t.hourlyRate ?? 0,
          yearsExp: t.yearsExp ?? 0,
          rating: t.rating ?? 0,
          reviewCount: t.reviewCount ?? 0,
          bio: t.bio ?? "",
          active: t.active,
        })),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load trainers." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "update") {
      const id = String(body.id ?? "");
      const name = String(body.name ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      const email = String(body.email ?? "").trim();
      if (name.length < 2) return NextResponse.json({ error: "Enter the trainer's name." }, { status: 400 });
      if (!/^[0-9+\-\s]{8,15}$/.test(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

      const specializations = (Array.isArray(body.specializations) ? body.specializations : [])
        .map((s: unknown) => String(s).trim())
        .filter(Boolean)
        .slice(0, 8);
      const languages = (Array.isArray(body.languages) ? body.languages : [])
        .map((s: unknown) => String(s).trim())
        .filter(Boolean)
        .slice(0, 8);
      const hourlyRate = Math.max(0, Number(body.hourlyRate) || 0);
      const yearsExp = Math.max(0, Number(body.yearsExp) || 0);
      const rating = Math.min(5, Math.max(0, Number(body.rating) || 0));
      const reviewCount = Math.max(0, Math.round(Number(body.reviewCount) || 0));
      const active = body.active !== false;
      const bio = String(body.bio ?? "").trim().slice(0, 300);

      let found = false;
      mutate((d) => {
        const t = d.users.find((u) => u.id === id && u.role === "trainer");
        if (!t) return;
        found = true;
        t.name = name;
        t.phone = phone;
        t.email = email || undefined;
        t.specialization = specializations;
        t.languages = languages;
        t.hourlyRate = hourlyRate;
        t.yearsExp = yearsExp;
        t.rating = rating;
        t.reviewCount = reviewCount;
        t.active = active;
        t.bio = bio;
        t.updatedAt = nowISO();
        audit(d, user.id, user.name, "trainer.update", id, JSON.stringify({ name, phone, hourlyRate, active }));
      });
      if (!found) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not update the trainer." }, { status: 401 });
  }
}
