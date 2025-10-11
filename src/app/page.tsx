"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { 
  BookOpen, 
  Lightbulb, 
  Calendar, 
  Apple, 
  Plus, 
  Save, 
  Sparkles,
  Clock,
  MapPin,
  Utensils,
  ChevronRight,
  RefreshCw,
  X
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

type BibleReflection = {
  id: string;
  date: string;
  verse: string;
  chapter: string;
  aiMessage: string;
  userReflection: string;
  createdAt: string;
};

type BrainstormIdea = {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  priority: "low" | "medium" | "high";
};

type TimeBlock = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  type: "work" | "meal" | "water" | "meeting" | "exercise" | "personal" | "break";
  location?: string;
};

type Meal = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  date?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
};

// Bible verses database (in a real app, this would come from an API)
const BIBLE_VERSES = [
  {
    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    chapter: "Proverbs 3:5-6",
    aiMessage: "Today, remember that every step you take in your wellness journey doesn't have to be perfect. Trust in God's guidance as you build healthy habits. When you feel overwhelmed by goals or setbacks, surrender your plans to Him and find peace in knowing He's directing your path to wholeness."
  },
  {
    verse: "She is clothed with strength and dignity; she can laugh at the days to come.",
    chapter: "Proverbs 31:25",
    aiMessage: "Strength isn't just physical—it's emotional, spiritual, and mental resilience. As you work on your fitness and habits today, remember you're building inner strength that prepares you for whatever tomorrow brings. Face your challenges with confidence, knowing you're becoming stronger in every way."
  },
  {
    verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own.",
    chapter: "1 Corinthians 6:19",
    aiMessage: "Your body is sacred—a gift to be honored through good nutrition, exercise, and rest. Every healthy choice you make today is an act of worship and gratitude. Treat yourself with the respect and care befitting a temple of the Most High."
  },
  {
    verse: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.",
    chapter: "Matthew 6:34",
    aiMessage: "Focus on today's small, meaningful actions rather than being overwhelmed by long-term goals. Whether it's drinking enough water, taking a walk, or eating mindfully, each present moment is an opportunity to honor God through caring for yourself."
  },
  {
    verse: "I can do all this through him who gives me strength.",
    chapter: "Philippians 4:13",
    aiMessage: "That workout you're avoiding, the healthy meal you need to prepare, the habit you're trying to build—you have divine strength to accomplish what matters. Draw on Christ's power within you to take the next right step in your health journey."
  },
  {
    verse: "Cast all your anxiety on him because he cares for you.",
    chapter: "1 Peter 5:7",
    aiMessage: "Stress can derail the best wellness plans. When anxiety about your health, habits, or goals weighs you down, remember that God cares deeply about every aspect of your wellbeing. Release your worries to Him and find peace to make wise, calm decisions."
  },
  {
    verse: "Above all else, guard your heart, for everything you do flows from it.",
    chapter: "Proverbs 4:23",
    aiMessage: "Your motivations and mindset shape everything—your food choices, exercise habits, and self-care. Guard your heart against comparison, perfectionism, and shame. Cultivate thoughts of gratitude, self-compassion, and purpose in your wellness journey."
  }
];

