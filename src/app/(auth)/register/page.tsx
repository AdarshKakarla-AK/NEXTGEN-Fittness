import { getDB } from "@/lib/db/store";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Join NEXTGEN FITNESS | Register",
  description: "Join NEXTGEN FITNESS in under 2 minutes — no joining fee, instant member ID and QR membership card.",
};

export default function RegisterPage() {
  const db = getDB();
  const plans = db.plans.filter((p) => !["corporate"].includes(p.tier));
  return <RegisterForm plans={plans} />;
}
