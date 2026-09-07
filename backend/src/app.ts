import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import { swaggerSpec } from './config/swagger.config';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { globalRateLimiter } from './middlewares/rate-limiter.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiV1Routes } from './routes';
import { initEventSubscribers } from './events';

export const createApp = (): Application => {
  const app = express();

  // Initialize event subscribers
  initEventSubscribers();

  // Explicitly disable X-Powered-By header to prevent server technology fingerprinting
  app.disable('x-powered-by');

  // Request correlation ID tracing
  app.use(requestIdMiddleware);

  // 1. Security Headers via Helmet
  app.use(helmet());

  // 2. Cross-Origin Resource Sharing (CORS)
  // Parse comma-separated list of allowed origins from FRONTEND_URL
  const allowedOrigins = env.FRONTEND_URL
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.trim().replace(/\/+$/, '');
        if (allowedOrigins.indexOf(normalizedOrigin) !== -1 || env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy: Access denied for origin ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
    })
  );

  // 3. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Rate Limiting
  app.use(globalRateLimiter);

  // 5. HTTP Request Logging
  app.use(requestLogger);

  // 6. Swagger API Documentation
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Convenience redirect from root /docs to /api/v1/docs
  app.get('/docs', (_req, res) => res.redirect('/api/v1/docs'));

  // 7. Mount Core REST API Endpoints under /api/v1
  app.use('/api/v1', apiV1Routes);

  // 8. 404 Not Found Middleware
  app.use(notFoundHandler);

  // 9. Centralized Global Error Handler Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
