"use client";
import { MiniCalendar } from "@/components/sections/MiniCalendar";
export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Calendar</h1>
      <MiniCalendar />
    </div>
  );
}
