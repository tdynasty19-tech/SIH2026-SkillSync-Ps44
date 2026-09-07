import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { Assessment, AssessmentAttempt } from '../../types/assessment.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Award,
  RotateCcw,
  Play,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
  advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  expert: 'bg-rose-50 text-rose-700 border-rose-200',
};

interface AssessmentCardProps {
  assessment: Assessment;
  attempt?: AssessmentAttempt;
  onStart: (id: number) => void;
  isStarting: boolean;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  attempt,
  onStart,
  isStarting,
}) => {
  const isPassed = attempt?.status === 'COMPLETED' && Number(attempt.percentage) >= Number(assessment.passingScore);
  const isInProgress = attempt?.status === 'IN_PROGRESS';
  const isFailed = attempt?.status === 'COMPLETED' && Number(attempt.percentage) < Number(assessment.passingScore);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className={cn(
        'hover:shadow-lg transition-all duration-200 h-full flex flex-col border',
        isPassed ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/20 to-white' : 'border-slate-200'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 capitalize',
                  DIFFICULTY_COLORS[assessment.difficulty?.toLowerCase()] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                )}>
                  {assessment.difficulty}
                </span>
                {isPassed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified • {attempt.percentage}%
                  </span>
                )}
                {isInProgress && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-600" />
                    In Progress
                  </span>
                )}
              </div>
              <CardTitle className="text-base font-bold text-slate-900 leading-snug">{assessment.title}</CardTitle>
            </div>
          </div>
          {assessment.skill && (
            <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs text-indigo-700 font-medium">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              Skill: {assessment.skill.name}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between gap-4">
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {assessment.description || `Evaluate and benchmark your core ${assessment.skill?.name || 'technical'} competency.`}
          </p>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-base font-bold text-slate-800">{assessment.totalQuestions}</p>
              <p className="text-[11px] text-slate-500">Questions</p>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-base font-bold text-slate-800">{assessment.durationMinutes}m</p>
              <p className="text-[11px] text-slate-500">Duration</p>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-base font-bold text-slate-800">{assessment.passingScore}%</p>
              <p className="text-[11px] text-slate-500">To Pass</p>
            </div>
          </div>

          <Button
            className={cn(
              'w-full shadow-sm font-medium text-sm',
              isPassed ? 'bg-slate-900 hover:bg-slate-800 text-white' :
              isInProgress ? 'bg-amber-600 hover:bg-amber-700 text-white' :
              isFailed ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
            )}
            onClick={() => onStart(assessment.id)}
            isLoading={isStarting}
            disabled={isStarting}
          >
            {isInProgress ? (
              <>
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Resume Assessment
              </>
            ) : isPassed ? (
              <>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Retake / Practice
              </>
            ) : isFailed ? (
              <>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Retake Assessment
              </>
            ) : (
              <>
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Start Assessment
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SkillAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [starting, setStarting] = useState<number | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['assessments', { difficulty }],
    queryFn: () => assessmentService.getAssessments({ difficulty: difficulty || undefined, limit: 50 }),
    staleTime: 30_000,
  });

  const { data: attemptsData } = useQuery({
    queryKey: ['student', 'assessment-attempts'],
    queryFn: () => assessmentService.getMyAttempts({ limit: 50 }),
    staleTime: 30_000,
  });

  // Map latest attempt by assessmentId
  const latestAttemptMap = React.useMemo(() => {
    const map = new Map<number, AssessmentAttempt>();
    const attempts = attemptsData?.attempts ?? [];
    for (const att of attempts) {
      if (!map.has(att.assessmentId)) {
        map.set(att.assessmentId, att);
      }
    }
    return map;
  }, [attemptsData]);

  const assessments: Assessment[] = (data?.assessments ?? []).filter(a =>
    search ? (a.title.toLowerCase().includes(search.toLowerCase()) || a.skill?.name?.toLowerCase().includes(search.toLowerCase())) : true
  );

  const handleStart = async (assessmentId: number) => {
    setStarting(assessmentId);
    setStartError(null);
    try {
      const result = await assessmentService.startAttempt(assessmentId);
      navigate(`/student/assessments/${assessmentId}/attempt/${result.attempt.id}`);
    } catch (err: any) {
      setStartError(err.message || 'Failed to start assessment. Please ensure your student profile is active.');
      setStarting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-4 flex-wrap bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-indigo-500/30 rounded-lg backdrop-blur-sm border border-indigo-400/20">
              <Zap className="w-5 h-5 text-indigo-300" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">Official Skill Verification</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Skill Assessments & Certification</h1>
          <p className="text-indigo-200 text-sm mt-1.5 leading-relaxed">
            Take verified industry assessments to earn proof-of-competency badges, power your candidate discovery ranking, and showcase trusted skills to recruiters.
          </p>
        </div>
      </div>

      {startError && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{startError}</div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assessments or skills (e.g. Node.js, SQL, React)..."
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          />
        </div>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all text-slate-700 font-medium"
        >
          <option value="">All Difficulty Levels</option>
          {['beginner', 'intermediate', 'advanced', 'expert'].map(d => (
            <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200/70 rounded-2xl border border-slate-200" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          {(error as Error).message || 'Failed to load assessments.'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && assessments.length === 0 && (
        <Card className="border-dashed border-2 border-indigo-200 bg-indigo-50/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="w-12 h-12 text-indigo-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No assessments found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              {search || difficulty ? 'Try adjusting or clearing your search filters.' : 'Assessments are currently being loaded.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assessment Grid */}
      {!isLoading && assessments.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map(a => (
            <AssessmentCard
              key={a.id}
              assessment={a}
              attempt={latestAttemptMap.get(a.id)}
              onStart={handleStart}
              isStarting={starting === a.id}
            />
          ))}
        </div>
      )}

      {/* My Recent Attempts Table */}
      <MyRecentAttempts />
    </div>
  );
};

const MyRecentAttempts: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'assessment-attempts'],
    queryFn: () => assessmentService.getMyAttempts({ limit: 10 }),
  });

  const attempts = data?.attempts ?? [];
  if (isLoading || attempts.length === 0) return null;

  return (
    <Card className="border-slate-200 shadow-sm mt-8">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-base font-bold text-slate-900">Your Recent Assessment History</CardTitle>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {attempts.length} Attempt{attempts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 p-0">
        {attempts.map((a: any) => {
          const isPassed = a.status === 'COMPLETED' && Number(a.percentage) >= (a.assessment?.passingScore ?? 60);
          return (
            <div key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {a.assessment?.title ?? `Assessment #${a.assessmentId}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>{a.assessment?.skill?.name || 'Technical'}</span>
                  <span>•</span>
                  <span>{a.completedAt ? new Date(a.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'In progress'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {a.status === 'COMPLETED' && (
                  <Badge variant={isPassed ? 'success' : 'danger'} className="text-xs px-2.5 py-1 font-bold">
                    {a.percentage}%
                  </Badge>
                )}
                <span className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full border',
                  isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  a.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                )}>
                  {isPassed ? 'Passed' : a.status === 'IN_PROGRESS' ? 'In Progress' : 'Failed'}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SkillAssessmentPage;
