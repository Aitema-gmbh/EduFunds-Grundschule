import { FundingProgram, NotificationPreferences, ScheduledReminder } from '../types';

const STORAGE_KEY = 'edufunds_notification_preferences';
const REMINDERS_KEY = 'edufunds_scheduled_reminders';

export const notificationService = {
  /**
   * Get notification preferences from localStorage
   */
  getPreferences(): NotificationPreferences {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notification preferences', e);
      }
    }
    return {
      email: '',
      enabled: false,
      reminders: {
        sevenDays: true,
        oneDay: true,
      },
      subscribedPrograms: [],
    };
  },

  /**
   * Save notification preferences to localStorage
   */
  savePreferences(preferences: NotificationPreferences): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  },

  /**
   * Get scheduled reminders from localStorage
   */
  getScheduledReminders(): ScheduledReminder[] {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse scheduled reminders', e);
      }
    }
    return [];
  },

  /**
   * Save scheduled reminders to localStorage
   */
  saveScheduledReminders(reminders: ScheduledReminder[]): void {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  },

  /**
   * Calculate reminder dates for a program deadline
   */
  calculateReminderDates(deadline: string): { sevenDays: Date; oneDay: Date } {
    const deadlineDate = new Date(deadline);
    const sevenDays = new Date(deadlineDate);
    sevenDays.setDate(sevenDays.getDate() - 7);
    const oneDay = new Date(deadlineDate);
    oneDay.setDate(oneDay.getDate() - 1);
    return { sevenDays, oneDay };
  },

  /**
   * Schedule reminders for a funding program
   */
  scheduleReminders(program: FundingProgram): ScheduledReminder[] {
    const preferences = this.getPreferences();
    const existingReminders = this.getScheduledReminders();
    const newReminders: ScheduledReminder[] = [];
    const { sevenDays, oneDay } = this.calculateReminderDates(program.deadline);
    const now = new Date();

    if (preferences.reminders.sevenDays && sevenDays > now) {
      const existing = existingReminders.find(
        r => r.programId === program.id && r.reminderType === 'seven_days'
      );
      if (!existing) {
        newReminders.push({
          programId: program.id,
          programTitle: program.title,
          deadline: program.deadline,
          reminderType: 'seven_days',
          scheduledDate: sevenDays.toISOString(),
          sent: false,
        });
      }
    }

    if (preferences.reminders.oneDay && oneDay > now) {
      const existing = existingReminders.find(
        r => r.programId === program.id && r.reminderType === 'one_day'
      );
      if (!existing) {
        newReminders.push({
          programId: program.id,
          programTitle: program.title,
          deadline: program.deadline,
          reminderType: 'one_day',
          scheduledDate: oneDay.toISOString(),
          sent: false,
        });
      }
    }

    if (newReminders.length > 0) {
      this.saveScheduledReminders([...existingReminders, ...newReminders]);
    }

    return newReminders;
  },

  /**
   * Subscribe to a program's deadline reminders
   */
  subscribeToProgram(program: FundingProgram): void {
    const preferences = this.getPreferences();
    if (!preferences.subscribedPrograms.includes(program.id)) {
      preferences.subscribedPrograms.push(program.id);
      this.savePreferences(preferences);
      this.scheduleReminders(program);
    }
  },

  /**
   * Unsubscribe from a program's deadline reminders
   */
  unsubscribeFromProgram(programId: string): void {
    const preferences = this.getPreferences();
    preferences.subscribedPrograms = preferences.subscribedPrograms.filter(
      id => id !== programId
    );
    this.savePreferences(preferences);

    // Remove scheduled reminders for this program
    const reminders = this.getScheduledReminders();
    const filtered = reminders.filter(r => r.programId !== programId);
    this.saveScheduledReminders(filtered);
  },

  /**
   * Check for due reminders and return them
   * In a real implementation, this would trigger email sending via a backend service
   */
  checkDueReminders(): ScheduledReminder[] {
    const preferences = this.getPreferences();
    if (!preferences.enabled || !preferences.email) {
      return [];
    }

    const reminders = this.getScheduledReminders();
    const now = new Date();
    const dueReminders = reminders.filter(
      r => !r.sent && new Date(r.scheduledDate) <= now
    );

    // Mark reminders as sent
    if (dueReminders.length > 0) {
      const updatedReminders = reminders.map(r => {
        if (dueReminders.find(dr => dr.programId === r.programId && dr.reminderType === r.reminderType)) {
          return { ...r, sent: true };
        }
        return r;
      });
      this.saveScheduledReminders(updatedReminders);
    }

    return dueReminders;
  },

  /**
   * Format reminder message for display or email
   */
  formatReminderMessage(reminder: ScheduledReminder): string {
    const daysText = reminder.reminderType === 'seven_days' ? '7 Tage' : '1 Tag';
    return `Erinnerung: Die Frist für "${reminder.programTitle}" endet in ${daysText} (${new Date(reminder.deadline).toLocaleDateString('de-DE')}).`;
  },

  /**
   * Get upcoming reminders for display
   */
  getUpcomingReminders(): ScheduledReminder[] {
    const reminders = this.getScheduledReminders();
    const now = new Date();
    return reminders
      .filter(r => !r.sent && new Date(r.scheduledDate) > now)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },

  /**
   * Clear all notification data
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMINDERS_KEY);
  },
};
