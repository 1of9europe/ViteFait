import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Mission } from './Mission';
import { User } from './User';
import { MissionStatusMetadata, isValidMissionStatusMetadata } from '../types/metadata';
import { MissionStatus, isValidMissionStatus } from '../types/enums';
import { getMissionStatusText } from '../utils/i18n';

@Entity('mission_status_history')
@Index(['missionId', 'createdAt'])
@Index(['missionId', 'status'])
@Index(['changedByUserId', 'createdAt'])
export class MissionStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  missionId!: string;

  @Column({
    type: 'enum',
    enum: MissionStatus,
  })
  status!: MissionStatus;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'uuid', nullable: true })
  changedByUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: MissionStatusMetadata;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'missionId' })
  mission!: Mission;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changedByUserId' })
  changedByUser?: User;

  /**
   * Obtient le texte du statut traduit
   */
  getStatusText(locale: string = 'fr'): string {
    return getMissionStatusText(this.status, locale as any);
  }

  /**
   * Vérifie si le statut est final
   */
  isFinalStatus(): boolean {
    return [MissionStatus.COMPLETED, MissionStatus.CANCELLED].includes(this.status);
  }

  /**
   * Vérifie si le statut est actif
   */
  isActiveStatus(): boolean {
    return [MissionStatus.PENDING, MissionStatus.ACCEPTED, MissionStatus.IN_PROGRESS].includes(this.status);
  }

  /**
   * Obtient la raison du changement de statut
   */
  getReason(): string | null {
    return this.metadata?.reason || null;
  }

  /**
   * Obtient la localisation du changement de statut
   */
  getLocation(): { latitude: number; longitude: number; address?: string } | null {
    return this.metadata?.location || null;
  }

  /**
   * Obtient le rôle de l'utilisateur qui a changé le statut
   */
  getChangedByRole(): string | null {
    return this.metadata?.changedByRole || null;
  }

  /**
   * Obtient le temps de completion estimé
   */
  getEstimatedCompletionTime(): number | null {
    return this.metadata?.estimatedCompletionTime || null;
  }

  /**
   * Obtient le temps de completion réel
   */
  getActualCompletionTime(): number | null {
    return this.metadata?.actualCompletionTime || null;
  }

  /**
   * Obtient la raison d'annulation
   */
  getCancellationReason(): string | null {
    return this.metadata?.cancellationReason || null;
  }

  /**
   * Obtient la raison de litige
   */
  getDisputeReason(): string | null {
    return this.metadata?.disputeReason || null;
  }

  /**
   * Valide les métadonnées
   */
  validateMetadata(): boolean {
    if (!this.metadata) return true;
    return isValidMissionStatusMetadata(this.metadata);
  }

  /**
   * Calcule la durée depuis le changement de statut
   */
  getDurationSinceChange(): number {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60)); // en minutes
  }

  /**
   * Vérifie si le changement a été fait récemment (dans les dernières 5 minutes)
   */
  isRecentChange(): boolean {
    return this.getDurationSinceChange() < 5;
  }

  /**
   * Obtient un résumé du changement de statut
   */
  getChangeSummary(): string {
    const statusText = this.getStatusText();
    const duration = this.getDurationSinceChange();
    
    if (duration < 1) {
      return `Statut changé vers "${statusText}" à l'instant`;
    } else if (duration < 60) {
      return `Statut changé vers "${statusText}" il y a ${duration} minute(s)`;
    } else {
      const hours = Math.floor(duration / 60);
      return `Statut changé vers "${statusText}" il y a ${hours} heure(s)`;
    }
  }

  /**
   * Convertit l'entité en objet JSON
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      id: this.id,
      missionId: this.missionId,
      status: this.status,
      statusText: this.getStatusText(),
      comment: this.comment,
      changedByUserId: this.changedByUserId,
      isFinalStatus: this.isFinalStatus(),
      isActiveStatus: this.isActiveStatus(),
      reason: this.getReason(),
      location: this.getLocation(),
      changedByRole: this.getChangedByRole(),
      estimatedCompletionTime: this.getEstimatedCompletionTime(),
      actualCompletionTime: this.getActualCompletionTime(),
      cancellationReason: this.getCancellationReason(),
      disputeReason: this.getDisputeReason(),
      durationSinceChange: this.getDurationSinceChange(),
      isRecentChange: this.isRecentChange(),
      changeSummary: this.getChangeSummary(),
      createdAt: this.createdAt,
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
    delete json['changedByUserId'];
    delete json['metadata'];
    
    return json;
  }
} 