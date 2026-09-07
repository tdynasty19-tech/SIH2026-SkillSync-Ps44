import { appEvents, AppEventType } from '../event-emitter';
import { auditLogService } from '../../services/audit-log.service';
import { AuditAction } from '../../constants/enums';

let isAuditRegistered = false;

export const registerAuditHandlers = () => {
  if (isAuditRegistered) return;
  isAuditRegistered = true;

  // 1. Login Auditing
  appEvents.on(AppEventType.USER_LOGGED_IN, async (payload: {
    userId: number;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) => {
    await auditLogService.log({
      userId: payload.userId,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: payload.userId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
  });

  // 2. Opportunity Creation Auditing
  appEvents.on(AppEventType.OPPORTUNITY_CREATED, async (payload: {
    opportunityId: number;
    creatorUserId?: number;
    opportunityTitle?: string;
    opportunityType?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) => {
    await auditLogService.log({
      userId: payload.creatorUserId,
      action: AuditAction.OPPORTUNITY_CREATED,
      entityType: 'Opportunity',
      entityId: payload.opportunityId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      metadata: {
        title: payload.opportunityTitle,
        type: payload.opportunityType,
      },
    });
  });

  // 3. Application Status Changed Auditing
  appEvents.on(AppEventType.APPLICATION_STATUS_CHANGED, async (payload: {
    applicationId: number;
    actorUserId?: number;
    previousStatus?: string;
    newStatus: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) => {
    await auditLogService.log({
      userId: payload.actorUserId,
      action: AuditAction.APPLICATION_STATUS_CHANGED,
      entityType: 'Application',
      entityId: payload.applicationId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      metadata: {
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
      },
    });
  });

  // 4. Document Access Auditing
  appEvents.on(AppEventType.DOCUMENT_ACCESSED, async (payload: {
    documentId: number;
    accessingUserId: number;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) => {
    await auditLogService.log({
      userId: payload.accessingUserId,
      action: AuditAction.DOCUMENT_ACCESSED,
      entityType: 'Document',
      entityId: payload.documentId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
  });

  // 5. Placement Changed Auditing
  appEvents.on(AppEventType.PLACEMENT_CHANGED, async (payload: {
    placementId: number;
    actorUserId: number;
    actionType: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) => {
    await auditLogService.log({
      userId: payload.actorUserId,
      action: AuditAction.PLACEMENT_CHANGED,
      entityType: 'Placement',
      entityId: payload.placementId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      metadata: { actionType: payload.actionType },
    });
  });

  // 6. Role Sensitive Action Auditing
  appEvents.on(AppEventType.ROLE_SENSITIVE_ACTION, async (payload: {
    actorUserId: number;
    actionDescription: string;
    entityType: string;
    entityId?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: any;
  }) => {
    await auditLogService.log({
      userId: payload.actorUserId,
      action: AuditAction.ROLE_SENSITIVE_ACTION,
      entityType: payload.entityType,
      entityId: payload.entityId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      metadata: {
        description: payload.actionDescription,
        ...payload.metadata,
      },
    });
  });
};
