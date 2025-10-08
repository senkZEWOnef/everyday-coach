"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

export function TodayNutrition() {
  const [meals, setMeals] = useLocalStorage<
    Array<{ id: string; name: string; kcal: number; protein: number }>
  >("nutrition:meals", []);
  const totalKcal = meals.reduce((a, b) => a + b.kcal, 0);
  const totalProtein = meals.reduce((a, b) => a + b.protein, 0);

  const addMeal = () => {
    const id = Math.random().toString(36).slice(2, 9);
    setMeals([
      ...meals,
      { id, name: `Meal ${meals.length + 1}`, kcal: 0, protein: 0 },
    ]);
  };

  const update = (
    id: string,
    field: "name" | "kcal" | "protein",
    value: string
  ) => {
    setMeals(
      meals.map((m) =>
        m.id === id
          ? { ...m, [field]: field === "name" ? value : Number(value || 0) }
          : m
      )
    );
  };

  const remove = (id: string) => setMeals(meals.filter((m) => m.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nutrition</h2>
        <button className="btn-ghost" onClick={addMeal}>
          + Add Meal
        </button>
      </div>

      <div className="grid gap-2">
        {meals.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-12 gap-2 bg-white/5 rounded-xl p-3"
          >
            <input
              className="col-span-5 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              value={m.name}
              onChange={(e) => update(m.id, "name", e.target.value)}
            />
            <input
              className="col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              type="number"
              placeholder="kcal"
              value={m.kcal}
              onChange={(e) => update(m.id, "kcal", e.target.value)}
            />
            <input
              className="col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              type="number"
              placeholder="protein"
              value={m.protein}
              onChange={(e) => update(m.id, "protein", e.target.value)}
            />
            <button
              className="col-span-1 btn-ghost"
              onClick={() => remove(m.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="badge">Total kcal: {totalKcal}</span>
        <span className="badge">Protein: {totalProtein} g</span>
      </div>
    </div>
  );
}
