import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationService } from './notificationService';
import { FundingProgram, ScheduledReminder } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Sample funding program for tests
const sampleProgram: FundingProgram = {
  id: 'prog-1',
  title: 'Test Funding Program',
  provider: 'Test Provider',
  budget: '10.000€',
  deadline: '2025-12-31',
  focus: 'Digitalisierung',
  description: 'A test program',
  requirements: 'None',
  region: ['DE'],
  targetGroup: 'Grundschulen',
  fundingQuota: '80%',
  detailedCriteria: [],
  submissionMethod: 'Online',
  requiredDocuments: [],
  fundingPeriod: '12 Monate',
};

describe('notificationService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ============================================
  // getPreferences Tests
  // ============================================
  describe('getPreferences', () => {
    it('should return default preferences when localStorage is empty', () => {
      const prefs = notificationService.getPreferences();
      expect(prefs).toEqual({
        email: '',
        enabled: false,
        reminders: {
          sevenDays: true,
          oneDay: true,
        },
        subscribedPrograms: [],
      });
    });

    it('should return saved preferences from localStorage', () => {
      const savedPrefs = {
        email: 'test@example.com',
        enabled: true,
        reminders: { sevenDays: true, oneDay: false },
        subscribedPrograms: ['prog-1'],
      };
      localStorageMock.setItem('edufunds_notification_preferences', JSON.stringify(savedPrefs));

      const prefs = notificationService.getPreferences();
      expect(prefs).toEqual(savedPrefs);
    });

    it('should return default preferences for invalid JSON', () => {
      localStorageMock.setItem('edufunds_notification_preferences', 'invalid-json');

      const prefs = notificationService.getPreferences();
      expect(prefs.email).toBe('');
      expect(prefs.enabled).toBe(false);
    });
  });

  // ============================================
  // savePreferences Tests
  // ============================================
  describe('savePreferences', () => {
    it('should save preferences to localStorage', () => {
      const prefs = {
        email: 'school@example.de',
        enabled: true,
        reminders: { sevenDays: true, oneDay: true },
        subscribedPrograms: ['prog-1', 'prog-2'],
      };

      notificationService.savePreferences(prefs);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'edufunds_notification_preferences',
        JSON.stringify(prefs)
      );
    });
  });

  // ============================================
  // getScheduledReminders Tests
  // ============================================
  describe('getScheduledReminders', () => {
    it('should return empty array when localStorage is empty', () => {
      const reminders = notificationService.getScheduledReminders();
      expect(reminders).toEqual([]);
    });

    it('should return saved reminders from localStorage', () => {
      const savedReminders: ScheduledReminder[] = [
        {
          programId: 'prog-1',
          programTitle: 'Test Program',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: '2025-12-24T00:00:00.000Z',
          sent: false,
        },
      ];
      localStorageMock.setItem('edufunds_scheduled_reminders', JSON.stringify(savedReminders));

      const reminders = notificationService.getScheduledReminders();
      expect(reminders).toEqual(savedReminders);
    });

    it('should return empty array for invalid JSON', () => {
      localStorageMock.setItem('edufunds_scheduled_reminders', 'not-valid-json');

      const reminders = notificationService.getScheduledReminders();
      expect(reminders).toEqual([]);
    });
  });

  // ============================================
  // saveScheduledReminders Tests
  // ============================================
  describe('saveScheduledReminders', () => {
    it('should save reminders to localStorage', () => {
      const reminders: ScheduledReminder[] = [
        {
          programId: 'prog-1',
          programTitle: 'Test Program',
          deadline: '2025-12-31',
          reminderType: 'one_day',
          scheduledDate: '2025-12-30T00:00:00.000Z',
          sent: false,
        },
      ];

      notificationService.saveScheduledReminders(reminders);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'edufunds_scheduled_reminders',
        JSON.stringify(reminders)
      );
    });
  });

  // ============================================
  // calculateReminderDates Tests
  // ============================================
  describe('calculateReminderDates', () => {
    it('should calculate 7 days and 1 day before deadline', () => {
      const { sevenDays, oneDay } = notificationService.calculateReminderDates('2025-12-31');

      expect(sevenDays.getDate()).toBe(24);
      expect(sevenDays.getMonth()).toBe(11); // December (0-indexed)
      expect(sevenDays.getFullYear()).toBe(2025);

      expect(oneDay.getDate()).toBe(30);
      expect(oneDay.getMonth()).toBe(11);
      expect(oneDay.getFullYear()).toBe(2025);
    });

    it('should handle month boundary correctly', () => {
      const { sevenDays, oneDay } = notificationService.calculateReminderDates('2025-01-05');

      // 7 days before Jan 5 = Dec 29
      expect(sevenDays.getFullYear()).toBe(2024);
      expect(sevenDays.getMonth()).toBe(11); // December
      expect(sevenDays.getDate()).toBe(29);

      // 1 day before Jan 5 = Jan 4
      expect(oneDay.getDate()).toBe(4);
      expect(oneDay.getMonth()).toBe(0); // January
    });

    it('should handle year boundary correctly', () => {
      const { sevenDays } = notificationService.calculateReminderDates('2026-01-03');

      // 7 days before Jan 3, 2026 = Dec 27, 2025
      expect(sevenDays.getFullYear()).toBe(2025);
      expect(sevenDays.getMonth()).toBe(11);
      expect(sevenDays.getDate()).toBe(27);
    });
  });

  // ============================================
  // formatReminderMessage Tests
  // ============================================
  describe('formatReminderMessage', () => {
    it('should format seven_days reminder correctly', () => {
      const reminder: ScheduledReminder = {
        programId: 'prog-1',
        programTitle: 'DigitalPakt Schule',
        deadline: '2025-12-31',
        reminderType: 'seven_days',
        scheduledDate: '2025-12-24T00:00:00.000Z',
        sent: false,
      };

      const message = notificationService.formatReminderMessage(reminder);

      expect(message).toContain('Erinnerung');
      expect(message).toContain('DigitalPakt Schule');
      expect(message).toContain('7 Tage');
    });

    it('should format one_day reminder correctly', () => {
      const reminder: ScheduledReminder = {
        programId: 'prog-1',
        programTitle: 'Test Program',
        deadline: '2025-06-15',
        reminderType: 'one_day',
        scheduledDate: '2025-06-14T00:00:00.000Z',
        sent: false,
      };

      const message = notificationService.formatReminderMessage(reminder);

      expect(message).toContain('1 Tag');
      expect(message).toContain('Test Program');
    });

    it('should include formatted date in German locale', () => {
      const reminder: ScheduledReminder = {
        programId: 'prog-1',
        programTitle: 'Test',
        deadline: '2025-12-31',
        reminderType: 'seven_days',
        scheduledDate: '2025-12-24T00:00:00.000Z',
        sent: false,
      };

      const message = notificationService.formatReminderMessage(reminder);

      // Should contain German date format (31.12.2025)
      expect(message).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
    });
  });

  // ============================================
  // subscribeToProgram Tests
  // ============================================
  describe('subscribeToProgram', () => {
    it('should add program to subscribed list', () => {
      notificationService.subscribeToProgram(sampleProgram);

      const prefs = notificationService.getPreferences();
      expect(prefs.subscribedPrograms).toContain('prog-1');
    });

    it('should not duplicate subscription', () => {
      // Subscribe twice
      notificationService.subscribeToProgram(sampleProgram);
      notificationService.subscribeToProgram(sampleProgram);

      const prefs = notificationService.getPreferences();
      const count = prefs.subscribedPrograms.filter(id => id === 'prog-1').length;
      expect(count).toBe(1);
    });
  });

  // ============================================
  // unsubscribeFromProgram Tests
  // ============================================
  describe('unsubscribeFromProgram', () => {
    it('should remove program from subscribed list', () => {
      // First subscribe
      notificationService.subscribeToProgram(sampleProgram);
      expect(notificationService.getPreferences().subscribedPrograms).toContain('prog-1');

      // Then unsubscribe
      notificationService.unsubscribeFromProgram('prog-1');
      expect(notificationService.getPreferences().subscribedPrograms).not.toContain('prog-1');
    });

    it('should remove associated reminders', () => {
      const reminders: ScheduledReminder[] = [
        {
          programId: 'prog-1',
          programTitle: 'Test',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: '2025-12-24T00:00:00.000Z',
          sent: false,
        },
        {
          programId: 'prog-2',
          programTitle: 'Other Program',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: '2025-12-24T00:00:00.000Z',
          sent: false,
        },
      ];
      notificationService.saveScheduledReminders(reminders);

      notificationService.unsubscribeFromProgram('prog-1');

      const remaining = notificationService.getScheduledReminders();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].programId).toBe('prog-2');
    });
  });

  // ============================================
  // getUpcomingReminders Tests
  // ============================================
  describe('getUpcomingReminders', () => {
    it('should return only unsent future reminders', () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + 10);
      const pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - 1);

      const reminders: ScheduledReminder[] = [
        {
          programId: 'prog-1',
          programTitle: 'Future Reminder',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: futureDate.toISOString(),
          sent: false,
        },
        {
          programId: 'prog-2',
          programTitle: 'Past Reminder',
          deadline: '2025-06-01',
          reminderType: 'seven_days',
          scheduledDate: pastDate.toISOString(),
          sent: false,
        },
        {
          programId: 'prog-3',
          programTitle: 'Sent Reminder',
          deadline: '2025-12-31',
          reminderType: 'one_day',
          scheduledDate: futureDate.toISOString(),
          sent: true,
        },
      ];
      notificationService.saveScheduledReminders(reminders);

      const upcoming = notificationService.getUpcomingReminders();

      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].programId).toBe('prog-1');
    });

    it('should sort by scheduled date ascending', () => {
      const now = new Date();
      const nearFuture = new Date(now);
      nearFuture.setDate(nearFuture.getDate() + 5);
      const farFuture = new Date(now);
      farFuture.setDate(farFuture.getDate() + 20);

      const reminders: ScheduledReminder[] = [
        {
          programId: 'prog-far',
          programTitle: 'Far Future',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: farFuture.toISOString(),
          sent: false,
        },
        {
          programId: 'prog-near',
          programTitle: 'Near Future',
          deadline: '2025-12-15',
          reminderType: 'seven_days',
          scheduledDate: nearFuture.toISOString(),
          sent: false,
        },
      ];
      notificationService.saveScheduledReminders(reminders);

      const upcoming = notificationService.getUpcomingReminders();

      expect(upcoming[0].programId).toBe('prog-near');
      expect(upcoming[1].programId).toBe('prog-far');
    });

    it('should return empty array when no reminders exist', () => {
      const upcoming = notificationService.getUpcomingReminders();
      expect(upcoming).toEqual([]);
    });
  });

  // ============================================
  // checkDueReminders Tests
  // ============================================
  describe('checkDueReminders', () => {
    it('should return empty array when notifications are disabled', () => {
      const prefs = {
        email: '',
        enabled: false,
        reminders: { sevenDays: true, oneDay: true },
        subscribedPrograms: [],
      };
      notificationService.savePreferences(prefs);

      const due = notificationService.checkDueReminders();
      expect(due).toEqual([]);
    });

    it('should return empty array when no email is set', () => {
      const prefs = {
        email: '',
        enabled: true,
        reminders: { sevenDays: true, oneDay: true },
        subscribedPrograms: [],
      };
      notificationService.savePreferences(prefs);

      const due = notificationService.checkDueReminders();
      expect(due).toEqual([]);
    });

    it('should return due reminders and mark them as sent', () => {
      const prefs = {
        email: 'test@example.com',
        enabled: true,
        reminders: { sevenDays: true, oneDay: true },
        subscribedPrograms: ['prog-1'],
      };
      notificationService.savePreferences(prefs);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const reminders: ScheduledReminder[] = [
        {
          programId: 'prog-1',
          programTitle: 'Due Reminder',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: pastDate.toISOString(),
          sent: false,
        },
      ];
      notificationService.saveScheduledReminders(reminders);

      const due = notificationService.checkDueReminders();

      expect(due).toHaveLength(1);
      expect(due[0].programId).toBe('prog-1');

      // Check that it's now marked as sent
      const updated = notificationService.getScheduledReminders();
      expect(updated[0].sent).toBe(true);
    });
  });

  // ============================================
  // clearAll Tests
  // ============================================
  describe('clearAll', () => {
    it('should remove all notification data from localStorage', () => {
      // Set some data first
      notificationService.savePreferences({
        email: 'test@example.com',
        enabled: true,
        reminders: { sevenDays: true, oneDay: true },
        subscribedPrograms: ['prog-1'],
      });
      notificationService.saveScheduledReminders([
        {
          programId: 'prog-1',
          programTitle: 'Test',
          deadline: '2025-12-31',
          reminderType: 'seven_days',
          scheduledDate: '2025-12-24T00:00:00.000Z',
          sent: false,
        },
      ]);

      notificationService.clearAll();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('edufunds_notification_preferences');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('edufunds_scheduled_reminders');
    });
  });
});
