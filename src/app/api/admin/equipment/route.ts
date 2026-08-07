import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid, today } from "@/lib/db/store";
import { isoDaysFromNow } from "@/lib/utils";
import { audit } from "@/lib/notify";
import type { EquipmentStatus } from "@/lib/db/types";

export const runtime = "nodejs";

const STATUSES: EquipmentStatus[] = ["operational", "maintenance", "repair", "out_of_service"];

export async function GET() {
  try {
    await requireUser(["admin"]);
    const db = getDB();
    return NextResponse.json({
      equipment: db.equipment.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        status: e.status,
        usageHours: e.usageHours,
        lastMaintenance: e.lastMaintenance ?? null,
        nextMaintenance: e.nextMaintenance ?? null,
        warrantyExpiry: e.warrantyExpiry ?? null,
        amcProvider: e.amcProvider ?? null,
        notes: e.notes ?? null,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load equipment." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "add") {
      const name = String(body.name ?? "").trim();
      const category = String(body.category ?? "Strength").trim();
      if (name.length < 2) return NextResponse.json({ error: "Enter the equipment name." }, { status: 400 });
      const status: EquipmentStatus = STATUSES.includes(body.status) ? body.status : "operational";
      mutate((d) => {
        d.equipment.push({
          id: uid("eq"),
          name,
          category: category || "Strength",
          status,
          usageHours: Math.max(0, Number(body.usageHours) || 0),
          lastMaintenance: body.lastMaintenance ? String(body.lastMaintenance).slice(0, 10) : today(),
          amcProvider: body.amcProvider ? String(body.amcProvider).slice(0, 60) : undefined,
          notes: body.notes ? String(body.notes).slice(0, 200) : undefined,
        });
        audit(d, user.id, user.name, "equipment.add", name, JSON.stringify({ category, status }));
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "status") {
      const id = String(body.id ?? "");
      const status = String(body.status ?? "");
      if (!STATUSES.includes(status as EquipmentStatus)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      mutate((d) => {
        const item = d.equipment.find((e) => e.id === id);
        if (!item) return;
        item.status = status as EquipmentStatus;
        if (status === "operational") {
          item.lastMaintenance = today();
          item.nextMaintenance = isoDaysFromNow(30);
        }
        audit(d, user.id, user.name, "equipment.status", item.name, status);
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not update equipment." }, { status: 401 });
  }
}
