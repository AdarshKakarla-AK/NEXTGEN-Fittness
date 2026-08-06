"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, KeyRound, Info } from "lucide-react";
import { Field, Input, Button } from "@/components/ui";
import { errMsg } from "@/lib/client";

const DEMO = [
  { label: "Member", email: "rahul@example.com" },
  { label: "Trainer", email: "karan@nextgenfitness.in" },
  { label: "Receptionist", email: "priya@nextgenfitness.in" },
  { label: "Admin", email: "admin@nextgenfitness.in" },
];

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      router.push(json.redirect ?? "/portal");
      router.refresh();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };
  const fill = (email: string) => {
    const form = document.querySelector<HTMLFormElement>("#login-form");
    if (!form) return;
    const input = form.querySelector<HTMLInputElement>('input[name="email"]');
    if (input) input.value = email;
  };
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card-shadow rounded-3xl border border-ink-100 bg-card p-8 dark:border-ink-100">
          <div className="text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow-glow">
              <LogIn className="size-6" />
            </span>
            <h1 className="font-display mt-4 text-2xl font-extrabold text-ink-900 dark:text-ink-700">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-400">Sign in to your member or staff account</p>
          </div>
          <form id="login-form" onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email" required>
              <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-12" />
            </Field>
            <Field label="Password" required>
              <Input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="h-12" />
            </Field>
            {error && <p className="rounded-xl border border-stop-500/25 bg-stop-500/5 px-4 py-3 text-sm font-medium text-stop-500">{error}</p>}
            <Button type="submit" className="h-12 w-full" disabled={busy}>
              <KeyRound className="size-4" /> {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/reset" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">Forgot password?</Link>
            <Link href="/register" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">Create an account</Link>
          </div>
        </div>
        <div className="card-shadow mt-5 rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-400">
            <Info className="size-3.5 text-volt-500" /> Demo accounts · password <span className="font-mono">demo123</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button key={d.email} onClick={() => fill(d.email)} className="rounded-xl border border-ink-200 px-3 py-2 text-left text-xs transition hover:border-volt-500/40 hover:bg-volt-500/5">
                <span className="block font-bold text-ink-700 dark:text-ink-600">{d.label}</span>
                <span className="block truncate text-ink-400">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
