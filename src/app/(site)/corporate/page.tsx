import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = {
  title: "Corporate Wellness | NEXTGEN FITNESS",
  description: "Corporate wellness programs for Bengaluru companies — gym access, on-site sessions and HR dashboards.",
};

export default function CorporatePage() {
  return (
    <ComingSoon
      eyebrow="Corporate"
      title="Healthier teams,"
      highlight="stronger companies."
      subtitle="Partner with 40+ Bengaluru companies to build a healthier workforce."
      what="A dedicated corporate wellness program — discounted memberships, on-site training and a live HR dashboard showing team participation and health trends."
      targets={[
        "Company memberships from ₹1,499/employee/month",
        "On-site yoga, HIIT and ergonomics workshops",
        "Live participation and engagement dashboard for HR",
        "Annual health screening + body scan camps",
      ]}
      preview={["Corporate Membership", "On-site Workshops", "HR Health Dashboard"]}
    />
  );
}
