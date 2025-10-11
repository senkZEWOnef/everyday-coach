"use client";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { Bell, Clock, X } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "workout" | "meal" | "habit" | "other";
  reminder?: number; // minutes before
  completed?: boolean;
};

export function MiniCalendar() {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>("calendar:events", []);
  const [notifications, setNotifications] = useLocalStorage<string[]>("calendar:notifications", []);
  
  const start = startOfMonth(cursor);
  const end = endOfMonth(cursor);
  const days = eachDayOfInterval({ start, end });

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    time: "",
    type: "other",
    reminder: 15,
  });

  const prev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const next = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const addEvent = () => {
    if (!newEvent.title || !selectedDate) return;
    
    const event: CalendarEvent = {
      id: Math.random().toString(36).slice(2, 9),
      title: newEvent.title,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: newEvent.time,
      type: newEvent.type || "other",
      reminder: newEvent.reminder,
      completed: false,
    };
    
    setEvents([...events, event]);
    setNewEvent({ title: "", time: "", type: "other", reminder: 15 });
    setShowEventForm(false);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  // Notification system
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        if (!event.time || !event.reminder || event.completed) return false;
        
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const reminderTime = new Date(eventDateTime.getTime() - event.reminder * 60000);
        
        return now >= reminderTime && now < eventDateTime && !notifications.includes(event.id);
      });

      upcomingEvents.forEach(event => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Upcoming: ${event.title}`, {
            body: `Starting in ${event.reminder} minutes`,
            icon: '/favicon.ico'
          });
        }
        setNotifications([...notifications, event.id]);
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events, notifications, setNotifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getEventTypeColor = (type: string) => {
    const colors = {
      workout: "bg-red-500/20 text-red-300",
      meal: "bg-green-500/20 text-green-300",
      habit: "bg-blue-500/20 text-blue-300",
      other: "bg-purple-500/20 text-purple-300"
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <button className="btn-ghost" onClick={prev}>
            ←
          </button>
          <div className="text-lg font-medium">{format(cursor, "MMMM yyyy")}</div>
          <button className="btn-ghost" onClick={next}>
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-xs text-white/60 text-center">
              {d}
            </div>
          ))}
          {days.map((d) => {
            const dayEvents = getEventsForDay(d);
            return (
              <div
                key={d.toISOString()}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center border border-white/10 cursor-pointer hover:bg-white/5 ${
                  isToday(d) ? "bg-brand-accent text-black" : ""
                } ${!isSameMonth(d, cursor) ? "opacity-40" : ""} ${
                  selectedDate && isSameDay(selectedDate, d) ? "ring-2 ring-blue-400" : ""
                }`}
                onClick={() => {
                  setSelectedDate(d);
                  setShowEventForm(true);
                }}
              >
                <span className="text-sm">{format(d, "d")}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`w-1 h-1 rounded-full ${
                          isToday(d) ? "bg-black" : "bg-blue-400"
                        }`}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className={`text-[8px] ${isToday(d) ? "text-black" : "text-white/60"}`}>
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Form */}
      {showEventForm && selectedDate && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Add Event - {format(selectedDate, "MMM dd, yyyy")}
            </h3>
            <button
              className="btn-ghost"
              onClick={() => setShowEventForm(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <input
              className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
              
              <select
                className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })}
              >
                <option value="workout">Workout</option>
                <option value="meal">Meal</option>
                <option value="habit">Habit</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-white/60" />
              <select
                className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
                value={newEvent.reminder}
                onChange={(e) => setNewEvent({ ...newEvent, reminder: Number(e.target.value) })}
              >
                <option value={0}>No reminder</option>
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="btn-ghost"
                onClick={() => setShowEventForm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={addEvent}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Events */}
      {selectedDate && (
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-4">
            Events for {format(selectedDate, "MMM dd, yyyy")}
          </h3>
          
          {getEventsForDay(selectedDate).length === 0 ? (
            <p className="text-white/60 text-center py-4">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDay(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    event.completed ? "opacity-60 line-through" : ""
                  } ${getEventTypeColor(event.type)}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={event.completed}
                      onChange={() => toggleEventComplete(event.id)}
                      className="rounded"
                    />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm opacity-80">
                        {event.time && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </>
                        )}
                        {event.reminder && (
                          <>
                            <Bell className="w-3 h-3" />
                            <span>{event.reminder}min reminder</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-ghost text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
