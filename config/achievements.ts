import { Achievement } from '../types';
import { FirstAnalysisIcon, ConstantAnalystIcon, MasterPersuaderIcon, StreakIcon } from '../components/icons/AchievementIcons';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_ANALYSIS',
    name: 'Rompiendo el Hielo',
    description: 'Has completado tu primer análisis. ¡Este es el comienzo de tu maestría!',
    icon: FirstAnalysisIcon,
  },
  {
    id: 'FIVE_ANALYSES',
    name: 'Analista Constante',
    description: '¡Cinco análisis completados! La práctica constante es la clave del éxito.',
    icon: ConstantAnalystIcon,
  },
  {
    id: 'MASTER_PERSUADER',
    name: 'Maestro de la Persuasión',
    description: '¡Felicidades! Has superado una puntuación de 90 en una de las métricas.',
    icon: MasterPersuaderIcon,
  },
  {
    id: 'STREAK_3_DAYS',
    name: 'En la Zona',
    description: '¡Racha de 3 días! Has usado la aplicación por tres días consecutivos.',
    icon: StreakIcon,
  },
];
