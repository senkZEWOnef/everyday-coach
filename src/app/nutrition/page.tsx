"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { 
  ChefHat, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie,
  Plus, 
  ChevronLeft, 
  ChevronRight,
  X,
  Calendar,
  BarChart3,
  Camera,
  Brain,
  Utensils,
  Target,
  Sparkles
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

type NutritionGoals = {
  id: string;
  date: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  fiberTarget: number;
  waterTarget: number; // in oz
};

type FoodItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
};

type MealEntry = {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
};

type WaterEntry = {
  id: string;
  date: string;
  amount: number; // in oz
  time: string;
};

type NutritionStats = {
  period: "week" | "month";
  startDate: string;
  endDate: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgFiber: number;
  avgWater: number;
  totalMeals: number;
  goalAdherence: number; // percentage
};

// Common food database for AI assistance
const FOOD_DATABASE = {
  proteins: [
    { name: "Chicken Breast (4oz)", calories: 185, protein: 35, carbs: 0, fat: 4, fiber: 0, unit: "piece" },
    { name: "Salmon (4oz)", calories: 206, protein: 28, carbs: 0, fat: 12, fiber: 0, unit: "piece" },
    { name: "Greek Yogurt (1 cup)", calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, unit: "cup" },
    { name: "Eggs (2 large)", calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, unit: "eggs" },
    { name: "Lean Ground Turkey (4oz)", calories: 120, protein: 28, carbs: 0, fat: 1, fiber: 0, unit: "oz" }
  ],
  carbs: [
    { name: "Brown Rice (1 cup)", calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4, unit: "cup" },
    { name: "Quinoa (1 cup)", calories: 222, protein: 8, carbs: 39, fat: 4, fiber: 5, unit: "cup" },
    { name: "Sweet Potato (medium)", calories: 112, protein: 2, carbs: 26, fat: 0, fiber: 4, unit: "piece" },
    { name: "Oatmeal (1 cup)", calories: 147, protein: 6, carbs: 25, fat: 3, fiber: 4, unit: "cup" },
    { name: "Whole Wheat Bread (2 slices)", calories: 160, protein: 8, carbs: 28, fat: 2, fiber: 6, unit: "slices" }
  ],
  vegetables: [
    { name: "Broccoli (1 cup)", calories: 25, protein: 3, carbs: 5, fat: 0, fiber: 2, unit: "cup" },
    { name: "Spinach (2 cups)", calories: 14, protein: 2, carbs: 2, fat: 0, fiber: 1, unit: "cups" },
    { name: "Bell Pepper (1 large)", calories: 33, protein: 1, carbs: 7, fat: 0, fiber: 3, unit: "piece" },
    { name: "Carrots (1 cup)", calories: 52, protein: 1, carbs: 12, fat: 0, fiber: 4, unit: "cup" },
    { name: "Cucumber (1 large)", calories: 16, protein: 1, carbs: 4, fat: 0, fiber: 1, unit: "piece" }
  ],
  fruits: [
    { name: "Apple (medium)", calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, unit: "piece" },
    { name: "Banana (medium)", calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, unit: "piece" },
    { name: "Blueberries (1 cup)", calories: 84, protein: 1, carbs: 21, fat: 0, fiber: 4, unit: "cup" },
    { name: "Orange (medium)", calories: 62, protein: 1, carbs: 15, fat: 0, fiber: 3, unit: "piece" },
    { name: "Strawberries (1 cup)", calories: 49, protein: 1, carbs: 11, fat: 0, fiber: 3, unit: "cup" }
  ],
  fats: [
    { name: "Avocado (1/2 medium)", calories: 120, protein: 2, carbs: 6, fat: 11, fiber: 5, unit: "half" },
    { name: "Almonds (1 oz)", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 4, unit: "oz" },
    { name: "Olive Oil (1 tbsp)", calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0, unit: "tbsp" },
    { name: "Peanut Butter (2 tbsp)", calories: 188, protein: 8, carbs: 8, fat: 16, fiber: 2, unit: "tbsp" },
    { name: "Walnuts (1 oz)", calories: 185, protein: 4, carbs: 4, fat: 18, fiber: 2, unit: "oz" }
  ]
};

