import http from 'http';
import app from './app';
import { env } from './config/env.config';
import { testDatabaseConnection, sequelize } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  const server = http.createServer(app);

  server.listen(env.PORT, async () => {
    logger.info(`==================================================`);
    logger.info(` SIH PS 44 Backend Service Started Successfully  `);
    logger.info(` Environment: ${env.NODE_ENV}                     `);
    logger.info(` Port       : ${env.PORT}                         `);
    logger.info(` Health URL : http://localhost:${env.PORT}/api/v1/health `);
    logger.info(` API Docs   : http://localhost:${env.PORT}/api/v1/docs   `);
    logger.info(`==================================================`);

    // Test database connection without syncing tables
    await testDatabaseConnection();
  });

  // Graceful shutdown handling
  let isShuttingDown = false;
  const shutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`Received ${signal}. Gracefully shutting down...`);

    // Force shutdown if taking longer than 10s
    const forceTimer = setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
    forceTimer.unref();

    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await sequelize.close();
        logger.info('Database connection pool closed.');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing database connections during shutdown:', {
          error: (err as Error).message,
        });
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection:', { reason });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception thrown:', { error: error.message, stack: error.stack });
    process.exit(1);
  });
};

startServer().catch((error) => {
  logger.error('Fatal error occurred during server startup:', { error });
  process.exit(1);
});
