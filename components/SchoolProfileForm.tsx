
import React, { useState, useEffect, useCallback } from 'react';
import { SchoolProfile } from '../types';
import { ArrowRight, Globe, Layout, Users, Wand2, RefreshCw, Loader2, MapPin, Award, Mail, Phone, AlertCircle } from 'lucide-react';
import { analyzeSchoolWithGemini } from '../services/geminiService';
import { validateSchoolProfile, FormErrors, hasErrors, validators, inputMasks } from '../services/validationService';

interface Props {
  profile: SchoolProfile;
  onSave: (profile: SchoolProfile) => void;
}

const STATES = [
    { code: 'DE', name: 'Bundesweit (Basis)' },
    { code: 'DE-BW', name: 'Baden-Württemberg' },
    { code: 'DE-BY', name: 'Bayern' },
    { code: 'DE-BE', name: 'Berlin' },
    { code: 'DE-BB', name: 'Brandenburg' },
    { code: 'DE-HB', name: 'Bremen' },
    { code: 'DE-HH', name: 'Hamburg' },
    { code: 'DE-HE', name: 'Hessen' },
    { code: 'DE-MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'DE-NI', name: 'Niedersachsen' },
    { code: 'DE-NW', name: 'Nordrhein-Westfalen' },
    { code: 'DE-RP', name: 'Rheinland-Pfalz' },
    { code: 'DE-SL', name: 'Saarland' },
    { code: 'DE-SN', name: 'Sachsen' },
    { code: 'DE-ST', name: 'Sachsen-Anhalt' },
    { code: 'DE-SH', name: 'Schleswig-Holstein' },
    { code: 'DE-TH', name: 'Thüringen' },
];

export const SchoolProfileForm: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
      setFormData(profile);
  }, [profile]);

  // Real-time validation as user types
  const validateField = useCallback((name: string, value: string | number) => {
    let error: string | undefined;

    switch (name) {
      case 'name':
        const nameResult = validators.required(value as string, 'Schulname');
        if (!nameResult.isValid) {
          error = nameResult.error;
        } else if ((value as string).length < 3) {
          error = 'Schulname muss mindestens 3 Zeichen haben';
        }
        break;
      case 'location':
        const locResult = validators.required(value as string, 'Standort');
        error = locResult.error;
        break;
      case 'email':
        if (value) {
          const emailResult = validators.email(value as string);
          error = emailResult.error;
        }
        break;
      case 'website':
        if (value) {
          const urlResult = validators.url(value as string);
          error = urlResult.error;
        }
        break;
      case 'studentCount':
        if (value && Number(value) <= 0) {
          error = 'Schülerzahl muss größer als 0 sein';
        }
        break;
      case 'phone':
        if (value) {
          const phoneResult = validators.phone(value as string);
          error = phoneResult.error;
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Apply input masks for formatted fields
    if (name === 'phone') {
      processedValue = inputMasks.phone(value);
    } else if (name === 'studentCount' || name === 'socialIndex' || name === 'teacherCount') {
      processedValue = Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Real-time validation if field has been touched
    if (touched[name]) {
      validateField(name, processedValue);
    }
  };

  // Validate on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, name === 'studentCount' || name === 'socialIndex' || name === 'teacherCount' ? Number(value) : value);
  };

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    const validationErrors = validateSchoolProfile(formData);
    return !hasErrors(validationErrors) && formData.name && formData.state;
  }, [formData]);

  const toggleFocus = (focus: string) => {
    setFormData(prev => {
      const exists = prev.focusAreas.includes(focus);
      return {
        ...prev,
        focusAreas: exists
          ? prev.focusAreas.filter(f => f !== focus)
          : [...prev.focusAreas, focus]
      };
    });
  };

  const handleReanalyze = async () => {
      if (!formData.name || !formData.location) return;
      setIsReanalyzing(true);
      try {
        const freshData = await analyzeSchoolWithGemini(formData.name, formData.location);
        setFormData(prev => ({ ...prev, ...freshData, needsDescription: prev.needsDescription }));
      } catch (e) {
          console.error(e);
      } finally {
          setIsReanalyzing(false);
      }
  };

  // Primary School specific focus areas
  const availableFocus = [
      'Leseförderung', 
      'Basiskompetenzen', 
      'OGS / Ganztag', 
      'Motorik & Bewegung', 
      'Übergang Kita-Schule', 
      'Medienkompetenz', 
      'Inklusion', 
      'Gesundheit/Ernährung',
      'Schulgarten'
  ];
  
  const isAiFilled = (val: any) => val && val !== '' && val !== 0;

  // Inline error message component
  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    );
  };

  // Get input border class based on validation state
  const getInputClass = (fieldName: string, baseClass: string) => {
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} border-red-400 focus:border-red-500`;
    }
    if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClass} border-green-400 focus:border-green-500`;
    }
    return baseClass;
  };

  return (
    <div className="max-w-6xl">
        {/* AI Found Badge */}
        {(formData.missionStatement || formData.awards?.length! > 0) && (
            <div className="bg-stone-50 border-l-4 border-black p-6 mb-12 shadow-sm flex gap-5 relative overflow-hidden group animate-in fade-in slide-in-from-top-2">
                <div className="absolute top-0 right-0 bg-black/5 text-[10px] font-mono uppercase px-2 py-1 text-stone-500">Deep Scan Active</div>
                <div className="mt-1 bg-white p-2 rounded-full h-fit border border-stone-200 shadow-sm">
                    <Wand2 className="w-5 h-5 text-black" />
                </div>
                <div className="flex-grow">
                    <h4 className="font-mono text-xs font-bold text-stone-900 uppercase tracking-widest mb-2">KI-Analyse Ergebnisse</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600 leading-relaxed font-serif">
                        <div>
                            <span className="block text-xs font-mono text-stone-400 uppercase mb-1">Leitbild (Auszug)</span>
                            <span className="italic">"{formData.missionStatement?.substring(0, 120)}..."</span>
                        </div>
                        {formData.awards && formData.awards.length > 0 && (
                            <div>
                                <span className="block text-xs font-mono text-stone-400 uppercase mb-1">Auszeichnungen</span>
                                <div className="flex flex-wrap gap-1">
                                    {formData.awards.map(a => <span key={a} className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-sans">{a}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={handleReanalyze} disabled={isReanalyzing} className="text-stone-400 hover:text-black transition-colors self-start">
                   {isReanalyzing ? <Loader2 className="animate-spin w-4 h-4"/> : <RefreshCw className="w-4 h-4"/>}
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
            
            {/* Left Column: Stammdaten */}
            <div className="lg:col-span-5 space-y-10">
                <div className="flex items-center gap-2 border-b border-black pb-2">
                    <span className="font-mono text-xs font-bold">01</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Institution (Grundschule)</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Name der Schule</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className={getInputClass('name', 'w-full bg-transparent border-b py-2 text-lg font-bold focus:outline-none transition-colors')} />
                        <ErrorMessage error={touched.name ? errors.name : undefined} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Standort (Stadt)</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} onBlur={handleBlur} className={getInputClass('location', 'w-full bg-transparent border-b py-2 text-base font-medium focus:outline-none transition-colors')} />
                            <ErrorMessage error={touched.location ? errors.location : undefined} />
                        </div>
                         <div className="group">
                            <label className="flex items-center gap-2 text-xs font-mono text-stone-400 mb-1 uppercase">
                                Bundesland
                                {formData.state !== 'DE' && <MapPin className="w-3 h-3 text-black" />}
                            </label>
                            <select 
                                name="state" 
                                value={formData.state} 
                                onChange={handleChange} 
                                className="w-full bg-transparent border-b border-stone-200 py-2 text-base font-mono focus:border-black focus:outline-none cursor-pointer"
                            >
                                {STATES.map(s => (
                                    <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Offizielle Adresse</label>
                        <input type="text" name="address" placeholder="Straße, PLZ" value={formData.address || ''} onChange={handleChange} className="w-full bg-transparent border-b border-stone-200 py-2 text-sm font-mono focus:border-black focus:outline-none" />
                    </div>
                     <div className="group">
                        <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Web-Adresse</label>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-stone-300" />
                            <input type="text" name="website" value={formData.website || ''} onChange={handleChange} onBlur={handleBlur} className={getInputClass('website', 'w-full bg-transparent border-b py-2 text-sm font-mono text-blue-600 focus:outline-none transition-colors')} />
                        </div>
                        <ErrorMessage error={touched.website ? errors.website : undefined} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">E-Mail</label>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-stone-300" />
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} onBlur={handleBlur} placeholder="schule@stadt.de" className={getInputClass('email', 'w-full bg-transparent border-b py-2 text-sm font-mono focus:outline-none transition-colors')} />
                            </div>
                            <ErrorMessage error={touched.email ? errors.email : undefined} />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Telefon</label>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-stone-300" />
                                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} onBlur={handleBlur} placeholder="0221 123 4567" className={getInputClass('phone', 'w-full bg-transparent border-b py-2 text-sm font-mono focus:outline-none transition-colors')} />
                            </div>
                            <ErrorMessage error={touched.phone ? errors.phone : undefined} />
                        </div>
                    </div>
                </div>
            </div>

             {/* Middle Column: Stats & Metrics */}
             <div className="lg:col-span-3 space-y-10">
                <div className="flex items-center gap-2 border-b border-black pb-2">
                    <span className="font-mono text-xs font-bold">02</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Schul-Metriken</h3>
                </div>
                <div className="space-y-8">
                     <div className="group">
                         <label className="flex items-center justify-between text-xs font-mono text-stone-400 mb-2 uppercase">
                             Sozialindex (1-5)
                             <span className={`text-xs font-bold px-1.5 rounded ${formData.socialIndex > 3 ? 'bg-red-100 text-red-600' : 'bg-stone-100'}`}>{formData.socialIndex}</span>
                         </label>
                         <input type="range" name="socialIndex" min="1" max="5" step="1" value={formData.socialIndex} onChange={handleChange} className="w-full h-1 bg-stone-200 appearance-none cursor-pointer accent-black" />
                         <p className="text-[10px] text-stone-400 mt-1">Relevant für Startchancen & OGS-Förderung</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Schülerzahl</label>
                            <input type="number" name="studentCount" value={formData.studentCount} onChange={handleChange} onBlur={handleBlur} className={getInputClass('studentCount', 'w-full border-b py-2 text-xl font-mono font-bold focus:outline-none transition-colors')} />
                            <ErrorMessage error={touched.studentCount ? errors.studentCount : undefined} />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase">Lehrkräfte</label>
                            <input type="number" name="teacherCount" value={formData.teacherCount || 0} onChange={handleChange} className="w-full border-b border-stone-200 py-2 text-xl font-mono font-bold focus:border-black focus:outline-none" />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-mono text-stone-400 mb-3 uppercase">Pädagogische Schwerpunkte</label>
                         <div className="flex flex-wrap gap-2">
                            {availableFocus.map(f => (
                                <button key={f} onClick={() => toggleFocus(f)} className={`text-[9px] uppercase font-bold px-2 py-1 border ${formData.focusAreas.includes(f) ? 'bg-black text-white border-black' : 'border-stone-200 text-stone-400'}`}>
                                    {f}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
             </div>

             {/* Right Column: Soft Data */}
             <div className="lg:col-span-4 space-y-10">
                <div className="flex items-center gap-2 border-b border-black pb-2">
                    <span className="font-mono text-xs font-bold">03</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Profil & Bedarf</h3>
                </div>
                <div className="space-y-6">
                    <div className="group bg-stone-50 p-4 border border-stone-100">
                        <label className="block text-xs font-mono text-stone-400 mb-2 uppercase">Pädagogisches Leitbild</label>
                        <textarea name="missionStatement" value={formData.missionStatement} onChange={handleChange} rows={4} className="w-full bg-transparent text-sm font-serif italic text-stone-700 focus:outline-none resize-none" placeholder="Unser Leitbild 'Miteinander Leben, Voneinander Lernen'..." />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-mono text-stone-400 mb-2 uppercase">Aktueller Bedarf (Grundschule)</label>
                        <textarea name="needsDescription" value={formData.needsDescription} onChange={handleChange} rows={3} className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none" placeholder="z.B. Neue Spielgeräte für den Pausenhof, Tablets für Klasse 3, Ruhe-Raum für OGS..." />
                    </div>
                </div>
             </div>
        </div>

        <div className="flex justify-end border-t border-stone-100 pt-8">
            <button onClick={() => onSave(formData)} disabled={!isFormValid()} className="bg-black text-white px-12 py-4 flex items-center gap-4 text-sm uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors shadow-xl shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Programme Matchen <ArrowRight size={18} />
            </button>
        </div>
    </div>
  );
};
