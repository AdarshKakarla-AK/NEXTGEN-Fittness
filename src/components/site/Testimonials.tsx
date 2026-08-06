"use client";

import * as React from "react";
import { Star, Quote } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading, Avatar } from "@/components/ui";

const REVIEWS = [
  { name: "Rahul Verma", role: "Premium member · 14 months", color: "#22c55e", rating: 5, text: "The member app makes everything stupidly easy. My coach adjusts my plan weekly and I've put on 4kg of clean mass." },
  { name: "Sneha Kulkarni", role: "Yearly member", color: "#3b82f6", rating: 5, text: "Lost 7.6kg in 4 months with Meera's diet plan. The body scan reports keep me accountable week after week." },
  { name: "Sanjay Gupta", role: "Half-yearly member", color: "#f59e0b", rating: 5, text: "As a 45-year-old I was nervous. The team built a plan around my knees. Down 8kg and feeling ten years younger." },
  { name: "Ravi Shastri", role: "Premium member", color: "#a855f7", rating: 5, text: "Post-surgery rehab here was life-changing. Nisha is a miracle worker and the recovery suite is incredible." },
  { name: "Vikram Singh", role: "Yearly member", color: "#ef4444", rating: 5, text: "Best gym in the city. Clean, huge, and the CrossFit WODs are addictive." },
  { name: "Pooja Desai", role: "Yearly member", color: "#14b8a6", rating: 4, text: "Amazing trainers and atmosphere. The classes fill up fast — book early in the app!" },
];

export function Testimonials({ limit }: { limit?: number }) {
  const items = limit ? REVIEWS.slice(0, limit) : REVIEWS;
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Success stories"
          title={<>Members who made <span className="text-gradient">the change.</span></>}
          subtitle="Real reviews from the NEXTGEN community — verified members, honest results."
        />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <StaggerItem key={r.name}>
              <div className="card-shadow relative h-full rounded-2xl border border-ink-100 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-ink-100">
                <Quote className="absolute right-5 top-5 size-8 text-ink-100 dark:text-ink-100" />
                <div className="flex gap-1 text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={i < r.rating ? "size-4 fill-current" : "size-4 opacity-25"} />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-700 dark:text-ink-600">“{r.text}”</p>
                <div className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-4 dark:border-ink-100">
                  <Avatar name={r.name} color={r.color} className="size-10" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-700">{r.name}</p>
                    <p className="text-xs text-ink-400">{r.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
