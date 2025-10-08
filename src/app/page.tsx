"use client";
import Link from "next/link";
import { Flame, Salad, CalendarDays, CheckCircle2 } from "lucide-react";
import { useToday } from "@/components/hooks/useToday";
import { TodayHabits } from "@/components/sections/TodayHabits";
import { TodayWorkout } from "@/components/sections/TodayWorkout";
import { TodayNutrition } from "@/components/sections/TodayNutrition";

export default function HomePage() {
  const { dateLabel } = useToday();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Hey Ralph — let’s win today
          </h1>
          <p className="text-white/60">{dateLabel}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/calendar" className="btn-ghost">
            <CalendarDays className="w-4 h-4 mr-2" /> Calendar
          </Link>
          <Link href="/habits" className="btn-ghost">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Habits
          </Link>
          <Link href="/workouts" className="btn-ghost">
            <Flame className="w-4 h-4 mr-2" /> Workouts
          </Link>
          <Link href="/nutrition" className="btn-ghost">
            <Salad className="w-4 h-4 mr-2" /> Nutrition
          </Link>
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <TodayHabits />
        </div>
        <div className="card p-5">
          <TodayWorkout />
        </div>
        <div className="card p-5 md:col-span-2">
          <TodayNutrition />
        </div>
      </section>
    </div>
  );
}
