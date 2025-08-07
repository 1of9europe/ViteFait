import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Mission } from '../models/Mission';
import { MissionStatusHistory } from '../models/MissionStatusHistory';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';

// Détecte le mode dev "sans base" grâce à .env
const useInMemory = process.env['DB_IN_MEMORY'] === 'true';

const entities = [User, Mission, MissionStatusHistory, Payment, Review];

// Créer la DataSource seulement si on n'est pas en mode développement sans SQLite
let AppDataSource: DataSource;

if (process.env['NODE_ENV'] === 'development' && useInMemory) {
  // En mode développement sans SQLite, créer une DataSource factice
  AppDataSource = {
    isInitialized: false,
    initialize: async () => {
      console.log('⚠️  Mode développement: DataSource factice initialisée');
      return AppDataSource;
    },
    getRepository: () => {
      throw new Error('Base de données non disponible en mode développement');
    },
    destroy: async () => {
      console.log('✅ DataSource factice fermée');
    }
  } as any;
} else {
  AppDataSource = new DataSource(
    useInMemory
      ? {
          type: 'sqlite' as const,
          database: ':memory:',
          entities,
          synchronize: true,
          logging: process.env['NODE_ENV'] === 'development',
          dropSchema: true, // Recrée le schéma à chaque démarrage
        }
      : {
          type: 'postgres' as const,
          host: process.env['DB_HOST'] || 'localhost',
          port: parseInt(process.env['DB_PORT'] || '5432'),
          username: process.env['DB_USERNAME'] || 'postgres',
          password: process.env['DB_PASSWORD'] || 'password',
          database: process.env['DB_NAME'] || 'vitefait',
          entities,
          migrations: ['src/migrations/*.ts'],
          synchronize: process.env['NODE_ENV'] === 'development',
          logging: process.env['NODE_ENV'] === 'development',
          subscribers: ['src/subscribers/*.ts'],
        }
  );
}

export { AppDataSource };

export const initializeDatabase = async (): Promise<void> => {
  try {
    // En mode développement sans SQLite, on ne fait rien
    if (process.env['NODE_ENV'] === 'development' && useInMemory) {
      console.log('⚠️  Mode développement: base de données désactivée (SQLite non disponible)');
      return;
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`✅ Base de données initialisée avec succès (${useInMemory ? 'SQLite en mémoire' : 'PostgreSQL'})`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    
    // En mode développement, on ne fait pas planter l'application
    if (process.env['NODE_ENV'] === 'development') {
      console.log('⚠️  Mode développement: continuation sans base de données');
      return;
    }
    
    process.exit(1);
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('✅ Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', error);
  }
}; 