import React, { useState, useEffect } from 'react';
import { AnalysisResult, RolePlayAnalysisResult, UserStats, CaseStudy } from '../types';
import AchievementsList from './gamification/AchievementsList';

interface HistoryPanelProps {
  history: AnalysisResult[];
  rolePlayHistory: RolePlayAnalysisResult[];
  caseStudyHistory: CaseStudy[];
  userStats: UserStats;
  onSelect: (result: AnalysisResult | RolePlayAnalysisResult | CaseStudy, type: 'script' | 'roleplay' | 'casestudy') => void;
  onClear: (type: 'script' | 'roleplay' | 'casestudy') => void;
  currentResultId?: string | null;
  currentRolePlayResultId?: string | null;
  currentCaseStudyId?: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
    history, 
    rolePlayHistory, 
    caseStudyHistory,
    userStats, 
    onSelect, 
    onClear, 
    currentResultId, 
    currentRolePlayResultId,
    currentCaseStudyId
}) => {
  const [activeTab, setActiveTab] = useState<'guiones' | 'roleplays' | 'escenarios'>('guiones');
  const [activeScriptCategory, setActiveScriptCategory] = useState<string | null>(null);

  const groupedHistory = history.reduce((acc, item) => {
    const category = item.category || 'Sin Categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AnalysisResult[]>);

  const scriptCategories = Object.keys(groupedHistory);

  useEffect(() => {
    if (scriptCategories.length > 0 && (!activeScriptCategory || !scriptCategories.includes(activeScriptCategory))) {
      setActiveScriptCategory(scriptCategories[0]);
    } else if (scriptCategories.length === 0) {
      setActiveScriptCategory(null);
    }
  }, [scriptCategories, activeScriptCategory]);

  const renderNoHistory = (type: string) => (
     <div className="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tus {type} aparecerán aquí.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Historial y Logros</h3>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('guiones')}
                    className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'guiones'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Guiones ({history.length})
                </button>
                 <button
                    onClick={() => setActiveTab('roleplays')}
                    className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'roleplays'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Role-Plays ({rolePlayHistory.length})
                </button>
                 <button
                    onClick={() => setActiveTab('escenarios')}
                    className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'escenarios'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Escenarios ({caseStudyHistory.length})
                </button>
            </nav>
        </div>

        <div className="min-h-[200px]">
            {activeTab === 'guiones' && (
                <>
                    {history.length === 0 ? renderNoHistory('análisis de guiones') : (
                        <div>
                            <div className="flex justify-end mb-2">
                                <button onClick={() => onClear('script')} className="text-sm text-brand-primary hover:text-brand-dark dark:hover:text-indigo-400 font-medium transition-colors">Limpiar Guiones</button>
                            </div>
                            <div className="border-b border-slate-200 dark:border-slate-700 mb-2 -mx-2 px-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                {scriptCategories.map((category) => (
                                    <button
                                    key={category}
                                    onClick={() => setActiveScriptCategory(category)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeScriptCategory === category
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300 dark:hover:border-slate-600'
                                    }`}
                                    >
                                    {category}
                                    </button>
                                ))}
                                </nav>
                            </div>
                            <ul className="space-y-1 mt-3 max-h-60 overflow-y-auto">
                                {activeScriptCategory && groupedHistory[activeScriptCategory]?.map((item) => {
                                const isActive = item.id === currentResultId;
                                return (
                                    <li key={item.id}>
                                    <button
                                        onClick={() => onSelect(item, 'script')}
                                        className={`w-full text-left p-3 rounded-lg transition-colors duration-150 ${
                                        isActive 
                                        ? 'bg-brand-light dark:bg-brand-primary/20 ring-2 ring-brand-primary' 
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={item.title}>
                                        {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {new Date(item.timestamp).toLocaleString('es-ES')}
                                        </p>
                                    </button>
                                    </li>
                                )
                                })}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'roleplays' && (
                <>
                    {rolePlayHistory.length === 0 ? renderNoHistory('role-plays') : (
                        <div>
                            <div className="flex justify-end mb-2">
                                <button onClick={() => onClear('roleplay')} className="text-sm text-brand-primary hover:text-brand-dark dark:hover:text-indigo-400 font-medium transition-colors">Limpiar Role-Plays</button>
                            </div>
                            <ul className="space-y-1 mt-3 max-h-60 overflow-y-auto">
                            {rolePlayHistory.map((item) => {
                                const isActive = item.id === currentRolePlayResultId;
                                return (
                                    <li key={item.id}>
                                    <button onClick={() => onSelect(item, 'roleplay')} className={`w-full text-left p-3 rounded-lg transition-colors duration-150 ${ isActive ? 'bg-brand-light dark:bg-brand-primary/20 ring-2 ring-brand-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800' }`} >
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={item.title}>
                                        {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {new Date(item.timestamp).toLocaleString('es-ES')}
                                        </p>
                                    </button>
                                    </li>
                                )
                                })}
                            </ul>
                        </div>
                    )}
                </>
            )}
            
            {activeTab === 'escenarios' && (
                <>
                    {caseStudyHistory.length === 0 ? renderNoHistory('escenarios') : (
                        <div>
                            <div className="flex justify-end mb-2">
                                <button onClick={() => onClear('casestudy')} className="text-sm text-brand-primary hover:text-brand-dark dark:hover:text-indigo-400 font-medium transition-colors">Limpiar Escenarios</button>
                            </div>
                            <ul className="space-y-1 mt-3 max-h-60 overflow-y-auto">
                            {caseStudyHistory.map((item) => {
                                const isActive = item.id === currentCaseStudyId;
                                return (
                                    <li key={item.id}>
                                    <button onClick={() => onSelect(item, 'casestudy')} className={`w-full text-left p-3 rounded-lg transition-colors duration-150 ${ isActive ? 'bg-brand-light dark:bg-brand-primary/20 ring-2 ring-brand-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800' }`} >
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={item.scenario.problem}>
                                        {item.scenario.problem}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {new Date(item.timestamp).toLocaleString('es-ES')}
                                        </p>
                                    </button>
                                    </li>
                                )
                                })}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            <AchievementsList unlockedIds={userStats.unlockedAchievements} />
        </div>
    </div>
  );
};

export default HistoryPanel;