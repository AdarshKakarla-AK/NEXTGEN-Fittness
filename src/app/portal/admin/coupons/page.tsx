import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import { today } from "@/lib/db/store";
import { AdminToolNav } from "@/components/portal/AdminToolNav";
import { CouponsAdmin } from "@/components/portal/CouponsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/portal");

  const db = getDB();
  const coupons = db.coupons
    .slice()
    .sort((a, b) => (b.validFrom < a.validFrom ? 1 : -1))
    .map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value,
      maxUses: c.maxUses,
      uses: c.uses,
      validFrom: c.validFrom,
      validTo: c.validTo,
      active: c.active,
      status: c.active ? (c.uses >= c.maxUses ? "exhausted" : c.validTo < today() ? "expired" : "active") : "disabled",
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-900">Coupons</h1>
          <p className="mt-1 text-sm text-ink-400">{coupons.length} promo codes · applied at registration</p>
        </div>
        <AdminToolNav active="coupons" />
      </div>
      <CouponsAdmin coupons={coupons} />
    </div>
  );
}
