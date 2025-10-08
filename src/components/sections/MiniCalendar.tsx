"use client";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
} from "date-fns";
import { useState } from "react";

export function MiniCalendar() {
  const [cursor, setCursor] = useState(new Date());
  const start = startOfMonth(cursor);
  const end = endOfMonth(cursor);
  const days = eachDayOfInterval({ start, end });

  const prev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const next = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <button className="btn-ghost" onClick={prev}>
          ←
        </button>
        <div className="text-lg font-medium">{format(cursor, "MMMM yyyy")}</div>
        <button className="btn-ghost" onClick={next}>
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-xs text-white/60 text-center">
            {d}
          </div>
        ))}
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={`aspect-square rounded-xl flex items-center justify-center border border-white/10 ${
              isToday(d) ? "bg-brand-accent text-black" : ""
            } ${!isSameMonth(d, cursor) ? "opacity-40" : ""}`}
          >
            {format(d, "d")}
          </div>
        ))}
      </div>
    </div>
  );
}
