import React from 'react';

interface TokenUsageIndicatorProps {
  used: number;
  budget: number;
}

const TokenUsageIndicator: React.FC<TokenUsageIndicatorProps> = ({ used, budget }) => {
  if (budget <= 0) {
    return null;
  }

  const percentage = Math.min((used / budget) * 100, 100);
  
  let progressBarColor = 'bg-green-500';
  if (percentage >= 90) {
    progressBarColor = 'bg-red-500';
  } else if (percentage >= 75) {
    progressBarColor = 'bg-amber-500';
  }

  return (
    <div className="w-40 hidden sm:block" title={`Consumo mensual: ${used.toLocaleString('es-ES')} / ${budget.toLocaleString('es-ES')} tokens`}>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-0.5">
        <span>Consumo</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${progressBarColor} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TokenUsageIndicator;