"use client";
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-brand-accent" style={{ width: `${value}%` }} />
    </div>
  );
}
