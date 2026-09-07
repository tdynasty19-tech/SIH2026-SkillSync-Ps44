import { appEvents, AppEventType } from '../event-emitter';
import { notificationService } from '../../services/notification.service';
import { NotificationType } from '../../constants/enums';
import { logger } from '../../utils/logger';

let isNotificationRegistered = false;

export const registerNotificationHandlers = () => {
  if (isNotificationRegistered) return;
  isNotificationRegistered = true;

  // 1. Application Submitted
  appEvents.on(AppEventType.APPLICATION_SUBMITTED, async (payload: {
    studentUserId: number;
    opportunityTitle: string;
    applicationId: number;
  }) => {
    try {
      await notificationService.createNotification({
        userId: payload.studentUserId,
        title: 'Application Submitted',
        message: `You have successfully applied to '${payload.opportunityTitle}'.`,
        type: NotificationType.APPLICATION_SUBMITTED,
        data: { applicationId: payload.applicationId },
      });
    } catch (err: any) {
      logger.error('Failed to dispatch APPLICATION_SUBMITTED notification', { error: err.message });
    }
  });

  // 2. Application Status Changed
  appEvents.on(AppEventType.APPLICATION_STATUS_CHANGED, async (payload: {
    studentUserId: number;
    opportunityTitle: string;
    newStatus: string;
    applicationId: number;
  }) => {
    try {
      let type: NotificationType | null = null;
      let title = 'Application Status Update';
      let message = `Your application status for '${payload.opportunityTitle}' has changed to ${payload.newStatus}.`;

      switch (payload.newStatus) {
        case 'SHORTLISTED':
          type = NotificationType.SHORTLISTED;
          title = 'Application Shortlisted';
          message = `Congratulations! Your application for '${payload.opportunityTitle}' has been shortlisted.`;
          break;
        case 'REJECTED':
          type = NotificationType.REJECTED;
          title = 'Application Status Update';
          message = `Thank you for your interest. Your application for '${payload.opportunityTitle}' was not selected at this time.`;
          break;
        case 'SELECTED':
          type = NotificationType.STUDENT_SELECTED;
          title = 'Congratulations! You Have Been Selected';
          message = `You have been selected for '${payload.opportunityTitle}'!`;
          break;
        case 'INTERVIEW_SCHEDULED':
          type = NotificationType.INTERVIEW_SCHEDULED;
          title = 'Interview Scheduled';
          message = `An interview has been scheduled for your application to '${payload.opportunityTitle}'.`;
          break;
        default:
          break;
      }

      if (type) {
        await notificationService.createNotification({
          userId: payload.studentUserId,
          title,
          message,
          type,
          data: { applicationId: payload.applicationId, status: payload.newStatus },
        });
      }
    } catch (err: any) {
      logger.error('Failed to dispatch APPLICATION_STATUS_CHANGED notification', { error: err.message });
    }
  });

  // 3. New Opportunity
  appEvents.on(AppEventType.OPPORTUNITY_CREATED, async (payload: {
    targetUserId?: number;
    opportunityTitle: string;
    opportunityId: number;
    opportunityType: string;
  }) => {
    try {
      if (payload.targetUserId) {
        await notificationService.createNotification({
          userId: payload.targetUserId,
          title: 'New Opportunity Available',
          message: `A new ${payload.opportunityType}: '${payload.opportunityTitle}' has been posted.`,
          type: NotificationType.NEW_OPPORTUNITY,
          data: { opportunityId: payload.opportunityId, opportunityType: payload.opportunityType },
        });
      }
    } catch (err: any) {
      logger.error('Failed to dispatch OPPORTUNITY_CREATED notification', { error: err.message });
    }
  });

  // 4. Skill Gap Detected
  appEvents.on(AppEventType.SKILL_GAP_DETECTED, async (payload: {
    studentUserId: number;
    skillName: string;
    skillGapId?: number;
  }) => {
    try {
      await notificationService.createNotification({
        userId: payload.studentUserId,
        title: 'Skill Gap Identified',
        message: `A skill gap was identified in '${payload.skillName}'. Explore learning programs to build proficiency.`,
        type: NotificationType.SKILL_GAP_DETECTED,
        data: { skillName: payload.skillName, skillGapId: payload.skillGapId },
      });
    } catch (err: any) {
      logger.error('Failed to dispatch SKILL_GAP_DETECTED notification', { error: err.message });
    }
  });

  // 5. Mentorship Accepted
  appEvents.on(AppEventType.MENTORSHIP_ACCEPTED, async (payload: {
    studentUserId: number;
    mentorName: string;
    mentorshipRequestId: number;
  }) => {
    try {
      await notificationService.createNotification({
        userId: payload.studentUserId,
        title: 'Mentorship Request Accepted',
        message: `Great news! Your mentorship request was accepted by ${payload.mentorName}.`,
        type: NotificationType.MENTORSHIP_ACCEPTED,
        data: { mentorshipRequestId: payload.mentorshipRequestId },
      });
    } catch (err: any) {
      logger.error('Failed to dispatch MENTORSHIP_ACCEPTED notification', { error: err.message });
    }
  });
};
