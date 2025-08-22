import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CaseStudy } from '../types';
import CaseStudyPdfReport from './CaseStudyPdfReport';

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);
const BadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const GoodIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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


const CaseStudyResults: React.FC<{ caseStudy: CaseStudy }> = ({ caseStudy }) => {
    const { scenario, deficientInteraction, idealProcess, tokenUsage } = caseStudy;
    const pdfRef = useRef<HTMLDivElement>(null);

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
        pdf.save(`escenario-entrenamiento-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const StepCard: React.FC<{ step: any; stepNumber: number }> = ({ step, stepNumber }) => (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-light dark:bg-indigo-900/50 flex items-center justify-center text-brand-primary font-bold text-lg">
                {stepNumber}
            </div>
            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{step.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{step.description}</p>
                <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-mono">{step.exampleDialog}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-brand-primary pt-1"><InfoIcon className="w-6 h-6"/></div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Escenario de Entrenamiento</h2>
                            {tokenUsage && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    Tokens Usados: {tokenUsage.totalTokens.toLocaleString('es-ES')}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <ActionButton onClick={handleDownloadPdf} ariaLabel="Descargar escenario en PDF">
                            <DownloadIcon className="h-4 w-4" /> PDF
                        </ActionButton>
                    </div>
                </div>

                <div className="mt-4 pl-10 space-y-3 text-slate-700 dark:text-slate-300">
                    <p><strong>Perfil del Cliente:</strong> {scenario.clientProfile}</p>
                    <p><strong>Problema Principal:</strong> {scenario.problem}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-red-500 pt-1"><BadIcon className="w-6 h-6"/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Interacción Deficiente (Cómo NO hacerlo)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Un ejemplo de los errores comunes que se deben evitar.</p>
                    </div>
                </div>
                 <div className="mt-4 pl-10 space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Transcripción del Error</h4>
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-md text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap font-mono border border-red-200 dark:border-red-800">
                            {deficientInteraction.transcript}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Análisis Crítico</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                           {deficientInteraction.criticalAnalysis.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </div>
                 </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-green-500 pt-1"><GoodIcon className="w-6 h-6"/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">El Proceso Ideal (El Playbook)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">La guía paso a paso para gestionar la situación de manera efectiva y profesional.</p>
                    </div>
                </div>
                <div className="mt-6 pl-10 space-y-6 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                    <StepCard step={idealProcess.step1_empathy} stepNumber={1} />
                    <StepCard step={idealProcess.step2_diagnosis} stepNumber={2} />
                    <StepCard step={idealProcess.step3_solution} stepNumber={3} />
                    <StepCard step={idealProcess.step4_crossSell} stepNumber={4} />
                    <StepCard step={idealProcess.step5_closure} stepNumber={5} />
                </div>
            </div>
             <div className="absolute left-[-9999px] top-0">
                <CaseStudyPdfReport ref={pdfRef} caseStudy={caseStudy} />
            </div>
        </div>
    );
};

export default CaseStudyResults;
