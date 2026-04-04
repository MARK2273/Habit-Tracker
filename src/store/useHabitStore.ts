import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfToday, subDays, format } from 'date-fns';
import { supabase } from '../lib/supabase';

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  completedDays: string[];
}

export type ViewType = 'dashboard' | 'calendar' | 'statistics' | 'settings';

interface HabitStore {
  habits: Habit[];
  theme: 'light' | 'dark';
  currentView: ViewType;
  isLoading: boolean;
  
  setTheme: (theme: 'light' | 'dark') => void;
  setView: (view: ViewType) => void;
  
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'completedDays'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  clearHabits: () => Promise<void>;
  
  getHabitStreak: (habitId: string) => number;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      theme: 'dark',
      currentView: 'dashboard',
      isLoading: true,

      setTheme: (theme) => set({ theme }),
      setView: (currentView) => set({ currentView }),

      fetchHabits: async () => {
        set({ isLoading: true });
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          set({ habits: [], isLoading: false });
          return;
        }

        const { data: habitsData } = await supabase.from('habits').select('*');
        const { data: completionsData } = await supabase.from('habit_completions').select('*');

        if (habitsData) {
          const formattedHabits: Habit[] = habitsData.map((h: any) => {
            const comps = completionsData
              ?.filter((c: any) => c.habit_id === h.id)
              .map((c: any) => c.date) || [];
            return {
              id: h.id,
              name: h.name,
              color: h.color,
              icon: h.icon,
              completedDays: comps,
            };
          });
          set({ habits: formattedHabits, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      addHabit: async (habit) => {
        const { data: session } = await supabase.auth.getSession();
        const user = session.session?.user;
        if (!user) return;

        const newHabit = {
          id: Math.random().toString(36).substring(2, 9),
          user_id: user.id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
        };

        // Optimistic UI Update
        set((state) => ({
          habits: [...state.habits, { ...newHabit, completedDays: [] }],
        }));

        // DB Sync
        await supabase.from('habits').insert([newHabit]);
      },

      updateHabit: async (id, updates) => {
        // Optimistic UI Update
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));

        // DB Sync (pick only allowed fields)
        const updatePayload: any = {};
        if (updates.name) updatePayload.name = updates.name;
        if (updates.color) updatePayload.color = updates.color;
        if (updates.icon) updatePayload.icon = updates.icon;
        
        if (Object.keys(updatePayload).length > 0) {
          await supabase.from('habits').update(updatePayload).eq('id', id);
        }
      },

      removeHabit: async (id) => {
        // Optimistic UI Update
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
        
        // DB Sync
        await supabase.from('habits').delete().eq('id', id);
      },

      clearHabits: async () => {
        const habits = get().habits;
        
        // Optimistic UI Update (clear completed days only)
        set((state) => ({
          habits: state.habits.map((habit) => ({ ...habit, completedDays: [] })),
        }));

        // DB Sync: Delete all completion records for this user (handled by RLS automatically if generic delete)
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user) {
          await supabase.from('habit_completions').delete().eq('user_id', session.session.user.id);
        }
      },

      toggleHabit: async (id, date) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return;

        const isCompleted = habit.completedDays.includes(date);
        
        // Optimistic UI Update
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === id) {
              const newDays = isCompleted
                ? h.completedDays.filter((d) => d !== date)
                : [...h.completedDays, date];
              return { ...h, completedDays: newDays };
            }
            return h;
          }),
        }));

        const { data: session } = await supabase.auth.getSession();
        const user = session.session?.user;
        if (!user) return;

        // DB Sync
        if (isCompleted) {
          await supabase.from('habit_completions').delete()
            .match({ habit_id: id, date: date, user_id: user.id });
        } else {
          await supabase.from('habit_completions').insert([
            { habit_id: id, date: date, user_id: user.id }
          ]);
        }
      },

      getHabitStreak: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit || habit.completedDays.length === 0) return 0;

        let streak = 0;
        let currentDate = startOfToday();

        const todayStr = format(currentDate, 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(currentDate, 1), 'yyyy-MM-dd');

        if (!habit.completedDays.includes(todayStr) && !habit.completedDays.includes(yesterdayStr)) {
          return 0;
        }

        if (habit.completedDays.includes(todayStr)) {
          streak = 1;
          currentDate = subDays(currentDate, 1);
        } else if (habit.completedDays.includes(yesterdayStr)) {
          streak = 1;
          currentDate = subDays(currentDate, 1);
        }

        while (true) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          if (habit.completedDays.includes(dateStr)) {
            streak++;
            currentDate = subDays(currentDate, 1);
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'habit-tracker-storage',
      // ONLY persist the theme and current view locally.
      // Habits are fetched from Supabase directly!
      partialize: (state) => ({ theme: state.theme, currentView: state.currentView }),
    }
  )
);
