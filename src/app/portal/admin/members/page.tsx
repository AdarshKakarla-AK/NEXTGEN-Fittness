import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDB } from "@/lib/db/store";
import { AdminToolNav } from "@/components/portal/AdminToolNav";
import { MembersAdmin } from "@/components/portal/MembersAdmin";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/portal");

  const db = getDB();
  const members = db.users
    .filter((u) => u.role === "member")
    .map((m) => {
      const membership = db.memberships.find((ms) => ms.memberId === m.id);
      const lastVisit = db.attendance
        .filter((a) => a.memberId === m.id)
        .map((a) => a.date)
        .sort()
        .at(-1);
      return {
        id: m.id,
        memberId: m.memberId,
        name: m.name,
        email: m.email ?? "",
        phone: m.phone,
        gender: m.gender ?? "",
        age: m.age,
        fitnessGoal: m.fitnessGoal ?? "",
        avatarColor: m.avatarColor,
        active: m.active,
        joined: m.createdAt.slice(0, 10),
        planName: membership?.planName,
        status: membership?.status,
        endDate: membership?.endDate,
        autoRenew: membership?.autoRenew,
        lastVisit: lastVisit ?? null,
        visits: db.attendance.filter((a) => a.memberId === m.id).length,
      };
    })
    .sort((a, b) => (a.joined < b.joined ? 1 : -1));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-900">Members</h1>
          <p className="mt-1 text-sm text-ink-400">{members.length} total · manage status, renewals and access</p>
        </div>
        <AdminToolNav active="members" />
      </div>
      <MembersAdmin members={members} />
    </div>
  );
}
