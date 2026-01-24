import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FundingProgram, MatchResult, SchoolProfile } from '../types';
import { matchProgramsWithGemini, searchLiveFunding } from '../services/geminiService';
import { Loader2, Globe, Clock, Euro, ExternalLink, Sparkles } from 'lucide-react';
import { ProgramListSkeleton } from './Skeleton';
import { SearchFilter, FilterState } from './SearchFilter';

interface Props {
  profile: SchoolProfile;
  onSelectProgram: (program: FundingProgram) => void;
  onBack: () => void;
  onMatchesUpdate?: (programs: FundingProgram[], matches: MatchResult[]) => void;
}

export const ProgramList: React.FC<Props> = ({ profile, onSelectProgram, onBack, onMatchesUpdate }) => {
  const [allPrograms, setAllPrograms] = useState<FundingProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<FundingProgram[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingLive, setSearchingLive] = useState(false);
  const [newFoundCount, setNewFoundCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  // Create a map of program IDs to match scores for the SearchFilter component
  const matchScores = useMemo(() => {
    const scoreMap = new Map<string, number>();
    matches.forEach(m => scoreMap.set(m.programId, m.score));
    return scoreMap;
  }, [matches]);

  // Handle filter changes from SearchFilter component
  const handleFilterChange = useCallback((filtered: FundingProgram[], filters: FilterState) => {
    setFilteredPrograms(filtered);
    setActiveFilters(filters);
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      const response = await fetch('/funding_programs.json');
      const programs = await response.json();
      setAllPrograms(programs);
      const results = await matchProgramsWithGemini(profile, programs);
      setMatches(results);
      setLoading(false);
    };
    fetchPrograms();
  }, [profile]);

  useEffect(() => {
    if (allPrograms.length > 0) {
        const runMatching = async () => {
            setLoading(true);
            const results = await matchProgramsWithGemini(profile, allPrograms);
            setMatches(results);
            setLoading(false);
            // Notify parent about the matches
            onMatchesUpdate?.(allPrograms, results);
        };
        runMatching();
    }
  }, [allPrograms, profile, onMatchesUpdate]);

  const handleLiveSearch = async () => {
    setSearchingLive(true);
    setNewFoundCount(0);
    
    try {
        const newPrograms = await searchLiveFunding();
        if (newPrograms && newPrograms.length > 0) {
            setAllPrograms(prev => {
                const ids = new Set(prev.map(p => p.id));
                const uniqueNew = newPrograms.filter(p => !ids.has(p.id));
                setNewFoundCount(uniqueNew.length);
                return [...uniqueNew, ...prev];
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        setSearchingLive(false);
    }
  };

  const getProgram = (id: string) => allPrograms.find(p => p.id === id);

  // Get match info for filtered programs
  const getMatchForProgram = (programId: string) => matches.find(m => m.programId === programId);

  // Programs to display based on filters - either filtered list or sorted matches if no filters
  const programsToDisplay = useMemo(() => {
    if (activeFilters && (activeFilters.searchQuery || activeFilters.regions.length > 0 ||
        activeFilters.minBudget || activeFilters.maxBudget ||
        activeFilters.deadlineRange !== 'all' || activeFilters.sortBy !== 'relevance')) {
      return filteredPrograms;
    }
    // Default: show by match score
    return [...matches]
      .sort((a, b) => b.score - a.score)
      .map(m => getProgram(m.programId))
      .filter((p): p is FundingProgram => p !== undefined && (matchScores.get(p.id) ?? 0) >= 20);
  }, [filteredPrograms, matches, activeFilters, matchScores]);

  if (loading && !searchingLive && matches.length === 0) {
    return <ProgramListSkeleton />;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 font-sans">Matching Resultate</h2>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-wide">
             Basis: {profile.name} ({profile.state}) • Index: {profile.socialIndex}
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
            <button 
                onClick={handleLiveSearch}
                disabled={searchingLive}
                className="group flex items-center gap-2 text-xs font-mono uppercase tracking-wide border border-stone-300 px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-colors bg-white"
            >
                {searchingLive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                {searchingLive ? 'Scanning Web...' : 'Live Web Search'}
            </button>
        </div>
      </div>

      {searchingLive && (
          <div className="mb-8 p-4 bg-white border border-blue-200 shadow-sm text-blue-900 text-sm font-mono flex items-center gap-3 animate-in slide-in-from-top-2">
             <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
             <span>Agent durchsucht Stiftungsverzeichnisse, Ministerien und Amtsblätter (Ziel: 6+ Programme)...</span>
          </div>
      )}
      
      {!searchingLive && newFoundCount > 0 && (
           <div className="mb-8 p-4 bg-stone-900 text-white shadow-sm text-sm font-mono flex items-center gap-3 animate-in slide-in-from-top-2">
             <Sparkles className="w-4 h-4 text-yellow-400" />
             <span>Update erfolgreich: {newFoundCount} neue Förderprogramme gefunden und gematched.</span>
          </div>
      )}

      {/* Search and Filter Component */}
      <SearchFilter
        programs={allPrograms}
        onFilterChange={handleFilterChange}
        matchScores={matchScores}
      />

      {/* Results count indicator */}
      {activeFilters && (activeFilters.searchQuery || activeFilters.regions.length > 0) && (
        <div className="mb-4 text-xs font-mono text-stone-500">
          {programsToDisplay.length} von {allPrograms.length} Programmen
        </div>
      )}

      <div className="space-y-4">
        {programsToDisplay.map((program) => {
          const match = getMatchForProgram(program.id);
          const score = match?.score ?? 0;

          const isUrgent = program.deadline.includes('2025') && !program.deadline.includes('Laufend');
          const isNew = allPrograms.length > 0 && !allPrograms.find(p => p.id === program.id);

          // Calculate visual DNA bar widths (simulated based on score)
          const geoWidth = 30;
          const topicWidth = (score / 100) * 40;
          const socialWidth = program.requirements.includes('Sozial') ? 20 : 5;

          return (
            <div
              key={program.id}
              onClick={() => onSelectProgram(program)}
              className={`group relative grid grid-cols-1 md:grid-cols-12 gap-6 items-start p-6 bg-white dark:bg-stone-800 hover:shadow-xl transition-all cursor-pointer border rounded-sm overflow-hidden ${isNew ? 'border-blue-100 hover:border-blue-300' : 'border-stone-100 dark:border-stone-700 hover:border-stone-300'}`}
            >
                {/* Hover Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top ${isNew ? 'bg-blue-600' : 'bg-black dark:bg-white'}`}></div>

                {/* Score & DNA */}
                <div className="col-span-12 md:col-span-2 pt-1 flex flex-col items-start gap-1">
                    <span className="font-mono text-3xl font-bold text-black dark:text-white tracking-tighter">
                        {score}<span className="text-sm text-stone-400">%</span>
                    </span>
                    <div className="w-full h-1.5 flex gap-0.5 mt-1">
                        <div style={{width: `${geoWidth}%`}} className="bg-stone-800 dark:bg-stone-200 h-full" title="Geo Match"></div>
                        <div style={{width: `${topicWidth}%`}} className="bg-stone-500 h-full" title="Topic Match"></div>
                        <div style={{width: `${socialWidth}%`}} className="bg-stone-300 dark:bg-stone-600 h-full" title="Social/Bonus Match"></div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-stone-400 mt-1">Match DNA</span>
                </div>

                {/* Main Info */}
                <div className="col-span-12 md:col-span-7">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                         <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif leading-tight group-hover:text-blue-700 transition-colors">
                            {program.title}
                        </h3>
                        {isNew && (
                            <span className="bg-blue-600 text-white text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 flex items-center gap-1">
                                <Globe size={8} /> Live Found
                            </span>
                        )}
                        {program.region.some(r => r.length > 2) && (
                            <span className="bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5">{program.region.join('/')}</span>
                        )}
                    </div>

                    <p className="text-stone-600 dark:text-stone-400 text-sm mb-4 leading-relaxed line-clamp-2 font-sans">
                        {program.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                         {match?.tags?.map(tag => (
                             <span key={tag} className="text-[10px] font-bold uppercase tracking-tight px-2 py-1 bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-100 dark:border-stone-600">
                                 {tag}
                             </span>
                         ))}
                    </div>
                </div>

                {/* Hard Facts */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-3 text-xs font-mono pt-1 border-l border-stone-100 dark:border-stone-700 pl-6">
                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                        <Euro className="w-4 h-4 text-stone-400" />
                        <span className="font-bold">{program.budget}</span>
                    </div>
                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform delay-75">
                        <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-stone-400'}`} />
                        <span className={`${isUrgent ? 'text-red-600 font-bold' : 'text-stone-600 dark:text-stone-400'}`}>
                            {program.deadline}
                        </span>
                    </div>
                    {program.officialLink && (
                         <a href={program.officialLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 text-stone-400 hover:text-black dark:hover:text-white flex items-center gap-2 group-hover:translate-x-1 transition-transform delay-100">
                             <ExternalLink className="w-4 h-4" />
                             <span className="underline underline-offset-2">Quelle öffnen</span>
                         </a>
                    )}
                </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
         <button 
            onClick={onBack} 
            className="text-xs font-mono text-stone-400 hover:text-black uppercase tracking-widest underline underline-offset-4"
         >
            Suchparameter anpassen
         </button>
      </div>
    </div>
  );
};