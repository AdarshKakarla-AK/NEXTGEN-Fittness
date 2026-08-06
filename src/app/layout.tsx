import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";
import { Analytics } from "@/components/Analytics";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const poppins = Poppins({ variable: "--font-poppins", weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], display: "swap" });

// Apply the persisted theme class before React hydrates to avoid a flash.
const themeInit = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored === "dark" || (!stored && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "NEXTGEN FITNESS | Premium Gym & Fitness Club in Bengaluru",
    template: "%s | NEXTGEN FITNESS",
  },
  description:
    "Train at Bengaluru's most advanced fitness club — certified trainers, group classes, personal training, nutrition coaching, body scanning and a member app that tracks every rep, meal and milestone.",
  keywords: ["gym", "fitness", "personal training", "group classes", "nutrition", "Bengaluru", "membership", "HIIT", "strength training"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "NEXTGEN FITNESS",
    description: "Train Harder. Recover Faster. Live Stronger. Premium fitness club with member app, AI coaching and world-class trainers.",
    type: "website",
    siteName: "NEXTGEN FITNESS",
    locale: "en_IN",
    url: siteUrl(),
  },
  twitter: {
    card: "summary",
    title: "NEXTGEN FITNESS",
    description: "Premium fitness club with member app, AI coaching and world-class trainers.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthClub",
  name: "NEXTGEN FITNESS",
  description: "Premium fitness club with group classes, personal training, nutrition coaching and a member app.",
  telephone: "+91 98765 43210",
  address: { "@type": "PostalAddress", streetAddress: "Level 4, Pulse Tower, MG Road", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  priceRange: "₹₹₹",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
