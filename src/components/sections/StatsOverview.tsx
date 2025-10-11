"use client";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { eachDayOfInterval, subDays, format, isAfter } from "date-fns";
import { Target, Award, BookOpen, Flame } from "lucide-react";

type Meal = { id: string; name: string; kcal: number; protein: number; imageUrl?: string };
type WorkoutEntry = {
  id: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  bodyWeight?: number;
  notes?: string;
};
type BookNote = {
  id: string;
  title: string;
  author: string;
  rating: number;
  notes: string;
  dateRead: string;
  status: "reading" | "completed" | "to-read";
  pages: number;
  currentPage: number;
};

export function StatsOverview() {
  const [done] = useLocalStorage<Record<string, string[]>>("habits:done", {});
  const [byDay] = useLocalStorage<Record<string, Meal[]>>("nutrition:byDay", {});
  const [workouts] = useLocalStorage<WorkoutEntry[]>("workouts:log", []);
  const [books] = useLocalStorage<BookNote[]>("books:notes", []);

  const thirtyDaysAgo = subDays(new Date(), 30);

  // Calculate comprehensive stats
  const getStats = () => {
    const recentWorkouts = workouts.filter(w => isAfter(new Date(w.date), thirtyDaysAgo));
    
    const totalVolume = recentWorkouts.reduce((sum, w) => sum + (w.weight * w.reps * w.sets), 0);
    const uniqueExercises = new Set(recentWorkouts.map(w => w.exercise.toLowerCase())).size;
    
    const completedBooks = books.filter(b => b.status === "completed").length;
    const currentlyReading = books.filter(b => b.status === "reading").length;
    
    const avgRating = books.filter(b => b.status === "completed" && b.rating > 0)
      .reduce((sum, b, _, arr) => sum + b.rating / arr.length, 0);

    return {
      workouts: recentWorkouts.length,
      totalVolume,
      uniqueExercises,
      completedBooks,
      currentlyReading,
      avgRating: isNaN(avgRating) ? 0 : avgRating.toFixed(1),
    };
  };

  const days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });
  
  const data = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const meals = byDay[key] ?? [];
    const kcal = meals.reduce((a, b) => a + b.kcal, 0);
    const protein = meals.reduce((a, b) => a + b.protein, 0);
    const habits = done[key]?.length ?? 0;
    const dayWorkouts = workouts.filter(w => format(new Date(w.date), "yyyy-MM-dd") === key);
    const workoutVolume = dayWorkouts.reduce((sum, w) => sum + (w.weight * w.reps * w.sets), 0);
    
    return {
      day: format(d, "EEE"),
      date: format(d, "MMM dd"),
      kcal,
      protein,
      habits,
      workouts: dayWorkouts.length,
      volume: workoutVolume,
    };
  });

  const maxKcal = Math.max(...data.map(d => d.kcal));
  const maxProtein = Math.max(...data.map(d => d.protein));
  const maxHabits = Math.max(...data.map(d => d.habits));
  const maxVolume = Math.max(...data.map(d => d.volume));

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span className="text-sm text-white/60">Workouts (30d)</span>
          </div>
          <div className="text-2xl font-bold">{stats.workouts}</div>
          <div className="text-xs text-white/60">{stats.uniqueExercises} exercises</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white/60">Volume (30d)</span>
          </div>
          <div className="text-2xl font-bold">{(stats.totalVolume / 1000).toFixed(1)}k</div>
          <div className="text-xs text-white/60">lbs total</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/60">Books Read</span>
          </div>
          <div className="text-2xl font-bold">{stats.completedBooks}</div>
          <div className="text-xs text-white/60">{stats.currentlyReading} reading</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white/60">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold">{stats.avgRating}</div>
          <div className="text-xs text-white/60">⭐ out of 5</div>
        </div>
      </div>

      {/* Weekly Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Nutrition Chart */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4">Nutrition - Last 7 Days</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Calories</span>
                <span className="text-yellow-400">Peak: {maxKcal.toLocaleString()}</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {data.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-yellow-500 rounded-t"
                      style={{
                        height: `${maxKcal > 0 ? (day.kcal / maxKcal) * 100 : 0}%`,
                        minHeight: day.kcal > 0 ? "4px" : "0px"
                      }}
                      title={`${day.date}: ${day.kcal} kcal`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                {data.map((day, index) => (
                  <span key={index}>{day.day}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Protein (g)</span>
                <span className="text-blue-400">Peak: {maxProtein}g</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {data.map((day, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{
                        height: `${maxProtein > 0 ? (day.protein / maxProtein) * 100 : 0}%`,
                        minHeight: day.protein > 0 ? "4px" : "0px"
                      }}
                      title={`${day.date}: ${day.protein}g protein`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fitness Chart */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4">Fitness - Last 7 Days</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Workout Volume (lbs)</span>
                <span className="text-red-400">Peak: {maxVolume.toLocaleString()}</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {data.map((day, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="w-full bg-red-500 rounded-t"
                      style={{
                        height: `${maxVolume > 0 ? (day.volume / maxVolume) * 100 : 0}%`,
                        minHeight: day.volume > 0 ? "4px" : "0px"
                      }}
                      title={`${day.date}: ${day.volume.toLocaleString()} lbs`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                {data.map((day, index) => (
                  <span key={index}>{day.day}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Habits Completed</span>
                <span className="text-green-400">Peak: {maxHabits}</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {data.map((day, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{
                        height: `${maxHabits > 0 ? (day.habits / maxHabits) * 100 : 0}%`,
                        minHeight: day.habits > 0 ? "4px" : "0px"
                      }}
                      title={`${day.date}: ${day.habits} habits`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {data.reduce((sum, d) => sum + d.kcal, 0).toLocaleString()}
            </div>
            <div className="text-sm text-white/60">Total Calories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {data.reduce((sum, d) => sum + d.protein, 0)}g
            </div>
            <div className="text-sm text-white/60">Total Protein</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {data.reduce((sum, d) => sum + d.workouts, 0)}
            </div>
            <div className="text-sm text-white/60">Total Workouts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {data.reduce((sum, d) => sum + d.habits, 0)}
            </div>
            <div className="text-sm text-white/60">Habits Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
