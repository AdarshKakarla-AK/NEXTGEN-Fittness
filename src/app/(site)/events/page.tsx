import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = {
  title: "Events | NEXTGEN FITNESS",
  description: "NEXTGEN FITNESS events — challenges, workshops and member meetups. Launching soon.",
};

export default function EventsPage() {
  return (
    <ComingSoon
      eyebrow="Events"
      title="Challenges,"
      highlight="workshops, community."
      subtitle="From 30-day transformation challenges to weekend mobility clinics."
      what="A full events calendar — quarterly transformation challenges, guest workshops, lifting meets and member socials, all bookable from the app."
      targets={[
        "30-day transformation challenges with prizes",
        "Guest coach workshops (yoga, mobility, nutrition)",
        "Quarterly in-house lifting competitions",
        "Member socials and family days",
      ]}
      preview={["Summer Shred Challenge", "Weekend Mobility Clinic", "NEXTGEN Lifting Meet"]}
    />
  );
}
