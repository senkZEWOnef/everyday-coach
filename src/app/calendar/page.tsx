"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  isToday,
  addHours,
  differenceInMinutes
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  Coffee,
  Utensils,
  Briefcase,
  Bell,
  Phone,
  MessageCircle,
  Settings,
  Plus,
  X,
  Droplets,
  Calendar as CalendarIcon
} from "lucide-react";

type TimeBlock = {
  id: string;
  date: string;
  startTime: string; // HH:mm format
  endTime: string;
  title: string;
  type: "work" | "meal" | "water" | "meeting" | "exercise" | "personal" | "break";
  description?: string;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
  recurringDays?: number[]; // 0=Sunday, 1=Monday, etc.
  reminderMinutes?: number;
  color?: string;
};

type NotificationSettings = {
  waterReminders: boolean;
  waterInterval: number; // minutes
  mealReminders: boolean;
  workBreaks: boolean;
  breakInterval: number; // minutes
  whatsappEnabled: boolean;
  whatsappNumber: string;
  dailySummaryTime: string; // HH:mm format
};

type DayView = "week" | "day" | "agenda";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIME_SLOT_HEIGHT = 60; // pixels per hour

const BLOCK_COLORS = {
  work: "bg-blue-500/20 border-blue-400/30 text-blue-300",
  meal: "bg-green-500/20 border-green-400/30 text-green-300",
  water: "bg-cyan-500/20 border-cyan-400/30 text-cyan-300",
  meeting: "bg-purple-500/20 border-purple-400/30 text-purple-300",
  exercise: "bg-red-500/20 border-red-400/30 text-red-300",
  personal: "bg-yellow-500/20 border-yellow-400/30 text-yellow-300",
  break: "bg-gray-500/20 border-gray-400/30 text-gray-300"
};

