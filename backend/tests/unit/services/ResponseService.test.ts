/// <reference types="jest" />

import { ResponseService } from '../../../src/services/ResponseService';
import { Response } from 'express';

// Mock de Express Response
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendFile = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.req = { originalUrl: '/api/test' } as any;
  return res;
};

describe('ResponseService', () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
  });

  describe('success', () => {
    it('should return success response with data', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };
      const message = 'Success message';

      // Act
      const result = ResponseService.success(res, data, message, 200);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return success response without message', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };

      // Act
      const result = ResponseService.success(res, data);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('error', () => {
    it('should return error response with all parameters', () => {
      // Arrange
      const message = 'Error message';
      const code = 'ERROR_CODE';
      const statusCode = 400;
      const details = { field: 'email' };

      // Act
      const result = ResponseService.error(res, message, code, statusCode, details);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code,
          details
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return error response with default values', () => {
      // Arrange
      const message = 'Error message';

      // Act
      const result = ResponseService.error(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('paginated', () => {
    it('should return paginated response', () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }];
      const page = 1;
      const limit = 10;
      const total = 25;
      const message = 'Paginated data';

      // Act
      const result = ResponseService.paginated(res, data, page, limit, total, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        timestamp: expect.any(String),
        path: '/api/test',
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false
        }
      });
      expect(result).toBe(res);
    });

    it('should handle pagination with hasPrev true', () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }];
      const page = 2;
      const limit = 10;
      const total = 25;

      // Act
      const result = ResponseService.paginated(res, data, page, limit, total);

      // Assert
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.pagination.hasPrev).toBe(true);
      expect(response.pagination.hasNext).toBe(true);
      expect(result).toBe(res);
    });

    it('should handle pagination with hasNext false', () => {
      // Arrange
      const data = [{ id: 1 }];
      const page = 3;
      const limit = 10;
      const total = 25;

      // Act
      const result = ResponseService.paginated(res, data, page, limit, total);

      // Assert
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(true);
      expect(result).toBe(res);
    });
  });

  describe('created', () => {
    it('should return created response', () => {
      // Arrange
      const data = { id: 1, name: 'Created' };
      const message = 'Resource created';

      // Act
      const result = ResponseService.created(res, data, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('updated', () => {
    it('should return updated response', () => {
      // Arrange
      const data = { id: 1, name: 'Updated' };
      const message = 'Resource updated';

      // Act
      const result = ResponseService.updated(res, data, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('deleted', () => {
    it('should return deleted response', () => {
      // Arrange
      const message = 'Resource deleted';

      // Act
      const result = ResponseService.deleted(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('validationError', () => {
    it('should return validation error response', () => {
      // Arrange
      const message = 'Validation failed';
      const details = { email: 'Invalid email format' };

      // Act
      const result = ResponseService.validationError(res, message, details);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'VALIDATION_ERROR',
          details
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('authenticationError', () => {
    it('should return authentication error response with custom message', () => {
      // Arrange
      const message = 'Custom auth error';

      // Act
      const result = ResponseService.authenticationError(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'AUTHENTICATION_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return authentication error response with default message', () => {
      // Act
      const result = ResponseService.authenticationError(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTHENTICATION_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('authorizationError', () => {
    it('should return authorization error response with custom message', () => {
      // Arrange
      const message = 'Custom authorization error';

      // Act
      const result = ResponseService.authorizationError(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'AUTHORIZATION_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return authorization error response with default message', () => {
      // Act
      const result = ResponseService.authorizationError(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Accès non autorisé',
          code: 'AUTHORIZATION_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('notFound', () => {
    it('should return not found error response with custom message', () => {
      // Arrange
      const message = 'Custom not found error';

      // Act
      const result = ResponseService.notFound(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'NOT_FOUND'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return not found error response with default message', () => {
      // Act
      const result = ResponseService.notFound(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Ressource non trouvée',
          code: 'NOT_FOUND'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('conflict', () => {
    it('should return conflict error response with custom message', () => {
      // Arrange
      const message = 'Custom conflict error';

      // Act
      const result = ResponseService.conflict(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'CONFLICT'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return conflict error response with default message', () => {
      // Act
      const result = ResponseService.conflict(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Conflit de données',
          code: 'CONFLICT'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('rateLimitError', () => {
    it('should return rate limit error response with custom message', () => {
      // Arrange
      const message = 'Custom rate limit error';

      // Act
      const result = ResponseService.rateLimitError(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return rate limit error response with default message', () => {
      // Act
      const result = ResponseService.rateLimitError(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Limite de taux dépassée',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('externalServiceError', () => {
    it('should return external service error response with custom message', () => {
      // Arrange
      const message = 'Custom external service error';

      // Act
      const result = ResponseService.externalServiceError(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'EXTERNAL_SERVICE_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return external service error response with default message', () => {
      // Act
      const result = ResponseService.externalServiceError(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Erreur de service externe',
          code: 'EXTERNAL_SERVICE_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('databaseError', () => {
    it('should return database error response with custom message', () => {
      // Arrange
      const message = 'Custom database error';

      // Act
      const result = ResponseService.databaseError(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'DATABASE_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return database error response with default message', () => {
      // Act
      const result = ResponseService.databaseError(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Erreur de base de données',
          code: 'DATABASE_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('internalError', () => {
    it('should return internal error response with custom message', () => {
      // Arrange
      const message = 'Custom internal error';

      // Act
      const result = ResponseService.internalError(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return internal error response with default message', () => {
      // Act
      const result = ResponseService.internalError(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR'
        },
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('ok', () => {
    it('should return ok response with custom message', () => {
      // Arrange
      const message = 'Custom ok message';

      // Act
      const result = ResponseService.ok(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return ok response without message', () => {
      // Act
      const result = ResponseService.ok(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Opération réussie',
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });

  describe('emptyList', () => {
    it('should return empty list response with custom message', () => {
      // Arrange
      const message = 'Custom empty list message';

      // Act
      const result = ResponseService.emptyList(res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message,
        timestamp: expect.any(String),
        path: '/api/test',
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
      expect(result).toBe(res);
    });

    it('should return empty list response without message', () => {
      // Act
      const result = ResponseService.emptyList(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Aucune donnée trouvée',
        timestamp: expect.any(String),
        path: '/api/test',
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
      expect(result).toBe(res);
    });
  });

  describe('file', () => {
    it('should send file response', () => {
      // Arrange
      const filePath = '/path/to/file.pdf';
      const fileName = 'document.pdf';

      // Act
      ResponseService.file(res, filePath, fileName);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`);
      expect(res.sendFile).toHaveBeenCalledWith(filePath);
    });

    it('should send file response without custom filename', () => {
      // Arrange
      const filePath = '/path/to/file.pdf';

      // Act
      ResponseService.file(res, filePath);

      // Assert
      expect(res.setHeader).not.toHaveBeenCalled();
      expect(res.sendFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('redirect', () => {
    it('should redirect with custom status code', () => {
      // Arrange
      const url = 'https://example.com';
      const statusCode = 301;

      // Act
      ResponseService.redirect(res, url, statusCode);

      // Assert
      expect(res.redirect).toHaveBeenCalledWith(statusCode, url);
    });

    it('should redirect with default status code', () => {
      // Arrange
      const url = 'https://example.com';

      // Act
      ResponseService.redirect(res, url);

      // Assert
      expect(res.redirect).toHaveBeenCalledWith(302, url);
    });
  });

  describe('successWithMeta', () => {
    it('should return success response with meta data', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };
      const meta = { totalCount: 100, version: '1.0' };
      const message = 'Success with meta';

      // Act
      const result = ResponseService.successWithMeta(res, data, meta, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        meta,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });

    it('should return success response with meta data without message', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };
      const meta = { totalCount: 100, version: '1.0' };

      // Act
      const result = ResponseService.successWithMeta(res, data, meta);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta,
        timestamp: expect.any(String),
        path: '/api/test'
      });
      expect(result).toBe(res);
    });
  });
}); 