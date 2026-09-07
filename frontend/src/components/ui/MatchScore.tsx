import React from 'react';
import { cn } from '../../utils/cn';

interface MatchScoreProps {
  score: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchScore = ({ score, className, size = 'md' }: MatchScoreProps) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500 stroke-green-500';
    if (s >= 60) return 'text-yellow-500 stroke-yellow-500';
    return 'text-red-500 stroke-red-500';
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return 'bg-green-50';
    if (s >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const sizes = {
    sm: { wrapper: 'w-10 h-10', text: 'text-xs', stroke: 3 },
    md: { wrapper: 'w-14 h-14', text: 'text-sm', stroke: 4 },
    lg: { wrapper: 'w-20 h-20', text: 'text-xl', stroke: 6 },
  };

  const s = sizes[size];
  const radius = 50 - s.stroke;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center rounded-full", s.wrapper, getBgColor(score), className)}>
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius + "%"}
          className="stroke-slate-200 fill-transparent"
          strokeWidth={s.stroke}
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius + "%"}
          className={cn("fill-transparent transition-all duration-1000 ease-in-out", getColor(score).split(' ')[1])}
          strokeWidth={s.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("font-bold", getColor(score).split(' ')[0], s.text)}>
        {score}%
      </span>
    </div>
  );
};
