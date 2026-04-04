import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';

interface HabitFormProps {
  onClose: () => void;
  editHabitId?: string;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onClose, editHabitId }) => {
  const [name, setName] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const habits = useHabitStore((state) => state.habits);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);

  useEffect(() => {
    if (editHabitId) {
      const habit = habits.find(h => h.id === editHabitId);
      if (habit) {
        setName(habit.name);
      }
    }
  }, [editHabitId, habits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editHabitId) {
      updateHabit(editHabitId, { name });
    } else {
      addHabit({ name, color: 'primary', icon: 'zap' });
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    
    if (editHabitId) {
      removeHabit(editHabitId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm transition-all duration-300">
      <div className="glass-card w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-low rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-on-surface mb-6">
          {editHabitId ? 'Edit Habit' : 'Create New Habit'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant mb-2">
              Habit Name
            </label>
            <input
              autoFocus
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read for 30 minutes"
              className="w-full px-4 py-3 bg-surface-low border border-outline-variant/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-lowest transition-all text-on-surface"
            />
          </div>

          <div className="flex gap-4">
            {editHabitId && (
              <button
                type="button"
                onClick={handleDelete}
                className={`w-1/3 py-4 font-semibold rounded-xl transition-all border ${
                  isConfirmingDelete 
                    ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20' 
                    : 'bg-error-container/10 text-error-container hover:bg-error-container/20 border-error-container/20'
                }`}
              >
                {isConfirmingDelete ? 'Sure?' : 'Delete'}
              </button>
            )}
            <button
              type="submit"
              className={`py-4 btn-gradient text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all ${editHabitId ? 'w-2/3' : 'w-full'}`}
            >
              {editHabitId ? 'Save Changes' : 'Start Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
