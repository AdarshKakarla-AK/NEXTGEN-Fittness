import { getDB } from "@/lib/db/store";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Join NEXTGEN FITNESS | Register",
  description: "Join NEXTGEN FITNESS in under 2 minutes — no joining fee, instant member ID and QR membership card.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const db = getDB();
  const plans = db.plans.filter((p) => !["corporate"].includes(p.tier));
  const initialPlanId = plans.find((p) => p.slug === plan)?.id ?? "plan_monthly";
  return <RegisterForm plans={plans} initialPlanId={initialPlanId} />;
}
