"use client";
import { HabitBoard } from "@/components/sections/HabitBoard";
export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Habits</h1>
      <HabitBoard />
    </div>
  );
}
