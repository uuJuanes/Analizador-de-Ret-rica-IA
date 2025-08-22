import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PersuasionScores } from '../types';

interface ResultsChartProps {
  scores: PersuasionScores;
  comparisonScores?: PersuasionScores;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ scores, comparisonScores }) => {
  const data = [
    { subject: 'Pre-suasión', current: scores.presuasion, previous: comparisonScores?.presuasion, fullMark: 100 },
    { subject: 'Ethos', current: scores.ethos, previous: comparisonScores?.ethos, fullMark: 100 },
    { subject: 'Pathos', current: scores.pathos, previous: comparisonScores?.pathos, fullMark: 100 },
    { subject: 'Logos', current: scores.logos, previous: comparisonScores?.logos, fullMark: 100 },
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
            <radialGradient id="colorUv">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
            </radialGradient>
          </defs>
          <PolarGrid stroke="var(--recharts-grid-color)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--recharts-text-color)', fontSize: 14 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'var(--recharts-text-color)', fontSize: 10 }} />
          <Radar 
            name="Actual" 
            dataKey="current" 
            stroke="#4f46e5" 
            fill="url(#colorUv)" 
            strokeWidth={2}
          />
          {comparisonScores && (
            <Radar 
              name="Promedio Anterior" 
              dataKey="previous" 
              stroke="#9ca3af" // slate-400
              fill="transparent" 
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--recharts-tooltip-bg)',
              border: '1px solid var(--recharts-tooltip-border)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: 'var(--recharts-text-color)', fontWeight: 'bold' }}
          />
          {comparisonScores && <Legend wrapperStyle={{fontSize: "12px"}} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;