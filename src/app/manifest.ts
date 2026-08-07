import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NEXTGEN FITNESS — Member App",
    short_name: "NEXTGEN",
    description: "NEXTGEN FITNESS member app — QR check-in, workout logs, PT booking, nutrition and achievements.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#22c55e",
    categories: ["fitness", "health", "lifestyle"],
    icons: [
      { src: "/images/hero-gym.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/images/gallery-1.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Check in", url: "/portal", description: "Open the member portal" },
      { name: "Book a class", url: "/classes", description: "See the timetable and book" },
    ],
  };
}
