import { User } from './auth.types';

export interface Academician extends User {
  role: 'academician';
  institutionId: string;
  institutionName: string;
  department: string;
  designation: string;
  specialization: string[];
}
