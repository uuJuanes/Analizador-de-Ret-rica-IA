import React from 'react';
import { Achievement, AchievementId } from '../../types';
import { ALL_ACHIEVEMENTS } from '../../config/achievements';

interface AchievementsListProps {
  unlockedIds: Set<AchievementId>;
}

const AchievementItem: React.FC<{ achievement: Achievement; isUnlocked: boolean }> = ({ achievement, isUnlocked }) => {
  const Icon = achievement.icon;
  return (
    <div className={`flex items-center gap-4 transition-opacity duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isUnlocked ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-slate-200 dark:bg-slate-800'}`}>
        <Icon className={`h-6 w-6 ${isUnlocked ? 'text-amber-500' : 'text-slate-500'}`} />
      </div>
      <div>
        <h5 className={`font-semibold text-sm ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{achievement.name}</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400">{achievement.description}</p>
      </div>
    </div>
  );
};


const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedIds }) => {
  return (
    <div>
        <h4 className="text-lg font-bold mb-3">Logros</h4>
        <div className="space-y-4">
            {ALL_ACHIEVEMENTS.map((achievement) => (
                <AchievementItem 
                    key={achievement.id} 
                    achievement={achievement} 
                    isUnlocked={unlockedIds.has(achievement.id)} 
                />
            ))}
        </div>
    </div>
  );
};

export default AchievementsList;
