import { documentRepository, DocumentRepository } from '../repositories/document.repository';
import { storageService, StorageService, UploadedFilePayload } from '../utils/storage.util';
import {
  CreateDocumentInput,
  UpdateDocumentInput,
  GrantDocumentAccessInput,
  UpdateDocumentAccessInput,
} from '../validators/document.validator';
import { DocumentAccessLevel } from '../constants/enums';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  ValidationError,
} from '../errors/app.error';
import { appEvents, AppEventType } from '../events';

export class DocumentService {
  constructor(
    private readonly repository: DocumentRepository = documentRepository,
    private readonly storage: StorageService = storageService
  ) {}

  public async createDocument(userId: number, input: CreateDocumentInput) {
    const document = await this.repository.createDocument({
      ownerUserId: userId,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      accessLevel: input.accessLevel || DocumentAccessLevel.PRIVATE,
    });

    return document.toJSON();
  }

  public async uploadDocument(
    userId: number,
    file: UploadedFilePayload,
    accessLevel: DocumentAccessLevel = DocumentAccessLevel.PRIVATE
  ) {
    if (!file || !file.size) {
      throw new ValidationError('A valid file payload must be provided');
    }

    const stored = await this.storage.upload(file);

    const document = await this.repository.createDocument({
      ownerUserId: userId,
      fileName: stored.fileName,
      fileUrl: stored.fileUrl,
      fileType: stored.fileType,
      fileSizeBytes: stored.fileSizeBytes,
      accessLevel,
    });

    return document.toJSON();
  }

  public async getDocumentById(userId: number, documentId: number) {
    const document = await this.repository.findDocumentById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    const isOwner = document.ownerUserId === userId;
    const isPublic = document.accessLevel === DocumentAccessLevel.PUBLIC;
    const hasGrant = (document as any).accessGrants?.some(
      (grant: any) => grant.granteeUserId === userId && grant.canView
    );

    if (!isOwner && !isPublic && !hasGrant) {
      throw new AuthorizationError('Access forbidden: You do not have permission to view this document');
    }

    const accessibleUrl = await this.storage.getAccessibleUrl(document.fileUrl);

    appEvents.emitSafe(AppEventType.DOCUMENT_ACCESSED, {
      documentId,
      accessingUserId: userId,
    });

    return {
      ...document.toJSON(),
      accessibleUrl,
    };
  }

  public async getMyDocuments(
    userId: number,
    query: { page: number; limit: number; accessLevel?: DocumentAccessLevel }
  ) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.findOwnedDocuments(
      userId,
      query.limit,
      offset,
      query.accessLevel
    );

    return {
      documents: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getSharedDocuments(userId: number, query: { page: number; limit: number }) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.findSharedDocuments(userId, query.limit, offset);

    return {
      documents: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async updateDocument(userId: number, documentId: number, input: UpdateDocumentInput) {
    const document = await this.repository.findDocumentById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.ownerUserId !== userId) {
      throw new AuthorizationError('Only the document owner can update document metadata');
    }

    const updates: any = {};
    if (input.fileName) updates.fileName = input.fileName;
    if (input.accessLevel) updates.accessLevel = input.accessLevel;

    await this.repository.updateDocument(documentId, updates);
    const updated = await this.repository.findDocumentById(documentId);
    return updated!.toJSON();
  }

  public async deleteDocument(userId: number, documentId: number) {
    const document = await this.repository.findDocumentById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.ownerUserId !== userId) {
      throw new AuthorizationError('Only the document owner can delete this document');
    }

    // Delete remote/local file
    await this.storage.delete(document.fileUrl);

    // Delete record
    await this.repository.deleteDocument(documentId);

    return { message: 'Document deleted successfully' };
  }

  // ----------------------------------------------------
  // Document Access Grants
  // ----------------------------------------------------
  public async grantAccess(userId: number, documentId: number, input: GrantDocumentAccessInput) {
    const document = await this.repository.findDocumentById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.ownerUserId !== userId) {
      throw new AuthorizationError('Only the document owner can grant access to this document');
    }

    if (input.granteeUserId === userId) {
      throw new ValidationError('You already own this document and cannot grant access to yourself');
    }

    const existing = await this.repository.findAccess(documentId, input.granteeUserId);
    if (existing) {
      await this.repository.updateAccess(existing.id, {
        canView: input.canView !== undefined ? input.canView : true,
        canEdit: input.canEdit !== undefined ? input.canEdit : false,
      });
      const updated = await this.repository.findAccess(documentId, input.granteeUserId);
      return updated!.toJSON();
    }

    const grant = await this.repository.grantAccess({
      documentId,
      granteeUserId: input.granteeUserId,
      canView: input.canView !== undefined ? input.canView : true,
      canEdit: input.canEdit !== undefined ? input.canEdit : false,
    });

    return grant.toJSON();
  }

  public async revokeAccess(userId: number, documentId: number, granteeUserId: number) {
    const document = await this.repository.findDocumentById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.ownerUserId !== userId) {
      throw new AuthorizationError('Only the document owner can revoke access to this document');
    }

    const deleted = await this.repository.revokeAccess(documentId, granteeUserId);
    if (!deleted) {
      throw new NotFoundError('Document access grant not found for this user');
    }

    return { message: 'Access revoked successfully' };
  }
}

export const documentService = new DocumentService();
