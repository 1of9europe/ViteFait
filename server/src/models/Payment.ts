import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Mission } from './Mission';
import { User } from './User';
import { PaymentMetadata, isValidPaymentMetadata } from '../types/metadata';
import { PaymentType, PaymentStatus, PaymentCurrency, isValidPaymentType, isValidPaymentStatus, isValidPaymentCurrency } from '../types/enums';
import { formatAmount } from '../utils/i18n';

@Entity('payments')
@Index(['missionId', 'status'])
@Index(['payerId', 'createdAt'])
@Index(['payeeId', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['type', 'status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  missionId!: string;

  @Column({ type: 'uuid' })
  payerId!: string;

  @Column({ type: 'uuid' })
  payeeId!: string;

  @Column({ type: 'bigint' })
  amountCents!: number; // Montant en centimes

  @Column({
    type: 'enum',
    enum: PaymentCurrency,
    default: PaymentCurrency.EUR,
  })
  currency!: PaymentCurrency;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type!: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: PaymentMetadata;

  // Identifiants Stripe
  @Column({ type: 'varchar', nullable: true })
  stripePaymentIntentId?: string;

  @Column({ type: 'varchar', nullable: true })
  stripeTransferId?: string;

  @Column({ type: 'varchar', nullable: true })
  stripeRefundId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'missionId' })
  mission!: Mission;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payerId' })
  payer!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payeeId' })
  payee!: User;

  /**
   * Obtient le montant en euros
   */
  getAmount(): number {
    return this.amountCents / 100;
  }

  /**
   * Définit le montant en euros
   */
  setAmount(amount: number): void {
    this.amountCents = Math.round(amount * 100);
  }

  /**
   * Vérifie si le paiement a un statut spécifique
   */
  hasStatus(status: PaymentStatus): boolean {
    return this.status === status;
  }

  /**
   * Vérifie si le paiement est d'un type spécifique
   */
  hasType(type: PaymentType): boolean {
    return this.type === type;
  }

  /**
   * Vérifie si le paiement est en attente
   */
  isPending(): boolean {
    return this.hasStatus(PaymentStatus.PENDING);
  }

  /**
   * Vérifie si le paiement est en cours de traitement
   */
  isProcessing(): boolean {
    return this.hasStatus(PaymentStatus.PROCESSING);
  }

  /**
   * Vérifie si le paiement est terminé
   */
  isCompleted(): boolean {
    return this.hasStatus(PaymentStatus.COMPLETED);
  }

  /**
   * Vérifie si le paiement a échoué
   */
  isFailed(): boolean {
    return this.hasStatus(PaymentStatus.FAILED);
  }

  /**
   * Vérifie si le paiement est annulé
   */
  isCancelled(): boolean {
    return this.hasStatus(PaymentStatus.CANCELLED);
  }

  /**
   * Vérifie si le paiement est remboursé
   */
  isRefunded(): boolean {
    return this.hasStatus(PaymentStatus.REFUNDED);
  }

  /**
   * Vérifie si le paiement est un escrow
   */
  isEscrow(): boolean {
    return this.hasType(PaymentType.ESCROW);
  }

  /**
   * Vérifie si le paiement est une libération
   */
  isRelease(): boolean {
    return this.hasType(PaymentType.RELEASE);
  }

  /**
   * Vérifie si le paiement est un remboursement
   */
  isRefund(): boolean {
    return this.hasType(PaymentType.REFUND);
  }

  /**
   * Vérifie si le paiement est une commission
   */
  isCommission(): boolean {
    return this.hasType(PaymentType.COMMISSION);
  }

  /**
   * Obtient le montant formaté selon la locale
   */
  getFormattedAmount(locale: string = 'fr'): string {
    return formatAmount(this.amountCents, this.currency, locale as any);
  }

  /**
   * Obtient les frais de traitement
   */
  getProcessingFee(): number {
    return this.metadata?.processingFee || 0;
  }

  /**
   * Obtient les frais de plateforme
   */
  getPlatformFee(): number {
    return this.metadata?.platformFee || 0;
  }

  /**
   * Obtient le montant des taxes
   */
  getTaxAmount(): number {
    return this.metadata?.taxAmount || 0;
  }

  /**
   * Calcule le montant net (après déduction des frais)
   */
  getNetAmount(): number {
    return this.amountCents - this.getProcessingFee() - this.getPlatformFee() - this.getTaxAmount();
  }

  /**
   * Obtient le montant net formaté
   */
  getFormattedNetAmount(locale: string = 'fr'): string {
    return formatAmount(this.getNetAmount(), this.currency, locale as any);
  }

  /**
   * Obtient la raison du remboursement
   */
  getRefundReason(): string | null {
    return this.metadata?.refundReason || null;
  }

  /**
   * Obtient la raison de libération de l'escrow
   */
  getEscrowReleaseReason(): string | null {
    return this.metadata?.escrowReleaseReason || null;
  }

  /**
   * Obtient le temps de traitement
   */
  getProcessingTime(): number | null {
    return this.metadata?.processingTime || null;
  }

  /**
   * Obtient l'ID du paiement lié (pour les remboursements)
   */
  getRelatedPaymentId(): string | null {
    return this.metadata?.relatedPaymentId || null;
  }

  /**
   * Valide les métadonnées
   */
  validateMetadata(): boolean {
    if (!this.metadata) return true;
    return isValidPaymentMetadata(this.metadata);
  }

  /**
   * Vérifie si le paiement peut être annulé
   */
  canBeCancelled(): boolean {
    return [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this.status);
  }

  /**
   * Vérifie si le paiement peut être remboursé
   */
  canBeRefunded(): boolean {
    return this.status === PaymentStatus.COMPLETED && this.type !== PaymentType.REFUND;
  }

  /**
   * Calcule la durée depuis la création
   */
  getDurationSinceCreation(): number {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60)); // en minutes
  }

  /**
   * Obtient un résumé du paiement
   */
  getPaymentSummary(): string {
    const amount = this.getFormattedAmount();
    const status = this.status;
    const type = this.type;
    
    return `${type} de ${amount} - ${status}`;
  }

  /**
   * Convertit l'entité en objet JSON
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      id: this.id,
      missionId: this.missionId,
      payerId: this.payerId,
      payeeId: this.payeeId,
      amountCents: this.amountCents,
      amount: this.getAmount(),
      formattedAmount: this.getFormattedAmount(),
      currency: this.currency,
      type: this.type,
      status: this.status,
      netAmount: this.getNetAmount(),
      formattedNetAmount: this.getFormattedNetAmount(),
      processingFee: this.getProcessingFee(),
      platformFee: this.getPlatformFee(),
      taxAmount: this.getTaxAmount(),
      refundReason: this.getRefundReason(),
      escrowReleaseReason: this.getEscrowReleaseReason(),
      processingTime: this.getProcessingTime(),
      relatedPaymentId: this.getRelatedPaymentId(),
      durationSinceCreation: this.getDurationSinceCreation(),
      paymentSummary: this.getPaymentSummary(),
      stripePaymentIntentId: this.stripePaymentIntentId,
      stripeTransferId: this.stripeTransferId,
      stripeRefundId: this.stripeRefundId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Inclure les métadonnées si elles existent
    if (this.metadata) {
      json['metadata'] = this.metadata;
    }

    return json;
  }

  /**
   * Convertit l'entité en objet JSON public
   */
  toPublicJSON(): Record<string, any> {
    const json = this.toJSON();
    
    // Supprimer les informations sensibles
    delete json['payerId'];
    delete json['payeeId'];
    delete json['stripePaymentIntentId'];
    delete json['stripeTransferId'];
    delete json['stripeRefundId'];
    delete json['metadata'];
    
    return json;
  }
} 