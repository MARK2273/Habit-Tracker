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
  reminder_time?: string;
  createdAt: string;
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
  addHabit: (habit: Omit<Habit, 'id' | 'completedDays' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  clearHabits: () => Promise<void>;
  subscribeToHabits: () => (() => void);
  
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
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session?.user) {
            set({ habits: [], isLoading: false });
            return;
          }

          const { data: habitsData, error: habitsError } = await supabase.from('habits').select('*');
          const { data: completionsData, error: completionsError } = await supabase.from('habit_completions').select('*');

          if (habitsError || completionsError) {
            console.error('Error fetching habits or completions:', habitsError || completionsError);
            set({ isLoading: false });
            return;
          }

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
                reminder_time: h.reminder_time,
                createdAt: h.created_at,
              };
            });
            set({ habits: formattedHabits, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Unexpected error in fetchHabits:', error);
          set({ isLoading: false });
        }
      },

      addHabit: async (habit) => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          const user = session?.user;
          if (sessionError || !user) {
            console.error('Session error or no user found:', sessionError);
            return;
          }

          const newHabit = {
            id: Math.random().toString(36).substring(2, 9),
            user_id: user.id,
            name: habit.name,
            color: habit.color,
            icon: habit.icon,
            reminder_time: habit.reminder_time,
            created_at: new Date().toISOString(),
          };

          // Optimistic UI Update
          set((state) => ({
            habits: [...state.habits, { 
              id: newHabit.id,
              name: newHabit.name,
              color: newHabit.color,
              icon: newHabit.icon,
              completedDays: [],
              reminder_time: newHabit.reminder_time,
              createdAt: newHabit.created_at 
            }],
          }));

          // DB Sync
          const { error } = await supabase.from('habits').insert([newHabit]);
          if (error) {
            console.error('Error adding habit to DB:', error);
            // Optionally rollback optimistic update here
            get().fetchHabits(); 
          }
        } catch (error) {
          console.error('Unexpected error in addHabit:', error);
        }
      },

      updateHabit: async (id, updates) => {
        try {
          // Optimistic UI Update
          set((state) => ({
            habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
          }));

          // DB Sync (pick only allowed fields)
          const updatePayload: any = {};
          if (updates.name) updatePayload.name = updates.name;
          if (updates.color) updatePayload.color = updates.color;
          if (updates.icon) updatePayload.icon = updates.icon;
          if (updates.reminder_time !== undefined) updatePayload.reminder_time = updates.reminder_time;
          
          if (Object.keys(updatePayload).length > 0) {
            const { error } = await supabase.from('habits').update(updatePayload).eq('id', id);
            if (error) {
              console.error('Error updating habit in DB:', error);
              get().fetchHabits();
            }
          }
        } catch (error) {
          console.error('Unexpected error in updateHabit:', error);
        }
      },

      removeHabit: async (id) => {
        try {
          // Optimistic UI Update
          set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
          
          // DB Sync
          const { error } = await supabase.from('habits').delete().eq('id', id);
          if (error) {
            console.error('Error removing habit from DB:', error);
            get().fetchHabits();
          }
        } catch (error) {
          console.error('Unexpected error in removeHabit:', error);
        }
      },

      clearHabits: async () => {
        try {
          // Optimistic UI Update (clear completed days only)
          set((state) => ({
            habits: state.habits.map((habit) => ({ ...habit, completedDays: [] })),
          }));

          // DB Sync: Delete all completion records for this user
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (session?.user) {
            const { error } = await supabase.from('habit_completions').delete().eq('user_id', session.user.id);
            if (error) {
              console.error('Error clearing completions from DB:', error);
              get().fetchHabits();
            }
          } else if (sessionError) {
            console.error('Session error in clearHabits:', sessionError);
          }
        } catch (error) {
          console.error('Unexpected error in clearHabits:', error);
        }
      },

      toggleHabit: async (id, date) => {
        try {
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

          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          const user = session?.user;
          if (sessionError || !user) {
            console.error('Session error or no user found:', sessionError);
            get().fetchHabits();
            return;
          }

          // DB Sync
          if (isCompleted) {
            const { error } = await supabase.from('habit_completions').delete()
              .match({ habit_id: id, date: date, user_id: user.id });
            if (error) {
              console.error('Error deleting completion:', error);
              get().fetchHabits();
            }
          } else {
            const { error } = await supabase.from('habit_completions').insert([
              { habit_id: id, date: date, user_id: user.id }
            ]);
            if (error) {
              console.error('Error adding completion:', error);
              get().fetchHabits();
            }
          }
        } catch (error) {
          console.error('Unexpected error in toggleHabit:', error);
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
          currentDate = subDays(currentDate, 2);
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

      subscribeToHabits: () => {
        const channel = supabase
          .channel('habits_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'habits',
            },
            () => {
              get().fetchHabits();
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'habit_completions',
            },
            () => {
              get().fetchHabits();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
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
