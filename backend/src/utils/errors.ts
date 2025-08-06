// Classes d'erreur métier génériques
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code || 'INTERNAL_ERROR';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code: string = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, code: string = 'AUTHORIZATION_ERROR') {
    super(message, 403, code);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, code: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message, 500, code);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code: string = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 502, code);
    this.name = 'ExternalServiceError';
  }
}

// Erreurs spécifiques au domaine métier
export class MissionError extends AppError {
  constructor(message: string, code: string = 'MISSION_ERROR') {
    super(message, 400, code);
    this.name = 'MissionError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string, code: string = 'PAYMENT_ERROR') {
    super(message, 400, code);
    this.name = 'PaymentError';
  }
}

export class UserError extends AppError {
  constructor(message: string, code: string = 'USER_ERROR') {
    super(message, 400, code);
    this.name = 'UserError';
  }
}

// Factory pour créer des erreurs typées
export const createError = {
  validation: (message: string, code?: string) => new ValidationError(message, code),
  authentication: (message: string, code?: string) => new AuthenticationError(message, code),
  authorization: (message: string, code?: string) => new AuthorizationError(message, code),
  notFound: (message: string, code?: string) => new NotFoundError(message, code),
  conflict: (message: string, code?: string) => new ConflictError(message, code),
  rateLimit: (message: string, code?: string) => new RateLimitError(message, code),
  database: (message: string, code?: string) => new DatabaseError(message, code),
  externalService: (message: string, code?: string) => new ExternalServiceError(message, code),
  mission: (message: string, code?: string) => new MissionError(message, code),
  payment: (message: string, code?: string) => new PaymentError(message, code),
  user: (message: string, code?: string) => new UserError(message, code)
}; 