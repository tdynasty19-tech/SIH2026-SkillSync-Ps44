import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Award,
  CheckCircle2,
  Target,
  ArrowRight,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Clock,
  Building2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#94a3b8',
  INTERMEDIATE: '#60a5fa',
  ADVANCED: '#818cf8',
  EXPERT: '#34d399',
};

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: () => dashboardService.getStudentDashboard(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-100 rounded-2xl animate-pulse md:col-span-2" />
          <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="max-w-2xl mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Unable to load dashboard</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          We couldn't retrieve your latest skill metrics. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // Real data extractions
  const skillLevels = dashboard.skillSummary?.skillLevels || {
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    EXPERT: 0,
  };

  const skillChartData = [
    { name: 'Beginner', count: skillLevels.BEGINNER || 0, color: LEVEL_COLORS.BEGINNER },
    { name: 'Intermediate', count: skillLevels.INTERMEDIATE || 0, color: LEVEL_COLORS.INTERMEDIATE },
    { name: 'Advanced', count: skillLevels.ADVANCED || 0, color: LEVEL_COLORS.ADVANCED },
    { name: 'Expert', count: skillLevels.EXPERT || 0, color: LEVEL_COLORS.EXPERT },
  ];

  const appStats = dashboard.applicationStats || {};
  const totalApps = Object.values(appStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome & Profile Readiness Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/20">
                Student Intelligence
              </span>
              {dashboard.department && (
                <span className="text-xs text-indigo-300">
                  {dashboard.department} {dashboard.graduationYear ? `• Class of ${dashboard.graduationYear}` : ''}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">
              Welcome back, {user?.name || user?.firstName || 'Student'}
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              {dashboard.headline ||
                dashboard.collegeName ||
                'Track your verified skills, assessment results, and career readiness in real time.'}
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 self-start sm:self-auto">
            <div className="text-right">
              <p className="text-xs text-indigo-200">Profile Completion</p>
              <p className="text-lg font-bold text-white">{dashboard.profileCompletion}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-400/40 border-t-indigo-400 flex items-center justify-center font-bold text-xs text-white">
              {dashboard.profileCompletion}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Key Intelligence Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/student/skills')}
        >
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{dashboard.skillSummary.totalSkills}</p>
              <p className="text-xs text-slate-500 font-medium">Total Skills</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/student/skills')}
        >
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{dashboard.skillSummary.verifiedSkills}</p>
              <p className="text-xs text-slate-500 font-medium">Verified Skills</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/student/skill-gap')}
        >
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{dashboard.skillGaps.length}</p>
              <p className="text-xs text-slate-500 font-medium">Active Skill Gaps</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/student/assessments')}
        >
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {dashboard.assessmentOverview?.averageScore ?? 0}%
              </p>
              <p className="text-xs text-slate-500 font-medium">Avg Assessment Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Middle Section: Skill Proficiency Distribution & Assessment Performance */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Real Skill Distribution Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Skill Proficiency Distribution</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Categorized by verified competence levels</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/skills')}
              className="text-xs text-indigo-600"
            >
              Manage Skills <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard.skillSummary.totalSkills === 0 ? (
              <div className="py-12 text-center">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No skills recorded yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Add your skills to visualize your competence profile.
                </p>
                <Button size="sm" onClick={() => navigate('/student/skills')}>
                  Add My Skills
                </Button>
              </div>
            ) : (
              <div>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                        formatter={(value) => [`${value} skills`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {skillChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Skills Badges */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Top Verified Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {dashboard.topSkills.length === 0 ? (
                      <span className="text-xs text-slate-400">Complete assessments to verify your skills.</span>
                    ) : (
                      dashboard.topSkills.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-medium transition-colors"
                        >
                          {s.skillName}
                          {s.verified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessment Overview */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recent Assessments</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {dashboard.assessmentOverview.completedAttempts} of {dashboard.assessmentOverview.totalAttempts} completed
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/assessments')}
              className="text-xs text-indigo-600"
            >
              Take Test <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {dashboard.assessmentOverview.recentAttempts.length === 0 ? (
              <div className="py-12 text-center my-auto">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No assessments attempted</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Validate your competencies with standardized tests.</p>
                <Button size="sm" onClick={() => navigate('/student/assessments')}>
                  Explore Assessments
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.assessmentOverview.recentAttempts.slice(0, 4).map((a) => {
                  const isPassed = (a.percentage ?? 0) >= 70;
                  return (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {a.date ? new Date(a.date).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <Badge variant={a.status === 'COMPLETED' ? (isPassed ? 'success' : 'danger') : 'warning'}>
                        {a.status === 'COMPLETED' ? `${a.percentage}%` : 'In Progress'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Overall Assessment Avg:</span>
              <span className="font-bold text-slate-900">{dashboard.assessmentOverview.averageScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom Grid: Career Readiness & Application Pipeline */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Career Recommendations & Readiness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                Career Intelligence & Readiness
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Target career alignments based on your verified skills</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/career')}
              className="text-xs text-indigo-600"
            >
              Roadmap <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recommendedCareers.length === 0 ? (
              <div className="py-8 text-center">
                <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No career recommendations yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-3">Add your career interests to unlock matching analysis.</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/student/career')}>
                  Set Career Target
                </Button>
              </div>
            ) : (
              dashboard.recommendedCareers.slice(0, 3).map((rec, i) => {
                const readiness = rec.readiness ?? rec.readinessScore ?? rec.matchScore ?? rec.fitScore ?? 65;
                return (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{rec.roleTitle || rec.title}</p>
                      <span className="text-xs font-bold text-indigo-600">{readiness}% Ready</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${readiness}%` }}
                      />
                    </div>
                    {rec.whyItFits && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">{rec.whyItFits}</p>
                    )}
                  </div>
                );
              })
            )}

            {/* Quick Skill Gaps Preview */}
            {dashboard.skillGaps.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500 mb-2">Priority Skills to Improve:</p>
                <div className="flex flex-wrap gap-1.5">
                  {dashboard.skillGaps.slice(0, 4).map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md text-[11px] font-medium"
                    >
                      {g.skillName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Pipeline Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Application Pipeline
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of submitted opportunities</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/applications')}
              className="text-xs text-indigo-600"
            >
              Track All <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Breakdown Counters */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-lg font-bold text-slate-900">{totalApps}</p>
                <p className="text-[10px] text-slate-500 uppercase">Total</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-lg font-bold text-blue-600">{appStats.APPLIED || 0}</p>
                <p className="text-[10px] text-blue-500 uppercase">Review</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-lg font-bold text-indigo-600">{appStats.SHORTLISTED || 0}</p>
                <p className="text-[10px] text-indigo-500 uppercase">Shortlist</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-lg font-bold text-emerald-600">
                  {(appStats.OFFERED || 0) + (appStats.SELECTED || 0) + (appStats.ACCEPTED || 0)}
                </p>
                <p className="text-[10px] text-emerald-500 uppercase">Selected</p>
              </div>
            </div>

            {/* Recent Applications Feed */}
            {dashboard.recentApplications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-400 mb-3">You have not submitted any applications yet.</p>
                <Button size="sm" onClick={() => navigate('/student/jobs')}>
                  Explore Matching Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dashboard.recentApplications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {app.opportunity?.title || `${app.opportunityType} Application`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {app.opportunity?.companyName || 'Verified Employer'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === 'SHORTLISTED' || app.status === 'ACCEPTED'
                          ? 'success'
                          : app.status === 'REJECTED'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
