"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

export function TodayWorkout() {
  const [workout, setWorkout] = useLocalStorage("workout:today", {
    plan: "Lower Body: Squat, RDL, Hip Thrust, Leg Press, Calves",
    notes: "",
  });

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Workout Plan</h2>
      <textarea
        className="w-full rounded-xl bg-black/40 border border-white/10 p-3"
        rows={3}
        value={workout.plan}
        onChange={(e) => setWorkout({ ...workout, plan: e.target.value })}
      />
      <textarea
        className="w-full rounded-xl bg-black/40 border border-white/10 p-3"
        rows={3}
        placeholder="Notes / weights / PRs"
        value={workout.notes}
        onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
      />
    </div>
  );
}
