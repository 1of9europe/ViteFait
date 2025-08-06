import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { MissionStatusHistory } from './MissionStatusHistory';
import { Review } from './Review';
import { Payment } from './Payment';
import { MissionStatus, MissionPriority } from '../types/enums';

@Entity('missions')
@Index(['latitude', 'longitude'])
@Index(['status', 'createdAt'])
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  pickupLatitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  pickupLongitude!: number;

  @Column({ type: 'varchar', length: 255 })
  pickupAddress!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  dropLatitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  dropLongitude?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dropAddress?: string;

  @Column({ type: 'timestamp' })
  timeWindowStart!: Date;

  @Column({ type: 'timestamp' })
  timeWindowEnd!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceEstimate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cashAdvance: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finalPrice: number = 0;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.PENDING
  })
  status: MissionStatus = MissionStatus.PENDING;

  @Column({
    type: 'enum',
    enum: MissionPriority,
    default: MissionPriority.MEDIUM
  })
  priority: MissionPriority = MissionPriority.MEDIUM;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @Column({ type: 'boolean', default: false })
  requiresCar: boolean = false;

  @Column({ type: 'boolean', default: false })
  requiresTools: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionAmount: number = 0;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId?: string;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  // Relations
  @ManyToOne(() => User, user => user.clientMissions)
  @JoinColumn({ name: 'clientId' })
  client!: User;

  @Column({ type: 'uuid' })
  clientId!: string;

  @ManyToOne(() => User, user => user.assistantMissions, { nullable: true })
  @JoinColumn({ name: 'assistantId' })
  assistant?: User;

  @Column({ type: 'uuid', nullable: true })
  assistantId?: string;

  @OneToMany(() => MissionStatusHistory, history => history.mission)
  statusHistory: MissionStatusHistory[] = [];

  @OneToMany(() => Review, review => review.mission)
  reviews: Review[] = [];

  @OneToMany(() => Payment, payment => payment.mission)
  payments: Payment[] = [];

  constructor() {
    // Initialisation des propriétés avec des valeurs par défaut
    this.cashAdvance = 0;
    this.finalPrice = 0;
    this.status = MissionStatus.PENDING;
    this.priority = MissionPriority.MEDIUM;
    this.requiresCar = false;
    this.requiresTools = false;
    this.commissionAmount = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.statusHistory = [];
    this.reviews = [];
    this.payments = [];
  }

  // Méthodes
  isPending(): boolean {
    return this.status === MissionStatus.PENDING;
  }

  isAccepted(): boolean {
    return this.status === MissionStatus.ACCEPTED;
  }

  isInProgress(): boolean {
    return this.status === MissionStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === MissionStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === MissionStatus.CANCELLED;
  }

  canBeAccepted(): boolean {
    return this.status === MissionStatus.PENDING;
  }

  canBeStarted(): boolean {
    return this.status === MissionStatus.ACCEPTED;
  }

  canBeCompleted(): boolean {
    return this.status === MissionStatus.IN_PROGRESS;
  }

  canBeCancelled(): boolean {
    return [MissionStatus.PENDING, MissionStatus.ACCEPTED, MissionStatus.IN_PROGRESS].includes(this.status);
  }

  getTotalAmount(): number {
    return this.finalPrice + this.cashAdvance;
  }

  getAssistantEarnings(): number {
    return this.finalPrice - this.commissionAmount;
  }

  getPickupLocation(): { latitude: number; longitude: number } {
    return {
      latitude: this.pickupLatitude,
      longitude: this.pickupLongitude
    };
  }

  getDropLocation(): { latitude: number; longitude: number } | null {
    if (this.dropLatitude && this.dropLongitude) {
      return {
        latitude: this.dropLatitude,
        longitude: this.dropLongitude
      };
    }
    return null;
  }
} 