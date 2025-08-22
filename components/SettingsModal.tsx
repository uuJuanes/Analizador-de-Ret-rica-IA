import React, { useState, useEffect } from 'react';
import { UserProfile, ApiKeys, TokenUsageStats } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  tokenUsageStats: TokenUsageStats;
  onSaveTokenStats: (stats: TokenUsageStats) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  onLogout, 
  apiKeys, 
  onSaveKeys,
  tokenUsageStats,
  onSaveTokenStats
}) => {
  const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
  const [localBudget, setLocalBudget] = useState<number>(tokenUsageStats.monthlyBudget);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalKeys(apiKeys);
    setLocalBudget(tokenUsageStats.monthlyBudget);
  }, [apiKeys, tokenUsageStats, isOpen]);

  const handleSave = () => {
    onSaveKeys(localKeys);
    onSaveTokenStats({ ...tokenUsageStats, monthlyBudget: localBudget });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ajustes</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {userProfile && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <img src={userProfile.imageUrl} alt={userProfile.name} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{userProfile.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{userProfile.email}</p>
            </div>
            <button onClick={onLogout} className="ml-auto text-sm font-medium text-red-600 hover:text-red-800 dark:hover:text-red-400">
              Cerrar sesión
            </button>
          </div>
        )}

        <div className="space-y-4">
           <div>
            <label htmlFor="token-budget" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Presupuesto Mensual de Tokens
            </label>
            <input
              id="token-budget"
              type="number"
              value={localBudget}
              onChange={(e) => setLocalBudget(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800"
              placeholder="Ej: 500000"
            />
             <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Define un límite para monitorear tu consumo, especialmente con OpenRouter.</p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
            Gemini funciona sin necesidad de clave. Para usar DeepSeek o ChatGPT, necesitas una clave de <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-medium">OpenRouter</a>.
          </p>
          <div>
            <label htmlFor="deepseek-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Clave API de DeepSeek (via OpenRouter)
            </label>
            <input
              id="deepseek-key"
              type="password"
              value={localKeys.deepseek}
              onChange={(e) => setLocalKeys({ ...localKeys, deepseek: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800"
              placeholder="Pega tu clave de OpenRouter aquí"
            />
          </div>
          <div>
            <label htmlFor="openai-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Clave API de ChatGPT (via OpenRouter)
            </label>
            <input
              id="openai-key"
              type="password"
              value={localKeys.openai}
              onChange={(e) => setLocalKeys({ ...localKeys, openai: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 dark:bg-slate-800"
              placeholder="Pega tu clave de OpenRouter aquí"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${saved ? 'bg-green-600' : 'bg-brand-primary hover:bg-brand-dark'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors`}
          >
            {saved ? '¡Guardado!' : 'Guardar Ajustes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;