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
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#10b981', '#f43f5e'];

export const IndustryDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['industry', 'dashboard'],
    queryFn: () => dashboardService.getIndustryDashboard(),
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
        <h2 className="text-xl font-bold text-slate-800">Unable to load industry analytics</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          We couldn't retrieve your latest hiring pipeline data. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const funnel = dashboard.hiringFunnel || {
    totalApplied: 0,
    underReview: 0,
    shortlisted: 0,
    interviewScheduled: 0,
    offeredOrAccepted: 0,
    rejected: 0,
  };

  const funnelData = [
    { stage: 'Applied', count: funnel.totalApplied, fill: '#3b82f6' },
    { stage: 'Review', count: funnel.underReview, fill: '#6366f1' },
    { stage: 'Shortlisted', count: funnel.shortlisted, fill: '#8b5cf6' },
    { stage: 'Interview', count: funnel.interviewScheduled, fill: '#ec4899' },
    { stage: 'Selected', count: funnel.offeredOrAccepted, fill: '#10b981' },
  ];

  const oppBreakdown = dashboard.opportunityBreakdown || {
    jobs: { active: 0, total: 0 },
    internships: { active: 0, total: 0 },
    projects: { active: 0, total: 0 },
  };

  const oppData = [
    { name: 'Jobs', value: oppBreakdown.jobs.total, color: '#6366f1' },
    { name: 'Internships', value: oppBreakdown.internships.total, color: '#3b82f6' },
    { name: 'Projects', value: oppBreakdown.projects.total, color: '#10b981' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Industry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
              Enterprise Recruiter
            </span>
            <span className="text-xs text-slate-500">{dashboard.companyName || user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Recruitment & Hiring Pipeline
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time candidate applications, pipeline stages, and talent skill intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/industry/post-opportunity')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* 2. Core KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{dashboard.activeOpportunities}</p>
              <p className="text-xs text-slate-500 font-medium">Active Opportunities</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{dashboard.totalApplications}</p>
              <p className="text-xs text-slate-500 font-medium">Total Applications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{dashboard.shortlisted}</p>
              <p className="text-xs text-slate-500 font-medium">Shortlisted Candidates</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{dashboard.selected}</p>
              <p className="text-xs text-slate-500 font-medium">Selected / Hired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Application Pipeline & Hiring Funnel (Recharts) */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Candidate Pipeline (Hiring Funnel)</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Progressive candidate counts through hiring lifecycle</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/industry/applications')}
              className="text-xs text-indigo-600"
            >
              View Applications <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard.totalApplications === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No applications received yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Candidates will appear here as they apply for your posted openings.
                </p>
                <Button size="sm" onClick={() => navigate('/industry/post-opportunity')}>
                  Post New Opening
                </Button>
              </div>
            ) : (
              <div>
                <div className="h-56 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                        formatter={(val) => [`${val} candidates`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pipeline Stages Progression Indicators */}
                <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  {funnelData.map((item) => (
                    <div key={item.stage} className="p-2 rounded-xl bg-slate-50">
                      <p className="text-base font-bold text-slate-900">{item.count}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{item.stage}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunity Distribution */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base">Opportunity Distribution</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Active postings across opportunity types</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3 my-auto">
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-xs font-semibold text-slate-700">Full-Time Jobs</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{oppBreakdown.jobs.active}</span>
                  <span className="text-xs text-slate-400"> / {oppBreakdown.jobs.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-slate-700">Internships</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{oppBreakdown.internships.active}</span>
                  <span className="text-xs text-slate-400"> / {oppBreakdown.internships.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Live Projects</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{oppBreakdown.projects.active}</span>
                  <span className="text-xs text-slate-400"> / {oppBreakdown.projects.total}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/industry/candidates')}
              >
                Discover Matching Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Candidate Skill Intelligence */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Applicant Skill Intelligence
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Top skills possessed by candidates applying to your positions</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/industry/candidates')}
            className="text-xs text-indigo-600"
          >
            Find Talent <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
          </Button>
        </CardHeader>
        <CardContent>
          {dashboard.topCandidateSkills.length === 0 ? (
            <div className="py-8 text-center">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Candidate skill distributions will automatically aggregate as students apply.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {dashboard.topCandidateSkills.map((skill) => (
                <div
                  key={skill.skillId}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-100 transition-colors text-center"
                >
                  <p className="text-xs font-semibold text-slate-800 truncate">{skill.skillName}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-0.5">{skill.candidateCount}</p>
                  <p className="text-[10px] text-slate-400">candidates</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryDashboardPage;
