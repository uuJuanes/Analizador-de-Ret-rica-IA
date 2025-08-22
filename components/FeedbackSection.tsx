import React from 'react';
import { Feedback, EthosFeedbackItem } from '../types';
import { EthosIcon, PathosIcon, LogosIcon } from './icons/RhetoricIcons';

const PhronesisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75zM12 21.75c-4.237 0-7.82-2.693-9.358-6.425a.75.75 0 01.358-.933l1.838-.918a.75.75 0 01.933.358A6.23 6.23 0 0012 18.75c1.98 0 3.753-.9 4.992-2.333a.75.75 0 01.933-.358l1.838.918a.75.75 0 01.358.933A10.457 10.457 0 0112 21.75z" /></svg>
);

const AreteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>
);

const EunoiaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12zM15 9a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const FeedbackExample: React.FC<{ before: string; after: string }> = ({ before, after }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
         <div className="bg-red-100/50 dark:bg-red-900/20 p-3 rounded-md border-l-4 border-red-400 dark:border-red-600">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">ANTES</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{before}"</p>
        </div>
        <div className="bg-green-100/50 dark:bg-green-900/20 p-3 rounded-md border-l-4 border-green-500 dark:border-green-600">
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">DESPUÉS</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{after}"</p>
        </div>
    </div>
);

const FeedbackCard: React.FC<{ title: string; item: { advice: string; example: { before: string; after: string } }; icon: React.ReactNode }> = ({ title, item, icon }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{title}</h4>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{item.advice}</p>
        <div>
            <h5 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Ejemplo Práctico:</h5>
            <FeedbackExample before={item.example.before} after={item.example.after} />
        </div>
    </div>
);

const EthosFeedbackCard: React.FC<{ item: Feedback['ethos'] }> = ({ item }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <EthosIcon className="h-7 w-7 text-rhetoric-ethos" />
            <h4 className="font-semibold text-xl text-slate-800 dark:text-slate-100">Ethos (Credibilidad)</h4>
        </div>
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-rhetoric-ethos pt-1"><PhronesisIcon className="h-5 w-5"/></div>
                <div>
                    <h5 className="font-semibold text-slate-700 dark:text-slate-200">Frónesis (Sabiduría Práctica)</h5>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{item.phronesis.advice}</p>
                    <FeedbackExample before={item.phronesis.example.before} after={item.phronesis.example.after} />
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-rhetoric-ethos pt-1"><AreteIcon className="h-5 w-5"/></div>
                 <div>
                    <h5 className="font-semibold text-slate-700 dark:text-slate-200">Areté (Integridad)</h5>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{item.arete.advice}</p>
                    <FeedbackExample before={item.arete.example.before} after={item.arete.example.after} />
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-rhetoric-ethos pt-1"><EunoiaIcon className="h-5 w-5"/></div>
                <div>
                    <h5 className="font-semibold text-slate-700 dark:text-slate-200">Eunoía (Benevolencia)</h5>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{item.eunoia.advice}</p>
                    <FeedbackExample before={item.eunoia.example.before} after={item.eunoia.example.after} />
                </div>
            </div>
        </div>
    </div>
);

interface FeedbackSectionProps {
  feedback: Feedback;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedback }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="text-xl font-bold mb-4">Feedback Detallado</h3>
       <div className="space-y-4">
            <EthosFeedbackCard item={feedback.ethos} />
            <FeedbackCard title="Pathos (Emoción)" item={feedback.pathos} icon={<PathosIcon className="h-6 w-6 text-rhetoric-pathos" />} />
            <FeedbackCard title="Logos (Lógica)" item={feedback.logos} icon={<LogosIcon className="h-6 w-6 text-rhetoric-logos" />} />
       </div>
    </div>
  );
};

export default FeedbackSection;
