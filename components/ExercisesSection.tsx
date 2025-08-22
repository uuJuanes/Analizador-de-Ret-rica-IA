import React from 'react';
import { Exercise } from '../types';
import { EthosIcon, PathosIcon, LogosIcon, PresuasionIcon } from './icons/RhetoricIcons';

interface ExercisesSectionProps {
  exercises: Exercise[];
}

const getIconForType = (type: 'ethos' | 'pathos' | 'logos' | 'presuasion') => {
  switch (type) {
    case 'ethos':
      return <EthosIcon className="h-5 w-5 text-rhetoric-ethos" />;
    case 'pathos':
      return <PathosIcon className="h-5 w-5 text-rhetoric-pathos" />;
    case 'logos':
      return <LogosIcon className="h-5 w-5 text-rhetoric-logos" />;
    case 'presuasion':
      return <PresuasionIcon className="h-5 w-5 text-rhetoric-presuasion" />;
    default:
      return null;
  }
};

const getBackgroundColorForType = (type: 'ethos' | 'pathos' | 'logos' | 'presuasion') => {
    switch (type) {
      case 'ethos':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50';
      case 'pathos':
        return 'bg-fuchsia-50 dark:bg-fuchsia-900/30 border-fuchsia-200 dark:border-fuchsia-800/50';
      case 'logos':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50';
      case 'presuasion':
        return 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

const ExercisesSection: React.FC<ExercisesSectionProps> = ({ exercises }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="text-xl font-bold mb-4">Ejercicios Personalizados</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Completa estos ejercicios prácticos para perfeccionar tu técnica de ventas.</p>
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getBackgroundColorForType(exercise.type)}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getIconForType(exercise.type)}</div>
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{exercise.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{exercise.description}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExercisesSection;
