"use client";
import { NutritionLog } from "@/components/sections/NutritionLog";
export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Nutrition</h1>
      <NutritionLog />
    </div>
  );
}
