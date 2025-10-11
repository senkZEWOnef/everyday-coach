import { useState, useEffect } from "react";

type Habit = {
  id: string;
  name: string;
  createdAt: string;
};

type HabitCompletion = {
  id: string;
  habitId: string;
  date: string;
  createdAt: string;
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      const data = await response.json();
      setHabits(data.habits || []);
      setCompletions(data.completions || []);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (name: string) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const newHabit = await response.json();
      setHabits(prev => [...prev, newHabit]);
      return newHabit;
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  };

  const toggleHabit = async (habitId: string, date: string, completed: boolean) => {
    try {
      await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date, completed }),
      });
      
      if (completed) {
        const newCompletion = {
          id: Date.now().toString(),
          habitId,
          date,
          createdAt: new Date().toISOString(),
        };
        setCompletions(prev => [...prev, newCompletion]);
      } else {
        setCompletions(prev => prev.filter(c => !(c.habitId === habitId && c.date === date)));
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const isHabitCompleted = (habitId: string, date: string) => {
    return completions.some(c => c.habitId === habitId && c.date === date);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return {
    habits,
    loading,
    addHabit,
    toggleHabit,
    isHabitCompleted,
    refresh: fetchHabits,
  };
}