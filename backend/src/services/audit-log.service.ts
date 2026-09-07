import { auditLogRepository, AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditAction } from '../constants/enums';
import { logger } from '../utils/logger';

export interface AuditLogPayload {
  userId?: number | null;
  action: AuditAction | string;
  entityType: string;
  entityId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
}

export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository = auditLogRepository) {}

  /**
   * Sanitizes metadata by redacting any sensitive authentication or credential keys.
   */
  private sanitizeMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return metadata;
    }

    const sensitiveKeys = [
      'password',
      'passwordhash',
      'token',
      'accesstoken',
      'refreshtoken',
      'jwtsecret',
      'secret',
      'authorization',
      'credentials',
      'key',
    ];

    const sanitized: any = Array.isArray(metadata) ? [] : {};

    for (const [k, v] of Object.entries(metadata)) {
      if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
        sanitized[k] = '[REDACTED]';
      } else if (v && typeof v === 'object') {
        sanitized[k] = this.sanitizeMetadata(v);
      } else {
        sanitized[k] = v;
      }
    }

    return sanitized;
  }

  /**
   * Log an audit event safely without corrupting primary business transactions.
   */
  public async log(payload: AuditLogPayload): Promise<void> {
    try {
      const sanitizedMeta = this.sanitizeMetadata(payload.metadata);

      await this.repository.createAuditLog({
        userId: payload.userId ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId ?? null,
        ipAddress: payload.ipAddress ?? null,
        userAgent: payload.userAgent ? payload.userAgent.substring(0, 255) : null,
        metadata: sanitizedMeta ?? null,
      });
    } catch (err: any) {
      // Non-fatal: Log failure to structured logger, do not throw
      logger.error('Failed to record audit log', {
        action: payload.action,
        entityType: payload.entityType,
        error: err.message,
      });
    }
  }

  public async getAuditLogs(
    query: { page?: number; limit?: number; userId?: number; action?: string; entityType?: string }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.repository.findAuditLogs(limit, offset, {
      userId: query.userId,
      action: query.action,
      entityType: query.entityType,
    });

    return {
      auditLogs: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export const auditLogService = new AuditLogService();
