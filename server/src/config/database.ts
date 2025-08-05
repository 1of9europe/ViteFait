import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './config';
import { logger } from '../utils/logger';

// Configuration des entités avec gestion TS/JS
const entities = process.env.NODE_ENV === 'production' 
  ? ['dist/**/*.js']
  : ['src/**/*.ts'];

// Configuration des migrations avec gestion TS/JS
const migrations = process.env.NODE_ENV === 'production'
  ? ['dist/migrations/*.js']
  : ['src/migrations/*.ts'];

// Configuration des subscribers avec gestion TS/JS
const subscribers = process.env.NODE_ENV === 'production'
  ? ['dist/subscribers/*.js']
  : ['src/subscribers/*.ts'];

// Configuration SSL externalisée
const sslConfig = config.database.ssl ? {
  rejectUnauthorized: config.database.sslRejectUnauthorized,
  ca: config.database.sslCa,
  cert: config.database.sslCert,
  key: config.database.sslKey,
} : false;

// Configuration du pool de connexions
const poolConfig = {
  max: config.database.poolMax,
  min: config.database.poolMin,
  acquire: config.database.poolAcquire,
  idle: config.database.poolIdle,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  statement_timeout: config.database.statementTimeout,
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities,
  migrations,
  subscribers,
  synchronize: config.database.synchronize, // Désactivé en production
  logging: config.database.logging,
  ssl: sslConfig,
  extra: {
    ...poolConfig,
  },
  cache: {
    duration: config.database.cacheDuration,
  },
} as DataSourceOptions);

// Gestion propre de la fermeture de la base de données
let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal', { signal });
    return;
  }

  isShuttingDown = true;
  logger.info('Received shutdown signal, closing database connections', { signal });

  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connections closed successfully');
    }
    process.exit(0);
  } catch (error) {
    logger.error('Error during database shutdown', { error, signal });
    process.exit(1);
  }
};

// Écouter les signaux de fermeture
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established successfully', {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        poolSize: config.database.poolMax,
      });
    }
  } catch (error) {
    logger.error('Failed to initialize database connection', { error });
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database connection', { error });
    throw error;
  }
};

// Fonction utilitaire pour vérifier la santé de la base de données
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    
    // Test de connexion simple
    await AppDataSource.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
}; 