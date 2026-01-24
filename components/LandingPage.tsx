
import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Target, FileText, ShieldCheck, School, Clock, XCircle, Banknote, Leaf, Laptop } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStart }) => {
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
              <a href="#problem" className="hover:text-black transition-colors">Das Problem</a>
              <a href="#how-it-works" className="hover:text-black transition-colors">So funktioniert's</a>
              <a href="#examples" className="hover:text-black transition-colors">Beispiele</a>
          </div>
          <button 
            onClick={onStart}
            className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg shadow-stone-200/50 rounded-sm"
          >
            Jetzt Starten
          </button>
        </div>
      </header>

      <main className="flex-grow">
      
      {/* Hero Section: Benefit First */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-white">
         {/* Subtle Background Pattern */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-4 py-1.5 rounded-full mb-8 animate-in fade-in zoom-in duration-700">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Exklusiv für Grundschulen</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-stone-900">
               Fördergelder abrufen.<br/>
               <span className="font-serif italic text-stone-500">Ohne den Papierkrieg.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
               Wir automatisieren die Suche und Antragstellung für Fördermittel. 
               Damit Sie sich wieder auf das konzentrieren können, was zählt: <strong className="text-stone-900 font-medium">Die Kinder.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <button 
                    onClick={onStart}
                    className="group bg-black text-white h-14 px-10 flex items-center gap-3 font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-300 rounded-sm"
                >
                    Kostenlos Testen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 px-4 h-14 text-sm font-medium text-stone-500">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> Keine Installation nötig
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
                          <h3 className="text-xs font-bold uppercase tracking-widest">Der Status Quo</h3>
                      </div>
                      <h4 className="text-2xl font-bold mb-4 font-serif italic text-stone-800">"Ich würde ja gerne, aber..."</h4>
                      <ul className="space-y-4 text-stone-600">
                          <li className="flex gap-3">
                              <span className="text-red-400 mt-1">•</span>
                              <span>Keine Zeit für stundenlange Recherche in Amtsblättern.</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-red-400 mt-1">•</span>
                              <span>Fristen für "Startchancen" oder "DigitalPakt" verpasst.</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-red-400 mt-1">•</span>
                              <span>Formulierungen klingen nicht "amtlich" genug.</span>
                          </li>
                      </ul>
                  </div>

                  {/* The New Way (EduFunds) */}
                  <div className="p-8 md:p-12 bg-black text-white rounded-sm shadow-2xl relative overflow-hidden">
                      {/* Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                      <div className="flex items-center gap-3 mb-6 text-green-400">
                          <CheckCircle2 className="w-6 h-6" />
                          <h3 className="text-xs font-bold uppercase tracking-widest">Mit EduFunds.org</h3>
                      </div>
                      <h4 className="text-2xl font-bold mb-4 font-serif italic">Finanzierung auf Autopilot.</h4>
                      <ul className="space-y-4 text-stone-300">
                          <li className="flex gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              <span><strong>Automatische Suche:</strong> Wir finden Programme, die exakt zu Ihrer Schule passen.</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              <span><strong>Fristen-Radar:</strong> Nie wieder Geld verfallen lassen.</span>
                          </li>
                          <li className="flex gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              <span><strong>KI-Schreibkraft:</strong> Fertige Anträge in 30 Sekunden. DIN-konform.</span>
                          </li>
                      </ul>
                  </div>

              </div>
          </div>
      </section>

      {/* How it Works (Visual) */}
      <section id="how-it-works" className="py-32 bg-white text-stone-900 overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">So funktioniert der Prozess</h2>
              <p className="text-lg text-stone-500 max-w-xl mx-auto">
                  Sie liefern die Idee (z.B. "Neuer Schulgarten"). Unsere Plattform erledigt den Rest – von der Recherche bis zum unterschriftsreifen PDF.
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
                   <h3 className="font-bold mb-2">Schulprofil Scannen</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">
                       Geben Sie einfach den Namen Ihrer Schule ein. Wir laden Leitbild und Daten automatisch aus dem Web.
                   </p>
               </div>
               <div className="text-center px-4">
                   <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 font-bold font-mono text-lg">2</div>
                   <h3 className="font-bold mb-2">Matching & Auswahl</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">
                       Wir filtern tausende Programme (Bund, Land, EU, Stiftungen) und zeigen nur die, die wirklich passen.
                   </p>
               </div>
               <div className="text-center px-4">
                   <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 font-bold font-mono text-lg">3</div>
                   <h3 className="font-bold mb-2">Generierung</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">
                       Unsere KI schreibt den Antragstext, begründet pädagogisch und formatiert alles nach DIN 5008.
                   </p>
               </div>
          </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-32 px-6 bg-stone-100">
          <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                      <h2 className="text-3xl font-bold tracking-tight mb-4">Was Sie finanzieren können</h2>
                      <p className="text-stone-500">Typische Projekte, die erfolgreich über EduFunds gefördert wurden.</p>
                  </div>
                  <button onClick={onStart} className="text-sm font-bold underline underline-offset-4 hover:text-stone-600">
                      Alle Kategorien ansehen
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="w-12 h-12 bg-green-50 flex items-center justify-center mb-6 rounded-sm group-hover:bg-green-100 transition-colors">
                          <Leaf className="w-6 h-6 text-green-700" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Grünes Klassenzimmer</h3>
                      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                          Schulgarten, Hochbeete oder Entsiegelung des Schulhofs.
                      </p>
                      <div className="flex gap-2 text-[10px] font-mono uppercase text-stone-400">
                          <span>BMUV</span>
                          <span>•</span>
                          <span>Bis 25.000€</span>
                      </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 rounded-sm group-hover:bg-blue-100 transition-colors">
                          <Laptop className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Makerspace & IT</h3>
                      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                          Tablets, Roboter-Sets oder Einrichtung eines Medienraums.
                      </p>
                      <div className="flex gap-2 text-[10px] font-mono uppercase text-stone-400">
                          <span>DigitalPakt</span>
                          <span>•</span>
                          <span>100% Quote</span>
                      </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="w-12 h-12 bg-purple-50 flex items-center justify-center mb-6 rounded-sm group-hover:bg-purple-100 transition-colors">
                          <School className="w-6 h-6 text-purple-700" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Ganztag & OGS</h3>
                      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                          Möbel für Ruheräume, Spielgeräte oder Küchenausstattung.
                      </p>
                      <div className="flex gap-2 text-[10px] font-mono uppercase text-stone-400">
                          <span>Investitionsprogramm</span>
                          <span>•</span>
                          <span>Länder</span>
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
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> GGS Mühlenbach: 50.000€ für Startchancen bewilligt</span>
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Kath. Schule Köln: Neuer OGS-Raum finanziert</span>
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Grundschule Berlin-Mitte: Digital-Paket abgerufen</span>
                   <span className="mx-6 flex items-center inline-flex gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> GGS Mühlenbach: 50.000€ für Startchancen bewilligt</span>
               </div>
          </div>
          
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 py-20 px-6">
              <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-serif font-bold text-lg italic pt-1">Ef</div>
                     <span className="font-mono font-bold text-white tracking-tight text-xl">EduFunds.org</span>
                  </div>
                  <p className="max-w-xs text-sm leading-relaxed mb-8 text-stone-500">
                      Die digitale Förderabteilung für Deutschlands Grundschulen.
                      <br/><br/>
                      Made in Germany. Hosted in EU.
                  </p>
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-stone-600">
                      <span>Impressum</span>
                      <span>Datenschutz</span>
                      <span>Kontakt</span>
                  </div>
              </div>
              
              <div className="bg-stone-900 p-8 rounded-sm max-w-sm border border-stone-800">
                  <h4 className="text-white font-bold mb-2">Bereit für den ersten Antrag?</h4>
                  <p className="text-sm text-stone-500 mb-6">Starten Sie jetzt die kostenlose Analyse Ihrer Schule.</p>
                   <button onClick={onStart} className="w-full bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors">
                       Scan Starten
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
                <text y="90" textAnchor="middle" className="text-xs font-bold uppercase tracking-widest fill-stone-400" style={{fontSize: '10px', fontFamily: 'monospace'}}>Ihre Schule</text>
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
                
                <text y="90" textAnchor="middle" className="text-xs font-bold uppercase tracking-widest fill-stone-400" style={{fontSize: '10px', fontFamily: 'monospace'}}>Fertiger Antrag</text>
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
