
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SchoolProfileForm } from './components/SchoolProfileForm';
import { ProgramList } from './components/ProgramList';
import { GrantWriter } from './components/GrantWriter';
import { LoginScreen } from './components/LoginScreen';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DarkModeToggle } from './components/DarkModeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { NotificationSettings } from './components/NotificationSettings';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ViewState, SchoolProfile, FundingProgram, MatchResult } from './types';
import { INITIAL_PROFILE, MOCK_FUNDING_PROGRAMS } from './constants';
import { useToast } from './contexts/ToastContext';
import { useKeyboardShortcuts, KeyboardShortcut } from './hooks/useKeyboardShortcuts';
import { Menu, X, Bell, Keyboard } from 'lucide-react';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [profile, setProfile] = useState<SchoolProfile>(INITIAL_PROFILE);
  const [selectedProgram, setSelectedProgram] = useState<FundingProgram | null>(null);
  const [matchedPrograms, setMatchedPrograms] = useState<MatchResult[]>([]);
  const [allPrograms, setAllPrograms] = useState<FundingProgram[]>(MOCK_FUNDING_PROGRAMS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Toggle dark mode function
  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, []);

  // Keyboard shortcuts configuration
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    // Global shortcuts
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'global',
      action: () => setShortcutsModalOpen(true)
    },
    {
      key: '/',
      ctrl: true,
      description: 'Toggle dark mode',
      category: 'global',
      action: toggleDarkMode
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Focus search',
      category: 'actions',
      action: () => {
        // Focus search input if exists
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="suche" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          showToast(t('shortcuts.noSearchField', 'No search field on this page'), 'info');
        }
      }
    },
  ], [t, showToast, toggleDarkMode]);

  // Key sequences for navigation (g then d = go to dashboard)
  const sequences = useMemo(() => [
    {
      keys: ['g', 'd'],
      description: 'Go to Dashboard',
      category: 'navigation' as const,
      action: () => {
        if (view !== ViewState.LANDING && view !== ViewState.LOGIN) {
          setView(ViewState.DASHBOARD);
        }
      }
    },
    {
      keys: ['g', 'p'],
      description: 'Go to Profile',
      category: 'navigation' as const,
      action: () => {
        if (view !== ViewState.LANDING && view !== ViewState.LOGIN) {
          setView(ViewState.PROFILE);
        }
      }
    },
    {
      keys: ['g', 'm'],
      description: 'Go to Matching',
      category: 'navigation' as const,
      action: () => {
        if (view !== ViewState.LANDING && view !== ViewState.LOGIN) {
          setView(ViewState.MATCHING);
        }
      }
    },
    {
      keys: ['g', 'n'],
      description: 'Go to Notifications',
      category: 'navigation' as const,
      action: () => {
        if (view !== ViewState.LANDING && view !== ViewState.LOGIN) {
          setView(ViewState.NOTIFICATIONS);
        }
      }
    },
    {
      keys: ['g', 'h'],
      description: 'Go to Home',
      category: 'navigation' as const,
      action: () => setView(ViewState.LANDING)
    },
  ], [view]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts,
    sequences,
    enabled: !shortcutsModalOpen // Disable while modal is open
  });

  // Load profile from local storage on boot
  useEffect(() => {
      const saved = localStorage.getItem('sf_profile');
      if (saved) {
          try {
              setProfile(JSON.parse(saved));
              // If we have a profile, skip landing logic on refresh for convenience? 
              // Or maybe better to always show landing unless manually navigated.
              // For now, let's keep Profile logic if data exists, but maybe user wants to see landing first.
              // Let's default to LANDING if it's a fresh session, but checking storage for data.
              // Actually, consistent UX: Always Landing first unless deep linking (which we don't have).
              // But for dev convenience:
              // setView(ViewState.PROFILE); 
          } catch (e) {
              console.error("Failed to load profile", e);
          }
      }
  }, []);

  const handleStart = () => {
      const saved = localStorage.getItem('sf_profile');
      if (saved) {
           setView(ViewState.PROFILE);
      } else {
           setView(ViewState.LOGIN);
      }
  };

  const handleLogin = (extractedProfile: SchoolProfile) => {
    setProfile(extractedProfile);
    localStorage.setItem('sf_profile', JSON.stringify(extractedProfile));
    setView(ViewState.PROFILE);
    showToast(t('profile.loadedSuccess'), 'success');
  }

  const handleSaveProfile = (updatedProfile: SchoolProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('sf_profile', JSON.stringify(updatedProfile));
    setView(ViewState.DASHBOARD);
    showToast(t('profile.savedSuccess'), 'success');
  };

  const handleNavigate = (viewName: string) => {
    setView(viewName as ViewState);
  };

  const handleSelectProgram = (program: FundingProgram) => {
    setSelectedProgram(program);
    setView(ViewState.WRITER);
  };

  const handleBackToMatch = () => {
    setView(ViewState.MATCHING);
  };

  const handleBackToProfile = () => {
    setView(ViewState.PROFILE);
  };

  const handleBackToDashboard = () => {
    setView(ViewState.DASHBOARD);
  };

  // View Routing
  if (view === ViewState.LANDING) {
      return <LandingPage onStart={handleStart} />;
  }

  if (view === ViewState.LOGIN) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black bg-noise transition-colors duration-300">
      {/* Minimalist Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-50 content-z transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="font-bold text-lg tracking-tight cursor-pointer flex items-center gap-3"
            onClick={() => setView(ViewState.LANDING)}
          >
            <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-serif font-bold text-xs italic pt-0.5 transition-colors duration-300">Ef</div>
            <span className="font-mono tracking-tight text-sm uppercase dark:text-white transition-colors duration-300">EduFunds.org</span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-sm transition-colors focus-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 dark:text-white" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-mono uppercase tracking-wide">
            <LanguageToggle />
            <DarkModeToggle />
            <button
                onClick={() => setView(ViewState.NOTIFICATIONS)}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 ${view === ViewState.NOTIFICATIONS ? 'ring-2 ring-black dark:ring-white' : ''}`}
                aria-label={t('navigation.notifications')}
            >
                <Bell className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>
            <button
                onClick={() => setShortcutsModalOpen(true)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300"
                aria-label={t('shortcuts.title', 'Keyboard Shortcuts')}
                title={t('shortcuts.pressQuestion', 'Press ? for shortcuts')}
            >
                <Keyboard className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>
            <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-2"></div>
            <button
                onClick={() => setView(ViewState.DASHBOARD)}
                className={`px-4 py-1.5 rounded-full transition-all btn-interactive focus-ring ${view === ViewState.DASHBOARD ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
            >
                {t('navigation.dashboard')}
            </button>
            <div className="w-4 h-px bg-stone-300 dark:bg-stone-700"></div>
            <button
                onClick={() => setView(ViewState.PROFILE)}
                className={`px-4 py-1.5 rounded-full transition-all btn-interactive focus-ring ${view === ViewState.PROFILE ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
            >
                {t('navigation.profile')}
            </button>
            <div className="w-4 h-px bg-stone-300 dark:bg-stone-700"></div>
            <button
                onClick={() => setView(ViewState.MATCHING)}
                className={`px-4 py-1.5 rounded-full transition-all btn-interactive focus-ring ${view === ViewState.MATCHING ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
            >
                {t('navigation.matching')}
            </button>
            <div className="w-4 h-px bg-stone-300 dark:bg-stone-700"></div>
            <button
                disabled={view !== ViewState.WRITER}
                className={`px-4 py-1.5 rounded-full transition-all ${view === ViewState.WRITER ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white disabled:opacity-50'}`}
            >
                {t('navigation.application')}
            </button>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 mobile-menu-animate">
            <div className="px-4 py-4 space-y-2">
              <button
                onClick={() => { setView(ViewState.DASHBOARD); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all text-sm font-mono uppercase tracking-wide focus-ring ${view === ViewState.DASHBOARD ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              >
                {t('navigation.dashboard')}
              </button>
              <button
                onClick={() => { setView(ViewState.PROFILE); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all text-sm font-mono uppercase tracking-wide focus-ring ${view === ViewState.PROFILE ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              >
                {t('navigation.profile')}
              </button>
              <button
                onClick={() => { setView(ViewState.MATCHING); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all text-sm font-mono uppercase tracking-wide focus-ring ${view === ViewState.MATCHING ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              >
                {t('navigation.matching')}
              </button>
              <button
                disabled={view !== ViewState.WRITER}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all text-sm font-mono uppercase tracking-wide ${view === ViewState.WRITER ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-stone-400 dark:text-stone-600'} disabled:opacity-50`}
              >
                {t('navigation.application')}
              </button>
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-mono uppercase text-stone-400">{t('common.design')}</span>
                  <div className="flex items-center gap-2">
                    <LanguageToggle />
                    <DarkModeToggle />
                    <button
                      onClick={() => { setView(ViewState.NOTIFICATIONS); setMobileMenuOpen(false); }}
                      className={`relative w-9 h-9 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 ${view === ViewState.NOTIFICATIONS ? 'ring-2 ring-black dark:ring-white' : ''}`}
                      aria-label={t('navigation.notifications')}
                    >
                      <Bell className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 content-z">
        <div className="max-w-6xl mx-auto">
          {view === ViewState.DASHBOARD && (
            <Dashboard
              profile={profile}
              programs={allPrograms}
              matchedPrograms={matchedPrograms}
              onSelectProgram={handleSelectProgram}
              onNavigate={handleNavigate}
            />
          )}

          {view === ViewState.PROFILE && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-16 border-b border-stone-200 pb-8">
                  <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6 leading-[0.9]">
                    {t('profile.title')} &<br/>
                    <span className="text-stone-400">{t('profile.subtitle')}</span>
                  </h2>
                  <p className="text-lg text-stone-600 font-light max-w-2xl font-serif italic">
                    {t('profile.description')}
                  </p>
              </div>
              <SchoolProfileForm profile={profile} onSave={handleSaveProfile} />
            </div>
          )}

          {view === ViewState.MATCHING && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ProgramList 
                profile={profile} 
                onSelectProgram={handleSelectProgram}
                onBack={handleBackToProfile}
                onMatchesUpdate={(programs, matches) => {
                  setAllPrograms(programs);
                  setMatchedPrograms(matches);
                }}
              />
            </div>
          )}

          {view === ViewState.WRITER && selectedProgram && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <GrantWriter
                profile={profile}
                program={selectedProgram}
                onBack={handleBackToMatch}
              />
            </div>
          )}

          {view === ViewState.NOTIFICATIONS && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <NotificationSettings
                programs={allPrograms}
                onBack={handleBackToDashboard}
              />
            </div>
          )}
        </div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
};

export default App;
