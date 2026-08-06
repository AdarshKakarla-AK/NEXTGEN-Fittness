import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-paper">
      <div className="bg-grid-dark absolute inset-0 opacity-[0.05]" />
      <div className="relative">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-ink-500 transition hover:text-volt-600 dark:text-ink-500 dark:hover:text-volt-400">
              Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>
        {children}
        <footer className="py-8 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} NEXTGEN FITNESS · <Link href="/terms" className="hover:underline">Terms</Link> ·{" "}
          <Link href="/privacy-policy" className="hover:underline">Privacy</Link> ·{" "}
          <Link href="/refund-policy" className="hover:underline">Refunds</Link>
        </footer>
      </div>
    </main>
  );
}
