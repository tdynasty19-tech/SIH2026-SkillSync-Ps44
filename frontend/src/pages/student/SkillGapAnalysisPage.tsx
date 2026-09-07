import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { careerService } from '../../services/careerService';
import { aiService } from '../../services/aiService';
import { SkillGap, SkillGapPriority } from '../../types/skill.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  Target, RefreshCw, AlertTriangle, CheckCircle2, Award, ChevronRight,
  TrendingUp, Sparkles, AlertCircle, ArrowRight, Compass, ChevronDown, Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ── Priority Badge Helper ─────────────────────────────────────────────────────
const PRIORITY_BADGES: Record<SkillGapPriority, { label: string; badgeClass: string }> = {
  CRITICAL: { label: 'Critical Gap', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  HIGH: { label: 'High Priority', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  MEDIUM: { label: 'Medium Priority', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  LOW: { label: 'Low / Aligned', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const SkillGapAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  // 1. Fetch Student's Current Active Career Goals
  const { data: currentInterests = [] } = useQuery({
    queryKey: ['student', 'career-interests'],
    queryFn: () => careerService.getStudentCareerInterests(),
    staleTime: 30_000,
  });

  // 2. Fetch Catalog Career Roles for direct selection
  const { data: rolesData } = useQuery({
    queryKey: ['catalog', 'career-roles'],
    queryFn: () => careerService.getCareerRoles({ limit: 50 }),
    staleTime: 120_000,
  });

  const catalogRoles = rolesData?.careerRoles || [];
  const activeInterest = currentInterests[0];
  const activeTargetRoleId = activeInterest?.careerRoleId;

  // 3. Fetch Skill Gaps
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['student', 'skill-gaps'],
    queryFn: () => studentService.getSkillGaps({ limit: 100 }),
    staleTime: 30_000,
  });

  // 4. Fetch AI Gap Assistance
  const { data: aiAssistance } = useQuery({
    queryKey: ['student', 'ai-skill-gap-assistance'],
    queryFn: () => aiService.getSkillGapAssistance(),
    staleTime: 60_000,
  });

  // 5. Recalculate Mutation
  const recalculateMutation = useMutation({
    mutationFn: () => studentService.recalculateSkillGaps(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', 'skill-gaps'] });
      qc.invalidateQueries({ queryKey: ['student', 'ai-skill-gap-assistance'] });
      qc.invalidateQueries({ queryKey: ['student', 'dashboard'] });
    },
  });

  // 6. Switch Target Role Mutation
  const switchTargetRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const current = await careerService.getStudentCareerInterests();
      for (const item of current) {
        if (item.careerRoleId !== roleId) {
          try {
            await careerService.deleteCareerInterest(item.id);
          } catch (_) {}
        }
      }
      const existing = current.find((c) => c.careerRoleId === roleId);
      if (!existing) {
        await careerService.addCareerInterest(roleId, 1);
      }
    },
    onSuccess: () => {
      setIsRoleDropdownOpen(false);
      qc.invalidateQueries({ queryKey: ['student', 'career-interests'] });
      qc.invalidateQueries({ queryKey: ['student', 'skill-gaps'] });
      qc.invalidateQueries({ queryKey: ['student', 'ai-skill-gap-assistance'] });
      qc.invalidateQueries({ queryKey: ['student', 'career-recommendations'] });
      qc.invalidateQueries({ queryKey: ['student', 'dashboard'] });
    },
  });

  const rawGaps: SkillGap[] = data?.skillGaps ?? [];

  // Filtered gaps
  const gaps = filterPriority === 'ALL'
    ? rawGaps
    : rawGaps.filter(g => g.priority === filterPriority);

  // Group / Find targeted role
  const targetRoleTitle = activeInterest?.careerRole?.title || rawGaps[0]?.targetRole?.title || 'Target Career Profile';

  // Format data for Recharts Radar
  const radarData = rawGaps.map(g => ({
    subject: g.skill?.name || `Skill #${g.skillId}`,
    MyLevel: Number(g.currentScore) || 0,
    Required: Number(g.requiredScore) || 0,
    fullMark: 100,
  }));

  // KPI Metrics
  const totalGaps = rawGaps.length;
  const criticalCount = rawGaps.filter(g => g.priority === 'CRITICAL' || g.priority === 'HIGH').length;
  const resolvedCount = rawGaps.filter(g => g.status === 'RESOLVED' || Number(g.gapScore) === 0).length;
  const avgMatch = totalGaps > 0
    ? Math.round(rawGaps.reduce((acc, g) => acc + Math.min(100, (Number(g.currentScore) / Math.max(1, Number(g.requiredScore))) * 100), 0) / totalGaps)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="h-10 bg-slate-200 rounded w-36" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Skill Gap Analysis</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Deterministic comparison of your verified skills against <strong>{targetRoleTitle}</strong> industry benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Target Role Selector Button */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-sm transition-all"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Target Role: <strong className="text-indigo-700">{targetRoleTitle}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Select Target Career Goal</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Switch role to recalculate required skills</p>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5 py-1">
                  {catalogRoles.map((role: any) => {
                    const isSelected = (activeTargetRoleId && role.id === activeTargetRoleId) || role.title === targetRoleTitle;
                    return (
                      <button
                        key={role.id}
                        onClick={() => switchTargetRoleMutation.mutate(role.id)}
                        disabled={switchTargetRoleMutation.isPending}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors',
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <span>{role.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => recalculateMutation.mutate()}
            isLoading={recalculateMutation.isPending || isFetching}
            disabled={recalculateMutation.isPending}
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", (recalculateMutation.isPending || isFetching) && "animate-spin")} />
            Recalculate Gaps
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          {(error as Error).message || 'Failed to load skill gaps. Please verify your student profile is setup.'}
        </div>
      )}

      {/* Empty State */}
      {!error && totalGaps === 0 && (
        <Card className="border-dashed border-2 border-indigo-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8 sm:p-14 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Choose a Target Career Goal</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
                Select a target career profile to benchmark your verified competencies, generate your competency radar, and unlock personalized learning milestones.
              </p>
            </div>

            {/* 1-Click Career Goal Selector in Empty State */}
            {catalogRoles.length > 0 && (
              <div className="w-full max-w-md space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Select Target Goal:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catalogRoles.slice(0, 4).map((role: any) => (
                    <Button
                      key={role.id}
                      variant="outline"
                      className="text-xs justify-start py-2.5 px-3 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800"
                      onClick={() => switchTargetRoleMutation.mutate(role.id)}
                      isLoading={switchTargetRoleMutation.isPending && switchTargetRoleMutation.variables === role.id}
                    >
                      <Target className="w-3.5 h-3.5 mr-1.5 text-indigo-600 flex-shrink-0" />
                      <span className="truncate">{role.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 w-full">
              <Button onClick={() => navigate('/student/career')} className="flex items-center gap-2">
                <Compass className="w-4 h-4" /> Explore Career Roadmap
              </Button>
              <Button variant="outline" onClick={() => navigate('/student/skills')} className="flex items-center gap-2">
                <Award className="w-4 h-4" /> Add My Skills
              </Button>
              <Button variant="outline" onClick={() => navigate('/student/assessments')} className="flex items-center gap-2">
                Take Verified Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content when Gaps exist */}
      {totalGaps > 0 && (
        <>
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Analyzed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalGaps} Skills</p>
                <p className="text-xs text-slate-500 mt-0.5">Benchmarked against role</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Attention Required</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{criticalCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Critical & high priority gaps</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Aligned / Resolved</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Meet or exceed benchmarks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Role Alignment</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{avgMatch}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Average benchmark score</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommended Sequencing & Strategic Advice */}
          {aiAssistance?.recommendedOrder && aiAssistance.recommendedOrder.length > 0 && (
            <Card className="bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white border-indigo-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    AI Recommended Learning Sequence ({aiAssistance.targetRole || targetRoleTitle})
                  </h3>
                  {aiAssistance.fallbackUsed && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium ml-auto">
                      Deterministic Priority Algorithm
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  To achieve the fastest progression toward your target role, master these missing competencies in order:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {aiAssistance.recommendedOrder.map((skillName: string, idx: number) => (
                    <React.Fragment key={idx}>
                      <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-indigo-200/80 text-xs font-semibold text-slate-800 shadow-sm">
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {skillName}
                      </span>
                      {idx < aiAssistance.recommendedOrder.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Radar Chart Card */}
            <Card className="lg:col-span-6 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Skill Competency Radar</span>
                  <span className="text-xs font-normal text-slate-400">0 - 100 pt scale</span>
                </CardTitle>
                <CardDescription>
                  Your current verified level vs industry target for <strong>{targetRoleTitle}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[380px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                      <Radar
                        name="My Verified Level"
                        dataKey="MyLevel"
                        stroke="#4f46e5"
                        fill="#6366f1"
                        fillOpacity={0.45}
                      />
                      <Radar
                        name="Industry Benchmark"
                        dataKey="Required"
                        stroke="#f59e0b"
                        fill="#fbbf24"
                        fillOpacity={0.25}
                      />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gap Breakdown List */}
            <Card className="lg:col-span-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg">Competency Breakdown</CardTitle>
                  {/* Filter tabs */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg transition-all',
                          filterPriority === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <CardDescription>
                  Detailed evaluation of individual skill requirements and deficit scores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {gaps.map((gap) => {
                  const badge = PRIORITY_BADGES[gap.priority] || PRIORITY_BADGES.LOW;
                  const isResolved = gap.status === 'RESOLVED' || Number(gap.gapScore) === 0;

                  return (
                    <div
                      key={gap.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        isResolved ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {gap.skill?.name || `Skill #${gap.skillId}`}
                            </span>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', badge.badgeClass)}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span>Current: <strong className="text-slate-700">{gap.currentLevel || 'Unrated'}</strong> ({gap.currentScore} pts)</span>
                            <span>Target: <strong className="text-indigo-600">{gap.requiredLevel}</strong> ({gap.requiredScore} pts)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            'text-sm font-extrabold',
                            gap.gapScore > 50 ? 'text-red-600' : gap.gapScore > 0 ? 'text-amber-600' : 'text-emerald-600'
                          )}>
                            {gap.gapScore > 0 ? `-${gap.gapScore} pts` : '✓ Met'}
                          </span>
                        </div>
                      </div>

                      {/* Progress representation */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isResolved ? 'bg-emerald-500' : 'bg-indigo-600'
                          )}
                          style={{ width: `${Math.min(100, Math.round((Number(gap.currentScore) / Math.max(1, Number(gap.requiredScore))) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillGapAnalysisPage;
