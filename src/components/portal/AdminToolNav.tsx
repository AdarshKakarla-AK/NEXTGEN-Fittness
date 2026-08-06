import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminTool = "overview" | "members" | "coupons" | "classes";

const TOOLS: { id: AdminTool; label: string; href: string }[] = [
  { id: "overview", label: "Overview", href: "/portal/admin" },
  { id: "members", label: "Members", href: "/portal/admin/members" },
  { id: "coupons", label: "Coupons", href: "/portal/admin/coupons" },
  { id: "classes", label: "Classes", href: "/portal/admin/classes" },
];

export function AdminToolNav({ active }: { active: AdminTool }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TOOLS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold transition",
            active === t.id ? "bg-ink-900 text-white shadow dark:bg-ink-700" : "border border-ink-100 bg-card text-ink-500 hover:text-ink-800 dark:border-ink-100"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
