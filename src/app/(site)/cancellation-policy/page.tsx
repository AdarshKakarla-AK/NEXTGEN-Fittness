import { LegalPage, H, P, Li } from "@/components/site/LegalPage";

export const metadata = {
  title: "Cancellation Policy | NEXTGEN FITNESS",
  description: "How to cancel or pause your NEXTGEN FITNESS membership.",
};

export default function CancellationPage() {
  return (
    <LegalPage
      title="Cancellation"
      highlight="Policy"
      subtitle="How and when you can cancel, pause or transfer your membership."
      updated="1 January 2026"
    >
      <div className="space-y-3">
        <H>1. Cancelling your membership</H>
        <P>You can cancel any plan from the member dashboard or in writing at reception. Cancellations take effect at the end of the current billing period. No refunds are due for the current period, except as described in our Refund Policy.</P>
      </div>
      <div className="space-y-3">
        <H>2. Freeze / pause</H>
        <ul className="space-y-2">
          <Li>Annual and half-yearly members: up to 30 days and 14 days of free freeze respectively, per membership year.</Li>
          <Li>Monthly and quarterly members: pause from the dashboard; the billing period extends by the paused days.</Li>
          <Li>Freeze must be requested at least 48 hours before it starts.</Li>
        </ul>
      </div>
      <div className="space-y-3">
        <H>3. Transfer</H>
        <P>Memberships are non-transferable. A named alternate can be registered on Family plans per the plan&apos;s terms.</P>
      </div>
      <div className="space-y-3">
        <H>4. Termination by the club</H>
        <P>NEXTGEN FITNESS may terminate membership immediately, without refund, for behaviour that endangers staff or members, persistent non-compliance with club rules, or fraudulent activity. Remaining fees for terminated memberships are forfeited.</P>
      </div>
      <div className="space-y-3">
        <H>5. Notice period</H>
        <P>No minimum notice is required to cancel. Auto-renewals stop automatically at the end of the paid period once cancellation is confirmed. Confirmation is sent by email and SMS.</P>
      </div>
    </LegalPage>
  );
}
