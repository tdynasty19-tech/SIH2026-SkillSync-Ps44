import React from 'react';
import { Loader2 } from 'lucide-react';

export const RouteLoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 text-center animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <Loader2 className="w-6 h-6 text-indigo-600 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">Loading module...</p>
      <p className="text-xs text-slate-400 mt-1">Skill Intelligence & Collaboration Portal</p>
    </div>
  );
};

export default RouteLoadingSpinner;
