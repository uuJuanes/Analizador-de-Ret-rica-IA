import React, { forwardRef } from 'react';
import { CaseStudy } from '../types';
import { LogoIcon } from './icons/LogoIcon';

const InfoIconPdf: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);
const BadIconPdf: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const GoodIconPdf: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const StepCardPdf: React.FC<{ step: any; stepNumber: number }> = ({ step, stepNumber }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
            {stepNumber}
        </div>
        <div>
            <h4 className="font-semibold text-slate-800">{step.title}</h4>
            <p className="text-sm text-slate-600 mt-1">{step.description}</p>
            <div className="mt-2 p-3 rounded-md" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{step.exampleDialog}</p>
            </div>
        </div>
    </div>
);


const CaseStudyPdfReport = forwardRef<HTMLDivElement, { caseStudy: CaseStudy }>(({ caseStudy }, ref) => {
    const { scenario, deficientInteraction, idealProcess, timestamp, tokenUsage } = caseStudy;
    
    return (
        <div ref={ref} className="p-10 bg-white font-sans" style={{ width: '827px' }}>
            <header className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <LogoIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Escenario de Entrenamiento</h1>
                </div>
                 <div className="text-right">
                    <p className="text-sm text-slate-500">{new Date(timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {tokenUsage && <p className="text-xs text-slate-500 mt-1">Tokens Usados: <span className="font-semibold">{tokenUsage.totalTokens.toLocaleString('es-ES')}</span></p>}
                </div>
            </header>

            <main className="mt-8 space-y-8">
                {/* Scenario */}
                <section>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1" style={{color: '#4f46e5'}}><InfoIconPdf className="w-6 h-6"/></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Escenario</h2>
                            <div className="mt-2 space-y-2 text-sm text-slate-700">
                                <p><strong>Perfil del Cliente:</strong> {scenario.clientProfile}</p>
                                <p><strong>Problema Principal:</strong> {scenario.problem}</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Deficient Interaction */}
                <section className="break-after-page">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1" style={{ color: '#ef4444' }}><BadIconPdf className="w-6 h-6"/></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Interacción Deficiente (Cómo NO hacerlo)</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Transcripción del Error</h3>
                                    <div className="p-4 rounded-md text-sm whitespace-pre-wrap font-mono" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                                        {deficientInteraction.transcript}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Análisis Crítico</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                                    {deficientInteraction.criticalAnalysis.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ideal Process */}
                <section>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1" style={{ color: '#22c55e' }}><GoodIconPdf className="w-6 h-6"/></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">El Proceso Ideal (El Playbook)</h2>
                            <div className="mt-6 space-y-6 border-l-2 border-slate-200 ml-3 pl-8">
                                <StepCardPdf step={idealProcess.step1_empathy} stepNumber={1} />
                                <StepCardPdf step={idealProcess.step2_diagnosis} stepNumber={2} />
                                <StepCardPdf step={idealProcess.step3_solution} stepNumber={3} />
                                <StepCardPdf step={idealProcess.step4_crossSell} stepNumber={4} />
                                <StepCardPdf step={idealProcess.step5_closure} stepNumber={5} />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
});

export default CaseStudyPdfReport;
