import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/membership",
    "/classes",
    "/blog",
    "/contact",
    "/login",
    "/register",
  ];
  return staticRoutes.map((route) => ({
    url: `${siteUrl()}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
