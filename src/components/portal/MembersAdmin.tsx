"use client";

import * as React from "react";
import { Search, Pause, Play, Snowflake, RotateCcw, Power } from "lucide-react";
import { Card, Badge, Input, Select, Button, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

type MemberRow = {
  id: string;
  memberId?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age?: number;
  fitnessGoal: string;
  avatarColor?: string;
  active: boolean;
  joined: string;
  planName?: string;
  status?: string;
  endDate?: string;
  autoRenew?: boolean;
  lastVisit: string | null;
  visits: number;
};

const avatarColors = ["#22c55e", "#3385ff", "#f97316", "#a855f7", "#14b8a6", "#eab308", "#ef4444", "#6366f1"];

const statusTone: Record<string, "green" | "blue" | "orange" | "red" | "gray" | "gold"> = {
  active: "green",
  frozen: "blue",
  paused: "orange",
  expired: "red",
  cancelled: "gray",
};

export function MembersAdmin({ members }: { members: MemberRow[] }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ text: string; type: "success" | "error" } | null>(null);
  const [rows, setRows] = React.useState(members);

  const filtered = rows.filter((m) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q) || m.memberId?.toLowerCase().includes(q);
    const matchS = status === "all" || m.status === status;
    return matchQ && matchS;
  });

  const act = async (id: string, action: string, value?: unknown) => {
    setBusy(id);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const fresh = await (await fetch("/api/admin/members")).json();
      setRows(fresh.members);
      setMsg({ text: "Updated", type: "success" });
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed", type: "error" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone or Member ID…" className="pl-10" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Badge tone="blue">{filtered.length} shown</Badge>
        {msg && <span className={cn("text-sm font-semibold", msg.type === "success" ? "text-volt-600 dark:text-volt-400" : "text-stop-500")}>{msg.text}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-100">
              <th className="pb-2.5 pr-4 font-semibold">Member</th>
              <th className="pb-2.5 pr-4 font-semibold">Plan</th>
              <th className="pb-2.5 pr-4 font-semibold">Status</th>
              <th className="pb-2.5 pr-4 font-semibold">Renewal</th>
              <th className="pb-2.5 pr-4 font-semibold">Visits</th>
              <th className="pb-2.5 pr-4 font-semibold">Last visit</th>
              <th className="pb-2.5 pr-4 font-semibold">Account</th>
              <th className="pb-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} className="border-b border-ink-100 align-middle last:border-0 dark:border-ink-100">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} className="size-9 text-xs" color={m.avatarColor ?? avatarColors[i % avatarColors.length]} />
                    <div>
                      <p className="font-bold text-ink-900 dark:text-ink-700">{m.name}</p>
                      <p className="font-mono text-[11px] text-ink-400">{m.memberId ?? m.id} · {m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <p className="font-semibold text-ink-700">{m.planName ?? "—"}</p>
                  <p className="text-[11px] capitalize text-ink-400">{m.fitnessGoal || m.gender || "—"}</p>
                </td>
                <td className="py-3 pr-4">
                  <Badge tone={statusTone[m.status ?? ""] ?? "gray"} className="capitalize">{m.status ?? "—"}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-ink-700">{m.endDate ?? "—"}</p>
                  <p className="text-[11px] text-ink-400">{m.autoRenew ? "auto-renew" : "manual"}</p>
                </td>
                <td className="py-3 pr-4 font-bold text-ink-700">{m.visits}</td>
                <td className="py-3 pr-4 text-ink-500">{m.lastVisit ?? "—"}</td>
                <td className="py-3 pr-4">
                  <Badge tone={m.active ? "green" : "gray"}>{m.active ? "Active" : "Blocked"}</Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      title={m.status === "frozen" ? "Unfreeze" : "Freeze"}
                      disabled={busy === m.id}
                      onClick={() => act(m.id, "set-status", m.status === "frozen" ? "active" : "frozen")}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-accent-300 hover:text-accent-600 disabled:opacity-40"
                    >
                      {m.status === "frozen" ? <Play className="size-3.5" /> : <Snowflake className="size-3.5" />}
                    </button>
                    <button
                      title={m.status === "paused" ? "Resume" : "Pause"}
                      disabled={busy === m.id}
                      onClick={() => act(m.id, "set-status", m.status === "paused" ? "active" : "paused")}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-amber-300 hover:text-amber-600 disabled:opacity-40"
                    >
                      {m.status === "paused" ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                    </button>
                    <button
                      title="Renew 1 period"
                      disabled={busy === m.id}
                      onClick={() => act(m.id, "renew")}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-volt-300 hover:text-volt-600 disabled:opacity-40"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                    <button
                      title={m.active ? "Block" : "Unblock"}
                      disabled={busy === m.id}
                      onClick={() => act(m.id, "toggle-active")}
                      className={cn("inline-flex size-8 items-center justify-center rounded-lg border transition disabled:opacity-40", m.active ? "border-ink-200 text-ink-500 hover:border-stop-300 hover:text-stop-500" : "border-volt-300 text-volt-600 hover:bg-volt-50")}
                    >
                      <Power className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-400">No members match your filters.</p>}
      <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-400">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setRows(members)}>Reset list</Button>
        Actions are sandboxed to the demo database.
      </p>
    </Card>
  );
}
