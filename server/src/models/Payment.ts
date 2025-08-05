import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Mission } from './Mission';

export enum PaymentType {
  ESCROW = 'escrow',
  RELEASE = 'release',
  REFUND = 'refund',
  CASH_ADVANCE = 'cash_advance',
  COMMISSION = 'commission'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity('payments')
@Index(['stripePaymentIntentId'])
@Index(['missionId', 'type'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentType
  })
  type!: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeTransferId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeRefundId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Mission, mission => mission.payments)
  @JoinColumn({ name: 'missionId' })
  mission!: Mission;

  @Column({ type: 'uuid' })
  missionId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'payerId' })
  payer?: User;

  @Column({ type: 'uuid', nullable: true })
  payerId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'payeeId' })
  payee?: User;

  @Column({ type: 'uuid', nullable: true })
  payeeId?: string;

  // Méthodes
  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.status === PaymentStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  isEscrow(): boolean {
    return this.type === PaymentType.ESCROW;
  }

  isRelease(): boolean {
    return this.type === PaymentType.RELEASE;
  }

  isRefund(): boolean {
    return this.type === PaymentType.REFUND;
  }

  isCashAdvance(): boolean {
    return this.type === PaymentType.CASH_ADVANCE;
  }

  getAmountInCents(): number {
    return Math.round(this.amount * 100);
  }

  getFormattedAmount(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }
} 