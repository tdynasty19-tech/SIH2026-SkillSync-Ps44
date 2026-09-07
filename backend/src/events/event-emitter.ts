import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export enum AppEventType {
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  OPPORTUNITY_CREATED = 'OPPORTUNITY_CREATED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  DOCUMENT_ACCESSED = 'DOCUMENT_ACCESSED',
  PLACEMENT_CHANGED = 'PLACEMENT_CHANGED',
  SKILL_GAP_DETECTED = 'SKILL_GAP_DETECTED',
  MENTORSHIP_ACCEPTED = 'MENTORSHIP_ACCEPTED',
  ROLE_SENSITIVE_ACTION = 'ROLE_SENSITIVE_ACTION',
}

export class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners for application lifecycle events
    this.setMaxListeners(50);
  }

  public emitSafe(event: AppEventType | string, ...args: any[]): boolean {
    try {
      return this.emit(event, ...args);
    } catch (err: any) {
      logger.error(`Error dispatching internal event '${event}'`, { error: err.message });
      return false;
    }
  }
}

export const appEvents = new AppEventEmitter();
