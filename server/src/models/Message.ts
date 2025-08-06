import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn
} from 'typeorm';
import { User } from './User';

export enum MessageType {
  TEXT = 'text',
  STATUS = 'status',
  SYSTEM = 'system'
}

@Entity('messages')
@Index(['missionId', 'createdAt'])
@Index(['senderId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type!: MessageType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @Column({ type: 'uuid' })
  missionId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  @Column({ type: 'uuid', nullable: true })
  senderId?: string;

  // Méthodes
  isTextMessage(): boolean {
    return this.type === MessageType.TEXT;
  }

  isStatusMessage(): boolean {
    return this.type === MessageType.STATUS;
  }

  isSystemMessage(): boolean {
    return this.type === MessageType.SYSTEM;
  }

  getSenderName(): string {
    if (this.sender) {
      return this.sender.getFullName();
    }
    return 'Système';
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      content: this.content,
      type: this.type,
      createdAt: this.createdAt,
      senderId: this.senderId,
      senderName: this.getSenderName(),
      metadata: this.metadata
    };
  }
} 