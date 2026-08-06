import Link from "next/link";
import { Dumbbell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="NEXTGEN FITNESS home">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500 to-accent-600 shadow-glow transition-transform group-hover:scale-105">
        <Dumbbell className="size-5 text-white" />
        <Zap className="absolute -right-1 -top-1 size-3.5 text-gold-400" fill="currentColor" />
      </span>
      <span className="leading-none">
        <span className={cn("font-display block text-base font-extrabold tracking-tight", light ? "text-white" : "text-ink-900 dark:text-ink-900")}>
          NEXTGEN<span className="text-gradient"> FITNESS</span>
        </span>
        <span className={cn("mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.28em]", light ? "text-white/60" : "text-ink-400")}>
          Train · Recover · Live
        </span>
      </span>
    </Link>
  );
}
