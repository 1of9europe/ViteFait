import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Mission } from '../models/Mission';
import { User } from '../models/User';
import { MissionStatusHistory } from '../models/MissionStatusHistory';
import { logger } from '../utils/logger';
import { HttpError, ForbiddenError, NotFoundError } from '../utils/errors';
import { MissionStatus, UserRole } from '../types/enums';
import { generateId, now } from '../utils/helpers';

export interface ChatMessage {
  id: string;
  missionId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  timestamp: Date;
  type: 'text' | 'status' | 'system';
}

export interface MissionChatInfo {
  mission: Mission;
  participants: Array<{
    id: string;
    name: string;
    role: UserRole;
  }>;
  messages: ChatMessage[];
}

export class ChatService {
  private missionRepository: Repository<Mission>;
  private userRepository: Repository<User>;
  private missionStatusHistoryRepository: Repository<MissionStatusHistory>;

  constructor() {
    this.missionRepository = AppDataSource.getRepository(Mission);
    this.userRepository = AppDataSource.getRepository(User);
    this.missionStatusHistoryRepository = AppDataSource.getRepository(MissionStatusHistory);
  }

  /**
   * Rejoindre le chat d'une mission
   */
  async joinMissionChat(userId: string, missionId: string): Promise<MissionChatInfo> {
    logger.info({ userId, missionId }, 'Tentative de rejoindre le chat de mission');

    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Vérifier que l'utilisateur a accès à cette mission
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    const hasAccess = this.checkMissionAccess(user, mission);
    if (!hasAccess) {
      logger.warn({ userId, missionId, userRole: user.role }, 'Tentative d\'accès non autorisé au chat de mission');
      throw new ForbiddenError('MISSION_ACCESS_DENIED', 'Vous n\'avez pas accès à cette mission');
    }

    // Récupérer les participants
    const participants = [
      {
        id: mission.client.id,
        name: mission.client.getFullName(),
        role: mission.client.role
      }
    ];

    if (mission.assistant) {
      participants.push({
        id: mission.assistant.id,
        name: mission.assistant.getFullName(),
        role: mission.assistant.role
      });
    }

    // Récupérer l'historique des messages (simulé pour l'instant)
    const messages: ChatMessage[] = [];

    logger.info({ userId, missionId }, 'Utilisateur a rejoint le chat de mission');

    return {
      mission,
      participants,
      messages
    };
  }

  /**
   * Envoyer un message dans le chat d'une mission
   */
  async sendMessage(userId: string, missionId: string, message: string): Promise<ChatMessage> {
    logger.info({ userId, missionId, messageLength: message.length }, 'Tentative d\'envoi de message');

    // Vérifier que la mission existe et que l'utilisateur a accès
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    const hasAccess = this.checkMissionAccess(user, mission);
    if (!hasAccess) {
      logger.warn({ userId, missionId }, 'Tentative d\'envoi de message non autorisé');
      throw new ForbiddenError('MISSION_ACCESS_DENIED', 'Vous n\'avez pas accès à cette mission');
    }

    // Vérifier que la mission est active
    if (mission.status === MissionStatus.CANCELLED) {
      throw new HttpError(400, 'MISSION_CANCELLED', 'Impossible d\'envoyer un message sur une mission annulée');
    }

    // Créer le message
    const chatMessage: ChatMessage = {
      id: generateId(),
      missionId,
      userId,
      userName: user.getFullName(),
      userRole: user.role,
      message,
      timestamp: now(),
      type: 'text'
    };

    // TODO: Sauvegarder le message en base de données
    // await this.chatMessageRepository.save(chatMessage);

    logger.info({ userId, missionId, messageId: chatMessage.id }, 'Message envoyé avec succès');

    return chatMessage;
  }

