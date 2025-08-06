import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Message, MessageType } from '../models/Message';
import { Mission } from '../models/Mission';
import { User } from '../models/User';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middleware/errorHandler';

export interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  senderId?: string;
  senderName: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface SendMessageData {
  missionId: string;
  content: string;
  type?: MessageType;
  metadata?: Record<string, any>;
}

export class ChatService {
  private messageRepository: Repository<Message>;
  private missionRepository: Repository<Mission>;
  private userRepository: Repository<User>;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
    this.missionRepository = AppDataSource.getRepository(Mission);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Envoyer un message dans une conversation de mission
   */
  async sendMessage(userId: string, data: SendMessageData): Promise<ChatMessage> {
    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: data.missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Vérifier que l'utilisateur a accès à cette mission
    if (mission.clientId !== userId && mission.assistantId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à envoyer des messages dans cette conversation');
    }

    // Créer le message
    const message = new Message();
    message.missionId = data.missionId;
    message.senderId = userId;
    message.content = data.content;
    message.type = data.type || MessageType.TEXT;
    if (data.metadata) {
      message.metadata = data.metadata;
    }

    const savedMessage = await this.messageRepository.save(message);

    // Charger les relations pour le retour
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender']
    });

    if (!messageWithSender) {
      throw new NotFoundError('MESSAGE_NOT_FOUND', 'Message non trouvé après création');
    }

    return {
      id: messageWithSender.id,
      content: messageWithSender.content,
      type: messageWithSender.type,
      senderId: messageWithSender.senderId,
      senderName: messageWithSender.getSenderName(),
      createdAt: messageWithSender.createdAt,
      metadata: messageWithSender.metadata
    };
  }

  /**
   * Obtenir l'historique des messages d'une mission
   */
  async getMissionMessages(missionId: string, userId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Vérifier que l'utilisateur a accès à cette mission
    if (mission.clientId !== userId && mission.assistantId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à accéder à cette conversation');
    }

    // Récupérer les messages
    const messages = await this.messageRepository.find({
      where: { missionId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });

    // Convertir en format ChatMessage
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      type: message.type,
      senderId: message.senderId,
      senderName: message.getSenderName(),
      createdAt: message.createdAt,
      metadata: message.metadata
    })).reverse(); // Remettre dans l'ordre chronologique
  }

  /**
   * Envoyer un message système
   */
  async sendSystemMessage(missionId: string, content: string, metadata?: Record<string, any>): Promise<ChatMessage> {
    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: missionId }
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Créer le message système
    const message = new Message();
    message.missionId = missionId;
    message.content = content;
    message.type = MessageType.SYSTEM;
    if (metadata) {
      message.metadata = metadata;
    }

    const savedMessage = await this.messageRepository.save(message);

    return {
      id: savedMessage.id,
      content: savedMessage.content,
      type: savedMessage.type,
      senderName: savedMessage.getSenderName(),
      createdAt: savedMessage.createdAt,
      metadata: savedMessage.metadata
    };
  }

  /**
   * Envoyer un message de statut
   */
  async sendStatusMessage(missionId: string, status: string, userId: string, metadata?: Record<string, any>): Promise<ChatMessage> {
    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Vérifier que l'utilisateur a accès à cette mission
    if (mission.clientId !== userId && mission.assistantId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à envoyer des messages dans cette conversation');
    }

    // Créer le message de statut
    const message = new Message();
    message.missionId = missionId;
    message.senderId = userId;
    message.content = status;
    message.type = MessageType.STATUS;
    if (metadata) {
      message.metadata = metadata;
    }

    const savedMessage = await this.messageRepository.save(message);

    // Charger les relations pour le retour
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender']
    });

    if (!messageWithSender) {
      throw new NotFoundError('MESSAGE_NOT_FOUND', 'Message non trouvé après création');
    }

    return {
      id: messageWithSender.id,
      content: messageWithSender.content,
      type: messageWithSender.type,
      senderId: messageWithSender.senderId,
      senderName: messageWithSender.getSenderName(),
      createdAt: messageWithSender.createdAt,
      metadata: messageWithSender.metadata
    };
  }

  /**
   * Supprimer un message (seul l'expéditeur peut le faire)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new NotFoundError('MESSAGE_NOT_FOUND', 'Message non trouvé');
    }

    // Seul l'expéditeur peut supprimer le message
    if (message.senderId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à supprimer ce message');
    }

    // Les messages système ne peuvent pas être supprimés
    if (message.type === MessageType.SYSTEM) {
      throw new BadRequestError('INVALID_OPERATION', 'Impossible de supprimer un message système');
    }

    await this.messageRepository.remove(message);
  }

  /**
   * Obtenir les participants d'une conversation
   */
  async getMissionParticipants(missionId: string): Promise<Array<{ id: string; name: string; role: string }>> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    const participants = [];

    // Ajouter le client
    if (mission.client) {
      participants.push({
        id: mission.client.id,
        name: mission.client.getFullName(),
        role: 'client'
      });
    }

    // Ajouter l'assistant s'il existe
    if (mission.assistant) {
      participants.push({
        id: mission.assistant.id,
        name: mission.assistant.getFullName(),
        role: 'assistant'
      });
    }

    return participants;
  }

  /**
   * Vérifier si un utilisateur a accès à une conversation
   */
  async checkMissionAccess(missionId: string, userId: string): Promise<boolean> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId }
    });

    if (!mission) {
      return false;
    }

    return mission.clientId === userId || mission.assistantId === userId;
  }

  /**
   * Obtenir le nombre de messages non lus pour un utilisateur
   */
  async getUnreadMessageCount(missionId: string, userId: string, lastReadAt?: Date): Promise<number> {
    if (!lastReadAt) {
      // Si pas de date de dernière lecture, compter tous les messages
      return this.messageRepository.count({
        where: { missionId }
      });
    }

    return this.messageRepository.count({
      where: {
        missionId,
        createdAt: { $gt: lastReadAt } as any,
        senderId: { $ne: userId } as any
      }
    });
  }

  /**
   * Marquer les messages comme lus
   */
  async markMessagesAsRead(missionId: string, userId: string): Promise<void> {
    // Cette fonction pourrait être étendue pour stocker la date de dernière lecture
    // Pour l'instant, on ne fait rien car on n'a pas de table de lecture
    // TODO: Implémenter un système de marquage des messages comme lus
  }
}

export const chatService = new ChatService(); 