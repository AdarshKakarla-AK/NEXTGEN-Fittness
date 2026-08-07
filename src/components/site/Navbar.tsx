"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession } from "@/lib/client";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Membership", href: "/membership" },
  { label: "Classes", href: "/classes" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { user } = useSession();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const portalHref = user ? "/portal" : "/login";
  const closeMenu = () => setOpen(false);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "glass border-b border-ink-100/60 py-2 dark:border-ink-100" : "bg-transparent py-4")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV.map((item) => (
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
          ))}
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

      {open && (
        <div className="lg:hidden">
          <div className="glass mx-4 mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-ink-100 p-3 shadow-xl dark:border-ink-100">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50 dark:text-ink-700 dark:hover:bg-ink-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-3">
              <Link
                href={portalHref}
                onClick={closeMenu}
                className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-center text-sm font-semibold text-ink-700 dark:text-ink-500"
              >
                {user ? "Dashboard" : "Sign in"}
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="flex-1 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
