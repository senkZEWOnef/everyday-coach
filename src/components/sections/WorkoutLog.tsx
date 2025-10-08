"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

export function WorkoutLog() {
  type Entry = {
    id: string;
    date: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
  };
  const [entries, setEntries] = useLocalStorage<Entry[]>("workouts:log", []);

  const add = () => {
    const id = Math.random().toString(36).slice(2, 9);
    setEntries([
      {
        id,
        date: new Date().toISOString(),
        exercise: "Squat",
        sets: 3,
        reps: 5,
        weight: 135,
      },
      ...entries,
    ]);
  };

  const update = (id: string, field: keyof Entry, value: string) => {
    setEntries(
      entries.map((e) =>
        e.id === id
          ? { ...e, [field]: field === "exercise" ? value : Number(value) }
          : e
      )
    );
  };

  const remove = (id: string) => setEntries(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workout Log</h2>
        <button className="btn-ghost" onClick={add}>
          + Quick Add
        </button>
      </div>

      <div className="grid gap-2">
        {entries.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-12 gap-2 bg-white/5 rounded-xl p-3"
          >
            <input
              className="col-span-5 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              value={e.exercise}
              onChange={(ev) => update(e.id, "exercise", ev.target.value)}
            />
            <input
              className="col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              type="number"
              value={e.sets}
              onChange={(ev) => update(e.id, "sets", ev.target.value)}
            />
            <input
              className="col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              type="number"
              value={e.reps}
              onChange={(ev) => update(e.id, "reps", ev.target.value)}
            />
            <input
              className="col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              type="number"
              value={e.weight}
              onChange={(ev) => update(e.id, "weight", ev.target.value)}
            />
            <button
              className="col-span-1 btn-ghost"
              onClick={() => remove(e.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
