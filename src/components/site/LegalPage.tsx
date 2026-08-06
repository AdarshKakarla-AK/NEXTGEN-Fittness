import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";

export function LegalPage({
  title,
  highlight,
  subtitle,
  updated,
  children,
}: {
  title: string;
  highlight?: string;
  subtitle: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        highlight={highlight}
        subtitle={subtitle}
        crumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Last updated · {updated}</p>
          <div className="card-shadow mt-6 space-y-8 rounded-3xl border border-ink-100 bg-card p-8 sm:p-12 dark:border-ink-100">
            {children}
          </div>
          <p className="mt-8 text-sm text-ink-400">
            Questions about this policy? Email <a href="mailto:care@nextgenfitness.in" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">care@nextgenfitness.in</a> or visit us at{" "}
            <Link href="/contact" className="font-semibold text-volt-600 hover:underline dark:text-volt-400">the club</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

export function H({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-700">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-600">{children}</p>;
}

export function Li({ children }: { children: ReactNode }) {
  return <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-600"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-volt-500" />{children}</li>;
}
