import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------ Button ------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow-glow hover:from-volt-600 hover:to-volt-500 hover:shadow-glow",
  secondary:
    "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-glow-blue hover:from-accent-600 hover:to-accent-500",
  ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-500 dark:hover:bg-ink-100",
  outline: "border border-ink-300 text-ink-700 hover:border-ink-400 hover:bg-ink-50 dark:text-ink-600",
  danger: "bg-stop-500 text-white hover:bg-stop-600",
  gold: "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg hover:from-gold-500 hover:to-gold-600",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------- Card ------------------------------- */

export function Card({ className, children, hover, ...rest }: { className?: string; children: React.ReactNode; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-100 bg-card card-shadow dark:border-ink-100",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-volt-300/40 dark:hover:border-volt-700/40",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ------------------------------- Badge ------------------------------ */

const badgeVariants = {
  green: "bg-volt-100 text-volt-700 dark:bg-volt-800/40 dark:text-volt-400",
  blue: "bg-accent-100 text-accent-700 dark:bg-accent-800/40 dark:text-accent-400",
  gold: "bg-gold-100 text-gold-700 dark:bg-gold-800/40 dark:text-gold-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  gray: "bg-ink-100 text-ink-600 dark:bg-ink-100 dark:text-ink-500",
};

export type BadgeTone = keyof typeof badgeVariants;

export function Badge({ tone = "gray", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeVariants[tone], className)}>
      {children}
    </span>
  );
}

/* ------------------------------- Input ------------------------------ */

export const inputClass =
  "w-full rounded-xl border border-ink-200 bg-card px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-volt-500 focus:ring-2 focus:ring-volt-500/20 focus:outline-none dark:border-ink-100";

export function Field({ label, hint, error, children, required }: { label?: string; hint?: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-600">
          {label} {required && <span className="text-stop-500">*</span>}
        </span>
      )}
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-stop-500">{error}</span> : hint ? <span className="mt-1 block text-xs text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, "appearance-none pr-9", className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-24", className)} {...rest} />;
}

/* ----------------------------- Section ------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  light,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.2em]", light ? "text-volt-400" : "text-volt-600 dark:text-volt-400")}>{eyebrow}</p>
      )}
      <h2 className={cn("font-display text-3xl font-bold leading-tight sm:text-4xl", light ? "text-white" : "text-ink-900 dark:text-ink-900")}>{title}</h2>
      {subtitle && <p className={cn("mt-4 text-base leading-relaxed", light ? "text-white/70" : "text-ink-500 dark:text-ink-500")}>{subtitle}</p>}
    </div>
  );
}

/* --------------------------- Avatar / init -------------------------- */

export function Avatar({ name, color, className }: { name: string; color?: string; className?: string }) {
  const init = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", className)}
      style={{ backgroundColor: color ?? "#3b82f6" }}
      aria-hidden
    >
      {init}
    </span>
  );
}

/* --------------------------- Progress bar --------------------------- */

export function Progress({ value, className, color }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-100", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="animate-grow-bar h-full rounded-full bg-gradient-to-r from-volt-500 to-accent-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}
