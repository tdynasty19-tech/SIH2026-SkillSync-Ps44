import { z } from 'zod';
import { DocumentAccessLevel } from '../constants/enums';

export const createDocumentSchema = z.object({
  fileName: z.string().trim().min(1, 'File name is required').max(255),
  fileUrl: z.string().trim().min(1, 'File URL is required').max(1024),
  fileType: z.string().trim().min(1, 'File type is required').max(50),
  fileSizeBytes: z.coerce.number().int().positive('File size must be positive'),
  accessLevel: z.nativeEnum(DocumentAccessLevel).optional().default(DocumentAccessLevel.PRIVATE),
});

export const updateDocumentSchema = z.object({
  fileName: z.string().trim().min(1).max(255).optional(),
  accessLevel: z.nativeEnum(DocumentAccessLevel).optional(),
});

export const grantDocumentAccessSchema = z.object({
  granteeUserId: z.coerce.number().int().positive('Valid granteeUserId is required'),
  canView: z.boolean().optional().default(true),
  canEdit: z.boolean().optional().default(false),
});

export const updateDocumentAccessSchema = z.object({
  canView: z.boolean().optional(),
  canEdit: z.boolean().optional(),
});

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  accessLevel: z.nativeEnum(DocumentAccessLevel).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type GrantDocumentAccessInput = z.infer<typeof grantDocumentAccessSchema>;
export type UpdateDocumentAccessInput = z.infer<typeof updateDocumentAccessSchema>;
