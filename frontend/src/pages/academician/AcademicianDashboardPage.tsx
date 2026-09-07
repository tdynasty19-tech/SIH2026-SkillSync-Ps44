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
  PieChart,
  Pie,
} from 'recharts';
import {
  Users,
  GraduationCap,
  BookOpen,
  Target,
  Award,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#94a3b8',
  INTERMEDIATE: '#60a5fa',
  ADVANCED: '#818cf8',
  EXPERT: '#34d399',
};

export const AcademicianDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['academician', 'dashboard'],
    queryFn: () => dashboardService.getAcademicianDashboard(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
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
        <h2 className="text-xl font-bold text-slate-800">Unable to load faculty dashboard</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          We couldn't retrieve department and mentorship analytics. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const deptStats = dashboard.departmentStats || {
    departmentName: 'Department',
    totalStudents: 0,
    assessedStudentsCount: 0,
    averageAssessmentScore: 0,
    skillDistribution: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 },
    topSkills: [],
    commonSkillGaps: [],
    students: [],
  };

  const skillDist = deptStats.skillDistribution || { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 };
  const skillChartData = [
    { name: 'Beginner', count: skillDist.BEGINNER || 0, color: LEVEL_COLORS.BEGINNER },
    { name: 'Intermediate', count: skillDist.INTERMEDIATE || 0, color: LEVEL_COLORS.INTERMEDIATE },
    { name: 'Advanced', count: skillDist.ADVANCED || 0, color: LEVEL_COLORS.ADVANCED },
    { name: 'Expert', count: skillDist.EXPERT || 0, color: LEVEL_COLORS.EXPERT },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Academician Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
              {dashboard.academician.designation || 'Faculty Member'}
            </span>
            <span className="text-xs text-slate-500">{dashboard.academician.institution}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Department Intelligence & Mentorship
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {dashboard.academician.department} • Student progress tracking, competency distributions & workshops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white px-3 py-1.5 border-slate-200">
            <UserCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            {dashboard.mentorship.isAvailable ? 'Available for Mentorship' : 'Mentorship Full'}
          </Badge>
        </div>
      </div>

      {/* 2. Core Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{deptStats.totalStudents}</p>
              <p className="text-xs text-slate-500 font-medium">Department Students</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {dashboard.mentorship.activeMentees} / {dashboard.mentorship.maxMentees || 5}
              </p>
              <p className="text-xs text-slate-500 font-medium">Active Mentees</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{deptStats.averageAssessmentScore}%</p>
              <p className="text-xs text-slate-500 font-medium">Avg Assessment Score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{deptStats.commonSkillGaps.length}</p>
              <p className="text-xs text-slate-500 font-medium">Common Skill Gaps</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Skill Level Distribution & Mentorship Requests */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Department Student Competence Levels</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time skill distribution across registered students</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {deptStats.assessedStudentsCount} Assessed
            </span>
          </CardHeader>
          <CardContent>
            {deptStats.totalStudents === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No student records in department</p>
                <p className="text-xs text-slate-400 mt-1">Students will appear here as they register.</p>
              </div>
            ) : (
              <div>
                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                        formatter={(val) => [`${val} skills`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {skillChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Skills Tag Cloud */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Top Competencies in Department</p>
                  <div className="flex flex-wrap gap-2">
                    {deptStats.topSkills.length === 0 ? (
                      <span className="text-xs text-slate-400">No skill competencies recorded yet.</span>
                    ) : (
                      deptStats.topSkills.map((s) => (
                        <span
                          key={s.skillId}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium"
                        >
                          {s.skillName}
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-full text-indigo-600 font-bold">
                            {s.studentCount}
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentorship Activities */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Mentorship Requests</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {dashboard.mentorship.pendingRequestsCount} pending requests
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {dashboard.mentorship.recentRequests.length === 0 ? (
              <div className="py-12 text-center my-auto">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No pending mentorship requests</p>
                <p className="text-xs text-slate-400 mt-1">Students seeking guidance will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.mentorship.recentRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {req.student?.user
                          ? `${req.student.user.firstName} ${req.student.user.lastName}`
                          : 'Student'}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{req.goals || 'Mentorship Guidance'}</p>
                    </div>
                    <Badge variant={req.status === 'ACCEPTED' ? 'success' : 'default'}>{req.status}</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500 flex items-center justify-between">
              <span>Mentorship Capacity:</span>
              <span className="font-bold text-slate-900">
                {dashboard.mentorship.activeMentees} / {dashboard.mentorship.maxMentees || 5} students
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom Grid: Skill Gap Trends & Faculty Workshops */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Identified Department Skill Gaps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              Department Skill Gap Alerts
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Frequent skill deficiencies across student profiles</p>
          </CardHeader>
          <CardContent>
            {deptStats.commonSkillGaps.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No critical skill gaps identified</p>
                <p className="text-xs text-slate-400 mt-0.5">Students are meeting expected industry benchmarks.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {deptStats.commonSkillGaps.map((gap) => (
                  <div
                    key={gap.skillId}
                    className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/70 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{gap.skillName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Requires curriculum reinforcement or workshop</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                      {gap.affectedStudents} students
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workshops & Programs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Faculty Workshops & Industry Sessions
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Upcoming and recent collaborative development programs</p>
          </CardHeader>
          <CardContent>
            {dashboard.workshops.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No workshops scheduled</p>
                <p className="text-xs text-slate-400 mt-0.5">Collaborate with industry partners to organize sessions.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dashboard.workshops.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{w.topic}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Speaker: {w.speakerName} • {w.durationHours}h
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">{w.attendeesCount}</span>
                      <span className="text-[10px] text-slate-400 block">attendees</span>
                    </div>
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

export default AcademicianDashboardPage;
