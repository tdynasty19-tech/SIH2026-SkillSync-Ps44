import path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './database';
import { logger } from '../utils/logger';

const migrationsPath = path.resolve(__dirname, '../../migrations');
const seedersPath = path.resolve(__dirname, '../../seeders');

/**
 * Umzug Migrator instance for executing schema migrations
 */
export const migrator = new Umzug({
  migrations: {
    glob: path.join(migrationsPath, '*.js').replace(/\\/g, '/'),
    resolve: ({ name, path: filePath }) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration = require(filePath!);
      return {
        name,
        up: async () => migration.up(sequelize.getQueryInterface(), sequelize.constructor),
        down: async () => migration.down(sequelize.getQueryInterface(), sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'sequelize_meta',
  }),
  logger: {
    info: (msg: any) => logger.info(`[Migrator] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
    warn: (msg: any) => logger.warn(`[Migrator] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
    error: (msg: any) => logger.error(`[Migrator] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
    debug: (msg: any) => logger.debug(`[Migrator] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
  },
});

/**
 * Umzug Seeder instance for executing database seeders
 */
export const seeder = new Umzug({
  migrations: {
    glob: path.join(seedersPath, '*.js').replace(/\\/g, '/'),
    resolve: ({ name, path: filePath }) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration = require(filePath!);
      return {
        name,
        up: async () => migration.up(sequelize.getQueryInterface(), sequelize.constructor),
        down: async () => migration.down(sequelize.getQueryInterface(), sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'sequelize_data',
  }),
  logger: {
    info: (msg: any) => logger.info(`[Seeder] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
    warn: (msg: any) => logger.warn(`[Seeder] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
    error: (msg: any) => logger.error(`[Seeder] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
    debug: (msg: any) => logger.debug(`[Seeder] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
  },
});

export type MigrationMeta = ReturnType<typeof migrator.migrations>;
