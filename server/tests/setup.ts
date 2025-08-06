import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';

// Configuration pour les tests
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-key';
process.env['DB_DATABASE'] = 'conciergerie_urbaine_test';

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
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
}); 