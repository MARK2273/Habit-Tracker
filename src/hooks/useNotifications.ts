import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useHabitStore } from '../store/useHabitStore';

const NOTIFICATION_SCHEDULE = ['09:00', '17:00', '23:00'];

export const useNotifications = () => {
  const habits = useHabitStore((state) => state.habits);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
      });
    }
  }, []);

  useEffect(() => {
    requestPermission();

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const today = format(now, 'yyyy-MM-dd');

      // Check if we are at one of the scheduled times
      if (NOTIFICATION_SCHEDULE.includes(currentTime)) {
        const incompleteHabits = habits.filter(h => !h.completedDays.includes(today));
        
        if (incompleteHabits.length > 0) {
          const slotKey = `last_notified_slot_${currentTime}_${today}`;
          const lastNotified = localStorage.getItem(slotKey);

          if (!lastNotified) {
            const habitCount = incompleteHabits.length;
            const title = habitCount === 1 ? 'Habit Reminder! ⚡' : 'Yearly ToDo Reminder! 🚀';
            const body = habitCount === 1 
              ? `You still need to: ${incompleteHabits[0].name}`
              : `You have ${habitCount} habits to complete today!`;

            sendNotification(title, body);
            localStorage.setItem(slotKey, 'true');
          }
        }
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, [habits, requestPermission, sendNotification]);
};
