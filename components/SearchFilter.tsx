import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FundingProgram } from '../types';
import { Search, Filter, X, ChevronDown, Calendar, Euro, MapPin, ArrowUpDown, Bookmark, BookmarkCheck } from 'lucide-react';

// Filter preset interface for saved filter configurations
export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
}

// Main filter state interface
export interface FilterState {
  searchQuery: string;
  regions: string[];
  minBudget: string;
  maxBudget: string;
  deadlineRange: 'all' | 'urgent' | 'this_month' | 'this_quarter' | 'this_year';
  sortBy: 'relevance' | 'deadline' | 'budget_high' | 'budget_low';
}

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  regions: [],
  minBudget: '',
  maxBudget: '',
  deadlineRange: 'all',
  sortBy: 'relevance',
};

interface Props {
  programs: FundingProgram[];
  onFilterChange: (filteredPrograms: FundingProgram[], filters: FilterState) => void;
  matchScores?: Map<string, number>; // Map of program ID to match score for relevance sorting
}

// German state codes for region filter
const GERMAN_STATES = [
  { code: 'DE', label: 'Bundesweit' },
  { code: 'DE-BW', label: 'Baden-Württemberg' },
  { code: 'DE-BY', label: 'Bayern' },
  { code: 'DE-BE', label: 'Berlin' },
  { code: 'DE-BB', label: 'Brandenburg' },
  { code: 'DE-HB', label: 'Bremen' },
  { code: 'DE-HH', label: 'Hamburg' },
  { code: 'DE-HE', label: 'Hessen' },
  { code: 'DE-MV', label: 'Mecklenburg-Vorpommern' },
  { code: 'DE-NI', label: 'Niedersachsen' },
  { code: 'DE-NW', label: 'Nordrhein-Westfalen' },
  { code: 'DE-RP', label: 'Rheinland-Pfalz' },
  { code: 'DE-SL', label: 'Saarland' },
  { code: 'DE-SN', label: 'Sachsen' },
  { code: 'DE-ST', label: 'Sachsen-Anhalt' },
  { code: 'DE-SH', label: 'Schleswig-Holstein' },
  { code: 'DE-TH', label: 'Thüringen' },
];

// Parse budget string to numeric value for comparison
const parseBudget = (budget: string): number => {
  const cleaned = budget.replace(/[^\d.,]/g, '').replace(',', '.');
  const match = cleaned.match(/[\d.]+/);
  if (!match) return 0;
  const value = parseFloat(match[0]);
  if (budget.toLowerCase().includes('mio') || budget.toLowerCase().includes('million')) {
    return value * 1000000;
  }
  if (budget.toLowerCase().includes('tsd') || budget.toLowerCase().includes('tausend') || budget.includes('.000')) {
    return value * 1000;
  }
  return value;
};

// Parse deadline string to Date for comparison
const parseDeadline = (deadline: string): Date | null => {
  if (deadline.toLowerCase().includes('laufend')) return null;
  const match = deadline.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  return null;
};

