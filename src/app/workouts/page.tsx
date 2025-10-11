"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { 
  Activity, 
  Heart, 
  Weight, 
  Plus, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  X,
  Timer,
  Flame,
  Dumbbell,
  MapPin,
  Calendar,
  Check,
  BarChart3
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import Image from "next/image";

type HealthStats = {
  id: string;
  date: string;
  steps: number;
  caloriesBurnt: number;
  weight: number;
  heartRate?: number;
  sleepHours?: number;
};

type CardioWorkout = {
  id: string;
  date: string;
  type: "walking" | "running" | "basketball" | "cycling" | "boxing" | "rowing" | "swimming";
  duration: number; // minutes
  calories: number;
  distance?: number; // miles or km
  notes?: string;
};

type WeightWorkout = {
  id: string;
  date: string;
  exercises: WeightExercise[];
  duration: number; // minutes
  calories: number;
  notes?: string;
};

type WeightExercise = {
  id: string;
  name: string;
  bodyPart: string;
  sets: number;
  reps: number;
  weight: number;
  restTime?: number; // seconds
};

type WorkoutGalleryImage = {
  id: string;
  url: string;
  date: string;
  caption?: string;
  type: "milestone" | "workout" | "progress";
};

type PlannedWorkout = {
  id: string;
  date: string;
  type: "cardio" | "weight";
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
};

type StatsSummary = {
  period: "week" | "month";
  startDate: string;
  endDate: string;
  totalCalories: number;
  totalWorkouts: number;
  cardioMinutes: number;
  weightSessions: number;
  activities: Record<string, { count: number; totalTime: number; totalDistance?: number }>;
};

// Exercise database by body part
const EXERCISE_DATABASE = {
  chest: [
    "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Press",
    "Incline Dumbbell Press", "Dumbbell Flyes", "Cable Flyes", "Push-ups",
    "Dips", "Chest Press Machine", "Pec Deck", "Cable Crossover"
  ],
  back: [
    "Pull-ups", "Chin-ups", "Lat Pulldown", "Barbell Row", "Dumbbell Row",
    "T-Bar Row", "Cable Row", "Deadlift", "Rack Pulls", "Shrugs",
    "Face Pulls", "Reverse Flyes", "Hyperextensions"
  ],
  shoulders: [
    "Overhead Press", "Military Press", "Dumbbell Press", "Lateral Raises",
    "Front Raises", "Rear Delt Flyes", "Arnold Press", "Pike Push-ups",
    "Handstand Push-ups", "Upright Rows", "Cable Lateral Raises"
  ],
  biceps: [
    "Barbell Curls", "Dumbbell Curls", "Hammer Curls", "Preacher Curls",
    "Cable Curls", "21s", "Concentration Curls", "Chin-ups", "Cable Hammer Curls"
  ],
  triceps: [
    "Close-Grip Bench Press", "Tricep Dips", "Overhead Tricep Extension",
    "Tricep Pushdown", "Diamond Push-ups", "Skull Crushers", "Kickbacks"
  ],
  legs: [
    "Squats", "Deadlifts", "Leg Press", "Lunges", "Bulgarian Split Squats",
    "Leg Curls", "Leg Extensions", "Calf Raises", "Romanian Deadlifts",
    "Front Squats", "Goblet Squats", "Step-ups", "Wall Sits"
  ],
  core: [
    "Plank", "Crunches", "Russian Twists", "Mountain Climbers", "Bicycle Crunches",
    "Dead Bug", "Hanging Leg Raises", "Ab Wheel", "Side Plank", "Leg Raises"
  ]
};

