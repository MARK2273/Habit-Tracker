import React from 'react';
import { Home, Calendar, Settings, Plus, BarChart2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHabitStore, type ViewType } from '../../store/useHabitStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex items-center gap-3 px-4 py-3 w-full transition-all group",
      active ? "text-primary font-medium" : "text-on-surface-variant hover:text-on-surface"
    )}
  >
    {active && (
      <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
    )}
    <Icon size={20} className={cn("transition-colors", active ? "text-primary" : "group-hover:text-on-surface")} />
    <span className="text-sm">{label}</span>
  </button>
);

export const AppLayout: React.FC<{ children: React.ReactNode, onNewHabit: () => void }> = ({ children, onNewHabit }) => {
  const currentView = useHabitStore((state) => state.currentView);
  const setView = useHabitStore((state) => state.setView);

  const navigate = (view: ViewType) => setView(view);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-outline-variant/10 flex flex-col z-20">
        <div className="p-8">
          <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-sm">
              <Calendar size={18} className="text-white" />
            </div>
            Sanctuary
          </h1>
        </div>

        <nav className="flex-1 mt-4 space-y-1">
          <SidebarItem icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => navigate('dashboard')} />
          <SidebarItem icon={Calendar} label="Calendar" active={currentView === 'calendar'} onClick={() => navigate('calendar')} />
          <SidebarItem icon={BarChart2} label="Statistics" active={currentView === 'statistics'} onClick={() => navigate('statistics')} />
          <SidebarItem icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => navigate('settings')} />
        </nav>

        <div className="p-4 border-t border-outline-variant/10">
          <button onClick={onNewHabit} className="flex items-center gap-3 px-4 py-3 w-full glass-card hover:bg-surface-low/50 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-surface-lowest transition-colors">
              <Plus size={18} className="text-on-surface-variant" />
            </div>
            <span className="text-sm font-medium text-on-surface-variant">New Habit</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
