import Image from "next/image";
import { Clock, Tag } from "lucide-react";
import { getDB } from "@/lib/db/store";
import { PageHero, CTAStrip, FinalCTA } from "@/components/site/PageHero";

export const metadata = {
  title: "Blog | NEXTGEN FITNESS",
  description: "NEXTGEN FITNESS blog — training, nutrition and recovery guides written by our coaching team. Practical, evidence-based, no bro-science.",
};

export const dynamic = "force-dynamic";

export default function BlogPage() {
  const db = getDB();
  const posts = db.blogPosts
    .slice()
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const featured = posts.find((p) => p.featured) ?? posts[0];

  return (
    <>
      <PageHero
        eyebrow="The NEXTGEN Journal"
        title="Training science,"
        highlight="no bro-science."
        subtitle="Guides, programs and myth-busting from the NEXTGEN coaching team — practical, evidence-based and free."
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <section className="bg-paper py-16 dark:bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {featured && (
            <article className="group grid overflow-hidden rounded-3xl border border-ink-100 bg-card shadow-sm lg:grid-cols-2 dark:border-ink-100">
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                <Image src={featured.cover} alt={featured.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" priority />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-volt-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-volt-600 dark:text-volt-400">Featured</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-400"><Clock className="size-3.5" /> {featured.readTimeMin} min read</span>
                </div>
                <h2 className="font-display mt-4 text-2xl font-extrabold leading-snug text-ink-900 dark:text-ink-900 sm:text-3xl">{featured.title}</h2>
                <p className="mt-3 text-ink-500 dark:text-ink-400">{featured.excerpt}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white dark:bg-ink-700">
                    {featured.author.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-900 dark:text-ink-700">{featured.author}</p>
                    <p className="text-xs text-ink-400">{featured.authorRole} · {new Date(featured.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            </article>
          )}

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-ink-100"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={post.cover} alt={post.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-bold uppercase tracking-wide text-accent-600 dark:text-accent-400">{post.category}</span>
                    <span className="flex items-center gap-1 text-ink-400"><Clock className="size-3.5" /> {post.readTimeMin} min</span>
                  </div>
                  <h3 className="font-display mt-3 text-lg font-extrabold leading-snug text-ink-900 dark:text-ink-700 group-hover:text-volt-600 dark:group-hover:text-volt-400">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-500 dark:text-ink-400">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-ink-400">
                    <Tag className="size-3.5" />
                    {post.tags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded bg-ink-100 px-2 py-0.5 capitalize dark:bg-ink-100">#{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-ink-200 p-16 text-center text-ink-400">Articles are on the way — check back soon.</p>
          )}
        </div>
      </section>

      <CTAStrip />
      <FinalCTA />
    </>
  );
}
