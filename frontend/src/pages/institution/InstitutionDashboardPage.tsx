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
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  AlertCircle,
  Briefcase,
  Sparkles,
  DollarSign,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#94a3b8',
  INTERMEDIATE: '#60a5fa',
  ADVANCED: '#818cf8',
  EXPERT: '#34d399',
};

export const InstitutionDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['institution', 'dashboard'],
    queryFn: () => dashboardService.getInstitutionDashboard(),
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
        <h2 className="text-xl font-bold text-slate-800">Unable to load institution analytics</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          We couldn't retrieve institutional placement and skill metrics. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const skillDist = dashboard.skillStats?.skillLevelDistribution || {
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    EXPERT: 0,
  };

  const skillChartData = [
    { name: 'Beginner', count: skillDist.BEGINNER || 0, color: LEVEL_COLORS.BEGINNER },
    { name: 'Intermediate', count: skillDist.INTERMEDIATE || 0, color: LEVEL_COLORS.INTERMEDIATE },
    { name: 'Advanced', count: skillDist.ADVANCED || 0, color: LEVEL_COLORS.ADVANCED },
    { name: 'Expert', count: skillDist.EXPERT || 0, color: LEVEL_COLORS.EXPERT },
  ];

  const placement = dashboard.placementStats || {
    totalStudents: 0,
    placedStudents: 0,
    placementRate: 0,
    averageSalary: 0,
    highestSalary: 0,
  };

  const demandSkills = dashboard.skillDemand || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Institutional Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
              University & College Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Institutional Intelligence Platform
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Student skill coverage, placement milestones, and industry collaboration metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/institution/placements')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs"
          >
            Manage Placements
          </Button>
        </div>
      </div>

      {/* 2. Core High-Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{dashboard.studentStats.totalStudents}</p>
              <p className="text-xs text-slate-500 font-medium">Registered Students</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{placement.placementRate}%</p>
              <p className="text-xs text-slate-500 font-medium">Placement Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {dashboard.industryStats.industryConnectionsCount}
              </p>
              <p className="text-xs text-slate-500 font-medium">Industry Connections</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{placement.averageSalary} LPA</p>
              <p className="text-xs text-slate-500 font-medium">Average Package</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Skill Competency Distribution & Placement Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Institutional Student Competence Distribution</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {dashboard.skillStats.totalStudentsWithSkills} students with recorded skills
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {dashboard.skillStats.verifiedSkillsCount} verified skills
            </span>
          </CardHeader>
          <CardContent>
            {dashboard.skillStats.totalStudentsWithSkills === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No student skills recorded</p>
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

                {/* Additional Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block">Avg Profile Completion</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {dashboard.studentStats.averageProfileCompletion}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Skills Logged</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {dashboard.skillStats.totalSkillsRecorded}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assessments Done</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {dashboard.assessmentStats.totalAssessmentsCompleted}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placement Summary */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base">Placement Summary</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Campus recruitment highlights</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-4 my-auto">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">Placed Students</span>
                <span className="text-sm font-bold text-emerald-700">
                  {placement.placedStudents} / {placement.totalStudents}
                </span>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">Highest Package</span>
                <span className="text-sm font-bold text-indigo-700">{placement.highestSalary} LPA</span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">Average Package</span>
                <span className="text-sm font-bold text-blue-700">{placement.averageSalary} LPA</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/institution/placements')}
              >
                View Placement Records
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Industry Skill Demand Alignment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Industry Skill Demand Alignment
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Most in-demand competencies requested by hiring partners</p>
          </div>
        </CardHeader>
        <CardContent>
          {demandSkills.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Skill demand data will populate based on live job openings.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {demandSkills.slice(0, 5).map((item) => (
                <div
                  key={item.skillId}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"
                >
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.skillName}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-0.5">{item.count}</p>
                  <p className="text-[10px] text-slate-400">open opportunities</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionDashboardPage;
