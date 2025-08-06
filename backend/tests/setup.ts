import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';

// Configuration pour les tests
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-key';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['DB_DATABASE'] = 'conciergerie_urbaine_test';
process.env['DB_HOST'] = 'localhost';
process.env['DB_PORT'] = '5432';
process.env['DB_USERNAME'] = 'postgres';
process.env['DB_PASSWORD'] = 'postgres';

// Configuration globale pour les tests
beforeAll(async () => {
  // Initialiser la base de données de test
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de données de test connectée');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données de test:', error);
    throw error;
  }
});

afterAll(async () => {
  // Fermer la connexion à la base de données
  try {
    await AppDataSource.destroy();
    console.log('✅ Connexion à la base de données de test fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', error);
  }
});

// Nettoyer la base de données entre les tests
beforeEach(async () => {
  const entities = AppDataSource.entityMetadatas;
  
  for (const entity of entities) {
    try {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.clear();
    } catch (error) {
      console.warn(`⚠️ Impossible de nettoyer l'entité ${entity.name}:`, error);
    }
  }
});

// Configuration globale pour Jest
jest.setTimeout(30000); // 30 secondes de timeout pour les tests

// Mock des modules externes
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  getMessaging: jest.fn(() => ({
    send: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' })
  }))
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_mock', client_secret: 'pi_mock_secret' }),
      confirm: jest.fn().mockResolvedValue({ id: 'pi_mock', status: 'succeeded' })
    },
    transfers: {
      create: jest.fn().mockResolvedValue({ id: 'tr_mock' })
    }
  }));
}); 