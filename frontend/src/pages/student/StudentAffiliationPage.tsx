import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock3, Building2, XCircle } from 'lucide-react';
import { affiliationService } from '../../services/affiliationService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { StudentAffiliationStatus } from '../../types/affiliation.types';

const statusStyles: Record<StudentAffiliationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StudentAffiliationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [institutionId, setInstitutionId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const institutionsQuery = useQuery({
    queryKey: ['affiliations', 'institutions'],
    queryFn: affiliationService.getAvailableInstitutions,
  });
  const departmentsQuery = useQuery({
    queryKey: ['affiliations', 'departments', institutionId],
    queryFn: () => affiliationService.getDepartments(Number(institutionId)),
    enabled: !!institutionId,
  });
  const affiliationsQuery = useQuery({
    queryKey: ['student', 'affiliations'],
    queryFn: () => affiliationService.getMine(),
  });
  const currentQuery = useQuery({
    queryKey: ['student', 'current-affiliation'],
    queryFn: affiliationService.getCurrent,
  });

  const requestMutation = useMutation({
    mutationFn: affiliationService.createRequest,
    onSuccess: () => {
      setEnrollmentNumber('');
      setDepartmentId('');
      queryClient.invalidateQueries({ queryKey: ['student', 'affiliations'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'current-affiliation'] });
    },
    onError: (requestError: any) => setError(requestError.message || 'Unable to submit affiliation request'),
  });

  const latest = useMemo(
    () => affiliationsQuery.data?.affiliations?.[0] ?? null,
    [affiliationsQuery.data]
  );
  const current = currentQuery.data;
  const canRequest = !current || current.status === 'REJECTED';

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!institutionId || !departmentId || !enrollmentNumber.trim()) {
      setError('Select an institution, department, and enrollment number.');
      return;
    }
    requestMutation.mutate({
      institutionId: Number(institutionId),
      departmentId: Number(departmentId),
      enrollmentNumber: enrollmentNumber.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutional Affiliation</h1>
        <p className="mt-1 text-sm text-slate-500">Request membership separately from your student account.</p>
      </div>

      {current && (
        <Card className="border-indigo-100">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 text-indigo-600" size={22} />
              <div>
                <p className="font-semibold text-slate-900">{current.institution?.institutionName || 'Institution'}</p>
                <p className="text-sm text-slate-500">{current.department?.departmentName || 'Department'} · {current.enrollmentNumber}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[current.status]}`}>
              {current.status === 'PENDING' && <Clock3 size={14} />}
              {current.status === 'VERIFIED' && <CheckCircle2 size={14} />}
              {current.status}
            </span>
          </CardContent>
        </Card>
      )}

      {latest?.status === 'REJECTED' && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <XCircle size={18} className="mt-0.5 shrink-0" />
          <div><strong>Previous request rejected.</strong> {latest.rejectionReason || 'You may submit a corrected request.'}</div>
        </div>
      )}

      {canRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Request affiliation</CardTitle>
            <CardDescription>Your request will remain pending until the institution reviews it.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              {error && <div className="flex items-center gap-2 text-sm text-rose-700"><AlertCircle size={16} />{error}</div>}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Institution
                  <select
                    value={institutionId}
                    onChange={(event) => { setInstitutionId(event.target.value); setDepartmentId(''); }}
                    className="mt-1 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="">Select institution</option>
                    {(institutionsQuery.data || []).map((institution) => (
                      <option key={institution.id} value={institution.id}>{institution.institutionName}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Department
                  <select
                    value={departmentId}
                    onChange={(event) => setDepartmentId(event.target.value)}
                    disabled={!institutionId || departmentsQuery.isLoading}
                    className="mt-1 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100"
                  >
                    <option value="">Select department</option>
                    {(departmentsQuery.data || []).map((department) => (
                      <option key={department.id} value={department.id}>{department.departmentName}</option>
                    ))}
                  </select>
                </label>
              </div>
              <Input
                label="Enrollment / Roll Number"
                value={enrollmentNumber}
                onChange={(event) => setEnrollmentNumber(event.target.value)}
                placeholder="e.g. CSE-2026-001"
                maxLength={100}
              />
              <Button type="submit" isLoading={requestMutation.isPending}>
                Submit affiliation request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Affiliation history</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(affiliationsQuery.data?.affiliations || []).map((affiliation) => (
            <div key={affiliation.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{affiliation.institution?.institutionName || 'Institution'}</p>
                <p className="text-xs text-slate-500">{affiliation.department?.departmentName || 'Department'} · {affiliation.enrollmentNumber}</p>
              </div>
              <span className={`border rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[affiliation.status]}`}>{affiliation.status}</span>
            </div>
          ))}
          {!affiliationsQuery.data?.affiliations?.length && <p className="text-sm text-slate-500">No affiliation requests yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
};
