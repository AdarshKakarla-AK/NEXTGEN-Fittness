import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { FAQ } from "@/components/site/FAQ";

export const metadata = {
  title: "FAQ | NEXTGEN FITNESS",
  description:
    "Frequently asked questions about NEXTGEN FITNESS — timings, freezing, check-in, body scans, personal training, corporate plans and more.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions,"
        highlight="answered."
        subtitle="Everything about timings, plans, freezing, check-in and body scans. Can't find it? Message us anytime."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FAQ />
          <div className="card-shadow mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 rounded-3xl border border-ink-100 bg-card p-8 text-center dark:border-ink-100">
            <MessageCircle className="size-8 text-volt-500" />
            <p className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">Still have questions?</p>
            <p className="text-sm text-ink-500">Our front desk team replies within minutes during club hours.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-6 py-3 text-sm font-bold text-white transition hover:from-volt-600 hover:to-volt-500">
                Contact us
              </Link>
              <Link href="/membership" className="rounded-xl border border-ink-300 px-6 py-3 text-sm font-semibold text-ink-700 transition hover:border-ink-400 dark:text-ink-600">
                See plans
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
