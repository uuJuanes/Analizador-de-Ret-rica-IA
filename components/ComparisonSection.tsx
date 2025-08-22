import React from 'react';
import { ComparisonAnalysis, PersuasionScores } from '../types';

interface ComparisonSectionProps {
  comparison: ComparisonAnalysis;
  currentScores: PersuasionScores;
}

const ImprovementIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
);

const ProgressDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
    </svg>
);

const WeaknessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.528 9.528a1.5 1.5 0 00-2.122 0l-1.06 1.06a1.5 1.5 0 000 2.122l1.06 1.06a1.5 1.5 0 002.122 0l1.06-1.06a1.5 1.5 0 000-2.122l-1.06-1.06zM15.935 9.528a1.5 1.5 0 00-2.122 0l-1.06 1.06a1.5 1.5 0 000 2.122l1.06 1.06a1.5 1.5 0 002.122 0l1.06-1.06a1.5 1.5 0 000-2.122l-1.06-1.06z" />
    </svg>
);

const StrategyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);


const ComparisonCard: React.FC<{ title: string; text: string | React.ReactNode; icon: React.ReactNode; color: 'green' | 'amber' | 'blue' }> = ({ title, text, icon, color }) => {
    const colorClasses = {
        green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };

    return (
        <div className={`p-4 rounded-lg flex items-start gap-4 ${colorClasses[color]}`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{text}</div>
            </div>
        </div>
    );
};


const ComparisonSection: React.FC<ComparisonSectionProps> = ({ comparison, currentScores }) => {
  const { averagePreviousScores } = comparison;

  const getAverage = (scores: PersuasionScores) => (scores.presuasion + scores.ethos + scores.pathos + scores.logos) / 4;

  const prevAvg = getAverage(averagePreviousScores);
  const currentAvg = getAverage(currentScores);

  let progress = 0;
  if (prevAvg > 0) {
    progress = ((currentAvg - prevAvg) / prevAvg) * 100;
  } else if (currentAvg > 0) {
    progress = 100; // From 0 to >0 is a big improvement
  }
  
  const isPositive = progress >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="text-xl font-bold mb-4">Evolución y Comparativa</h3>
      <div className="space-y-4">
        <ComparisonCard
            title="Progreso General"
            text={
                <p>
                    Tu puntuación promedio {isPositive ? 'mejoró' : 'disminuyó'} en un <strong className={`font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{Math.abs(progress).toFixed(0)}%</strong> en comparación con guiones anteriores.
                </p>
            }
            icon={isPositive ? <ImprovementIcon className="h-5 w-5 text-green-500" /> : <ProgressDownIcon className="h-5 w-5 text-amber-500" />}
            color={isPositive ? "green" : "amber"}
        />
        <ComparisonCard 
            title="Mejora Clave"
            text={comparison.keyImprovement}
            icon={<ImprovementIcon className="h-5 w-5 text-green-500" />}
            color="green"
        />
         <ComparisonCard 
            title="Punto Débil Recurrente"
            text={comparison.recurringWeakness}
            icon={<WeaknessIcon className="h-5 w-5 text-amber-500" />}
            color="amber"
        />
         <ComparisonCard 
            title="Consejo Estratégico"
            text={comparison.strategicAdvice}
            icon={<StrategyIcon className="h-5 w-5 text-blue-500" />}
            color="blue"
        />
      </div>
    </div>
  );
};

export default ComparisonSection;
