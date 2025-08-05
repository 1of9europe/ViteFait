import { Server, Socket } from 'socket.io';
import { chatService } from './ChatService';
import { notificationService } from './NotificationService';
import { logger } from '../utils/logger';
import { 
  socketAuthMiddleware, 
  socketErrorMiddleware, 
  socketLoggingMiddleware,
  socketValidationMiddleware,
  AuthenticatedSocket,
  getSocketUser
} from '../middleware/socketAuth';
import { MissionStatus } from '../types/enums';

/**
 * Configuration et gestion des événements Socket.IO
 */
export function setupSocketHandler(io: Server): void {
  // Middleware d'authentification
  io.use(socketAuthMiddleware);
  
  // Middleware de logging
  io.use(socketLoggingMiddleware);
  
  // Middleware de validation
  io.use(socketValidationMiddleware);
  
  // Middleware de gestion d'erreurs
  io.use(socketErrorMiddleware);

  // Gestion des connexions
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = getSocketUser(socket);
    
    if (!user) {
      logger.error({ socketId: socket.id }, 'Socket connecté sans utilisateur authentifié');
      socket.disconnect();
      return;
    }

    logger.info({ 
      socketId: socket.id, 
      userId: user.userId, 
      email: user.email 
    }, 'Nouvelle connexion socket authentifiée');

    // Rejoindre la room personnelle de l'utilisateur
    socket.join(`user:${user.userId}`);

    // Événement de test de connexion
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Rejoindre le chat d'une mission
    socket.on('join-mission-chat', async (missionId: string) => {
      try {
        const chatInfo = await chatService.joinMissionChat(user.userId, missionId);
        
        // Rejoindre la room de la mission
        socket.join(`mission:${missionId}`);
        
        // Envoyer les informations du chat
        socket.emit('mission-chat-joined', {
          missionId,
          participants: chatInfo.participants,
          messages: chatInfo.messages
        });

        // Notifier les autres participants
        socket.to(`mission:${missionId}`).emit('user-joined-chat', {
          userId: user.userId,
          userName: user.email, // TODO: Utiliser le nom complet
          timestamp: new Date().toISOString()
        });

        logger.info({ 
          socketId: socket.id, 
          userId: user.userId, 
          missionId 
        }, 'Utilisateur a rejoint le chat de mission');

      } catch (error) {
        logger.error({ 
          socketId: socket.id, 
          userId: user.userId, 
          missionId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, 'Erreur lors de la jonction du chat de mission');

        socket.emit('error', {
          code: 'JOIN_CHAT_FAILED',
          message: 'Impossible de rejoindre le chat de mission'
        });
      }
    });

    // Envoyer un message dans le chat
    socket.on('send-message', async (data: { missionId: string; message: string }) => {
      try {
        const { missionId, message } = data;
        
        if (!message || message.trim().length === 0) {
          socket.emit('error', {
            code: 'EMPTY_MESSAGE',
            message: 'Le message ne peut pas être vide'
          });
          return;
        }

        const chatMessage = await chatService.sendMessage(user.userId, missionId, message);

        // Émettre le message à tous les participants de la mission
        io.to(`mission:${missionId}`).emit('new-message', chatMessage);

        // Envoyer des notifications push aux autres participants
        const participants = await chatService.getMissionParticipants(missionId);
        const otherParticipants = participants.filter(p => p.id !== user.userId);

        for (const participant of otherParticipants) {
          await notificationService.sendChatNotification(
            user.userId,
            participant.id,
            missionId,
            message
          );
        }

        logger.info({ 
          socketId: socket.id, 
          userId: user.userId, 
          missionId, 
          messageId: chatMessage.id 
        }, 'Message envoyé avec succès');

      } catch (error) {
        logger.error({ 
          socketId: socket.id, 
          userId: user.userId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, 'Erreur lors de l\'envoi de message');

        socket.emit('error', {
          code: 'SEND_MESSAGE_FAILED',
          message: 'Impossible d\'envoyer le message'
        });
      }
    });

    // Mettre à jour le statut d'une mission
    socket.on('update-mission-status', async (data: { 
      missionId: string; 
      status: MissionStatus; 
      comment?: string 
    }) => {
      try {
        const { missionId, status, comment } = data;
        
        const result = await chatService.updateMissionStatus(user.userId, missionId, status, comment);

        // Émettre la mise à jour à tous les participants
        io.to(`mission:${missionId}`).emit('mission-status-updated', {
          missionId,
          status,
          comment,
          updatedBy: user.userId,
          timestamp: new Date().toISOString(),
          mission: result.mission,
          statusHistory: result.statusHistory
        });

        // Envoyer des notifications aux autres participants
        const participants = await chatService.getMissionParticipants(missionId);
        const otherParticipants = participants.filter(p => p.id !== user.userId);

        for (const participant of otherParticipants) {
          await notificationService.sendMissionStatusNotification(
            participant.id,
            missionId,
            status,
            result.mission.title
          );
        }

        logger.info({ 
          socketId: socket.id, 
          userId: user.userId, 
          missionId, 
          status 
        }, 'Statut de mission mis à jour');

      } catch (error) {
        logger.error({ 
          socketId: socket.id, 
          userId: user.userId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, 'Erreur lors de la mise à jour du statut de mission');

        socket.emit('error', {
          code: 'UPDATE_STATUS_FAILED',
          message: 'Impossible de mettre à jour le statut de mission'
        });
      }
    });

    // Quitter le chat d'une mission
    socket.on('leave-mission-chat', (missionId: string) => {
      socket.leave(`mission:${missionId}`);
      
      // Notifier les autres participants
      socket.to(`mission:${missionId}`).emit('user-left-chat', {
        userId: user.userId,
        userName: user.email, // TODO: Utiliser le nom complet
        timestamp: new Date().toISOString()
      });

      logger.info({ 
        socketId: socket.id, 
        userId: user.userId, 
        missionId 
      }, 'Utilisateur a quitté le chat de mission');
    });

    // Gestion de la déconnexion
    socket.on('disconnect', (reason) => {
      logger.info({ 
        socketId: socket.id, 
        userId: user.userId, 
        reason 
      }, 'Déconnexion socket');

      // Quitter toutes les rooms
      socket.rooms.forEach(room => {
        if (room.startsWith('mission:')) {
          const missionId = room.replace('mission:', '');
          socket.to(room).emit('user-disconnected', {
            userId: user.userId,
            userName: user.email, // TODO: Utiliser le nom complet
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
      logger.error({ 
        socketId: socket.id, 
        userId: user.userId, 
        error 
      }, 'Erreur socket côté client');
    });
  });

  // Gestion des erreurs globales du serveur Socket.IO
  io.engine.on('connection_error', (err) => {
    logger.error({ 
      error: err.message,
      context: err.context 
    }, 'Erreur de connexion Socket.IO');
  });

  logger.info('Socket.IO handler configuré avec succès');
}

/**
 * Fonction utilitaire pour émettre un événement à un utilisateur spécifique
 */
export function emitToUser(io: Server, userId: string, event: string, data: any): void {
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Fonction utilitaire pour émettre un événement à tous les utilisateurs d'une mission
 */
export function emitToMission(io: Server, missionId: string, event: string, data: any): void {
  io.to(`mission:${missionId}`).emit(event, data);
}

/**
 * Fonction utilitaire pour émettre un événement à tous les utilisateurs connectés
 */
export function emitToAll(io: Server, event: string, data: any): void {
  io.emit(event, data);
} 