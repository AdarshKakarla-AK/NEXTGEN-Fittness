import Link from "next/link";
import { MapPin, Phone, Mail, Clock, TrainFront, Car } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata = {
  title: "Contact & Location | NEXTGEN FITNESS",
  description:
    "Visit NEXTGEN FITNESS on MG Road, Bengaluru. Get directions, hours, contact details and send us a message — replies within one business day.",
};

export default function ContactPage() {
  const db = getDB();
  const branch = db.settings.branches[0];
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're easy to find."
        highlight="Hard to leave."
        subtitle="Three floors on MG Road, 30 seconds from Trinity Metro. Drop in for a tour or message us below."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              {[
                { icon: MapPin, title: "Address", lines: [branch.address, "Bengaluru, Karnataka 560001"] },
                { icon: Phone, title: "Call / WhatsApp", lines: [db.settings.phone, "+91 98765 43211 (front desk)"] },
                { icon: Mail, title: "Email", lines: [db.settings.email, "care@nextgenfitness.in"] },
                { icon: Clock, title: "Hours", lines: [db.settings.hours, "Reception closes 10:30 PM"] },
              ].map((c) => (
                <div key={c.title} className="card-shadow flex items-start gap-4 rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
                  <span className="rounded-xl bg-volt-500/10 p-3"><c.icon className="size-5 text-volt-500" /></span>
                  <div>
                    <p className="font-bold text-ink-900 dark:text-ink-700">{c.title}</p>
                    {c.lines.map((l) => (
                      <p key={l} className="text-sm text-ink-500">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="card-shadow rounded-2xl border border-ink-100 bg-card p-5 dark:border-ink-100">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Getting here</p>
                <div className="mt-3 space-y-2.5 text-sm text-ink-600 dark:text-ink-600">
                  <p className="flex items-center gap-2.5"><TrainFront className="size-4 text-volt-500" /> Trinity Metro (Purple Line) — 30 second walk</p>
                  <p className="flex items-center gap-2.5"><Car className="size-4 text-volt-500" /> Valet parking at the Pulse Tower entrance</p>
                </div>
              </div>
              <Link href="/about" className="text-sm font-semibold text-volt-600 hover:underline dark:text-volt-400">Read our story →</Link>
            </div>
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <CTAStrip />
      <FinalCTA />
    </>
  );
}
