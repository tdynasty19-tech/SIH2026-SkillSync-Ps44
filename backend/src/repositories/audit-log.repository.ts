import { Transaction } from 'sequelize';
import '../models';
import {
  AuditLog,
  AuditLogAttributes,
  AuditLogCreationAttributes,
} from '../models/audit-log.model';
import { User } from '../models/user.model';

export class AuditLogRepository {
  public async createAuditLog(
    data: AuditLogCreationAttributes,
    transaction?: Transaction
  ): Promise<AuditLog> {
    return AuditLog.create(data, { transaction });
  }

  public async findAuditLogs(
    limit = 50,
    offset = 0,
    filters?: { userId?: number; action?: string; entityType?: string }
  ) {
    const where: any = {};
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.action) {
      where.action = filters.action;
    }
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    return AuditLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
    });
  }

  public async findAuditLogById(id: number): Promise<AuditLog | null> {
    return AuditLog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
