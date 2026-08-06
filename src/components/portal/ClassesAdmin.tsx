"use client";

import * as React from "react";
import { Eye, EyeOff, Users } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type ClassRow = {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  intensity: string;
  capacity: number;
  color: string;
  active: boolean;
  trainer: string;
  room: string;
  schedule: { day: string; time: string }[];
  upcoming: number;
  fillRate: number;
};

const intensityTone: Record<string, "green" | "blue" | "gold" | "red"> = {
  Low: "green",
  Moderate: "blue",
  High: "red",
};

export function ClassesAdmin({ classes }: { classes: ClassRow[] }) {
  const [rows, setRows] = React.useState(classes);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const patch = async (id: string, action: string, value?: unknown) => {
    setBusy(id);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const fresh = await (await fetch("/api/admin/classes")).json();
      setRows(fresh.classes);
      setMsg({ text: "Updated", type: "success" });
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", type: "error" });
    } finally {
      setBusy(null);
    }
  };

  const changeCapacity = (id: string, delta: number) => {
    const cls = rows.find((c) => c.id === id);
    if (!cls) return;
    patch(id, "set-capacity", cls.capacity + delta);
  };

  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-900">Timetable</h2>
        {msg && <span className={cn("text-sm font-semibold", msg.type === "success" ? "text-volt-600 dark:text-volt-400" : "text-stop-500")}>{msg.text}</span>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className={cn("rounded-xl border p-4 transition dark:border-ink-100", c.active ? "border-ink-100 bg-card" : "border-ink-100 bg-ink-50/60 opacity-70 dark:bg-ink-100")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white" style={{ backgroundColor: c.color }}>
                  {c.category.slice(0, 4).toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-ink-900 dark:text-ink-700">{c.name}</p>
                  <p className="text-xs text-ink-400">{c.trainer} · {c.room}</p>
                </div>
              </div>
              <button
                onClick={() => patch(c.id, "toggle-active")}
                disabled={busy === c.id}
                className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition disabled:opacity-40", c.active ? "border-volt-300 text-volt-600 hover:bg-volt-50" : "border-ink-200 text-ink-400 hover:text-ink-600")}
                title={c.active ? "Hide from site" : "Publish to site"}
              >
                {c.active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge tone={intensityTone[c.intensity] ?? "gray"}>{c.intensity}</Badge>
              <Badge tone="gray">{c.durationMin} min</Badge>
              <Badge tone={c.active ? "green" : "gray"}>{c.active ? "Published" : "Hidden"}</Badge>
            </div>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Schedule</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {c.schedule.map((s, i) => (
                <span key={i} className="rounded-md bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-600 dark:bg-ink-100 dark:text-ink-500">
                  {s.day} {s.time}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 dark:border-ink-100">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                  <Users className="size-4 text-accent-500" /> {c.upcoming} booked
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-7 w-7 px-0 text-sm" disabled={busy === c.id || c.capacity <= 1} onClick={() => changeCapacity(c.id, -5)} aria-label="Reduce capacity">
                  −
                </Button>
                <span className="w-12 text-center text-xs font-bold text-ink-700">cap {c.capacity}</span>
                <Button size="sm" variant="outline" className="h-7 w-7 px-0 text-sm" disabled={busy === c.id || c.capacity >= 200} onClick={() => changeCapacity(c.id, 5)} aria-label="Increase capacity">
                  +
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-ink-400">Fill rate</span>
                <span className="text-ink-700">{c.fillRate}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-100">
                <div className="h-full rounded-full bg-gradient-to-r from-volt-500 to-accent-500" style={{ width: `${c.fillRate}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && <p className="py-10 text-center text-sm text-ink-400">No classes found.</p>}
    </Card>
  );
}