  /**
   * Mettre à jour le statut d'une mission
   */
  async updateMissionStatus(
    userId: string, 
    missionId: string, 
    status: MissionStatus, 
    comment?: string
  ): Promise<{ mission: Mission; statusHistory: MissionStatusHistory }> {
    logger.info({ userId, missionId, status }, 'Tentative de mise à jour du statut de mission');

    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur peut modifier le statut
    const canUpdateStatus = this.checkStatusUpdatePermission(user, mission, status);
    if (!canUpdateStatus) {
      logger.warn({ userId, missionId, status, userRole: user.role }, 'Tentative de mise à jour de statut non autorisée');
      throw new ForbiddenError('STATUS_UPDATE_DENIED', 'Vous n\'êtes pas autorisé à modifier ce statut');
    }

    // Vérifier la transition de statut
    const canTransition = this.canTransitionStatus(mission.status, status);
    if (!canTransition) {
      throw new HttpError(400, 'INVALID_STATUS_TRANSITION', 'Transition de statut invalide');
    }

    // Mettre à jour le statut de la mission
    mission.status = status;
    
    // Mettre à jour les timestamps selon le statut
    if (status === MissionStatus.ACCEPTED) {
      mission.acceptedAt = now();
    } else if (status === MissionStatus.IN_PROGRESS) {
      mission.startedAt = now();
    } else if (status === MissionStatus.COMPLETED) {
      mission.completedAt = now();
    } else if (status === MissionStatus.CANCELLED) {
      mission.cancelledAt = now();
    }

    await this.missionRepository.save(mission);

    // Créer l'entrée dans l'historique
    const statusHistory = new MissionStatusHistory();
    statusHistory.id = generateId();
    statusHistory.missionId = missionId;
    statusHistory.status = status;
    statusHistory.comment = comment;
    statusHistory.changedByUserId = userId;
    statusHistory.metadata = {
      reason: this.getStatusChangeReason(status),
      changedByRole: user.role
    };

    await this.missionStatusHistoryRepository.save(statusHistory);

    logger.info({ userId, missionId, status, statusHistoryId: statusHistory.id }, 'Statut de mission mis à jour');

    return { mission, statusHistory };
  }

  /**
   * Obtenir les messages d'une mission
   */
  async getMissionMessages(missionId: string, limit: number = 50): Promise<ChatMessage[]> {
    // TODO: Implémenter la récupération des messages depuis la base de données
    // Pour l'instant, retourner un tableau vide
    return [];
  }

  /**
   * Vérifier l'accès d'un utilisateur à une mission
   */
  private checkMissionAccess(user: User, mission: Mission): boolean {
    // Le client et l'assistant ont accès à leur mission
    return mission.client.id === user.id || 
           (mission.assistant && mission.assistant.id === user.id);
  }

  /**
   * Vérifier les permissions de mise à jour de statut
   */
  private checkStatusUpdatePermission(user: User, mission: Mission, newStatus: MissionStatus): boolean {
    // Le client peut annuler sa mission
    if (newStatus === MissionStatus.CANCELLED && mission.client.id === user.id) {
      return true;
    }

    // L'assistant peut accepter, démarrer, et terminer la mission
    if (mission.assistant && mission.assistant.id === user.id) {
      return [
        MissionStatus.ACCEPTED,
        MissionStatus.IN_PROGRESS,
        MissionStatus.COMPLETED
      ].includes(newStatus);
    }

    // Le client peut confirmer la completion
    if (newStatus === MissionStatus.COMPLETED && mission.client.id === user.id) {
      return mission.status === MissionStatus.IN_PROGRESS;
    }

    return false;
  }

  /**
   * Vérifier si une transition de statut est valide
   */
  private canTransitionStatus(currentStatus: MissionStatus, newStatus: MissionStatus): boolean {
    const validTransitions: Record<MissionStatus, MissionStatus[]> = {
      [MissionStatus.PENDING]: [MissionStatus.ACCEPTED, MissionStatus.CANCELLED],
      [MissionStatus.ACCEPTED]: [MissionStatus.IN_PROGRESS, MissionStatus.CANCELLED],
      [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.CANCELLED],
      [MissionStatus.COMPLETED]: [],
      [MissionStatus.CANCELLED]: [],
      [MissionStatus.DISPUTED]: [MissionStatus.COMPLETED, MissionStatus.CANCELLED]
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Obtenir la raison du changement de statut
   */
  private getStatusChangeReason(status: MissionStatus): string {
    const reasons: Record<MissionStatus, string> = {
      [MissionStatus.PENDING]: 'Mission créée',
      [MissionStatus.ACCEPTED]: 'Mission acceptée par l\'assistant',
      [MissionStatus.IN_PROGRESS]: 'Mission démarrée',
      [MissionStatus.COMPLETED]: 'Mission terminée',
      [MissionStatus.CANCELLED]: 'Mission annulée',
      [MissionStatus.DISPUTED]: 'Litige signalé'
    };

    return reasons[status] || 'Changement de statut';
  }

  /**
   * Obtenir les participants d'une mission
   */
  async getMissionParticipants(missionId: string): Promise<Array<{ id: string; name: string; role: UserRole }>> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    const participants = [
      {
        id: mission.client.id,
        name: mission.client.getFullName(),
        role: mission.client.role
      }
    ];

    if (mission.assistant) {
      participants.push({
        id: mission.assistant.id,
        name: mission.assistant.getFullName(),
        role: mission.assistant.role
      });
    }

    return participants;
  }
}

// Instance singleton
export const chatService = new ChatService(); 