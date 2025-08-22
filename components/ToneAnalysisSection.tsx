import React from 'react';
import { ToneAnalysis } from '../types';
import { WpmIcon, FillerWordIcon } from './icons/ToneIcons';

interface ToneAnalysisSectionProps {
  analysis: ToneAnalysis;
}

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-light dark:bg-indigo-500/20 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const ToneAnalysisSection: React.FC<ToneAnalysisSectionProps> = ({ analysis }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 animate-fade-in-up">
      <h3 className="text-xl font-bold mb-4">Análisis Tonal (Audio)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InfoCard 
            icon={<FillerWordIcon className="h-6 w-6 text-brand-primary" />}
            label="Muletillas"
            value={analysis.fillerWordCount}
        />
        <InfoCard 
            icon={<WpmIcon className="h-6 w-6 text-brand-primary" />}
            label="Velocidad del Habla"
            value={`${analysis.wordsPerMinute} PPM`}
        />
      </div>
       <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Consejo de Elocución</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{analysis.feedback}</p>
        </div>
    </div>
  );
};

export default ToneAnalysisSection;