
import React, { useState, useEffect } from 'react';
import { SchoolProfileForm } from './components/SchoolProfileForm';
import { ProgramList } from './components/ProgramList';
import { GrantWriter } from './components/GrantWriter';
import { LoginScreen } from './components/LoginScreen';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DarkModeToggle } from './components/DarkModeToggle';
import { ViewState, SchoolProfile, FundingProgram, MatchResult } from './types';
import { INITIAL_PROFILE, MOCK_FUNDING_PROGRAMS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [profile, setProfile] = useState<SchoolProfile>(INITIAL_PROFILE);
  const [selectedProgram, setSelectedProgram] = useState<FundingProgram | null>(null);
  const [matchedPrograms, setMatchedPrograms] = useState<MatchResult[]>([]);
  const [allPrograms, setAllPrograms] = useState<FundingProgram[]>(MOCK_FUNDING_PROGRAMS);

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
  }

  const handleSaveProfile = (updatedProfile: SchoolProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('sf_profile', JSON.stringify(updatedProfile));
    setView(ViewState.DASHBOARD);
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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="font-bold text-lg tracking-tight cursor-pointer flex items-center gap-3" 
            onClick={() => setView(ViewState.LANDING)}
          >
            <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-serif font-bold text-xs italic pt-0.5 transition-colors duration-300">Ef</div>
            <span className="font-mono tracking-tight text-sm uppercase dark:text-white transition-colors duration-300">EduFunds.org</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 text-xs font-mono uppercase tracking-wide">
            <DarkModeToggle />
            <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-2"></div>
            <button 
                onClick={() => setView(ViewState.DASHBOARD)}
                className={`px-4 py-1.5 rounded-full transition-all ${view === ViewState.DASHBOARD ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
            >
                Dashboard
            </button>
            <div className="w-4 h-px bg-stone-300 dark:bg-stone-700"></div>
            <button 
                onClick={() => setView(ViewState.PROFILE)}
                className={`px-4 py-1.5 rounded-full transition-all ${view === ViewState.PROFILE ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
            >
                01 Profil
            </button>
            <div className="w-4 h-px bg-stone-300 dark:bg-stone-700"></div>
            <button 
                onClick={() => setView(ViewState.MATCHING)}
                className={`px-4 py-1.5 rounded-full transition-all ${view === ViewState.MATCHING ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
            >
                02 Matching
            </button>
            <div className="w-4 h-px bg-stone-300 dark:bg-stone-700"></div>
            <button 
                disabled={view !== ViewState.WRITER}
                className={`px-4 py-1.5 rounded-full transition-all ${view === ViewState.WRITER ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-slate-400 hover:text-black dark:hover:text-white disabled:opacity-50'}`}
            >
                03 Antrag
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-6 content-z">
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
                    Datenbasis &<br/>
                    <span className="text-stone-400">Grundschulprofil.</span>
                  </h2>
                  <p className="text-lg text-stone-600 font-light max-w-2xl font-serif italic">
                    "Präzise Daten führen zu präzisen Anträgen. Wir haben bereits erste Informationen aus dem Web extrahiert."
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
        </div>
      </main>
    </div>
  );
};

export default App;
