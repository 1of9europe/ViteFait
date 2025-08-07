import { ApiError } from '@/services/api';

// Types d'erreur utilisateur
export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  retry?: boolean;
}

// Mappage des erreurs API vers des messages utilisateur
export const mapApiErrorToUserError = (error: ApiError): UserFriendlyError => {
  // Erreurs de réseau
  if (error.status === 0) {
    return {
      title: 'Erreur de connexion',
      message: 'Vérifiez votre connexion internet et réessayez.',
      action: 'Réessayer',
      retry: true,
    };
  }

  // Erreurs d'authentification
  if (error.status === 401) {
    return {
      title: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      action: 'Se reconnecter',
      retry: false,
    };
  }

  if (error.status === 403) {
    return {
      title: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
      action: 'OK',
      retry: false,
    };
  }

  // Erreurs de validation
  if (error.status === 400) {
    if (error.details && error.details.length > 0) {
      return {
        title: 'Données invalides',
        message: error.details.join('\n'),
        action: 'Corriger',
        retry: false,
      };
    }
    return {
      title: 'Données invalides',
      message: error.message || 'Les données fournies sont incorrectes.',
      action: 'Corriger',
      retry: false,
    };
  }

  // Erreurs de ressource non trouvée
  if (error.status === 404) {
    return {
      title: 'Ressource introuvable',
      message: 'La ressource demandée n\'existe pas ou a été supprimée.',
      action: 'OK',
      retry: false,
    };
  }

  // Erreurs de conflit
  if (error.status === 409) {
    return {
      title: 'Conflit',
      message: error.message || 'Cette action entre en conflit avec l\'état actuel.',
      action: 'OK',
      retry: false,
    };
  }

  // Erreurs serveur
  if (error.status >= 500) {
    return {
      title: 'Erreur serveur',
      message: 'Une erreur s\'est produite sur le serveur. Veuillez réessayer plus tard.',
      action: 'Réessayer',
      retry: true,
    };
  }

  // Erreurs par défaut
  return {
    title: 'Erreur',
    message: error.message || 'Une erreur inattendue s\'est produite.',
    action: 'OK',
    retry: false,
  };
};

// Fonction utilitaire pour logger les erreurs
export const logApiError = (error: ApiError, context?: string): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    status: error.status,
    message: error.message,
    details: error.details,
    code: error.code,
  };

  // En développement, afficher dans la console
  if (__DEV__) {
    console.error('API Error:', logData);
  }

  // En production, envoyer à un service de monitoring
  // TODO: Implémenter l'envoi vers un service comme Sentry
};

// Fonction pour déterminer si une erreur est récupérable
export const isRecoverableError = (error: ApiError): boolean => {
  // Erreurs de réseau et serveur sont récupérables
  return error.status === 0 || error.status >= 500;
};

// Fonction pour obtenir un message d'erreur court
export const getShortErrorMessage = (error: ApiError): string => {
  if (error.status === 0) return 'Erreur réseau';
  if (error.status === 401) return 'Session expirée';
  if (error.status === 403) return 'Accès refusé';
  if (error.status === 404) return 'Non trouvé';
  if (error.status === 409) return 'Conflit';
  if (error.status >= 500) return 'Erreur serveur';
  
  return error.message || 'Erreur inconnue';
}; 