import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Clock, ArrowLeft, CalendarDays } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { CTAStrip, FinalCTA } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getDB().blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Not found | NEXTGEN FITNESS" };
  return {
    title: `${post.title} | NEXTGEN FITNESS Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.publishedAt },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const db = getDB();
  const post = db.blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = db.blogPosts
    .filter((p) => p.id !== post.id)
    .slice()
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);
  const date = new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <section className="relative overflow-hidden bg-night-950 pb-16 pt-32 text-white">
        <div className="bg-grid-dark absolute inset-0" />
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-volt-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-white/50">
            <Link href="/" className="hover:text-volt-400">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/blog" className="hover:text-volt-400">Blog</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">{post.category}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-volt-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-volt-400">{post.category}</span>
            <span className="flex items-center gap-1.5 text-sm text-white/60"><Clock className="size-4" /> {post.readTimeMin} min read</span>
            <span className="flex items-center gap-1.5 text-sm text-white/60"><CalendarDays className="size-4" /> {date}</span>
          </div>
          <h1 className="font-display mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-white/65">{post.excerpt}</p>
          <div className="mt-7 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-volt-500 text-sm font-bold text-white">
              {post.author.split(" ").map((w) => w[0]).join("")}
            </span>
            <div>
              <p className="font-bold">{post.author}</p>
              <p className="text-sm text-white/60">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </section>

      <article className="bg-paper py-14 dark:bg-paper">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-ink-100 shadow-sm dark:border-ink-100">
            <Image src={post.cover} alt={post.title} fill sizes="100vw" className="object-cover" />
          </div>

          <div className="mt-10 space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">{section.heading}</h2>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-4 leading-relaxed text-ink-500 dark:text-ink-400">{p}</p>
                ))}
                {section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((li, i) => (
                      <li key={i} className="flex items-start gap-3 text-ink-600 dark:text-ink-300">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-volt-500" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-ink-100 pt-8 dark:border-ink-100">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-500 capitalize dark:bg-ink-100">#{t}</span>
            ))}
          </div>

          <Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-volt-600 hover:underline dark:text-volt-400">
            <ArrowLeft className="size-4" /> Back to all articles
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-paper py-14 dark:border-ink-100 dark:bg-paper">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-700">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group overflow-hidden rounded-2xl border border-ink-100 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-ink-100">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={r.cover} alt={r.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-accent-600 dark:text-accent-400">{r.category} · {r.readTimeMin} min</p>
                    <h3 className="font-display mt-2 font-extrabold text-ink-900 dark:text-ink-700 group-hover:text-volt-600 dark:group-hover:text-volt-400">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTAStrip />
      <FinalCTA />
    </>
  );
}