export const SearchFilter: React.FC<Props> = ({ programs, onFilterChange, matchScores }) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [showFilters, setShowFilters] = useState(false);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Generate autocomplete suggestions from program titles and providers
  const autocompleteOptions = useMemo(() => {
    const options = new Set<string>();
    programs.forEach(p => {
      options.add(p.title);
      options.add(p.provider);
      p.focus.split(',').forEach(f => options.add(f.trim()));
    });
    return Array.from(options).filter(Boolean);
  }, [programs]);

  // Update autocomplete results based on search query
  useEffect(() => {
    if (filters.searchQuery.length >= 2) {
      const query = filters.searchQuery.toLowerCase();
      const matches = autocompleteOptions
        .filter(opt => opt.toLowerCase().includes(query))
        .slice(0, 5);
      setAutocompleteResults(matches);
      setShowAutocomplete(matches.length > 0);
    } else {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  }, [filters.searchQuery, autocompleteOptions]);

  // Stable callback for filter changes
  const stableOnFilterChange = useCallback(onFilterChange, []);

  // Apply filters and sorting whenever filters or programs change
  useEffect(() => {
    let filtered = [...programs];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.provider.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.focus.toLowerCase().includes(query)
      );
    }

    // Region filter
    if (filters.regions.length > 0) {
      filtered = filtered.filter(p =>
        p.region.some(r => filters.regions.includes(r) || filters.regions.includes('DE'))
      );
    }

    // Budget filter
    if (filters.minBudget || filters.maxBudget) {
      const min = filters.minBudget ? parseBudget(filters.minBudget) : 0;
      const max = filters.maxBudget ? parseBudget(filters.maxBudget) : Infinity;
      filtered = filtered.filter(p => {
        const budget = parseBudget(p.budget);
        return budget >= min && budget <= max;
      });
    }

    // Deadline filter
    if (filters.deadlineRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(p => {
        const deadline = parseDeadline(p.deadline);
        if (!deadline) return filters.deadlineRange !== 'urgent'; // Ongoing programs pass except for urgent filter

        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.deadlineRange) {
          case 'urgent': return daysUntil <= 14 && daysUntil >= 0;
          case 'this_month': return daysUntil <= 30 && daysUntil >= 0;
          case 'this_quarter': return daysUntil <= 90 && daysUntil >= 0;
          case 'this_year': return daysUntil <= 365 && daysUntil >= 0;
          default: return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'relevance':
          const scoreA = matchScores?.get(a.id) ?? 0;
          const scoreB = matchScores?.get(b.id) ?? 0;
          return scoreB - scoreA;
        case 'deadline':
          const deadlineA = parseDeadline(a.deadline);
          const deadlineB = parseDeadline(b.deadline);
          if (!deadlineA) return 1;
          if (!deadlineB) return -1;
          return deadlineA.getTime() - deadlineB.getTime();
        case 'budget_high':
          return parseBudget(b.budget) - parseBudget(a.budget);
        case 'budget_low':
          return parseBudget(a.budget) - parseBudget(b.budget);
        default:
          return 0;
      }
    });

    stableOnFilterChange(filtered, filters);
  }, [filters, programs, matchScores, stableOnFilterChange]);

  // Clear all filters
  const clearFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.regions.length > 0 ||
    filters.minBudget !== '' ||
    filters.maxBudget !== '' ||
    filters.deadlineRange !== 'all' ||
    filters.sortBy !== 'relevance';

  // Save current filters as preset
  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: { ...filters },
    };
    setSavedPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setShowPresetInput(false);
    // Persist to localStorage
    localStorage.setItem('filterPresets', JSON.stringify([...savedPresets, newPreset]));
  };

  // Load preset
  const loadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  // Delete preset
  const deletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('filterPresets', JSON.stringify(updated));
  };

  // Load saved presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('filterPresets');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load filter presets:', e);
      }
    }
  }, []);

  return (
    <div className="mb-8 space-y-4">
      {/* Search bar with autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              onFocus={() => filters.searchQuery.length >= 2 && setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              placeholder="Förderprogramme durchsuchen..."
              className="w-full pl-10 pr-4 py-3 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 border-t-0 shadow-lg z-50 max-h-48 overflow-y-auto">
                {autocompleteResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, searchQuery: result }));
                      setShowAutocomplete(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 dark:hover:bg-stone-700 font-mono"
                  >
                    {result}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border font-mono text-xs uppercase tracking-wide transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="bg-white dark:bg-black text-black dark:text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-6 space-y-6 animate-in slide-in-from-top-2">
          {/* Sort options */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-2">
              <ArrowUpDown className="w-3 h-3 inline mr-1" />
              Sortierung
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'relevance', label: 'Relevanz' },
                { value: 'deadline', label: 'Deadline' },
                { value: 'budget_high', label: 'Budget ↓' },
                { value: 'budget_low', label: 'Budget ↑' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: opt.value as FilterState['sortBy'] }))}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                    filters.sortBy === opt.value
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline filter */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              Deadline
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Alle' },
                { value: 'urgent', label: 'Dringend (14 Tage)' },
                { value: 'this_month', label: 'Diesen Monat' },
                { value: 'this_quarter', label: 'Dieses Quartal' },
                { value: 'this_year', label: 'Dieses Jahr' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilters(prev => ({ ...prev, deadlineRange: opt.value as FilterState['deadlineRange'] }))}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                    filters.deadlineRange === opt.value
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget range */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-2">
              <Euro className="w-3 h-3 inline mr-1" />
              Budget Bereich
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filters.minBudget}
                onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                placeholder="Min (z.B. 10000)"
                className="flex-1 px-3 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-stone-400"
              />
              <span className="text-stone-400">—</span>
              <input
                type="text"
                value={filters.maxBudget}
                onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                placeholder="Max (z.B. 100000)"
                className="flex-1 px-3 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Region filter */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-2">
              <MapPin className="w-3 h-3 inline mr-1" />
              Region
            </label>
            <div className="flex flex-wrap gap-2">
              {GERMAN_STATES.slice(0, 6).map(state => (
                <button
                  key={state.code}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      regions: prev.regions.includes(state.code)
                        ? prev.regions.filter(r => r !== state.code)
                        : [...prev.regions, state.code],
                    }));
                  }}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                    filters.regions.includes(state.code)
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  {state.label}
                </button>
              ))}
              <details className="relative">
                <summary className="px-3 py-1.5 text-xs font-mono border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-400 cursor-pointer flex items-center gap-1 list-none">
                  Mehr <ChevronDown className="w-3 h-3" />
                </summary>
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-lg z-50 p-2 min-w-48">
                  {GERMAN_STATES.slice(6).map(state => (
                    <button
                      key={state.code}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          regions: prev.regions.includes(state.code)
                            ? prev.regions.filter(r => r !== state.code)
                            : [...prev.regions, state.code],
                        }));
                      }}
                      className={`w-full px-3 py-1.5 text-xs font-mono text-left transition-colors ${
                        filters.regions.includes(state.code)
                          ? 'bg-stone-100 dark:bg-stone-700 font-bold'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-700'
                      }`}
                    >
                      {state.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Filter presets */}
          <div className="border-t border-stone-100 dark:border-stone-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono uppercase tracking-wide text-stone-500 dark:text-stone-400">
                <Bookmark className="w-3 h-3 inline mr-1" />
                Gespeicherte Filter
              </label>
              <button
                onClick={() => setShowPresetInput(!showPresetInput)}
                className="text-xs font-mono text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                + Speichern
              </button>
            </div>

            {showPresetInput && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Name für Preset..."
                  className="flex-1 px-3 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-stone-400"
                />
                <button
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-mono uppercase disabled:opacity-50"
                >
                  Speichern
                </button>
              </div>
            )}

            {savedPresets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {savedPresets.map(preset => (
                  <div key={preset.id} className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600">
                    <button
                      onClick={() => loadPreset(preset)}
                      className="px-3 py-1.5 text-xs font-mono hover:bg-stone-200 dark:hover:bg-stone-600 flex items-center gap-1"
                    >
                      <BookmarkCheck className="w-3 h-3" />
                      {preset.name}
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="px-2 py-1.5 text-stone-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 font-mono">Keine gespeicherten Filter</p>
            )}
          </div>

          {/* Clear all button */}
          {hasActiveFilters && (
            <div className="border-t border-stone-100 dark:border-stone-700 pt-4">
              <button
                onClick={clearFilters}
                className="text-xs font-mono text-red-600 hover:text-red-800 uppercase tracking-wide flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Alle Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
