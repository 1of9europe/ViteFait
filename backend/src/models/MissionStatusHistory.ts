import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Mission, MissionStatus } from './Mission';
import { User } from './User';

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
  createdAt!: Date;

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

  // Méthodes
  getStatusText(): string {
    const statusTexts = {
      [MissionStatus.PENDING]: 'En attente',
      [MissionStatus.ACCEPTED]: 'Acceptée',
      [MissionStatus.IN_PROGRESS]: 'En cours',
      [MissionStatus.COMPLETED]: 'Terminée',
      [MissionStatus.CANCELLED]: 'Annulée',
      [MissionStatus.DISPUTED]: 'En litige'
    };
    return statusTexts[this.status] || 'Statut inconnu';
  }
} 