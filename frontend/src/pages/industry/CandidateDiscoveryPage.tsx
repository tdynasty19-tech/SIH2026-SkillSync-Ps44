import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { matchingService } from '../../services/matchingService';
import { opportunityService } from '../../services/opportunityService';
import { UnifiedOpportunity } from '../../types/opportunity.types';
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Briefcase
} from 'lucide-react';

export const CandidateDiscoveryPage: React.FC = () => {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
  const [selectedOpportunityKind, setSelectedOpportunityKind] = useState<string>('JOB');
  const [minScore, setMinScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch Industry Owned Opportunities
  const { 
    data: oppsData, 
    isLoading: isOppsLoading,
    isError: isOppsError
  } = useQuery<{ opportunities: UnifiedOpportunity[]; total: number }>({
    queryKey: ['industryUnifiedOpportunities'],
    queryFn: () => opportunityService.getUnifiedOpportunities({ limit: 50 }),
  });

  const opportunities = oppsData?.opportunities || [];

  // Auto-select first opportunity if not selected yet
  React.useEffect(() => {
    if (opportunities.length > 0 && selectedOpportunityId === null) {
      setSelectedOpportunityId(opportunities[0].id);
      setSelectedOpportunityKind(opportunities[0].kind);
    }
  }, [opportunities, selectedOpportunityId]);

  // 2. Fetch Candidate Recommendations for Selected Opportunity
  const {
    data: candidatesData,
    isLoading: isCandidatesLoading,
    isError: isCandidatesError,
    error: candidatesError,
    refetch: refetchCandidates,
    isFetching: isCandidatesFetching,
  } = useQuery({
    queryKey: ['candidateRecommendations', selectedOpportunityId, selectedOpportunityKind, minScore],
    queryFn: () =>
      selectedOpportunityId
        ? matchingService.getCandidateRecommendations(selectedOpportunityId, selectedOpportunityKind)
        : Promise.resolve({ candidates: [], pagination: { total: 0 } }),
    enabled: selectedOpportunityId !== null,
  });

  const rawCandidates: any[] = candidatesData?.candidates || [];

  // Client-side search filtering by name, college, department
  const filteredCandidates = rawCandidates.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const c = item.candidate || {};
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q)) ||
      (c.collegeName && c.collegeName.toLowerCase().includes(q)) ||
      (c.headline && c.headline.toLowerCase().includes(q))
    );
  });

  const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600" />
            Candidate Discovery
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover and evaluate student talent ranked by our 5-factor authoritative matching intelligence.
          </p>
        </div>
      </div>

      {/* Opportunity Selector & Controls */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Opportunity Selector */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Opportunity *
              </label>
              {isOppsLoading ? (
                <LoadingSkeleton className="h-10 rounded-xl" />
              ) : opportunities.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  No active opportunities found. Post an opportunity first to discover candidates.
                </div>
              ) : (
                <select
                  value={selectedOpportunityId ?? ''}
                  onChange={(e) => {
                    const oppId = Number(e.target.value);
                    const opp = opportunities.find((o) => o.id === oppId);
                    setSelectedOpportunityId(oppId);
                    if (opp) setSelectedOpportunityKind(opp.kind);
                  }}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {opportunities.map((opp) => (
                    <option key={`${opp.kind}-${opp.id}`} value={opp.id}>
                      [{opp.kind}] {opp.title} ({opp.location})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Minimum Match Score Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Min Match Score</span>
                <span className="text-indigo-600 font-bold">{minScore}%</span>
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>All Candidates (0%+)</option>
                <option value={40}>Good Alignment (40%+)</option>
                <option value={60}>Strong Match (60%+)</option>
                <option value={75}>High Match (75%+)</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Filter by Keyword
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search candidate name, college, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Opportunity Meta Ribbon */}
      {selectedOpp && (
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-indigo-950">{selectedOpp.title}</span>
            <Badge variant="primary" className="text-xs uppercase">{selectedOpp.kind}</Badge>
            <span className="text-indigo-700 text-xs">{selectedOpp.workplaceType} • {selectedOpp.location}</span>
          </div>
          <span className="text-xs font-medium text-indigo-900 bg-indigo-100/70 px-3 py-1 rounded-lg">
            {filteredCandidates.length} Candidates Matched
          </span>
        </div>
      )}

      {/* Candidates List / Table */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Ranked Candidate Pool
          </CardTitle>
          {isCandidatesFetching && <span className="text-xs text-indigo-600 animate-pulse font-medium">Updating scores...</span>}
        </CardHeader>
        <CardContent className="p-4">
          {isCandidatesLoading ? (
            <div className="space-y-3 py-4">
              <LoadingSkeleton className="h-14 rounded-xl" />
              <LoadingSkeleton className="h-14 rounded-xl" />
              <LoadingSkeleton className="h-14 rounded-xl" />
            </div>
          ) : isCandidatesError ? (
            <div className="py-12 text-center text-red-500 text-sm space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
              <p className="font-semibold">Failed to fetch candidate recommendations.</p>
              <p className="text-xs text-red-400">{(candidatesError as Error)?.message}</p>
              <Button size="sm" variant="outline" onClick={() => refetchCandidates()}>Try Again</Button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-semibold text-slate-700">No candidates match your current criteria.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try reducing the minimum match score threshold or selecting another published opportunity.
              </p>
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: 'Candidate',
                  accessorKey: 'candidate.name',
                  cell: (info: any) => {
                    const row = info.row.original;
                    const c = row.candidate || {};
                    return (
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{c.name || 'Candidate'}</p>
                        <p className="text-xs text-slate-500">{c.headline || c.department || 'Student'}</p>
                      </div>
                    );
                  },
                },
                {
                  header: 'Institution & Batch',
                  accessorKey: 'candidate.collegeName',
                  cell: (info: any) => {
                    const c = info.row.original.candidate || {};
                    return (
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800">{c.collegeName || 'Verified Institute'}</p>
                        <p className="text-[11px] text-slate-400">
                          {c.department || 'General'} {c.graduationYear ? `• Class of ${c.graduationYear}` : ''}
                        </p>
                      </div>
                    );
                  },
                },
                {
                  header: 'Match Score',
                  accessorKey: 'matchScore',
                  cell: (info: any) => {
                    const score = Math.round(Number(info.getValue()) || 0);
                    const b = info.row.original.breakdown || {};
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            score >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            score >= 50 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {score}% Match
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Skill: {Math.round(b.skillMatch || 0)}% • Assess: {Math.round(b.assessment || 0)}%
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: 'Status',
                  accessorKey: 'candidate.availabilityStatus',
                  cell: (info: any) => {
                    const val = info.getValue() || 'AVAILABLE';
                    return (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" />
                        {val}
                      </span>
                    );
                  },
                },
              ]}
              data={filteredCandidates}
              keyExtractor={(item: any) => String(item.candidate?.id || Math.random())}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
