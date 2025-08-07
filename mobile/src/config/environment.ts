// Configuration des environnements
export const ENV = {
  // Développement
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_test_key',
    GOOGLE_MAPS_API_KEY: 'your_google_maps_test_key',
  },
  // Production
  production: {
    API_BASE_URL: 'https://api.vitefait.com/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_live_your_stripe_live_key',
    GOOGLE_MAPS_API_KEY: 'your_google_maps_live_key',
  },
};

// Déterminer l'environnement actuel
const isDevelopment = __DEV__;
export const currentEnv = isDevelopment ? ENV.development : ENV.production;

// Configuration par défaut
export const config = {
  API_BASE_URL: currentEnv.API_BASE_URL,
  STRIPE_PUBLISHABLE_KEY: currentEnv.STRIPE_PUBLISHABLE_KEY,
  GOOGLE_MAPS_API_KEY: currentEnv.GOOGLE_MAPS_API_KEY,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}; 