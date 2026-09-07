import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { opportunityService } from '../../services/opportunityService';
import { ResearchOpportunityItem } from '../../types/opportunity.types';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FlaskConical, 
  DollarSign, 
  Clock, 
  Building2, 
  RefreshCw, 
  AlertCircle,
  FolderGit2,
  Plus
} from 'lucide-react';

export const ResearchCollaborationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fieldOfStudy: '',
    description: '',
    fundingAmount: '',
    durationMonths: '12',
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['researchOpportunities'],
    queryFn: () => opportunityService.getResearchOpportunities(),
  });

  const opportunities: ResearchOpportunityItem[] = data?.researchOpportunities || [];

  const createMutation = useMutation({
    mutationFn: (newOpp: any) => opportunityService.createResearchOpportunity(newOpp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchOpportunities'] });
      setIsModalOpen(false);
      setFormData({
        title: '',
        fieldOfStudy: '',
        description: '',
        fundingAmount: '',
        durationMonths: '12',
      });
      addNotification({
        type: 'success',
        message: 'Research collaboration initiative created successfully!',
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to submit proposal';
      addNotification({ type: 'error', message: msg });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.fieldOfStudy || !formData.description) {
      addNotification({ type: 'error', message: 'Title, Field of Study, and Description are required' });
      return;
    }
    createMutation.mutate({
      title: formData.title.trim(),
      fieldOfStudy: formData.fieldOfStudy.trim(),
      description: formData.description.trim(),
      fundingAmount: formData.fundingAmount ? Number(formData.fundingAmount) : undefined,
      durationMonths: formData.durationMonths ? Number(formData.durationMonths) : 12,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-8 h-8 text-indigo-600" />
            Joint Research & Consultancy Projects
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover funded translational research projects and industry-sponsored technical challenges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Propose Project Call
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-64 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500 text-sm space-y-2 bg-red-50 p-8 rounded-2xl border border-red-200 max-w-xl mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <p className="font-semibold">Failed to load research opportunity calls.</p>
          <p className="text-xs text-red-400">{(error as Error)?.message}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : opportunities.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="py-16 text-center space-y-4">
            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-700">No active research projects currently listed.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Industry partners post sponsored research grants and problem statements periodically. You can also propose a project call.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="mt-2">
              <Plus size={16} className="mr-2" /> Propose New Project Call
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => {
            const sponsorName =
              opp.industry?.companyName || opp.institution?.institutionName || 'Industry / Institution Sponsor';
            const funding = opp.fundingAmount ? Number(opp.fundingAmount) : 0;
            return (
              <Card key={opp.id} className="border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-2">
                      {opp.title}
                    </CardTitle>
                    <Badge variant="primary" className="text-[10px] uppercase shrink-0">
                      {opp.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{sponsorName}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                        {opp.fieldOfStudy}
                      </span>
                      {opp.durationMonths && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          <Clock className="w-3 h-3" /> {opp.durationMonths} Months
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Research Grant</p>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {funding > 0 ? `₹${(funding / 100000).toFixed(2)} Lakhs` : 'Sponsored'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Propose Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Propose Research Collaboration Call">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project / Research Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Distributed Zero-Knowledge Consensus Protocols"
            required
          />
          <Input
            label="Field of Study / Discipline *"
            value={formData.fieldOfStudy}
            onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
            placeholder="e.g. Cybersecurity, AI in Healthcare, IoT"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Project Description & Scope *</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline research methodology, required industrial data/compute, and expected deliverables..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Funding / Grant Amount (₹)"
              type="number"
              value={formData.fundingAmount}
              onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
              placeholder="e.g. 500000"
            />
            <Input
              label="Duration (Months)"
              type="number"
              value={formData.durationMonths}
              onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
              placeholder="e.g. 12"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Submit Research Proposal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
