import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getDB } from "@/lib/db/store";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/membership",
    "/classes",
    "/personal-training",
    "/nutrition",
    "/success-stories",
    "/gallery",
    "/trainers",
    "/shop",
    "/blog",
    "/events",
    "/careers",
    "/corporate",
    "/franchise",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cancellation-policy",
    "/refund-policy",
  ];
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl()}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const db = getDB();
    postEntries = db.blogPosts.map((post) => ({
      url: `${siteUrl()}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not ready at build time — static routes only.
  }

  return [...staticEntries, ...postEntries];
}
