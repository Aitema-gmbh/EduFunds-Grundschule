import React, { useEffect, useState } from 'react';
import { FundingProgram, MatchResult, SchoolProfile } from '../types';
import { matchProgramsWithGemini, searchLiveFunding } from '../services/geminiService';
import { ArrowRight, Loader2, Globe, Clock, Euro, ExternalLink, MapPin, Sparkles } from 'lucide-react';

interface Props {
  profile: SchoolProfile;
  onSelectProgram: (program: FundingProgram) => void;
  onBack: () => void;
  onMatchesUpdate?: (programs: FundingProgram[], matches: MatchResult[]) => void;
}

export const ProgramList: React.FC<Props> = ({ profile, onSelectProgram, onBack, onMatchesUpdate }) => {
  const [allPrograms, setAllPrograms] = useState<FundingProgram[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingLive, setSearchingLive] = useState(false);
  const [newFoundCount, setNewFoundCount] = useState(0);

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
  const sortedMatches = [...matches].sort((a, b) => b.score - a.score);

  if (loading && !searchingLive && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh]">
         <Loader2 className="h-10 w-10 animate-spin text-black mb-6" />
         <p className="text-stone-900 font-bold text-sm uppercase tracking-widest">Analysiere Förderlandschaft...</p>
         <p className="text-stone-400 text-xs font-mono mt-2">Wende Filter an: {profile.state} • Primarstufe</p>
      </div>
    );
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

      <div className="space-y-4">
        {sortedMatches.map((match) => {
          const program = getProgram(match.programId);
          if (!program || match.score < 20) return null;

          const isUrgent = program.deadline.includes('2025') && !program.deadline.includes('Laufend');
          const isNew = allPrograms.length > 0 && !allPrograms.find(p => p.id === program.id);

          // Calculate visual DNA bar widths (simulated based on score)
          const geoWidth = 30; 
          const topicWidth = (match.score / 100) * 40;
          const socialWidth = program.requirements.includes('Sozial') ? 20 : 5;

          return (
            <div 
              key={program.id}
              onClick={() => onSelectProgram(program)}
              className={`group relative grid grid-cols-1 md:grid-cols-12 gap-6 items-start p-6 bg-white hover:shadow-xl transition-all cursor-pointer border rounded-sm overflow-hidden ${isNew ? 'border-blue-100 hover:border-blue-300' : 'border-stone-100 hover:border-stone-300'}`}
            >
                {/* Hover Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top ${isNew ? 'bg-blue-600' : 'bg-black'}`}></div>

                {/* Score & DNA */}
                <div className="col-span-12 md:col-span-2 pt-1 flex flex-col items-start gap-1">
                    <span className="font-mono text-3xl font-bold text-black tracking-tighter">
                        {match.score}<span className="text-sm text-stone-400">%</span>
                    </span>
                    <div className="w-full h-1.5 flex gap-0.5 mt-1">
                        <div style={{width: `${geoWidth}%`}} className="bg-stone-800 h-full" title="Geo Match"></div>
                        <div style={{width: `${topicWidth}%`}} className="bg-stone-500 h-full" title="Topic Match"></div>
                        <div style={{width: `${socialWidth}%`}} className="bg-stone-300 h-full" title="Social/Bonus Match"></div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-stone-400 mt-1">Match DNA</span>
                </div>

                {/* Main Info */}
                <div className="col-span-12 md:col-span-7">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                         <h3 className="text-lg font-bold text-stone-900 font-serif leading-tight group-hover:text-blue-700 transition-colors">
                            {program.title}
                        </h3>
                        {isNew && (
                            <span className="bg-blue-600 text-white text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 flex items-center gap-1">
                                <Globe size={8} /> Live Found
                            </span>
                        )}
                        {program.region.some(r => r.length > 2) && (
                            <span className="bg-stone-100 border border-stone-200 text-stone-600 text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5">{program.region.join('/')}</span>
                        )}
                    </div>
                    
                    <p className="text-stone-600 text-sm mb-4 leading-relaxed line-clamp-2 font-sans">
                        {program.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                         {match.tags?.map(tag => (
                             <span key={tag} className="text-[10px] font-bold uppercase tracking-tight px-2 py-1 bg-stone-50 text-stone-600 border border-stone-100">
                                 {tag}
                             </span>
                         ))}
                    </div>
                </div>

                {/* Hard Facts */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-3 text-xs font-mono pt-1 border-l border-stone-100 pl-6">
                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                        <Euro className="w-4 h-4 text-stone-400" />
                        <span className="font-bold">{program.budget}</span>
                    </div>
                    <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform delay-75">
                        <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-stone-400'}`} />
                        <span className={`${isUrgent ? 'text-red-600 font-bold' : 'text-stone-600'}`}>
                            {program.deadline}
                        </span>
                    </div>
                    {program.officialLink && (
                         <a href={program.officialLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 text-stone-400 hover:text-black flex items-center gap-2 group-hover:translate-x-1 transition-transform delay-100">
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