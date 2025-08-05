import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { HttpError, UnauthorizedError, BadRequestError, ConflictError } from '../utils/errors';
import { UserRole, UserStatus } from '../types/enums';

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phoneNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<User>;
  token: string;
  refreshToken: string;
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
    logger.info({ email: data.email, role: data.role }, 'Tentative d\'inscription');

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      logger.warn({ email: data.email }, 'Tentative d\'inscription avec un email existant');
      throw new ConflictError('EMAIL_ALREADY_EXISTS', 'Un compte avec cet email existe déjà');
    }

    // Créer le nouvel utilisateur
    const user = new User();
    user.email = data.email.toLowerCase();
    user.setPassword(data.password);
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.role = data.role || UserRole.CLIENT;
    user.status = UserStatus.ACTIVE;
    user.phoneNumber = data.phoneNumber;

    // Sauvegarder l'utilisateur
    const savedUser = await this.userRepository.save(user);

    // Générer les tokens
    const token = this.generateToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    logger.info({ userId: savedUser.id, email: savedUser.email }, 'Utilisateur inscrit avec succès');

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
    logger.info({ email: data.email }, 'Tentative de connexion');

    // Rechercher l'utilisateur
    const user = await this.userRepository.findOne({
      where: { email: data.email.toLowerCase() }
    });

    if (!user) {
      logger.warn({ email: data.email }, 'Tentative de connexion avec un email inexistant');
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    if (!user.comparePassword(data.password)) {
      logger.warn({ email: data.email }, 'Tentative de connexion avec un mot de passe incorrect');
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    // Vérifier que l'utilisateur est actif
    if (!user.isActive()) {
      logger.warn({ userId: user.id, email: user.email }, 'Tentative de connexion d\'un utilisateur inactif');
      throw new UnauthorizedError('USER_INACTIVE', 'Votre compte a été désactivé');
    }

    // Mettre à jour lastSeen (si le champ existe)
    // Note: Le champ lastSeen n'existe pas dans notre modèle User actuel
    // await this.userRepository.update(user.id, { lastSeen: new Date() });

    // Générer les tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info({ userId: user.id, email: user.email }, 'Utilisateur connecté avec succès');

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
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive()) {
        throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide');
      }

      const token = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      logger.info({ userId: user.id }, 'Token rafraîchi avec succès');

      return {
        user: user.toJSON(),
        token,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.warn({ error: error.message }, 'Échec du rafraîchissement de token');
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide');
    }
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    return user.toJSON();
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: string, updateData: Partial<User>): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    // Mettre à jour les champs autorisés
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;
    if (updateData.avatar) user.avatar = updateData.avatar;
    if (updateData.metadata) user.metadata = updateData.metadata;

    // Si le mot de passe est fourni, le mettre à jour
    if (updateData.hashedPassword) {
      user.setPassword(updateData.hashedPassword);
    }

    const updatedUser = await this.userRepository.save(user);

    logger.info({ userId: user.id }, 'Profil utilisateur mis à jour');

    return updatedUser.toJSON();
  }

  /**
   * Générer un token JWT
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Générer un token de rafraîchissement
   */
  private generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn
    });
  }

  /**
   * Valider un token JWT
   */
  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive()) {
        throw new UnauthorizedError('INVALID_TOKEN', 'Token invalide');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      logger.warn({ error: error.message }, 'Échec de validation de token');
      throw new UnauthorizedError('INVALID_TOKEN', 'Token invalide');
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    if (!user.comparePassword(currentPassword)) {
      throw new BadRequestError('INVALID_CURRENT_PASSWORD', 'Mot de passe actuel incorrect');
    }

    user.setPassword(newPassword);
    await this.userRepository.save(user);

    logger.info({ userId: user.id }, 'Mot de passe changé avec succès');
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      logger.info({ email }, 'Demande de réinitialisation de mot de passe (email non trouvé)');
      return;
    }

    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // TODO: Envoyer l'email avec le token
    logger.info({ userId: user.id, email }, 'Token de réinitialisation généré');
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(resetToken, config.jwt.secret) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new BadRequestError('INVALID_RESET_TOKEN', 'Token de réinitialisation invalide');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouvé');
      }

      user.setPassword(newPassword);
      await this.userRepository.save(user);

      logger.info({ userId: user.id }, 'Mot de passe réinitialisé avec succès');
    } catch (error) {
      logger.warn({ error: error.message }, 'Échec de réinitialisation de mot de passe');
      throw new BadRequestError('INVALID_RESET_TOKEN', 'Token de réinitialisation invalide');
    }
  }
}

// Instance singleton
export const authService = new AuthService(); 