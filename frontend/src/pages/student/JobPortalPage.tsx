import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { UnifiedOpportunity, OpportunityKind, WorkplaceType } from '../../types/opportunity.types';
import { MatchResult } from '../../types/matching.types';
import { opportunityService } from '../../services/opportunityService';
import { applicationService } from '../../services/applicationService';
import { matchingService } from '../../services/matchingService';
import { aiService } from '../../services/aiService';
import { MatchBreakdownCard } from '../../components/opportunities/MatchBreakdownCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Search,
  Briefcase,
  GraduationCap,
  FolderGit2,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const JobPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Search and Filter state
  const [search, setSearch] = useState('');
  const [activeKind, setActiveKind] = useState<OpportunityKind | 'ALL'>('ALL');
  const [activeWorkplace, setActiveWorkplace] = useState<WorkplaceType | 'ALL'>('ALL');

  // Modal inspection & application state
  const [selectedOpp, setSelectedOpp] = useState<UnifiedOpportunity | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  // 1. Fetch Real Unified Opportunities
  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', activeKind, activeWorkplace, search],
    queryFn: () =>
      opportunityService.getUnifiedOpportunities({
        kind: activeKind,
        workplaceType: activeWorkplace,
        search,
      }),
  });

  const opportunities = data?.opportunities || [];

  // 2. Fetch Student Applications to determine applied state
  const { data: myAppsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications({ limit: 100 }),
    enabled: !!user && user.role === 'student',
  });

  const appliedMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    if (myAppsData?.applications) {
      for (const app of myAppsData.applications) {
        map.set(`${app.opportunityType}_${app.opportunityId}`, true);
      }
    }
    return map;
  }, [myAppsData]);

  // 3. Fetch Match Score for Selected Opportunity
  const { data: matchData, isLoading: isMatchLoading } = useQuery<MatchResult>({
    queryKey: ['opportunity-match', selectedOpp?.id, selectedOpp?.kind],
    queryFn: () =>
      matchingService.getOpportunityMatch(
        selectedOpp!.id,
        selectedOpp!.kind
      ),
    enabled: !!selectedOpp && !!user && user.role === 'student',
  });

  // 3b. Fetch AI Match Explanation for Selected Opportunity
  const { data: aiExplanationData, isLoading: isAiExplanationLoading } = useQuery({
    queryKey: ['opportunity-ai-explanation', selectedOpp?.id, selectedOpp?.kind],
    queryFn: () =>
      aiService.getOpportunityExplanation(
        selectedOpp!.id,
        selectedOpp!.kind
      ),
    enabled: !!selectedOpp && !!user && user.role === 'student',
  });

  // 4. Submit Application Mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOpp) throw new Error('No opportunity selected');
      return applicationService.submitApplication({
        opportunityId: selectedOpp.id,
        opportunityType: selectedOpp.kind,
        coverLetter: coverLetter.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      addNotification({
        type: 'success',
        message: `Applied successfully to ${selectedOpp?.title}!`,
      });
      setSelectedOpp(null);
      setCoverLetter('');
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || error.message || 'Failed to submit application';
      addNotification({ type: 'error', message: errMsg });
    },
  });

  const isApplied = (opp: UnifiedOpportunity) => appliedMap.has(`${opp.kind}_${opp.id}`);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            Opportunities & Match Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover industry jobs, internships, and collaborative projects ranked by your verified skills.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, keywords, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {/* Workplace Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Workplace:
            </span>
            <select
              value={activeWorkplace}
              onChange={(e) => setActiveWorkplace(e.target.value as any)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Workplaces</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {[
            { key: 'ALL', label: 'All Opportunities', icon: Sparkles },
            { key: 'JOB', label: 'Jobs', icon: Briefcase },
            { key: 'INTERNSHIP', label: 'Internships', icon: GraduationCap },
            { key: 'PROJECT', label: 'Projects', icon: FolderGit2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeKind === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveKind(tab.key as any)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunities Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-56 rounded-xl" />
          <LoadingSkeleton className="h-56 rounded-xl" />
          <LoadingSkeleton className="h-56 rounded-xl" />
          <LoadingSkeleton className="h-56 rounded-xl" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No opportunities found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Try broadening your search term or switching to a different category filter.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {opportunities.map((opp) => {
            const applied = isApplied(opp);
            return (
              <Card
                key={`${opp.kind}_${opp.id}`}
                className="flex flex-col border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all rounded-xl"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          opp.kind === 'JOB'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : opp.kind === 'INTERNSHIP'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {opp.kind}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {opp.workplaceType}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">{opp.title}</CardTitle>
                    <p className="text-sm font-semibold text-indigo-600">{opp.companyName}</p>
                  </div>

                  {applied && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-2">
                  <div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{opp.description}</p>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opp.location}
                      </span>
                      {opp.compensation && (
                        <span className="font-semibold text-slate-700">{opp.compensation}</span>
                      )}
                      {opp.duration && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {opp.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <Button
                      variant="outline"
                      className="w-1/2 text-xs flex items-center justify-center gap-1.5"
                      onClick={() => {
                        setSelectedOpp(opp);
                        setCoverLetter('');
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      View & Match
                    </Button>
                    <Button
                      className="w-1/2 text-xs"
                      disabled={applied}
                      onClick={() => {
                        setSelectedOpp(opp);
                        setCoverLetter('');
                      }}
                    >
                      {applied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Opportunity Details & Match Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {selectedOpp.kind}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedOpp.workplaceType}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedOpp.title}</h3>
                <p className="text-sm font-semibold text-indigo-600">{selectedOpp.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* 5-Factor Match Intelligence */}
              {isMatchLoading ? (
                <LoadingSkeleton className="h-44 rounded-xl" />
              ) : matchData ? (
                <div className="space-y-4">
                  <MatchBreakdownCard
                    breakdown={matchData.breakdown}
                    matchScore={matchData.matchScore}
                  />

                  {/* AI Qualitative Explanation & Advisory */}
                  {aiExplanationData?.explanation && (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          AI Match Insight & Career Guidance
                        </span>
                        {aiExplanationData.fallbackUsed && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium ml-auto">
                            Verified Deterministic Analysis
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {aiExplanationData.explanation.suitabilitySummary}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3 pt-1">
                        {aiExplanationData.explanation.strengths?.length > 0 && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100/60">
                            <span className="font-bold text-emerald-800 block mb-1">Key Profile Strengths:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                              {aiExplanationData.explanation.strengths.map((s, idx) => (
                                <li key={idx} className="truncate">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {aiExplanationData.explanation.areasToImprove?.length > 0 && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100/60">
                            <span className="font-bold text-amber-800 block mb-1">Recommended Upskilling:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                              {aiExplanationData.explanation.areasToImprove.map((a, idx) => (
                                <li key={idx} className="truncate">{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {aiExplanationData.explanation.recommendation && (
                        <p className="text-slate-600 italic pt-1 border-t border-indigo-100/60">
                          <strong>Advisory Tip:</strong> {aiExplanationData.explanation.recommendation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500">
                  Log in as a student to evaluate your verified skills against this opportunity.
                </div>
              )}

              {/* Description & Requirements */}
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Role Description</h4>
                  <p className="whitespace-pre-line leading-relaxed text-slate-600">
                    {selectedOpp.description}
                  </p>
                </div>

                {selectedOpp.requirements && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Key Requirements & Deliverables</h4>
                    <p className="whitespace-pre-line leading-relaxed text-slate-600">
                      {selectedOpp.requirements}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Location</span>
                    <span className="font-semibold text-slate-800">{selectedOpp.location}</span>
                  </div>
                  {selectedOpp.compensation && (
                    <div>
                      <span className="text-slate-400 block font-medium">Compensation</span>
                      <span className="font-semibold text-slate-800">
                        {selectedOpp.compensation}
                      </span>
                    </div>
                  )}
                  {selectedOpp.duration && (
                    <div>
                      <span className="text-slate-400 block font-medium">Duration</span>
                      <span className="font-semibold text-slate-800">{selectedOpp.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Form */}
              <div className="pt-4 border-t border-slate-200">
                {isApplied(selectedOpp) ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">You have already applied to this opportunity.</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Track your review status in the Application Tracker.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Cover Note (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Highlight relevant skills, achievements, or why you are passionate about this role..."
                      rows={3}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setSelectedOpp(null)}>
                        Cancel
                      </Button>
                      <Button
                        isLoading={applyMutation.isPending}
                        onClick={() => applyMutation.mutate()}
                        className="px-6"
                      >
                        Confirm & Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
