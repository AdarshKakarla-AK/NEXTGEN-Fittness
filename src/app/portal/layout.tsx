import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut, ArrowLeft, Dumbbell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ToastProvider } from "@/lib/client";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const home = user.role === "admin" ? "/portal/admin" : user.role === "trainer" ? "/portal/trainer" : user.role === "receptionist" ? "/portal/receptionist" : "/portal";

  return (
    <div className="min-h-screen bg-paper">
      <header className="glass sticky top-0 z-40 border-b border-ink-100/60 dark:border-ink-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href={home} className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500 to-accent-600">
                <Dumbbell className="size-4.5 text-white" />
              </span>
              <span className="font-display hidden text-base font-extrabold tracking-tight text-ink-900 dark:text-ink-700 sm:block">
                NEXTGEN<span className="text-gradient"> FITNESS</span>
              </span>
            </Link>
            <span className="hidden rounded-full bg-volt-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-volt-600 dark:text-volt-400 sm:block">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={home} className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 transition hover:border-ink-300 dark:text-ink-500">
              <LayoutDashboard className="size-3.5" /> Dashboard
            </Link>
            <Link href="/" className="hidden items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 transition hover:border-ink-300 dark:text-ink-500 sm:flex">
              <ArrowLeft className="size-3.5" /> Site
            </Link>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="flex items-center gap-1.5 rounded-xl bg-stop-500/10 px-3 py-2 text-xs font-semibold text-stop-500 transition hover:bg-stop-500/20">
                <LogOut className="size-3.5" /> Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
