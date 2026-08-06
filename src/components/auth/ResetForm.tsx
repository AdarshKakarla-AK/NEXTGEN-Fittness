"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { Field, Input, Button } from "@/components/ui";

export function ResetForm() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, step: sent ? "reset" : "request", otp: "123456", password: "demo123" }),
    }).catch(() => {});
    setBusy(false);
    setSent(true);
  };
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="card-shadow w-full max-w-md rounded-3xl border border-ink-100 bg-card p-8 dark:border-ink-100">
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow-glow">
            {sent ? <MailCheck className="size-6" /> : <KeyRound className="size-6" />}
          </span>
          <h1 className="font-display mt-4 text-2xl font-extrabold text-ink-900 dark:text-ink-700">{sent ? "Check your inbox" : "Reset password"}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {sent ? "A 6-digit reset code has been sent. Enter it with your new password (demo: any 6-digit code works)." : "Enter your account email and we'll send a reset code."}
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email" required>
            <Input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
          </Field>
          {sent && (
            <>
              <Field label="Reset code" required><Input name="otp" required inputMode="numeric" placeholder="6-digit code" className="h-12" /></Field>
              <Field label="New password" required><Input name="password" type="password" required minLength={6} className="h-12" /></Field>
            </>
          )}
          <Button type="submit" className="h-12 w-full" disabled={busy}>{busy ? "Please wait…" : sent ? "Set new password" : "Send reset code"}</Button>
        </form>
        <div className="mt-5 text-center text-sm">
          <Link href="/login" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
