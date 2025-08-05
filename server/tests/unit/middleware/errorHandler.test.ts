import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFound, jsonErrorHandler } from '../../../src/middleware/errorHandler';
import { HttpError, ValidationError, UnauthorizedError } from '../../../src/utils/errors';
import { ZodError } from 'zod';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

// Mock du logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
  logError: jest.fn(),
}));

// Mock de la configuration
jest.mock('../../../src/config/config', () => ({
  config: {
    server: {
      nodeEnv: 'development',
    },
  },
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Reset des mocks
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle HttpError correctly', () => {
      const error = new UnauthorizedError('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Test error',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle ValidationError with details', () => {
      const error = new ValidationError('Validation failed', {
        email: ['Email is required'],
        password: ['Password must be at least 8 characters'],
      });

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          email: ['Email is required'],
          password: ['Password must be at least 8 characters'],
        },
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle ZodError correctly', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          message: 'Invalid email',
          path: ['email'],
        },
        {
          code: 'too_small',
          message: 'Password too short',
          path: ['password'],
        },
      ]);

      errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Données de requête invalides',
        details: {
          email: ['Invalid email'],
          password: ['Password too short'],
        },
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle QueryFailedError correctly', () => {
      const error = new QueryFailedError('duplicate key value violates unique constraint', [], '');
      error.message = 'duplicate key value violates unique constraint "users_email_key"';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 400,
        code: 'DUPLICATE_ENTRY',
        message: 'Une ressource avec ces informations existe déjà',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle EntityNotFoundError correctly', () => {
      const error = new EntityNotFoundError('User', 'id = 123');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Ressource non trouvée',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors correctly', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Unexpected error',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should include stack trace in development for non-operational errors', () => {
      const error = new HttpError('Test error', 500, 'INTERNAL_ERROR', false);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('should not include stack trace for operational errors', () => {
      const error = new HttpError('Test error', 400, 'BAD_REQUEST', true);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );
    });
  });

  describe('notFound', () => {
    it('should return 404 error response', () => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/api/nonexistent';

      notFound(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Route POST /api/nonexistent non trouvée',
        timestamp: expect.any(String),
      });
    });
  });

  describe('jsonErrorHandler', () => {
    it('should handle JSON syntax errors', () => {
      const error = new SyntaxError('Unexpected token in JSON at position 0');
      (error as any).body = 'invalid json';

      jsonErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 400,
        code: 'INVALID_JSON',
        message: 'JSON malformé dans le corps de la requête',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass through non-JSON errors', () => {
      const error = new Error('Other error');

      jsonErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should pass through SyntaxError without body property', () => {
      const error = new SyntaxError('Other syntax error');

      jsonErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with all fields', () => {
      const { createErrorResponse } = require('../../../src/middleware/errorHandler');
      const details = { field: ['Error message'] };

      const response = createErrorResponse(400, 'BAD_REQUEST', 'Test error', details);

      expect(response).toEqual({
        status: 'error',
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: 'Test error',
        details,
        timestamp: expect.any(String),
      });
    });

    it('should create error response without details', () => {
      const { createErrorResponse } = require('../../../src/middleware/errorHandler');

      const response = createErrorResponse(500, 'INTERNAL_ERROR', 'Server error');

      expect(response).toEqual({
        status: 'error',
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Server error',
        timestamp: expect.any(String),
      });
      expect(response).not.toHaveProperty('details');
    });
  });
}); 