"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { useToday } from "@/components/hooks/useToday";
import { format, subDays } from "date-fns";

export function TodayHabits() {
  const { now, dateLabel } = useToday();
  const [habits, setHabits] = useLocalStorage<string[]>("habits:list", [
    "5am Walk",
    "Lift Weights",
    "No Alcohol",
    "Read 20 min",
  ]);
  const [done, setDone] = useLocalStorage<Record<string, string[]>>(
    "habits:done",
    {}
  );

  const todayKey = format(now, "yyyy-MM-dd");
  const completed = new Set(done[todayKey] ?? []);

  const toggle = (h: string) => {
    const list = new Set(done[todayKey] ?? []);
    if (list.has(h)) {
      list.delete(h);
    } else {
      list.add(h);
    }
    setDone({ ...done, [todayKey]: Array.from(list) });
  };

  const streakFor = (habit: string) => {
    // count consecutive days (including today) where habit was completed
    let streak = 0;
    let cursor = now;
    while (true) {
      const key = format(cursor, "yyyy-MM-dd");
      const set = new Set(done[key] ?? []);
      if (set.has(habit)) {
        streak += 1;
        cursor = subDays(cursor, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const overallStreak = habits.reduce(
    (acc, h) => Math.max(acc, streakFor(h)),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Today’s Habits</h2>
          <p className="text-white/60 -mt-1">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">🔥 Max streak: {overallStreak}d</span>
          <button
            className="btn-ghost"
            onClick={() =>
              setHabits([...habits, `New Habit ${habits.length + 1}`])
            }
          >
            + Add
          </button>
        </div>
      </div>

      <ul className="grid sm:grid-cols-2 gap-2">
        {habits.map((h) => (
          <li
            key={h}
            className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span>{h}</span>
              <span className="text-xs text-white/60">🔥 {streakFor(h)}d</span>
            </div>
            <button
              onClick={() => toggle(h)}
              className={`badge ${
                completed.has(h) ? "bg-brand-accent text-black" : ""
              }`}
            >
              {completed.has(h) ? "Done" : "Mark done"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
