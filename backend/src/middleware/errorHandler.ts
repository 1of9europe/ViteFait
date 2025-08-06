import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Classes d'erreur personnalisées
export class HttpError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(_code: string, message: string) {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(_code: string, message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(_code: string, message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(_code: string, message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(_code: string, message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur';

  // Log de l'erreur en développement
  if (process.env['NODE_ENV'] === 'development') {
    console.error('❌ Erreur:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user?.id
    });
  }

  // Réponse d'erreur
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
    }
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = createError(`Route ${req.originalUrl} non trouvée`, 404);
  next(error);
}; 