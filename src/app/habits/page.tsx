"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  BarChart3,
  Brain,
  Check,
  X,
  Target,
  Sparkles
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isSunday } from "date-fns";

type HabitEntry = {
  id: string;
  date: string;
  habitId: string;
  completed: boolean;
  completedAt?: string;
};

type HabitDefinition = {
  id: string;
  name: string;
  category: "health" | "learning" | "social" | "productivity" | "wellness" | "personal";
  description: string;
  icon: string;
  isCustom?: boolean;
};

type WeeklyReview = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  completionRate: number;
  insights: string[];
  recommendations: string[];
  workoutIntegration: string;
  focusAreasForNextWeek: string[];
  createdAt: string;
};

type HabitStats = {
  period: "week" | "month";
  startDate: string;
  endDate: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  categoryBreakdown: Record<string, { completed: number; total: number }>;
  streak: number;
  topHabits: Array<{ habitId: string; completionRate: number }>;
};

// 50+ Most Common Daily Habits
const HABIT_DEFINITIONS: HabitDefinition[] = [
  // Health & Fitness (15)
  { id: "exercise", name: "Exercise/Workout", category: "health", description: "Any form of physical activity", icon: "💪" },
  { id: "drink_water", name: "Drink 8+ glasses of water", category: "health", description: "Stay hydrated throughout the day", icon: "💧" },
  { id: "walk_steps", name: "Walk 10,000+ steps", category: "health", description: "Get adequate daily movement", icon: "🚶" },
  { id: "healthy_breakfast", name: "Eat healthy breakfast", category: "health", description: "Start day with nutritious meal", icon: "🥗" },
  { id: "no_junk_food", name: "Avoid junk food", category: "health", description: "Skip processed/unhealthy snacks", icon: "🚫" },
  { id: "stretch", name: "Stretch/Yoga", category: "health", description: "10+ minutes of stretching", icon: "🧘" },
  { id: "take_vitamins", name: "Take vitamins/supplements", category: "health", description: "Daily vitamin routine", icon: "💊" },
  { id: "brush_teeth", name: "Brush teeth twice", category: "health", description: "Morning and evening dental care", icon: "🦷" },
  { id: "skincare", name: "Complete skincare routine", category: "health", description: "Cleanse, moisturize, protect", icon: "✨" },
  { id: "no_alcohol", name: "No alcohol", category: "health", description: "Alcohol-free day", icon: "🚫" },
  { id: "healthy_lunch", name: "Eat balanced lunch", category: "health", description: "Nutritious midday meal", icon: "🥙" },
  { id: "limit_caffeine", name: "Limit caffeine intake", category: "health", description: "Max 2-3 cups of coffee", icon: "☕" },
  { id: "posture_check", name: "Mind posture", category: "health", description: "Maintain good posture", icon: "🏃" },
  { id: "eye_rest", name: "Take screen breaks", category: "health", description: "Rest eyes from screens", icon: "👁️" },
  { id: "breathe", name: "Practice deep breathing", category: "health", description: "5+ minutes of breathing exercises", icon: "🫁" },

  // Learning & Growth (12)
  { id: "read", name: "Read for 20+ minutes", category: "learning", description: "Books, articles, educational content", icon: "📚" },
  { id: "write_journal", name: "Write in journal", category: "learning", description: "Reflect on day or thoughts", icon: "📝" },
  { id: "learn_new", name: "Learn something new", category: "learning", description: "New skill, fact, or concept", icon: "🧠" },
  { id: "practice_skill", name: "Practice a skill", category: "learning", description: "Instrument, language, craft", icon: "🎯" },
  { id: "watch_educational", name: "Watch educational content", category: "learning", description: "Documentaries, tutorials", icon: "📺" },
  { id: "language_practice", name: "Practice foreign language", category: "learning", description: "Study or speak other language", icon: "🗣️" },
  { id: "listen_podcast", name: "Listen to podcast", category: "learning", description: "Educational or inspiring audio", icon: "🎧" },
  { id: "creative_time", name: "Creative activity", category: "learning", description: "Art, music, writing, crafting", icon: "🎨" },
  { id: "plan_tomorrow", name: "Plan tomorrow", category: "learning", description: "Review and prepare for next day", icon: "📅" },
  { id: "review_goals", name: "Review goals", category: "learning", description: "Check progress on objectives", icon: "🎯" },
  { id: "brain_training", name: "Brain training/puzzles", category: "learning", description: "Games, puzzles, mental exercises", icon: "🧩" },
  { id: "reflect", name: "Daily reflection", category: "learning", description: "Think about lessons learned", icon: "💭" },

  // Social & Relationships (8)
  { id: "family_time", name: "Quality time with family", category: "social", description: "Meaningful family interaction", icon: "👨‍👩‍👧‍👦" },
  { id: "call_friend", name: "Call/text a friend", category: "social", description: "Connect with friends", icon: "📱" },
  { id: "date_activity", name: "Date activity", category: "social", description: "Romantic time with partner", icon: "💕" },
  { id: "social_activity", name: "Social activity", category: "social", description: "Hang out, party, social event", icon: "🎉" },
  { id: "help_someone", name: "Help someone", category: "social", description: "Act of kindness or assistance", icon: "🤝" },
  { id: "networking", name: "Professional networking", category: "social", description: "Career-related social interaction", icon: "💼" },
  { id: "express_gratitude", name: "Express gratitude", category: "social", description: "Thank someone or appreciate", icon: "🙏" },
  { id: "active_listening", name: "Practice active listening", category: "social", description: "Really listen to others", icon: "👂" },

  // Productivity & Work (8)
  { id: "wake_early", name: "Wake up early (before 7am)", category: "productivity", description: "Start day with extra time", icon: "⏰" },
  { id: "make_bed", name: "Make bed", category: "productivity", description: "Start with accomplished task", icon: "🛏️" },
  { id: "prioritize_tasks", name: "Prioritize daily tasks", category: "productivity", description: "Plan most important work", icon: "📋" },
  { id: "deep_work", name: "2+ hours focused work", category: "productivity", description: "Distraction-free productivity", icon: "💻" },
  { id: "clean_space", name: "Clean/organize space", category: "productivity", description: "Tidy work or living area", icon: "🧹" },
  { id: "limit_phone", name: "Limit phone usage", category: "productivity", description: "Reduce screen time", icon: "📵" },
  { id: "finish_tasks", name: "Complete planned tasks", category: "productivity", description: "Finish what you started", icon: "✅" },
  { id: "single_task", name: "Single-task focus", category: "productivity", description: "Avoid multitasking", icon: "🎯" },

  // Wellness & Self-Care (10)
  { id: "sleep_8h", name: "Sleep 7-8 hours", category: "wellness", description: "Get adequate rest", icon: "😴" },
  { id: "meditate", name: "Meditate", category: "wellness", description: "5+ minutes of meditation", icon: "🧘‍♂️" },
  { id: "gratitude_practice", name: "Practice gratitude", category: "wellness", description: "List 3 things you're grateful for", icon: "🌟" },
  { id: "nature_time", name: "Spend time in nature", category: "wellness", description: "Outdoors, fresh air, natural light", icon: "🌳" },
  { id: "digital_detox", name: "Digital detox hour", category: "wellness", description: "No screens for 1+ hour", icon: "📱" },
  { id: "self_care", name: "Self-care activity", category: "wellness", description: "Bath, massage, pampering", icon: "🛁" },
  { id: "laugh", name: "Laugh genuinely", category: "wellness", description: "Find humor and joy in day", icon: "😄" },
  { id: "music", name: "Listen to music", category: "wellness", description: "Enjoy favorite songs", icon: "🎵" },
  { id: "mindful_eating", name: "Eat mindfully", category: "wellness", description: "Savor food without distractions", icon: "🍽️" },
  { id: "positive_self_talk", name: "Positive self-talk", category: "wellness", description: "Be kind to yourself", icon: "💭" },

  // Personal Development (15)
  { id: "track_expenses", name: "Track expenses", category: "personal", description: "Monitor daily spending", icon: "💰" },
  { id: "save_money", name: "Save money", category: "personal", description: "Put aside savings", icon: "🏦" },
  { id: "declutter", name: "Declutter/minimize", category: "personal", description: "Remove unnecessary items", icon: "📦" },
  { id: "hobby_time", name: "Hobby time", category: "personal", description: "Pursue personal interests", icon: "🎭" },
  { id: "spiritual_practice", name: "Spiritual practice", category: "personal", description: "Prayer, meditation, worship", icon: "🙏" },
  { id: "cook_meal", name: "Cook a meal from scratch", category: "personal", description: "Prepare homemade food", icon: "👨‍🍳" },
  { id: "write_affirmations", name: "Write positive affirmations", category: "personal", description: "Practice self-encouragement", icon: "✍️" },
  { id: "plan_finances", name: "Review/plan finances", category: "personal", description: "Budget planning and review", icon: "📊" },
  { id: "random_act_kindness", name: "Random act of kindness", category: "personal", description: "Do something nice for others", icon: "💝" },
  { id: "practice_instrument", name: "Practice musical instrument", category: "personal", description: "Play music for enjoyment", icon: "🎸" },
  { id: "volunteer_time", name: "Volunteer or help community", category: "personal", description: "Give back to society", icon: "🤲" },
  { id: "learn_culture", name: "Explore different culture", category: "personal", description: "Learn about other traditions", icon: "🌍" },
  { id: "practice_photography", name: "Practice photography", category: "personal", description: "Capture meaningful moments", icon: "📸" },
  { id: "write_letter", name: "Write a letter/card", category: "personal", description: "Send handwritten message", icon: "💌" },
  { id: "plan_adventure", name: "Plan future adventure", category: "personal", description: "Research trips or experiences", icon: "🗺️" }
];

