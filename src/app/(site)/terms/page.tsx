import { LegalPage, H, P, Li } from "@/components/site/LegalPage";

export const metadata = {
  title: "Terms of Service | NEXTGEN FITNESS",
  description: "The terms governing use of NEXTGEN FITNESS facilities and services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of"
      highlight="Service"
      subtitle="The agreement between you and NEXTGEN FITNESS for use of our facilities, app and services."
      updated="1 January 2026"
    >
      <div className="space-y-3">
        <H>1. Membership</H>
        <P>Membership is personal and non-transferable. Members must be at least 15 years old (under-18s require a guardian&apos;s consent) and must present a valid government ID at onboarding. NEXTGEN FITNESS reserves the right to refuse or cancel membership at our discretion.</P>
      </div>
      <div className="space-y-3">
        <H>2. Payments &amp; billing</H>
        <P>Plan prices are listed inclusive of GST. Payments are due before the membership period begins. Auto-renewal (where enabled) is billed to the card on file; you may disable auto-renew at any time from the member dashboard or by contacting reception at least 7 days before renewal.</P>
        <ul className="space-y-2">
          <Li>Joining fee of ₹500 applies to monthly and quarterly plans; waived on annual plans during current offers.</Li>
          <Li>Prices shown on the website may be updated; your plan rate stays locked for its duration.</Li>
        </ul>
      </div>
      <div className="space-y-3">
        <H>3. Conduct &amp; safety</H>
        <P>Members must follow coaching instructions, use equipment safely and treat staff and members with respect. The club is a shoe-free, smoke-free, alcohol-free and substance-free environment. Violations may result in suspension or termination of membership.</P>
      </div>
      <div className="space-y-3">
        <H>4. Health &amp; medical</H>
        <P>You confirm you are physically fit to exercise and have disclosed any medical conditions during onboarding. NEXTGEN FITNESS is not liable for injuries arising from misuse of equipment, failure to follow instructions, or pre-existing conditions. Consult your physician before beginning any program.</P>
      </div>
      <div className="space-y-3">
        <H>5. Property</H>
        <P>Lockers are provided free during your session; valuables are stored at your own risk. NEXTGEN FITNESS is not responsible for lost or stolen items.</P>
      </div>
      <div className="space-y-3">
        <H>6. Liability</H>
        <P>To the maximum extent permitted by law, NEXTGEN FITNESS, its owners, employees and coaches are not liable for indirect or consequential damages, or for any claim arising from your use of the facilities. This does not affect your statutory rights.</P>
      </div>
    </LegalPage>
  );
}
