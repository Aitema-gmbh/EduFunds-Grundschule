import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation();

  const isGerman = i18n.language === 'de';

  const toggleLanguage = () => {
    const newLang = isGerman ? 'en' : 'de';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative h-9 px-3 rounded-full flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 group text-xs font-mono uppercase tracking-wide"
      aria-label={t('language.toggle')}
      title={t('language.toggle')}
    >
      <Languages className="w-4 h-4 text-stone-600 dark:text-stone-300" />
      <span className="text-stone-600 dark:text-stone-300 font-medium">
        {isGerman ? 'DE' : 'EN'}
      </span>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-stone-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

export default LanguageToggle;
