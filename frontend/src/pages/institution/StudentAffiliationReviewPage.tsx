import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import { affiliationService } from '../../services/affiliationService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const StudentAffiliationReviewPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const requestsQuery = useQuery({
    queryKey: ['institution', 'student-affiliations', 'PENDING'],
    queryFn: () => affiliationService.getInstitutionRequests('PENDING'),
  });

  const verifyMutation = useMutation({
    mutationFn: affiliationService.verify,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institution', 'student-affiliations'] }),
    onError: (requestError: any) => setError(requestError.message || 'Unable to verify affiliation'),
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => affiliationService.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institution', 'student-affiliations'] }),
    onError: (requestError: any) => setError(requestError.message || 'Unable to reject affiliation'),
  });

  const reject = (id: number) => {
    const reason = rejectionReasons[id]?.trim();
    if (!reason) {
      setError('Enter a rejection reason before rejecting a request.');
      return;
    }
    setError(null);
    rejectMutation.mutate({ id, reason });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Affiliations</h1>
        <p className="mt-1 text-sm text-slate-500">Review pending institution membership requests.</p>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardCheck size={20} className="text-indigo-600" />Pending Requests</CardTitle>
          <CardDescription>Only requests belonging to your institution are shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(requestsQuery.data?.affiliations || []).map((affiliation) => (
            <div key={affiliation.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {affiliation.student?.user?.firstName} {affiliation.student?.user?.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{affiliation.student?.user?.email}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div><dt className="text-xs text-slate-400">Department</dt><dd className="font-medium text-slate-700">{affiliation.department?.departmentName}</dd></div>
                    <div><dt className="text-xs text-slate-400">Enrollment</dt><dd className="font-medium text-slate-700">{affiliation.enrollmentNumber}</dd></div>
                    <div><dt className="text-xs text-slate-400">Course</dt><dd className="font-medium text-slate-700">{affiliation.student?.course || 'Not provided'}</dd></div>
                    <div><dt className="text-xs text-slate-400">Requested</dt><dd className="font-medium text-slate-700">{new Date(affiliation.requestedAt).toLocaleDateString()}</dd></div>
                  </dl>
                </div>
                <div className="flex flex-col gap-3 min-w-64">
                  <Button
                    onClick={() => { setError(null); verifyMutation.mutate(affiliation.id); }}
                    isLoading={verifyMutation.isPending && verifyMutation.variables === affiliation.id}
                  >
                    <CheckCircle2 size={16} className="mr-2" /> Verify
                  </Button>
                  <Input
                    label="Rejection reason"
                    value={rejectionReasons[affiliation.id] || ''}
                    onChange={(event) => setRejectionReasons((current) => ({ ...current, [affiliation.id]: event.target.value }))}
                    placeholder="Why is this request rejected?"
                    maxLength={500}
                  />
                  <Button
                    variant="danger"
                    onClick={() => reject(affiliation.id)}
                    isLoading={rejectMutation.isPending && rejectMutation.variables?.id === affiliation.id}
                  >
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!requestsQuery.data?.affiliations?.length && <p className="text-sm text-slate-500">No pending affiliation requests.</p>}
        </CardContent>
      </Card>
    </div>
  );
};
