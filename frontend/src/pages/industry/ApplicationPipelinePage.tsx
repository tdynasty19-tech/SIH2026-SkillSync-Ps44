import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import { opportunityService } from '../../services/opportunityService';
import { matchingService } from '../../services/matchingService';
import {
  ApplicationItem,
  BackendApplicationStatus,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  ALLOWED_TRANSITIONS,
} from '../../types/application.types';
import { UnifiedOpportunity } from '../../types/opportunity.types';
import { MatchBreakdownCard } from '../../components/opportunities/MatchBreakdownCard';
import { MatchResult } from '../../types/matching.types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useNotifications } from '../../context/NotificationContext';
import {
  Users,
  Briefcase,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  Eye,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const ApplicationPipelinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Selected Opportunity filter
  const [selectedOppId, setSelectedOppId] = useState<number | null>(null);
  const [selectedOppKind, setSelectedOppKind] = useState<string>('JOB');

  // Candidate detail / review modal state
  const [activeReviewApp, setActiveReviewApp] = useState<ApplicationItem | null>(null);

  // 1. Fetch Industry Opportunities
  const { data: oppsData, isLoading: isOppsLoading } = useQuery({
    queryKey: ['industry-all-opportunities'],
    queryFn: () => opportunityService.getUnifiedOpportunities({ limit: 100 }),
  });

  const opportunities = oppsData?.opportunities || [];

  // Set default selected opportunity when loaded
  React.useEffect(() => {
    if (opportunities.length > 0 && selectedOppId === null) {
      setSelectedOppId(opportunities[0].id);
      setSelectedOppKind(opportunities[0].kind);
    }
  }, [opportunities, selectedOppId]);

  // 2. Fetch Applications for Selected Opportunity
  const { data: appsData, isLoading: isAppsLoading } = useQuery({
    queryKey: ['pipeline-applications', selectedOppKind, selectedOppId],
    queryFn: () =>
      applicationService.getOpportunityApplications(selectedOppKind, selectedOppId!, {
        limit: 100,
      }),
    enabled: selectedOppId !== null,
  });

  const applications = appsData?.applications || [];

  // 3. Candidate Match Score for Review Modal
  const { data: candidateMatch, isLoading: isCandidateMatchLoading } = useQuery<MatchResult>({
    queryKey: [
      'candidate-match',
      activeReviewApp?.opportunityId,
      activeReviewApp?.opportunityType,
      activeReviewApp?.studentId,
    ],
    queryFn: () =>
      matchingService.getOpportunityMatch(
        activeReviewApp!.opportunityId,
        activeReviewApp!.opportunityType,
        activeReviewApp!.studentId
      ),
    enabled: !!activeReviewApp && !!activeReviewApp.studentId,
  });

  // 4. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: number;
      status: BackendApplicationStatus;
      reason?: string;
    }) => applicationService.updateApplicationStatus(id, { status, reason }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-applications'] });
      addNotification({
        type: 'success',
        message: `Candidate updated to ${STATUS_LABELS[updated.status]}!`,
      });
      if (activeReviewApp?.id === updated.id) {
        setActiveReviewApp(updated);
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'Status update failed';
      addNotification({ type: 'error', message: msg });
    },
  });

  // Kanban Stage Buckets
  const appliedList = applications.filter((a) => a.status === 'APPLIED');
  const reviewList = applications.filter((a) => a.status === 'UNDER_REVIEW');
  const shortlistedList = applications.filter((a) => a.status === 'SHORTLISTED');
  const interviewList = applications.filter((a) => a.status === 'INTERVIEW');
  const selectedList = applications.filter((a) => a.status === 'SELECTED');
  const rejectedList = applications.filter((a) => a.status === 'REJECTED');

  const selectedOpp = opportunities.find(
    (o) => o.id === selectedOppId && o.kind === selectedOppKind
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Candidate Pipeline & Evaluation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review student submissions, inspect 5-factor verified skill matches, and drive the hiring stages.
          </p>
        </div>

        {/* Opportunity Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <select
            value={selectedOppId ? `${selectedOppKind}_${selectedOppId}` : ''}
            onChange={(e) => {
              const [kind, id] = e.target.value.split('_');
              setSelectedOppKind(kind);
              setSelectedOppId(Number(id));
            }}
            className="text-sm font-semibold text-slate-800 bg-transparent focus:outline-none pr-3"
          >
            {opportunities.map((opp) => (
              <option key={`${opp.kind}_${opp.id}`} value={`${opp.kind}_${opp.id}`}>
                [{opp.kind}] {opp.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      {isOppsLoading || isAppsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-96 rounded-xl" />
          <LoadingSkeleton className="h-96 rounded-xl" />
          <LoadingSkeleton className="h-96 rounded-xl" />
          <LoadingSkeleton className="h-96 rounded-xl" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No active postings found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Publish your first Job, Internship, or Project to begin receiving verified student applications.
          </p>
          <Button onClick={() => (window.location.href = '/industry/post-opportunity')}>
            Post Opportunity
          </Button>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {/* Stage 1: Applied */}
          <KanbanColumn
            title="Applied"
            count={appliedList.length}
            badgeColor="bg-blue-100 text-blue-800"
            applications={appliedList}
            onSelectApp={setActiveReviewApp}
            onTransition={(app, next) =>
              updateStatusMutation.mutate({ id: app.id, status: next })
            }
            allowedTransitions={['UNDER_REVIEW']}
          />

          {/* Stage 2: Under Review */}
          <KanbanColumn
            title="Under Review"
            count={reviewList.length}
            badgeColor="bg-amber-100 text-amber-800"
            applications={reviewList}
            onSelectApp={setActiveReviewApp}
            onTransition={(app, next) =>
              updateStatusMutation.mutate({ id: app.id, status: next })
            }
            allowedTransitions={['SHORTLISTED', 'REJECTED']}
          />

          {/* Stage 3: Shortlisted */}
          <KanbanColumn
            title="Shortlisted"
            count={shortlistedList.length}
            badgeColor="bg-purple-100 text-purple-800"
            applications={shortlistedList}
            onSelectApp={setActiveReviewApp}
            onTransition={(app, next) =>
              updateStatusMutation.mutate({ id: app.id, status: next })
            }
            allowedTransitions={['INTERVIEW', 'REJECTED']}
          />

          {/* Stage 4: Interview */}
          <KanbanColumn
            title="Interviewing"
            count={interviewList.length}
            badgeColor="bg-indigo-100 text-indigo-800"
            applications={interviewList}
            onSelectApp={setActiveReviewApp}
            onTransition={(app, next) =>
              updateStatusMutation.mutate({ id: app.id, status: next })
            }
            allowedTransitions={['SELECTED', 'REJECTED']}
          />

          {/* Stage 5: Selected */}
          <KanbanColumn
            title="Selected"
            count={selectedList.length}
            badgeColor="bg-emerald-100 text-emerald-800"
            applications={selectedList}
            onSelectApp={setActiveReviewApp}
            allowedTransitions={[]}
          />
        </div>
      )}

      {/* Candidate Review & Evaluation Modal */}
      {activeReviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Application #{activeReviewApp.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {activeReviewApp.student?.user
                    ? `${activeReviewApp.student.user.firstName} ${activeReviewApp.student.user.lastName}`
                    : `Student #${activeReviewApp.studentId}`}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {activeReviewApp.student?.headline || 'Undergraduate Student'} •{' '}
                  {activeReviewApp.student?.city || 'India'}
                </p>
              </div>
              <button
                onClick={() => setActiveReviewApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Match Score & 5-Factor Intelligence */}
              {isCandidateMatchLoading ? (
                <LoadingSkeleton className="h-44 rounded-xl" />
              ) : candidateMatch ? (
                <MatchBreakdownCard
                  breakdown={candidateMatch.breakdown}
                  matchScore={candidateMatch.matchScore}
                />
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500">
                  Match intelligence calculation not available for this profile.
                </div>
              )}

              {/* Cover Letter */}
              {activeReviewApp.coverLetter && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Candidate Statement / Note
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 italic">
                    "{activeReviewApp.coverLetter}"
                  </div>
                </div>
              )}

              {/* Current Status & Transitions */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Current Stage</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-1 ${
                      STATUS_BADGE_CLASSES[activeReviewApp.status]
                    }`}
                  >
                    {STATUS_LABELS[activeReviewApp.status] || activeReviewApp.status}
                  </span>
                </div>

                {/* Transition Actions */}
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_TRANSITIONS[activeReviewApp.status]?.map((nextStatus) => (
                    <Button
                      key={nextStatus}
                      variant={nextStatus === 'REJECTED' ? 'outline' : 'primary'}
                      className={`text-xs px-3 py-1.5 ${
                        nextStatus === 'SELECTED'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : nextStatus === 'REJECTED'
                          ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                          : ''
                      }`}
                      isLoading={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: activeReviewApp.id,
                          status: nextStatus,
                        })
                      }
                    >
                      Move to {STATUS_LABELS[nextStatus]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setActiveReviewApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Kanban Column Component ──────────────────────────────────────────────────
interface KanbanColumnProps {
  title: string;
  count: number;
  badgeColor: string;
  applications: ApplicationItem[];
  onSelectApp: (app: ApplicationItem) => void;
  onTransition?: (app: ApplicationItem, nextStatus: BackendApplicationStatus) => void;
  allowedTransitions?: BackendApplicationStatus[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  badgeColor,
  applications,
  onSelectApp,
  onTransition,
  allowedTransitions = [],
}) => {
  return (
    <div className="min-w-[280px] w-80 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex flex-col max-h-[75vh]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {count}
        </span>
      </div>

      {/* Cards Container */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {applications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No candidates in this stage</p>
        ) : (
          applications.map((app) => {
            const studentName = app.student?.user
              ? `${app.student.user.firstName} ${app.student.user.lastName}`
              : `Student #${app.studentId}`;

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {studentName}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 truncate">
                    {app.student?.headline || 'Undergraduate Student'}
                  </p>
                  <p className="text-[10px] text-slate-400 mb-3">
                    Applied{' '}
                    {new Date(app.appliedAt || app.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onSelectApp(app)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review
                  </button>

                  {/* Transition Quick Action */}
                  {allowedTransitions.length > 0 && onTransition && (
                    <button
                      onClick={() => onTransition(app, allowedTransitions[0])}
                      className="text-[11px] font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                    >
                      → {STATUS_LABELS[allowedTransitions[0]]}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
