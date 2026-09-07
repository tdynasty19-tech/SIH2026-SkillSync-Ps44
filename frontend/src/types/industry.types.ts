import { User } from './auth.types';

export interface Industry extends User {
  role: 'industry';
  companyName: string;
  industryType: string;
  website: string;
  description: string;
  employeeCount: string;
  location: string;
  logoUrl?: string;
}
