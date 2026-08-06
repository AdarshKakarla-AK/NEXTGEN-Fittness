// Generates branded SVG placeholder images for the demo (no external assets).
import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "images");
fs.mkdirSync(outDir, { recursive: true });

const gradients = [
  ["#0b1220", "#1c3a6d"],
  ["#07160c", "#164a29"],
  ["#0b1220", "#12203a"],
  ["#1a0b20", "#3d1641"],
  ["#16160a", "#3d3a16"],
  ["#0b1616", "#163d38"],
];

function svg(title, from, to, accent = "#22c55e") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="0.5" cy="0.2" r="0.8">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <rect width="1200" height="800" fill="url(#glow)"/>
  <g transform="translate(600 340)" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="18" stroke-linecap="round">
    <rect x="-180" y="-60" width="140" height="120" rx="18"/>
    <rect x="40" y="-60" width="140" height="120" rx="18"/>
    <path d="M-180 -20 h-60 M-180 20 h-60 M40 -20 h60 M180 -20 h60 M180 20 h60 M40 20 h60"/>
  </g>
  <text x="600" y="620" text-anchor="middle" font-family="Poppins, system-ui, sans-serif" font-size="44" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="2">${title}</text>
</svg>`;
}

const files = {
  "hero-gym.svg": svg("NEXTGEN FITNESS · MG ROAD", "#0b1220", "#1c3a6d", "#22c55e"),
  "gallery-1.svg": svg("Main Floor — Strength", gradients[0][0], gradients[0][1], "#22c55e"),
  "gallery-2.svg": svg("Studio 1 — Mind & Body", gradients[1][0], gradients[1][1], "#3b82f6"),
  "gallery-3.svg": svg("Cardio Deck", gradients[2][0], gradients[2][1], "#f59e0b"),
  "gallery-4.svg": svg("Recovery Suite", gradients[3][0], gradients[3][1], "#a855f7"),
  "gallery-5.svg": svg("Boxing Zone", gradients[4][0], gradients[4][1], "#ef4444"),
  "gallery-6.svg": svg("Functional Area", gradients[5][0], gradients[5][1], "#14b8a6"),
  "gallery-7.svg": svg("Body Scan Lab", gradients[0][0], gradients[0][1], "#3b82f6"),
  "gallery-8.svg": svg("Lounge & Café", gradients[2][0], gradients[2][1], "#22c55e"),
  "class-hiit.svg": svg("HIIT BLAST", "#431407", "#7c2d12", "#f97316"),
  "class-yoga.svg": svg("SUNRISE YOGA", "#052e16", "#14532d", "#22c55e"),
  "class-crossfit.svg": svg("CROSSFIT WOD", "#450a0a", "#7f1d1d", "#ef4444"),
  "class-boxing.svg": svg("BOXING", "#111827", "#374151", "#f59e0b"),
  "class-zumba.svg": svg("ZUMBA PARTY", "#3b0764", "#701a75", "#a855f7"),
  "class-strength.svg": svg("STRENGTH & COND.", "#172554", "#1e3a8a", "#3b82f6"),
  "story-1.svg": svg("Transformation · 12 weeks", "#052e16", "#14532d", "#22c55e"),
  "story-2.svg": svg("Transformation · 6 months", "#172554", "#1e40af", "#3b82f6"),
  "story-3.svg": svg("Transformation · 8 weeks", "#431407", "#7c2d12", "#f97316"),
  "story-4.svg": svg("Transformation · 4 months", "#3b0764", "#701a75", "#a855f7"),
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), content);
}
console.log(`Wrote ${Object.keys(files).length} SVG placeholders`);
