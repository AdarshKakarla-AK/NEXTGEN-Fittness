import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { GalleryGrid } from "@/components/site/GalleryGrid";

export const metadata = {
  title: "Gallery | NEXTGEN FITNESS",
  description:
    "Take a visual tour of NEXTGEN FITNESS — a 30,000 sq ft premium gym in Bengaluru with three floors of training space.",
};

const IMAGES = [
  { src: "/images/gallery-1.svg", alt: "Main strength floor at NEXTGEN FITNESS", tag: "Strength" },
  { src: "/images/gallery-2.svg", alt: "Cardio deck with treadmills and rowers", tag: "Cardio" },
  { src: "/images/gallery-3.svg", alt: "Studio 1 — mind & body classes", tag: "Studio" },
  { src: "/images/gallery-4.svg", alt: "HIIT deck during a CrossFit WOD", tag: "HIIT" },
  { src: "/images/gallery-5.svg", alt: "Boxing ring and heavy bags", tag: "Boxing" },
  { src: "/images/gallery-6.svg", alt: "Recovery suite with stretch area", tag: "Recovery" },
  { src: "/images/gallery-7.svg", alt: "Free weights zone at night", tag: "Strength" },
  { src: "/images/gallery-8.svg", alt: "Members' lounge and juice bar", tag: "Lounge" },
];

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Come see"
        highlight="your future."
        subtitle="Three floors, 30,000 square feet, and a training environment designed to make you want to show up."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <GalleryGrid images={IMAGES} />
          <p className="mt-6 text-center text-sm text-ink-400">
            Want the full tour? <a href="/contact" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">Book a walkthrough</a> — 20 minutes, no sales pitch.
          </p>
        </div>
      </section>
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
