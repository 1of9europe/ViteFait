import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Configuration centralisée de l'application
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
  sslCa?: string;
  sslCert?: string;
  sslKey?: string;
  poolMax: number;
  poolMin: number;
  poolAcquire: number;
  poolIdle: number;
  connectionTimeout: number;
  idleTimeout: number;
  statementTimeout: number;
  cacheDuration: number;
  synchronize: boolean;
  logging: boolean;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export interface ServerConfig {
  port: number;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
}

export interface Config {
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  stripe: StripeConfig;
  firebase: FirebaseConfig;
  server: ServerConfig;
  aws: AwsConfig;
  sentryDsn?: string;
  logLevel: string;
  notificationsEnabled: boolean;
  notificationBatchSize: number;
}

export const config: Config = {
  nodeEnv: process.env['NODE_ENV'] || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'vitefait',
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    sslCa: process.env.DB_SSL_CA,
    sslCert: process.env.DB_SSL_CERT,
    sslKey: process.env.DB_SSL_KEY,
    poolMax: parseInt(process.env.DB_POOL_MAX || '20'),
    poolMin: parseInt(process.env.DB_POOL_MIN || '5'),
    poolAcquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000'),
    poolIdle: parseInt(process.env.DB_POOL_IDLE || '10000'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
    cacheDuration: parseInt(process.env.DB_CACHE_DURATION || '300000'),
    synchronize: process.env['NODE_ENV'] !== 'production',
    logging: process.env['NODE_ENV'] === 'development',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },

  server: {
    port: parseInt(process.env.PORT || '3000'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'eu-west-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },

  sentryDsn: process.env.SENTRY_DSN,
  logLevel: process.env.LOG_LEVEL || 'info',
  notificationsEnabled: process.env.NOTIFICATIONS_ENABLED === 'true',
  notificationBatchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100'),
};

/**
 * Valide la configuration et lance une erreur si des champs requis sont manquants
 */
export function validateConfig(): void {
  const requiredFields = [
    'database.host',
    'database.username',
    'database.password',
    'database.database',
    'jwt.secret',
    'jwt.refreshSecret',
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key as keyof typeof obj], config as any);
    if (!value) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(`Configuration manquante: ${missingFields.join(', ')}`);
  }

  // Validations spécifiques à la production
  if (config.nodeEnv === 'production') {
    if (config.jwt.secret === 'your-secret-key') {
      throw new Error('JWT_SECRET doit être défini en production');
    }
    if (config.jwt.refreshSecret === 'your-refresh-secret-key') {
      throw new Error('JWT_REFRESH_SECRET doit être défini en production');
    }
    if (!config.database.ssl) {
      throw new Error('SSL doit être activé pour la base de données en production');
    }
  }
} 