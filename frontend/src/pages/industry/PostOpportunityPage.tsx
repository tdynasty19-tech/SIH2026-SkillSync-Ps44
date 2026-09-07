import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { opportunityService } from '../../services/opportunityService';
import { useNotifications } from '../../context/NotificationContext';
import { OpportunityKind, WorkplaceType, EmploymentType, OpportunityStatus } from '../../types/opportunity.types';
import { PlusCircle, Briefcase, GraduationCap, FolderGit2, FileText, Send } from 'lucide-react';

export const PostOpportunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<OpportunityKind>('JOB');
  const [targetStatus, setTargetStatus] = useState<OpportunityStatus>('OPEN');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: 'Bengaluru, India',
    city: 'Bengaluru',
    state: 'Karnataka',
    workplaceType: 'HYBRID' as WorkplaceType,
    employmentType: 'FULL_TIME' as EmploymentType,
    salaryMin: '',
    salaryMax: '',
    durationMonths: '3',
    durationWeeks: '12',
    stipend: '',
    budget: '',
    openings: '2',
    applicationDeadline: '2026-12-31',
  });

  const postMutation = useMutation({
    mutationFn: async (statusToSet: OpportunityStatus) => {
      if (kind === 'JOB') {
        return opportunityService.createJob({
          title: formData.title.trim(),
          description: formData.description.trim(),
          requirements: formData.requirements.trim() || undefined,
          location: formData.location.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          workplaceType: formData.workplaceType,
          employmentType: formData.employmentType,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
          applicationDeadline: formData.applicationDeadline || undefined,
          openings: Number(formData.openings) || 1,
          status: statusToSet,
        });
      } else if (kind === 'INTERNSHIP') {
        return opportunityService.createInternship({
          title: formData.title.trim(),
          description: formData.description.trim(),
          requirements: formData.requirements.trim() || undefined,
          durationMonths: Number(formData.durationMonths) || 3,
          stipend: formData.stipend ? Number(formData.stipend) : undefined,
          workplaceType: formData.workplaceType,
          location: formData.location.trim() || undefined,
          openings: Number(formData.openings) || 1,
          applicationDeadline: formData.applicationDeadline || undefined,
          status: statusToSet,
        });
      } else {
        return opportunityService.createProject({
          title: formData.title.trim(),
          description: formData.description.trim(),
          deliverables: formData.requirements.trim() || undefined,
          durationWeeks: Number(formData.durationWeeks) || 12,
          budget: formData.budget ? Number(formData.budget) : undefined,
          status: statusToSet,
        });
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['industryUnifiedOpportunities'] });
      const statusLabel = variables === 'OPEN' ? 'published and open for applications' : 'saved as draft';
      addNotification({
        type: 'success',
        message: `${kind} opportunity ${statusLabel}!`,
      });
      navigate('/industry/applications');
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || error.message || 'Failed to post opportunity';
      addNotification({ type: 'error', message: errMsg });
    },
  });

  const handleSubmitWithStatus = (e: React.FormEvent, status: OpportunityStatus) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      addNotification({ type: 'error', message: 'Title and Description are required' });
      return;
    }
    setTargetStatus(status);
    postMutation.mutate(status);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-indigo-600" />
          Create & Publish Opportunity
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Post full-time jobs, student internships, or real-world problem statements connected to our skill matching engine.
        </p>
      </div>

      {/* Opportunity Kind Switcher */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'JOB', label: 'Full-Time Job', icon: Briefcase },
          { key: 'INTERNSHIP', label: 'Internship', icon: GraduationCap },
          { key: 'PROJECT', label: 'Industry Project', icon: FolderGit2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = kind === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setKind(tab.key as OpportunityKind)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-sm font-semibold transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-6 h-6" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={(e) => handleSubmitWithStatus(e, 'OPEN')} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                placeholder={
                  kind === 'JOB'
                    ? 'e.g. Senior Cloud Architect'
                    : kind === 'INTERNSHIP'
                    ? 'e.g. Computer Vision Research Intern'
                    : 'e.g. Autonomous Swarm Optimization'
                }
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the objectives, team context, and responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {kind === 'PROJECT' ? 'Key Deliverables' : 'Required Skills & Qualifications'}
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Proficiency in Python, React, SQL, and distributed microservices architectures..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Workplace & Location */}
            {kind !== 'PROJECT' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Workplace Arrangement
                  </label>
                  <select
                    value={formData.workplaceType}
                    onChange={(e) =>
                      setFormData({ ...formData, workplaceType: e.target.value as WorkplaceType })
                    }
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Location / Headquarters
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Compensation & Durations */}
            <div className="grid sm:grid-cols-2 gap-4">
              {kind === 'JOB' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Minimum Salary (₹/yr)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 800000"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Maximum Salary (₹/yr)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1500000"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                </>
              ) : kind === 'INTERNSHIP' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Monthly Stipend (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 35000"
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      value={formData.durationWeeks}
                      onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Project Budget / Grant (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 100000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Deadline & Openings */}
            {kind !== 'PROJECT' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Number of Openings
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/industry/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={postMutation.isPending}
                onClick={(e) => handleSubmitWithStatus(e, 'DRAFT')}
                className="flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Save as Draft (DRAFT)
              </Button>
              <Button
                type="submit"
                isLoading={postMutation.isPending && targetStatus === 'OPEN'}
                className="px-6 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Publish Now (OPEN)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
