import { Router, Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/api-response';
import { sequelize } from '../config/database';
import { HttpStatus } from '../constants/http-status';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System health check
 *     description: Returns the health status of the backend service without requiring authentication.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Backend is healthy
 */
router.get('/', (req: Request, res: Response) => {
  return sendSuccess(res, 'Backend is healthy', {
    status: 'ok',
  });
});

/**
 * @openapi
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Returns liveness status of the application process.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Process is running
 */
router.get('/live', (req: Request, res: Response) => {
  return sendSuccess(res, 'Service is live', {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Verifies critical infrastructure dependencies (database connectivity) are ready to handle traffic.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    return sendSuccess(res, 'Service is ready', {
      status: 'ready',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(
      res,
      'Service is not ready - database unreachable',
      [{ message: (error as Error).message }],
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
});

export const healthRoutes = router;
