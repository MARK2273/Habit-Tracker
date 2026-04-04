import React, { useState } from 'react';
import { useHabitStore } from '../../store/useHabitStore';
import { supabase } from '../../lib/supabase';
import { Trash2, Shield, Sun, LogOut } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const clearHabits = useHabitStore((state) => state.clearHabits);
  const theme = useHabitStore((state) => state.theme);
  const setTheme = useHabitStore((state) => state.setTheme);
  
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleClearData = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }
    clearHabits();
    setIsConfirmingClear(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-on-surface tracking-tight mb-2">Settings</h2>
        <p className="text-on-surface-variant text-lg">Manage your digital sanctuary.</p>
      </header>

      <div className="space-y-8">
        {/* Appearance */}
        <section className="glass-card border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-low/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sun size={18} />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">Appearance</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-on-surface">Theme</p>
              <p className="text-sm text-on-surface-variant">Switch between Light and Dark mode.</p>
            </div>
            <div className="flex bg-surface-low p-1 rounded-lg">
              <button 
                onClick={() => setTheme('light')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${theme === 'dark' ? 'bg-black shadow-sm text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Dark
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="glass-card border border-outline-variant/10 border-red-500/10 overflow-hidden">
          <div className="p-6 border-b border-red-500/10 bg-red-500/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <Shield size={18} />
            </div>
            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-on-surface">Erase progress history</p>
              <p className="text-sm text-on-surface-variant">Reset completion records for all habits. The habits themselves will remain.</p>
            </div>
            <button 
              onClick={handleClearData}
              className={`flex items-center justify-center gap-2 px-4 py-2 hover:bg-red-500/20 rounded-lg transition-colors border font-medium whitespace-nowrap ${
                isConfirmingClear 
                  ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20' 
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}
            >
              <Trash2 size={16} />
              {isConfirmingClear ? 'Are you sure?' : 'Reset Sanctuary'}
            </button>
          </div>
        </section>

        {/* Account Management */}
        <section className="glass-card border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-low/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-outline-variant/10 flex items-center justify-center text-on-surface-variant">
                <LogOut size={18} />
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Account</h3>
            </div>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-on-surface">Sign Out</p>
              <p className="text-sm text-on-surface-variant">Log out of your sanctuary on this device.</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-low hover:bg-surface-lowest text-on-surface rounded-lg transition-all border border-outline-variant/20 font-medium whitespace-nowrap shadow-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