export default function HabitsPage() {
  const [habitEntries, setHabitEntries] = useLocalStorage<HabitEntry[]>("habits:entries", []);
  const [weeklyReviews, setWeeklyReviews] = useLocalStorage<WeeklyReview[]>("habits:reviews", []);
  const [customHabits, setCustomHabits] = useLocalStorage<HabitDefinition[]>("habits:custom", []);
  const [selectedHabits, setSelectedHabits] = useLocalStorage<string[]>("habits:selected", 
    HABIT_DEFINITIONS.slice(0, 20).map(h => h.id) // Default to first 20 habits
  );

  // Import workout data for AI integration
  const [workoutData] = useLocalStorage("workouts:cardio", []);
  const [weightData] = useLocalStorage("workouts:weight", []);
  const [nutritionData] = useLocalStorage("nutrition:meals", []);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showHabitSelector, setShowHabitSelector] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showStatsView, setShowStatsView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);
  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [newHabitForm, setNewHabitForm] = useState<{
    name: string;
    category: HabitDefinition["category"];
    description: string;
    icon: string;
  }>({
    name: "",
    category: "personal",
    description: "",
    icon: "🎯"
  });

  // Ensure arrays are always arrays
  const safeHabitEntries = Array.isArray(habitEntries) ? habitEntries : [];
  const safeWeeklyReviews = Array.isArray(weeklyReviews) ? weeklyReviews : [];
  const safeCustomHabits = Array.isArray(customHabits) ? customHabits : [];
  const safeSelectedHabits = Array.isArray(selectedHabits) ? selectedHabits : [];
  const safeWorkoutData = Array.isArray(workoutData) ? workoutData : [];
  const safeWeightData = Array.isArray(weightData) ? weightData : [];
  const safeNutritionData = Array.isArray(nutritionData) ? nutritionData : [];

  // Combine default habits with custom habits
  const ALL_HABITS = [...HABIT_DEFINITIONS, ...safeCustomHabits];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Date navigation functions
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Get data for selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateEntries = safeHabitEntries.filter(e => 
    format(new Date(e.date), "yyyy-MM-dd") === selectedDateStr
  );

  // Get selected habits with their definitions
  const selectedHabitDefinitions = ALL_HABITS.filter(h => 
    safeSelectedHabits.includes(h.id)
  );

  // Habit management functions
  const toggleHabit = (habitId: string) => {
    const existingEntry = selectedDateEntries.find(e => e.habitId === habitId);
    
    if (existingEntry) {
      // Toggle existing entry
      const updatedEntries = safeHabitEntries.map(e => 
        e.id === existingEntry.id 
          ? { 
              ...e, 
              completed: !e.completed,
              completedAt: !e.completed ? new Date().toISOString() : undefined
            }
          : e
      );
      setHabitEntries(updatedEntries);
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        habitId,
        completed: true,
        completedAt: new Date().toISOString()
      };
      setHabitEntries([newEntry, ...safeHabitEntries]);
    }
  };

  const isHabitCompleted = (habitId: string): boolean => {
    const entry = selectedDateEntries.find(e => e.habitId === habitId);
    return entry?.completed || false;
  };

  // Custom habit creation
  const createCustomHabit = () => {
    if (!newHabitForm.name.trim()) return;
    
    const customHabit: HabitDefinition = {
      id: `custom_${Date.now()}`,
      name: newHabitForm.name.trim(),
      category: newHabitForm.category,
      description: newHabitForm.description.trim() || "Custom habit",
      icon: newHabitForm.icon,
      isCustom: true
    };
    
    setCustomHabits([...safeCustomHabits, customHabit]);
    setSelectedHabits([...safeSelectedHabits, customHabit.id]);
    
    // Reset form
    setNewHabitForm({
      name: "",
      category: "personal",
      description: "",
      icon: "🎯"
    });
    setShowCustomHabitForm(false);
  };

  const deleteCustomHabit = (habitId: string) => {
    setCustomHabits(safeCustomHabits.filter(h => h.id !== habitId));
    setSelectedHabits(safeSelectedHabits.filter(id => id !== habitId));
    setHabitEntries(safeHabitEntries.filter(e => e.habitId !== habitId));
  };

  // Habit selection management
  const toggleHabitSelection = (habitId: string) => {
    if (safeSelectedHabits.includes(habitId)) {
      setSelectedHabits(safeSelectedHabits.filter(id => id !== habitId));
    } else {
      setSelectedHabits([...safeSelectedHabits, habitId]);
    }
  };

  // Stats calculation
  const calculateHabitStats = (period: "week" | "month"): HabitStats => {
    const now = selectedDate;
    const startDate = period === "week" ? startOfWeek(now) : startOfMonth(now);
    const endDate = period === "week" ? endOfWeek(now) : endOfMonth(now);
    
    const periodEntries = safeHabitEntries.filter(e => 
      isWithinInterval(new Date(e.date), { start: startDate, end: endDate })
    );

    const completedEntries = periodEntries.filter(e => e.completed);
    const totalPossible = safeSelectedHabits.length * (period === "week" ? 7 : 30);
    const completionRate = totalPossible > 0 ? (completedEntries.length / totalPossible) * 100 : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, { completed: number; total: number }> = {};
    const categories = [...new Set(selectedHabitDefinitions.map(h => h.category))];
    
    categories.forEach(category => {
      const categoryHabits = selectedHabitDefinitions.filter(h => h.category === category);
      const categoryCompleted = completedEntries.filter(e => 
        categoryHabits.some(h => h.id === e.habitId)
      ).length;
      const categoryTotal = categoryHabits.length * (period === "week" ? 7 : 30);
      
      categoryBreakdown[category] = {
        completed: categoryCompleted,
        total: categoryTotal
      };
    });

    // Top habits
    const habitCompletions: Record<string, number> = {};
    safeSelectedHabits.forEach(habitId => {
      habitCompletions[habitId] = periodEntries.filter(e => 
        e.habitId === habitId && e.completed
      ).length;
    });

    const topHabits = Object.entries(habitCompletions)
      .map(([habitId, completed]) => ({
        habitId,
        completionRate: (completed / (period === "week" ? 7 : 30)) * 100
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalHabits: safeSelectedHabits.length,
      completedHabits: completedEntries.length,
      completionRate,
      categoryBreakdown,
      streak: 0, // Simplified for now
      topHabits
    };
  };

  const weeklyStats = calculateHabitStats("week");
  const monthlyStats = calculateHabitStats("month");

  // Weekly AI Review (Sunday nights)
  const generateWeeklyReview = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    
    // Get workout stats for the week (with safe checking)
    const weekWorkouts = safeWorkoutData.filter((w: unknown) => {
      const workout = w as { date?: string };
      return workout.date && isWithinInterval(new Date(workout.date), { start: weekStart, end: weekEnd });
    }).length + safeWeightData.filter((w: unknown) => {
      const weight = w as { date?: string };
      return weight.date && isWithinInterval(new Date(weight.date), { start: weekStart, end: weekEnd });
    }).length;

    const weekMeals = safeNutritionData.filter((m: unknown) => {
      const meal = m as { date?: string };
      return meal.date && isWithinInterval(new Date(meal.date), { start: weekStart, end: weekEnd });
    }).length;

    // Generate AI insights
    const insights = [];
    const recommendations = [];
    const focusAreas = [];

    if (weeklyStats.completionRate >= 80) {
      insights.push("Excellent week! You're building strong daily habits.");
    } else if (weeklyStats.completionRate >= 60) {
      insights.push("Good progress this week with room for improvement.");
    } else {
      insights.push("This week was challenging. Let's focus on consistency.");
    }

    if (weekWorkouts >= 3) {
      insights.push("Great workout consistency this week!");
    } else {
      recommendations.push("Try to increase workout frequency next week.");
      focusAreas.push("Physical fitness");
    }

    if (weekMeals < 14) {
      recommendations.push("Focus on consistent meal logging and nutrition.");
      focusAreas.push("Nutrition tracking");
    }

    // Identify lowest performing habit categories
    const poorCategories = Object.entries(weeklyStats.categoryBreakdown)
      .filter(([, stats]) => (stats.completed / stats.total) < 0.5)
      .map(([category]) => category);

    if (poorCategories.length > 0) {
      focusAreas.push(...poorCategories.map(cat => `${cat} habits`));
    }

    const review: WeeklyReview = {
      id: Date.now().toString(),
      weekStartDate: weekStart.toISOString(),
      weekEndDate: weekEnd.toISOString(),
      completionRate: weeklyStats.completionRate,
      insights,
      recommendations,
      workoutIntegration: `You completed ${weekWorkouts} workouts and logged ${weekMeals} meals this week.`,
      focusAreasForNextWeek: focusAreas.slice(0, 3),
      createdAt: new Date().toISOString()
    };

    setWeeklyReviews([review, ...safeWeeklyReviews]);
    setShowWeeklyReview(true);
  };

  // Get categories for filtering
  const categories = [
    { id: "all", name: "All Habits", icon: "🎯" },
    { id: "health", name: "Health & Fitness", icon: "💪" },
    { id: "learning", name: "Learning & Growth", icon: "📚" },
    { id: "social", name: "Social & Relationships", icon: "👥" },
    { id: "productivity", name: "Productivity", icon: "⚡" },
    { id: "wellness", name: "Wellness & Self-Care", icon: "🧘" },
    { id: "personal", name: "Personal Development", icon: "🌟" }
  ];

  const filteredHabits = selectedCategory === "all" 
    ? selectedHabitDefinitions 
    : selectedHabitDefinitions.filter(h => h.category === selectedCategory);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading habits data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Navigation Header */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={goToPreviousDay} className="btn-ghost p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {format(selectedDate, "EEEE, MMM dd")}
              </h1>
              <p className="text-white/60 text-sm">
                Daily Habits Tracker
              </p>
            </div>
            <button onClick={goToNextDay} className="btn-ghost p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <button onClick={goToToday} className="btn-ghost text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Today</span>
            </button>
            {isSunday(selectedDate) && (
              <button 
                onClick={generateWeeklyReview}
                className="btn-ghost text-sm"
              >
                <Brain className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Weekly Review</span>
              </button>
            )}
            <button 
              onClick={() => setShowStatsView(!showStatsView)} 
              className="btn-ghost text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Stats</span>
            </button>
            <button 
              onClick={() => setShowHabitSelector(!showHabitSelector)} 
              className="btn-ghost text-sm"
            >
              <Target className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Habits</span>
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Review Panel */}
      {showWeeklyReview && safeWeeklyReviews.length > 0 && (
        <section className="card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AI Weekly Review
            </h3>
            <button onClick={() => setShowWeeklyReview(false)} className="btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {(() => {
            const latestReview = safeWeeklyReviews[0];
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">📊 Week Summary</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-blue-400 font-semibold">{Math.round(latestReview.completionRate)}%</span> habit completion rate
                      </p>
                      <p className="text-sm text-white/80">{latestReview.workoutIntegration}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">💡 Key Insights</h4>
                    <div className="space-y-1">
                      {latestReview.insights.map((insight, index) => (
                        <p key={index} className="text-sm text-white/80">• {insight}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">🎯 Recommendations</h4>
                    <div className="space-y-1">
                      {latestReview.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-green-400">• {rec}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">🔥 Focus Areas Next Week</h4>
                    <div className="space-y-1">
                      {latestReview.focusAreasForNextWeek.map((area, index) => (
                        <span key={index} className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs mr-2 mb-1">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Stats Dashboard */}
      {showStatsView && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Habit Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Stats */}
            <div className="card p-4 sm:p-6 space-y-4">
              <h3 className="font-semibold">📊 This Week</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{Math.round(weeklyStats.completionRate)}%</p>
                  <p className="text-xs text-white/60">Completion Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{weeklyStats.completedHabits}</p>
                  <p className="text-xs text-white/60">Habits Completed</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Top Performing Habits</h4>
                {weeklyStats.topHabits.slice(0, 3).map(habit => {
                  const habitDef = ALL_HABITS.find(h => h.id === habit.habitId);
                  return (
                    <div key={habit.habitId} className="flex justify-between text-sm">
                      <span>{habitDef?.icon} {habitDef?.name}</span>
                      <span className="text-green-400">{Math.round(habit.completionRate)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="card p-4 sm:p-6 space-y-4">
              <h3 className="font-semibold">📈 This Month</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{Math.round(monthlyStats.completionRate)}%</p>
                  <p className="text-xs text-white/60">Completion Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{monthlyStats.completedHabits}</p>
                  <p className="text-xs text-white/60">Total Completed</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Category Performance</h4>
                {Object.entries(monthlyStats.categoryBreakdown).map(([category, stats]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="text-blue-400">
                      {Math.round((stats.completed / stats.total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Habit Selector */}
      {showHabitSelector && (
        <section className="card p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-semibold">Select Your Daily Habits</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => setShowCustomHabitForm(!showCustomHabitForm)}
                className="btn-ghost text-sm w-full sm:w-auto"
              >
                + Create Custom Habit
              </button>
              <div className="text-sm text-white/60">
                {safeSelectedHabits.length} selected
              </div>
            </div>
          </div>

          {/* Custom Habit Form */}
          {showCustomHabitForm && (
            <div className="bg-white/5 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Create Custom Habit</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Habit Name *</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                    placeholder="e.g., Practice guitar for 30 minutes"
                    value={newHabitForm.name}
                    onChange={(e) => setNewHabitForm({...newHabitForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2"
                    value={newHabitForm.category}
                    onChange={(e) => setNewHabitForm({...newHabitForm, category: e.target.value as HabitDefinition["category"]})}
                  >
                    <option value="health">Health & Fitness</option>
                    <option value="learning">Learning & Growth</option>
                    <option value="social">Social & Relationships</option>
                    <option value="productivity">Productivity</option>
                    <option value="wellness">Wellness & Self-Care</option>
                    <option value="personal">Personal Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                    placeholder="Brief description of the habit"
                    value={newHabitForm.description}
                    onChange={(e) => setNewHabitForm({...newHabitForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                    placeholder="🎯"
                    maxLength={2}
                    value={newHabitForm.icon}
                    onChange={(e) => setNewHabitForm({...newHabitForm, icon: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={createCustomHabit}
                  disabled={!newHabitForm.name.trim()}
                  className="btn-primary w-full sm:w-auto"
                >
                  Create Habit
                </button>
                <button
                  onClick={() => setShowCustomHabitForm(false)}
                  className="btn-ghost w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`btn-ghost text-xs p-2 ${
                  selectedCategory === category.id ? 'bg-blue-500/20 border-blue-400/30' : ''
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {(selectedCategory === "all" ? ALL_HABITS : ALL_HABITS.filter(h => h.category === selectedCategory))
              .map(habit => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabitSelection(habit.id)}
                  className={`text-left p-3 rounded-lg transition-colors relative ${
                    safeSelectedHabits.includes(habit.id)
                      ? 'bg-blue-500/20 border border-blue-400/30' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{habit.name}</p>
                        {habit.isCustom && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded">
                            custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60">{habit.description}</p>
                      {safeSelectedHabits.includes(habit.id) && (
                        <Check className="w-4 h-4 text-blue-400 mt-1" />
                      )}
                    </div>
                    {habit.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomHabit(habit.id);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400 flex items-center justify-center text-xs"
                        title="Delete custom habit"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </section>
      )}

      {/* Daily Habits Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Daily Habits for {format(selectedDate, "MMM dd")}
          </h2>
          <div className="text-sm text-white/60">
            {selectedDateEntries.filter(e => e.completed).length} / {safeSelectedHabits.length} completed
          </div>
        </div>

        {safeSelectedHabits.length === 0 ? (
          <div className="card p-8 text-center">
            <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No habits selected</h3>
            <p className="text-white/60 mb-4">Choose some habits to track from our library of 68+ habits or create your own custom habits.</p>
            <button 
              onClick={() => setShowHabitSelector(true)}
              className="btn-primary"
            >
              Select Habits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHabits.map(habit => {
              const isCompleted = isHabitCompleted(habit.id);
              const completedEntry = selectedDateEntries.find(e => e.habitId === habit.id && e.completed);
              
              return (
                <div 
                  key={habit.id}
                  className={`card p-4 transition-all cursor-pointer ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/20 ring-1 ring-green-500/30' 
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.icon}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-white/30'
                      }`}>
                        {isCompleted && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      habit.category === 'health' ? 'bg-red-500/20 text-red-300' :
                      habit.category === 'learning' ? 'bg-blue-500/20 text-blue-300' :
                      habit.category === 'social' ? 'bg-purple-500/20 text-purple-300' :
                      habit.category === 'productivity' ? 'bg-yellow-500/20 text-yellow-300' :
                      habit.category === 'wellness' ? 'bg-green-500/20 text-green-300' :
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {habit.category}
                    </span>
                  </div>
                  
                  <h3 className={`font-medium mb-1 ${isCompleted ? 'text-green-300' : ''}`}>
                    {habit.name}
                  </h3>
                  <p className="text-xs text-white/60 mb-2">{habit.description}</p>
                  
                  {isCompleted && completedEntry?.completedAt && (
                    <p className="text-xs text-green-400">
                      ✓ Completed at {format(new Date(completedEntry.completedAt), "h:mm a")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}