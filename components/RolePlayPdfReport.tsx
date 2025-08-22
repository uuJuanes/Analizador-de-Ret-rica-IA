import React, { forwardRef } from 'react';
import { RolePlayAnalysisResult, KeyMoment } from '../types';
import { AdaptabilityIcon, QuestioningIcon, ObjectionHandlingIcon, ClosingIcon } from './icons/RolePlayAnalysisIcons';
import { LogoIcon } from './icons/LogoIcon';

const AiIconPdf: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25" />
    </svg>
);
const UserIconPdf: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

interface PdfReportProps {
  result: RolePlayAnalysisResult;
}

const ScoreCardPdf: React.FC<{ label: string; score: number; icon: React.ReactNode }> = ({ label, score, icon }) => (
  <div className="p-4 rounded-lg" style={{ backgroundColor: '#eef2ff' }}>
    <div className="flex items-center gap-2 mb-1">
        <div style={{ color: '#4f46e5' }}>{icon}</div>
        <p className="text-sm font-medium" style={{ color: '#3730a3' }}>{label}</p>
    </div>
    <p className="text-3xl font-bold" style={{ color: '#4f46e5' }}>{score}<span className="text-base text-slate-500">/100</span></p>
  </div>
);

const KeyMomentCardPdf: React.FC<{ moment: KeyMoment }> = ({ moment }) => {
    const isPraise = moment.type === 'praise';
    const borderColor = isPraise ? '#22c55e' : '#f59e0b';
    const bgColor = isPraise ? '#f0fdf4' : '#fffbeb';
    return (
        <div className="p-3 rounded-lg" style={{ borderLeft: `4px solid ${borderColor}`, backgroundColor: bgColor }}>
            <h5 className="font-semibold text-sm text-slate-800">{isPraise ? 'Momento Destacado' : 'Oportunidad de Mejora'}</h5>
            <div className="mt-2 space-y-1 text-xs border-t border-slate-200 pt-2">
                <p><strong className="font-semibold">Tú:</strong> <span className="text-slate-600 italic">"{moment.exchange.user}"</span></p>
                <p><strong className="font-semibold">Cliente:</strong> <span className="text-slate-600 italic">"{moment.exchange.model}"</span></p>
            </div>
            <p className="mt-2 text-xs text-slate-800">{moment.feedback}</p>
        </div>
    );
};

const RolePlayPdfReport = forwardRef<HTMLDivElement, PdfReportProps>(({ result }, ref) => {
    const { scores, keyMoments, overallFeedback, exercises, conversation } = result;
    
    return (
        <div ref={ref} className="p-10 bg-white font-sans" style={{ width: '827px' }}>
            <header className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <LogoIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Análisis de Simulación (Role-Play)</h1>
                </div>
                 <div className="text-right">
                    <p className="text-sm text-slate-500">{new Date(result.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-slate-500 mt-1">Simulación para: <span className="font-semibold">{result.product}</span></p>
                    {result.tokenUsage && <p className="text-xs text-slate-500 mt-1">Tokens Usados: <span className="font-semibold">{result.tokenUsage.totalTokens.toLocaleString('es-ES')}</span></p>}
                </div>
            </header>

            <main className="mt-8 space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Resumen de Puntuación</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <ScoreCardPdf label="Adaptabilidad" score={scores.adaptability} icon={<AdaptabilityIcon className="w-5 h-5"/>} />
                        <ScoreCardPdf label="Preguntas" score={scores.questioning} icon={<QuestioningIcon className="w-5 h-5"/>} />
                        <ScoreCardPdf label="Manejo de Objeciones" score={scores.objectionHandling} icon={<ObjectionHandlingIcon className="w-5 h-5"/>} />
                        <ScoreCardPdf label="Cierre" score={scores.closing} icon={<ClosingIcon className="w-5 h-5"/>} />
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Feedback General</h2>
                    <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-200">
                        {overallFeedback}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Momentos Clave</h2>
                    <div className="space-y-3">
                        {keyMoments.map((m, i) => <KeyMomentCardPdf key={i} moment={m} />)}
                    </div>
                </section>
                
                 <section className="break-after-page">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Ejercicios Recomendados</h2>
                    <div className="space-y-4">
                        {exercises.map((ex, index) => (
                            <div key={index} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                                <h5 className="font-semibold text-slate-800">{ex.title}</h5>
                                <p className="text-sm text-slate-800 mt-1">{ex.description}</p>
                                <p className="text-sm text-slate-700 mt-2 p-2 bg-slate-100 rounded-md"><strong>Escenario:</strong> <em>{ex.scenario}</em></p>
                            </div>
                        ))}
                    </div>
                </section>


                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Transcripción de la Conversación</h2>
                     <div className="space-y-3 text-sm p-4 bg-slate-50 border border-slate-200 rounded-md">
                        {conversation.map((msg, index) => (
                             <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center"><AiIconPdf className="w-4 h-4"/></div>}
                                <div className={`max-w-md p-2 rounded-lg ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-white'}`}>
                                    <p className="text-slate-800">{msg.text}</p>
                                </div>
                                {msg.role === 'user' && <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"><UserIconPdf className="w-4 h-4"/></div>}
                            </div>
                        ))}
                     </div>
                </section>
            </main>
        </div>
    );
});

export default RolePlayPdfReport;