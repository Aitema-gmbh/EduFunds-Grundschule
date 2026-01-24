import React, { useState, useEffect } from 'react';
import { FundingProgram, SchoolProfile, GeneratedApplication } from '../types';
import { generateApplicationDraft, refineApplicationDraft } from '../services/geminiService';
import { ArrowLeft, Copy, Loader2, Download, Terminal, FileText, Send, Calendar, Sparkles, PenTool, Eraser, AlignJustify, Check } from 'lucide-react';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { marked } from 'marked';

import { useError } from '../contexts/ErrorContext';

// @ts-ignore
pdfMake.vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

interface Props {
  profile: SchoolProfile;
  program: FundingProgram;
  onBack: () => void;
}

export const GrantWriter: React.FC<Props> = ({ profile, program, onBack }) => {
  const [projectIdea, setProjectIdea] = useState('');
  const [generatedApp, setGeneratedApp] = useState<GeneratedApplication | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [customRefinement, setCustomRefinement] = useState('');
  const [version, setVersion] = useState(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const { setError } = useError();

  useEffect(() => {
      if(isGenerating) {
          const steps = [
              "Initialisiere DIN 5008 Template...",
              "Analysiere Förderrichtlinie (Abschnitt 3.2)...",
              `Validiere Anlagen (${program.requiredDocuments.length} items)...`,
              "Formuliere pädagogische Begründung...",
              "Optimiere für Zielgruppe 'Verwaltung'..."
          ];
          let i = 0;
          const interval = setInterval(() => {
              if (i < steps.length) {
                  setProcessLog(prev => [...prev, steps[i]]);
                  i++;
              } else {
                  clearInterval(interval);
              }
          }, 1200);
          return () => clearInterval(interval);
      } else {
          if (!isRefining) setProcessLog([]);
      }
  }, [isGenerating, profile.state, program.requiredDocuments.length]);
  
  const handleGenerate = async () => {
    if (!projectIdea) return;
    setIsGenerating(true);
    setVersion(1);
    try {
      const result = await generateApplicationDraft(profile, program, projectIdea);
      setGeneratedApp(result);
    } catch (error) {
      setError('Failed to generate draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
      if (!generatedApp) return;
      setIsRefining(true);
      try {
        const result = await refineApplicationDraft(generatedApp, instruction);
        if (result) {
            setGeneratedApp(result);
            setVersion(prev => prev + 1);
        }
      } catch (error) {
        setError('Failed to refine draft. Please try again.');
      } finally {
        setIsRefining(false);
        setCustomRefinement('');
      }
  };

  const handleDownloadPdf = () => {
    if (!generatedApp) return;

    // Generate reference number: ANT-YYYYMMDD-PROGRAMID-VX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const referenceNumber = `ANT-${dateStr}-${program.id.toUpperCase()}-V${version}`;

    const htmlContent = marked.parse(generatedApp.body.replace(new RegExp('^Betreff:.*\\n'), ''));
    // @ts-ignore
    const content = htmlToPdfmake(htmlContent);

    const docDefinition = {
        content: [
            // Header with school logo placeholder and school info
            {
                columns: [
                    {
                        // School logo placeholder (can be replaced with actual logo)
                        stack: [
                            { canvas: [{ type: 'rect', x: 0, y: 0, w: 60, h: 60, color: '#f0f0f0', lineColor: '#cccccc', lineWidth: 1 }] },
                            { text: 'SCHULLOGO', fontSize: 6, color: '#999999', alignment: 'center', margin: [0, -35, 0, 0] }
                        ],
                        width: 70
                    },
                    {
                        stack: [
                            { text: profile.name, fontSize: 14, bold: true },
                            { text: profile.address || '', fontSize: 9, color: '#666666' },
                            { text: profile.location, fontSize: 9, color: '#666666' },
                            { text: profile.email || '', fontSize: 9, color: '#666666', margin: [0, 2, 0, 0] }
                        ],
                        margin: [10, 0, 0, 0]
                    },
                    {
                        stack: [
                            { text: 'Aktenzeichen / Ref.:', fontSize: 8, color: '#666666' },
                            { text: referenceNumber, fontSize: 9, bold: true },
                            { text: '', margin: [0, 5, 0, 0] },
                            { text: 'Datum:', fontSize: 8, color: '#666666' },
                            { text: today.toLocaleDateString('de-DE'), fontSize: 9 }
                        ],
                        alignment: 'right',
                        width: 120
                    }
                ],
                margin: [0, 0, 0, 30]
            },
            // Horizontal line separator
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 0, 0, 20] },
            // Recipient
            { text: program.provider, style: 'recipient' },
            { text: 'Förderabteilung / Vergabe', style: 'recipientSub' },
            { text: program.address || '[Adresse des Trägers]', style: 'recipientSub', margin: [0, 0, 0, 30] },
            // Subject line
            { text: generatedApp.subject, style: 'subject' },
            // Body content
            ...content,
            // Signature
            { text: 'Mit freundlichen Grüßen,', style: 'signature' },
            { text: '____________________', style: 'signature' },
            { text: 'Schulleitung', style: 'signature' },
            { text: profile.name, style: 'signature' },
        ],
        footer: function(currentPage: number, pageCount: number) {
            return {
                columns: [
                    { text: `Ref: ${referenceNumber}`, fontSize: 8, color: '#999999' },
                    { text: `Seite ${currentPage} von ${pageCount}`, fontSize: 8, color: '#999999', alignment: 'right' }
                ],
                margin: [40, 10, 40, 0]
            };
        },
        styles: {
            sender: {
                fontSize: 8,
                margin: [0, 0, 0, 20]
            },
            recipient: {
                fontSize: 11,
                bold: true,
                margin: [0, 0, 0, 2]
            },
            recipientSub: {
                fontSize: 10,
                margin: [0, 0, 0, 2]
            },
            date: {
                alignment: 'right',
                margin: [0, 0, 0, 20]
            },
            subject: {
                fontSize: 14,
                bold: true,
                margin: [0, 0, 0, 20]
            },
            signature: {
                margin: [0, 10, 0, 0]
            }
        },
        defaultStyle: {
            fontSize: 11
        },
        pageMargins: [40, 40, 40, 60]
    };

    pdfMake.createPdf(docDefinition).download(`Antrag_${program.id}_v${version}.pdf`);
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      
      {/* Left: Workshop Panel */}
      <div className="w-full lg:w-1/3 flex flex-col h-full overflow-y-auto pr-2 custom-scroll">
        <button onClick={onBack} className="flex items-center text-xs font-mono uppercase tracking-widest text-stone-400 hover:text-black transition-colors mb-6 w-fit">
          <ArrowLeft className="h-3 w-3 mr-2" /> Zurück zur Liste
        </button>

        <div className="mb-6 bg-white p-6 border border-stone-200 shadow-sm">
             <span className="inline-block px-2 py-1 bg-black text-white text-[10px] font-mono uppercase mb-3 rounded-sm">
                 {program.region.includes('DE') ? 'Bundesweit' : `Landesprogramm ${program.region.join('/')}`}
             </span>
             <h1 className="text-xl font-bold mb-4 leading-tight font-serif">{program.title}</h1>
             <div className="grid grid-cols-2 gap-4 text-xs font-mono text-stone-500">
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase text-stone-400">Deadline</span>
                     <span className="text-red-600 font-bold flex items-center gap-1"><Calendar className="w-3 h-3"/> {program.deadline}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase text-stone-400">Budget</span>
                     <span className="text-stone-900 font-bold">{program.budget}</span>
                 </div>
             </div>
        </div>

        {/* Process Log / Checklist */}
        <div className="bg-stone-900 text-stone-300 p-4 shadow-inner mb-4 font-mono text-xs rounded-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-stone-700 pb-2 text-stone-400 uppercase tracking-widest">
                <Terminal className="w-3 h-3" /> {isGenerating ? 'System Log' : 'Document Status'}
            </div>
            
            {isGenerating ? (
                <div className="space-y-2 font-mono text-xs">
                    {processLog.map((log, i) => (
                        <div key={i} className="flex gap-2 text-green-400 animate-in slide-in-from-left-2 fade-in duration-300">
                            <span className="opacity-50">➜</span> {log}
                        </div>
                    ))}
                    <div className="flex gap-2 text-green-400 animate-pulse">
                        <span className="opacity-50">➜</span> _
                    </div>
                </div>
            ) : (
                 <div className="space-y-4">
                    <div>
                        <span className="text-stone-500 block mb-2 text-[10px] uppercase">Anlagen Check (AI Aware)</span>
                        <ul className="space-y-2">
                            {program.requiredDocuments?.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 leading-tight text-stone-400">
                                    <div className={`w-3 h-3 border border-stone-600 rounded-sm flex items-center justify-center mt-0.5 ${generatedApp ? 'bg-green-900 border-green-700' : ''}`}>
                                        {generatedApp && <Check size={8} className="text-green-400"/>}
                                    </div>
                                    <span>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 </div>
            )}
        </div>

        <div className="flex-grow flex flex-col">
            <label className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest mb-2 text-stone-900">
                <Sparkles className="w-3 h-3" /> Projekt-Briefing
            </label>
            <div className="relative flex-grow min-h-[150px]">
                <textarea
                    className="w-full h-full bg-white border border-stone-200 p-4 text-sm resize-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-stone-300 font-medium leading-relaxed shadow-sm font-serif"
                    placeholder="Beschreiben Sie hier Ihre Projektidee, den Bedarf der Kinder und wie das Geld eingesetzt werden soll..."
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    disabled={isGenerating || isRefining}
                />
            </div>
        </div>
        
        <button
            onClick={handleGenerate}
            disabled={!projectIdea || isGenerating || isRefining}
            className="mt-4 bg-black text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-stone-200 group"
        >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <span className="group-hover:translate-x-1 transition-transform">Entwurf Generieren</span>}
        </button>
      </div>

      {/* Right: Document Preview (DIN 5008 Simulation) */}
      <div className="w-full lg:w-2/3 flex flex-col bg-stone-100 border border-stone-200 rounded-sm relative overflow-hidden">
        {/* Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-noise z-0"></div>
        
        {/* Editor Toolbar */}
        {generatedApp && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white/90 backdrop-blur border border-stone-200 p-1 rounded-full shadow-xl">
                <button onClick={() => handleRefine("Kürze den Text deutlich")} disabled={isRefining} className="p-2 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition-colors" title="Kürzen">
                    <Eraser size={14} />
                </button>
                <button onClick={() => handleRefine("Schreibe förmlicher")} disabled={isRefining} className="p-2 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition-colors" title="Formaler">
                    <FileText size={14} />
                </button>
                <button onClick={() => handleRefine("Emotionaler / Dringender")} disabled={isRefining} className="p-2 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition-colors" title="Emotionaler">
                    <AlignJustify size={14} />
                </button>
                <div className="w-px h-4 bg-stone-200 mx-1"></div>
                <div className="flex items-center px-2">
                    <input 
                        type="text" 
                        className="bg-transparent text-xs text-black placeholder:text-stone-400 focus:outline-none w-32 font-mono"
                        placeholder="Custom prompt..." 
                        value={customRefinement}
                        onChange={(e) => setCustomRefinement(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefine(customRefinement)}
                    />
                    <button onClick={() => handleRefine(customRefinement)} className="ml-1 text-stone-400 hover:text-black"><PenTool size={12}/></button>
                </div>
                {isRefining && <Loader2 className="w-3 h-3 text-black animate-spin ml-2 mr-2" />}
            </div>
        )}

        <div className="flex-grow overflow-y-auto p-8 lg:p-12 flex justify-center custom-scroll z-10 relative bg-stone-200/50">
            {!generatedApp ? (
                <div className="flex flex-col items-center justify-center text-stone-400 opacity-60">
                    <div className="w-24 h-32 border-2 border-dashed border-stone-400 mb-6 rounded-sm bg-stone-100/50"></div>
                    <p className="text-xs font-mono uppercase tracking-widest">Warte auf Input...</p>
                </div>
            ) : (
            /* DIN 5008 Paper Simulation */
            <div className={`bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] pt-[27mm] text-black text-[11pt] font-serif relative mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 print-sheet ${isRefining ? 'blur-[2px] transition-all' : ''}`}>
                
                {/* DIN Marks */}
                <div className="absolute left-[8mm] top-[105mm] w-[5mm] h-px bg-stone-300"></div> {/* Falzmarke 1 */}
                <div className="absolute left-[8mm] top-[148.5mm] w-[7mm] h-px bg-stone-400"></div> {/* Lochmarke */}
                <div className="absolute left-[8mm] top-[210mm] w-[5mm] h-px bg-stone-300"></div> {/* Falzmarke 2 */}

                {/* Absenderzeile (Klein) - Positioniert für Fensterbriefumschlag */}
                <div className="absolute top-[45mm] left-[20mm] text-[8pt] text-stone-500 underline decoration-stone-300 underline-offset-4 font-sans">
                    {profile.name} • {profile.address} • {profile.location}
                </div>

                {/* Anschriftfeld */}
                <div className="absolute top-[50mm] left-[20mm] w-[85mm] h-[40mm] text-[11pt] font-sans leading-tight">
                    <div className="mb-1 font-bold">{program.provider}</div>
                    <div>Förderabteilung / Vergabe</div>
                    {program.address ? <div className="whitespace-pre-line">{program.address}</div> : <div className="italic text-stone-400">[Adresse des Trägers]</div>}
                </div>

                {/* Datumszeile */}
                <div className="absolute top-[50mm] right-[20mm] text-right text-[11pt] font-sans">
                    <div className="mb-1">{profile.location}</div>
                    <div>{new Date().toLocaleDateString('de-DE')}</div>
                </div>

                {/* Actions Absolute on Paper */}
                <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                     <div className="bg-stone-100 border border-stone-200 px-2 py-1 text-[9px] font-mono uppercase flex items-center gap-1 text-stone-500 rounded-sm">
                        v{version}
                    </div>
                    <button onClick={handleDownloadPdf} className={`border border-stone-200 hover:border-black hover:bg-black hover:text-white transition-colors px-3 py-1 text-[10px] font-mono uppercase flex items-center gap-2 shadow-sm rounded-sm ${downloadSuccess ? 'bg-green-500 text-white border-green-500' : 'bg-white'}`}>
                        {downloadSuccess ? <Check size={12} /> : <Download size={12} />}
                        {downloadSuccess ? 'Saved' : 'PDF'}
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(generatedApp.body)} className="bg-white border border-stone-200 hover:border-black hover:bg-black hover:text-white transition-colors px-3 py-1 text-[10px] font-mono uppercase flex items-center gap-2 shadow-sm rounded-sm">
                        <Copy size={12} />
                    </button>
                </div>

                {/* Content Start after Header Space */}
                <div className="mt-[70mm]">
                    {/* Betreff */}
                    <div className="font-bold text-lg mb-6 font-sans">{generatedApp.subject}</div>
                    
                    {/* Body */}
                    <div className="prose prose-p:my-3 prose-ul:list-disc prose-li:ml-4 text-justify max-w-none font-serif leading-relaxed text-[11pt]">
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(generatedApp.body.replace(new RegExp('^Betreff:.*\\n'), '')) }} />
                    </div>

                    {/* Signature Area */}
                    <div className="mt-16">
                        <div className="text-stone-800 mb-8">Mit freundlichen Grüßen,</div>
                        <div className="h-12 w-48 border-b border-stone-300 mb-2"></div>
                        <div className="font-sans font-bold text-sm">Schulleitung</div>
                        <div className="font-sans text-xs text-stone-500">{profile.name}</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-[15mm] left-[20mm] right-[20mm] flex justify-between text-[8pt] text-stone-400 border-t border-stone-200 pt-2 font-sans">
                    <div>Bankverbindung: [IBAN der Schule/Schulträger]</div>
                    <div>Steuer-ID: [Nummer]</div>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};
