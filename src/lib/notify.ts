import "server-only";
import type { AutomationType, NotifChannel, DB } from "./db/types";
import { uid, nowISO } from "./db/store";

/**
 * Fire-and-forget notification dispatch. With no provider configured this
 * logs a simulated entry so every automation flow is visible in the Admin
 * dashboard's Automation log — swap in real providers (Resend, Meta WhatsApp,
 * Twilio) by setting the webhook URLs in .env and wiring the adapter.
 */

interface DispatchOpts {
  type: AutomationType;
  channel: NotifChannel;
  recipient: string;
  summary: string;
}

export function dispatch(db: DB, opts: DispatchOpts): string {
  const webhookUrl = opts.channel === "email" ? process.env.EMAIL_WEBHOOK_URL : opts.channel === "whatsapp" ? process.env.WHATSAPP_WEBHOOK_URL : undefined;
  const status: "sent" | "simulated" = webhookUrl ? "sent" : "simulated";
  db.automationLogs.push({
    id: uid("al"),
    type: opts.type,
    channel: opts.channel,
    recipient: opts.recipient,
    summary: opts.summary,
    status,
    createdAt: nowISO(),
  });
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: opts.recipient, type: opts.type, title: opts.summary, body: opts.summary, meta: { channel: opts.channel } }),
    }).catch(() => {
      const entry = db.automationLogs.find((l) => l.recipient === opts.recipient && l.type === opts.type && l.status === "sent");
      if (entry) entry.status = "failed";
    });
  }
  return status;
}

export function pushNotification(db: DB, userId: string, title: string, body: string, link?: string) {
  db.notifications.push({ id: uid("notif"), userId, channel: "app", title, body, link, read: false, createdAt: nowISO() });
}

export function audit(db: DB, actorId: string, actorName: string, action: string, targetId?: string, meta?: string) {
  db.auditLogs.push({ id: uid("aud"), actorId, actorName, action, targetId, meta, createdAt: nowISO() });
}

export function logActivity(db: DB, userId: string, action: string, meta?: string) {
  db.auditLogs.push({ id: uid("aud"), actorId: userId, action, meta, createdAt: nowISO() });
}
