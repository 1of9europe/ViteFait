// Énumérations pour les rôles utilisateur
export enum UserRole {
  CLIENT = 'client',
  ASSISTANT = 'assistant',
  ADMIN = 'admin'
}

// Énumérations pour le statut utilisateur
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// Énumérations pour le statut des missions
export enum MissionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  DISPUTED = 'disputed'
}

// Énumérations pour la priorité des missions
export enum MissionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Énumérations pour le statut des paiements
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Énumérations pour le type de paiement
export enum PaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet'
}

// Énumérations pour le statut des avis
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Énumérations pour le type de notification
export enum NotificationType {
  MISSION_ASSIGNED = 'mission_assigned',
  MISSION_COMPLETED = 'mission_completed',
  PAYMENT_RECEIVED = 'payment_received',
  REVIEW_RECEIVED = 'review_received',
  SYSTEM_ALERT = 'system_alert'
}

// Énumérations pour le canal de notification
export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app'
}

// Énumérations pour le type de fichier
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio'
}

// Énumérations pour les permissions
export enum Permission {
  READ_MISSIONS = 'read_missions',
  CREATE_MISSIONS = 'create_missions',
  UPDATE_MISSIONS = 'update_missions',
  DELETE_MISSIONS = 'delete_missions',
  READ_USERS = 'read_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  READ_PAYMENTS = 'read_payments',
  PROCESS_PAYMENTS = 'process_payments',
  READ_REVIEWS = 'read_reviews',
  MODERATE_REVIEWS = 'moderate_reviews'
}

// Énumérations pour les événements WebSocket
export enum WebSocketEvent {
  MISSION_UPDATED = 'mission_updated',
  MESSAGE_RECEIVED = 'message_received',
  PAYMENT_UPDATED = 'payment_updated',
  NOTIFICATION_SENT = 'notification_sent'
}

// Énumérations pour les types de géolocalisation
export enum LocationType {
  ADDRESS = 'address',
  COORDINATES = 'coordinates',
  PLACE_ID = 'place_id'
}

// Énumérations pour les catégories de missions
export enum MissionCategory {
  DELIVERY = 'delivery',
  SHOPPING = 'shopping',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  TRANSPORT = 'transport',
  OTHER = 'other'
}

// Énumérations pour les statuts de vérification
export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Énumérations pour les types de documents
export enum DocumentType {
  IDENTITY_CARD = 'identity_card',
  DRIVERS_LICENSE = 'drivers_license',
  PASSPORT = 'passport',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement'
} 