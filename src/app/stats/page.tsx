"use client";
import { StatsOverview } from "@/components/sections/StatsOverview";
export default function StatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Stats</h1>
      <StatsOverview />
    </div>
  );
}
