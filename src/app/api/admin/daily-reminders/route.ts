import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mutate } from "@/lib/db/store";
import { audit } from "@/lib/notify";
import { runDailyReminderIfDue, sendDailyReminderBatch, DEFAULT_DAILY_MESSAGE } from "@/lib/automation";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser(["admin", "receptionist"]);
    let autoFired = false;
    const state = mutate((d) => {
      const r = runDailyReminderIfDue(d);
      if (r.fired) autoFired = true;
      const s = d.settings;
      return {
        enabled: !!s.dailyReminderEnabled,
        time: s.dailyReminderTime ?? "09:00",
        message: s.dailyReminderMessage ?? DEFAULT_DAILY_MESSAGE,
        lastSentAt: s.dailyReminderLastSent ?? null,
        memberCount: d.users.filter((u) => u.role === "member" && u.active && !!u.phone).length,
      };
    });
    return NextResponse.json({ ...state, autoFired });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load daily reminders." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["admin", "receptionist"]);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "settings") {
      const enabled = body.enabled === true;
      const time = String(body.time ?? "09:00");
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NextResponse.json({ error: "Enter a valid time (HH:MM)." }, { status: 400 });
      const message = String(body.message ?? "").trim();
      if (message.length < 10) return NextResponse.json({ error: "Message is too short." }, { status: 400 });
      if (message.length > 400) return NextResponse.json({ error: "Message is too long (max 400 characters)." }, { status: 400 });
      mutate((d) => {
        d.settings.dailyReminderEnabled = enabled;
        d.settings.dailyReminderTime = time;
        d.settings.dailyReminderMessage = message;
        audit(d, user.id, user.name, "reminder.daily_config", undefined, JSON.stringify({ enabled, time }));
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "send") {
      const sent = mutate((d) => sendDailyReminderBatch(d, user.id, user.name));
      return NextResponse.json({ ok: true, sent });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not update daily reminders." }, { status: 401 });
  }
}
