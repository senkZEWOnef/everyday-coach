"use client";
import { format } from "date-fns";

export function useToday() {
  const now = new Date();
  const dateLabel = format(now, "EEEE, MMM d, yyyy");
  return { now, dateLabel };
}
