import React from 'react';
import { Badge } from './Badge';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SkillBadgeProps {
  name: string;
  verified?: boolean;
  isVerified?: boolean;
  level?: number | string;
  className?: string;
}

export const SkillBadge = ({ name, verified, isVerified, level, className }: SkillBadgeProps) => {
  const isSkillVerified = verified || isVerified;
  return (
    <Badge
      variant={isSkillVerified ? 'primary' : 'secondary'}
      className={cn('flex items-center gap-1 w-max', className)}
    >
      {name}
      {level !== undefined && (
        <span className="opacity-75 text-[10px] ml-1">
          {typeof level === 'number' ? `L${level}` : level}
        </span>
      )}
      {isSkillVerified && <CheckCircle2 size={12} className="text-indigo-600" />}
    </Badge>
  );
};
