import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = {
  title: "Careers | NEXTGEN FITNESS",
  description: "Careers at NEXTGEN FITNESS — coaching, front desk and operations roles in Bengaluru.",
};

export default function CareersPage() {
  return (
    <ComingSoon
      eyebrow="Careers"
      title="Do work that"
      highlight="builds people."
      subtitle="Coaching, operations and leadership roles at India's most modern fitness club."
      what="A careers portal for coaching, front desk, fitness tech and operations roles — with transparent pay ranges, growth paths and a real application process."
      targets={[
        "Certified PT, yoga, boxing and CrossFit coaching roles",
        "Front desk and member-experience positions",
        "Internships in fitness technology and operations",
        "Learning budget + free membership for every team member",
      ]}
      preview={["Strength Coach — MG Road", "Member Experience Lead", "Fitness Tech Intern"]}
    />
  );
}
