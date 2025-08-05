import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, requireRole, optionalAuth } from '../../../src/middleware/auth';
import { userService } from '../../../src/services/UserService';
import { UnauthorizedError, ForbiddenError } from '../../../src/utils/errors';

// Mock des dépendances
jest.mock('../../../src/services/UserService');
jest.mock('../../../src/config/config', () => ({
  config: {
    jwt: {
      secret: 'test-secret',
    },
  },
}));

const mockUserService = userService as jest.Mocked<typeof userService>;

describe('Auth Middleware', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: '127.0.0.1',
      get: jest.fn(),
      url: '/test',
      method: 'GET',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Reset des mocks
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
        status: 'active',
      };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers.authorization = `Bearer ${token}`;
      mockUserService.findById.mockResolvedValue(mockUser as any);

      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockUserService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockRequest.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Token d\'authentification manquant',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';

      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 401,
        code: 'TOKEN_INVALID',
        message: 'Token d\'authentification invalide',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', async () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'client' },
        'test-secret',
        { expiresIn: '-1h' }
      );

      mockRequest.headers.authorization = `Bearer ${token}`;

      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Token d\'authentification expiré',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with non-existent user', async () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'client' },
        'test-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers.authorization = `Bearer ${token}`;
      mockUserService.findById.mockResolvedValue(null);

      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Utilisateur non trouvé',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with inactive user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
        status: 'inactive',
      };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers.authorization = `Bearer ${token}`;
      mockUserService.findById.mockResolvedValue(mockUser as any);

      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Compte utilisateur inactif',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should extract token from query parameter', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
        status: 'active',
      };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test-secret',
        { expiresIn: '1h' }
      );

      mockRequest.query = { token };
      mockUserService.findById.mockResolvedValue(mockUser as any);

      await authMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockUserService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockRequest.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
      };
    });

    it('should allow access for matching role', () => {
      const middleware = requireRole('client');
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for "both" role', () => {
      const middleware = requireRole('both');
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for non-matching role', () => {
      const middleware = requireRole('assistant');
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Accès réservé aux assistants',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require authentication', () => {
      delete mockRequest.user;
      const middleware = requireRole('client');
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentification requise',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without user when no token provided', async () => {
      await optionalAuth(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set user when valid token provided', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
        status: 'active',
      };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers.authorization = `Bearer ${token}`;
      mockUserService.findById.mockResolvedValue(mockUser as any);

      await optionalAuth(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not set user when user is inactive', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
        status: 'inactive',
      };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test-secret',
        { expiresIn: '1h' }
      );

      mockRequest.headers.authorization = `Bearer ${token}`;
      mockUserService.findById.mockResolvedValue(mockUser as any);

      await optionalAuth(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 