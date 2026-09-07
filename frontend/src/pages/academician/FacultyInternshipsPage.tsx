import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../../components/ui/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { opportunityService } from '../../services/opportunityService';
import { FacultyOpportunityItem } from '../../types/opportunity.types';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  RefreshCw, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const FacultyInternshipsPage: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['facultyOpportunities', selectedDept],
    queryFn: () =>
      opportunityService.getFacultyOpportunities({
        department: selectedDept !== 'ALL' ? selectedDept : undefined,
      }),
  });

  const opportunities: FacultyOpportunityItem[] = data?.facultyOpportunities || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            Faculty Industry Exposure & Fellowships
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore industry fellowships, faculty sabbaticals, and specialized immersion opportunities.
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
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Active Faculty Immersion Calls
          </CardTitle>
          <span className="text-xs font-semibold text-slate-400">{opportunities.length} Active Postings</span>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <LoadingSkeleton className="h-14 rounded-xl" />
              <LoadingSkeleton className="h-14 rounded-xl" />
              <LoadingSkeleton className="h-14 rounded-xl" />
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-500 text-sm space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
              <p className="font-semibold">Failed to load faculty opportunity listings.</p>
              <p className="text-xs text-red-400">{(error as Error)?.message}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-semibold text-slate-700">No faculty immersion programs currently listed.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Check back periodically as partner institutions and corporate research labs post new fellowship calls.
              </p>
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: 'Program Title',
                  cell: (item: FacultyOpportunityItem) => (
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                  ),
                },
                {
                  header: 'Host Entity',
                  cell: (item: FacultyOpportunityItem) => {
                    const hostName =
                      item.industry?.companyName || item.institution?.institutionName || 'Enterprise Partner';
                    return <span className="text-xs font-semibold text-slate-800">{hostName}</span>;
                  },
                },
                {
                  header: 'Target Department',
                  cell: (item: FacultyOpportunityItem) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {item.department || 'Open to All'}
                    </span>
                  ),
                },
                {
                  header: 'Deadline',
                  cell: (item: FacultyOpportunityItem) => (
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.applicationDeadline
                        ? new Date(item.applicationDeadline).toLocaleDateString()
                        : 'Rolling Application'}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  cell: (item: FacultyOpportunityItem) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                      {item.status || 'OPEN'}
                    </span>
                  ),
                },
              ]}
              data={opportunities}
              keyExtractor={(item: FacultyOpportunityItem) => String(item.id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
