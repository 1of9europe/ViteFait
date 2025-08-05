import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenExpiredError as JwtTokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { config } from '../config/config';
import { userService } from '../services/UserService';
import { 
  UnauthorizedError, 
  TokenExpiredError, 
  TokenInvalidError,
  ForbiddenError 
} from '../utils/errors';
import { logger, logAudit } from '../utils/logger';
import { z } from 'zod';

// Schéma de validation pour le payload JWT
const JwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['client', 'assistant']),
  iat: z.number(),
  exp: z.number(),
});

type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// Interface étendue pour Request avec utilisateur
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'client' | 'assistant';
  };
}

/**
 * Middleware d'authentification principal
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      logger.warn('Authentication attempt without token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
      });
      throw new UnauthorizedError('Token d\'authentification manquant');
    }

    const payload = await verifyAndValidateToken(token);
    const user = await userService.findById(payload.userId);

    if (!user) {
      logger.warn('Authentication attempt with invalid user', {
        userId: payload.userId,
        ip: req.ip,
        url: req.url,
      });
      throw new UnauthorizedError('Utilisateur non trouvé');
    }

    if (user.status !== 'active') {
      logger.warn('Authentication attempt with inactive user', {
        userId: user.id,
        status: user.status,
        ip: req.ip,
        url: req.url,
      });
      throw new ForbiddenError('Compte utilisateur inactif');
    }

    // Attacher l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Logger l'accès réussi
    logAudit('authentication_success', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    next();
  } catch (error) {
    handleAuthError(error, req, res, next);
  }
};

/**
 * Middleware pour exiger un rôle spécifique
 */
export const requireRole = (requiredRole: 'client' | 'assistant' | 'both') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentification requise');
      }

      if (requiredRole === 'both') {
        // Aucune vérification de rôle spécifique
        next();
        return;
      }

      if (req.user.role !== requiredRole) {
        logger.warn('Access denied due to insufficient role', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRole,
          ip: req.ip,
          url: req.url,
        });

        logAudit('access_denied_insufficient_role', req.user.id, {
          userRole: req.user.role,
          requiredRole,
          ip: req.ip,
          url: req.url,
          method: req.method,
        });

        throw new ForbiddenError(`Accès réservé aux ${requiredRole}s`);
      }

      next();
    } catch (error) {
      handleAuthError(error, req, res, next);
    }
  };
};

/**
 * Middleware pour exiger que l'utilisateur soit le propriétaire de la ressource
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentification requise');
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        throw new BadRequestError('ID de ressource manquant');
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (req.user.id !== resourceId) {
        logger.warn('Access denied due to resource ownership', {
          userId: req.user.id,
          resourceId,
          ip: req.ip,
          url: req.url,
        });

        logAudit('access_denied_ownership', req.user.id, {
          resourceId,
          ip: req.ip,
          url: req.url,
          method: req.method,
        });

        throw new ForbiddenError('Accès non autorisé à cette ressource');
      }

      next();
    } catch (error) {
      handleAuthError(error, req, res, next);
    }
  };
};

/**
 * Middleware optionnel d'authentification (ne bloque pas si pas de token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      // Pas de token, continuer sans authentification
      next();
      return;
    }

    const payload = await verifyAndValidateToken(token);
    const user = await userService.findById(payload.userId);

    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // En cas d'erreur d'authentification, continuer sans utilisateur
    logger.debug('Optional authentication failed, continuing without user', { error });
    next();
  }
};

/**
 * Extrait le token d'authentification de la requête
 */
function extractTokenFromRequest(req: Request): string | null {
  // Vérifier l'en-tête Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Vérifier le cookie (si utilisé)
  const cookieToken = req.cookies?.token;
  if (cookieToken) {
    return cookieToken;
  }

  // Vérifier le paramètre de requête (pour les liens de confirmation)
  const queryToken = req.query.token as string;
  if (queryToken) {
    return queryToken;
  }

  return null;
}

/**
 * Vérifie et valide le token JWT
 */
async function verifyAndValidateToken(token: string): Promise<JwtPayload> {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as unknown;
    
    // Validation stricte du payload avec Zod
    const validatedPayload = JwtPayloadSchema.parse(decoded);
    
    return validatedPayload;
  } catch (error) {
    if (error instanceof JwtTokenExpiredError) {
      logger.warn('Token expired', { token: token.substring(0, 10) + '...' });
      throw new TokenExpiredError('Token d\'authentification expiré');
    }
    
    if (error instanceof JsonWebTokenError) {
      logger.warn('Invalid token', { token: token.substring(0, 10) + '...' });
      throw new TokenInvalidError('Token d\'authentification invalide');
    }
    
    if (error instanceof z.ZodError) {
      logger.warn('Token payload validation failed', { 
        errors: error.errors,
        token: token.substring(0, 10) + '...'
      });
      throw new TokenInvalidError('Structure du token invalide');
    }
    
    logger.error('Unexpected token verification error', { error });
    throw new TokenInvalidError('Erreur lors de la vérification du token');
  }
}

/**
 * Gère les erreurs d'authentification
 */
function handleAuthError(
  error: unknown,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof UnauthorizedError || 
      error instanceof TokenExpiredError || 
      error instanceof TokenInvalidError ||
      error instanceof ForbiddenError) {
    
    // Logger l'erreur d'authentification
    logger.warn('Authentication error', {
      error: error.message,
      code: error.code,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });

    // Répondre avec l'erreur appropriée
    res.status(error.statusCode).json({
      status: 'error',
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Erreur inattendue, laisser le middleware d'erreur global la gérer
    next(error);
  }
}

// Import manquant pour BadRequestError
import { BadRequestError } from '../utils/errors'; 