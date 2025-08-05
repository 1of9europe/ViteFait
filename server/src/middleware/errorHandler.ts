import { Request, Response, NextFunction } from 'express';
import { HttpError, ErrorResponse } from '../utils/errors';
import { logger, logError } from '../utils/logger';
import { config } from '../config/config';
import { ZodError } from 'zod';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

/**
 * Middleware de gestion centralisée des erreurs
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Ne pas logger les erreurs 404 (gérées par notFound)
  if (error instanceof HttpError && error.statusCode === 404) {
    handleHttpError(error, req, res);
    return;
  }

  // Logger toutes les autres erreurs
  logError(error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Gérer les différents types d'erreurs
  if (error instanceof HttpError) {
    handleHttpError(error, req, res);
  } else if (error instanceof ZodError) {
    handleValidationError(error, req, res);
  } else if (error instanceof QueryFailedError) {
    handleDatabaseError(error, req, res);
  } else if (error instanceof EntityNotFoundError) {
    handleNotFoundError(error, req, res);
  } else {
    handleUnexpectedError(error, req, res);
  }
};

/**
 * Gère les erreurs HTTP personnalisées
 */
function handleHttpError(error: HttpError, req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: error.statusCode,
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString(),
  };

  // Ajouter les détails pour les erreurs de validation
  if ('details' in error && error.details) {
    errorResponse.details = error.details;
  }

  // Ajouter la stack trace en développement
  if (config.server.nodeEnv === 'development' && !error.isOperational) {
    errorResponse.stack = error.stack;
  }

  res.status(error.statusCode).json(errorResponse);
}

/**
 * Gère les erreurs de validation Zod
 */
function handleValidationError(error: ZodError, req: Request, res: Response): void {
  const details: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!details[field]) {
      details[field] = [];
    }
    details[field].push(err.message);
  });

  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 422,
    code: 'VALIDATION_ERROR',
    message: 'Données de requête invalides',
    details,
    timestamp: new Date().toISOString(),
  };

  // Ajouter la stack trace en développement
  if (config.server.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(422).json(errorResponse);
}

/**
 * Gère les erreurs de base de données
 */
function handleDatabaseError(error: QueryFailedError, req: Request, res: Response): void {
  let message = 'Erreur de base de données';
  let code = 'DATABASE_ERROR';

  // Analyser le type d'erreur PostgreSQL
  if (error.message.includes('duplicate key')) {
    message = 'Une ressource avec ces informations existe déjà';
    code = 'DUPLICATE_ENTRY';
  } else if (error.message.includes('foreign key')) {
    message = 'Référence invalide';
    code = 'FOREIGN_KEY_VIOLATION';
  } else if (error.message.includes('not null')) {
    message = 'Champ obligatoire manquant';
    code = 'NULL_VIOLATION';
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 400,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  // Ajouter la stack trace en développement
  if (config.server.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(400).json(errorResponse);
}

/**
 * Gère les erreurs de ressource non trouvée
 */
function handleNotFoundError(error: EntityNotFoundError, req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'Ressource non trouvée',
    timestamp: new Date().toISOString(),
  };

  // Ajouter la stack trace en développement
  if (config.server.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(404).json(errorResponse);
}

/**
 * Gère les erreurs inattendues
 */
function handleUnexpectedError(error: Error, req: Request, res: Response): void {
  // En production, ne pas exposer les détails des erreurs internes
  const message = config.server.nodeEnv === 'production' 
    ? 'Erreur interne du serveur'
    : error.message;

  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message,
    timestamp: new Date().toISOString(),
  };

  // Ajouter la stack trace en développement
  if (config.server.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(500).json(errorResponse);
}

/**
 * Middleware pour gérer les routes non trouvées
 */
export const notFound = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 404,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} non trouvée`,
    timestamp: new Date().toISOString(),
  };

  // Logger les tentatives d'accès à des routes inexistantes
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json(errorResponse);
};

/**
 * Middleware pour gérer les requêtes malformées
 */
export const badRequest = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 400,
    code: 'BAD_REQUEST',
    message: 'Requête malformée',
    timestamp: new Date().toISOString(),
  };

  res.status(400).json(errorResponse);
};

/**
 * Middleware pour gérer les erreurs de parsing JSON
 */
export const jsonErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    const errorResponse: ErrorResponse = {
      status: 'error',
      statusCode: 400,
      code: 'INVALID_JSON',
      message: 'JSON malformé dans le corps de la requête',
      timestamp: new Date().toISOString(),
    };

    logger.warn('Invalid JSON in request body', {
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    res.status(400).json(errorResponse);
  } else {
    next(error);
  }
};

/**
 * Middleware pour gérer les erreurs de limite de taux
 */
export const rateLimitErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.message.includes('Too many requests')) {
    const errorResponse: ErrorResponse = {
      status: 'error',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      timestamp: new Date().toISOString(),
    };

    logger.warn('Rate limit exceeded', {
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    res.status(429).json(errorResponse);
  } else {
    next(error);
  }
};

/**
 * Fonction utilitaire pour créer une réponse d'erreur
 */
export const createErrorResponse = (
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, string[]>
): ErrorResponse => {
  return {
    status: 'error',
    statusCode,
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
}; 