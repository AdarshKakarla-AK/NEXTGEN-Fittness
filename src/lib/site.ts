export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export const site = {
  name: "NEXTGEN FITNESS",
  tagline: "Train Harder. Recover Faster. Live Stronger.",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "hello@nextgenfitness.in",
  supportEmail: "support@nextgenfitness.in",
  address: "Level 4, Pulse Tower, MG Road, Bengaluru, Karnataka 560001",
  gstin: "29ABCDE1234F1Z5",
  hours: "Mon–Sat · 5:00 AM – 11:00 PM",
};
