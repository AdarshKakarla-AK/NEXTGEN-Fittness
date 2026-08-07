import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDB, mutate, uid, nowISO } from "@/lib/db/store";
import { audit } from "@/lib/notify";
import type { ExpenseCategory } from "@/lib/db/types";

export const runtime = "nodejs";

const CATEGORIES: ExpenseCategory[] = ["rent", "salaries", "utilities", "equipment", "marketing", "supplements", "misc"];

export async function GET() {
  try {
    await requireUser(["admin"]);
    const db = getDB();
    const month = new Date().toISOString().slice(0, 7);
    const expenses = db.expenses.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const monthly = expenses.filter((e) => e.date.slice(0, 7) === month);
    const byCategory = CATEGORIES.map((c) => ({
      category: c,
      total: monthly.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
    })).filter((c) => c.total > 0);
    return NextResponse.json({
      expenses: expenses.map((e) => ({ id: e.id, category: e.category, description: e.description, amount: e.amount, date: e.date })),
      month,
      monthlyTotal: monthly.reduce((s, e) => s + e.amount, 0),
      byCategory,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Failed to load expenses." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["admin"]);
    const body = await req.json().catch(() => ({}));
    const description = String(body.description ?? "").trim();
    if (description.length < 2) return NextResponse.json({ error: "Enter a description." }, { status: 400 });
    const category: ExpenseCategory = CATEGORIES.includes(body.category) ? body.category : "misc";
    const amount = Math.max(1, Number(body.amount) || 0);
    if (!amount) return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    const date = String(body.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10);

    mutate((d) => {
      d.expenses.push({ id: uid("exp"), category, description, amount, date, createdAt: nowISO() });
      audit(d, user.id, user.name, "expense.add", description, JSON.stringify({ category, amount, date }));
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === "UNAUTHORIZED" ? "Please sign in first." : "Could not add the expense." }, { status: 401 });
  }
}
