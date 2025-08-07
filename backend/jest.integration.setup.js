// Configuration globale pour Jest Integration Tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Port différent pour les tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.DB_DATABASE = 'conciergerie_urbaine_test';
process.env.DB_IN_MEMORY = 'true'; // Utiliser SQLite en mémoire pour les tests

// Mock de la base de données pour les tests d'intégration
jest.mock('./src/config/database', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    }),
    destroy: jest.fn().mockResolvedValue(true),
  },
  initializeDatabase: jest.fn().mockResolvedValue(true),
}));

// Mock des modules externes
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id', email: 'test@example.com' }),
}));

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'secret_test' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'pi_test', status: 'succeeded' }),
    },
    transfers: {
      create: jest.fn().mockResolvedValue({ id: 'tr_test' }),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({ id: 're_test' }),
    },
  })),
}));

// Configuration des timeouts
jest.setTimeout(30000);

// Suppression des logs en mode test
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 