import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { RolePlayAnalysisResult, KeyMoment } from '../types';
import { AdaptabilityIcon, QuestioningIcon, ObjectionHandlingIcon, ClosingIcon } from './icons/RolePlayAnalysisIcons';
import RolePlayPdfReport from './RolePlayPdfReport';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; ariaLabel: string }> = ({ onClick, children, ariaLabel }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-light dark:bg-indigo-500/20 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors"
    aria-label={ariaLabel}
  >
    {children}
  </button>
);


const ScoreCard: React.FC<{ icon: React.ReactNode; label: string; score: number }> = ({ icon, label, score }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light dark:bg-indigo-500/20 text-brand-primary flex items-center justify-center">
                {icon}
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{label}</h4>
        </div>
        <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-brand-primary">{score}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">/ 100</p>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${score}%` }}></div>
        </div>
    </div>
);

const KeyMomentCard: React.FC<{ moment: KeyMoment }> = ({ moment }) => {
    const isPraise = moment.type === 'praise';
    const borderColor = isPraise ? 'border-green-500' : 'border-amber-500';
    const bgColor = isPraise ? 'bg-green-50 dark:bg-green-900/30' : 'bg-amber-50 dark:bg-amber-900/30';

    const Icon = isPraise
        ? () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        : () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.22 2.38-1.218 3.016.002l4.29 8.243a1.75 1.75 0 01-1.508 2.655H5.47a1.75 1.75 0 01-1.508-2.655l4.29-8.243zM9 11a1 1 0 112 0v1a1 1 0 11-2 0v-1zm1-4a1 1 0 00-1 1v2a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

    return (
        <div className={`p-4 rounded-lg border-l-4 ${borderColor} ${bgColor}`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon />
                <h5 className="font-semibold text-slate-800 dark:text-slate-100">{isPraise ? 'Momento Destacado' : 'Oportunidad de Mejora'}</h5>
            </div>
            <div className="space-y-2 text-sm border-t border-slate-300 dark:border-slate-600 pt-3">
                <p><strong className="font-semibold">Tú:</strong> <span className="text-slate-600 dark:text-slate-300 italic">"{moment.exchange.user}"</span></p>
                <p><strong className="font-semibold">Cliente:</strong> <span className="text-slate-600 dark:text-slate-300 italic">"{moment.exchange.model}"</span></p>
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{moment.feedback}</p>
        </div>
    );
};


const RolePlayResults: React.FC<{ result: RolePlayAnalysisResult }> = ({ result }) => {
    const wasMultipleChoice = result.totalChoices !== undefined && result.totalChoices > 0;
    const pdfRef = useRef<HTMLDivElement>(null);
    const [interactionCopied, setInteractionCopied] = useState(false);

    const handleDownloadPdf = async () => {
        const input = pdfRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`analisis-role-play-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleCopyInteraction = () => {
        const transcript = result.conversation.map(msg => {
            const speaker = msg.role === 'user' ? 'Vendedor' : 'Cliente';
            return `${speaker}: ${msg.text}`;
        }).join('\n');

        navigator.clipboard.writeText(transcript).then(() => {
            setInteractionCopied(true);
            setTimeout(() => setInteractionCopied(false), 2000);
        });
    };
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análisis de Simulación (Role-Play)</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Simulación para vender <strong className="text-brand-primary">{result.product}</strong> a un <strong className="text-brand-primary">{result.clientProfile}</strong>.
                        </p>
                         {result.tokenUsage && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                Tokens Usados: {result.tokenUsage.totalTokens.toLocaleString('es-ES')}
                            </p>
                        )}
                    </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <ActionButton onClick={handleCopyInteraction} ariaLabel="Copiar interacción">
                            {interactionCopied ? <><CheckIcon className="h-4 w-4 text-green-500" /> ¡Copiado!</> : <><CopyIcon className="h-4 w-4" /> Copiar Interacción</>}
                        </ActionButton>
                        <ActionButton onClick={handleDownloadPdf} ariaLabel="Descargar resultados en PDF">
                            <DownloadIcon className="h-4 w-4" /> PDF
                        </ActionButton>
                    </div>
                </div>

                 {wasMultipleChoice && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <p className="text-center text-indigo-800 dark:text-indigo-200">
                            Rendimiento en Modo Juego: <strong className="text-lg">{result.correctChoices}</strong> de <strong className="text-lg">{result.totalChoices}</strong> elecciones correctas.
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">Puntuación de Habilidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ScoreCard icon={<AdaptabilityIcon className="w-5 h-5"/>} label="Adaptabilidad" score={result.scores.adaptability} />
                    <ScoreCard icon={<QuestioningIcon className="w-5 h-5"/>} label="Preguntas" score={result.scores.questioning} />
                    <ScoreCard icon={<ObjectionHandlingIcon className="w-5 h-5"/>} label="Manejo de Objeciones" score={result.scores.objectionHandling} />
                    <ScoreCard icon={<ClosingIcon className="w-5 h-5"/>} label="Cierre" score={result.scores.closing} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">Momentos Clave</h3>
                <div className="space-y-4">
                    {result.keyMoments.map((moment, index) => <KeyMomentCard key={index} moment={moment} />)}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">Feedback General y Próximos Pasos</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Resumen del Coach</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{result.overallFeedback}</p>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Ejercicios Recomendados</h4>
                 <div className="space-y-4">
                    {result.exercises.map((ex, index) => (
                        <div key={index} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h5 className="font-semibold text-slate-800 dark:text-slate-100">{ex.title}</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{ex.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md"><strong>Escenario:</strong> <em>{ex.scenario}</em></p>
                        </div>
                    ))}
                 </div>
            </div>
            
            <div className="absolute left-[-9999px] top-0">
                <RolePlayPdfReport ref={pdfRef} result={result} />
            </div>
        </div>
    );
};

export default RolePlayResults;