import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Mission } from '../models/Mission';
import { MissionStatus, MissionPriority } from '../types/enums';

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
  priority?: MissionPriority;
  instructions?: string;
  requirements?: string;
  requiresCar?: boolean;
  requiresTools?: boolean;
  requiresInitialMeeting: boolean;
  meetingTimeSlot?: string;
  category?: string;
  clientId: string;
}

export class MissionService {
  private missionRepository: Repository<Mission>;

  constructor() {
    this.missionRepository = AppDataSource.getRepository(Mission);
  }

  async createMission(data: CreateMissionData): Promise<Mission> {
    const missionData = {
      ...data,
      meetingTimeSlot: data.requiresInitialMeeting && data.meetingTimeSlot ? new Date(data.meetingTimeSlot) : null,
      priority: data.priority || MissionPriority.MEDIUM,
      cashAdvance: data.cashAdvance || 0,
      requiresCar: data.requiresCar || false,
      requiresTools: data.requiresTools || false
    };

    const mission = this.missionRepository.create(missionData);
    return await this.missionRepository.save(mission);
  }

  async getMissionsWithInitialMeetings(): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { requiresInitialMeeting: true },
      order: { meetingTimeSlot: 'ASC' }
    });
  }

  async getMissionsByMeetingTimeSlot(date: Date): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { 
        requiresInitialMeeting: true,
        meetingTimeSlot: date
      }
    });
  }

  async getMissionById(id: string): Promise<Mission | null> {
    return await this.missionRepository.findOne({
      where: { id },
      relations: ['client', 'assistant', 'statusHistory', 'reviews']
    });
  }

  async updateMissionStatus(id: string, status: MissionStatus, comment?: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new Error('Mission not found');
    }

    mission.status = status;
    
    // Si un commentaire est fourni, on pourrait l'enregistrer dans l'historique
    if (comment) {
      // TODO: Implémenter l'historique des statuts avec commentaires
      console.log(`Status update comment: ${comment}`);
    }
    
    return await this.missionRepository.save(mission);
  }

  async getMissionsByClient(clientId: string): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' }
    });
  }

  async getMissionsByAssistant(assistantId: string): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { assistantId },
      order: { createdAt: 'DESC' }
    });
  }

  async getMissionsByStatus(status: MissionStatus): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { status },
      order: { createdAt: 'DESC' }
    });
  }

  async getMissionsNearLocation(lat: number, lng: number, radius: number = 5000): Promise<Mission[]> {
    return await this.missionRepository
      .createQueryBuilder('mission')
      .where(`
        ST_DWithin(
          ST_MakePoint(mission.pickupLongitude, mission.pickupLatitude)::geography,
          ST_MakePoint(:lng, :lat)::geography,
          :radius
        )
      `, { lat, lng, radius })
      .orderBy('mission.createdAt', 'DESC')
      .getMany();
  }
} 