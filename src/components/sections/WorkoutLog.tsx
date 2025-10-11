"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { TrendingUp, Award } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { useState } from "react";

export function WorkoutLog() {
  type Entry = {
    id: string;
    date: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
    bodyWeight?: number;
    notes?: string;
  };

  const [showAnalytics, setShowAnalytics] = useState(false);
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
        bodyWeight: 0,
        notes: "",
      },
      ...entries,
    ]);
  };

  // Analytics functions
  const getVolumeProgression = () => {
    const last30Days = subDays(new Date(), 30);
    const recentEntries = entries.filter(e => isAfter(new Date(e.date), last30Days));
    
    const volumeByDate = recentEntries.reduce((acc, entry) => {
      const date = format(new Date(entry.date), "yyyy-MM-dd");
      const volume = entry.weight * entry.reps * entry.sets;
      acc[date] = (acc[date] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(volumeByDate)
      .map(([date, volume]) => ({ date: format(new Date(date), "MMM dd"), volume }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPersonalRecords = () => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentPRs = Object.entries(prsMap).filter(([exercise, pr]) => {
      const prEntry = entries.find(e => 
        e.exercise === exercise && 
        e.weight === pr.weight && 
        e.reps === pr.reps
      );
      return prEntry && isAfter(new Date(prEntry.date), thirtyDaysAgo);
    });

    return recentPRs.map(([exercise, pr]) => ({ exercise, ...pr }));
  };

  const update = (id: string, field: keyof Entry, value: string) => {
    setEntries(
      entries.map((e) =>
        e.id === id
          ? { ...e, [field]: field === "exercise" || field === "notes" ? value : Number(value) }
          : e
      )
    );
  };

  const remove = (id: string) => setEntries(entries.filter((e) => e.id !== id));

  // --- PRs (Epley 1RM) ---
  const oneRm = (w: number, r: number) => Number((w * (1 + r / 30)).toFixed(1));
  const prsMap = entries.reduce<
    Record<string, { est: number; weight: number; reps: number }>
  >((acc, e) => {
    const est = oneRm(e.weight, e.reps);
    const cur = acc[e.exercise];
    if (!cur || est > cur.est)
      acc[e.exercise] = { est, weight: e.weight, reps: e.reps };
    return acc;
  }, {});
  const prs = Object.entries(prsMap)
    .map(([exercise, pr]) => ({ exercise, ...pr }))
    .sort((a, b) => b.est - a.est)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workout Log</h2>
        <div className="flex gap-2">
          <button 
            className="btn-ghost"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Analytics
          </button>
          <button className="btn-ghost" onClick={add}>
            + Quick Add
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="space-y-4">
          {/* Recent PRs */}
          <div className="card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Recent Personal Records (Last 30 Days)
            </h3>
            {getPersonalRecords().length === 0 ? (
              <p className="text-white/60 text-sm">No new PRs in the last 30 days</p>
            ) : (
              <div className="space-y-2">
                {getPersonalRecords().map((pr) => (
                  <div key={pr.exercise} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                    <span className="font-medium">{pr.exercise}</span>
                    <span className="text-sm">
                      {pr.weight} × {pr.reps} (Est 1RM: {pr.est} lb)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Volume Progression */}
          <div className="card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Training Volume (Last 30 Days)
            </h3>
            {getVolumeProgression().length === 0 ? (
              <p className="text-white/60 text-sm">No workouts recorded in the last 30 days</p>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-white/60">Total volume by day</div>
                <div className="flex items-end gap-1 h-20">
                  {getVolumeProgression().map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{
                        height: `${Math.min(100, (day.volume / Math.max(...getVolumeProgression().map(d => d.volume))) * 100)}%`,
                        minHeight: "4px"
                      }}
                      title={`${day.date}: ${day.volume.toLocaleString()} lbs`}
                    />
                  ))}
                </div>
                <div className="text-xs text-white/60">
                  Peak: {Math.max(...getVolumeProgression().map(d => d.volume)).toLocaleString()} lbs
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRs */}
      <div className="card p-4">
        <h3 className="font-medium mb-2">Top PRs (est. 1RM)</h3>
        {prs.length === 0 ? (
          <p className="text-white/60 text-sm">
            Log a few sets to see your PRs.
          </p>
        ) : (
          <div className="grid grid-cols-12 text-sm font-medium border-b border-white/10 pb-2 mb-2">
            <div className="col-span-6">Exercise</div>
            <div className="col-span-3">Best Set</div>
            <div className="col-span-3 text-right">Est 1RM</div>
          </div>
        )}
        <div className="space-y-1">
          {prs.map((p) => (
            <div key={p.exercise} className="grid grid-cols-12 text-sm">
              <div className="col-span-6">{p.exercise}</div>
              <div className="col-span-3">
                {p.weight} × {p.reps}
              </div>
              <div className="col-span-3 text-right">{p.est} lb</div>
            </div>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="grid gap-3">
        {entries.map((e) => (
          <div
            key={e.id}
            className="bg-white/5 rounded-xl p-4 space-y-3"
          >
            <div className="grid grid-cols-12 gap-2">
              <input
                className="col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                placeholder="Exercise"
                value={e.exercise}
                onChange={(ev) => update(e.id, "exercise", ev.target.value)}
              />
              <input
                className="col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="number"
                placeholder="Sets"
                value={e.sets}
                onChange={(ev) => update(e.id, "sets", ev.target.value)}
              />
              <input
                className="col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="number"
                placeholder="Reps"
                value={e.reps}
                onChange={(ev) => update(e.id, "reps", ev.target.value)}
              />
              <input
                className="col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="number"
                placeholder="Weight"
                value={e.weight}
                onChange={(ev) => update(e.id, "weight", ev.target.value)}
              />
              <input
                className="col-span-1 bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="number"
                placeholder="BW"
                value={e.bodyWeight || ""}
                onChange={(ev) => update(e.id, "bodyWeight", ev.target.value)}
              />
              <button
                className="col-span-1 btn-ghost"
                onClick={() => remove(e.id)}
              >
                ✕
              </button>
            </div>
            
            {/* Notes and analytics for this entry */}
            <div className="space-y-2">
              <textarea
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
                placeholder="Notes (form, feel, RPE, etc.)"
                rows={2}
                value={e.notes || ""}
                onChange={(ev) => update(e.id, "notes", ev.target.value)}
              />
              
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>{format(new Date(e.date), "MMM dd, yyyy 'at' h:mm a")}</span>
                <div className="flex items-center gap-4">
                  <span>Volume: {(e.weight * e.reps * e.sets).toLocaleString()} lbs</span>
                  <span>Est 1RM: {oneRm(e.weight, e.reps)} lbs</span>
                  {e.bodyWeight && e.bodyWeight > 0 && (
                    <span>BW: {e.bodyWeight} lbs</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
