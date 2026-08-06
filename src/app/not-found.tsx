import Link from "next/link";
import { Dumbbell, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-grid-dark flex min-h-screen items-center justify-center bg-night-950 px-6 text-white">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-volt-500 to-accent-600 shadow-glow">
          <Dumbbell className="size-8 text-white" />
        </div>
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-volt-400">Error 404</p>
        <h1 className="font-display mt-3 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-white/60">The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to training.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            <Home className="size-4" /> Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
          >
            <ArrowLeft className="size-4" /> Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
