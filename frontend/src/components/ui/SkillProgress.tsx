import React from 'react';
import { cn } from '../../utils/cn';

interface SkillProgressProps {
  name: string;
  currentLevel: number;
  requiredLevel?: number;
  className?: string;
}

export const SkillProgress = ({ name, currentLevel, requiredLevel, className }: SkillProgressProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-end mb-1 text-sm">
        <span className="font-medium text-slate-700">{name}</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-indigo-600 font-semibold">{currentLevel}%</span>
          {requiredLevel !== undefined && (
            <span className="text-slate-500">/ {requiredLevel}% req</span>
          )}
        </div>
      </div>
      <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        {requiredLevel !== undefined && (
          <div 
            className="absolute top-0 bottom-0 border-r-2 border-slate-400 border-dashed z-10"
            style={{ left: `${requiredLevel}%` }}
            title={`Required: ${requiredLevel}%`}
          />
        )}
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-in-out",
            requiredLevel && currentLevel >= requiredLevel ? "bg-green-500" : "bg-indigo-600"
          )}
          style={{ width: `${currentLevel}%` }}
        />
      </div>
    </div>
  );
};
