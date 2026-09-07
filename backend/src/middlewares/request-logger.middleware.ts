import morgan from 'morgan';
import { logger } from '../utils/logger';

// Stream adapter to pipe morgan logs into Winston
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Morgan HTTP request logging middleware
export const requestLogger = morgan(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
  { stream }
);
