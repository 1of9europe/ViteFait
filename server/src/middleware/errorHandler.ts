import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

// Classes d'erreur personnalisées
export class HttpError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(code: string, message: string) {
    super(400, code, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(code: string, message: string) {
    super(401, code, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(code: string, message: string) {
    super(403, code, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(code: string, message: string) {
    super(404, code, message);
  }
}

export class ConflictError extends HttpError {
  constructor(code: string, message: string) {
    super(409, code, message);
  }
}

export class ValidationError extends HttpError {
  constructor(code: string, message: string) {
    super(422, code, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(code: string, message: string) {
    super(500, code, message);
  }
}

export const errorHandler = (
  error: AppError | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur';
  const code = (error as HttpError).code || 'INTERNAL_ERROR';

  // Log de l'erreur en développement
  if (process.env['NODE_ENV'] === 'development') {
    console.error('❌ Erreur:', {
      message: error.message,
      code,
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
      code,
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

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError('ROUTE_NOT_FOUND', `Route ${req.originalUrl} non trouvée`);
  next(error);
}; 