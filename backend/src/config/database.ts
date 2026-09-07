import { Sequelize, Options } from 'sequelize';
import { env } from './env.config';
import { logger } from '../utils/logger';

const baseOptions: Options = {
  dialect: 'mysql',
  logging:
    env.NODE_ENV === 'development'
      ? (msg: string) => logger.debug(`[Sequelize] ${msg}`)
      : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 10000,
    idle: 10000,
    evict: 1000,
  },
  dialectOptions: {
    connectTimeout: 5000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

// Initialize Sequelize using DATABASE_URL (Railway MySQL standard) or discrete parameters
export const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, baseOptions)
  : new Sequelize(
      env.DATABASE_NAME,
      env.DATABASE_USER,
      env.DATABASE_PASSWORD,
      {
        ...baseOptions,
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
      }
    );

/**
 * Tests database connectivity using authenticate().
 * Note: sequelize.sync() is strictly NOT used as migrations manage schema.
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    return true;
  } catch (error) {
    logger.warn('Database connection could not be established. Ensure MySQL is running and credentials in .env are correct.');
    if (error instanceof Error) {
      logger.warn(`Database connection error detail: ${error.message}`);
    }
    return false;
  }
};