export default function NutritionPage() {
  const [nutritionGoals, setNutritionGoals] = useLocalStorage<NutritionGoals[]>("nutrition:goals", []);
  const [mealEntries, setMealEntries] = useLocalStorage<MealEntry[]>("nutrition:meals", []);
  const [waterEntries, setWaterEntries] = useLocalStorage<WaterEntry[]>("nutrition:water", []);
  
  // Ensure arrays are always arrays
  const safeNutritionGoals = Array.isArray(nutritionGoals) ? nutritionGoals : [];
  const safeMealEntries = Array.isArray(mealEntries) ? mealEntries : [];
  const safeWaterEntries = Array.isArray(waterEntries) ? waterEntries : [];
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddMeal, setShowAddMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack" | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showStatsView, setShowStatsView] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof FOOD_DATABASE>("proteins");
  const [isClient, setIsClient] = useState(false);
  const [mealBuilder, setMealBuilder] = useState<FoodItem[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Date navigation functions
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Get data for selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateGoals = safeNutritionGoals.find(g => 
    format(new Date(g.date), "yyyy-MM-dd") === selectedDateStr
  ) || {
    id: "",
    date: selectedDate.toISOString(),
    caloriesTarget: 2000,
    proteinTarget: 150,
    carbsTarget: 250,
    fatTarget: 65,
    fiberTarget: 25,
    waterTarget: 64
  };

  const selectedDateMeals = safeMealEntries.filter(m => 
    format(new Date(m.date), "yyyy-MM-dd") === selectedDateStr
  );

  const selectedDateWater = safeWaterEntries.filter(w => 
    format(new Date(w.date), "yyyy-MM-dd") === selectedDateStr
  );

  // Calculate daily totals
  const dailyTotals = selectedDateMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.totalCalories,
    protein: acc.protein + meal.totalProtein,
    carbs: acc.carbs + meal.totalCarbs,
    fat: acc.fat + meal.totalFat,
    fiber: acc.fiber + meal.totalFiber
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const totalWater = selectedDateWater.reduce((sum, entry) => sum + entry.amount, 0);

  // Goals management
  const updateGoals = (updates: Partial<NutritionGoals>) => {
    const existingIndex = safeNutritionGoals.findIndex(g => 
      format(new Date(g.date), "yyyy-MM-dd") === selectedDateStr
    );

    if (existingIndex >= 0) {
      const updated = [...safeNutritionGoals];
      updated[existingIndex] = { ...updated[existingIndex], ...updates };
      setNutritionGoals(updated);
    } else {
      const newGoals: NutritionGoals = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        caloriesTarget: 2000,
        proteinTarget: 150,
        carbsTarget: 250,
        fatTarget: 65,
        fiberTarget: 25,
        waterTarget: 64,
        ...updates
      };
      setNutritionGoals([...safeNutritionGoals, newGoals]);
    }
  };

  // Meal management
  const addMeal = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (mealBuilder.length === 0) return;

    const totals = mealBuilder.reduce((acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
      fiber: acc.fiber + food.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    const newMeal: MealEntry = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      mealType,
      foods: [...mealBuilder],
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalFiber: totals.fiber
    };

    setMealEntries([newMeal, ...safeMealEntries]);
    setMealBuilder([]);
    setShowAddMeal(null);
    setShowFoodSearch(false);
  };

  const deleteMeal = (mealId: string) => {
    setMealEntries(safeMealEntries.filter(m => m.id !== mealId));
  };

  // Food builder functions
  const addFoodToMeal = (food: { name: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; unit: string }) => {
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      quantity: 1,
      unit: food.unit
    };
    setMealBuilder([...mealBuilder, newFood]);
  };

  const removeFoodFromMeal = (foodId: string) => {
    setMealBuilder(mealBuilder.filter(f => f.id !== foodId));
  };

  const updateFoodQuantity = (foodId: string, quantity: number) => {
    setMealBuilder(mealBuilder.map(f => 
      f.id === foodId ? { ...f, quantity } : f
    ));
  };

  // Water tracking
  const addWater = (amount: number) => {
    const newWaterEntry: WaterEntry = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      amount,
      time: new Date().toISOString()
    };
    setWaterEntries([newWaterEntry, ...safeWaterEntries]);
  };

  // Stats calculation
  const calculateNutritionStats = (period: "week" | "month"): NutritionStats => {
    const now = selectedDate;
    const startDate = period === "week" ? startOfWeek(now) : startOfMonth(now);
    const endDate = period === "week" ? endOfWeek(now) : endOfMonth(now);
    
    const periodMeals = safeMealEntries.filter(m => 
      isWithinInterval(new Date(m.date), { start: startDate, end: endDate })
    );
    
    const periodWater = safeWaterEntries.filter(w => 
      isWithinInterval(new Date(w.date), { start: startDate, end: endDate })
    );

    const days = period === "week" ? 7 : 30;
    const avgCalories = periodMeals.reduce((sum, m) => sum + m.totalCalories, 0) / days;
    const avgProtein = periodMeals.reduce((sum, m) => sum + m.totalProtein, 0) / days;
    const avgCarbs = periodMeals.reduce((sum, m) => sum + m.totalCarbs, 0) / days;
    const avgFat = periodMeals.reduce((sum, m) => sum + m.totalFat, 0) / days;
    const avgFiber = periodMeals.reduce((sum, m) => sum + m.totalFiber, 0) / days;
    const avgWater = periodWater.reduce((sum, w) => sum + w.amount, 0) / days;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      avgFiber,
      avgWater,
      totalMeals: periodMeals.length,
      goalAdherence: 85 // Simplified calculation
    };
  };

  const weeklyStats = calculateNutritionStats("week");
  const monthlyStats = calculateNutritionStats("month");

  // AI suggestions
  const getAISuggestions = () => {
    const caloriesRemaining = selectedDateGoals.caloriesTarget - dailyTotals.calories;
    const proteinRemaining = selectedDateGoals.proteinTarget - dailyTotals.protein;
    
    const suggestions = [];
    
    if (caloriesRemaining > 300) {
      suggestions.push("You have " + caloriesRemaining + " calories remaining today. Consider adding a balanced snack with protein and healthy fats.");
    }
    
    if (proteinRemaining > 20) {
      suggestions.push("You need " + proteinRemaining + "g more protein today. Try Greek yogurt, chicken breast, or a protein smoothie.");
    }
    
    if (totalWater < selectedDateGoals.waterTarget * 0.5) {
      suggestions.push("You're behind on hydration! Aim for " + (selectedDateGoals.waterTarget - totalWater) + " more oz of water today.");
    }

    return suggestions;
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading nutrition data...</div>
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
                Nutrition Tracking
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
              onClick={() => setShowAIAssistant(!showAIAssistant)} 
              className="btn-ghost"
            >
              <Brain className="w-4 h-4 mr-1" />
              AI Coach
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

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <section className="card p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            AI Nutrition Coach
          </h3>
          <div className="space-y-3">
            {getAISuggestions().map((suggestion, index) => (
              <div key={index} className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
            {getAISuggestions().length === 0 && (
              <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-3">
                <p className="text-sm">Great job! You&apos;re on track with your nutrition goals today. 🎉</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Dashboard */}
      {showStatsView && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Nutrition Analytics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Stats */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold">📊 This Week</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{Math.round(weeklyStats.avgCalories)}</p>
                  <p className="text-xs text-white/60">Avg Calories/Day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{Math.round(weeklyStats.avgProtein)}g</p>
                  <p className="text-xs text-white/60">Avg Protein/Day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">{Math.round(weeklyStats.avgWater)}oz</p>
                  <p className="text-xs text-white/60">Avg Water/Day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{weeklyStats.totalMeals}</p>
                  <p className="text-xs text-white/60">Total Meals</p>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold">📈 This Month</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{Math.round(monthlyStats.avgCalories)}</p>
                  <p className="text-xs text-white/60">Avg Calories/Day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{Math.round(monthlyStats.avgProtein)}g</p>
                  <p className="text-xs text-white/60">Avg Protein/Day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">{Math.round(monthlyStats.avgWater)}oz</p>
                  <p className="text-xs text-white/60">Avg Water/Day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{monthlyStats.totalMeals}</p>
                  <p className="text-xs text-white/60">Total Meals</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Daily Goals & Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Daily Goals & Progress
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Calories */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Calories</span>
              <input
                type="number"
                className="w-16 bg-transparent border-none text-sm text-right"
                value={selectedDateGoals.caloriesTarget}
                onChange={(e) => updateGoals({ caloriesTarget: Number(e.target.value) })}
              />
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {dailyTotals.calories} / {selectedDateGoals.caloriesTarget}
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (dailyTotals.calories / selectedDateGoals.caloriesTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Protein</span>
              <input
                type="number"
                className="w-16 bg-transparent border-none text-sm text-right"
                value={selectedDateGoals.proteinTarget}
                onChange={(e) => updateGoals({ proteinTarget: Number(e.target.value) })}
              />
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Math.round(dailyTotals.protein)}g / {selectedDateGoals.proteinTarget}g
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (dailyTotals.protein / selectedDateGoals.proteinTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Water */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Water</span>
              <div className="flex gap-1">
                <button onClick={() => addWater(8)} className="btn-ghost text-xs px-2 py-1">+8oz</button>
                <button onClick={() => addWater(16)} className="btn-ghost text-xs px-2 py-1">+16oz</button>
              </div>
            </div>
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {totalWater}oz / {selectedDateGoals.waterTarget}oz
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-cyan-400 h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (totalWater / selectedDateGoals.waterTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Meals */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Meals for {format(selectedDate, "MMM dd")}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Breakfast */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                Breakfast
              </h3>
              <button 
                onClick={() => setShowAddMeal("breakfast")}
                className="btn-ghost p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedDateMeals
                .filter(meal => meal.mealType === "breakfast")
                .map(meal => (
                  <div key={meal.id} className="bg-white/5 rounded-lg p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{meal.foods.map(f => f.name).join(", ")}</p>
                        <p className="text-xs text-white/60">{meal.totalCalories} cal, {Math.round(meal.totalProtein)}g protein</p>
                      </div>
                      <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-300">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              
              {selectedDateMeals.filter(meal => meal.mealType === "breakfast").length === 0 && (
                <p className="text-xs text-white/40">No breakfast logged</p>
              )}
            </div>
          </div>

          {/* Lunch */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                Lunch
              </h3>
              <button 
                onClick={() => setShowAddMeal("lunch")}
                className="btn-ghost p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedDateMeals
                .filter(meal => meal.mealType === "lunch")
                .map(meal => (
                  <div key={meal.id} className="bg-white/5 rounded-lg p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{meal.foods.map(f => f.name).join(", ")}</p>
                        <p className="text-xs text-white/60">{meal.totalCalories} cal, {Math.round(meal.totalProtein)}g protein</p>
                      </div>
                      <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-300">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              
              {selectedDateMeals.filter(meal => meal.mealType === "lunch").length === 0 && (
                <p className="text-xs text-white/40">No lunch logged</p>
              )}
            </div>
          </div>

          {/* Dinner */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-400" />
                Dinner
              </h3>
              <button 
                onClick={() => setShowAddMeal("dinner")}
                className="btn-ghost p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedDateMeals
                .filter(meal => meal.mealType === "dinner")
                .map(meal => (
                  <div key={meal.id} className="bg-white/5 rounded-lg p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{meal.foods.map(f => f.name).join(", ")}</p>
                        <p className="text-xs text-white/60">{meal.totalCalories} cal, {Math.round(meal.totalProtein)}g protein</p>
                      </div>
                      <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-300">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              
              {selectedDateMeals.filter(meal => meal.mealType === "dinner").length === 0 && (
                <p className="text-xs text-white/40">No dinner logged</p>
              )}
            </div>
          </div>

          {/* Snacks */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Cookie className="w-4 h-4 text-orange-400" />
                Snacks
              </h3>
              <button 
                onClick={() => setShowAddMeal("snack")}
                className="btn-ghost p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedDateMeals
                .filter(meal => meal.mealType === "snack")
                .map(meal => (
                  <div key={meal.id} className="bg-white/5 rounded-lg p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{meal.foods.map(f => f.name).join(", ")}</p>
                        <p className="text-xs text-white/60">{meal.totalCalories} cal, {Math.round(meal.totalProtein)}g protein</p>
                      </div>
                      <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-300">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              
              {selectedDateMeals.filter(meal => meal.mealType === "snack").length === 0 && (
                <p className="text-xs text-white/40">No snacks logged</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">
                  Add {showAddMeal} 
                  {showAddMeal === "breakfast" && <Coffee className="w-5 h-5 inline ml-2 text-amber-400" />}
                  {showAddMeal === "lunch" && <Sun className="w-5 h-5 inline ml-2 text-yellow-400" />}
                  {showAddMeal === "dinner" && <Moon className="w-5 h-5 inline ml-2 text-purple-400" />}
                  {showAddMeal === "snack" && <Cookie className="w-5 h-5 inline ml-2 text-orange-400" />}
                </h3>
                <button 
                  className="btn-ghost p-1"
                  onClick={() => {
                    setShowAddMeal(null);
                    setMealBuilder([]);
                    setShowFoodSearch(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
              {/* Current Meal Builder */}
              {mealBuilder.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Current Meal ({mealBuilder.length} items)</h4>
                  {mealBuilder.map(food => (
                    <div key={food.id} className="card p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-white/60">
                          {Math.round(food.calories * food.quantity)} cal, {Math.round(food.protein * food.quantity)}g protein
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={food.quantity}
                          onChange={(e) => updateFoodQuantity(food.id, Number(e.target.value))}
                          className="w-16 bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                        />
                        <span className="text-xs text-white/60">{food.unit}</span>
                        <button
                          onClick={() => removeFoodFromMeal(food.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Food Search/Selection */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFoodSearch(!showFoodSearch)}
                    className="btn-ghost"
                  >
                    <ChefHat className="w-4 h-4 mr-1" />
                    Browse Food Database
                  </button>
                  <button className="btn-ghost">
                    <Camera className="w-4 h-4 mr-1" />
                    Scan Food (Coming Soon)
                  </button>
                </div>

                {showFoodSearch && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {Object.keys(FOOD_DATABASE).map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category as keyof typeof FOOD_DATABASE)}
                          className={`btn-ghost capitalize ${
                            selectedCategory === category ? 'bg-blue-500/20 border-blue-400/30' : ''
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {FOOD_DATABASE[selectedCategory].map((food, index) => (
                        <button
                          key={index}
                          onClick={() => addFoodToMeal(food)}
                          className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-white/60">
                            {food.calories} cal, {food.protein}g protein, {food.carbs}g carbs, {food.fat}g fat
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  className="btn-ghost flex-1"
                  onClick={() => {
                    setShowAddMeal(null);
                    setMealBuilder([]);
                    setShowFoodSearch(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary flex-1"
                  onClick={() => addMeal(showAddMeal)}
                  disabled={mealBuilder.length === 0}
                >
                  Add {showAddMeal} ({mealBuilder.length} items)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}