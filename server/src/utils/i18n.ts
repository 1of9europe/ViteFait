/**
 * Système d'internationalisation pour les textes des entités
 */

export type Locale = 'fr' | 'en';

// Configuration par défaut
const DEFAULT_LOCALE: Locale = 'fr';

// Traductions pour les reviews
export const reviewTranslations = {
  fr: {
    rating: {
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bon',
      5: 'Excellent',
    },
    status: {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    },
  },
  en: {
    rating: {
      1: 'Very Bad',
      2: 'Bad',
      3: 'Average',
      4: 'Good',
      5: 'Excellent',
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
  },
};

// Traductions pour les statuts de mission
export const missionStatusTranslations = {
  fr: {
    pending: 'En attente',
    accepted: 'Acceptée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    disputed: 'En litige',
  },
  en: {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  },
};

// Traductions pour les types de paiement
export const paymentTypeTranslations = {
  fr: {
    escrow: 'Mise en dépôt',
    release: 'Libération',
    refund: 'Remboursement',
    commission: 'Commission',
  },
  en: {
    escrow: 'Escrow',
    release: 'Release',
    refund: 'Refund',
    commission: 'Commission',
  },
};

// Traductions pour les statuts de paiement
export const paymentStatusTranslations = {
  fr: {
    pending: 'En attente',
    processing: 'En cours de traitement',
    completed: 'Terminé',
    failed: 'Échoué',
    cancelled: 'Annulé',
  },
  en: {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  },
};

/**
 * Classe utilitaire pour la gestion des traductions
 */
export class I18nService {
  private locale: Locale;

  constructor(locale: Locale = DEFAULT_LOCALE) {
    this.locale = locale;
  }

  /**
   * Définir la locale
   */
  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  /**
   * Obtenir la locale actuelle
   */
  getLocale(): Locale {
    return this.locale;
  }

  /**
   * Traduire un texte de review
   */
  getReviewRatingText(rating: number): string {
    const translations = reviewTranslations[this.locale];
    return translations.rating[rating as keyof typeof translations.rating] || 'Inconnu';
  }

  /**
   * Traduire un statut de review
   */
  getReviewStatusText(status: string): string {
    const translations = reviewTranslations[this.locale];
    return translations.status[status as keyof typeof translations.status] || status;
  }

  /**
   * Traduire un statut de mission
   */
  getMissionStatusText(status: string): string {
    const translations = missionStatusTranslations[this.locale];
    return translations[status as keyof typeof translations] || status;
  }

  /**
   * Traduire un type de paiement
   */
  getPaymentTypeText(type: string): string {
    const translations = paymentTypeTranslations[this.locale];
    return translations[type as keyof typeof translations] || type;
  }

  /**
   * Traduire un statut de paiement
   */
  getPaymentStatusText(status: string): string {
    const translations = paymentStatusTranslations[this.locale];
    return translations[status as keyof typeof translations] || status;
  }

  /**
   * Formater un montant selon la locale
   */
  formatAmount(amountCents: number, currency: string = 'EUR'): string {
    const amount = amountCents / 100;
    
    if (this.locale === 'fr') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    }
  }

  /**
   * Formater une date selon la locale
   */
  formatDate(date: Date): string {
    if (this.locale === 'fr') {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
  }
}

// Instance singleton par défaut
export const i18n = new I18nService();

// Fonctions utilitaires pour compatibilité
export const getReviewRatingText = (rating: number, locale: Locale = DEFAULT_LOCALE): string => {
  const service = new I18nService(locale);
  return service.getReviewRatingText(rating);
};

export const getMissionStatusText = (status: string, locale: Locale = DEFAULT_LOCALE): string => {
  const service = new I18nService(locale);
  return service.getMissionStatusText(status);
};

export const getPaymentTypeText = (type: string, locale: Locale = DEFAULT_LOCALE): string => {
  const service = new I18nService(locale);
  return service.getPaymentTypeText(type);
};

export const getPaymentStatusText = (status: string, locale: Locale = DEFAULT_LOCALE): string => {
  const service = new I18nService(locale);
  return service.getPaymentStatusText(status);
};

export const formatAmount = (amountCents: number, currency: string = 'EUR', locale: Locale = DEFAULT_LOCALE): string => {
  const service = new I18nService(locale);
  return service.formatAmount(amountCents, currency);
}; 