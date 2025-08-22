import React, { forwardRef } from 'react';
import { AnalysisResult, Feedback, Highlight } from '../types';
import { EthosIcon, PathosIcon, LogosIcon } from './icons/RhetoricIcons';
import { LogoIcon } from './icons/LogoIcon';

interface PdfReportProps {
  result: AnalysisResult;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return `rgba(0, 0, 0, ${alpha})`; 
  }
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const colors = {
    presuasion: '#fb923c', // orange-400
    ethos: '#16a34a',
    pathos: '#c026d3',
    logos: '#2563eb',
};
const bgColors = {
    presuasion: hexToRgba(colors.presuasion, 0.1),
    ethos: hexToRgba(colors.ethos, 0.1),
    pathos: hexToRgba(colors.pathos, 0.1),
    logos: hexToRgba(colors.logos, 0.1),
};
const textColorsMuted = {
    presuasion: hexToRgba(colors.presuasion, 0.7),
    ethos: hexToRgba(colors.ethos, 0.7),
    pathos: hexToRgba(colors.pathos, 0.7),
    logos: hexToRgba(colors.logos, 0.7),
};


const PersuasionScoreCard: React.FC<{ label: string; score: number; type: keyof typeof colors }> = ({ label, score, type }) => (
  <div className={`p-4 rounded-lg`} style={{ backgroundColor: bgColors[type] }}>
    <p className="text-sm font-medium" style={{ color: colors[type] }}>{label}</p>
    <p className="text-3xl font-bold" style={{ color: colors[type] }}>{score}</p>
    <p className="text-xs" style={{ color: textColorsMuted[type] }}>/ 100</p>
  </div>
);

const HighlightCard: React.FC<{ highlight: Highlight }> = ({ highlight }) => {
    const color = colors[highlight.type] || '#64748b';
    const bgColor = bgColors[highlight.type] || '#f1f5f9';
    return (
        <div className="p-3 rounded-r-md" style={{ borderLeft: `4px solid ${color}`, backgroundColor: '#f8fafc' }}>
             <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-slate-700 italic">"{highlight.text}"</p>
                  <span className={`ml-3 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize flex-shrink-0`} style={{ backgroundColor: bgColor, color }}>
                    {highlight.type}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{highlight.explanation}</p>
        </div>
    );
};

const FeedbackCardPdf: React.FC<{ title: string; item: Feedback['pathos']; icon: React.ReactNode }> = ({ title, item, icon }) => (
    <div>
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <h4 className="font-semibold text-lg text-slate-800">{title}</h4>
        </div>
        <p className="text-slate-800 text-sm leading-relaxed mb-3">{item.advice}</p>
        <div className="grid grid-cols-2 gap-3">
             <div style={{ backgroundColor: '#fee2e2' }} className="p-3 rounded-md border-l-4 border-red-400">
                <p className="text-xs font-semibold text-red-700 mb-1">ANTES</p>
                <p className="text-sm text-slate-700 italic">"{item.example.before}"</p>
            </div>
            <div style={{ backgroundColor: '#dcfce7' }} className="p-3 rounded-md border-l-4 border-green-500">
                <p className="text-xs font-semibold text-green-700 mb-1">DESPUÉS</p>
                <p className="text-sm text-slate-700 italic">"{item.example.after}"</p>
            </div>
        </div>
    </div>
);


const PdfReport = forwardRef<HTMLDivElement, PdfReportProps>(({ result }, ref) => {
    const { scores, highlights, feedback, improvedText, originalText } = result;
    const isAudio = originalText.startsWith('Audio:');
    
    return (
        <div ref={ref} className="p-10 bg-white font-sans" style={{ width: '827px' }}>
            <header className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <LogoIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Análisis de Persuasión IA</h1>
                </div>
                 <div className="text-right">
                    <p className="text-sm text-slate-500">{new Date(result.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-slate-500 mt-1">Analizado por: <span className="font-semibold">{result.aiProvider.charAt(0).toUpperCase() + result.aiProvider.slice(1)}</span></p>
                    {result.tokenUsage && <p className="text-xs text-slate-500 mt-1">Tokens Usados: <span className="font-semibold">{result.tokenUsage.totalTokens.toLocaleString('es-ES')}</span></p>}
                </div>
            </header>

            <main className="mt-8 space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Resumen de Puntuación</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <PersuasionScoreCard label="Pre-suasión" score={scores.presuasion} type="presuasion" />
                        <PersuasionScoreCard label="Ethos (Credibilidad)" score={scores.ethos} type="ethos" />
                        <PersuasionScoreCard label="Pathos (Emoción)" score={scores.pathos} type="pathos" />
                        <PersuasionScoreCard label="Logos (Lógica)" score={scores.logos} type="logos" />
                    </div>
                </section>
                
                {improvedText && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Guion de Ventas Mejorado</h2>
                        <div className="p-4 bg-slate-50 rounded-md text-slate-700 whitespace-pre-wrap font-serif border border-slate-200">
                            {improvedText}
                        </div>
                    </section>
                )}

                {feedback && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Feedback Detallado</h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <EthosIcon className="h-6 w-6" style={{color: colors.ethos}}/>
                                    <h3 className="font-semibold text-lg text-slate-800">Ethos (Credibilidad)</h3>
                                </div>
                                <div className="pl-9 space-y-4">
                                    <p className="text-slate-800 text-sm leading-relaxed"><strong>Frónesis (Sabiduría Práctica):</strong> {feedback.ethos.phronesis.advice}</p>
                                    <p className="text-slate-800 text-sm leading-relaxed"><strong>Areté (Integridad):</strong> {feedback.ethos.arete.advice}</p>
                                    <p className="text-slate-800 text-sm leading-relaxed"><strong>Eunoía (Benevolencia):</strong> {feedback.ethos.eunoia.advice}</p>
                                </div>
                            </div>
                            <FeedbackCardPdf title="Pathos (Emoción)" item={feedback.pathos} icon={<PathosIcon className="h-6 w-6" style={{color: colors.pathos}} />} />
                            <FeedbackCardPdf title="Logos (Lógica)" item={feedback.logos} icon={<LogosIcon className="h-6 w-6" style={{color: colors.logos}} />} />
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Frases Clave</h2>
                    <div className="space-y-3">
                        {highlights.length > 0 ? (
                            highlights.map((h, i) => <HighlightCard key={i} highlight={h} />)
                        ) : (
                            <p className="text-sm text-slate-500">No se destacaron frases específicas.</p>
                        )}
                    </div>
                </section>

                 {!isAudio && (
                     <section>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Texto Original Analizado</h2>
                        <div className="p-4 bg-slate-50 rounded-md text-slate-500 text-sm whitespace-pre-wrap border border-slate-200">
                            {originalText}
                        </div>
                    </section>
                 )}

            </main>
        </div>
    );
});

export default PdfReport;