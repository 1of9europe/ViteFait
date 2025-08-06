/// <reference types="jest" />

import { AuthService } from '../../../src/services/AuthService';
import { User } from '../../../src/models/User';
import { UserRole, UserStatus } from '../../../src/types/enums';
import { AppDataSource } from '../../../src/config/database';
import * as jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../../src/middleware/errorHandler';

// Mock des dépendances
jest.mock('../../../src/config/database');
jest.mock('jsonwebtoken');

const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
};

const mockAppDataSource = {
  getRepository: jest.fn(() => mockUserRepository)
};

(AppDataSource as any) = mockAppDataSource;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '0123456789',
      role: UserRole.CLIENT
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      const mockUser = new User();
      Object.assign(mockUser, signupData);
      mockUser.id = 'user-id';
      mockUser.hashPassword = jest.fn().mockResolvedValue(undefined);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (jwt.sign as jest.Mock).mockReturnValueOnce('mock-token');
      (jwt.sign as jest.Mock).mockReturnValueOnce('mock-refresh-token');

      // Act
      const result = await authService.signup(signupData);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockUser.hashPassword).toHaveBeenCalled();
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.email = 'test@example.com';
      mockUser.role = UserRole.CLIENT;
      mockUser.status = UserStatus.ACTIVE;
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      mockUser.isActive = jest.fn().mockReturnValue(true);
      mockUser.toJSON = jest.fn().mockReturnValue({ id: 'user-id', email: 'test@example.com' });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (jwt.sign as jest.Mock).mockReturnValueOnce('mock-token');
      (jwt.sign as jest.Mock).mockReturnValueOnce('mock-refresh-token');

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if user is not active', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      mockUser.isActive = jest.fn().mockReturnValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.email = 'test@example.com';
      mockUser.role = UserRole.CLIENT;
      mockUser.isActive = jest.fn().mockReturnValue(true);
      mockUser.toJSON = jest.fn().mockReturnValue({ id: 'user-id', email: 'test@example.com' });
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id' });
      (jwt.sign as jest.Mock).mockReturnValue('new-token');
      (jwt.sign as jest.Mock).mockReturnValueOnce('new-token');
      (jwt.sign as jest.Mock).mockReturnValueOnce('new-refresh-token');

      // Act
      const result = await authService.refreshToken('valid-refresh-token');

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError with invalid refresh token', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken('valid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if user is not active', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.isActive = jest.fn().mockReturnValue(false);
      
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.refreshToken('valid-token')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('validateToken', () => {
    it('should return user if token is valid', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.email = 'test@example.com';
      
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await authService.validateToken('valid-token');

      // Assert
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedError if token is expired', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('Token expired');
        (error as any).name = 'TokenExpiredError';
        throw error;
      });

      // Act & Assert
      await expect(authService.validateToken('expired-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id' });
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.validateToken('valid-token')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      mockUser.hashPassword = jest.fn().mockResolvedValue(undefined);
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      await authService.changePassword('user-id', 'current-password', 'new-password');

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('current-password');
      expect(mockUser.hashPassword).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestError if current password is incorrect', async () => {
      // Arrange
      const mockUser = new User();
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        authService.changePassword('user-id', 'wrong-password', 'new-password')
      ).rejects.toThrow(BadRequestError);
    });
  });
}); 