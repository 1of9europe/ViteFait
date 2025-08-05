import pino from 'pino';
import { config } from '../config/config';

// Configuration du logger selon l'environnement
const logConfig = {
  level: config.monitoring.logLevel,
  transport: config.server.nodeEnv === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: config.server.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
    log: (object: any) => {
      // Supprimer les propriétés sensibles des logs
      const { password, token, secret, ...safeObject } = object;
      return safeObject;
    },
  },
  redact: {
    paths: [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.body.password',
      'req.body.token',
    ],
    remove: true,
  },
};

// Créer l'instance du logger
export const logger = pino(logConfig);

// Logger spécialisé pour les requêtes HTTP
export const requestLogger = pino({
  ...logConfig,
  name: 'http-request',
});

// Logger spécialisé pour les erreurs
export const errorLogger = pino({
  ...logConfig,
  name: 'error',
  level: 'error',
});

// Logger spécialisé pour les audits
export const auditLogger = pino({
  ...logConfig,
  name: 'audit',
  level: 'info',
});

// Fonctions utilitaires pour le logging
export const logError = (error: Error, context?: Record<string, any>): void => {
  errorLogger.error({
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logRequest = (req: any, res: any, responseTime?: number): void => {
  requestLogger.info({
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  });
};

export const logAudit = (action: string, userId: string, details?: Record<string, any>): void => {
  auditLogger.info({
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Middleware pour logger les requêtes
export const requestLoggingMiddleware = (req: any, res: any, next: any): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logRequest(req, res, responseTime);
  });
  
  next();
};

// Fonction pour logger les performances
export const logPerformance = (operation: string, duration: number, metadata?: Record<string, any>): void => {
  logger.info({
    type: 'performance',
    operation,
    duration,
    ...metadata,
  });
};

// Fonction pour logger les métriques métier
export const logMetric = (metric: string, value: number, tags?: Record<string, string>): void => {
  logger.info({
    type: 'metric',
    metric,
    value,
    tags,
    timestamp: new Date().toISOString(),
  });
};

// Export par défaut pour compatibilité
export default logger; 