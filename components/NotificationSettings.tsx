import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Mail, Calendar, Trash2, Check, ArrowLeft } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationPreferences, ScheduledReminder, FundingProgram } from '../types';
import { useToast } from '../contexts/ToastContext';

interface NotificationSettingsProps {
  programs: FundingProgram[];
  onBack: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ programs, onBack }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [upcomingReminders, setUpcomingReminders] = useState<ScheduledReminder[]>([]);
  const [emailError, setEmailError] = useState<string>('');

  useEffect(() => {
    setUpcomingReminders(notificationService.getUpcomingReminders());
  }, [preferences]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (email: string) => {
    setPreferences(prev => ({ ...prev, email }));
    if (email && !validateEmail(email)) {
      setEmailError(t('notifications.invalidEmail'));
    } else {
      setEmailError('');
    }
  };

  const handleToggleEnabled = () => {
    if (!preferences.enabled && !preferences.email) {
      setEmailError(t('notifications.emailRequired'));
      return;
    }
    if (!preferences.enabled && !validateEmail(preferences.email)) {
      setEmailError(t('notifications.invalidEmail'));
      return;
    }
    const updated = { ...preferences, enabled: !preferences.enabled };
    setPreferences(updated);
    notificationService.savePreferences(updated);
    showToast(
      updated.enabled ? t('notifications.enabled') : t('notifications.disabled'),
      'success'
    );
  };

  const handleToggleSevenDays = () => {
    const updated = {
      ...preferences,
      reminders: { ...preferences.reminders, sevenDays: !preferences.reminders.sevenDays },
    };
    setPreferences(updated);
    notificationService.savePreferences(updated);
  };

  const handleToggleOneDay = () => {
    const updated = {
      ...preferences,
      reminders: { ...preferences.reminders, oneDay: !preferences.reminders.oneDay },
    };
    setPreferences(updated);
    notificationService.savePreferences(updated);
  };

  const handleSaveEmail = () => {
    if (!validateEmail(preferences.email)) {
      setEmailError(t('notifications.invalidEmail'));
      return;
    }
    notificationService.savePreferences(preferences);
    showToast(t('notifications.emailSaved'), 'success');
  };

  const handleUnsubscribe = (programId: string) => {
    notificationService.unsubscribeFromProgram(programId);
    setPreferences(notificationService.getPreferences());
    setUpcomingReminders(notificationService.getUpcomingReminders());
    showToast(t('notifications.unsubscribed'), 'success');
  };

  const getProgramById = (id: string): FundingProgram | undefined => {
    return programs.find(p => p.id === id);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-white mb-6 transition-colors focus-ring rounded-sm px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6 leading-[0.9] dark:text-white">
          {t('notifications.title')} &<br />
          <span className="text-stone-400">{t('notifications.subtitle')}</span>
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-400 font-light max-w-2xl font-serif italic">
          {t('notifications.description')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Email Settings Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Mail className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white">
              {t('notifications.emailSettings')}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t('notifications.emailLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={preferences.email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder={t('notifications.emailPlaceholder')}
                  className={`flex-1 px-4 py-2 border ${
                    emailError ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'
                  } bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all`}
                />
                <button
                  onClick={handleSaveEmail}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={handleToggleEnabled}
                className={`w-full flex items-center justify-between p-4 border transition-all ${
                  preferences.enabled
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {preferences.enabled ? (
                    <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-stone-400" />
                  )}
                  <span className="font-medium dark:text-white">
                    {preferences.enabled
                      ? t('notifications.notificationsOn')
                      : t('notifications.notificationsOff')}
                  </span>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.enabled ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-600'
                  } relative`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Settings Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white">
              {t('notifications.reminderSettings')}
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-all cursor-pointer">
              <span className="dark:text-white">{t('notifications.sevenDayReminder')}</span>
              <input
                type="checkbox"
                checked={preferences.reminders.sevenDays}
                onChange={handleToggleSevenDays}
                className="w-5 h-5 accent-black dark:accent-white"
              />
            </label>
            <label className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-all cursor-pointer">
              <span className="dark:text-white">{t('notifications.oneDayReminder')}</span>
              <input
                type="checkbox"
                checked={preferences.reminders.oneDay}
                onChange={handleToggleOneDay}
                className="w-5 h-5 accent-black dark:accent-white"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Subscribed Programs */}
      {preferences.subscribedPrograms.length > 0 && (
        <div className="mt-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">
            {t('notifications.subscribedPrograms')}
          </h3>
          <div className="space-y-3">
            {preferences.subscribedPrograms.map(programId => {
              const program = getProgramById(programId);
              if (!program) return null;
              return (
                <div
                  key={programId}
                  className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700"
                >
                  <div>
                    <p className="font-medium dark:text-white">{program.title}</p>
                    <p className="text-sm text-stone-500">
                      {t('notifications.deadline')}: {formatDate(program.deadline)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(programId)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    aria-label={t('notifications.unsubscribe')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="mt-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">
            {t('notifications.upcomingReminders')}
          </h3>
          <div className="space-y-3">
            {upcomingReminders.map((reminder, idx) => (
              <div
                key={`${reminder.programId}-${reminder.reminderType}-${idx}`}
                className="flex items-center gap-3 p-4 border border-stone-200 dark:border-stone-700"
              >
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium dark:text-white">{reminder.programTitle}</p>
                  <p className="text-sm text-stone-500">
                    {reminder.reminderType === 'seven_days'
                      ? t('notifications.sevenDaysBefore')
                      : t('notifications.oneDayBefore')}{' '}
                    • {formatDate(reminder.scheduledDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
