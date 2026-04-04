import React from 'react';
import { HabitCard } from '../habits/HabitCard';
import { Plus, Sparkles } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { format } from 'date-fns';

interface DashboardViewProps {
  onAddHabit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onAddHabit }) => {
  const habits = useHabitStore((state) => state.habits);
  
  const today = new Date();
  const completedTodayCount = habits.filter(h => 
    h.completedDays.includes(format(today, 'yyyy-MM-dd'))
  ).length;

  const progress = habits.length > 0 ? (completedTodayCount / habits.length) * 100 : 0;

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold text-on-surface tracking-tight mb-2">
            Welcome back, <span className="text-primary">Designer</span>
          </h2>
          <p className="text-on-surface-variant text-base sm:text-lg">
            You've completed <span className="text-on-surface font-semibold">{completedTodayCount} of {habits.length}</span> habits today.
          </p>
        </div>
        
        <div className="flex sm:items-center gap-6 text-left sm:text-right">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Daily Progress</p>
            <div className="flex items-center gap-3">
              <div className="w-24 sm:w-32 h-1.5 bg-surface-low rounded-full overflow-hidden">
                <div 
                  className="h-full btn-gradient transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habitId={habit.id} />
        ))}

        <button 
          onClick={onAddHabit}
          className="group h-[108px] border-2 border-dashed border-outline-variant/20 rounded-xl flex items-center justify-center gap-3 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus size={20} />
          </div>
          <span className="font-semibold text-sm sm:text-base">Add a new ritual</span>
        </button>
      </section>

      {habits.length > 0 && (
        <section className="mt-12 sm:mt-16 p-6 sm:p-8 glass-card border border-outline-variant/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4 shadow-inner">
            <Sparkles size={24} className="sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">Build Your Digital Sanctuary</h3>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-md mx-auto">
            Consistency is the key to mastery. Every ritual completed brings you closer to your "Momentum Bloom" - an organic visualization of your creative growth.
          </p>
        </section>
      )}
    </div>
  );
};
