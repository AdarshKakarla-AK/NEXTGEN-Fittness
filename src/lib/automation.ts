import "server-only";
import type { DB } from "./db/types";
import { nowISO } from "./db/store";
import { dispatch, audit } from "./notify";

export const DEFAULT_DAILY_MESSAGE = "Good morning from NEXTGEN FITNESS! Daily reminder — hydrate, move and make today count. See you at the club!";

/**
 * Sends the daily WhatsApp reminder to every active member and records the
 * batch. Fire-and-forget via `dispatch`, so without a real provider this shows
 * up as simulated entries in the automation log. Call inside `mutate()` so the
 * batch persists.
 */
export function sendDailyReminderBatch(db: DB, actorId: string, actorName: string): number {
  const s = db.settings;
  const message = (s.dailyReminderMessage ?? DEFAULT_DAILY_MESSAGE)
    .replace(/\{gym\}/g, s.name)
    .replace(/\{city\}/g, s.city);
  let sent = 0;
  for (const u of db.users) {
    if (u.role === "member" && u.active && u.phone) {
      dispatch(db, { type: "daily_reminder", channel: "whatsapp", recipient: u.phone, summary: message });
      sent += 1;
    }
  }
  s.dailyReminderLastSent = nowISO();
  audit(db, actorId, actorName, "reminder.daily", undefined, `${sent} daily reminder(s) sent via WhatsApp`);
  return sent;
}

/**
 * Runs the daily automation if it is enabled, has not already fired today and
 * the current time is at/after the configured send time. Returns whether it
 * fired and how many reminders were sent. Call inside `mutate()`.
 */
export function runDailyReminderIfDue(db: DB): { fired: boolean; sent: number } {
  const s = db.settings;
  if (!s.dailyReminderEnabled) return { fired: false, sent: 0 };
  if (s.dailyReminderLastSent && s.dailyReminderLastSent.slice(0, 10) === nowISO().slice(0, 10)) {
    return { fired: false, sent: 0 };
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [th, tm] = (s.dailyReminderTime ?? "09:00").split(":").map((n) => Number(n) || 0);
  if (nowMin < th * 60 + tm) return { fired: false, sent: 0 };
  return { fired: true, sent: sendDailyReminderBatch(db, "system", "System") };
}
