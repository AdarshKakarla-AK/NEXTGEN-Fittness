import { LegalPage, H, P, Li } from "@/components/site/LegalPage";

export const metadata = {
  title: "Privacy Policy | NEXTGEN FITNESS",
  description: "How NEXTGEN FITNESS collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      highlight="Policy"
      subtitle="How we collect, use, protect and share your personal information."
      updated="1 January 2026"
    >
      <div className="space-y-3">
        <H>1. What we collect</H>
        <ul className="space-y-2">
          <Li>Identity &amp; contact: name, email, phone, address, date of birth, government ID (for verification).</Li>
          <Li>Health &amp; fitness: height, weight, goals, medical disclosures, body scans, workout and attendance logs.</Li>
          <Li>Payment: card or UPI details processed through our payment partners — we never store full card numbers.</Li>
          <Li>Usage: app activity, class bookings, check-ins and support interactions.</Li>
        </ul>
      </div>
      <div className="space-y-3">
        <H>2. How we use it</H>
        <P>We use your data to provide club access, manage membership and billing, deliver coaching and nutrition services, operate the member app, send essential service communications, and improve our facilities. Marketing communications are opt-in only.</P>
      </div>
      <div className="space-y-3">
        <H>3. Sharing</H>
        <P>We never sell your data. We share it only with:</P>
        <ul className="space-y-2">
          <Li>Payment processors and partners required to deliver the service.</Li>
          <Li>Coaches, physios and nutritionists bound by confidentiality.</Li>
          <Li>Government authorities where legally required.</Li>
        </ul>
      </div>
      <div className="space-y-3">
        <H>4. Security</H>
        <P>Data is encrypted in transit and at rest. Access is role-based and audited. We comply with applicable data protection law, including India&apos;s DPDP Act, 2023.</P>
      </div>
      <div className="space-y-3">
        <H>5. Your rights</H>
        <P>You may access, correct, export or delete your personal data, and withdraw marketing consent, at any time. To exercise any of these rights, email <a href="mailto:privacy@nextgenfitness.in" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">privacy@nextgenfitness.in</a>. We respond within 30 days.</P>
      </div>
      <div className="space-y-3">
        <H>6. Retention</H>
        <P>We retain data while your account is active and for as long as needed for billing, legal and audit purposes (up to 7 years for financial records). You may request earlier deletion where law permits.</P>
      </div>
    </LegalPage>
  );
}
