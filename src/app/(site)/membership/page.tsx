import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { FAQSection } from "@/components/site/FAQ";
import { PlansSection, CompareTable, PlanPerks } from "@/components/site/PlansSection";

export const metadata = {
  title: "Membership Plans & Pricing | NEXTGEN FITNESS",
  description:
    "Flexible gym membership plans in Bengaluru — monthly to elite 24×7, with freeze, coupons, referrals and zero lock-in. Compare plans side by side.",
};

export default function MembershipPage() {
  const db = getDB();
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Membership plans that"
        highlight="fit your life."
        subtitle="No lock-in contracts, freeze anytime, cancel anytime. Every plan includes the full member app and one group class a day."
        crumbs={[{ label: "Home", href: "/" }, { label: "Membership" }]}
      />
      <PlansSection plans={db.plans} />
      <CompareTable plans={db.plans} gstin={db.settings.gstin} />
      <PlanPerks />
      <CTAStrip />
      <FAQSection title="Membership questions" subtitle="Everything about plans, billing, freezing and renewals." />
      <FinalCTA />
    </>
  );
}
