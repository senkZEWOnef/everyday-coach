"use client";
import { useToday } from "@/components/hooks/useToday";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { format } from "date-fns";
import { ProgressBar } from "@/components/ProgressBar";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type Meal = { id: string; name: string; kcal: number; protein: number; imageUrl?: string };

enum Field {
  name = "name",
  kcal = "kcal",
  protein = "protein",
}

export function TodayNutrition() {
  const { now } = useToday();
  const key = format(now, "yyyy-MM-dd");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [byDay, setByDay] = useLocalStorage<Record<string, Meal[]>>(
    "nutrition:byDay",
    {}
  );
  const meals = byDay[key] ?? [];

  const [goals, setGoals] = useLocalStorage("nutrition:goals", {
    kcalTarget: 2400,
    proteinTarget: 150,
  });

  const totalKcal = meals.reduce((a, b) => a + b.kcal, 0);
  const totalProtein = meals.reduce((a, b) => a + b.protein, 0);

  const saveMeals = (arr: Meal[]) => setByDay({ ...byDay, [key]: arr });

  const addMeal = () => {
    const id = Math.random().toString(36).slice(2, 9);
    saveMeals([
      ...meals,
      { id, name: `Meal ${meals.length + 1}`, kcal: 0, protein: 0 },
    ]);
  };

  const analyzeFoodImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // Create a mock food analysis (in a real app, you'd use an AI service like Clarifai, Google Vision, or Azure Cognitive Services)
      const imageUrl = URL.createObjectURL(file);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock food recognition and calorie estimation
      const mockFoodData = {
        name: "Detected Food Item",
        kcal: Math.floor(Math.random() * 500) + 100, // Random calories between 100-600
        protein: Math.floor(Math.random() * 30) + 5, // Random protein between 5-35g
        imageUrl
      };
      
      const id = Math.random().toString(36).slice(2, 9);
      saveMeals([
        ...meals,
        { id, ...mockFoodData },
      ]);
      
    } catch (error) {
      console.error('Error analyzing food image:', error);
      // Fallback to manual entry
      addMeal();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      analyzeFoodImage(file);
    }
  };

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const update = (id: string, field: Field, value: string) => {
    const arr = meals.map((m) =>
      m.id === id
        ? { ...m, [field]: field === Field.name ? value : Number(value || 0) }
        : m
    );
    saveMeals(arr);
  };

  const remove = (id: string) => saveMeals(meals.filter((m) => m.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nutrition</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/60">Target kcal</label>
          <input
            className="w-20 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-sm"
            type="number"
            value={goals.kcalTarget}
            onChange={(e) =>
              setGoals({ ...goals, kcalTarget: Number(e.target.value || 0) })
            }
          />
          <label className="text-xs text-white/60 ml-2">Protein</label>
          <input
            className="w-20 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-sm"
            type="number"
            value={goals.proteinTarget}
            onChange={(e) =>
              setGoals({ ...goals, proteinTarget: Number(e.target.value || 0) })
            }
          />
          <button 
            className="btn-ghost ml-2" 
            onClick={openCamera}
            disabled={isAnalyzing}
          >
            <Camera className="w-4 h-4 mr-1" />
            {isAnalyzing ? "Analyzing..." : "Scan Food"}
          </button>
          <button className="btn-ghost" onClick={addMeal}>
            + Add Meal
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="grid gap-2">
        {meals.map((m) => (
          <div
            key={m.id}
            className="bg-white/5 rounded-xl p-3"
          >
            {m.imageUrl && (
              <div className="mb-3">
                <Image 
                  src={m.imageUrl} 
                  alt={m.name}
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="grid grid-cols-12 gap-2">
              <input
                className="col-span-5 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                value={m.name}
                onChange={(e) => update(m.id, Field.name, e.target.value)}
              />
              <input
                className="col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="number"
                placeholder="kcal"
                value={m.kcal}
                onChange={(e) => update(m.id, Field.kcal, e.target.value)}
              />
              <input
                className="col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="number"
                placeholder="protein"
                value={m.protein}
                onChange={(e) => update(m.id, Field.protein, e.target.value)}
              />
              <button
                className="col-span-1 btn-ghost"
                onClick={() => remove(m.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="badge">Total kcal: {totalKcal}</span>
          <span className="text-white/60">Target: {goals.kcalTarget}</span>
        </div>
        <ProgressBar
          value={Math.min(
            100,
            Math.round((totalKcal / (goals.kcalTarget || 1)) * 100)
          )}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="badge">Protein: {totalProtein} g</span>
          <span className="text-white/60">Target: {goals.proteinTarget} g</span>
        </div>
        <ProgressBar
          value={Math.min(
            100,
            Math.round((totalProtein / (goals.proteinTarget || 1)) * 100)
          )}
        />
      </div>
    </div>
  );
}
