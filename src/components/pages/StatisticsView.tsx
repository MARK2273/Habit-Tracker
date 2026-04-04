import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/useHabitStore';
import { Trophy, Target, Zap, Activity } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export const StatisticsView: React.FC = () => {
  const habits = useHabitStore((state) => state.habits);
  const getHabitStreak = useHabitStore((state) => state.getHabitStreak);

  const stats = useMemo(() => {
    let totalCompletions = 0;
    let longestStreak = 0;
    let bestHabitObj: any = null;

    habits.forEach(habit => {
      totalCompletions += habit.completedDays.length;
      const streak = getHabitStreak(habit.id);
      
      // Also calculate all-time longest streak for a habit (simplified: just using current streak or max completions if no streak)
      // A full implementation would calculate historical streaks. For now, max current streak.
      if (streak > longestStreak) {
        longestStreak = streak;
        bestHabitObj = habit;
      }
    });

    const activeHabits = habits.length;

    // A rough completion rate calculation over the last 30 days would be better, but simple global rate:
    const totalPossibleDays = habits.reduce((acc, habit) => {
      const daysSinceCreation = Math.max(1, differenceInDays(new Date(), new Date(habit.createdAt)) + 1);
      return acc + daysSinceCreation;
    }, 0);

    const completionRate = totalPossibleDays > 0 
      ? Math.round((totalCompletions / totalPossibleDays) * 100) 
      : 0;

    return {
      totalCompletions,
      longestStreak,
      activeHabits,
      completionRate,
      bestHabit: bestHabitObj?.name || 'None yet'
    };
  }, [habits, getHabitStreak]);

  const StatCard = ({ title, value, icon: Icon, subtitle }: any) => (
    <div className="glass-card border border-outline-variant/10 p-6 flex flex-col items-center text-center justify-center min-h-[160px]">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-bold text-on-surface mb-1">{value}</p>
      {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-on-surface tracking-tight mb-2">Statistics</h2>
        <p className="text-on-surface-variant text-lg">Measure your momentum and track your sanctuary's growth.</p>
      </header>

      {habits.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant bg-surface-low rounded-xl border border-outline-variant/10 mt-8">
          Add some habits to see your statistics bloom.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard 
              title="Total Completions" 
              value={stats.totalCompletions} 
              icon={Target} 
              subtitle="All time rituals done"
            />
            <StatCard 
              title="Longest Streak" 
              value={`${stats.longestStreak} Days`} 
              icon={Zap} 
              subtitle={`Best: ${stats.bestHabit}`}
            />
            <StatCard 
              title="Active Habits" 
              value={stats.activeHabits} 
              icon={Activity} 
              subtitle="Currently tracking"
            />
            <StatCard 
              title="Completion Rate" 
              value={`${stats.completionRate}%`} 
              icon={Trophy} 
              subtitle="Average consistency"
            />
          </div>

          {/* Simple Visual Bar Chart representing completion counts per habit */}
          <div className="glass-card border border-outline-variant/10 p-6 pt-8">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Completions by Ritual</h3>
            <div className="space-y-6">
              {habits.map(habit => {
                const maxCompletions = Math.max(...habits.map(h => h.completedDays.length), 1);
                const percentage = (habit.completedDays.length / maxCompletions) * 100;
                
                return (
                  <div key={habit.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-on-surface">{habit.name}</span>
                      <span className="text-on-surface-variant">{habit.completedDays.length} completions</span>
                    </div>
                    <div className="h-3 w-full bg-surface-low rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
