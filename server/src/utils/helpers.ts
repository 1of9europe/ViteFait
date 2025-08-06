import { v4 as uuidv4 } from 'uuid';

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Retourne la date/heure actuelle
 */
export function now(): Date {
  return new Date();
}

/**
 * Génère un timestamp unique
 */
export function generateTimestamp(): string {
  return Date.now().toString();
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Calcule la différence entre deux dates en minutes
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Vérifie si une date est récente (dans les dernières X minutes)
 */
export function isRecentDate(date: Date, minutes: number = 5): boolean {
  const now = new Date();
  return getMinutesDifference(date, now) < minutes;
}

/**
 * Génère un slug à partir d'une chaîne
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Tronque une chaîne à une longueur donnée
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...';
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Masque partiellement un email pour la sécurité
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  // Si l'email ne contient pas de domaine ou que la partie locale est trop courte,
  // on retourne l'email tel quel pour éviter les erreurs.
  if (!localPart || !domain || localPart.length <= 2) {
    return email;
  }
  const maskedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
  return `${maskedLocal}@${domain}`;
}

/**
 * Masque partiellement un numéro de téléphone
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) {
    return phone;
  }
  return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
}

/**
 * Génère un code de vérification à 6 chiffres
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Retourne une chaîne aléatoire
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 