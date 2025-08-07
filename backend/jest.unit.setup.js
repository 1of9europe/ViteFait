// Mock de la base de données pour les tests unitaires
jest.mock('./src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true)
  },
  initializeDatabase: jest.fn().mockResolvedValue(true)
}));

// Mock des variables d'environnement
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.NODE_ENV = 'test'; 