export default function HomePage() {
  const [reflections, setReflections] = useLocalStorage<BibleReflection[]>("dashboard:reflections", []);
  const [brainstormIdeas, setBrainstormIdeas] = useLocalStorage<BrainstormIdea[]>("dashboard:ideas", []);
  const [timeBlocks] = useLocalStorage<TimeBlock[]>("calendar:timeBlocks", []);
  const [nutritionData] = useLocalStorage<Record<string, Meal[]>>("nutrition:byDay", {});
  
  const [newIdea, setNewIdea] = useState("");
  const [currentReflection, setCurrentReflection] = useState("");
  const [isClient, setIsClient] = useState(false);

  const safeReflections = Array.isArray(reflections) ? reflections : [];
  const safeBrainstormIdeas = Array.isArray(brainstormIdeas) ? brainstormIdeas : [];
  const safeTimeBlocks = Array.isArray(timeBlocks) ? timeBlocks : [];
  const safeNutritionData = nutritionData || {};

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize today's reflection when component mounts
  useEffect(() => {
    if (!isClient) return;
    
    const today = format(new Date(), "yyyy-MM-dd");
    const existing = reflections?.find?.(r => r.date === today);
    
    if (existing) {
      setCurrentReflection(existing.userReflection);
      return;
    }
    
    // Generate new daily reflection only if one doesn't exist and we have no reflection for today
    const hasReflectionForToday = Array.isArray(reflections) && reflections.some(r => r.date === today);
    if (hasReflectionForToday) return;
    
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const verseIndex = dayOfYear % BIBLE_VERSES.length;
    const selectedVerse = BIBLE_VERSES[verseIndex];
    
    const newReflection: BibleReflection = {
      id: Date.now().toString(),
      date: today,
      verse: selectedVerse.verse,
      chapter: selectedVerse.chapter,
      aiMessage: selectedVerse.aiMessage,
      userReflection: "",
      createdAt: new Date().toISOString()
    };
    
    setReflections(prev => Array.isArray(prev) ? [...prev, newReflection] : [newReflection]);
  }, [isClient]); // Only depend on isClient

  // Get today's Bible reflection (read-only, no state updates)
  const getTodaysBibleReflection = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const existing = safeReflections.find(r => r.date === today);
    
    if (existing) {
      return existing;
    }
    
    // Return a default reflection if none exists (shouldn't happen after useEffect)
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const verseIndex = dayOfYear % BIBLE_VERSES.length;
    const selectedVerse = BIBLE_VERSES[verseIndex];
    
    return {
      id: "temp",
      date: today,
      verse: selectedVerse.verse,
      chapter: selectedVerse.chapter,
      aiMessage: selectedVerse.aiMessage,
      userReflection: "",
      createdAt: new Date().toISOString()
    };
  };

  // Save user reflection
  const saveReflection = () => {
    const todaysReflection = getTodaysBibleReflection();
    const updatedReflection = {
      ...todaysReflection,
      userReflection: currentReflection
    };
    
    setReflections(safeReflections.map(r => 
      r.id === todaysReflection.id ? updatedReflection : r
    ));
  };

  // Add brainstorm idea
  const addBrainstormIdea = () => {
    if (!newIdea.trim()) return;
    
    const idea: BrainstormIdea = {
      id: Date.now().toString(),
      content: newIdea.trim(),
      timestamp: new Date().toISOString(),
      tags: [],
      priority: "medium"
    };
    
    setBrainstormIdeas([idea, ...safeBrainstormIdeas]);
    setNewIdea("");
  };

  // Get today's calendar events
  const getTodaysEvents = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return safeTimeBlocks
      .filter(block => block.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 4); // Show only next 4 events
  };

  // Get today's nutrition
  const getTodaysNutrition = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todaysMeals = safeNutritionData[today] || [];
    
    const totalKcal = todaysMeals.reduce((sum, meal) => sum + meal.kcal, 0);
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    return {
      meals: todaysMeals.slice(0, 3), // Show last 3 meals
      totalKcal,
      totalProtein,
      mealCount: todaysMeals.length
    };
  };

  // Regenerate today's verse (for testing purposes)
  const regenerateVerse = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
    const selectedVerse = BIBLE_VERSES[randomIndex];
    
    const newReflection: BibleReflection = {
      id: Date.now().toString(),
      date: today,
      verse: selectedVerse.verse,
      chapter: selectedVerse.chapter,
      aiMessage: selectedVerse.aiMessage,
      userReflection: currentReflection,
      createdAt: new Date().toISOString()
    };
    
    setReflections([newReflection, ...safeReflections.filter(r => r.date !== today)]);
    setCurrentReflection("");
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  const todaysReflection = getTodaysBibleReflection();
  const todaysEvents = getTodaysEvents();
  const todaysNutrition = getTodaysNutrition();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="text-center space-y-2 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!</h1>
        <p className="text-white/60 text-sm sm:text-base">
          {format(new Date(), "EEEE, MMMM dd, yyyy")}
        </p>
      </section>

      {/* 1. Daily Bible Reflection */}
      <section className="card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Daily Reflection</h2>
          </div>
          <button
            onClick={regenerateVerse}
            className="btn-ghost text-sm"
            title="Get new verse"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="text-center space-y-3">
            <p className="text-base sm:text-lg italic leading-relaxed">
              &ldquo;{todaysReflection.verse}&rdquo;
            </p>
            <p className="text-blue-400 font-medium">
              — {todaysReflection.chapter}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">AI Reflection</span>
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              {todaysReflection.aiMessage}
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium">Your Reflection</label>
            <textarea
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 min-h-[100px] resize-none"
              placeholder="How does this verse speak to you today? What is God teaching you through this passage?"
              value={currentReflection}
              onChange={(e) => setCurrentReflection(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={saveReflection}
                className="btn-primary"
                disabled={!currentReflection.trim()}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brainstorm Section */}
      <section className="card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-semibold">Quick Ideas</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2"
            placeholder="Capture a quick idea, thought, or inspiration..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addBrainstormIdea()}
          />
          <button
            onClick={addBrainstormIdea}
            disabled={!newIdea.trim()}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {safeBrainstormIdeas.slice(0, 5).map((idea) => (
            <div
              key={idea.id}
              className="bg-white/5 rounded-lg p-3 flex items-start justify-between group hover:bg-white/10 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm">{idea.content}</p>
                <p className="text-xs text-white/60 mt-1">
                  {format(new Date(idea.timestamp), "MMM dd, HH:mm")}
                </p>
              </div>
              <button
                onClick={() => setBrainstormIdeas(safeBrainstormIdeas.filter(i => i.id !== idea.id))}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {safeBrainstormIdeas.length === 0 && (
            <div className="text-center py-8 text-white/60">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No ideas yet. Start brainstorming!</p>
            </div>
          )}
          
          {safeBrainstormIdeas.length > 5 && (
            <Link
              href="/stuffs"
              className="block text-center text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              View all {safeBrainstormIdeas.length} ideas in Stuffs →
            </Link>
          )}
        </div>
      </section>

      {/* 3. Calendar Preview */}
      <section className="card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold">Today&apos;s Schedule</h2>
          </div>
          <Link href="/calendar" className="btn-ghost text-sm">
            View Full Calendar
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {todaysEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 mx-auto mb-2 text-white/40" />
            <p className="text-white/60 text-sm">No events scheduled for today</p>
            <Link href="/calendar" className="btn-primary mt-3">
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                  event.type === "work" ? "border-blue-400 bg-blue-500/10" :
                  event.type === "meeting" ? "border-purple-400 bg-purple-500/10" :
                  event.type === "meal" ? "border-green-400 bg-green-500/10" :
                  event.type === "exercise" ? "border-red-400 bg-red-500/10" :
                  "border-gray-400 bg-gray-500/10"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.title}</span>
                    {event.location && (
                      <span className="flex items-center gap-1 text-xs text-white/60">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
            ))}
            
            {safeTimeBlocks.filter(b => b.date === format(new Date(), "yyyy-MM-dd")).length > 4 && (
              <p className="text-center text-sm text-white/60">
                +{safeTimeBlocks.filter(b => b.date === format(new Date(), "yyyy-MM-dd")).length - 4} more events
              </p>
            )}
          </div>
        )}
      </section>

      {/* 4. Nutrition Preview */}
      <section className="card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold">Nutrition Today</h2>
          </div>
          <Link href="/nutrition" className="btn-ghost text-sm">
            View Full Nutrition
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{todaysNutrition.totalKcal}</p>
            <p className="text-sm text-white/60">Calories</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{todaysNutrition.totalProtein}g</p>
            <p className="text-sm text-white/60">Protein</p>
          </div>
        </div>
        
        {todaysNutrition.meals.length === 0 ? (
          <div className="text-center py-6">
            <Utensils className="w-8 h-8 mx-auto mb-2 text-white/40" />
            <p className="text-white/60 text-sm">No meals logged today</p>
            <Link href="/nutrition" className="btn-primary mt-3">
              <Plus className="w-4 h-4 mr-1" />
              Log Meal
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Meals</h4>
            {todaysNutrition.meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-sm">{meal.name}</span>
                <span className="text-xs text-white/60">{meal.kcal} kcal</span>
              </div>
            ))}
            
            {todaysNutrition.mealCount > 3 && (
              <p className="text-center text-sm text-white/60">
                +{todaysNutrition.mealCount - 3} more meals
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}