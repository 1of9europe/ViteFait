/// <reference types="jest" />

import { AuthService } from '../../../src/services/AuthService';
import { AppDataSource } from '../../../src/config/database';
import { User } from '../../../src/models/User';
import { UserRole, UserStatus } from '../../../src/types/enums';
import { AuthenticationError, ConflictError } from '../../../src/utils/errors';
import jwt from 'jsonwebtoken';

// Mock des dépendances
jest.mock('../../../src/config/database');
jest.mock('jsonwebtoken');

const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
};

(AppDataSource.getRepository as any) = jest.fn(() => mockUserRepository);

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // S'assurer que le mock est correctement configuré
    (AppDataSource.getRepository as any).mockReturnValue(mockUserRepository);
    
    // Créer une nouvelle instance du service
    authService = new AuthService();
  });

  describe('signup', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+33123456789',
      role: UserRole.CLIENT
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      
      const mockUser = new User();
      Object.assign(mockUser, signupData);
      mockUser.id = 'user-id';
      mockUser.hashPassword = jest.fn().mockResolvedValue(undefined);
      mockUser.toJSON = jest.fn().mockReturnValue({ id: 'user-id', email: 'test@example.com' });
      
      // Important : Mock save pour retourner l'utilisateur avec hashPassword appelé
      mockUserRepository.save.mockImplementation(async (user) => {
        // Simuler l'appel à hashPassword
        if (user.hashPassword) {
          await user.hashPassword();
        }
        return user;
      });
      
      (jwt.sign as any).mockReturnValue('mock-token');

      // Act
      const result = await authService.signup(signupData);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw ConflictError if email already exists', async () => {
      // Arrange
      const existingUser = new User();
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.signup(signupData)).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.email = 'test@example.com';
      mockUser.password = 'hashed-password';
      mockUser.status = UserStatus.ACTIVE;
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      mockUser.toJSON = jest.fn().mockReturnValue({ id: 'user-id', email: 'test@example.com' });

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (jwt.sign as any).mockReturnValue('mock-token');

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('TestPassword123!');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AuthenticationError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AuthenticationError);
    });

    it('should throw UnauthorizedError if user is not active', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.status = UserStatus.INACTIVE;
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AuthenticationError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.status = UserStatus.ACTIVE;
      mockUser.toJSON = jest.fn().mockReturnValue({ id: 'user-id' });

      (jwt.verify as any).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (jwt.sign as any).mockReturnValue('new-token');

      // Act
      const result = await authService.refreshToken('valid-refresh-token');

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError with invalid refresh token', async () => {
      // Arrange
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(AuthenticationError);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      (jwt.verify as any).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken('valid-token')).rejects.toThrow(AuthenticationError);
    });

    it('should throw UnauthorizedError if user is not active', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.status = UserStatus.INACTIVE;

      (jwt.verify as any).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.refreshToken('valid-token')).rejects.toThrow(AuthenticationError);
    });
  });

  describe('validateToken', () => {
    it('should return user if token is valid', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.status = UserStatus.ACTIVE;

      (jwt.verify as any).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await authService.validateToken('valid-token');

      // Assert
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedError if token is expired', async () => {
      // Arrange
      (jwt.verify as any).mockImplementation(() => {
        const error = new Error('Token expired');
        Object.defineProperty(error, 'name', {
          value: 'TokenExpiredError',
          writable: false
        });
        throw error;
      });

      // Act & Assert
      await expect(authService.validateToken('expired-token')).rejects.toThrow(AuthenticationError);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      (jwt.verify as any).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.validateToken('valid-token')).rejects.toThrow(AuthenticationError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      mockUser.hashPassword = jest.fn().mockResolvedValue(undefined);

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      await authService.changePassword('user-id', 'old-password', 'new-password');

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('old-password');
      expect(mockUser.hashPassword).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestError if current password is incorrect', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.changePassword('user-id', 'wrong-password', 'new-password')).rejects.toThrow();
    });
  });
}); 