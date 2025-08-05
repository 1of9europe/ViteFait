import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { UserMetadata, isValidUserMetadata } from '../types/metadata';
import { UserRole, UserStatus, isValidUserRole, isValidUserStatus } from '../types/enums';
import { config } from '../config/config';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role', 'status'])
@Index(['averageRating', 'reviewCount'])
@Index(['location'], { spatial: true }) // Index spatial pour PostGIS
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  hashedPassword!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  // Géolocalisation avec PostGIS
  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location?: any; // Point(latitude, longitude)

  // Rating en centimes (ex: 450 = 4.50 étoiles)
  @Column({ type: 'int', default: 0 })
  averageRatingCents!: number;

  @Column({ type: 'int', default: 0 })
  reviewCount!: number;

  // Identifiants Stripe
  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeConnectAccountId?: string;

  // Token FCM pour les notifications push
  @Column({ type: 'text', nullable: true })
  fcmToken?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: UserMetadata;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Flag interne pour éviter le double hachage
  private _passwordChanged = false;

  /**
   * Définit le mot de passe et marque qu'il a changé
   */
  setPassword(password: string): void {
    this.hashedPassword = bcrypt.hashSync(password, 12);
    this._passwordChanged = true;
  }

  /**
   * Compare le mot de passe avec le hash stocké
   */
  comparePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.hashedPassword);
  }

  /**
   * Obtient le nom complet de l'utilisateur
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Obtient la note moyenne en étoiles
   */
  getAverageRating(): number {
    return this.averageRatingCents / 100;
  }

  /**
   * Définit la note moyenne en étoiles
   */
  setAverageRating(rating: number): void {
    this.averageRatingCents = Math.round(rating * 100);
  }

  /**
   * Met à jour la note moyenne avec une nouvelle review
   */
  updateAverageRating(newRating: number): void {
    const totalRating = (this.averageRatingCents * this.reviewCount) + Math.round(newRating * 100);
    this.reviewCount++;
    this.averageRatingCents = Math.round(totalRating / this.reviewCount);
  }

  /**
   * Vérifie si l'utilisateur est actif
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * Vérifie si l'utilisateur est un client
   */
  isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  /**
   * Vérifie si l'utilisateur est un assistant
   */
  isAssistant(): boolean {
    return this.role === UserRole.ASSISTANT;
  }

  /**
   * Obtient la latitude depuis la géométrie PostGIS
   */
  getLatitude(): number | null {
    if (!this.location) return null;
    return this.location.coordinates?.[1] || null;
  }

  /**
   * Obtient la longitude depuis la géométrie PostGIS
   */
  getLongitude(): number | null {
    if (!this.location) return null;
    return this.location.coordinates?.[0] || null;
  }

  /**
   * Définit la localisation avec latitude et longitude
   */
  setLocation(latitude: number, longitude: number): void {
    this.location = {
      type: 'Point',
      coordinates: [longitude, latitude], // PostGIS utilise [lng, lat]
    };
  }

  /**
   * Calcule la distance vers un autre point (en mètres)
   */
  getDistanceTo(lat: number, lng: number): number | null {
    if (!this.location) return null;
    
    const userLat = this.getLatitude();
    const userLng = this.getLongitude();
    
    if (!userLat || !userLng) return null;

    // Formule de Haversine
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = userLat * Math.PI / 180;
    const φ2 = lat * Math.PI / 180;
    const Δφ = (lat - userLat) * Math.PI / 180;
    const Δλ = (lng - userLng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Obtient les langues préférées
   */
  getPreferredLanguages(): string[] {
    return this.metadata?.preferredLanguages || [];
  }

  /**
   * Obtient le fuseau horaire
   */
  getTimezone(): string | null {
    return this.metadata?.timezone || null;
  }

  /**
   * Obtient les préférences de notification
   */
  getNotificationPreferences(): { email?: boolean; push?: boolean; sms?: boolean } {
    return this.metadata?.notificationPreferences || {};
  }

  /**
   * Vérifie si l'utilisateur est vérifié
   */
  isVerified(): boolean {
    return this.metadata?.identityVerified || false;
  }

  /**
   * Obtient les types de mission préférés
   */
  getPreferredMissionTypes(): string[] {
    return this.metadata?.preferredMissionTypes || [];
  }

  /**
   * Obtient les heures de travail préférées
   */
  getPreferredWorkingHours(): { start: string; end: string; days: number[] } | null {
    return this.metadata?.preferredWorkingHours || null;
  }

  /**
   * Obtient le temps de réponse moyen
   */
  getAverageResponseTime(): number | null {
    return this.metadata?.averageResponseTime || null;
  }

  /**
   * Obtient le taux de completion
   */
  getCompletionRate(): number | null {
    return this.metadata?.completionRate || null;
  }

  /**
   * Obtient le taux d'annulation
   */
  getCancellationRate(): number | null {
    return this.metadata?.cancellationRate || null;
  }

  /**
   * Obtient la méthode de paiement préférée
   */
  getPreferredPaymentMethod(): string | null {
    return this.metadata?.preferredPaymentMethod || null;
  }

  /**
   * Valide les métadonnées
   */
  validateMetadata(): boolean {
    if (!this.metadata) return true;
    return isValidUserMetadata(this.metadata);
  }

  /**
   * Vérifie si l'utilisateur peut accepter des missions
   */
  canAcceptMissions(): boolean {
    return this.isActive() && this.isAssistant();
  }

  /**
   * Vérifie si l'utilisateur peut publier des missions
   */
  canPublishMissions(): boolean {
    return this.isActive() && this.isClient();
  }

  /**
   * Obtient un résumé de l'utilisateur
   */
  getSummary(): string {
    const role = this.role === UserRole.CLIENT ? 'Client' : 'Assistant';
    const rating = this.getAverageRating().toFixed(1);
    return `${this.getFullName()} (${role}) - ${rating}★ (${this.reviewCount} avis)`;
  }

  /**
   * Convertit l'entité en objet JSON
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      role: this.role,
      status: this.status,
      phoneNumber: this.phoneNumber,
      avatar: this.avatar,
      latitude: this.getLatitude(),
      longitude: this.getLongitude(),
      averageRating: this.getAverageRating(),
      reviewCount: this.reviewCount,
      isActive: this.isActive(),
      isClient: this.isClient(),
      isAssistant: this.isAssistant(),
      isVerified: this.isVerified(),
      preferredLanguages: this.getPreferredLanguages(),
      timezone: this.getTimezone(),
      notificationPreferences: this.getNotificationPreferences(),
      preferredMissionTypes: this.getPreferredMissionTypes(),
      preferredWorkingHours: this.getPreferredWorkingHours(),
      averageResponseTime: this.getAverageResponseTime(),
      completionRate: this.getCompletionRate(),
      cancellationRate: this.getCancellationRate(),
      preferredPaymentMethod: this.getPreferredPaymentMethod(),
      canAcceptMissions: this.canAcceptMissions(),
      canPublishMissions: this.canPublishMissions(),
      summary: this.getSummary(),
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
   * Convertit l'entité en objet JSON public (pour les utilisateurs non-authentifiés)
   */
  toPublicJSON(): Record<string, any> {
    const json = this.toJSON();
    
    // Supprimer les informations sensibles
    delete json['email'];
    delete json['phoneNumber'];
    delete json['stripeCustomerId'];
    delete json['stripeConnectAccountId'];
    delete json['fcmToken'];
    delete json['metadata'];
    delete json['notificationPreferences'];
    delete json['preferredPaymentMethod'];
    
    return json;
  }

  /**
   * Hook avant insertion
   */
  @BeforeInsert()
  beforeInsert(): void {
    if (this._passwordChanged) {
      this._passwordChanged = false;
    }
  }

  /**
   * Hook avant mise à jour
   */
  @BeforeUpdate()
  beforeUpdate(): void {
    if (this._passwordChanged) {
      this._passwordChanged = false;
    }
  }
} 