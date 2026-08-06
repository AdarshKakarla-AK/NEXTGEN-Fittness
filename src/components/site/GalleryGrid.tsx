"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function GalleryGrid({ images }: { images: { src: string; alt: string; tag: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const next = () => setOpen((v) => (v === null ? v : (v + 1) % images.length));
  const prev = () => setOpen((v) => (v === null ? v : (v - 1 + images.length) % images.length));
  React.useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {images.map((img, i) => (
          <button key={img.src + i} onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl border border-ink-100 focus-visible:outline-none dark:border-ink-100">
            <img src={img.src} alt={img.alt} className="w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-night-950/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
              <span className="p-4 text-left text-xs font-semibold text-white">{img.alt}</span>
            </span>
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-night-950/95 p-4 backdrop-blur" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20" aria-label="Close" onClick={() => setOpen(null)}>
            <X className="size-5" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }}>
            <ChevronLeft className="size-6" />
          </button>
          <img src={images[open].src} alt={images[open].alt} className="max-h-[85vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }}>
            <ChevronRight className="size-6" />
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">{images[open].alt}</p>
        </div>
      )}
    </>
  );
}
