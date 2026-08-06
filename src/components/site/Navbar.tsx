"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession } from "@/lib/client";

type NavLeaf = { label: string; href: string };
type NavParent = { label: string; children: { label: string; href: string; desc: string }[] };
type NavItem = NavLeaf | NavParent;

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Membership", href: "/membership" },
  { label: "Classes", href: "/classes" },
  {
    label: "Programs",
    children: [
      { label: "Personal Training", href: "/personal-training", desc: "1-on-1 coaching with certified trainers" },
      { label: "Nutrition", href: "/nutrition", desc: "Diet plans built for your goals" },
      { label: "Corporate Membership", href: "/corporate", desc: "Wellness programs for your team" },
      { label: "Franchise", href: "/franchise", desc: "Build a NEXTGEN club in your city" },
    ],
  },
  {
    label: "About",
    children: [
      { label: "About Us", href: "/about", desc: "Our story, mission and facility" },
      { label: "Trainers", href: "/trainers", desc: "Meet the coaching team" },
      { label: "Success Stories", href: "/success-stories", desc: "Real members, real transformations" },
      { label: "Gallery", href: "/gallery", desc: "Inside the club" },
      { label: "Events", href: "/events", desc: "Workshops, challenges & community" },
      { label: "Careers", href: "/careers", desc: "Join the NEXTGEN team" },
      { label: "Blog", href: "/blog", desc: "Training tips & expert advice" },
      { label: "Shop", href: "/shop", desc: "Protein, gear & accessories" },
      { label: "Contact", href: "/contact", desc: "Visit, call or WhatsApp us" },
      { label: "FAQ", href: "/faq", desc: "Answers to common questions" },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [mobileParent, setMobileParent] = React.useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useSession();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const portalHref = user ? "/portal" : "/login";
  const closeMenu = () => {
    setOpen(false);
    setMobileParent(null);
  };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "glass border-b border-ink-100/60 py-2 dark:border-ink-100" : "bg-transparent py-4")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV.map((item) =>
            "children" in item ? (
              <Dropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                  pathname === item.href ? "text-volt-600 dark:text-volt-400" : "text-ink-700 hover:text-ink-950 dark:text-ink-500 dark:hover:text-ink-700"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link
            href={portalHref}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-100 dark:text-ink-500 dark:hover:bg-ink-100"
          >
            {user ? "Dashboard" : "Sign in"} <LogIn className="size-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-volt-600 hover:to-volt-500"
          >
            Join Now <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-card text-ink-700 dark:text-ink-500"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden">
          <div className="glass mx-4 mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-ink-100 p-3 shadow-xl dark:border-ink-100">
            {NAV.map((item) =>
              "children" in item ? (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileParent((v) => (v === item.label ? null : item.label))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-800 hover:bg-ink-50 dark:text-ink-700 dark:hover:bg-ink-100"
                    aria-expanded={mobileParent === item.label}
                  >
                    {item.label}
                    <ChevronDown className={cn("size-4 transition-transform", mobileParent === item.label && "rotate-180")} />
                  </button>
                  {mobileParent === item.label && (
                    <div className="mb-1 ml-3 border-l border-ink-100 pl-3">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} onClick={closeMenu} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-500">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50 dark:text-ink-700 dark:hover:bg-ink-100"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
              <Link href={portalHref} onClick={closeMenu} className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-center text-sm font-semibold text-ink-700 dark:text-ink-500">
                {user ? "Dashboard" : "Sign in"}
              </Link>
              <Link href="/register" onClick={closeMenu} className="flex-1 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Dropdown({ item }: { item: { label: string; children: { label: string; href: string; desc: string }[] } }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:text-ink-950 dark:text-ink-500 dark:hover:text-ink-700"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="animate-rise absolute left-1/2 top-full w-[440px] -translate-x-1/2 pt-3">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-ink-100 bg-card p-2 shadow-2xl dark:border-ink-100">
            {item.children.map((c) => (
              <Link key={c.href} href={c.href} className="group rounded-xl p-3 transition hover:bg-ink-50 dark:hover:bg-ink-100">
                <span className="block text-sm font-semibold text-ink-900 group-hover:text-volt-700 dark:text-ink-700 dark:group-hover:text-volt-500">{c.label}</span>
                <span className="mt-0.5 block text-xs text-ink-400">{c.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
