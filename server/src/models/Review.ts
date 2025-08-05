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
import { User } from './User';
import { Mission } from './Mission';
import { ReviewMetadata, isValidReviewMetadata } from '../types/metadata';
import { ReviewStatus, isValidReviewStatus } from '../types/enums';
import { getReviewRatingText } from '../utils/i18n';

@Entity('reviews')
@Index(['missionId', 'reviewerId'], { unique: true })
@Index(['reviewerId', 'createdAt'])
@Index(['reviewedUserId', 'createdAt'])
@Index(['rating', 'createdAt'])
@Index(['status', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  missionId!: string;

  @Column({ type: 'uuid' })
  reviewerId!: string;

  @Column({ type: 'uuid' })
  reviewedUserId!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status!: ReviewStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: ReviewMetadata;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'missionId' })
  mission!: Mission;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewerId' })
  reviewer!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewedUserId' })
  reviewedUser!: User;

  /**
   * Vérifie si la note est valide (entre 1 et 5)
   */
  isValidRating(): boolean {
    return this.rating >= 1 && this.rating <= 5;
  }

  /**
   * Obtient le texte de la note traduit
   */
  getRatingText(locale: string = 'fr'): string {
    return getReviewRatingText(this.rating, locale as any);
  }

  /**
   * Vérifie si la review peut être modifiée
   */
  canBeModified(): boolean {
    return this.status === ReviewStatus.PENDING;
  }

  /**
   * Vérifie si la review peut être supprimée
   */
  canBeDeleted(): boolean {
    return this.status === ReviewStatus.PENDING;
  }

  /**
   * Vérifie si la review est approuvée
   */
  isApproved(): boolean {
    return this.status === ReviewStatus.APPROVED;
  }

  /**
   * Vérifie si la review est rejetée
   */
  isRejected(): boolean {
    return this.status === ReviewStatus.REJECTED;
  }

  /**
   * Vérifie si la review est en attente
   */
  isPending(): boolean {
    return this.status === ReviewStatus.PENDING;
  }

  /**
   * Obtient le montant de la commission pour cette review
   */
  getCommissionAmount(): number {
    // Logique de calcul de commission basée sur la note
    const baseCommission = 0.50; // 50 centimes de base
    const ratingBonus = this.rating * 0.10; // 10 centimes par étoile
    return baseCommission + ratingBonus;
  }

  /**
   * Valide les métadonnées
   */
  validateMetadata(): boolean {
    if (!this.metadata) return true;
    return isValidReviewMetadata(this.metadata);
  }

  /**
   * Obtient les tags de la review
   */
  getTags(): string[] {
    return this.metadata?.tags || [];
  }

  /**
   * Ajoute un tag à la review
   */
  addTag(tag: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    if (!this.metadata.tags) {
      this.metadata.tags = [];
    }
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  /**
   * Supprime un tag de la review
   */
  removeTag(tag: string): void {
    if (this.metadata?.tags) {
      this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
    }
  }

  /**
   * Obtient la qualité de communication
   */
  getCommunicationQuality(): number | null {
    return this.metadata?.communicationQuality || null;
  }

  /**
   * Obtient la ponctualité
   */
  getPunctuality(): number | null {
    return this.metadata?.punctuality || null;
  }

  /**
   * Obtient le temps de completion
   */
  getCompletionTime(): number | null {
    return this.metadata?.completionTime || null;
  }

  /**
   * Vérifie si l'utilisateur recommanderait le service
   */
  wouldRecommend(): boolean | null {
    return this.metadata?.wouldRecommend || null;
  }

  /**
   * Obtient les circonstances spéciales
   */
  getSpecialCircumstances(): string | null {
    return this.metadata?.specialCircumstances || null;
  }

  /**
   * Calcule le score global de la review
   */
  getOverallScore(): number {
    let score = this.rating;
    let factors = 1;

    // Ajouter la qualité de communication si disponible
    if (this.metadata?.communicationQuality) {
      score += this.metadata.communicationQuality;
      factors++;
    }

    // Ajouter la ponctualité si disponible
    if (this.metadata?.punctuality) {
      score += this.metadata.punctuality;
      factors++;
    }

    // Bonus pour les reviews avec commentaires
    if (this.comment && this.comment.trim().length > 0) {
      score += 0.5;
      factors++;
    }

    // Bonus pour les reviews avec tags
    if (this.metadata?.tags && this.metadata.tags.length > 0) {
      score += 0.25;
      factors++;
    }

    return Math.round((score / factors) * 100) / 100;
  }

  /**
   * Convertit l'entité en objet JSON
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      id: this.id,
      missionId: this.missionId,
      reviewerId: this.reviewerId,
      reviewedUserId: this.reviewedUserId,
      rating: this.rating,
      ratingText: this.getRatingText(),
      comment: this.comment,
      isPublic: this.isPublic,
      status: this.status,
      overallScore: this.getOverallScore(),
      tags: this.getTags(),
      communicationQuality: this.getCommunicationQuality(),
      punctuality: this.getPunctuality(),
      completionTime: this.getCompletionTime(),
      wouldRecommend: this.wouldRecommend(),
      specialCircumstances: this.getSpecialCircumstances(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Inclure les métadonnées si elles existent
    if (this.metadata) {
      json.metadata = this.metadata;
    }

    return json;
  }

  /**
   * Convertit l'entité en objet JSON public (pour les utilisateurs non-authentifiés)
   */
  toPublicJSON(): Record<string, any> {
    const json = this.toJSON();
    
    // Supprimer les informations sensibles
    delete json['reviewerId'];
    delete json['metadata'];
    
    return json;
  }
} 