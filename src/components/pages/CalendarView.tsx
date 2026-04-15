import React, { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/useHabitStore';
import { HabitNoteModal } from '../habits/HabitNoteModal';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, subMonths, addMonths, startOfYear, endOfYear, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, LayoutGrid, Table2, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type DisplayMode = 'cards' | 'matrix' | 'heatmap';

export const CalendarView: React.FC = () => {
  const habits = useHabitStore((state) => state.habits);
  const [selectedNote, setSelectedNote] = useState<{ habitId: string; date: string } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<DisplayMode>('matrix');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const currentYear = currentDate.getFullYear();

  // Helper for Global Heatmap
  const { yearlyDays, paddingOffset, maxDailyCompletions } = useMemo(() => {
    const start = startOfYear(currentDate);
    const end = endOfYear(currentDate);
    const days = eachDayOfInterval({ start, end });
    const padding = getDay(start); // 0 for Sunday
    
    // Calculate global max completions to scale the heatmap color intensity
    let max = 0;
    days.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const comps = habits.filter(h => h.completedDays.includes(dayStr)).length;
      if (comps > max) max = comps;
    });

    return { yearlyDays: days, paddingOffset: padding, maxDailyCompletions: Math.max(max, 1) };
  }, [currentDate, habits]);

  const getHeatmapColor = (completions: number) => {
    if (completions === 0) return 'bg-surface-low';
    const ratio = completions / maxDailyCompletions;
    if (ratio <= 0.33) return 'bg-secondary/40';
    if (ratio <= 0.66) return 'bg-secondary/70';
    return 'bg-secondary';
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold text-on-surface tracking-tight mb-2">Calendar</h2>
          <p className="text-on-surface-variant text-base sm:text-lg">Your complete history and analytics.</p>
        </div>
        
        {/* Controls Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Display Mode Toggle */}
          <div className="flex items-center w-full sm:w-auto bg-surface-low/50 p-1 rounded-xl border border-outline-variant/10">
            <button 
              onClick={() => setDisplayMode('cards')} 
              className={cn("flex-1 sm:flex-initial p-2 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-all font-medium", displayMode === 'cards' ? 'bg-surface-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}
            >
              <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> Cards
            </button>
            <button 
              onClick={() => setDisplayMode('matrix')} 
              className={cn("flex-1 sm:flex-initial p-2 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-all font-medium", displayMode === 'matrix' ? 'bg-surface-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}
            >
              <Table2 size={14} className="sm:w-4 sm:h-4" /> Matrix
            </button>
            <button 
              onClick={() => setDisplayMode('heatmap')} 
              className={cn("flex-1 sm:flex-initial p-2 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-all font-medium", displayMode === 'heatmap' ? 'bg-surface-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}
            >
              <CalendarIcon size={14} className="sm:w-4 sm:h-4" /> Year
            </button>
          </div>

          {/* Time Navigation */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 bg-surface-low p-1.5 rounded-xl border border-outline-variant/10">
            <button onClick={prevMonth} className="p-1.5 hover:bg-surface-lowest rounded-md shadow-sm transition-colors text-on-surface-variant">
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-xs sm:text-sm text-on-surface min-w-[80px] sm:w-28 text-center uppercase tracking-tighter sm:tracking-normal">
              {displayMode === 'heatmap' ? currentYear : format(currentDate, 'MMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-surface-lowest rounded-md shadow-sm transition-colors text-on-surface-variant">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {habits.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant bg-surface-low rounded-xl border border-outline-variant/10">
          No habits created yet. Add one from the Dashboard!
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          
          {/* Individual Habit Cards View */}
          {displayMode === 'cards' && habits.map((habit) => (
            <div key={habit.id} className="glass-card border border-outline-variant/10 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-base sm:text-lg font-semibold text-on-surface mb-4">{habit.name}</h3>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 gap-y-3 sm:gap-y-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 sm:mb-2">
                    <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</span>
                    <span className="sm:hidden">{day}</span>
                  </div>
                ))}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 sm:h-10 rounded-lg bg-surface-low/30" />
                ))}
                {daysInMonth.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCompleted = habit.completedDays.includes(dayStr);
                  const isToday = dayStr === format(new Date(), 'yyyy-MM-dd');
                  const hasNote = Boolean(habit.notes && habit.notes[dayStr]);
                  // Using hasNote below

                  return (
                    <div 
                      key={dayStr} 
                      className={cn(
                        "h-8 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-all text-center",
                        isCompleted ? "bg-secondary text-white shadow-sm" : "bg-surface-low text-on-surface-variant",
                        isToday && !isCompleted && "ring-1 sm:ring-2 ring-primary ring-inset",
                        !isSameMonth(day, currentDate) && "opacity-30"
                      )}
                    >
                      {format(day, 'd')}
                      {hasNote && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_4px_rgba(var(--primary),0.5)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Combined Matrix View */}
          {displayMode === 'matrix' && (
            <div className="glass-card border border-outline-variant/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 sm:p-6 border-b border-outline-variant/10">
                <h3 className="text-base sm:text-lg font-semibold text-on-surface">Monthly Overview</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant">All habits side-by-side.</p>
              </div>
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-surface-lowest/90 backdrop-blur-md p-3 sm:p-4 font-semibold text-[10px] sm:text-sm text-on-surface-variant border-b border-outline-variant/10 min-w-[120px] sm:min-w-[200px] shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                        Ritual
                      </th>
                      {daysInMonth.map((day) => (
                        <th key={day.toISOString()} className="p-1.5 sm:p-2 text-center border-b border-outline-variant/10">
                          <div className="text-[8px] sm:text-[10px] font-bold uppercase text-on-surface-variant mb-0.5 sm:mb-1">{format(day, 'EEEEE')}</div>
                          <div className={cn(
                            "w-6 h-6 sm:w-8 sm:h-8 mx-auto flex items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold",
                            format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-primary text-white" : "text-on-surface"
                          )}>
                            {format(day, 'd')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit) => (
                      <tr key={habit.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-surface-lowest/90 backdrop-blur-md p-3 sm:p-4 border-b border-outline-variant/5 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                          <span className="font-medium text-xs sm:text-sm text-on-surface">{habit.name}</span>
                        </td>
                        {daysInMonth.map((day) => {
                          const dayStr = format(day, 'yyyy-MM-dd');
                          const isCompleted = habit.completedDays.includes(dayStr);
                          const hasNoteMatrix = Boolean(habit.notes && habit.notes[dayStr]);
                          return (
                            <td
                              key={day.toISOString()}
                              className="p-1.5 sm:p-2 border-b border-outline-variant/5 cursor-pointer hover:bg-surface-low"
                              onClick={() => setSelectedNote({ habitId: habit.id, date: dayStr })}
                            >
                              <div className="flex items-center justify-center w-full h-full relative">
                                <div className={cn(
                                  "w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center transition-all",
                                  isCompleted ? "bg-secondary text-white shadow-sm scale-100" : "bg-transparent scale-50 opacity-0"
                                )}>
                                  {isCompleted && <span className="text-[8px] sm:text-[10px]">✓</span>}
                                </div>
                                {!isCompleted && <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-surface-low/60" />}
                                {hasNoteMatrix && (
                                  <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Yearly Heatmap View - Heatmap part was updated to be scrollable but we can make cells smaller */}
          {displayMode === 'heatmap' && (
            <div className="glass-card border border-outline-variant/10 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-on-surface">Yearly Consistency</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant">Global completion intensity across all {habits.length} rituals.</p>
              </div>
              
              <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-6">
                <div className="flex flex-col gap-[4px] text-[10px] sm:text-xs font-medium text-on-surface-variant pr-1 sm:pr-2 justify-between py-[6px]">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                
                {/* Heatmap Grid */}
                <div 
                  className="grid gap-[3px] sm:gap-[4px] flex-1" 
                  style={{ gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column' }}
                >
                  {/* Empty Padding Cells for alignment */}
                  {Array.from({ length: paddingOffset }).map((_, i) => (
                    <div key={`padding-${i}`} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-transparent rounded-[2px] sm:rounded-[3px]" />
                  ))}
                  
                  {/* Day Cells */}
                  {yearlyDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const completions = habits.filter(h => h.completedDays.includes(dayStr)).length;
                    const hasNoteHeatmap = habits.some(h => h.notes && h.notes[dayStr]);
                    
                    return (
                      <div 
                        key={dayStr}
                        title={`${format(day, 'MMMM do, yyyy')}: ${completions} completions`}
                        className={cn(
                          "relative w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[2px] sm:rounded-[3px] transition-colors hover:ring-2 ring-primary ring-offset-1 cursor-crosshair",
                          getHeatmapColor(completions)
                        )}
                      >
                        {hasNoteHeatmap && (
                          <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-end gap-2 text-[10px] sm:text-xs font-medium text-on-surface-variant mt-2 sm:mt-4">
                <span>Less</span>
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[2px] sm:rounded-[3px] bg-surface-low" />
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[2px] sm:rounded-[3px] bg-secondary/40" />
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[2px] sm:rounded-[3px] bg-secondary/70" />
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[2px] sm:rounded-[3px] bg-secondary" />
                <span>More</span>
              </div>
            </div>
          )}

        </div>
      )}
      {selectedNote && (
        <HabitNoteModal
          habitId={selectedNote.habitId}
          date={selectedNote.date}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
};
