import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token d\'authentification manquant',
        message: 'Veuillez fournir un token Bearer valide'
      });
      return;
    }

    const token = authHeader.substring(7); // Enlever "Bearer "
    const jwtSecret = process.env['JWT_SECRET'];

    if (!jwtSecret) {
      res.status(500).json({
        error: 'Configuration serveur invalide',
        message: 'Clé JWT manquante'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({
        error: 'Utilisateur non trouvé',
        message: 'Token invalide ou utilisateur supprimé'
      });
      return;
    }

    if (!user.isActive()) {
      res.status(403).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été suspendu ou désactivé'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Token invalide',
        message: 'Le token d\'authentification est invalide ou expiré'
      });
    } else {
      res.status(500).json({
        error: 'Erreur d\'authentification',
        message: 'Une erreur est survenue lors de la vérification du token'
      });
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires pour cette action'
      });
      return;
    }

    next();
  };
};

export const requireAssistant = requireRole(['assistant']);
export const requireClient = requireRole(['client']);
export const requireAnyRole = requireRole(['client', 'assistant']); 