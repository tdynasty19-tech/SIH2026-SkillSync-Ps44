import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '../../services/assessmentService';
import { AssessmentResult, SubmitAnswerItem } from '../../types/assessment.types';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Trophy,
  XCircle, RotateCcw,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ── Timer ─────────────────────────────────────────────────────────────────────
const useTimer = (initialSeconds: number, onExpire: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (initialSeconds <= 0) return;
    const id = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1 && !expiredRef.current) {
          expiredRef.current = true;
          clearInterval(id);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [initialSeconds]);

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const pct = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;
  return { seconds, fmt, pct };
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => (
  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
    <div
      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);

// ── Result Screen ─────────────────────────────────────────────────────────────
const ResultScreen: React.FC<{ result: AssessmentResult; onRetry: () => void }> = ({ result, onRetry }) => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className={cn('w-24 h-24 rounded-full flex items-center justify-center mb-6', result.passed ? 'bg-green-100' : 'bg-red-100')}>
        {result.passed
          ? <Trophy className="w-12 h-12 text-green-600" />
          : <XCircle className="w-12 h-12 text-red-500" />}
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">
        {result.passed ? '🎉 You Passed!' : 'Not Quite'}
      </h2>
      <p className="text-slate-500 mb-8 max-w-sm">
        {result.passed
          ? `Great job on ${result.assessmentTitle}. Your skill has been verified.`
          : `You scored ${result.percentage}% — you need ${result.passingScore}% to pass. Keep practising!`}
      </p>

      {/* Score card */}
      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{result.percentage}%</p>
          <p className="text-xs text-slate-500 mt-1">Score</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-2xl font-bold text-slate-800">{result.score}</p>
          <p className="text-xs text-slate-500 mt-1">Points</p>
        </div>
        <div className={cn('p-4 rounded-xl shadow-sm border', result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
          <p className={cn('text-2xl font-bold', result.passed ? 'text-green-600' : 'text-red-500')}>
            {result.passed ? '✓' : '✗'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{result.passed ? 'Passed' : 'Failed'}</p>
        </div>
      </div>

      {result.passed && (
        <div className="mb-6 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-sm font-medium">
          🏆 Skill level awarded: <strong>{result.level}</strong>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw className="w-4 h-4 mr-2" />Try Again
        </Button>
        <Button onClick={() => navigate('/student/assessments')}>
          Back to Assessments
        </Button>
      </div>
    </motion.div>
  );
};

// ── Main Test Runner ──────────────────────────────────────────────────────────
export const SkillAssessmentTestPage: React.FC = () => {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // questionId → answer string
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const numAttemptId = Number(attemptId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['assessment-attempt', numAttemptId],
    queryFn: () => assessmentService.getAttempt(numAttemptId),
    enabled: !isNaN(numAttemptId) && numAttemptId > 0,
    staleTime: Infinity, // don't re-fetch during a test
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { answers: SubmitAnswerItem[] }) =>
      assessmentService.submitAttempt(numAttemptId, payload),
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['assessments'] });
      qc.invalidateQueries({ queryKey: ['student', 'skills'] });
      qc.invalidateQueries({ queryKey: ['student', 'skill-gaps'] });
      qc.invalidateQueries({ queryKey: ['student', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['student', 'assessment-attempts'] });
    },
    onError: (err: any) => {
      setSubmitError(err.message || 'Failed to submit. Please try again.');
    },
  });

  const questions = data?.questions ?? [];
  const attempt = data?.attempt;
  const totalSeconds = (attempt as any)?.assessment?.durationMinutes
    ? (attempt as any).assessment.durationMinutes * 60
    : questions.length * 60; // fallback: 1 min per question

  const handleTimeExpire = useCallback(() => {
    if (!submitted && !submitMutation.isPending) {
      handleSubmit(true);
    }
  }, [answers, submitted]);

  const { fmt: timerFmt, pct: timerPct } = useTimer(
    isLoading ? 0 : totalSeconds,
    handleTimeExpire
  );

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).filter(k => answers[Number(k)]?.trim()).length;

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async (forced = false) => {
    if (submitMutation.isPending) return;
    const validAnswers: SubmitAnswerItem[] = questions
      .filter(q => answers[q.id] && answers[q.id].trim().length > 0)
      .map(q => ({
        questionId: q.id,
        answer: answers[q.id].trim(),
      }));

    if (validAnswers.length === 0) {
      setSubmitError('Please answer at least one question before submitting.');
      return;
    }

    if (!forced && validAnswers.length < questions.length) {
      const proceed = window.confirm(
        `You have answered ${validAnswers.length} of ${questions.length} questions. Unanswered questions will receive 0 marks. Submit anyway?`
      );
      if (!proceed) return;
    }

    setSubmitError(null);
    await submitMutation.mutateAsync({ answers: validAnswers });
  };

  // Already-completed attempt — redirect
  useEffect(() => {
    if (attempt && (attempt as any).status === 'COMPLETED') {
      // Navigate back; user shouldn't re-take a completed attempt
      navigate('/student/assessments', { replace: true });
    }
  }, [attempt]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load assessment</h2>
        <p className="text-slate-500 mb-6">{(error as Error)?.message || 'The attempt could not be found.'}</p>
        <Button variant="outline" onClick={() => navigate('/student/assessments')}>Back to Assessments</Button>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ResultScreen result={result} onRetry={() => navigate('/student/assessments')} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-slate-500">This assessment has no questions yet.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/student/assessments')}>Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-600">Question {currentIndex + 1}</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-500">{totalQ}</span>
          </div>
          <ProgressBar value={currentIndex + 1} max={totalQ} />
        </div>
        {/* Timer */}
        <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg',
          timerPct < 20 ? 'bg-red-100 text-red-600 animate-pulse' : timerPct < 40 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700')}>
          <Clock className="w-5 h-5" />{timerFmt}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span><span className="font-semibold text-indigo-600">{answeredCount}</span> / {totalQ} answered</span>
        {answeredCount > 0 && <span className="text-green-600 font-medium">{Math.round((answeredCount / totalQ) * 100)}% complete</span>}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
              {currentIndex + 1}
            </span>
            <p className="text-slate-800 font-medium leading-relaxed text-base">{currentQ.questionText || currentQ.question}</p>
          </div>

          {/* Options */}
          {(currentQ.questionType === 'MULTIPLE_CHOICE' || currentQ.questionType === 'SINGLE_CHOICE') && (
            <div className="space-y-3">
              {currentQ.options.map((opt: string, idx: number) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ.id, opt)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 flex items-center gap-3 group',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700'
                    )}
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'
                    )}>
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Short Answer */}
          {currentQ.questionType === 'SHORT_ANSWER' && (
            <textarea
              rows={4}
              value={answers[currentQ.id] ?? ''}
              onChange={e => handleAnswer(currentQ.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          )}

          {/* Coding */}
          {currentQ.questionType === 'CODING' && (
            <textarea
              rows={8}
              value={answers[currentQ.id] ?? ''}
              onChange={e => handleAnswer(currentQ.id, e.target.value)}
              placeholder="Write your code here..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-950 text-green-400"
            />
          )}

          {/* Points */}
          <p className="text-xs text-slate-400 mt-3 text-right">{currentQ.points} point{currentQ.points !== 1 ? 's' : ''}</p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />Previous
        </Button>

        {/* Question dot navigation */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              title={`Question ${i + 1}${answers[q.id] ? ' (answered)' : ''}`}
              className={cn(
                'w-7 h-7 rounded-md text-xs font-semibold transition-colors',
                i === currentIndex ? 'bg-indigo-600 text-white' :
                answers[q.id] ? 'bg-green-100 text-green-700 border border-green-300' :
                'bg-slate-100 text-slate-500 hover:bg-slate-200'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIndex < totalQ - 1 ? (
          <Button onClick={() => setCurrentIndex(i => Math.min(totalQ - 1, i + 1))}>
            Next<ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => handleSubmit()}
            isLoading={submitMutation.isPending}
            disabled={submitMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />Submit
          </Button>
        )}
      </div>

      {submitError && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />{submitError}
        </div>
      )}

      {/* Final submit bar when all answered */}
      {answeredCount === totalQ && !submitted && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">All questions answered!</span>
          </div>
          <Button
            onClick={() => handleSubmit()}
            isLoading={submitMutation.isPending}
            disabled={submitMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit Assessment
          </Button>
        </div>
      )}
    </div>
  );
};

export default SkillAssessmentTestPage;