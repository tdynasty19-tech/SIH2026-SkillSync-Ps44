import { Response, NextFunction } from 'express';
import { documentService, DocumentService } from '../services/document.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createDocumentSchema,
  updateDocumentSchema,
  grantDocumentAccessSchema,
  documentQuerySchema,
} from '../validators/document.validator';

export class DocumentController {
  constructor(private readonly service: DocumentService = documentService) {}

  public createDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createDocumentSchema.parse(req.body);
      const result = await this.service.createDocument(req.user!.id, validated);
      sendSuccess(res, 'Document created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public uploadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Handles either multer file or JSON payload with file details
      const file = (req as any).file || req.body.file;
      const accessLevel = req.body.accessLevel;
      const result = await this.service.uploadDocument(req.user!.id, file, accessLevel);
      sendSuccess(res, 'Document uploaded successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public getMyDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = documentQuerySchema.parse(req.query);
      const result = await this.service.getMyDocuments(req.user!.id, query);
      sendSuccess(res, 'My documents fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getSharedDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = documentQuerySchema.parse(req.query);
      const result = await this.service.getSharedDocuments(req.user!.id, query);
      sendSuccess(res, 'Shared documents fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getDocumentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = Number(req.params.documentId);
      const result = await this.service.getDocumentById(req.user!.id, documentId);
      sendSuccess(res, 'Document fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public updateDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = Number(req.params.documentId);
      const validated = updateDocumentSchema.parse(req.body);
      const result = await this.service.updateDocument(req.user!.id, documentId, validated);
      sendSuccess(res, 'Document updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = Number(req.params.documentId);
      const result = await this.service.deleteDocument(req.user!.id, documentId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public grantAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = Number(req.params.documentId);
      const validated = grantDocumentAccessSchema.parse(req.body);
      const result = await this.service.grantAccess(req.user!.id, documentId, validated);
      sendSuccess(res, 'Document access granted successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public revokeAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = Number(req.params.documentId);
      const granteeUserId = Number(req.params.granteeUserId);
      const result = await this.service.revokeAccess(req.user!.id, documentId, granteeUserId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const documentController = new DocumentController();
