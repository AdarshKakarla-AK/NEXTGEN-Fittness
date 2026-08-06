import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Camera, ThumbsUp, Play, MessageCircle, ArrowUpRight, Dumbbell } from "lucide-react";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Programs",
    links: [
      { label: "Membership Plans", href: "/membership" },
      { label: "Group Classes", href: "/classes" },
      { label: "Personal Training", href: "/personal-training" },
      { label: "Nutrition Coaching", href: "/nutrition" },
      { label: "Corporate Membership", href: "/corporate" },
      { label: "Franchise", href: "/franchise" },
    ],
  },
  {
    title: "Club",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Trainers", href: "/trainers" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Gallery", href: "/gallery" },
      { label: "Events", href: "/events" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shop", href: "/shop" },
      { label: "Blog", href: "/blog" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-night-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500 to-accent-600">
                <Dumbbell className="size-5 text-white" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                NEXTGEN<span className="text-gradient"> FITNESS</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {site.tagline} Bengaluru&apos;s most advanced fitness club — world-class coaching, an obsessive member app and a community that keeps you coming back.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Camera, label: "Instagram" },
                { icon: ThumbsUp, label: "Facebook" },
                { icon: Play, label: "YouTube" },
                { icon: MessageCircle, label: "WhatsApp" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:border-volt-500/50 hover:text-volt-400"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-volt-400">
                      {l.label}
                      <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Info icon={MapPin} label="Flagship" value={site.address} />
          <Info icon={Phone} label="Phone / WhatsApp" value={site.phone} />
          <Info icon={Mail} label="Email" value={site.email} />
          <Info icon={Clock} label="Hours" value={site.hours} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} NEXTGEN FITNESS. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-white/70">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-white/70">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white/70">Refund Policy</Link>
            <Link href="/cancellation-policy" className="hover:text-white/70">Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-volt-500/15 text-volt-400">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
        <p className="mt-1 text-sm text-white/80">{value}</p>
      </div>
    </div>
  );
}
