import React from 'react';
import { MatchBreakdown } from '../../types/matching.types';
import { CheckCircle, AlertCircle, Briefcase, Award, Compass, MapPin } from 'lucide-react';

interface MatchBreakdownCardProps {
  breakdown: MatchBreakdown;
  matchScore: number;
}

export const MatchBreakdownCard: React.FC<MatchBreakdownCardProps> = ({
  breakdown,
  matchScore,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-indigo-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-5">
      {/* Header with Overall Deterministic Score */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            5-Factor Deterministic Match
          </span>
          <h4 className="text-xl font-bold text-white mt-0.5">Role Fit Intelligence</h4>
        </div>
        <div
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border ${getScoreColor(
            matchScore
          )}`}
        >
          <span className="text-2xl font-black">{Math.round(matchScore)}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Overall Fit</span>
        </div>
      </div>

      {/* 5-Factor Score Progress Rows */}
      <div className="space-y-3">
        {/* 1. Skill Match (50%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Skill Match (50% Weight)
            </span>
            <span className="font-semibold text-white">
              {Math.round(breakdown.skillMatch.score)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${getProgressColor(
                breakdown.skillMatch.score
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, breakdown.skillMatch.score))}%` }}
            />
          </div>
        </div>

        {/* 2. Career Alignment (20%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Career Alignment (20% Weight)
            </span>
            <span className="font-semibold text-white">
              {Math.round(breakdown.careerAlignment.score)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${getProgressColor(
                breakdown.careerAlignment.score
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, breakdown.careerAlignment.score))}%` }}
            />
          </div>
          {breakdown.careerAlignment.matchedRole && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Aligned with target goal: <span className="text-blue-300 font-medium">{breakdown.careerAlignment.matchedRole}</span>
            </p>
          )}
        </div>

        {/* 3. Experience Match (10%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Experience Alignment (10% Weight)
            </span>
            <span className="font-semibold text-white">
              {Math.round(breakdown.experience.score)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${getProgressColor(
                breakdown.experience.score
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, breakdown.experience.score))}%` }}
            />
          </div>
        </div>

        {/* 4. Assessment Performance (10%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Assessment & Verification (10% Weight)
            </span>
            <span className="font-semibold text-white">
              {Math.round(breakdown.assessment.score)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${getProgressColor(
                breakdown.assessment.score
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, breakdown.assessment.score))}%` }}
            />
          </div>
        </div>

        {/* 5. Preference Alignment (10%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Preference & Workplace (10% Weight)
            </span>
            <span className="font-semibold text-white">
              {Math.round(breakdown.preference.score)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${getProgressColor(
                breakdown.preference.score
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, breakdown.preference.score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Matched vs Missing Skills Grid */}
      <div className="pt-3 border-t border-slate-800 grid sm:grid-cols-2 gap-3 text-xs">
        {/* Matched Skills */}
        <div className="bg-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Matched Skills ({breakdown.skillMatch.matchedSkills.length})</span>
          </div>
          {breakdown.skillMatch.matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {breakdown.skillMatch.matchedSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-[11px] font-medium"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] italic">No verified skill overlap found</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="bg-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-1 text-amber-400 font-semibold mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missing / Target Skills ({breakdown.skillMatch.missingSkills.length})</span>
          </div>
          {breakdown.skillMatch.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {breakdown.skillMatch.missingSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/50 text-amber-300 text-[11px] font-medium"
                >
                  • {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] italic">Zero skill gaps detected!</p>
          )}
        </div>
      </div>
    </div>
  );
};
