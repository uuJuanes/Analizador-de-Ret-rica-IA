import React, { useEffect, useState } from 'react';
import { Achievement } from '../../types';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Trigger fade-in
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow fade-out animation to complete
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);
  
  const Icon = achievement.icon;

  return (
    <div 
      className={`fixed bottom-5 right-5 w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 ease-in-out transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Icon className="h-7 w-7 text-amber-500" />
        </div>
        <div className="flex-1">
            <p className="font-semibold text-amber-600 dark:text-amber-400">¡Logro Desbloqueado!</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{achievement.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{achievement.description}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;
