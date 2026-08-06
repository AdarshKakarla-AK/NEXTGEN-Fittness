import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = {
  title: "Franchise | NEXTGEN FITNESS",
  description: "NEXTGEN FITNESS franchise opportunities across India.",
};

export default function FranchisePage() {
  return (
    <ComingSoon
      eyebrow="Franchise"
      title="Own the next"
      highlight="NEXTGEN club."
      subtitle="A proven operating model, an industry-leading tech platform and a brand people trust."
      what="Franchise applications for Tier-1 and Tier-2 cities — with full SOPs, trainer hiring pipelines, the NEXTGEN member app and central marketing support."
      targets={[
        "Models from 8,000 to 30,000 sq ft",
        "Fully equipped fit-out partner network",
        "The complete NEXTGEN software suite included",
        "Dedicated operations and hiring support",
      ]}
      preview={["Franchise Deck", "Site Selection Guide", "Operations Manual"]}
    />
  );
}
