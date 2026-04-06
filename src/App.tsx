import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/pages/DashboardView';
import { CalendarView } from './components/pages/CalendarView';
import { StatisticsView } from './components/pages/StatisticsView';
import { SettingsView } from './components/pages/SettingsView';
import { AuthView } from './components/pages/AuthView';
import { HabitForm } from './components/habits/HabitForm';
import { useHabitStore } from './store/useHabitStore';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const currentView = useHabitStore((state) => state.currentView);
  const theme = useHabitStore((state) => state.theme);
  const fetchHabits = useHabitStore((state) => state.fetchHabits);
  const subscribeToHabits = useHabitStore((state) => state.subscribeToHabits);
  const isLoading = useHabitStore((state) => state.isLoading);
  
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useNotifications();

  useEffect(() => {
    // Initial Session Check with a timeout safety net
    const timeoutId = setTimeout(() => {
      setIsInitializing(false);
    }, 5000); // 5 second timeout for auth check

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      setSession(session);
      setIsInitializing(false);
      if (session) fetchHabits();
    });

    // Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchHabits();
      } else if (event === 'SIGNED_OUT') {
        useHabitStore.setState({ habits: [] });
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchHabits]);

  // Real-time Subscription
  useEffect(() => {
    if (!session) return;
    
    const unsubscribe = subscribeToHabits();
    return () => {
      unsubscribe();
    };
  }, [session, subscribeToHabits]);

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onAddHabit={() => setIsFormOpen(true)} />;
      case 'calendar':
        return <CalendarView />;
      case 'statistics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onAddHabit={() => setIsFormOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-400">
      <AppLayout onNewHabit={() => setIsFormOpen(true)}>
        {isLoading && useHabitStore.getState().habits.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          renderView()
        )}
        
        {isFormOpen && <HabitForm onClose={() => setIsFormOpen(false)} />}
      </AppLayout>
    </div>
  );
}

export default App;
