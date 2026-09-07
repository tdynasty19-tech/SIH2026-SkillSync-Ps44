import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { analyticsService, PlacementAnalyticsData } from '../../services/analyticsService';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { 
  TrendingUp, 
  Award, 
  Users, 
  Building2, 
  DollarSign, 
  RefreshCw, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const PlacementAnalyticsPage = () => {
  const [academicYear, setAcademicYear] = useState<string>('ALL');

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PlacementAnalyticsData>({
    queryKey: ['placementAnalytics', academicYear],
    queryFn: () => analyticsService.getPlacementAnalytics(academicYear),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Placement Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time institutional placement and compensation metrics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
        </div>
        <LoadingSkeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl max-w-xl mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-900">Failed to Load Placement Analytics</h2>
        <p className="text-sm text-red-600">
          {(error as Error)?.message || 'An unexpected error occurred while fetching institutional placement data.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2 inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  const topCompanies = analytics?.topCompanies || [];
  const departmentPlacements = analytics?.departmentPlacements || [];
  const placementRate = analytics?.placementRate || 0;
  const avgPackage = analytics?.recordAverageSalary || analytics?.overallAverageSalary || 0;
  const highestPackage = analytics?.recordHighestSalary || analytics?.recordHighestSalary || 0;
  const placedStudents = analytics?.placedStudents || analytics?.totalRecords || 0;
  const totalStudents = analytics?.totalStudents || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Placement Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Authoritative placement statistics for <span className="font-semibold text-slate-700">{analytics?.institutionName || 'Your Institution'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Academic Years</option>
            <option value="2025-2026">2025 - 2026</option>
            <option value="2024-2025">2024 - 2025</option>
            <option value="2023-2024">2023 - 2024</option>
          </select>
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{placementRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">{placedStudents} placed of {totalStudents || placedStudents} eligible</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average CTC</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {avgPackage > 0 ? `₹${(avgPackage / 100000).toFixed(2)} LPA` : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Across verified offers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest CTC</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {highestPackage > 0 ? `₹${(highestPackage / 100000).toFixed(2)} LPA` : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Peak campus offer</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Recruiters</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{topCompanies.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Active hiring partners</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grids */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Recruiting Companies */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Top Recruiting Companies
            </CardTitle>
            <span className="text-xs font-medium text-slate-400">{topCompanies.length} Recruiters</span>
          </CardHeader>
          <CardContent className="p-4">
            {topCompanies.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No recruiter offer records found for the selected academic period.
              </div>
            ) : (
              <DataTable
                columns={[
                  { 
                    header: 'Company', 
                    accessorKey: 'companyName',
                    cell: (info: any) => (
                      <span className="font-semibold text-slate-800">{info.getValue() || 'Corporate Partner'}</span>
                    )
                  },
                  { 
                    header: 'Offers Released', 
                    accessorKey: 'offersCount',
                    cell: (info: any) => (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {info.getValue()} Offers
                      </span>
                    )
                  },
                  { 
                    header: 'Average Package', 
                    accessorKey: 'averagePackage',
                    cell: (info: any) => {
                      const val = info.getValue();
                      return (
                        <span className="font-semibold text-slate-700">
                          {val ? `₹${(Number(val) / 100000).toFixed(2)} LPA` : 'Disclosed Upon Joining'}
                        </span>
                      );
                    }
                  },
                ]}
                data={topCompanies}
                keyExtractor={(item: any) => item.companyName || String(Math.random())}
              />
            )}
          </CardContent>
        </Card>

        {/* Department-wise Placement Breakdown */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Department-wise Placement Distribution
            </CardTitle>
            <span className="text-xs font-medium text-slate-400">{departmentPlacements.length} Departments</span>
          </CardHeader>
          <CardContent className="p-4">
            {departmentPlacements.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No department distribution records found for this period.
              </div>
            ) : (
              <div className="space-y-4">
                {departmentPlacements.map((dept, idx) => {
                  const maxCount = Math.max(...departmentPlacements.map((d) => d.offersCount), 1);
                  const percentage = Math.round((dept.offersCount / maxCount) * 100);
                  return (
                    <div key={dept.department || idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{dept.department}</span>
                        <span className="text-indigo-600 font-bold">{dept.offersCount} Placements</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
