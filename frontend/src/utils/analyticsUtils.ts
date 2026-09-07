import { ChartDataPoint } from '../types/analytics.types';

export const aggregateData = (data: any[], key: string): ChartDataPoint[] => {
  const counts = data.reduce<Record<string, number>>((acc, curr) => {
    const val = String(curr[key] || 'Unknown');
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};
