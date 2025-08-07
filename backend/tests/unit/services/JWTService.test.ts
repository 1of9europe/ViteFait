/// <reference types="jest" />

import { JWTService, TokenPayload } from '../../../src/services/JWTService';
import jwt from 'jsonwebtoken';

// Mock des dépendances
jest.mock('jsonwebtoken');

// Mock des classes d'erreur JWT
const mockTokenExpiredError = class extends Error {
  override name = 'TokenExpiredError';
  constructor(message: string) {
    super(message);
  }
};

const mockJsonWebTokenError = class extends Error {
  override name = 'JsonWebTokenError';
  constructor(message: string) {
    super(message);
  }
};

// Mock de jwt avec les classes d'erreur
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
mockedJwt.TokenExpiredError = mockTokenExpiredError as any;
mockedJwt.JsonWebTokenError = mockJsonWebTokenError as any;

describe('JWTService', () => {
  const mockTokenPayload: TokenPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'CLIENT'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock des variables d'environnement
    process.env['JWT_SECRET'] = 'test-secret';
    process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret';
  });

  afterEach(() => {
    delete process.env['JWT_SECRET'];
    delete process.env['JWT_REFRESH_SECRET'];
  });

  describe('generateToken', () => {
    it('should generate a token successfully with default options', () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = JWTService.generateToken(mockTokenPayload);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        'test-secret',
        {
          expiresIn: '1h',
          issuer: 'conciergerie-urbaine',
          audience: 'conciergerie-urbaine-api'
        }
      );
      expect(result).toBe(mockToken);
    });

    it('should generate a token with custom options', () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      const customOptions = {
        expiresIn: '2h',
        issuer: 'custom-issuer',
        audience: 'custom-audience'
      };
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = JWTService.generateToken(mockTokenPayload, customOptions);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        'test-secret',
        {
          expiresIn: '2h',
          issuer: 'custom-issuer',
          audience: 'custom-audience'
        }
      );
      expect(result).toBe(mockToken);
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      // Arrange
      delete process.env['JWT_SECRET'];

      // Act & Assert
      expect(() => JWTService.generateToken(mockTokenPayload)).toThrow(
        'Erreur lors de la génération du token'
      );
    });

    it('should throw error when jwt.sign fails', () => {
      // Arrange
      const jwtError = new Error('JWT signing failed');
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      expect(() => JWTService.generateToken(mockTokenPayload)).toThrow(
        'Erreur lors de la génération du token'
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token successfully', () => {
      // Arrange
      const mockToken = 'mock-refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = JWTService.generateRefreshToken(mockTokenPayload);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        'test-refresh-secret',
        {
          expiresIn: '7d',
          issuer: 'conciergerie-urbaine',
          audience: 'conciergerie-urbaine-refresh'
        }
      );
      expect(result).toBe(mockToken);
    });

    it('should throw error when JWT_REFRESH_SECRET is not defined', () => {
      // Arrange
      delete process.env['JWT_REFRESH_SECRET'];

      // Act & Assert
      expect(() => JWTService.generateRefreshToken(mockTokenPayload)).toThrow(
        'Erreur lors de la génération du token de rafraîchissement'
      );
    });

    it('should throw error when jwt.sign fails', () => {
      // Arrange
      const jwtError = new Error('JWT signing failed');
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      expect(() => JWTService.generateRefreshToken(mockTokenPayload)).toThrow(
        'Erreur lors de la génération du token de rafraîchissement'
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token successfully', () => {
      // Arrange
      const mockToken = 'valid-token';
      (jwt.verify as jest.Mock).mockReturnValue(mockTokenPayload);

      // Act
      const result = JWTService.verifyToken(mockToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        'test-secret',
        {
          issuer: 'conciergerie-urbaine',
          audience: 'conciergerie-urbaine-api'
        }
      );
      expect(result).toEqual(mockTokenPayload);
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      // Arrange
      delete process.env['JWT_SECRET'];

      // Act & Assert
      expect(() => JWTService.verifyToken('token')).toThrow(
        'Erreur lors de la vérification du token'
      );
    });

    it('should throw "Token expiré" when token is expired', () => {
      // Arrange
      const expiredError = new mockTokenExpiredError('Token expired');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      // Act & Assert
      expect(() => JWTService.verifyToken('expired-token')).toThrow('Token expiré');
    });

    it('should throw "Token invalide" when token is invalid', () => {
      // Arrange
      const invalidError = new mockJsonWebTokenError('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw invalidError;
      });

      // Act & Assert
      expect(() => JWTService.verifyToken('invalid-token')).toThrow('Token invalide');
    });

    it('should throw generic error for other JWT errors', () => {
      // Arrange
      const otherError = new Error('Other JWT error');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw otherError;
      });

      // Act & Assert
      expect(() => JWTService.verifyToken('token')).toThrow(
        'Erreur lors de la vérification du token'
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token successfully', () => {
      // Arrange
      const mockToken = 'valid-refresh-token';
      (jwt.verify as jest.Mock).mockReturnValue(mockTokenPayload);

      // Act
      const result = JWTService.verifyRefreshToken(mockToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        'test-refresh-secret',
        {
          issuer: 'conciergerie-urbaine',
          audience: 'conciergerie-urbaine-refresh'
        }
      );
      expect(result).toEqual(mockTokenPayload);
    });

    it('should throw error when JWT_REFRESH_SECRET is not defined', () => {
      // Arrange
      delete process.env['JWT_REFRESH_SECRET'];

      // Act & Assert
      expect(() => JWTService.verifyRefreshToken('token')).toThrow(
        'Erreur lors de la vérification du token de rafraîchissement'
      );
    });

    it('should throw "Token expiré" when refresh token is expired', () => {
      // Arrange
      const expiredError = new mockTokenExpiredError('Token expired');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      // Act & Assert
      expect(() => JWTService.verifyRefreshToken('expired-token')).toThrow('Token de rafraîchissement expiré');
    });

    it('should throw "Token invalide" when refresh token is invalid', () => {
      // Arrange
      const invalidError = new mockJsonWebTokenError('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw invalidError;
      });

      // Act & Assert
      expect(() => JWTService.verifyRefreshToken('invalid-token')).toThrow('Token de rafraîchissement invalide');
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      // Arrange
      const mockToken = 'valid-token';
      (jwt.decode as jest.Mock) = jest.fn().mockReturnValue(mockTokenPayload);

      // Act
      const result = JWTService.decodeToken(mockToken);

      // Assert
      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockTokenPayload);
    });

    it('should return null when token cannot be decoded', () => {
      // Arrange
      const mockToken = 'invalid-token';
      (jwt.decode as jest.Mock) = jest.fn().mockReturnValue(null);

      // Act
      const result = JWTService.decodeToken(mockToken);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return true when token expires within threshold', () => {
      // Arrange
      const mockToken = 'expiring-token';
      const futureTime = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes from now
      const mockDecodedToken = { ...mockTokenPayload, exp: futureTime };
      (jwt.decode as jest.Mock) = jest.fn().mockReturnValue(mockDecodedToken);

      // Act
      const result = JWTService.isTokenExpiringSoon(mockToken, 30);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token expires after threshold', () => {
      // Arrange
      const mockToken = 'valid-token';
      const futureTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
      const mockDecodedToken = { ...mockTokenPayload, exp: futureTime };
      (jwt.decode as jest.Mock) = jest.fn().mockReturnValue(mockDecodedToken);

      // Act
      const result = JWTService.isTokenExpiringSoon(mockToken, 30);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when token has no expiration', () => {
      // Arrange
      const mockToken = 'no-exp-token';
      const mockDecodedToken = { ...mockTokenPayload }; // No exp field
      (jwt.decode as jest.Mock) = jest.fn().mockReturnValue(mockDecodedToken);

      // Act
      const result = JWTService.isTokenExpiringSoon(mockToken, 30);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when token cannot be decoded', () => {
      // Arrange
      const mockToken = 'invalid-token';
      (jwt.decode as jest.Mock) = jest.fn().mockReturnValue(null);

      // Act
      const result = JWTService.isTokenExpiringSoon(mockToken, 30);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('generateTemporaryToken', () => {
    it('should generate a temporary token with default expiration', () => {
      // Arrange
      const mockToken = 'temp-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = JWTService.generateTemporaryToken(mockTokenPayload);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        'test-secret',
        {
          expiresIn: '15m',
          issuer: 'conciergerie-urbaine',
          audience: 'conciergerie-urbaine-temp'
        }
      );
      expect(result).toBe(mockToken);
    });

    it('should generate a temporary token with custom expiration', () => {
      // Arrange
      const mockToken = 'temp-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = JWTService.generateTemporaryToken(mockTokenPayload, '5m');

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        'test-secret',
        {
          expiresIn: '5m',
          issuer: 'conciergerie-urbaine',
          audience: 'conciergerie-urbaine-temp'
        }
      );
      expect(result).toBe(mockToken);
    });
  });
}); 