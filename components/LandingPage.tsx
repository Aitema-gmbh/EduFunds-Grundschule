
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2, Sparkles, Target, FileText, ShieldCheck, School, Clock, XCircle, Banknote, Leaf, Laptop } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

interface Props {
  onStart: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-black selection:text-white overflow-x-hidden scroll-smooth flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
             <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-serif font-bold text-xl italic pt-1">Ef</div>
             <span className="font-mono font-bold text-lg tracking-tight">EduFunds.org</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-stone-500 font-sans tracking-wide">
              <a href="#problem" className="hover:text-black transition-colors">{t('navigation.theProblem')}</a>
              <a href="#how-it-works" className="hover:text-black transition-colors">{t('navigation.howItWorks')}</a>
              <a href="#examples" className="hover:text-black transition-colors">{t('navigation.examples')}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={onStart}
              className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg shadow-stone-200/50 rounded-sm btn-interactive focus-ring"
            >
              {t('common.startNow')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">

      {/* Hero Section: Benefit First */}
      <section className="relative pt-16 sm:pt-24 pb-24 sm:pb-32 px-4 sm:px-6 overflow-hidden bg-white">
         {/* Subtle Background Pattern */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

         <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-4 py-1.5 rounded-full mb-8 animate-in fade-in zoom-in duration-700">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-stone-900">
               {t('hero.title1')}<br/>
               <span className="font-serif italic text-stone-500">{t('hero.title2')}</span>
            </h1>

            <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
               {t('hero.description')} <strong className="text-stone-900 font-medium">{t('hero.theChildren')}</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <button
                    onClick={onStart}
                    className="group bg-black text-white h-14 px-10 flex items-center gap-3 font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-300 rounded-sm btn-interactive focus-ring"
                >
                    {t('common.freeTest')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 px-4 h-14 text-sm font-medium text-stone-500">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> {t('common.noInstallation')}
                </div>
            </div>
         </div>
      </section>

      {/* Comparison Section: The "Pain" vs The Solution */}
      <section id="problem" className="py-24 px-6 bg-stone-50 border-y border-stone-200">
          <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                  {/* The Old Way */}
                  <div className="p-8 md:p-12 bg-white border border-stone-200 rounded-sm shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-3 mb-6 text-stone-400">
                          <XCircle className="w-6 h-6" />
                          <h3 className="text-xs font-bold uppercase tracking-widest">{t('problem.statusQuoTitle')}</h3>
                      </div>
                      <h4 className="text-2xl font-bold mb-4 font-serif italic text-stone-800">{t('problem.statusQuoQuote')}</h4>
                      <ul className="space-y-4 text-stone-600">
                          <li className="flex gap-3">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{t('problem.statusQuoReason1')}</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{t('problem.statusQuoReason2')}</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{t('problem.statusQuoReason3')}</span>
                          </li>
                      </ul>
                  </div>

                  {/* The New Way (EduFunds) */}
                  <div className="p-8 md:p-12 bg-black text-white rounded-sm shadow-2xl relative overflow-hidden">
                      {/* Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                      <div className="flex items-center gap-3 mb-6 text-green-400">
                          <CheckCircle2 className="w-6 h-6" />
                          <h3 className="text-xs font-bold uppercase tracking-widest">{t('problem.solutionTitle')}</h3>
                      </div>
                      <h4 className="text-2xl font-bold mb-4 font-serif italic">{t('problem.solutionQuote')}</h4>
                      <ul className="space-y-4 text-stone-300">
                          <li className="flex gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              <span><strong>{t('problem.solutionFeature1Title')}</strong> {t('problem.solutionFeature1Desc')}</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              <span><strong>{t('problem.solutionFeature2Title')}</strong> {t('problem.solutionFeature2Desc')}</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              <span><strong>{t('problem.solutionFeature3Title')}</strong> {t('problem.solutionFeature3Desc')}</span>
                          </li>
                      </ul>
                  </div>

              </div>
          </div>
      </section>

      {/* How it Works (Visual) */}
      <section id="how-it-works" className="py-32 bg-white text-stone-900 overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{t('howItWorks.title')}</h2>
              <p className="text-lg text-stone-500 max-w-xl mx-auto">
                  {t('howItWorks.description')}
              </p>
          </div>

          {/* SVG Process Animation */}
          <div className="w-full max-w-5xl mx-auto px-6 mb-20">
             <ProcessVisual />
          </div>

          {/* 3 Steps Grid */}
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="text-center px-4">
                   <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 font-bold font-mono text-lg">1</div>
                   <h3 className="font-bold mb-2">{t('howItWorks.step1Title')}</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">
                       {t('howItWorks.step1Desc')}
                   </p>
               </div>
               <div className="text-center px-4">
                   <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 font-bold font-mono text-lg">2</div>
                   <h3 className="font-bold mb-2">{t('howItWorks.step2Title')}</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">
                       {t('howItWorks.step2Desc')}
                   </p>
               </div>
               <div className="text-center px-4">
                   <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 font-bold font-mono text-lg">3</div>
                   <h3 className="font-bold mb-2">{t('howItWorks.step3Title')}</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">
                       {t('howItWorks.step3Desc')}
                   </p>
               </div>
          </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-32 px-6 bg-stone-100">
          <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                      <h2 className="text-3xl font-bold tracking-tight mb-4">{t('examples.title')}</h2>
                      <p className="text-stone-500">{t('examples.description')}</p>
                  </div>
                  <button onClick={onStart} className="text-sm font-bold underline underline-offset-4 hover:text-stone-600">
                      {t('common.viewAllCategories')}
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer card-hover">
                      <div className="w-12 h-12 bg-green-50 flex items-center justify-center mb-6 rounded-sm group-hover:bg-green-100 transition-colors">
                          <Leaf className="w-6 h-6 text-green-700" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t('examples.greenClassroomTitle')}</h3>
                      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                          {t('examples.greenClassroomDesc')}
                      </p>
                      <div className="flex gap-2 text-[10px] font-mono uppercase text-stone-400">
                          <span>BMUV</span>
                          <span>•</span>
                          <span>{t('examples.upTo')} 25.000€</span>
                      </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer card-hover">
                      <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 rounded-sm group-hover:bg-blue-100 transition-colors">
                          <Laptop className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t('examples.makerspaceTitle')}</h3>
                      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                          {t('examples.makerspaceDesc')}
                      </p>
                      <div className="flex gap-2 text-[10px] font-mono uppercase text-stone-400">
                          <span>DigitalPakt</span>
                          <span>•</span>
                          <span>{t('examples.fullQuote')}</span>
                      </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer card-hover">
                      <div className="w-12 h-12 bg-purple-50 flex items-center justify-center mb-6 rounded-sm group-hover:bg-purple-100 transition-colors">
                          <School className="w-6 h-6 text-purple-700" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t('examples.fulltimeTitle')}</h3>
                      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                          {t('examples.fulltimeDesc')}
                      </p>
                      <div className="flex gap-2 text-[10px] font-mono uppercase text-stone-400">
                          <span>Investitionsprogramm</span>
                          <span>•</span>
                          <span>{t('examples.states')}</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Trust & Footer */}
       <footer className="bg-stone-950 text-stone-400 border-t border-stone-900">
          {/* Live Ticker Bar */}
          <div className="bg-black border-b border-stone-800 py-3 overflow-hidden whitespace-nowrap">
               <div className="inline-block animate-marquee text-[11px] font-mono text-stone-500 uppercase tracking-widest">
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('footer.ticker1')}</span>
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('footer.ticker2')}</span>
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('footer.ticker3')}</span>
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('footer.ticker1')}</span>
               </div>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 py-20 px-6">
              <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-serif font-bold text-lg italic pt-1">Ef</div>
                     <span className="font-mono font-bold text-white tracking-tight text-xl">EduFunds.org</span>
                  </div>
                  <p className="max-w-xs text-sm leading-relaxed mb-8 text-stone-500">
                      {t('footer.tagline')}
                      <br/><br/>
                      {t('footer.madeInGermany')}
                  </p>
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-stone-600">
                      <span>{t('footer.imprint')}</span>
                      <span>{t('footer.privacy')}</span>
                      <span>{t('footer.contact')}</span>
                  </div>
              </div>

              <div className="bg-stone-900 p-8 rounded-sm max-w-sm border border-stone-800">
                  <h4 className="text-white font-bold mb-2">{t('footer.readyTitle')}</h4>
                  <p className="text-sm text-stone-500 mb-6">{t('footer.readyDesc')}</p>
                   <button onClick={onStart} className="w-full bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors btn-interactive focus-ring">
                       {t('common.startScan')}
                   </button>
              </div>
          </div>
      </footer>
      </main>
      <style>{`
        .animate-marquee {
            animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

// --- FRIENDLY PROCESS VISUAL ---
const ProcessVisual = () => {
    const { t } = useTranslation();

    return (
        <svg viewBox="0 0 800 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#e5e7eb" />
                </marker>
            </defs>

            {/* Connection Lines */}
            <line x1="180" y1="100" x2="320" y2="100" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
            <line x1="480" y1="100" x2="620" y2="100" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

            {/* Step 1: Idea/School */}
            <g transform="translate(100, 100)">
                <circle r="60" fill="white" stroke="#e7e5e4" strokeWidth="1" />
                {/* Icon School */}
                <rect x="-20" y="-10" width="40" height="30" fill="none" stroke="black" strokeWidth="2" />
                <path d="M -25 -10 L 0 -35 L 25 -10" fill="none" stroke="black" strokeWidth="2" />
                <rect x="-5" y="10" width="10" height="10" fill="none" stroke="black" strokeWidth="1.5" />
                <text y="90" textAnchor="middle" className="text-xs font-bold uppercase tracking-widest fill-stone-400" style={{fontSize: '10px', fontFamily: 'monospace'}}>{t('howItWorks.yourSchool')}</text>
            </g>

            {/* Step 2: The AI Brain */}
            <g transform="translate(400, 100)">
                <circle r="70" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
                <circle r="60" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
                {/* Sparkle Icon Center */}
                 <path d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill="black" />
                 <text y="100" textAnchor="middle" className="text-xs font-bold uppercase tracking-widest fill-stone-900" style={{fontSize: '10px', fontFamily: 'monospace'}}>EduFunds AI</text>
            </g>

            {/* Step 3: Success */}
            <g transform="translate(700, 100)">
                <circle r="60" fill="black" />
                {/* Document Icon */}
                <rect x="-15" y="-20" width="30" height="40" fill="white" rx="2" />
                <path d="M -5 -10 L 5 -10 M -5 0 L 5 0 M -5 10 L 0 10" stroke="black" strokeWidth="2" />
                {/* Checkmark Badge */}
                <circle cx="15" cy="15" r="12" fill="#22c55e" />
                <path d="M 10 15 L 13 18 L 20 11" stroke="white" strokeWidth="2" fill="none" />

                <text y="90" textAnchor="middle" className="text-xs font-bold uppercase tracking-widest fill-stone-400" style={{fontSize: '10px', fontFamily: 'monospace'}}>{t('howItWorks.finishedApplication')}</text>
            </g>

            <style>{`
                .animate-spin-slow {
                    animation: spin 10s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </svg>
    );
}
