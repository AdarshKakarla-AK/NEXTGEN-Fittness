"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function WeightTrendChart({ data }: { data: { label: string; weight: number; bodyFat?: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-100" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} stroke="currentColor" className="text-ink-400" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--ink-200)", background: "var(--card)" }} labelStyle={{ fontWeight: 700 }} />
          <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="bodyFat" name="Body fat %" stroke="#3385ff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WorkoutBarsChart({ data }: { data: { label: string; minutes: number; sessions: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-100" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--ink-200)", background: "var(--card)" }} cursor={{ fill: "var(--ink-100)" }} />
          <Bar dataKey="minutes" name="Minutes" fill="#22c55e" radius={[8, 8, 0, 0]} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendAreaChart({ data, series }: { data: { label: string; [key: string]: string | number }[]; series: { key: string; name: string; color: string }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-100" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--ink-200)", background: "var(--card)" }} />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} fill={`url(#grad-${s.key})`} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["#22c55e", "#3385ff", "#f97316", "#a855f7", "#14b8a6", "#eab308", "#ef4444", "#6366f1"];

export function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--ink-200)", background: "var(--card)" }} />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
