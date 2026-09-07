import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { ApplicationItem, STATUS_LABELS, STATUS_BADGE_CLASSES } from '../../types/application.types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Briefcase,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';

export const ApplicationTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Fetch student's real applications from GET /api/v1/applications/me
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications({ limit: 100 }),
    enabled: !!user,
  });

  const applications = data?.applications || [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton className="h-20 rounded-xl" />
        <LoadingSkeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Application Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor real-time status updates and industry evaluations for your submitted applications.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700">
          Total Applications: <span className="text-indigo-600">{applications.length}</span>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Explore active industry jobs, internships, and research projects to apply with your verified skills.
          </p>
          <Button onClick={() => (window.location.href = '/student/jobs')}>
            Browse Opportunities
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Opportunity</th>
                  <th className="py-3.5 px-4 font-semibold">Company / Org</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Applied Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => {
                  const companyName =
                    app.opportunity?.industry?.companyName ||
                    app.opportunity?.institution?.institutionName ||
                    'Industry Partner';
                  const title = app.opportunity?.title || `${app.opportunityType} #${app.opportunityId}`;
                  const badgeClass = STATUS_BADGE_CLASSES[app.status] || 'bg-slate-50 text-slate-700';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {title}
                      </td>
                      <td className="py-4 px-4 flex items-center gap-1.5 text-slate-600 font-medium">
                        <Building className="w-4 h-4 text-slate-400" />
                        {companyName}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {app.opportunityType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(app.appliedAt || app.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
                        >
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          className="text-xs px-3 py-1.5"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Lifecycle Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Application #{selectedApp.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedApp.opportunity?.title || `${selectedApp.opportunityType} #${selectedApp.opportunityId}`}
                </h3>
                <p className="text-xs font-semibold text-indigo-600">
                  {selectedApp.opportunity?.industry?.companyName || 'Industry Partner'}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Current Status Pill */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Current Evaluation Status</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-1 ${
                      STATUS_BADGE_CLASSES[selectedApp.status]
                    }`}
                  >
                    {STATUS_LABELS[selectedApp.status] || selectedApp.status}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Applied on</span>
                  <p className="font-semibold text-slate-700">
                    {new Date(selectedApp.appliedAt || selectedApp.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Progression Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Application Lifecycle Flow
                </h4>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0" />
                  {[
                    { key: 'APPLIED', label: 'Applied' },
                    { key: 'UNDER_REVIEW', label: 'Review' },
                    { key: 'SHORTLISTED', label: 'Shortlisted' },
                    { key: 'INTERVIEW', label: 'Interview' },
                    { key: 'SELECTED', label: 'Selected' },
                  ].map((step, idx) => {
                    const statusOrder = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
                    const currentIdx = statusOrder.indexOf(selectedApp.status);
                    const isRejected = selectedApp.status === 'REJECTED';
                    const isPassed = !isRejected && currentIdx >= idx;
                    const isCurrent = !isRejected && currentIdx === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10 bg-white px-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                            isCurrent
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                              : isPassed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {selectedApp.status === 'REJECTED' && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Application was not selected for this opening.</span>
                  </div>
                )}
              </div>

              {/* Cover Note */}
              {selectedApp.coverLetter && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Your Submitted Note
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                    "{selectedApp.coverLetter}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
