function fn() {
  var env = karate.env || 'dev';
  var config = {
    baseUrl: 'http://localhost:3000',
    apiPath: '/api',
    timeout: 10000,
    retry: { count: 3, interval: 1000 }
  };

  // Configuration par environnement
  if (env === 'dev') {
    config.baseUrl = 'http://localhost:3000';
  } else if (env === 'staging') {
    config.baseUrl = 'https://staging-api.vitefait.com';
  } else if (env === 'prod') {
    config.baseUrl = 'https://api.vitefait.com';
  }

  // Variables globales
  config.authToken = null;
  config.userId = null;
  config.missionId = null;
  config.paymentId = null;

  // Headers par défaut
  config.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Configuration de la base de données de test
  config.testDb = {
    host: 'localhost',
    port: 5432,
    database: 'vitefait_test',
    username: 'postgres',
    password: 'postgres'
  };

  // Configuration Stripe pour les tests
  config.stripe = {
    secretKey: 'sk_test_dummy',
    publishableKey: 'pk_test_dummy',
    webhookSecret: 'whsec_test_dummy'
  };

  return config;
} 