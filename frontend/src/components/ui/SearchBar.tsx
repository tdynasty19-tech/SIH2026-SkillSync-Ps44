import React from 'react';
import { Search } from 'lucide-react';
import { Input, InputProps } from './Input';
import { cn } from '../../utils/cn';

export const SearchBar = ({ className, ...props }: InputProps) => {
  return (
    <Input
      placeholder="Search..."
      leftIcon={<Search size={18} />}
      className={cn("rounded-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500", className)}
      {...props}
    />
  );
};
