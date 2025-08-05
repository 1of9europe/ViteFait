import { Server } from 'socket.io';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Mission } from '../models/Mission';

interface AuthenticatedSocket {
  userId: string;
  userRole: string;
}

export const socketHandler = (io: Server): void => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token d\'authentification manquant'));
      }

      // TODO: Vérifier le token JWT et récupérer l'utilisateur
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      // const user = await userRepository.findOne({ where: { id: decoded.userId } });
      
      // Pour l'instant, on simule
      const authenticatedSocket = socket as AuthenticatedSocket & typeof socket;
      authenticatedSocket.userId = 'user-id'; // decoded.userId;
      authenticatedSocket.userRole = 'client'; // user.role;
      
      next();
    } catch (error) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket & typeof socket;
    console.log(`🔌 Utilisateur connecté: ${authenticatedSocket.userId}`);

    // Rejoindre la room personnelle de l'utilisateur
    socket.join(`user:${authenticatedSocket.userId}`);

    // Gestion des messages de chat
    socket.on('join-mission-chat', async (missionId: string) => {
      try {
        const missionRepository = AppDataSource.getRepository(Mission);
        const mission = await missionRepository.findOne({
          where: { id: missionId },
          relations: ['client', 'assistant']
        });

        if (!mission) {
          socket.emit('error', { message: 'Mission non trouvée' });
          return;
        }

        // Vérifier que l'utilisateur a accès à cette mission
        const hasAccess = 
          authenticatedSocket.userId === mission.clientId || 
          authenticatedSocket.userId === mission.assistantId;

        if (!hasAccess) {
          socket.emit('error', { message: 'Accès refusé' });
          return;
        }

        socket.join(`mission:${missionId}`);
        socket.emit('joined-mission-chat', { missionId });
        
        console.log(`👥 Utilisateur ${authenticatedSocket.userId} a rejoint le chat de la mission ${missionId}`);
      } catch (error) {
        console.error('Erreur lors de la jointure du chat:', error);
        socket.emit('error', { message: 'Erreur lors de la jointure du chat' });
      }
    });

    socket.on('leave-mission-chat', (missionId: string) => {
      socket.leave(`mission:${missionId}`);
      socket.emit('left-mission-chat', { missionId });
      console.log(`👋 Utilisateur ${authenticatedSocket.userId} a quitté le chat de la mission ${missionId}`);
    });

    socket.on('send-message', async (data: {
      missionId: string;
      message: string;
      type?: 'text' | 'image' | 'location';
    }) => {
      try {
        const { missionId, message, type = 'text' } = data;

        const missionRepository = AppDataSource.getRepository(Mission);
        const mission = await missionRepository.findOne({
          where: { id: missionId },
          relations: ['client', 'assistant']
        });

        if (!mission) {
          socket.emit('error', { message: 'Mission non trouvée' });
          return;
        }

        // Vérifier que l'utilisateur a accès à cette mission
        const hasAccess = 
          authenticatedSocket.userId === mission.clientId || 
          authenticatedSocket.userId === mission.assistantId;

        if (!hasAccess) {
          socket.emit('error', { message: 'Accès refusé' });
          return;
        }

        const messageData = {
          id: Date.now().toString(), // TODO: Générer un vrai ID
          missionId,
          senderId: authenticatedSocket.userId,
          senderRole: authenticatedSocket.userRole,
          message,
          type,
          timestamp: new Date().toISOString()
        };

        // Envoyer le message à tous les participants de la mission
        io.to(`mission:${missionId}`).emit('new-message', messageData);

        // TODO: Sauvegarder le message en base de données
        console.log(`💬 Message envoyé dans la mission ${missionId}:`, messageData);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    socket.on('typing', (data: { missionId: string; isTyping: boolean }) => {
      const { missionId, isTyping } = data;
      
      // Informer les autres participants que l'utilisateur tape
      socket.to(`mission:${missionId}`).emit('user-typing', {
        userId: authenticatedSocket.userId,
        isTyping
      });
    });

    socket.on('mission-status-update', async (data: {
      missionId: string;
      status: string;
      comment?: string;
    }) => {
      try {
        const { missionId, status, comment } = data;

        const missionRepository = AppDataSource.getRepository(Mission);
        const mission = await missionRepository.findOne({
          where: { id: missionId },
          relations: ['client', 'assistant']
        });

        if (!mission) {
          socket.emit('error', { message: 'Mission non trouvée' });
          return;
        }

        // Vérifier que l'utilisateur peut mettre à jour le statut
        const canUpdateStatus = 
          authenticatedSocket.userId === mission.clientId || 
          authenticatedSocket.userId === mission.assistantId;

        if (!canUpdateStatus) {
          socket.emit('error', { message: 'Accès refusé' });
          return;
        }

        // TODO: Mettre à jour le statut en base de données

        // Notifier tous les participants
        io.to(`mission:${missionId}`).emit('mission-status-changed', {
          missionId,
          status,
          updatedBy: authenticatedSocket.userId,
          comment,
          timestamp: new Date().toISOString()
        });

        // Envoyer des notifications push
        const participants = [mission.clientId, mission.assistantId].filter(id => id !== authenticatedSocket.userId);
        
        participants.forEach(participantId => {
          io.to(`user:${participantId}`).emit('notification', {
            type: 'mission_status_update',
            title: 'Mise à jour de mission',
            message: `Le statut de votre mission a été mis à jour: ${status}`,
            data: { missionId, status }
          });
        });

        console.log(`📊 Statut de la mission ${missionId} mis à jour: ${status}`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        socket.emit('error', { message: 'Erreur lors de la mise à jour du statut' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Utilisateur déconnecté: ${authenticatedSocket.userId}`);
    });
  });

  // Gestion des notifications push
  io.on('notification', (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) => {
    const { userId, type, title, message, data: notificationData } = data;
    
    io.to(`user:${userId}`).emit('notification', {
      type,
      title,
      message,
      data: notificationData,
      timestamp: new Date().toISOString()
    });
  });
}; 