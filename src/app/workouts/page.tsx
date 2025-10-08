"use client";
import { WorkoutLog } from "@/components/sections/WorkoutLog";
export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Workouts</h1>
      <WorkoutLog />
    </div>
  );
}
