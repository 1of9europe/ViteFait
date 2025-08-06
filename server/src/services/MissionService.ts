import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Mission, MissionStatus, MissionPriority } from '../models/Mission';
import { User, UserRole } from '../models/User';
import { MissionStatusHistory } from '../models/MissionStatusHistory';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../middleware/errorHandler';

export interface CreateMissionData {
  title: string;
  description: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropLatitude?: number;
  dropLongitude?: number;
  dropAddress?: string;
  timeWindowStart: Date;
  timeWindowEnd: Date;
  priceEstimate: number;
  cashAdvance?: number;
  instructions?: string;
  requirements?: string;
  requiresCar?: boolean;
  requiresTools?: boolean;
  category?: string;
  priority?: MissionPriority;
}

export interface UpdateMissionData {
  title?: string;
  description?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupAddress?: string;
  dropLatitude?: number;
  dropLongitude?: number;
  dropAddress?: string;
  timeWindowStart?: Date;
  timeWindowEnd?: Date;
  priceEstimate?: number;
  cashAdvance?: number;
  instructions?: string;
  requirements?: string;
  requiresCar?: boolean;
  requiresTools?: boolean;
  category?: string;
  priority?: MissionPriority;
}

export interface MissionFilters {
  status?: MissionStatus;
  priority?: MissionPriority;
  category?: string;
  requiresCar?: boolean;
  requiresTools?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // en mètres
  limit?: number;
  offset?: number;
}

export class MissionService {
  private missionRepository: Repository<Mission>;
  private userRepository: Repository<User>;
  private missionStatusHistoryRepository: Repository<MissionStatusHistory>;

  constructor() {
    this.missionRepository = AppDataSource.getRepository(Mission);
    this.userRepository = AppDataSource.getRepository(User);
    this.missionStatusHistoryRepository = AppDataSource.getRepository(MissionStatusHistory);
  }

  /**
   * Créer une nouvelle mission
   */
  async createMission(clientId: string, data: CreateMissionData): Promise<Mission> {
    // Vérifier que l'utilisateur existe et est un client
    const client = await this.userRepository.findOne({
      where: { id: clientId }
    });

    if (!client) {
      throw new NotFoundError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    if (client.role !== UserRole.CLIENT) {
      throw new ForbiddenError('INVALID_ROLE', 'Seuls les clients peuvent créer des missions');
    }

    // Créer la mission
    const mission = this.missionRepository.create({
      ...data,
      clientId,
      status: MissionStatus.PENDING,
      priority: data.priority || MissionPriority.MEDIUM,
      cashAdvance: data.cashAdvance || 0,
      finalPrice: data.priceEstimate,
      requiresCar: data.requiresCar || false,
      requiresTools: data.requiresTools || false
    });

    const savedMission = await this.missionRepository.save(mission);

    // Créer l'historique du statut initial
    await this.createStatusHistory(savedMission.id, clientId, MissionStatus.PENDING, 'Mission créée');

    return savedMission;
  }

  /**
   * Assigner un assistant à une mission
   */
  async assignMission(missionId: string, assistantId: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    if (mission.status !== MissionStatus.PENDING) {
      throw new BadRequestError('INVALID_STATUS', 'La mission doit être en attente pour être assignée');
    }

    if (mission.assistantId) {
      throw new ConflictError('MISSION_ALREADY_ASSIGNED', 'La mission est déjà assignée');
    }

    // Vérifier que l'assistant existe et est bien un assistant
    const assistant = await this.userRepository.findOne({
      where: { id: assistantId }
    });

    if (!assistant) {
      throw new NotFoundError('ASSISTANT_NOT_FOUND', 'Assistant non trouvé');
    }

    if (assistant.role !== UserRole.ASSISTANT) {
      throw new ForbiddenError('INVALID_ROLE', 'L\'utilisateur doit être un assistant');
    }

    // Assigner la mission
    mission.assistantId = assistantId;
    mission.status = MissionStatus.ACCEPTED;
    mission.acceptedAt = new Date();

    const updatedMission = await this.missionRepository.save(mission);

    // Créer l'historique du statut
    await this.createStatusHistory(missionId, assistantId, MissionStatus.ACCEPTED, 'Mission acceptée');

    return updatedMission;
  }

  /**
   * Démarrer une mission
   */
  async startMission(missionId: string, userId: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    if (mission.status !== MissionStatus.ACCEPTED) {
      throw new BadRequestError('INVALID_STATUS', 'La mission doit être acceptée pour être démarrée');
    }

    if (mission.assistantId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Seul l\'assistant assigné peut démarrer la mission');
    }

    mission.status = MissionStatus.IN_PROGRESS;
    mission.startedAt = new Date();

    const updatedMission = await this.missionRepository.save(mission);

    // Créer l'historique du statut
    await this.createStatusHistory(missionId, userId, MissionStatus.IN_PROGRESS, 'Mission démarrée');

    return updatedMission;
  }

