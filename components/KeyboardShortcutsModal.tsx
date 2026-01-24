import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Keyboard } from 'lucide-react';

interface ShortcutItem {
  keys: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: ShortcutCategory[] = [
    {
      title: t('shortcuts.navigation', 'Navigation'),
      shortcuts: [
        { keys: 'g → d', description: t('shortcuts.goToDashboard', 'Go to Dashboard') },
        { keys: 'g → p', description: t('shortcuts.goToProfile', 'Go to Profile') },
        { keys: 'g → m', description: t('shortcuts.goToMatching', 'Go to Matching') },
        { keys: 'g → n', description: t('shortcuts.goToNotifications', 'Go to Notifications') },
        { keys: 'g → h', description: t('shortcuts.goToHome', 'Go to Home') },
      ]
    },
    {
      title: t('shortcuts.actions', 'Actions'),
      shortcuts: [
        { keys: 'Ctrl+S', description: t('shortcuts.saveProfile', 'Save current form') },
        { keys: 'Ctrl+K', description: t('shortcuts.search', 'Focus search') },
        { keys: 'Escape', description: t('shortcuts.closeOrBlur', 'Close modal / Blur input') },
      ]
    },
    {
      title: t('shortcuts.global', 'Global'),
      shortcuts: [
        { keys: '?', description: t('shortcuts.showHelp', 'Show this help') },
        { keys: 'Ctrl+/', description: t('shortcuts.toggleDarkMode', 'Toggle dark mode') },
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </div>
            <h2 id="shortcuts-title" className="text-lg font-semibold text-stone-900 dark:text-white">
              {t('shortcuts.title', 'Keyboard Shortcuts')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {categories.map((category, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-6' : ''}>
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  >
                    <span className="text-sm text-stone-700 dark:text-stone-300">
                      {shortcut.description}
                    </span>
                    <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-xs font-mono text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
            {t('shortcuts.hint', 'Press ? anywhere to show this help')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
