// Configuration centralisée des variables d'environnement
export const config = {
  // Configuration de l'application
  app: {
    port: parseInt(process.env['PORT'] || '3000'),
    nodeEnv: process.env['NODE_ENV'] || 'development',
    isDevelopment: process.env['NODE_ENV'] === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
    isTest: process.env['NODE_ENV'] === 'test'
  },

  // Configuration JWT
  jwt: {
    secret: process.env['JWT_SECRET']!,
    refreshSecret: process.env['JWT_REFRESH_SECRET']!,
    expiresIn: process.env['JWT_EXPIRES_IN'] || '1h',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'
  },

  // Configuration de la base de données
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    username: process.env['DB_USERNAME'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'password',
    database: process.env['DB_DATABASE'] || 'conciergerie_urbaine',
    synchronize: process.env['NODE_ENV'] === 'development',
    logging: process.env['NODE_ENV'] === 'development',
    ssl: process.env['NODE_ENV'] === 'production' ? { rejectUnauthorized: false } : false
  },

  // Configuration CORS
  cors: {
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true
  },

  // Configuration Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100') // limite par IP
  },

  // Configuration Stripe
  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY']!,
    publishableKey: process.env['STRIPE_PUBLISHABLE_KEY']!,
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET']!,
    currency: process.env['STRIPE_CURRENCY'] || 'eur'
  },

  // Configuration Firebase
  firebase: {
    projectId: process.env['FIREBASE_PROJECT_ID']!,
    privateKey: process.env['FIREBASE_PRIVATE_KEY']!,
    clientEmail: process.env['FIREBASE_CLIENT_EMAIL']!
  },

  // Configuration AWS (optionnel)
  aws: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
    region: process.env['AWS_REGION'] || 'eu-west-3',
    s3Bucket: process.env['AWS_S3_BUCKET']
  },

  // Configuration des logs
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    timestamp: process.env['NODE_ENV'] !== 'test'
  },

  // Configuration des emails (optionnel)
  email: {
    host: process.env['EMAIL_HOST'],
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    secure: process.env['EMAIL_SECURE'] === 'true',
    auth: {
      user: process.env['EMAIL_USER'],
      pass: process.env['EMAIL_PASS']
    }
  },

  // Configuration des notifications
  notifications: {
    pushEnabled: process.env['PUSH_NOTIFICATIONS_ENABLED'] === 'true',
    emailEnabled: process.env['EMAIL_NOTIFICATIONS_ENABLED'] === 'true',
    smsEnabled: process.env['SMS_NOTIFICATIONS_ENABLED'] === 'true'
  }
};

// Validation des variables d'environnement requises
export function validateEnvironment(): void {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }
}

// Fonction utilitaire pour obtenir une valeur de configuration avec validation
export function getConfigValue<T>(path: string, defaultValue?: T): T {
  const keys = path.split('.');
  let value: any = config;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Configuration path not found: ${path}`);
    }
  }

  return value as T;
}

// Fonction utilitaire pour vérifier si une configuration existe
export function hasConfig(path: string): boolean {
  try {
    getConfigValue(path);
    return true;
  } catch {
    return false;
  }
}

// Export des types pour TypeScript
export type Config = typeof config;
export type AppConfig = Config['app'];
export type JWTConfig = Config['jwt'];
export type DatabaseConfig = Config['database'];
export type StripeConfig = Config['stripe'];
export type FirebaseConfig = Config['firebase']; 