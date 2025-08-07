import { Repository } from 'typeorm';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../types/enums';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors';

export interface AuthResponse {
  user: Partial<User>;
  token: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('EMAIL_EXISTS', 'Un utilisateur avec cet email existe déjà');
    }

    // Créer le nouvel utilisateur
    const user = new User();
    user.email = data.email;
    user.password = data.password;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.phone = data.phone || '';
    user.role = data.role || UserRole.CLIENT;

    // Hasher le mot de passe et sauvegarder
    await user.hashPassword();
    const savedUser = await this.userRepository.save(user);

    // Générer les tokens
    const token = this.generateToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    return {
      user: savedUser.toJSON(),
      token,
      refreshToken
    };
  }

  /**
   * Connexion utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Trouver l'utilisateur par email
    const user = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (!user) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.comparePassword(data.password);
    if (!isValidPassword) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    // Vérifier que l'utilisateur est actif
    if (!user.isActive()) {
      throw new AuthenticationError('USER_INACTIVE', 'Compte désactivé');
    }

    // Générer les tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  /**
   * Rafraîchir un token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const secret = process.env['JWT_REFRESH_SECRET']!;
      const decoded = jwt.verify(refreshToken, secret) as TokenPayload;

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive()) {
        throw new AuthenticationError('INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide');
      }

      // Générer de nouveaux tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        user: user.toJSON(),
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new AuthenticationError('INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide');
    }
  }

  /**
   * Valider un token JWT
   */
  async validateToken(token: string): Promise<User> {
    try {
      const secret = process.env['JWT_SECRET']!;
      const decoded = jwt.verify(token, secret) as TokenPayload;

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive()) {
        throw new AuthenticationError('INVALID_TOKEN', 'Token invalide ou utilisateur inactif');
      }

      return user;
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new AuthenticationError('TOKEN_EXPIRED', 'Token expiré');
      }
      throw new AuthenticationError('INVALID_TOKEN', 'Token invalide');
    }
  }

  /**
   * Obtenir le profil utilisateur
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AuthenticationError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    return user.toJSON();
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AuthenticationError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    // Mettre à jour les champs autorisés
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address !== undefined) user.address = data.address;
    if (data.city !== undefined) user.city = data.city;
    if (data.postalCode !== undefined) user.postalCode = data.postalCode;
    if (data.bio !== undefined) user.bio = data.bio;

    const updatedUser = await this.userRepository.save(user);
    return updatedUser.toJSON();
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AuthenticationError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new ValidationError('INVALID_PASSWORD', 'Mot de passe actuel incorrect');
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.hashPassword();
    await this.userRepository.save(user);
  }

  /**
   * Générer un token JWT
   */
  private generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const secret = process.env['JWT_SECRET']!;
    const expiresIn = process.env['JWT_EXPIRES_IN'] || '1h';

    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  }

  /**
   * Générer un token de rafraîchissement
   */
  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const secret = process.env['JWT_REFRESH_SECRET']!;
    const expiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';

    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  }
}

export const authService = new AuthService(); 