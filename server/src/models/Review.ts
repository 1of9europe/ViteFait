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

@Entity('reviews')
@Index(['missionId', 'reviewerId'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', unsigned: true })
  rating!: number; // 1-5 étoiles

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Mission, mission => mission.reviews)
  @JoinColumn({ name: 'missionId' })
  mission!: Mission;

  @Column({ type: 'uuid' })
  missionId!: string;

  @ManyToOne(() => User, user => user.givenReviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer!: User;

  @Column({ type: 'uuid' })
  reviewerId!: string;

  @ManyToOne(() => User, user => user.receivedReviews)
  @JoinColumn({ name: 'reviewedId' })
  reviewed!: User;

  @Column({ type: 'uuid' })
  reviewedId!: string;

  // Méthodes
  isValidRating(): boolean {
    return this.rating >= 1 && this.rating <= 5;
  }

  getRatingText(): string {
    const ratings = {
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bon',
      5: 'Excellent'
    };
    return ratings[this.rating as keyof typeof ratings] || 'Non évalué';
  }
} 