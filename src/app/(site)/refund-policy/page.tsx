import { LegalPage, H, P, Li } from "@/components/site/LegalPage";

export const metadata = {
  title: "Refund Policy | NEXTGEN FITNESS",
  description: "NEXTGEN FITNESS refund policy for memberships, personal training and shop purchases.",
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund"
      highlight="Policy"
      subtitle="Our refund terms for memberships, PT packs and retail purchases."
      updated="1 January 2026"
    >
      <div className="space-y-3">
        <H>1. Memberships</H>
        <ul className="space-y-2">
          <Li>Monthly plans: no refund after the billing cycle starts; cancel before renewal to avoid the next charge.</Li>
          <Li>Quarterly and half-yearly: refund of the unused portion (pro-rata) minus a 15% processing fee, requested within 14 days of cancellation.</Li>
          <Li>Annual plans: pro-rata refund minus a 15% processing fee, after the first 3 months of the plan.</Li>
          <Li>Premium and Elite: no refund on the PT allowance once any session is used; unused membership time refunds pro-rata per the above.</Li>
        </ul>
        <P>All refunds are processed to the original payment method within 7–10 business days.</P>
      </div>
      <div className="space-y-3">
        <H>2. Personal training packs</H>
        <ul className="space-y-2">
          <Li>Unused sessions are refundable in full within 7 days of purchase.</Li>
          <Li>After 7 days, unused sessions are refunded at 85% of the per-session rate.</Li>
          <Li>Packs are non-transferable between members.</Li>
        </ul>
      </div>
      <div className="space-y-3">
        <H>3. Shop purchases</H>
        <ul className="space-y-2">
          <Li>Unopened supplements and apparel can be returned within 7 days for a full refund.</Li>
          <Li>Opened consumables (whey, pre-workout) are non-refundable for hygiene reasons unless defective.</Li>
          <Li>Clearance items are final sale.</Li>
        </ul>
      </div>
      <div className="space-y-3">
        <H>4. How to request a refund</H>
        <P>Request in writing at reception or via <a href="mailto:care@nextgenfitness.in" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">care@nextgenfitness.in</a> with your member ID and reason. Refund requests for memberships must be submitted within the time frames above; disputed charges are reviewed within 5 business days.</P>
      </div>
      <div className="space-y-3">
        <H>5. Coupons, credits &amp; referrals</H>
        <P>Referral credits are non-refundable and expire 12 months from issue. Coupon discounts are applied at checkout and are not refundable as cash if the plan is later cancelled; the refund is calculated on the net amount paid.</P>
      </div>
    </LegalPage>
  );
}
