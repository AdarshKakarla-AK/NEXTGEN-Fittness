"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, Users, MapPin, ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export type ScheduleEntry = { classId: string; time: string };

export type ClassCardData = {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMin: number;
  intensity: string;
  capacity: number;
  trainerName: string;
  roomName: string;
  image: string;
  color: string;
  days: number[];
};

export type TrainerCardData = { id: string; name: string; role: string };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClassCard({ cls }: { cls: ClassCardData }) {
  return (
    <StaggerItem>
      <div className="card-shadow group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-card dark:border-ink-100">
        <div className="relative h-44 overflow-hidden">
          <Image src={cls.image} alt={cls.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
          <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow" style={{ backgroundColor: cls.color }}>
            {cls.category}
          </span>
          <span className="absolute bottom-4 right-4 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{cls.intensity}</span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-700">{cls.name}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{cls.description}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4 text-center text-xs text-ink-500 dark:border-ink-100">
            <div><Clock className="mx-auto mb-1 size-4 text-volt-500" />{cls.durationMin} min</div>
            <div><Flame className="mx-auto mb-1 size-4 text-volt-500" />{cls.intensity}</div>
            <div><Users className="mx-auto mb-1 size-4 text-volt-500" />{cls.capacity}</div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {cls.roomName}</span>
            <span>{cls.days.length} sessions / wk</span>
          </div>
          <Link href="/register" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-volt-500 to-volt-600 px-5 py-3 text-sm font-bold text-white transition hover:from-volt-600 hover:to-volt-500">
            Book a class <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </StaggerItem>
  );
}

export function ClassSchedule({ days, scheduleMap, classById }: { days: number[]; scheduleMap: Record<number, ScheduleEntry[]>; classById: Record<string, ClassCardData> }) {
  const [active, setActive] = React.useState<number>(new Date().getDay() === 0 ? 1 : new Date().getDay());
  const entries = (scheduleMap[active] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time));
  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Live schedule</p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">This week at NEXTGEN</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setActive(d)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  active === d ? "bg-gradient-to-r from-volt-500 to-volt-600 text-white shadow" : "border border-ink-200 bg-paper text-ink-500 hover:border-ink-300"
                )}
              >
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-ink-100 bg-paper dark:border-ink-100">
          {entries.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-400">No classes scheduled this day. Time for a rest day!</p>
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-ink-100">
              {entries.map((e) => {
                const cls = classById[e.classId];
                if (!cls) return null;
                return (
                  <div key={e.classId + e.time} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-8">
                    <div className="w-20 shrink-0">
                      <p className="font-display text-lg font-extrabold text-ink-900 dark:text-ink-700">{e.time}</p>
                      <p className="text-xs text-ink-400">{cls.durationMin} min</p>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: cls.color }} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900 dark:text-ink-700">{cls.name}</p>
                        <p className="truncate text-xs text-ink-400">{cls.trainerName} · {cls.roomName} · {cls.intensity} intensity</p>
                      </div>
                    </div>
                    <div className="hidden items-center gap-1.5 text-xs text-ink-400 sm:flex">
                      <Users className="size-4" /> {cls.capacity} seats
                    </div>
                    <Link
                      href="/register"
                      className="shrink-0 rounded-xl border border-volt-500/40 bg-volt-500/5 px-4 py-2 text-xs font-bold text-volt-600 transition hover:bg-volt-500 hover:text-white dark:text-volt-400"
                    >
                      Join class
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-ink-400">
          All group classes are <span className="font-semibold text-volt-600 dark:text-volt-400">included free</span> on eligible memberships. Book up to 7 days ahead from the member app.
        </p>
      </div>
    </section>
  );
}

export function ClassGallery({ classes }: { classes: ClassCardData[] }) {
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-600 dark:text-volt-400">Group training</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold text-ink-900 dark:text-ink-700">Nine signature classes</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-500">
            From sunrise yoga to brutal CrossFit WODs — coached, programmed and capped at safe sizes. Swap your workout plan anytime.
          </p>
        </div>
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}
