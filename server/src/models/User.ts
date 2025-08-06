import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Mission } from './Mission';
import { Review } from './Review';
import { UserRole, UserStatus } from '../types/enums';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  @MinLength(6)
  password!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string = '';

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT
  })
  role: UserRole = UserRole.CLIENT;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus = UserStatus.ACTIVE;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number = 0;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number = 0;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string = '';

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string = '';

  @Column({ type: 'varchar', length: 10, nullable: true })
  postalCode: string = '';

  @Column({ type: 'text', nullable: true })
  profilePicture: string = '';

  @Column({ type: 'text', nullable: true })
  bio: string = '';

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number = 0;

  @Column({ type: 'int', default: 0 })
  reviewCount: number = 0;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string = '';

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeConnectAccountId: string = '';

  @Column({ type: 'varchar', length: 255, nullable: true })
  fcmToken: string = '';

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date = new Date();

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  // Relations
  @OneToMany(() => Mission, mission => mission.client)
  clientMissions: Mission[] = [];

  @OneToMany(() => Mission, mission => mission.assistant)
  assistantMissions: Mission[] = [];

  @OneToMany(() => Review, review => review.reviewer)
  givenReviews: Review[] = [];

  @OneToMany(() => Review, review => review.reviewed)
  receivedReviews: Review[] = [];

  constructor() {
    // Initialisation des propriétés avec des valeurs par défaut
    this.phone = '';
    this.role = UserRole.CLIENT;
    this.status = UserStatus.ACTIVE;
    this.latitude = 0;
    this.longitude = 0;
    this.address = '';
    this.city = '';
    this.postalCode = '';
    this.profilePicture = '';
    this.bio = '';
    this.rating = 0;
    this.reviewCount = 0;
    this.isVerified = false;
    this.stripeCustomerId = '';
    this.stripeConnectAccountId = '';
    this.fcmToken = '';
    this.lastSeen = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.clientMissions = [];
    this.assistantMissions = [];
    this.givenReviews = [];
    this.receivedReviews = [];
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Méthodes
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAssistant(): boolean {
    return this.role === UserRole.ASSISTANT;
  }

  isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  toJSON(): Partial<User> {
    const user = { ...this };
    delete (user as any).password;
    return user;
  }
} 