import { config, validateConfig } from '../../src/config/config';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('config object', () => {
    it('should load default values when environment variables are not set', () => {
      expect(config.server.port).toBe(3000);
      expect(config.server.nodeEnv).toBe('development');
      expect(config.database.host).toBe('localhost');
      expect(config.database.port).toBe(5432);
      expect(config.jwt.expiresIn).toBe('24h');
    });

    it('should load values from environment variables', () => {
      process.env.PORT = '4000';
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'test-host';
      process.env.JWT_SECRET = 'test-secret';

      // Recharger la configuration
      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.server.port).toBe(4000);
      expect(newConfig.server.nodeEnv).toBe('production');
      expect(newConfig.database.host).toBe('test-host');
      expect(newConfig.jwt.secret).toBe('test-secret');
    });

    it('should parse numeric values correctly', () => {
      process.env.DB_PORT = '5433';
      process.env.DB_POOL_MAX = '30';
      process.env.RATE_LIMIT_MAX = '200';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.port).toBe(5433);
      expect(newConfig.database.poolMax).toBe(30);
      expect(newConfig.server.rateLimitMax).toBe(200);
    });

    it('should handle boolean values correctly', () => {
      process.env.DB_SSL = 'true';
      process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';
      process.env.NOTIFICATIONS_ENABLED = 'true';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.ssl).toBe(true);
      expect(newConfig.database.sslRejectUnauthorized).toBe(false);
      expect(newConfig.notifications.enabled).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should not throw error when all required fields are present', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'postgres';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_DATABASE = 'test';
      process.env.JWT_SECRET = 'test-secret';

      jest.resetModules();
      const { validateConfig: newValidateConfig } = require('../../src/config/config');

      expect(() => newValidateConfig()).not.toThrow();
    });

    it('should throw error when required fields are missing', () => {
      delete process.env.DB_HOST;
      delete process.env.JWT_SECRET;

      jest.resetModules();
      const { validateConfig: newValidateConfig } = require('../../src/config/config');

      expect(() => newValidateConfig()).toThrow('Configuration manquante: database.host, jwt.secret');
    });

    it('should throw error in production with default JWT secret', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

      jest.resetModules();
      const { validateConfig: newValidateConfig } = require('../../src/config/config');

      expect(() => newValidateConfig()).toThrow('JWT_SECRET doit être configuré en production');
    });

    it('should throw error in production without Stripe configuration', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'custom-secret';
      delete process.env.STRIPE_SECRET_KEY;

      jest.resetModules();
      const { validateConfig: newValidateConfig } = require('../../src/config/config');

      expect(() => newValidateConfig()).toThrow('STRIPE_SECRET_KEY doit être configuré en production');
    });

    it('should throw error in production without Firebase configuration', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'custom-secret';
      process.env.STRIPE_SECRET_KEY = 'stripe-secret';
      delete process.env.FIREBASE_PROJECT_ID;

      jest.resetModules();
      const { validateConfig: newValidateConfig } = require('../../src/config/config');

      expect(() => newValidateConfig()).toThrow('FIREBASE_PROJECT_ID doit être configuré en production');
    });
  });

  describe('database configuration', () => {
    it('should configure SSL correctly', () => {
      process.env.DB_SSL = 'true';
      process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';
      process.env.DB_SSL_CA = 'test-ca';
      process.env.DB_SSL_CERT = 'test-cert';
      process.env.DB_SSL_KEY = 'test-key';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.ssl).toBe(true);
      expect(newConfig.database.sslRejectUnauthorized).toBe(false);
      expect(newConfig.database.sslCa).toBe('test-ca');
      expect(newConfig.database.sslCert).toBe('test-cert');
      expect(newConfig.database.sslKey).toBe('test-key');
    });

    it('should configure pool settings correctly', () => {
      process.env.DB_POOL_MAX = '25';
      process.env.DB_POOL_MIN = '10';
      process.env.DB_POOL_ACQUIRE = '30000';
      process.env.DB_POOL_IDLE = '5000';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.poolMax).toBe(25);
      expect(newConfig.database.poolMin).toBe(10);
      expect(newConfig.database.poolAcquire).toBe(30000);
      expect(newConfig.database.poolIdle).toBe(5000);
    });

    it('should configure timeouts correctly', () => {
      process.env.DB_CONNECTION_TIMEOUT = '10000';
      process.env.DB_IDLE_TIMEOUT = '60000';
      process.env.DB_STATEMENT_TIMEOUT = '45000';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.connectionTimeoutMillis).toBe(10000);
      expect(newConfig.database.idleTimeoutMillis).toBe(60000);
      expect(newConfig.database.statementTimeout).toBe(45000);
    });
  });

  describe('synchronize configuration', () => {
    it('should enable synchronize in development', () => {
      process.env.NODE_ENV = 'development';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.synchronize).toBe(true);
    });

    it('should enable synchronize in test', () => {
      process.env.NODE_ENV = 'test';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.synchronize).toBe(true);
    });

    it('should disable synchronize in production', () => {
      process.env.NODE_ENV = 'production';

      jest.resetModules();
      const { config: newConfig } = require('../../src/config/config');

      expect(newConfig.database.synchronize).toBe(false);
    });
  });
}); 