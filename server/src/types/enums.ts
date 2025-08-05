/**
 * Enums pour les types et statuts de paiement
 */

export enum PaymentType {
  ESCROW = 'escrow',
  RELEASE = 'release',
  REFUND = 'refund',
  COMMISSION = 'commission',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentCurrency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
}

export enum MissionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum UserRole {
  CLIENT = 'client',
  ASSISTANT = 'assistant',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Fonctions utilitaires pour les enums
export const isValidPaymentType = (type: string): type is PaymentType => {
  return Object.values(PaymentType).includes(type as PaymentType);
};

export const isValidPaymentStatus = (status: string): status is PaymentStatus => {
  return Object.values(PaymentStatus).includes(status as PaymentStatus);
};

export const isValidPaymentCurrency = (currency: string): currency is PaymentCurrency => {
  return Object.values(PaymentCurrency).includes(currency as PaymentCurrency);
};

export const isValidMissionStatus = (status: string): status is MissionStatus => {
  return Object.values(MissionStatus).includes(status as MissionStatus);
};

export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

export const isValidUserStatus = (status: string): status is UserStatus => {
  return Object.values(UserStatus).includes(status as UserStatus);
};

export const isValidReviewStatus = (status: string): status is ReviewStatus => {
  return Object.values(ReviewStatus).includes(status as ReviewStatus);
};

// Fonctions pour obtenir les valeurs des enums
export const getPaymentTypes = (): PaymentType[] => {
  return Object.values(PaymentType);
};

export const getPaymentStatuses = (): PaymentStatus[] => {
  return Object.values(PaymentStatus);
};

export const getPaymentCurrencies = (): PaymentCurrency[] => {
  return Object.values(PaymentCurrency);
};

export const getMissionStatuses = (): MissionStatus[] => {
  return Object.values(MissionStatus);
};

export const getUserRoles = (): UserRole[] => {
  return Object.values(UserRole);
};

export const getUserStatuses = (): UserStatus[] => {
  return Object.values(UserStatus);
};

export const getReviewStatuses = (): ReviewStatus[] => {
  return Object.values(ReviewStatus);
};

// Fonctions pour vérifier les transitions d'état
export const canTransitionPaymentStatus = (from: PaymentStatus, to: PaymentStatus): boolean => {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.CANCELLED],
    [PaymentStatus.PROCESSING]: [PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
    [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
    [PaymentStatus.FAILED]: [PaymentStatus.PENDING],
    [PaymentStatus.CANCELLED]: [],
    [PaymentStatus.REFUNDED]: [],
  };

  return validTransitions[from]?.includes(to) || false;
};

export const canTransitionMissionStatus = (from: MissionStatus, to: MissionStatus): boolean => {
  const validTransitions: Record<MissionStatus, MissionStatus[]> = {
    [MissionStatus.PENDING]: [MissionStatus.ACCEPTED, MissionStatus.CANCELLED],
    [MissionStatus.ACCEPTED]: [MissionStatus.IN_PROGRESS, MissionStatus.CANCELLED],
    [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.DISPUTED, MissionStatus.CANCELLED],
    [MissionStatus.COMPLETED]: [MissionStatus.DISPUTED],
    [MissionStatus.CANCELLED]: [],
    [MissionStatus.DISPUTED]: [MissionStatus.COMPLETED, MissionStatus.CANCELLED],
  };

  return validTransitions[from]?.includes(to) || false;
};

// Fonctions pour obtenir les statuts finaux
export const isFinalPaymentStatus = (status: PaymentStatus): boolean => {
  return [PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.CANCELLED, PaymentStatus.REFUNDED].includes(status);
};

export const isFinalMissionStatus = (status: MissionStatus): boolean => {
  return [MissionStatus.COMPLETED, MissionStatus.CANCELLED].includes(status);
};

// Fonctions pour obtenir les statuts actifs
export const isActivePaymentStatus = (status: PaymentStatus): boolean => {
  return [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(status);
};

export const isActiveMissionStatus = (status: MissionStatus): boolean => {
  return [MissionStatus.PENDING, MissionStatus.ACCEPTED, MissionStatus.IN_PROGRESS].includes(status);
}; 