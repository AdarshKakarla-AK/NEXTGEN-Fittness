import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = {
  title: "Blog | NEXTGEN FITNESS",
  description: "NEXTGEN FITNESS blog — training, nutrition and recovery guides from our coaches. Launching soon.",
};

export default function BlogPage() {
  return (
    <ComingSoon
      eyebrow="Blog"
      title="Training science,"
      highlight="no bro-science."
      subtitle="Guides, programs and myth-busting from the NEXTGEN coaching team."
      what="A coach-written library covering strength, fat loss, nutrition, recovery and mindset — practical, evidence-based and free for members."
      targets={[
        "Weekly articles from our 18 coaches",
        "Downloadable 4-week workout templates",
        "Myth-busting nutrition series",
        "Member Q&A — ask our physios anything",
      ]}
      preview={["The 4-Day Upper/Lower Split", "Protein intake: the honest guide", "How to actually fix your posture"]}
    />
  );
}
