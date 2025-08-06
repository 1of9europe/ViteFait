import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../types/enums';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError, ConflictError } from '../middleware/errorHandler';

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
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictError('EMAIL_ALREADY_EXISTS', 'Un compte avec cet email existe déjà');
    }

    // Créer le nouvel utilisateur
    const user = new User();
    user.email = data.email.toLowerCase();
    user.password = data.password;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.phone = data.phone || '';
    user.role = data.role || UserRole.CLIENT;

    // Hasher le mot de passe
    await user.hashPassword();

    // Sauvegarder l'utilisateur
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
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Rechercher l'utilisateur par email
    const user = await this.userRepository.findOne({
      where: { email: data.email.toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.comparePassword(data.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    // Vérifier que l'utilisateur est actif
    if (!user.isActive()) {
      throw new UnauthorizedError('ACCOUNT_SUSPENDED', 'Compte suspendu ou inactif');
    }

    // Mettre à jour lastSeen
    user.lastSeen = new Date();
    await this.userRepository.save(user);

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
      const decoded = jwt.verify(refreshToken, process.env['JWT_REFRESH_SECRET']!) as TokenPayload;
      
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive()) {
        throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide');
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
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide');
    }
  }

  /**
   * Valider un token JWT et retourner l'utilisateur
   */
  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as TokenPayload;
      
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive()) {
        throw new UnauthorizedError('INVALID_TOKEN', 'Token invalide ou utilisateur inactif');
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('TOKEN_EXPIRED', 'Token expiré');
      }
      throw new UnauthorizedError('INVALID_TOKEN', 'Token invalide');
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
      throw new UnauthorizedError('USER_NOT_FOUND', 'Utilisateur non trouvé');
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
      throw new UnauthorizedError('USER_NOT_FOUND', 'Utilisateur non trouvé');
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
      throw new UnauthorizedError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new BadRequestError('INVALID_PASSWORD', 'Mot de passe actuel incorrect');
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

    return jwt.sign(payload, secret, { expiresIn: '7d' } as SignOptions);
  }
}

export const authService = new AuthService(); 