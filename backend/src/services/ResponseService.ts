import { Response } from 'express';

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
  path?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ResponseService {
  /**
   * Réponse de succès standard
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse d'erreur standard
   */
  static error(
    res: Response,
    message: string,
    code: string = 'ERROR',
    statusCode: number = 500,
    details?: any
  ): Response<ApiError> {
    const response: ApiError = {
      success: false,
      error: {
        message,
        code,
        details
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse paginée
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };

    if (message) {
      response.message = message;
    }

    return res.status(200).json(response);
  }

  /**
   * Réponse de création
   */
  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message || 'Ressource créée avec succès', 201);
  }

  /**
   * Réponse de mise à jour
   */
  static updated<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message || 'Ressource mise à jour avec succès', 200);
  }

  /**
   * Réponse de suppression
   */
  static deleted(
    res: Response,
    message?: string
  ): Response<ApiResponse<null>> {
    return this.success(res, null, message || 'Ressource supprimée avec succès', 200);
  }

  /**
   * Réponse de validation d'erreur
   */
  static validationError(
    res: Response,
    message: string,
    details?: any
  ): Response<ApiError> {
    return this.error(res, message, 'VALIDATION_ERROR', 400, details);
  }

  /**
   * Réponse d'erreur d'authentification
   */
  static authenticationError(
    res: Response,
    message: string = 'Authentification requise'
  ): Response<ApiError> {
    return this.error(res, message, 'AUTHENTICATION_ERROR', 401);
  }

  /**
   * Réponse d'erreur d'autorisation
   */
  static authorizationError(
    res: Response,
    message: string = 'Accès non autorisé'
  ): Response<ApiError> {
    return this.error(res, message, 'AUTHORIZATION_ERROR', 403);
  }

  /**
   * Réponse d'erreur de ressource non trouvée
   */
  static notFound(
    res: Response,
    message: string = 'Ressource non trouvée'
  ): Response<ApiError> {
    return this.error(res, message, 'NOT_FOUND', 404);
  }

  /**
   * Réponse d'erreur de conflit
   */
  static conflict(
    res: Response,
    message: string = 'Conflit de données'
  ): Response<ApiError> {
    return this.error(res, message, 'CONFLICT', 409);
  }

  /**
   * Réponse d'erreur de limite de taux
   */
  static rateLimitError(
    res: Response,
    message: string = 'Limite de taux dépassée'
  ): Response<ApiError> {
    return this.error(res, message, 'RATE_LIMIT_EXCEEDED', 429);
  }

  /**
   * Réponse d'erreur de service externe
   */
  static externalServiceError(
    res: Response,
    message: string = 'Erreur de service externe'
  ): Response<ApiError> {
    return this.error(res, message, 'EXTERNAL_SERVICE_ERROR', 502);
  }

  /**
   * Réponse d'erreur de base de données
   */
  static databaseError(
    res: Response,
    message: string = 'Erreur de base de données'
  ): Response<ApiError> {
    return this.error(res, message, 'DATABASE_ERROR', 500);
  }

  /**
   * Réponse d'erreur interne
   */
  static internalError(
    res: Response,
    message: string = 'Erreur interne du serveur'
  ): Response<ApiError> {
    return this.error(res, message, 'INTERNAL_ERROR', 500);
  }

  /**
   * Réponse de succès sans données
   */
  static ok(
    res: Response,
    message?: string
  ): Response<ApiResponse<null>> {
    return this.success(res, null, message || 'Opération réussie', 200);
  }

  /**
   * Réponse de liste vide
   */
  static emptyList(
    res: Response,
    message?: string
  ): Response<PaginatedResponse<any>> {
    return this.paginated<any>(res, [], 1, 20, 0, message || 'Aucune donnée trouvée');
  }

  /**
   * Réponse de fichier
   */
  static file(
    res: Response,
    filePath: string,
    fileName?: string
  ): void {
    if (fileName) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }
    res.sendFile(filePath);
  }

  /**
   * Réponse de redirection
   */
  static redirect(
    res: Response,
    url: string,
    statusCode: number = 302
  ): void {
    res.redirect(statusCode, url);
  }

  /**
   * Réponse de succès avec métadonnées
   */
  static successWithMeta<T>(
    res: Response,
    data: T,
    meta: Record<string, any>,
    message?: string
  ): Response<ApiResponse<T> & { meta: Record<string, any> }> {
    const response: ApiResponse<T> & { meta: Record<string, any> } = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      meta
    };

    if (message) {
      response.message = message;
    }

    return res.status(200).json(response);
  }
} 