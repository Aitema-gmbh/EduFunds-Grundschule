
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SchoolProfile } from '../types';
import { analyzeSchoolWithGemini } from '../services/geminiService';
import { Loader2, ArrowRight, CheckCircle2, MapPin, Terminal, Search, Shield, Cpu, AlertCircle } from 'lucide-react';
import { validateLoginForm, FormErrors, hasErrors, validators } from '../services/validationService';

import { useError } from '../contexts/ErrorContext';

interface Props {
  onLogin: (profile: SchoolProfile) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { setError } = useError();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  useEffect(() => {
      if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [logs]);

  // Real-time validation
  const validateField = useCallback((fieldName: string, value: string) => {
    let error: string | undefined;

    if (fieldName === 'name') {
      const result = validators.required(value, 'Schulname');
      if (!result.isValid) {
        error = result.error;
      } else if (value.length < 3) {
        error = 'Schulname muss mindestens 3 Zeichen haben';
      }
    } else if (fieldName === 'city') {
      const result = validators.required(value, 'Stadt');
      if (!result.isValid) {
        error = result.error;
      } else if (value.length < 2) {
        error = 'Stadt muss mindestens 2 Zeichen haben';
      }
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) {
      validateField('name', value);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    if (touched.city) {
      validateField('city', value);
    }
  };

  const handleBlur = (fieldName: string, value: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const validationErrors = validateLoginForm(name, city);
    return !hasErrors(validationErrors) && name.length >= 3 && city.length >= 2;
  }, [name, city]);

  // Inline error component
  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 mt-2 text-red-500 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    );
  };