export default function WorkoutsPage() {
  const [healthStats, setHealthStats] = useLocalStorage<HealthStats[]>("health:stats", []);
  const [cardioWorkouts, setCardioWorkouts] = useLocalStorage<CardioWorkout[]>("workouts:cardio", []);
  const [weightWorkouts, setWeightWorkouts] = useLocalStorage<WeightWorkout[]>("workouts:weight", []);
  const [gallery, setGallery] = useLocalStorage<WorkoutGalleryImage[]>("workouts:gallery", []);
  const [plannedWorkouts, setPlannedWorkouts] = useLocalStorage<PlannedWorkout[]>("workouts:planned", []);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddCardio, setShowAddCardio] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showAddPlanned, setShowAddPlanned] = useState(false);
  const [showStatsView, setShowStatsView] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [workoutBuilder, setWorkoutBuilder] = useState({
    duration: 60,
    calories: 300,
    exercises: [] as Array<{
      name: string;
      sets: Array<{ reps: number; weight: number; }>;
    }>
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get today's or latest health stats
  const latestStats = healthStats.length > 0 ? healthStats[0] : null;

  // Image handling
  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const addToGallery = async (file: File, type: "milestone" | "workout" | "progress", caption?: string) => {
    const imageUrl = await handleImageUpload(file);
    const newImage: WorkoutGalleryImage = {
      id: Date.now().toString(),
      url: imageUrl,
      date: new Date().toISOString(),
      caption,
      type
    };
    setGallery([newImage, ...gallery]);
  };

  const deleteFromGallery = (imageId: string) => {
    setGallery(gallery.filter(img => img.id !== imageId));
    setSelectedGalleryImage(null);
  };

  // Date navigation functions
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Get data for selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateStats = healthStats.find(s => 
    format(new Date(s.date), "yyyy-MM-dd") === selectedDateStr
  );
  const selectedDateCardio = cardioWorkouts.filter(w => 
    format(new Date(w.date), "yyyy-MM-dd") === selectedDateStr
  );
  const selectedDateWeight = weightWorkouts.filter(w => 
    format(new Date(w.date), "yyyy-MM-dd") === selectedDateStr
  );
  const selectedDatePlanned = plannedWorkouts.filter(w => 
    format(new Date(w.date), "yyyy-MM-dd") === selectedDateStr
  );

  // Planned workout functions
  const addPlannedWorkout = (workout: Omit<PlannedWorkout, "id">) => {
    const newWorkout: PlannedWorkout = {
      ...workout,
      id: Date.now().toString()
    };
    setPlannedWorkouts([...plannedWorkouts, newWorkout]);
  };

  const togglePlannedWorkout = (workoutId: string) => {
    setPlannedWorkouts(plannedWorkouts.map(w => 
      w.id === workoutId 
        ? { 
            ...w, 
            completed: !w.completed, 
            completedAt: !w.completed ? new Date().toISOString() : undefined 
          }
        : w
    ));
  };

  const deletePlannedWorkout = (workoutId: string) => {
    setPlannedWorkouts(plannedWorkouts.filter(w => w.id !== workoutId));
  };

  // Stats calculation functions
  const calculateStatsSummary = (period: "week" | "month"): StatsSummary => {
    const now = selectedDate;
    const startDate = period === "week" ? startOfWeek(now) : startOfMonth(now);
    const endDate = period === "week" ? endOfWeek(now) : endOfMonth(now);
    
    const periodCardio = cardioWorkouts.filter(w => 
      isWithinInterval(new Date(w.date), { start: startDate, end: endDate })
    );
    const periodWeight = weightWorkouts.filter(w => 
      isWithinInterval(new Date(w.date), { start: startDate, end: endDate })
    );
    
    const totalCalories = 
      periodCardio.reduce((sum, w) => sum + w.calories, 0) +
      periodWeight.reduce((sum, w) => sum + w.calories, 0);
    
    const cardioMinutes = periodCardio.reduce((sum, w) => sum + w.duration, 0);
    
    const activities: Record<string, { count: number; totalTime: number; totalDistance?: number }> = {};
    
    periodCardio.forEach(workout => {
      if (!activities[workout.type]) {
        activities[workout.type] = { count: 0, totalTime: 0, totalDistance: 0 };
      }
      activities[workout.type].count++;
      activities[workout.type].totalTime += workout.duration;
      if (workout.distance) {
        activities[workout.type].totalDistance = 
          (activities[workout.type].totalDistance || 0) + workout.distance;
      }
    });
    
    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalCalories,
      totalWorkouts: periodCardio.length + periodWeight.length,
      cardioMinutes,
      weightSessions: periodWeight.length,
      activities
    };
  };

  const weeklyStats = calculateStatsSummary("week");
  const monthlyStats = calculateStatsSummary("month");

  // Workout builder functions
  const addExerciseToWorkout = (exerciseName: string) => {
    const existingExercise = workoutBuilder.exercises.find(e => e.name === exerciseName);
    if (!existingExercise) {
      setWorkoutBuilder(prev => ({
        ...prev,
        exercises: [...prev.exercises, {
          name: exerciseName,
          sets: [{ reps: 10, weight: 135 }]
        }]
      }));
    }
  };

  const removeExerciseFromWorkout = (exerciseName: string) => {
    setWorkoutBuilder(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.name !== exerciseName)
    }));
  };

  const addSetToExercise = (exerciseName: string) => {
    setWorkoutBuilder(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => 
        e.name === exerciseName 
          ? { ...e, sets: [...e.sets, { reps: 10, weight: 135 }] }
          : e
      )
    }));
  };

  const updateSet = (exerciseName: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setWorkoutBuilder(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => 
        e.name === exerciseName 
          ? { 
              ...e, 
              sets: e.sets.map((set, idx) => 
                idx === setIndex ? { ...set, [field]: value } : set
              )
            }
          : e
      )
    }));
  };

  const removeSet = (exerciseName: string, setIndex: number) => {
    setWorkoutBuilder(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => 
        e.name === exerciseName 
          ? { ...e, sets: e.sets.filter((_, idx) => idx !== setIndex) }
          : e
      )
    }));
  };

  const saveWeightWorkout = () => {
    if (workoutBuilder.exercises.length === 0) return;
    
    const newWorkout: WeightWorkout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: workoutBuilder.duration,
      calories: workoutBuilder.calories,
      exercises: workoutBuilder.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          completed: true
        }))
      }))
    };
    
    setWeightWorkouts([newWorkout, ...weightWorkouts]);
    setWorkoutBuilder({
      duration: 60,
      calories: 300,
      exercises: []
    });
    setShowAddWeight(false);
  };

  const updateHealthStats = (updates: Partial<HealthStats>) => {
    const targetDate = format(selectedDate, "yyyy-MM-dd");
    const existingIndex = healthStats.findIndex(s => 
      format(new Date(s.date), "yyyy-MM-dd") === targetDate
    );

    if (existingIndex >= 0) {
      const updated = [...healthStats];
      updated[existingIndex] = { ...updated[existingIndex], ...updates };
      setHealthStats(updated);
    } else {
      const newStats: HealthStats = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        steps: 0,
        caloriesBurnt: 0,
        weight: latestStats?.weight || 0,
        heartRate: 0,
        ...updates
      };
      setHealthStats([newStats, ...healthStats]);
    }
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Workouts</h1>
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Navigation Header */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goToPreviousDay} className="btn-ghost p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-semibold">
                {format(selectedDate, "EEEE, MMM dd")}
              </h1>
              <p className="text-white/60 text-sm">
                {format(selectedDate, "yyyy")}
              </p>
            </div>
            <button onClick={goToNextDay} className="btn-ghost p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={goToToday} className="btn-ghost">
              <Calendar className="w-4 h-4 mr-1" />
              Today
            </button>
            <button 
              onClick={() => setShowStatsView(!showStatsView)} 
              className="btn-ghost"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </button>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      {showStatsView && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Weekly & Monthly Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Stats */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                📅 This Week
                <span className="text-sm text-white/60 font-normal">
                  ({format(new Date(weeklyStats.startDate), "MMM dd")} - {format(new Date(weeklyStats.endDate), "MMM dd")})
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{weeklyStats.totalCalories}</p>
                  <p className="text-xs text-white/60">Calories Burned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{weeklyStats.totalWorkouts}</p>
                  <p className="text-xs text-white/60">Total Workouts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">{weeklyStats.cardioMinutes}</p>
                  <p className="text-xs text-white/60">Cardio Minutes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{weeklyStats.weightSessions}</p>
                  <p className="text-xs text-white/60">Weight Sessions</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Activities</h4>
                {Object.entries(weeklyStats.activities).map(([activity, stats]) => (
                  <div key={activity} className="flex justify-between text-sm">
                    <span className="capitalize">{activity}</span>
                    <span>
                      {stats.count}x, {stats.totalTime}min
                      {stats.totalDistance && `, ${stats.totalDistance.toFixed(1)}mi`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                📊 This Month
                <span className="text-sm text-white/60 font-normal">
                  ({format(new Date(monthlyStats.startDate), "MMM dd")} - {format(new Date(monthlyStats.endDate), "MMM dd")})
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{monthlyStats.totalCalories}</p>
                  <p className="text-xs text-white/60">Calories Burned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{monthlyStats.totalWorkouts}</p>
                  <p className="text-xs text-white/60">Total Workouts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">{monthlyStats.cardioMinutes}</p>
                  <p className="text-xs text-white/60">Cardio Minutes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{monthlyStats.weightSessions}</p>
                  <p className="text-xs text-white/60">Weight Sessions</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Activities</h4>
                {Object.entries(monthlyStats.activities).map(([activity, stats]) => (
                  <div key={activity} className="flex justify-between text-sm">
                    <span className="capitalize">{activity}</span>
                    <span>
                      {stats.count}x, {stats.totalTime}min
                      {stats.totalDistance && `, ${stats.totalDistance.toFixed(1)}mi`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Upload */}
      <div className="hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Workouts & Fitness</h1>
          <p className="text-white/60">Track your complete fitness journey</p>
        </div>
        <div className="flex gap-2">
          <label className="btn-ghost cursor-pointer">
            <Camera className="w-4 h-4 mr-2" />
            Add Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const caption = prompt("Add a caption (optional):");
                  const type = confirm("Is this a milestone? (Cancel for workout photo)") ? "milestone" : "workout";
                  addToGallery(file, type, caption || undefined);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Health Stats Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Health Stats for {format(selectedDate, "MMM dd")}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60">Steps</span>
            </div>
            <input
              type="number"
              className="w-full bg-transparent border-none text-2xl font-bold p-0 focus:outline-none"
              value={selectedDateStats?.steps || 0}
              onChange={(e) => updateHealthStats({ steps: Number(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-white/40 mt-1">Today&apos;s steps</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white/60">Calories</span>
            </div>
            <input
              type="number"
              className="w-full bg-transparent border-none text-2xl font-bold p-0 focus:outline-none"
              value={selectedDateStats?.caloriesBurnt || 0}
              onChange={(e) => updateHealthStats({ caloriesBurnt: Number(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-white/40 mt-1">Calories burnt</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/60">Weight</span>
            </div>
            <input
              type="number"
              step="0.1"
              className="w-full bg-transparent border-none text-2xl font-bold p-0 focus:outline-none"
              value={selectedDateStats?.weight || latestStats?.weight || 0}
              onChange={(e) => updateHealthStats({ weight: Number(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-white/40 mt-1">lbs</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm text-white/60">Heart Rate</span>
            </div>
            <input
              type="number"
              className="w-full bg-transparent border-none text-2xl font-bold p-0 focus:outline-none"
              value={selectedDateStats?.heartRate || 0}
              onChange={(e) => updateHealthStats({ heartRate: Number(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-white/40 mt-1">bpm (optional)</p>
          </div>
        </div>
      </section>

      {/* Planned Workouts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Planned Workouts for {format(selectedDate, "MMM dd")}
          </h2>
          <button 
            className="btn-ghost"
            onClick={() => setShowAddPlanned(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Plan Workout
          </button>
        </div>

        <div className="space-y-3">
          {selectedDatePlanned.map((workout) => (
            <div 
              key={workout.id} 
              className={`card p-4 flex items-center justify-between ${
                workout.completed ? 'bg-green-500/10 border-green-500/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlannedWorkout(workout.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    workout.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  {workout.completed && <Check className="w-3 h-3" />}
                </button>
                <div>
                  <h3 className={`font-medium ${workout.completed ? 'line-through text-white/60' : ''}`}>
                    {workout.title}
                  </h3>
                  {workout.description && (
                    <p className="text-sm text-white/60">{workout.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="capitalize">{workout.type}</span>
                    {workout.completed && workout.completedAt && (
                      <span>• Completed {format(new Date(workout.completedAt), "h:mm a")}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deletePlannedWorkout(workout.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {selectedDatePlanned.length === 0 && (
            <div className="card p-8 text-center">
              <Calendar className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60">No planned workouts for this day</p>
              <p className="text-white/40 text-sm">Plan ahead to stay on track</p>
            </div>
          )}
        </div>
      </section>

      {/* Workouts Section */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Cardio Workouts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Cardio Workouts
            </h2>
            <button 
              className="btn-ghost"
              onClick={() => setShowAddCardio(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Cardio
            </button>
          </div>

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {selectedDateCardio.map((workout) => (
              <div key={workout.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium capitalize">{workout.type}</h3>
                  <span className="text-sm text-white/60">
                    {format(new Date(workout.date), "MMM dd")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {workout.duration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {workout.calories} cal
                  </span>
                  {workout.distance && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {workout.distance} mi
                    </span>
                  )}
                </div>
              </div>
            ))}
            {selectedDateCardio.length === 0 && (
              <div className="card p-8 text-center">
                <Heart className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60">No cardio workouts yet</p>
                <p className="text-white/40 text-sm">Add your first cardio session</p>
              </div>
            )}
          </div>
        </div>

        {/* Weight Training */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-400" />
              Weight Training
            </h2>
            <button 
              className="btn-ghost"
              onClick={() => setShowAddWeight(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Workout
            </button>
          </div>

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {selectedDateWeight.map((workout) => (
              <div key={workout.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{workout.exercises.length} Exercises</h3>
                  <span className="text-sm text-white/60">
                    {format(new Date(workout.date), "MMM dd")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80 mb-2">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {workout.duration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {workout.calories} cal
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  {workout.exercises.slice(0, 3).map(ex => ex.name).join(", ")}
                  {workout.exercises.length > 3 && ` +${workout.exercises.length - 3} more`}
                </div>
              </div>
            ))}
            {selectedDateWeight.length === 0 && (
              <div className="card p-8 text-center">
                <Dumbbell className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60">No weight workouts yet</p>
                <p className="text-white/40 text-sm">Add your first workout session</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Carousel */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Workout Gallery
          <span className="text-sm text-white/60 font-normal">({gallery.length} photos)</span>
        </h2>
        
        {gallery.length === 0 ? (
          <div className="card p-8 text-center">
            <Camera className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No workout photos yet</h3>
            <p className="text-white/60 text-sm mb-4">
              Capture your fitness journey with progress photos, workout snaps, and milestone moments
            </p>
            <label className="btn-primary cursor-pointer">
              Add First Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const caption = prompt("Add a caption (optional):");
                    addToGallery(file, "workout", caption || undefined);
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
              {gallery.map((image, index) => (
                <div 
                  key={image.id}
                  className="flex-shrink-0 w-48 cursor-pointer group"
                  onClick={() => {
                    setSelectedGalleryImage(image.id);
                    setCurrentImageIndex(index);
                  }}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-2 relative">
                    <Image
                      src={image.url}
                      alt={image.caption || "Workout photo"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${
                        image.type === "milestone" ? "bg-yellow-500" :
                        image.type === "progress" ? "bg-green-500" : "bg-blue-500"
                      }`}>
                        {image.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{image.caption || "Workout Photo"}</p>
                  <p className="text-xs text-white/60">{format(new Date(image.date), "MMM dd, yyyy")}</p>
                </div>
              ))}
            </div>
            
            <button 
              className="btn-ghost text-sm mt-2"
              onClick={() => setSelectedGalleryImage("all")}
            >
              View All Photos ({gallery.length})
            </button>
          </div>
        )}
      </section>

      {/* Full Gallery Modal */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 btn-ghost z-10"
              onClick={() => setSelectedGalleryImage(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {selectedGalleryImage === "all" ? (
              // All photos grid view
              <div className="w-full max-w-6xl max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-6 text-center">Workout Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((image, index) => (
                    <div 
                      key={image.id}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                      onClick={() => {
                        setSelectedGalleryImage(image.id);
                        setCurrentImageIndex(index);
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={image.caption || "Workout photo"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{image.caption}</p>
                          <p className="text-white/80 text-xs">{format(new Date(image.date), "MMM dd, yyyy")}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFromGallery(image.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single photo view
              (() => {
                const currentImage = gallery.find(img => img.id === selectedGalleryImage);
                if (!currentImage) return null;
                
                return (
                  <div className="relative max-w-4xl max-h-full">
                    <div className="relative aspect-square max-h-[80vh]">
                      <Image
                        src={currentImage.url}
                        alt={currentImage.caption || "Workout photo"}
                        fill
                        className="object-contain"
                      />
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{currentImage.caption || "Workout Photo"}</h3>
                          <p className="text-white/80 text-sm">{format(new Date(currentImage.date), "MMM dd, yyyy")}</p>
                          <p className="text-white/60 text-xs capitalize">{currentImage.type}</p>
                        </div>
                        <button
                          onClick={() => deleteFromGallery(currentImage.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {gallery.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 -translate-y-1/2 btn-ghost"
                          onClick={() => {
                            const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : gallery.length - 1;
                            setCurrentImageIndex(newIndex);
                            setSelectedGalleryImage(gallery[newIndex].id);
                          }}
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2 btn-ghost"
                          onClick={() => {
                            const newIndex = currentImageIndex < gallery.length - 1 ? currentImageIndex + 1 : 0;
                            setCurrentImageIndex(newIndex);
                            setSelectedGalleryImage(gallery[newIndex].id);
                          }}
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Add Cardio Modal */}
      {showAddCardio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add Cardio Workout</h3>
                <button 
                  className="btn-ghost p-1"
                  onClick={() => setShowAddCardio(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newCardio: CardioWorkout = {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  type: formData.get("type") as CardioWorkout["type"],
                  duration: Number(formData.get("duration")),
                  calories: Number(formData.get("calories")),
                  distance: formData.get("distance") ? Number(formData.get("distance")) : undefined,
                  notes: formData.get("notes") as string || undefined
                };
                setCardioWorkouts([newCardio, ...cardioWorkouts]);
                setShowAddCardio(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Activity Type</label>
                  <select name="type" className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" required>
                    <option value="walking">Walking</option>
                    <option value="running">Running</option>
                    <option value="basketball">Basketball</option>
                    <option value="cycling">Cycling</option>
                    <option value="boxing">Boxing</option>
                    <option value="rowing">Rowing</option>
                    <option value="swimming">Swimming</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                    <input 
                      name="duration" 
                      type="number" 
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Calories</label>
                    <input 
                      name="calories" 
                      type="number" 
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Distance (optional)</label>
                  <input 
                    name="distance" 
                    type="number" 
                    step="0.1"
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                    placeholder="miles or km"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea 
                    name="notes" 
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="How did it feel? Any notes..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    className="btn-ghost flex-1"
                    onClick={() => setShowAddCardio(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Add Workout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Planned Workout Modal */}
      {showAddPlanned && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Plan Workout</h3>
                <button 
                  className="btn-ghost p-1"
                  onClick={() => setShowAddPlanned(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addPlannedWorkout({
                    date: selectedDate.toISOString(),
                    type: formData.get("type") as "cardio" | "weight",
                    title: formData.get("title") as string,
                    description: formData.get("description") as string || undefined,
                    completed: false
                  });
                  setShowAddPlanned(false);
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Workout Type</label>
                  <select 
                    name="type" 
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                    required
                  >
                    <option value="cardio">Cardio</option>
                    <option value="weight">Weight Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Workout Title</label>
                  <input 
                    name="title" 
                    type="text" 
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                    placeholder="e.g., Morning Run, Chest & Triceps"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea 
                    name="description" 
                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Workout details, exercises, duration, etc."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    className="btn-ghost flex-1"
                    onClick={() => setShowAddPlanned(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Plan Workout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Weight Training Modal */}
      {showAddWeight && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Weight Training Workout</h3>
                <button 
                  className="btn-ghost p-1"
                  onClick={() => setShowAddWeight(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Workout Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Workout Duration (minutes)</label>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                      value={workoutBuilder.duration}
                      onChange={(e) => setWorkoutBuilder(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Calories</label>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2" 
                      value={workoutBuilder.calories}
                      onChange={(e) => setWorkoutBuilder(prev => ({ ...prev, calories: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Current Workout */}
                {workoutBuilder.exercises.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Workout ({workoutBuilder.exercises.length} exercises)</h4>
                    {workoutBuilder.exercises.map((exercise) => (
                      <div key={exercise.name} className="card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{exercise.name}</h5>
                          <button
                            onClick={() => removeExerciseFromWorkout(exercise.name)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-white/60">
                            <div className="col-span-2">Set</div>
                            <div className="col-span-4">Reps</div>
                            <div className="col-span-4">Weight (lbs)</div>
                            <div className="col-span-2"></div>
                          </div>
                          
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-2 text-sm text-white/60">{setIndex + 1}</div>
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                                  value={set.reps}
                                  onChange={(e) => updateSet(exercise.name, setIndex, 'reps', Number(e.target.value))}
                                />
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                                  value={set.weight}
                                  onChange={(e) => updateSet(exercise.name, setIndex, 'weight', Number(e.target.value))}
                                />
                              </div>
                              <div className="col-span-2">
                                <button
                                  onClick={() => removeSet(exercise.name, setIndex)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => addSetToExercise(exercise.name)}
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Set
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exercise Selection by Body Part */}
                <div className="space-y-4">
                  <h4 className="font-medium">Add Exercises by Body Part</h4>
                  
                  {Object.entries(EXERCISE_DATABASE).map(([bodyPart, exercises]) => (
                    <div key={bodyPart} className="space-y-2">
                      <h5 className="text-sm font-medium capitalize text-white/80">{bodyPart}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {exercises.map((exercise) => {
                          const isAdded = workoutBuilder.exercises.some(e => e.name === exercise);
                          return (
                            <button
                              key={exercise}
                              type="button"
                              className={`text-left p-2 rounded-lg transition-colors text-sm ${
                                isAdded 
                                  ? 'bg-blue-500/20 border border-blue-400/30 text-blue-300' 
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                              onClick={() => addExerciseToWorkout(exercise)}
                              disabled={isAdded}
                            >
                              {exercise}
                              {isAdded && <span className="text-xs block text-blue-400">Added</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <button 
                    type="button" 
                    className="btn-ghost flex-1"
                    onClick={() => {
                      setWorkoutBuilder({ duration: 60, calories: 300, exercises: [] });
                      setShowAddWeight(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary flex-1"
                    onClick={saveWeightWorkout}
                    disabled={workoutBuilder.exercises.length === 0}
                  >
                    Save Workout ({workoutBuilder.exercises.length} exercises)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
