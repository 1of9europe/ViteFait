import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
}

export class JWTService {
  private static readonly DEFAULT_EXPIRES_IN = '1h';
  private static readonly REFRESH_EXPIRES_IN = '7d';

  /**
   * Génère un token d'accès
   */
  static generateToken(payload: TokenPayload, options: TokenOptions = {}): string {
    try {
      const secret = process.env['JWT_SECRET'];
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }

      const tokenOptions: jwt.SignOptions = {
        expiresIn: (options.expiresIn || this.DEFAULT_EXPIRES_IN) as any,
        issuer: options.issuer || 'conciergerie-urbaine',
        audience: options.audience || 'conciergerie-urbaine-api'
      };

      const token = jwt.sign(payload, secret, tokenOptions);
      
      logger.debug(`Token généré avec succès pour l'utilisateur ${payload.userId}`);
      
      return token;
    } catch (error) {
      logger.error(`Erreur lors de la génération du token: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error('Erreur lors de la génération du token');
    }
  }

  /**
   * Génère un token de rafraîchissement
   */
  static generateRefreshToken(payload: TokenPayload): string {
    try {
      const secret = process.env['JWT_REFRESH_SECRET'];
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
      }

      const tokenOptions: jwt.SignOptions = {
        expiresIn: this.REFRESH_EXPIRES_IN,
        issuer: 'conciergerie-urbaine',
        audience: 'conciergerie-urbaine-refresh'
      };

      const token = jwt.sign(payload, secret, tokenOptions);
      
      logger.debug(`Token de rafraîchissement généré avec succès pour l'utilisateur ${payload.userId}`);
      
      return token;
    } catch (error) {
      logger.error(`Erreur lors de la génération du token de rafraîchissement: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error('Erreur lors de la génération du token de rafraîchissement');
    }
  }

  /**
   * Vérifie un token d'accès
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const secret = process.env['JWT_SECRET'];
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }

      const decoded = jwt.verify(token, secret, {
        issuer: 'conciergerie-urbaine',
        audience: 'conciergerie-urbaine-api'
      }) as TokenPayload;

      logger.debug(`Token vérifié avec succès pour l'utilisateur ${decoded.userId}`);
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expiré');
        throw new Error('Token expiré');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Token invalide');
        throw new Error('Token invalide');
      } else {
        logger.error(`Erreur lors de la vérification du token: ${error instanceof Error ? error.message : String(error)}`);
        throw new Error('Erreur lors de la vérification du token');
      }
    }
  }

  /**
   * Vérifie un token de rafraîchissement
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      const secret = process.env['JWT_REFRESH_SECRET'];
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
      }

      const decoded = jwt.verify(token, secret, {
        issuer: 'conciergerie-urbaine',
        audience: 'conciergerie-urbaine-refresh'
      }) as TokenPayload;

      logger.debug(`Token de rafraîchissement vérifié avec succès pour l'utilisateur ${decoded.userId}`);
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token de rafraîchissement expiré');
        throw new Error('Token de rafraîchissement expiré');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Token de rafraîchissement invalide');
        throw new Error('Token de rafraîchissement invalide');
      } else {
        logger.error(`Erreur lors de la vérification du token de rafraîchissement: ${error instanceof Error ? error.message : String(error)}`);
        throw new Error('Erreur lors de la vérification du token de rafraîchissement');
      }
    }
  }

  /**
   * Décode un token sans vérification (pour obtenir les informations)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.error(`Erreur lors du décodage du token: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Vérifie si un token va expirer bientôt
   */
  static isTokenExpiringSoon(token: string, thresholdMinutes: number = 30): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return false;
      }

      const expirationTime = decoded.exp * 1000; // Convertir en millisecondes
      const currentTime = Date.now();
      const thresholdTime = thresholdMinutes * 60 * 1000; // Convertir en millisecondes

      return (expirationTime - currentTime) <= thresholdTime;
    } catch (error) {
      logger.error(`Erreur lors de la vérification de l'expiration du token: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Génère un token temporaire pour des opérations spécifiques
   */
  static generateTemporaryToken(payload: TokenPayload, expiresIn: string = '15m'): string {
    try {
      const secret = process.env['JWT_SECRET'];
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }

      const tokenOptions: jwt.SignOptions = {
        expiresIn: expiresIn as any,
        issuer: 'conciergerie-urbaine',
        audience: 'conciergerie-urbaine-temp'
      };

      const token = jwt.sign(payload, secret, tokenOptions);
      
      logger.debug(`Token temporaire généré avec succès pour l'utilisateur ${payload.userId}`);
      
      return token;
    } catch (error) {
      logger.error(`Erreur lors de la génération du token temporaire: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error('Erreur lors de la génération du token temporaire');
    }
  }
} 