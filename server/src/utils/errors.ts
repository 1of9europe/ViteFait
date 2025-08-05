/**
 * Classe de base pour les erreurs HTTP personnalisées
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintenir la stack trace pour les erreurs non-opérationnelles
    if (!isOperational) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Erreur pour les ressources non trouvées
 */
export class NotFoundError extends HttpError {
  constructor(message: string = 'Ressource non trouvée', code: string = 'NOT_FOUND') {
    super(message, 404, code, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Erreur pour les requêtes invalides
 */
export class BadRequestError extends HttpError {
  constructor(message: string = 'Requête invalide', code: string = 'BAD_REQUEST') {
    super(message, 400, code, true);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Erreur pour les accès non autorisés
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Accès non autorisé', code: string = 'UNAUTHORIZED') {
    super(message, 401, code, true);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Erreur pour les accès interdits
 */
export class ForbiddenError extends HttpError {
  constructor(message: string = 'Accès interdit', code: string = 'FORBIDDEN') {
    super(message, 403, code, true);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Erreur pour les conflits
 */
export class ConflictError extends HttpError {
  constructor(message: string = 'Conflit', code: string = 'CONFLICT') {
    super(message, 409, code, true);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Erreur pour les validations
 */
export class ValidationError extends HttpError {
  public readonly details: Record<string, string[]>;

  constructor(
    message: string = 'Données invalides',
    details: Record<string, string[]> = {},
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, 422, code, true);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Erreur pour les tokens expirés
 */
export class TokenExpiredError extends HttpError {
  constructor(message: string = 'Token expiré', code: string = 'TOKEN_EXPIRED') {
    super(message, 401, code, true);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

/**
 * Erreur pour les tokens invalides
 */
export class TokenInvalidError extends HttpError {
  constructor(message: string = 'Token invalide', code: string = 'TOKEN_INVALID') {
    super(message, 401, code, true);
    Object.setPrototypeOf(this, TokenInvalidError.prototype);
  }
}

/**
 * Erreur pour les services externes
 */
export class ExternalServiceError extends HttpError {
  constructor(
    service: string,
    message: string = 'Erreur du service externe',
    code: string = 'EXTERNAL_SERVICE_ERROR'
  ) {
    super(`${service}: ${message}`, 502, code, true);
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Erreur pour les limites de taux
 */
export class RateLimitError extends HttpError {
  constructor(message: string = 'Limite de taux dépassée', code: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code, true);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Fonction utilitaire pour créer des erreurs HTTP
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR'
): HttpError => {
  return new HttpError(message, statusCode, code, true);
};

/**
 * Fonction utilitaire pour créer des erreurs de validation
 */
export const createValidationError = (
  message: string,
  details: Record<string, string[]> = {}
): ValidationError => {
  return new ValidationError(message, details);
};

/**
 * Fonction utilitaire pour créer des erreurs de service externe
 */
export const createExternalServiceError = (
  service: string,
  message: string = 'Erreur du service externe'
): ExternalServiceError => {
  return new ExternalServiceError(service, message);
};

/**
 * Type pour les codes d'erreur
 */
export type ErrorCode = 
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

/**
 * Interface pour les réponses d'erreur
 */
export interface ErrorResponse {
  status: 'error';
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string;
  timestamp: string;
} 