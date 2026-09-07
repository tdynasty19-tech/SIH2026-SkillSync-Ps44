/**
 * SIH PS 44 - User Roles
 * Strictly defined according to the BACKEND MASTER PROMPT:
 * - Student
 * - Industry
 * - Academician
 * - Institution
 *
 * No additional roles should be added without explicit specification in the master prompt.
 */
export enum UserRole {
  STUDENT = 'Student',
  INDUSTRY = 'Industry',
  ACADEMICIAN = 'Academician',
  INSTITUTION = 'Institution',
}

export const ALLOWED_ROLES = Object.values(UserRole);
