import React, { useState, useRef, useEffect } from 'react';
import { Check, Flame, MoreHorizontal, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHabitStore } from '../../store/useHabitStore';
import { ProgressRing } from './ProgressRing';
import { format } from 'date-fns';
import { HabitForm } from './HabitForm';
import { HabitNoteModal } from './HabitNoteModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HabitCardProps {
  habitId: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habitId }) => {
  const habit = useHabitStore((state) => state.habits.find((h) => h.id === habitId));
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const streak = useHabitStore((state) => state.getHabitStreak(habitId));

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsConfirmingDelete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!habit) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDays.includes(todayStr);
  const hasNoteToday = Boolean(habit.notes && habit.notes[todayStr]);

  const handleDelete = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    removeHabit(habit.id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="group glass-card border border-outline-variant/10 p-4 sm:p-6 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-surface-lowest/90 relative">
        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
          {/* Progress Ring / Toggle Button */}
          <button
            onClick={() => toggleHabit(habit.id, todayStr)}
            className="relative flex items-center justify-center shrink-0"
          >
            <ProgressRing 
              progress={isCompletedToday ? 1 : 0} 
              size={48} 
              strokeWidth={3.5} 
            />
            <div className={cn(
              "absolute inset-0 m-1.5 rounded-full flex items-center justify-center transition-all duration-300",
              isCompletedToday 
                ? "bg-secondary text-white scale-100 shadow-lg shadow-secondary/20" 
                : "bg-surface-low text-on-surface-variant group-hover:bg-surface-lowest scale-90"
            )}>
              <Check size={16} className={cn("transition-transform", isCompletedToday ? "scale-100" : "scale-0")} />
            </div>
          </button>

          <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-on-surface leading-tight truncate">{habit.name}</h3>
            <p className="text-[10px] sm:text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5 sm:mt-1">
              <Flame size={12} className={cn("sm:w-3.5 sm:h-3.5 transition-colors", streak > 0 ? "text-orange-500 fill-orange-500" : "text-on-surface-variant")} />
              <span className={cn(streak > 0 ? "text-on-surface font-medium" : "")}>
                {streak} day streak
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className={cn(
              "p-2 rounded-full transition-colors",
              hasNoteToday
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
            )}
            title="Add/View Note for Today"
          >
            <MessageSquare size={18} className={hasNoteToday ? "fill-primary/20" : ""} />
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-low rounded-full transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-12 right-0 w-40 glass rounded-lg border border-outline-variant/10 shadow-lg py-1 z-10 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-surface-low text-on-surface"
              >
                <Edit2 size={16} className="text-primary" /> Edit
              </button>
              <button 
                onClick={handleDelete}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  isConfirmingDelete 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'hover:bg-red-50/10 text-red-600'
                }`}
              >
                <Trash2 size={16} /> {isConfirmingDelete ? 'Sure?' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <HabitForm editHabitId={habit.id} onClose={() => setIsEditing(false)} />
      )}
      {isNoteModalOpen && (
        <HabitNoteModal habitId={habit.id} date={todayStr} onClose={() => setIsNoteModalOpen(false)} />
      )}
    </>
  );
};
