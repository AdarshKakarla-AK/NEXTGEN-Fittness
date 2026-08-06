"use client";

import * as React from "react";
import { Plus, Power, Tag } from "lucide-react";
import { Card, Badge, Input, Select, Button, Field } from "@/components/ui";
import { cn } from "@/lib/utils";

type CouponRow = {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  maxUses: number;
  uses: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  status: string;
};

const statusTone: Record<string, "green" | "blue" | "orange" | "red" | "gray"> = {
  active: "green",
  disabled: "gray",
  exhausted: "orange",
  expired: "red",
};

export function CouponsAdmin({ coupons }: { coupons: CouponRow[] }) {
  const [rows, setRows] = React.useState(coupons);
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<"percent" | "flat">("percent");
  const [value, setValue] = React.useState("10");
  const [maxUses, setMaxUses] = React.useState("100");
  const [validDays, setValidDays] = React.useState("30");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/admin/coupons");
    const json = await res.json();
    setRows(json.coupons);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, value: Number(value), maxUses: Number(maxUses), validDays: Number(validDays) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create coupon");
      setOk(`Coupon ${json.code} created.`);
      setCode("");
      await refresh();
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (id: string) => {
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle-active" }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
    } catch {
      setErr("Could not update coupon");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-ink-900">
          <Plus className="size-5 text-volt-600 dark:text-volt-400" /> New coupon
        </h2>
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Field label="Code" required>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="FESTIVE25" required />
          </Field>
          <Field label="Type" required>
            <Select value={type} onChange={(e) => setType(e.target.value as "percent" | "flat")}>
              <option value="percent">Percent %</option>
              <option value="flat">Flat ₹</option>
            </Select>
          </Field>
          <Field label={type === "percent" ? "Value (%)" : "Value (₹)"} required>
            <Input type="number" min={1} max={type === "percent" ? 100 : undefined} value={value} onChange={(e) => setValue(e.target.value)} required />
          </Field>
          <Field label="Max uses" required>
            <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} required />
          </Field>
          <Field label="Valid days" required>
            <Input type="number" min={1} value={validDays} onChange={(e) => setValidDays(e.target.value)} required />
          </Field>
          <div className="flex items-end sm:col-span-2 lg:col-span-6">
            <Button type="submit" loading={busy} className="w-full sm:w-auto">Create coupon</Button>
            <div className="ml-4 space-x-2 text-sm">
              {ok && <span className="font-semibold text-volt-600 dark:text-volt-400">{ok}</span>}
              {err && <span className="font-semibold text-stop-500">{err}</span>}
            </div>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-ink-900">
            <Tag className="size-5 text-volt-600 dark:text-volt-400" /> Active & historical codes
          </h2>
          <Badge tone="blue">{rows.length} codes</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => {
            const pctUsed = c.maxUses ? Math.round((c.uses / c.maxUses) * 100) : 0;
            return (
              <div key={c.id} className={cn("rounded-xl border p-4 dark:border-ink-100", c.active ? "border-volt-200/60 bg-volt-500/[0.03]" : "border-ink-100 bg-ink-50/50 dark:bg-ink-100")}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold tracking-wide text-ink-900 dark:text-ink-700">{c.code}</span>
                  <button
                    onClick={() => toggle(c.id)}
                    className={cn("inline-flex size-8 items-center justify-center rounded-lg border transition", c.active ? "border-volt-300 text-volt-600 hover:bg-volt-50" : "border-ink-200 text-ink-400 hover:text-ink-600")}
                    title={c.active ? "Disable" : "Enable"}
                  >
                    <Power className="size-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-700">{c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`}</p>
                <p className="mt-1 text-xs text-ink-400">Valid {c.validFrom} → {c.validTo}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={statusTone[c.status] ?? "gray"} className="capitalize">{c.status}</Badge>
                  <span className="text-xs text-ink-400">{c.uses}/{c.maxUses} used</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-100">
                  <div className={cn("h-full rounded-full", c.status === "exhausted" ? "bg-orange-500" : "bg-volt-500")} style={{ width: `${pctUsed}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {rows.length === 0 && <p className="py-10 text-center text-sm text-ink-400">No coupons yet. Create your first promo code above.</p>}
      </Card>
    </div>
  );
}
