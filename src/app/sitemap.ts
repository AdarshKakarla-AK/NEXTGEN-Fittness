import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

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
  return staticRoutes.map((route) => ({
    url: `${siteUrl()}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
