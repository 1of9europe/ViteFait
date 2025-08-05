/**
 * Interfaces TypeScript pour les métadonnées des entités
 */

// Métadonnées pour les reviews
export interface ReviewMetadata {
  // Informations sur le contexte de la review
  missionType?: 'delivery' | 'errand' | 'service';
  completionTime?: number; // en minutes
  communicationQuality?: number; // 1-5
  punctuality?: number; // 1-5
  
  // Tags personnalisés
  tags?: string[];
  
  // Informations sur l'expérience
  wouldRecommend?: boolean;
  specialCircumstances?: string;
  
  // Métadonnées techniques
  reviewVersion?: string;
  platform?: 'ios' | 'android' | 'web';
}

// Métadonnées pour les statuts de mission
export interface MissionStatusMetadata {
  // Informations sur le changement de statut
  reason?: string;
  comment?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  
  // Informations sur l'utilisateur qui a changé le statut
  changedByRole?: 'client' | 'assistant' | 'system';
  changedByUserId?: string;
  
  // Informations sur le timing
  estimatedCompletionTime?: number; // en minutes
  actualCompletionTime?: number; // en minutes
  
  // Métadonnées pour les statuts spécifiques
  cancellationReason?: 'client_request' | 'assistant_unavailable' | 'mission_impossible' | 'other';
  disputeReason?: 'quality_issue' | 'payment_issue' | 'communication_issue' | 'other';
  
  // Métadonnées techniques
  statusVersion?: string;
  timestamp?: string;
}

// Métadonnées pour les paiements
export interface PaymentMetadata {
  // Informations sur la transaction
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  stripeRefundId?: string;
  
  // Informations sur les frais
  processingFee?: number; // en centimes
  platformFee?: number; // en centimes
  taxAmount?: number; // en centimes
  
  // Informations sur le contexte
  missionId?: string;
  relatedPaymentId?: string; // pour les remboursements
  
  // Informations sur l'utilisateur
  payerId?: string;
  payeeId?: string;
  
  // Métadonnées pour les types spécifiques
  refundReason?: 'client_request' | 'service_issue' | 'system_error' | 'other';
  escrowReleaseReason?: 'mission_completed' | 'client_approval' | 'timeout' | 'other';
  
  // Informations sur le timing
  processingTime?: number; // en millisecondes
  estimatedSettlementTime?: string;
  
  // Métadonnées techniques
  paymentVersion?: string;
  gateway?: 'stripe' | 'paypal' | 'other';
}

// Métadonnées pour les utilisateurs
export interface UserMetadata {
  // Informations de profil étendues
  preferredLanguages?: string[];
  timezone?: string;
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  
  // Informations de vérification
  identityVerified?: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  
  // Informations sur les préférences
  preferredMissionTypes?: string[];
  preferredWorkingHours?: {
    start: string; // HH:MM
    end: string; // HH:MM
    days: number[]; // 0-6 (dimanche-samedi)
  };
  
  // Informations sur les performances
  averageResponseTime?: number; // en minutes
  completionRate?: number; // pourcentage
  cancellationRate?: number; // pourcentage
  
  // Informations sur les paiements
  preferredPaymentMethod?: 'card' | 'bank_transfer' | 'paypal';
  taxInformation?: {
    taxId?: string;
    taxCountry?: string;
  };
  
  // Métadonnées techniques
  accountVersion?: string;
  lastActivityAt?: string;
  registrationSource?: 'ios' | 'android' | 'web' | 'referral';
}

// Type union pour toutes les métadonnées
export type EntityMetadata = 
  | ReviewMetadata 
  | MissionStatusMetadata 
  | PaymentMetadata 
  | UserMetadata;

// Fonctions utilitaires pour valider les métadonnées
export const isValidReviewMetadata = (metadata: any): metadata is ReviewMetadata => {
  if (!metadata || typeof metadata !== 'object') return false;
  
  // Validation des champs optionnels
  if (metadata.missionType && !['delivery', 'errand', 'service'].includes(metadata.missionType)) {
    return false;
  }
  
  if (metadata.communicationQuality && (metadata.communicationQuality < 1 || metadata.communicationQuality > 5)) {
    return false;
  }
  
  if (metadata.punctuality && (metadata.punctuality < 1 || metadata.punctuality > 5)) {
    return false;
  }
  
  return true;
};

export const isValidMissionStatusMetadata = (metadata: any): metadata is MissionStatusMetadata => {
  if (!metadata || typeof metadata !== 'object') return false;
  
  // Validation de la localisation si présente
  if (metadata.location) {
    if (typeof metadata.location.latitude !== 'number' || typeof metadata.location.longitude !== 'number') {
      return false;
    }
  }
  
  // Validation des raisons
  if (metadata.cancellationReason && !['client_request', 'assistant_unavailable', 'mission_impossible', 'other'].includes(metadata.cancellationReason)) {
    return false;
  }
  
  if (metadata.disputeReason && !['quality_issue', 'payment_issue', 'communication_issue', 'other'].includes(metadata.disputeReason)) {
    return false;
  }
  
  return true;
};

export const isValidPaymentMetadata = (metadata: any): metadata is PaymentMetadata => {
  if (!metadata || typeof metadata !== 'object') return false;
  
  // Validation des montants
  if (metadata.processingFee && typeof metadata.processingFee !== 'number') {
    return false;
  }
  
  if (metadata.platformFee && typeof metadata.platformFee !== 'number') {
    return false;
  }
  
  if (metadata.taxAmount && typeof metadata.taxAmount !== 'number') {
    return false;
  }
  
  // Validation des raisons
  if (metadata.refundReason && !['client_request', 'service_issue', 'system_error', 'other'].includes(metadata.refundReason)) {
    return false;
  }
  
  if (metadata.escrowReleaseReason && !['mission_completed', 'client_approval', 'timeout', 'other'].includes(metadata.escrowReleaseReason)) {
    return false;
  }
  
  return true;
};

export const isValidUserMetadata = (metadata: any): metadata is UserMetadata => {
  if (!metadata || typeof metadata !== 'object') return false;
  
  // Validation des préférences de notification
  if (metadata.notificationPreferences) {
    const prefs = metadata.notificationPreferences;
    if (typeof prefs.email !== 'boolean' && prefs.email !== undefined) {
      return false;
    }
    if (typeof prefs.push !== 'boolean' && prefs.push !== undefined) {
      return false;
    }
    if (typeof prefs.sms !== 'boolean' && prefs.sms !== undefined) {
      return false;
    }
  }
  
  // Validation des heures de travail
  if (metadata.preferredWorkingHours) {
    const hours = metadata.preferredWorkingHours;
    if (typeof hours.start !== 'string' || typeof hours.end !== 'string') {
      return false;
    }
    if (!Array.isArray(hours.days) || !hours.days.every((day: any) => typeof day === 'number' && day >= 0 && day <= 6)) {
      return false;
    }
  }
  
  return true;
}; 