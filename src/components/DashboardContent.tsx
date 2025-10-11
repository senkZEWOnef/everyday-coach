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
  Utensils,
  ChevronRight,
  RefreshCw,
  X
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { TodoList } from "@/components/TodoList";
import { DateNavigation } from "@/components/DateNavigation";

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

export function DashboardContent() {
  const [reflections, setReflections] = useLocalStorage<BibleReflection[]>("dashboard:reflections", []);
  const [brainstormIdeas, setBrainstormIdeas] = useLocalStorage<BrainstormIdea[]>("dashboard:ideas", []);
  const [timeBlocks] = useLocalStorage<TimeBlock[]>("calendar:timeBlocks", []);
  const [nutritionData] = useLocalStorage<Record<string, Meal[]>>("nutrition:byDay", {});
  
  const [newIdea, setNewIdea] = useState("");
  const [currentReflection, setCurrentReflection] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const safeReflections = Array.isArray(reflections) ? reflections : [];
  const safeBrainstormIdeas = Array.isArray(brainstormIdeas) ? brainstormIdeas : [];
  const safeTimeBlocks = Array.isArray(timeBlocks) ? timeBlocks : [];
  const safeNutritionData = nutritionData || {};

  useEffect(() => {
    setIsClient(true);
    setIsMounted(true);
  }, []);

  // Initialize today's reflection when component mounts
  useEffect(() => {
    if (!isClient) return;
    
    const today = format(selectedDate, "yyyy-MM-dd");
    const existing = reflections?.find?.(r => r.date === today);
    
    if (existing) {
      setCurrentReflection(existing.userReflection);
      return;
    }
    
    // Generate new daily reflection only if one doesn't exist and we have no reflection for today
    const hasReflectionForToday = Array.isArray(reflections) && reflections.some(r => r.date === today);
    if (hasReflectionForToday) return;
    
    const dayOfYear = Math.floor((selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / 86400000);
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
  }, [reflections, setReflections, isClient, selectedDate]);

  if (!isClient || !isMounted) {
    return <div className="animate-pulse bg-white/10 rounded-xl h-64"></div>;
  }

  const getTodaysBibleReflection = () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    const reflection = safeReflections.find(r => r.date === today);
    
    if (reflection) return reflection;
    
    // If no reflection exists, create a default one
    const dayOfYear = Math.floor((selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / 86400000);
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

  const regenerateVerse = () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
    const selectedVerse = BIBLE_VERSES[randomIndex];
    
    const updatedReflection: BibleReflection = {
      id: Date.now().toString(),
      date: today,
      verse: selectedVerse.verse,
      chapter: selectedVerse.chapter,
      aiMessage: selectedVerse.aiMessage,
      userReflection: currentReflection,
      createdAt: new Date().toISOString()
    };
    
    setReflections(prev => {
      const filtered = Array.isArray(prev) ? prev.filter(r => r.date !== today) : [];
      return [...filtered, updatedReflection];
    });
  };

  const saveReflection = () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    const todaysReflection = getTodaysBibleReflection();
    
    const updatedReflection: BibleReflection = {
      ...todaysReflection,
      userReflection: currentReflection,
      createdAt: new Date().toISOString()
    };
    
    setReflections(prev => {
      const filtered = Array.isArray(prev) ? prev.filter(r => r.date !== today) : [];
      return [...filtered, updatedReflection];
    });
  };

  const addBrainstormIdea = () => {
    if (newIdea.trim()) {
      const idea: BrainstormIdea = {
        id: Date.now().toString(),
        content: newIdea.trim(),
        timestamp: new Date().toISOString(),
        tags: [],
        priority: "medium"
      };
      setBrainstormIdeas(prev => Array.isArray(prev) ? [...prev, idea] : [idea]);
      setNewIdea("");
    }
  };

  const getTodaysEvents = () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    return safeTimeBlocks.filter(block => block.date === today);
  };

  const getTodaysNutrition = () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    const meals = safeNutritionData[today] || [];
    return {
      totalKcal: meals.reduce((sum, meal) => sum + meal.kcal, 0),
      totalProtein: meals.reduce((sum, meal) => sum + meal.protein, 0),
      mealCount: meals.length
    };
  };

  const todaysReflection = getTodaysBibleReflection();
  const todaysEvents = getTodaysEvents();
  const todaysNutrition = getTodaysNutrition();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Date Navigation Header */}
      <section className="px-4 sm:px-0">
        <DateNavigation 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-4 sm:px-0">
        
        {/* Left Column - Primary Content */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* To-Do List Card */}
          <div className="card">
            <TodoList selectedDate={selectedDate} />
          </div>

          {/* Daily Bible Reflection Card */}
          <div className="card p-6 space-y-4">
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
                  {todaysReflection.chapter}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-sm leading-relaxed">
                {todaysReflection.aiMessage}
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Your Reflection:</label>
                <textarea
                  value={currentReflection}
                  onChange={(e) => setCurrentReflection(e.target.value)}
                  placeholder="What is God speaking to you today?"
                  className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveReflection}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4" />
                  Save Reflection
                </button>
              </div>
            </div>
          </div>

          {/* Quick Ideas Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold">Quick Ideas</h2>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addBrainstormIdea()}
                placeholder="Capture a quick thought or idea..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button onClick={addBrainstormIdea} className="btn-primary">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {safeBrainstormIdeas.slice(-5).reverse().map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                  <span>{idea.content}</span>
                  <button
                    onClick={() => setBrainstormIdeas(safeBrainstormIdeas.filter(i => i.id !== idea.id))}
                    className="text-white/60 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Content */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Today's Schedule Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold">Schedule</h2>
              </div>
              <Link href="/calendar" className="btn-ghost text-sm">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todaysEvents.length === 0 ? (
                <p className="text-white/60 text-center py-4 text-sm">No events scheduled</p>
              ) : (
                todaysEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="w-4 h-4 text-green-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{event.title}</div>
                      <div className="text-xs text-white/60">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nutrition Summary Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold">Nutrition</h2>
              </div>
              <Link href="/nutrition" className="btn-ghost text-sm">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-4 text-center">
                <Utensils className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-xl font-bold">{todaysNutrition.totalKcal}</div>
                <div className="text-white/60 text-xs">Calories</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-4 text-center">
                <Sparkles className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold">{todaysNutrition.totalProtein}g</div>
                <div className="text-white/60 text-xs">Protein</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold">{todaysNutrition.mealCount}</div>
                <div className="text-white/60 text-xs">Meals</div>
              </div>
            </div>
            
            {todaysNutrition.mealCount === 0 && (
              <div className="text-center py-4">
                <p className="text-white/60 mb-2 text-sm">No meals logged yet</p>
                <Link href="/nutrition" className="btn-primary text-sm">
                  Log Your First Meal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}