import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Mission } from './Mission';
import { User } from './User';
import { MissionStatus } from '../types/enums';

@Entity('mission_status_history')
export class MissionStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: MissionStatus
  })
  status!: MissionStatus;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date = new Date();

  // Relations
  @ManyToOne(() => Mission, mission => mission.statusHistory)
  @JoinColumn({ name: 'missionId' })
  mission!: Mission;

  @Column({ type: 'uuid' })
  missionId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changedByUserId' })
  changedByUser?: User;

  @Column({ type: 'uuid', nullable: true })
  changedByUserId?: string;

  constructor() {
    // Initialisation des propriétés avec des valeurs par défaut
    this.createdAt = new Date();
  }

  // Méthodes
  getStatusText(): string {
    const statusTexts = {
      [MissionStatus.PENDING]: 'En attente',
      [MissionStatus.ACCEPTED]: 'Acceptée',
      [MissionStatus.ASSIGNED]: 'Assignée',
      [MissionStatus.IN_PROGRESS]: 'En cours',
      [MissionStatus.COMPLETED]: 'Terminée',
      [MissionStatus.CANCELLED]: 'Annulée',
      [MissionStatus.EXPIRED]: 'Expirée',
      [MissionStatus.DISPUTED]: 'En litige'
    };
    return statusTexts[this.status] || 'Statut inconnu';
  }

  toJSON(): Partial<MissionStatusHistory> {
    const result: Partial<MissionStatusHistory> = {
      id: this.id,
      status: this.status,
      createdAt: this.createdAt
    };
    
    if (this.comment) {
      result.comment = this.comment;
    }
    
    return result;
  }
} 