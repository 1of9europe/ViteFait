import { Socket } from 'socket.io';
import { authService } from '../services/AuthService';
import { logger } from '../utils/logger';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      userId: string;
      role: string;
      email: string;
    };
  };
}

/**
 * Middleware d'authentification pour Socket.IO
 */
export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): Promise<void> {
  try {
    const token = extractTokenFromSocket(socket);
    
    if (!token) {
      logger.warn({ socketId: socket.id }, 'Tentative de connexion sans token');
      return next(new UnauthorizedError('TOKEN_MISSING', 'Token d\'authentification requis'));
    }

    // Valider le token via le service d'authentification
    const user = await authService.validateToken(token);
    
    // Attacher les informations utilisateur au socket
    (socket as AuthenticatedSocket).data.user = {
      userId: user.id,
      role: user.role,
      email: user.email
    };

    logger.info({ 
      socketId: socket.id, 
      userId: user.id, 
      email: user.email 
    }, 'Socket authentifié avec succès');

    next();
  } catch (error) {
    logger.warn({ 
      socketId: socket.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 'Échec de l\'authentification socket');

    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new UnauthorizedError('AUTH_FAILED', 'Échec de l\'authentification'));
  }
}

/**
 * Extraire le token d'authentification du socket
 */
function extractTokenFromSocket(socket: Socket): string | null {
  // Essayer d'abord depuis les headers
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Essayer depuis les query parameters
  const tokenFromQuery = socket.handshake.query.token;
  if (typeof tokenFromQuery === 'string') {
    return tokenFromQuery;
  }

  // Essayer depuis les auth data
  const authData = socket.handshake.auth;
  if (authData && authData.token) {
    return authData.token;
  }

  return null;
}

/**
 * Middleware de gestion d'erreurs pour Socket.IO
 */
export function socketErrorMiddleware(error: Error, socket: Socket, next: (err?: Error) => void): void {
  logger.error({ 
    socketId: socket.id,
    error: error.message,
    stack: error.stack 
  }, 'Erreur dans le middleware socket');

  // Si c'est une erreur HttpError, la transmettre
  if (error instanceof UnauthorizedError) {
    return next(error);
  }

  // Pour les autres erreurs, créer une erreur générique
  const genericError = new Error('Erreur interne du serveur');
  return next(genericError);
}

/**
 * Middleware de logging pour Socket.IO
 */
export function socketLoggingMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const startTime = Date.now();

  // Log de la connexion
  logger.info({ 
    socketId: socket.id,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  }, 'Nouvelle connexion socket');

  // Intercepter la déconnexion pour le logging
  socket.on('disconnect', (reason) => {
    const duration = Date.now() - startTime;
    const user = (socket as AuthenticatedSocket).data?.user;
    
    logger.info({ 
      socketId: socket.id,
      userId: user?.userId,
      reason,
      duration
    }, 'Déconnexion socket');
  });

  next();
}

/**
 * Middleware de validation des événements
 */
export function socketValidationMiddleware(socket: Socket, next: (err?: Error) => void): void {
  // Intercepter tous les événements pour validation
  const originalEmit = socket.emit;
  
  socket.emit = function(event: string, ...args: any[]) {
    logger.debug({ 
      socketId: socket.id,
      event,
      argsCount: args.length
    }, 'Émission d\'événement socket');
    
    return originalEmit.call(this, event, ...args);
  };

  next();
}

/**
 * Vérifier si un socket est authentifié
 */
export function isAuthenticated(socket: Socket): socket is AuthenticatedSocket {
  return !!(socket as AuthenticatedSocket).data?.user;
}

/**
 * Obtenir les informations utilisateur d'un socket authentifié
 */
export function getSocketUser(socket: Socket): { userId: string; role: string; email: string } | null {
  if (isAuthenticated(socket)) {
    return socket.data.user;
  }
  return null;
} 