  /**
   * Terminer une mission
   */
  async completeMission(missionId: string, userId: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['assistant', 'client']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    if (mission.status !== MissionStatus.IN_PROGRESS) {
      throw new BadRequestError('INVALID_STATUS', 'La mission doit être en cours pour être terminée');
    }

    // Seul l'assistant assigné ou le client peut terminer la mission
    if (mission.assistantId !== userId && mission.clientId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à terminer cette mission');
    }

    mission.status = MissionStatus.COMPLETED;
    mission.completedAt = new Date();

    const updatedMission = await this.missionRepository.save(mission);

    // Créer l'historique du statut
    const comment = mission.assistantId === userId ? 'Mission terminée par l\'assistant' : 'Mission confirmée terminée par le client';
    await this.createStatusHistory(missionId, userId, MissionStatus.COMPLETED, comment);

    return updatedMission;
  }

  /**
   * Annuler une mission
   */
  async cancelMission(missionId: string, userId: string, reason: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Seul le client ou l'assistant assigné peut annuler
    if (mission.clientId !== userId && mission.assistantId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à annuler cette mission');
    }

    if (mission.status === MissionStatus.COMPLETED) {
      throw new BadRequestError('INVALID_STATUS', 'Impossible d\'annuler une mission terminée');
    }

    mission.status = MissionStatus.CANCELLED;
    mission.cancelledAt = new Date();
    mission.cancellationReason = reason;

    const updatedMission = await this.missionRepository.save(mission);

    // Créer l'historique du statut
    await this.createStatusHistory(missionId, userId, MissionStatus.CANCELLED, `Mission annulée: ${reason}`);

    return updatedMission;
  }

  /**
   * Obtenir une mission par ID
   */
  async getMissionById(missionId: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant', 'statusHistory', 'reviews', 'payments']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    return mission;
  }

  /**
   * Lister les missions avec filtres
   */
  async getMissions(filters: MissionFilters = {}): Promise<{ missions: Mission[]; total: number }> {
    const queryBuilder = this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.client', 'client')
      .leftJoinAndSelect('mission.assistant', 'assistant');

    // Appliquer les filtres
    if (filters.status) {
      queryBuilder.andWhere('mission.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('mission.priority = :priority', { priority: filters.priority });
    }

    if (filters.category) {
      queryBuilder.andWhere('mission.category = :category', { category: filters.category });
    }

    if (filters.requiresCar !== undefined) {
      queryBuilder.andWhere('mission.requiresCar = :requiresCar', { requiresCar: filters.requiresCar });
    }

    if (filters.requiresTools !== undefined) {
      queryBuilder.andWhere('mission.requiresTools = :requiresTools', { requiresTools: filters.requiresTools });
    }

    // Filtre géographique
    if (filters.latitude && filters.longitude && filters.radius) {
      const radiusInDegrees = filters.radius / 111000; // Approximation: 1 degré ≈ 111km
      queryBuilder.andWhere(
        `ST_DWithin(
          ST_MakePoint(mission.pickupLongitude, mission.pickupLatitude)::geography,
          ST_MakePoint(:longitude, :latitude)::geography,
          :radius
        )`,
        {
          latitude: filters.latitude,
          longitude: filters.longitude,
          radius: filters.radius
        }
      );
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    queryBuilder
      .orderBy('mission.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    const [missions, total] = await queryBuilder.getManyAndCount();

    return { missions, total };
  }

  /**
   * Obtenir les missions d'un utilisateur
   */
  async getUserMissions(userId: string, role: UserRole): Promise<Mission[]> {
    const queryBuilder = this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.client', 'client')
      .leftJoinAndSelect('mission.assistant', 'assistant')
      .orderBy('mission.createdAt', 'DESC');

    if (role === UserRole.CLIENT) {
      queryBuilder.where('mission.clientId = :userId', { userId });
    } else if (role === UserRole.ASSISTANT) {
      queryBuilder.where('mission.assistantId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Mettre à jour une mission
   */
  async updateMission(missionId: string, userId: string, data: UpdateMissionData): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['client']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Seul le client créateur peut modifier la mission
    if (mission.clientId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à modifier cette mission');
    }

    // Ne peut modifier que si la mission est en attente
    if (mission.status !== MissionStatus.PENDING) {
      throw new BadRequestError('INVALID_STATUS', 'Impossible de modifier une mission déjà assignée');
    }

    // Mettre à jour les champs
    Object.assign(mission, data);

    const updatedMission = await this.missionRepository.save(mission);

    // Créer l'historique du statut
    await this.createStatusHistory(missionId, userId, mission.status, 'Mission modifiée');

    return updatedMission;
  }

  /**
   * Supprimer une mission
   */
  async deleteMission(missionId: string, userId: string): Promise<void> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId }
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Seul le client créateur peut supprimer la mission
    if (mission.clientId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à supprimer cette mission');
    }

    // Ne peut supprimer que si la mission est en attente
    if (mission.status !== MissionStatus.PENDING) {
      throw new BadRequestError('INVALID_STATUS', 'Impossible de supprimer une mission déjà assignée');
    }

    await this.missionRepository.remove(mission);
  }

  /**
   * Créer un historique de statut
   */
  private async createStatusHistory(
    missionId: string,
    changedByUserId: string,
    status: MissionStatus,
    comment: string
  ): Promise<MissionStatusHistory> {
    const statusHistory = this.missionStatusHistoryRepository.create({
      missionId,
      status,
      comment,
      changedByUserId
    });

    return this.missionStatusHistoryRepository.save(statusHistory);
  }
}

export const missionService = new MissionService(); 