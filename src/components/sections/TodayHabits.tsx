"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { useToday } from "@/components/hooks/useToday";

export function TodayHabits() {
  const { dateLabel } = useToday();
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

  const todayKey = dateLabel;
  const completed = new Set(done[todayKey] ?? []);

  const toggle = (h: string) => {
    const list = new Set(done[todayKey] ?? []);
    list.has(h) ? list.delete(h) : list.add(h);
    setDone({ ...done, [todayKey]: Array.from(list) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Today’s Habits</h2>
        <button
          className="btn-ghost"
          onClick={() =>
            setHabits([...habits, `New Habit ${habits.length + 1}`])
          }
        >
          + Add
        </button>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2">
        {habits.map((h) => (
          <li
            key={h}
            className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2"
          >
            <span>{h}</span>
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
