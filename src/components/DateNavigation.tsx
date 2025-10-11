"use client";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigation({ selectedDate, onDateChange }: DateNavigationProps) {
  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    if (isYesterday(selectedDate)) return "Yesterday";
    return format(selectedDate, "EEEE, MMMM dd");
  };

  const getGreeting = () => {
    if (!isToday(selectedDate)) return "";
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  return (
    <div className="text-center space-y-6">
      {/* Elegant Date Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={goToPreviousDay}
            className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 text-white/60 hover:text-white hover:scale-105"
            title="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 min-w-[280px]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  {getDateLabel()}
                </h2>
                <p className="text-white/50 text-xs font-medium tracking-wider uppercase">
                  {format(selectedDate, "MMMM yyyy")}
                </p>
              </div>
            </div>
            
            {/* Full date in elegant format */}
            <div className="text-white/70 text-sm font-light border-t border-white/10 pt-2 mt-2">
              {format(selectedDate, "EEEE, do")}
            </div>
          </div>

          <button
            onClick={goToNextDay}
            className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 text-white/60 hover:text-white hover:scale-105"
            title="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Navigation */}
        {!isToday(selectedDate) && (
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-xl text-white text-sm transition-all duration-200 backdrop-blur-sm border border-blue-500/30"
          >
            Return to Today
          </button>
        )}
      </div>

      {/* Greeting */}
      {getGreeting() && (
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
}