const BLOCK_ICONS = {
  work: Briefcase,
  meal: Utensils,
  water: Droplets,
  meeting: Phone,
  exercise: Coffee, // Using coffee as exercise placeholder
  personal: CalendarIcon,
  break: Clock
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<DayView>("day");
  const [timeBlocks, setTimeBlocks] = useLocalStorage<TimeBlock[]>("calendar:timeBlocks", []);
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>("calendar:notifications", {
    waterReminders: true,
    waterInterval: 120, // 2 hours
    mealReminders: true,
    workBreaks: true,
    breakInterval: 60, // 1 hour
    whatsappEnabled: false,
    whatsappNumber: "",
    dailySummaryTime: "06:00"
  });
  
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [newBlock, setNewBlock] = useState<Partial<TimeBlock>>({
    title: "",
    type: "work",
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    location: "",
    reminderMinutes: 15
  });

  // Ensure arrays are safe
  const safeTimeBlocks = Array.isArray(timeBlocks) ? timeBlocks : [];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Date navigation
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Get week start for week view
  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get time blocks for a specific date
  const getTimeBlocksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return safeTimeBlocks.filter(block => block.date === dateStr);
  };

  // Create time block
  const createTimeBlock = () => {
    if (!newBlock.title || !newBlock.startTime || !newBlock.endTime) return;

    const block: TimeBlock = {
      id: Date.now().toString(),
      date: format(selectedDate, "yyyy-MM-dd"),
      title: newBlock.title,
      type: newBlock.type || "work",
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      description: newBlock.description,
      location: newBlock.location,
      reminderMinutes: newBlock.reminderMinutes,
      isRecurring: false
    };

    setTimeBlocks([...safeTimeBlocks, block]);
    setNewBlock({
      title: "",
      type: "work",
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      location: "",
      reminderMinutes: 15
    });
    setShowBlockForm(false);
  };

  // Update time block
  const updateTimeBlock = () => {
    if (!editingBlock) return;

    setTimeBlocks(safeTimeBlocks.map(block => 
      block.id === editingBlock.id ? editingBlock : block
    ));
    setEditingBlock(null);
  };

  // Delete time block
  const deleteTimeBlock = (blockId: string) => {
    setTimeBlocks(safeTimeBlocks.filter(block => block.id !== blockId));
  };

  // Quick add blocks
  const quickAddWater = () => {
    const now = new Date();
    const block: TimeBlock = {
      id: Date.now().toString(),
      date: format(selectedDate, "yyyy-MM-dd"),
      title: "Drink Water",
      type: "water",
      startTime: format(now, "HH:mm"),
      endTime: format(addHours(now, 0.25), "HH:mm"), // 15 minutes
      description: "Stay hydrated"
    };
    setTimeBlocks([...safeTimeBlocks, block]);
  };

  const quickAddMeal = (mealType: string) => {
    const mealTimes = {
      breakfast: "08:00",
      lunch: "12:00",
      dinner: "18:00"
    };
    const startTime = mealTimes[mealType as keyof typeof mealTimes] || "12:00";
    const endTime = format(addHours(new Date(`2000-01-01T${startTime}`), 1), "HH:mm");
    
    const block: TimeBlock = {
      id: Date.now().toString(),
      date: format(selectedDate, "yyyy-MM-dd"),
      title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
      type: "meal",
      startTime,
      endTime,
      description: `Time for ${mealType}`
    };
    setTimeBlocks([...safeTimeBlocks, block]);
  };

  // WhatsApp integration
  const sendWhatsAppSummary = async () => {
    if (!notifications.whatsappEnabled || !notifications.whatsappNumber) return;

    const todayBlocks = getTimeBlocksForDate(new Date());
    const meetings = todayBlocks.filter(block => block.type === "meeting");
    
    if (meetings.length === 0) return;

    const summary = `🗓️ Today's Meetings (${format(new Date(), "MMM dd")}):\n\n` +
      meetings.map(meeting => 
        `• ${meeting.startTime} - ${meeting.title}${meeting.location ? ` @ ${meeting.location}` : ""}`
      ).join("\n") +
      `\n\nHave a productive day! 💪`;

    // In a real app, you'd integrate with WhatsApp Business API or Twilio
    console.log("WhatsApp Summary:", summary);
    console.log("Send to:", notifications.whatsappNumber);
    
    // For demo purposes, show alert
    alert(`WhatsApp summary would be sent to ${notifications.whatsappNumber}:\n\n${summary}`);
  };

  // Notification system
  useEffect(() => {
    if (!isClient) return;

    const checkNotifications = () => {
      const now = new Date();
      const currentTime = format(now, "HH:mm");

      // Daily WhatsApp summary
      if (notifications.whatsappEnabled && currentTime === notifications.dailySummaryTime) {
        sendWhatsAppSummary();
      }

      // Water reminders
      if (notifications.waterReminders) {
        const lastWater = localStorage.getItem("lastWaterReminder");
        const lastWaterTime = lastWater ? new Date(lastWater) : new Date(0);
        const minutesSinceLastWater = differenceInMinutes(now, lastWaterTime);
        
        if (minutesSinceLastWater >= notifications.waterInterval) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("💧 Hydration Time!", {
              body: "Time to drink some water",
              icon: '/favicon.ico'
            });
          }
          localStorage.setItem("lastWaterReminder", now.toISOString());
        }
      }

      // Work break reminders
      if (notifications.workBreaks) {
        const workBlocks = getTimeBlocksForDate(now).filter(block => block.type === "work");
        const activeWork = workBlocks.find(block => {
          const start = new Date(`${block.date}T${block.startTime}`);
          const end = new Date(`${block.date}T${block.endTime}`);
          return now >= start && now <= end;
        });

        if (activeWork) {
          const workStart = new Date(`${activeWork.date}T${activeWork.startTime}`);
          const minutesWorking = differenceInMinutes(now, workStart);
          
          if (minutesWorking > 0 && minutesWorking % notifications.breakInterval === 0) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("🧘 Break Time!", {
                body: "You've been working for a while. Take a short break!",
                icon: '/favicon.ico'
              });
            }
          }
        }
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [notifications, isClient, getTimeBlocksForDate, sendWhatsAppSummary]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Calculate position for time blocks
  const getBlockPosition = (block: TimeBlock) => {
    const [startHour, startMinute] = block.startTime.split(":").map(Number);
    const [endHour, endMinute] = block.endTime.split(":").map(Number);
    
    const startY = (startHour * TIME_SLOT_HEIGHT) + (startMinute * TIME_SLOT_HEIGHT / 60);
    const endY = (endHour * TIME_SLOT_HEIGHT) + (endMinute * TIME_SLOT_HEIGHT / 60);
    const height = endY - startY;
    
    return { top: startY, height: Math.max(height, 30) };
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goToPreviousDay} className="btn-ghost p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              {viewMode === "week" 
                ? `Week of ${format(weekStart, "MMM dd, yyyy")}`
                : format(selectedDate, "EEEE, MMM dd, yyyy")
              }
            </h1>
            <p className="text-white/60 text-sm">
              Smart Calendar & Time Blocking
            </p>
          </div>
          <button onClick={goToNextDay} className="btn-ghost p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="btn-ghost">
            <Calendar className="w-4 h-4 mr-1" />
            Today
          </button>
          
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-sm ${viewMode === "day" ? "bg-blue-500 text-white" : "text-white/60"}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-sm ${viewMode === "week" ? "bg-blue-500 text-white" : "text-white/60"}`}
            >
              Week
            </button>
          </div>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="btn-ghost"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2">
        <button onClick={() => setShowBlockForm(true)} className="btn-primary text-sm whitespace-nowrap">
          <Plus className="w-4 h-4 mr-1" />
          Add Block
        </button>
        <button onClick={quickAddWater} className="btn-ghost text-sm whitespace-nowrap">
          <Droplets className="w-4 h-4 mr-1" />
          Water Break
        </button>
        <button onClick={() => quickAddMeal("breakfast")} className="btn-ghost text-sm whitespace-nowrap">
          <Utensils className="w-4 h-4 mr-1" />
          Breakfast
        </button>
        <button onClick={() => quickAddMeal("lunch")} className="btn-ghost text-sm whitespace-nowrap">
          <Utensils className="w-4 h-4 mr-1" />
          Lunch
        </button>
        <button onClick={() => quickAddMeal("dinner")} className="btn-ghost text-sm whitespace-nowrap">
          <Utensils className="w-4 h-4 mr-1" />
          Dinner
        </button>
        {notifications.whatsappEnabled && (
          <button onClick={sendWhatsAppSummary} className="btn-ghost text-sm whitespace-nowrap">
            <MessageCircle className="w-4 h-4 mr-1" />
            Send Summary
          </button>
        )}
      </section>

      {/* Calendar View */}
      <section className="card p-6">
        {viewMode === "day" ? (
          <div className="relative">
            {/* Time column */}
            <div className="flex">
              <div className="w-16 flex-shrink-0">
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="h-[60px] flex items-start justify-end pr-2 text-xs text-white/60 border-b border-white/5"
                  >
                    {format(new Date().setHours(hour, 0), "HH:mm")}
                  </div>
                ))}
              </div>
              
              {/* Day column */}
              <div className="flex-1 relative">
                {/* Hour lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => {
                      setNewBlock({
                        ...newBlock,
                        startTime: format(new Date().setHours(hour, 0), "HH:mm"),
                        endTime: format(new Date().setHours(hour + 1, 0), "HH:mm")
                      });
                      setShowBlockForm(true);
                    }}
                  />
                ))}
                
                {/* Time blocks */}
                {getTimeBlocksForDate(selectedDate).map(block => {
                  const position = getBlockPosition(block);
                  const IconComponent = BLOCK_ICONS[block.type];
                  
                  return (
                    <div
                      key={block.id}
                      className={`absolute left-1 right-1 rounded-lg border p-2 cursor-pointer hover:shadow-lg transition-all ${BLOCK_COLORS[block.type]}`}
                      style={{
                        top: position.top,
                        height: position.height,
                        zIndex: 10
                      }}
                      onClick={() => setEditingBlock(block)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium text-sm">{block.title}</span>
                      </div>
                      <div className="text-xs opacity-80">
                        {block.startTime} - {block.endTime}
                      </div>
                      {block.location && (
                        <div className="text-xs opacity-60 mt-1">{block.location}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Week view
          <div className="grid grid-cols-8 gap-1">
            <div className="text-xs text-white/60 p-2">Time</div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="text-center p-2">
                <div className="text-xs text-white/60">{format(day, "EEE")}</div>
                <div className={`text-sm font-medium ${isToday(day) ? "text-blue-400" : ""}`}>
                  {format(day, "dd")}
                </div>
              </div>
            ))}
            
            {HOURS.slice(6, 22).map(hour => (
              <div key={hour} className="contents">
                <div className="text-xs text-white/60 p-2 border-t border-white/5">
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </div>
                {weekDays.map(day => {
                  const dayBlocks = getTimeBlocksForDate(day).filter(block => {
                    const blockHour = parseInt(block.startTime.split(":")[0]);
                    return blockHour === hour;
                  });
                  
                  return (
                    <div key={`${day.toISOString()}-${hour}`} className="min-h-[40px] border-t border-white/5 p-1">
                      {dayBlocks.map(block => (
                        <div
                          key={block.id}
                          className={`text-xs p-1 rounded mb-1 cursor-pointer ${BLOCK_COLORS[block.type]}`}
                          onClick={() => setEditingBlock(block)}
                        >
                          {block.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add/Edit Block Form */}
      {(showBlockForm || editingBlock) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingBlock ? "Edit Time Block" : "Add Time Block"}
              </h3>
              <button
                onClick={() => {
                  setShowBlockForm(false);
                  setEditingBlock(null);
                }}
                className="btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                placeholder="Block title"
                value={editingBlock ? editingBlock.title : newBlock.title || ""}
                onChange={(e) => {
                  if (editingBlock) {
                    setEditingBlock({...editingBlock, title: e.target.value});
                  } else {
                    setNewBlock({...newBlock, title: e.target.value});
                  }
                }}
              />
              
              <select
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2"
                value={editingBlock ? editingBlock.type : newBlock.type || "work"}
                onChange={(e) => {
                  const type = e.target.value as TimeBlock["type"];
                  if (editingBlock) {
                    setEditingBlock({...editingBlock, type});
                  } else {
                    setNewBlock({...newBlock, type});
                  }
                }}
              >
                <option value="work">Work</option>
                <option value="meeting">Meeting</option>
                <option value="meal">Meal</option>
                <option value="water">Water Break</option>
                <option value="exercise">Exercise</option>
                <option value="personal">Personal</option>
                <option value="break">Break</option>
              </select>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                    value={editingBlock ? editingBlock.startTime : newBlock.startTime || "09:00"}
                    onChange={(e) => {
                      if (editingBlock) {
                        setEditingBlock({...editingBlock, startTime: e.target.value});
                      } else {
                        setNewBlock({...newBlock, startTime: e.target.value});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                    value={editingBlock ? editingBlock.endTime : newBlock.endTime || "10:00"}
                    onChange={(e) => {
                      if (editingBlock) {
                        setEditingBlock({...editingBlock, endTime: e.target.value});
                      } else {
                        setNewBlock({...newBlock, endTime: e.target.value});
                      }
                    }}
                  />
                </div>
              </div>
              
              <textarea
                className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                placeholder="Description (optional)"
                rows={3}
                value={editingBlock ? editingBlock.description || "" : newBlock.description || ""}
                onChange={(e) => {
                  if (editingBlock) {
                    setEditingBlock({...editingBlock, description: e.target.value});
                  } else {
                    setNewBlock({...newBlock, description: e.target.value});
                  }
                }}
              />
              
              <input
                className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                placeholder="Location (optional)"
                value={editingBlock ? editingBlock.location || "" : newBlock.location || ""}
                onChange={(e) => {
                  if (editingBlock) {
                    setEditingBlock({...editingBlock, location: e.target.value});
                  } else {
                    setNewBlock({...newBlock, location: e.target.value});
                  }
                }}
              />
              
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white/60" />
                <select
                  className="flex-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2"
                  value={editingBlock ? editingBlock.reminderMinutes || 0 : newBlock.reminderMinutes || 0}
                  onChange={(e) => {
                    const reminderMinutes = Number(e.target.value);
                    if (editingBlock) {
                      setEditingBlock({...editingBlock, reminderMinutes});
                    } else {
                      setNewBlock({...newBlock, reminderMinutes});
                    }
                  }}
                >
                  <option value={0}>No reminder</option>
                  <option value={5}>5 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>
              
              <div className="flex justify-between pt-4">
                {editingBlock && (
                  <button
                    onClick={() => {
                      deleteTimeBlock(editingBlock.id);
                      setEditingBlock(null);
                    }}
                    className="btn-ghost text-red-400"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => {
                      setShowBlockForm(false);
                      setEditingBlock(null);
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingBlock ? updateTimeBlock : createTimeBlock}
                    className="btn-primary"
                  >
                    {editingBlock ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <button onClick={() => setShowSettings(false)} className="btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Water Reminders */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={notifications.waterReminders}
                    onChange={(e) => setNotifications({...notifications, waterReminders: e.target.checked})}
                    className="rounded"
                  />
                  <Droplets className="w-4 h-4" />
                  <span>Water Reminders</span>
                </label>
                <select
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2"
                  value={notifications.waterInterval}
                  onChange={(e) => setNotifications({...notifications, waterInterval: Number(e.target.value)})}
                  disabled={!notifications.waterReminders}
                >
                  <option value={60}>Every hour</option>
                  <option value={120}>Every 2 hours</option>
                  <option value={180}>Every 3 hours</option>
                </select>
              </div>

              {/* Work Break Reminders */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={notifications.workBreaks}
                    onChange={(e) => setNotifications({...notifications, workBreaks: e.target.checked})}
                    className="rounded"
                  />
                  <Clock className="w-4 h-4" />
                  <span>Work Break Reminders</span>
                </label>
                <select
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2"
                  value={notifications.breakInterval}
                  onChange={(e) => setNotifications({...notifications, breakInterval: Number(e.target.value)})}
                  disabled={!notifications.workBreaks}
                >
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                  <option value={90}>Every 1.5 hours</option>
                </select>
              </div>

              {/* Meal Reminders */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifications.mealReminders}
                    onChange={(e) => setNotifications({...notifications, mealReminders: e.target.checked})}
                    className="rounded"
                  />
                  <Utensils className="w-4 h-4" />
                  <span>Meal Reminders</span>
                </label>
              </div>

              {/* WhatsApp Integration */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifications.whatsappEnabled}
                    onChange={(e) => setNotifications({...notifications, whatsappEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Daily Summary</span>
                </label>
                
                <input
                  className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                  placeholder="WhatsApp number (e.g., +1234567890)"
                  value={notifications.whatsappNumber}
                  onChange={(e) => setNotifications({...notifications, whatsappNumber: e.target.value})}
                  disabled={!notifications.whatsappEnabled}
                />
                
                <div>
                  <label className="block text-sm font-medium mb-1">Daily summary time</label>
                  <input
                    type="time"
                    className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                    value={notifications.dailySummaryTime}
                    onChange={(e) => setNotifications({...notifications, dailySummaryTime: e.target.value})}
                    disabled={!notifications.whatsappEnabled}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button onClick={() => setShowSettings(false)} className="btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}