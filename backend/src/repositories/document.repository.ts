import { Op, Transaction } from 'sequelize';
import '../models';
import {
  Document,
  DocumentAttributes,
  DocumentCreationAttributes,
} from '../models/document.model';
import {
  DocumentAccess,
  DocumentAccessAttributes,
  DocumentAccessCreationAttributes,
} from '../models/document-access.model';
import { User } from '../models/user.model';
import { DocumentAccessLevel } from '../constants/enums';

export class DocumentRepository {
  // ----------------------------------------------------
  // 1. Documents
  // ----------------------------------------------------
  public async findDocumentById(id: number): Promise<Document | null> {
    return Document.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: DocumentAccess,
          as: 'accessGrants',
          include: [
            {
              model: User,
              as: 'grantee',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });
  }

  public async findOwnedDocuments(
    ownerUserId: number,
    limit: number,
    offset: number,
    accessLevel?: DocumentAccessLevel
  ) {
    const where: any = { ownerUserId };
    if (accessLevel) {
      where.accessLevel = accessLevel;
    }

    return Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async findSharedDocuments(granteeUserId: number, limit: number, offset: number) {
    return Document.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: DocumentAccess,
          as: 'accessGrants',
          where: { granteeUserId, canView: true },
          required: true,
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  public async createDocument(
    data: DocumentCreationAttributes,
    transaction?: Transaction
  ): Promise<Document> {
    return Document.create(data, { transaction });
  }

  public async updateDocument(
    id: number,
    data: Partial<DocumentAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return Document.update(data, {
      where: { id },
      transaction,
    });
  }

  public async deleteDocument(id: number, transaction?: Transaction): Promise<number> {
    return Document.destroy({
      where: { id },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 2. Document Access
  // ----------------------------------------------------
  public async findAccess(documentId: number, granteeUserId: number): Promise<DocumentAccess | null> {
    return DocumentAccess.findOne({
      where: { documentId, granteeUserId },
    });
  }

  public async findAccessListForDocument(documentId: number) {
    return DocumentAccess.findAll({
      where: { documentId },
      include: [
        {
          model: User,
          as: 'grantee',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  public async grantAccess(
    data: DocumentAccessCreationAttributes,
    transaction?: Transaction
  ): Promise<DocumentAccess> {
    return DocumentAccess.create(data, { transaction });
  }

  public async updateAccess(
    id: number,
    data: Partial<DocumentAccessAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return DocumentAccess.update(data, {
      where: { id },
      transaction,
    });
  }

  public async revokeAccess(
    documentId: number,
    granteeUserId: number,
    transaction?: Transaction
  ): Promise<number> {
    return DocumentAccess.destroy({
      where: { documentId, granteeUserId },
      transaction,
    });
  }
}

export const documentRepository = new DocumentRepository();