  // Get input border class based on validation state
  const getInputClass = (fieldName: string) => {
    const baseClass = 'w-full border-b-2 py-3 text-xl font-bold focus:outline-none transition-all placeholder:text-stone-200';
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} border-red-400 focus:border-red-500`;
    }
    if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClass} border-green-400 focus:border-green-500`;
    }
    return `${baseClass} border-stone-100 focus:border-black`;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setLogs([]);

    // Simulate technical scan process strictly for visuals
    addLog(`> INIT_SESSION: ${new Date().toISOString()}`);
    addLog(`> TARGET: "${name}" in "${city}"`);
    addLog(`> GEO_LOOKUP: Resolving coordinates...`);
    
    setTimeout(() => addLog(`> AGENT_START: Spawning headless browser...`), 800);
    setTimeout(() => addLog(`> QUERY: "site:*.de ${name} ${city} Grundschule Impressum"`), 1500);
    setTimeout(() => addLog(`> CONNECT: Establishing TLS connection... [200 OK]`), 2200);

    try {
        // Real AI Call
        const startTime = Date.now();
        const extractedData = await analyzeSchoolWithGemini(name, city);
        const duration = Date.now() - startTime;

        addLog(`> PARSING: DOM Tree analysis completed in ${duration}ms`);
        if (extractedData.website) addLog(`> FOUND_URL: ${extractedData.website}`);
        if (extractedData.missionStatement) addLog(`> EXTRACT_NLP: "Leitbild" identified (${extractedData.missionStatement.length} bytes)`);
        addLog(`> DEDUCTION: Calculating Social Index Estimate...`);
        addLog(`> DEDUCTION: Determining Federal State ISO Code...`);
        
        const newProfile: SchoolProfile = {
            name: name,
            location: city,
            state: extractedData.state || 'DE', 
            studentCount: extractedData.studentCount || 200,
            socialIndex: extractedData.socialIndex || 3,
            focusAreas: extractedData.focusAreas || [],
            needsDescription: '',
            missionStatement: extractedData.missionStatement || '',
            website: extractedData.website || '',
            address: extractedData.address || '',
            email: extractedData.email || '',
            teacherCount: extractedData.teacherCount || 0,
            awards: extractedData.awards || [],
            partners: extractedData.partners || []
        };

        addLog(`> FINALIZE: Profile object constructed.`);
        addLog(`> SUCCESS: Transferring to Dashboard...`);

        setTimeout(() => onLogin(newProfile), 1500);

    } catch (err) {
        console.error(err);
        setError('Failed to analyze school profile. Please try again later.');
        addLog(`> ERROR: Scan failed. Fallback to manual input.`);
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex w-5/12 bg-stone-950 text-white p-16 flex-col justify-between relative overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-20" style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
         }}></div>
         
         <div className="relative z-10">
             <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-mono font-bold text-sm mb-10">Ef</div>
             <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter leading-[0.95] mb-8">
                 Grundschul<br/>Förder<br/>Plattform.
             </h1>
             <div className="h-1 w-20 bg-white mb-8"></div>
             <p className="text-lg text-stone-400 font-light max-w-xs leading-relaxed font-serif italic">
                 "Bildungsgerechtigkeit beginnt bei der Finanzierung."
             </p>
         </div>
         
         <div className="relative z-10 border-t border-stone-800 pt-8">
             <div className="flex items-center gap-4 text-xs font-mono text-stone-500 uppercase tracking-widest">
                 <span className="flex items-center gap-2"><Shield size={12}/> Secure</span>
                 <span className="flex items-center gap-2"><Cpu size={12}/> AI Powered</span>
                 <span className="flex items-center gap-2"><Search size={12}/> Deep Search</span>
             </div>
         </div>
      </div>

      {/* Right Login/Terminal Panel */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-white relative">
        <div className="max-w-md w-full transition-all duration-500">
            {!isAnalyzing ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 mb-6">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         <span className="text-xs font-mono uppercase tracking-widest text-stone-500">System Online</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-3 tracking-tighter text-stone-900">Schul-Identifikation</h2>
                    <p className="text-stone-500 mb-12 leading-relaxed">Geben Sie Ihre Stammdaten ein. Unsere KI führt einen vollautomatischen Deep-Scan durch, um Ihr Profil vorzubereiten.</p>

                    <form onSubmit={handleAnalyze} className="space-y-8">
                        <div className="group">
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2 font-bold">Name der Grundschule</label>
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                onBlur={() => handleBlur('name', name)}
                                required
                                className={getInputClass('name')}
                                placeholder="z.B. Katholische Grundschule..."
                            />
                            <ErrorMessage error={touched.name ? errors.name : undefined} />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2 font-bold">Stadt / Gemeinde</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={city}
                                    onChange={handleCityChange}
                                    onBlur={() => handleBlur('city', city)}
                                    required
                                    className={getInputClass('city')}
                                    placeholder="z.B. Köln"
                                />
                                <MapPin className="absolute right-0 top-3 text-stone-300 w-5 h-5" />
                            </div>
                            <ErrorMessage error={touched.city ? errors.city : undefined} />
                        </div>
                        <button type="submit" disabled={!isFormValid()} className="group w-full bg-black text-white h-16 mt-8 flex items-center justify-between px-8 font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl">
                            <span>Scan Starten</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="w-full bg-black rounded-sm p-6 shadow-2xl border border-stone-800 font-mono text-xs h-[400px] flex flex-col animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-stone-500 uppercase tracking-widest text-[10px]">Terminal / Deep-Scan</div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto space-y-2 custom-scroll pr-2 font-mono">
                        {logs.map((log, i) => (
                            <div key={i} className="text-green-400 break-all">
                                <span className="opacity-50 mr-2">{(i+1).toString().padStart(3, '0')}</span>
                                {log}
                            </div>
                        ))}
                        <div className="flex items-center gap-2 text-green-400/50">
                            <span className="animate-pulse">_</span>
                        </div>
                        <div ref={logsEndRef} />
                    </div>

                    <div className="pt-4 border-t border-stone-800 mt-4 flex justify-between items-center">
                        <div className="text-stone-500">Status: <span className="text-white animate-pulse">PROCESSING</span></div>
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
