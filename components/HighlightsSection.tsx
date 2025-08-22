import React from 'react';
import { Highlight } from '../types';

interface HighlightsSectionProps {
  highlights: Highlight[];
}

const getTypeStyles = (type: 'ethos' | 'pathos' | 'logos' | 'presuasion') => {
  switch (type) {
    case 'ethos':
      return {
        tag: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
        border: 'border-rhetoric-ethos',
      };
    case 'pathos':
      return {
        tag: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-300',
        border: 'border-rhetoric-pathos',
      };
    case 'logos':
      return {
        tag: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
        border: 'border-rhetoric-logos',
      };
    case 'presuasion':
        return {
            tag: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
            border: 'border-rhetoric-presuasion',
        };
    default:
      return {
        tag: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
        border: 'border-slate-500',
      };
  }
};

const HighlightsSection: React.FC<HighlightsSectionProps> = ({ highlights }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Frases Clave</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Frases de tu guion que ejemplifican cada pilar de la persuasión.</p>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {highlights.length > 0 ? (
          highlights.map((highlight, index) => {
            const styles = getTypeStyles(highlight.type);
            return (
              <div key={index} className={`p-3 border-l-4 ${styles.border} bg-slate-100 dark:bg-slate-800/50 rounded-r-md`}>
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{highlight.text}"</p>
                  <span className={`ml-3 text-xs font-medium px-2.5 py-0.5 rounded-full ${styles.tag} capitalize flex-shrink-0`}>
                    {highlight.type}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{highlight.explanation}</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">La IA no destacó ninguna frase específica.</p>
        )}
      </div>
    </div>
  );
};

export default HighlightsSection;
