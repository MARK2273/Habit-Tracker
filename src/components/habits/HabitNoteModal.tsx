import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { format, parseISO } from 'date-fns';

interface HabitNoteModalProps {
  habitId: string;
  date: string;
  onClose: () => void;
}

export const HabitNoteModal: React.FC<HabitNoteModalProps> = ({ habitId, date, onClose }) => {
  const habit = useHabitStore((state) => state.habits.find((h) => h.id === habitId));
  const setHabitNote = useHabitStore((state) => state.setHabitNote);

  const [note, setNote] = useState('');

  useEffect(() => {
    if (habit?.notes && habit.notes[date]) {
      setNote(habit.notes[date]);
    } else {
      setNote('');
    }
  }, [habit, date]);

  if (!habit) return null;

  const handleSave = () => {
    setHabitNote(habitId, date, note);
    onClose();
  };

  const handleClear = () => {
    setHabitNote(habitId, date, '');
    onClose();
  };

  const formattedDate = format(parseISO(date), 'MMMM do, yyyy');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Notes for {habit.name}</h3>
            <p className="text-sm text-on-surface-variant">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-low rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it go today? Any reflections or obstacles?"
            className="w-full h-32 sm:h-40 p-3 bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t border-outline-variant/10 bg-surface-lowest/50">
          <button
            onClick={handleClear}
            disabled={!habit.notes?.[date]}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-low rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg shadow-primary/20"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
