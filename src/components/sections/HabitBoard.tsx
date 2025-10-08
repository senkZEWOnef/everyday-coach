"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

export function HabitBoard() {
  const [habits, setHabits] = useLocalStorage<string[]>("habits:list", [
    "5am Walk",
    "Lift Weights",
    "No Alcohol",
    "Read 20 min",
  ]);

  const rename = (idx: number, value: string) => {
    const copy = [...habits];
    copy[idx] = value;
    setHabits(copy);
  };

  const add = () => setHabits([...habits, `New Habit ${habits.length + 1}`]);
  const remove = (idx: number) => setHabits(habits.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manage Habits</h2>
        <button className="btn-ghost" onClick={add}>
          + Add
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {habits.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white/5 rounded-xl p-2"
          >
            <input
              className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              value={h}
              onChange={(e) => rename(i, e.target.value)}
            />
            <button className="btn-ghost" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
