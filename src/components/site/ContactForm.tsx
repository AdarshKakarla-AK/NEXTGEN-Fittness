"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Field, Input, Select, Textarea, Button } from "@/components/ui";

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => {});
    setSending(false);
    setSent(true);
  };
  if (sent) {
    return (
      <div className="card-shadow flex h-full flex-col items-center justify-center rounded-3xl border border-ink-100 bg-card p-10 text-center dark:border-ink-100">
        <CheckCircle2 className="size-14 text-volt-500" />
        <h3 className="font-display mt-5 text-2xl font-extrabold text-ink-900 dark:text-ink-700">Message received!</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Our team will get back to you within one business day. For urgent queries, call us at +91 98765 43210.
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="card-shadow rounded-3xl border border-ink-100 bg-card p-8 dark:border-ink-100">
      <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">Send us a message</h2>
      <p className="mt-1 text-sm text-ink-400">Replies within one business day.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <Input name="name" required placeholder="Your name" autoComplete="name" />
        </Field>
        <Field label="Phone">
          <Input name="phone" placeholder="+91 …" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Email" required>
          <Input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Interest">
          <Select name="interest" defaultValue="General enquiry">
            {["General enquiry", "Membership plans", "Personal training", "Nutrition coaching", "Corporate / bulk", "Franchise", "Something else"].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message" required>
            <Textarea name="message" required rows={5} placeholder="Tell us what you need…" />
          </Field>
        </div>
      </div>
      <Button type="submit" className="mt-6 w-full" disabled={sending}>
        <Send className="size-4" /> {sending ? "Sending…" : "Send message"}
      </Button>
      <p className="mt-3 text-center text-[11px] text-ink-400">By submitting, you agree to our Privacy Policy and consent to being contacted.</p>
    </form>
  );
}
