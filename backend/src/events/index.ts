import { registerNotificationHandlers } from './handlers/notification.handler';
import { registerAuditHandlers } from './handlers/audit.handler';

export const initEventSubscribers = () => {
  registerNotificationHandlers();
  registerAuditHandlers();
};

export { appEvents, AppEventType } from './event-emitter';
