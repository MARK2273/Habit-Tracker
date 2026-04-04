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

  const navItems = [
    { id: 'dashboard' as const, icon: Home, label: 'Home' },
    { id: 'calendar' as const, icon: Calendar, label: 'History' },
    { id: 'statistics' as const, icon: BarChart2, label: 'Stats' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-inter flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 glass border-r border-outline-variant/10 flex-col z-20">
        <div className="p-8">
          <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-sm">
              <Calendar size={18} className="text-white" />
            </div>
            Sanctuary
          </h1>
        </div>

        <nav className="flex-1 mt-4 space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={currentView === item.id} 
              onClick={() => navigate(item.id)} 
            />
          ))}
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
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-32 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-outline-variant/10 px-6 py-3 flex items-center justify-between z-30 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                active ? "text-primary scale-110" : "text-on-surface-variant"
              )}
            >
              <Icon size={22} className={cn(active ? "fill-primary/10" : "")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Action Button - Mobile Only */}
      <button 
        onClick={onNewHabit}
        className="md:hidden fixed right-6 bottom-24 w-14 h-14 rounded-2xl btn-gradient shadow-xl text-white flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
