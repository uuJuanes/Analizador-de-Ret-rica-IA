import React from 'react';
import { AiProvider } from '../types';

interface ProviderSelectorProps {
  provider: AiProvider;
  onChange: (provider: AiProvider) => void;
  disabled: boolean;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ provider, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="ai-provider" className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        Motor IA:
      </label>
      <select
        id="ai-provider"
        value={provider}
        onChange={(e) => onChange(e.target.value as AiProvider)}
        disabled={disabled}
        className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-1.5 pl-3 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:opacity-50"
      >
        <option value="gemini">Gemini</option>
        <option value="deepseek">DeepSeek</option>
        <option value="openai">ChatGPT</option>
      </select>
    </div>
  );
};

export default ProviderSelector;