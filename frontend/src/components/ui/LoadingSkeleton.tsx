import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse bg-slate-200 rounded-md", className)} {...props} />
);
