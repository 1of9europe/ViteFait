import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../models/User';
import { Mission, MissionStatus, MissionPriority } from '../models/Mission';
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Initialiser la connexion à la base de données
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    // Nettoyer les données existantes
    await AppDataSource.getRepository(Mission).clear();
    await AppDataSource.getRepository(User).clear();
    console.log('🧹 Données existantes supprimées');

    // Créer des utilisateurs de test
    const users = await createTestUsers();
    console.log(`👥 ${users.length} utilisateurs créés`);

    // Créer des missions de test
    const missions = await createTestMissions(users);
    console.log(`🎯 ${missions.length} missions créées`);

    console.log('🌱 Données de test créées avec succès !');
    console.log('\n📋 Utilisateurs de test:');
    console.log('Client: client@test.com / password123');
    console.log('Assistant: assistant@test.com / password123');
    console.log('Admin: admin@test.com / password123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

async function createTestUsers(): Promise<User[]> {
  const userRepository = AppDataSource.getRepository(User);
  const users: User[] = [];

  // Client de test
  const client = new User();
  client.email = 'client@test.com';
  client.password = 'password123';
  client.firstName = 'Jean';
  client.lastName = 'Dupont';
  client.phone = '0123456789';
  client.role = UserRole.CLIENT;
  client.status = UserStatus.ACTIVE;
  client.address = '123 Rue de la Paix';
  client.city = 'Paris';
  client.postalCode = '75001';
  client.bio = 'Client test pour l\'environnement de staging';
  await client.hashPassword();
  users.push(await userRepository.save(client));

  // Assistant de test
  const assistant = new User();
  assistant.email = 'assistant@test.com';
  assistant.password = 'password123';
  assistant.firstName = 'Marie';
  assistant.lastName = 'Martin';
  assistant.phone = '0987654321';
  assistant.role = UserRole.ASSISTANT;
  assistant.status = UserStatus.ACTIVE;
  assistant.address = '456 Avenue des Champs';
  assistant.city = 'Paris';
  assistant.postalCode = '75008';
  assistant.bio = 'Assistant test pour l\'environnement de staging';
  assistant.isVerified = true;
  assistant.rating = 4.5;
  assistant.reviewCount = 10;
  await assistant.hashPassword();
  users.push(await userRepository.save(assistant));

  // Admin de test
  const admin = new User();
  admin.email = 'admin@test.com';
  admin.password = 'password123';
  admin.firstName = 'Admin';
  admin.lastName = 'System';
  admin.phone = '0555666777';
  admin.role = UserRole.CLIENT; // Pour l'instant, pas de rôle admin
  admin.status = UserStatus.ACTIVE;
  admin.address = '789 Boulevard Saint-Germain';
  admin.city = 'Paris';
  admin.postalCode = '75006';
  admin.bio = 'Administrateur test pour l\'environnement de staging';
  admin.isVerified = true;
  await admin.hashPassword();
  users.push(await userRepository.save(admin));

  return users;
}

async function createTestMissions(users: User[]): Promise<Mission[]> {
  const missionRepository = AppDataSource.getRepository(Mission);
  const missions: Mission[] = [];

  const client = users.find(u => u.role === UserRole.CLIENT);
  const assistant = users.find(u => u.role === UserRole.ASSISTANT);

  if (!client || !assistant) {
    throw new Error('Utilisateurs de test non trouvés');
  }

  // Mission en attente
  const pendingMission = new Mission();
  pendingMission.title = 'Courses alimentaires';
  pendingMission.description = 'Acheter des produits frais au marché local';
  pendingMission.pickupLatitude = 48.8566;
  pendingMission.pickupLongitude = 2.3522;
  pendingMission.pickupAddress = 'Marché de la Madeleine, Paris';
  pendingMission.timeWindowStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // Demain
  pendingMission.timeWindowEnd = new Date(Date.now() + 25 * 60 * 60 * 1000);
  pendingMission.priceEstimate = 25.0;
  pendingMission.cashAdvance = 30.0;
  pendingMission.instructions = 'Privilégier les produits bio et locaux';
  pendingMission.requiresCar = false;
  pendingMission.requiresTools = false;
  pendingMission.category = 'courses';
  pendingMission.priority = MissionPriority.MEDIUM;
  pendingMission.clientId = client.id;
  pendingMission.status = MissionStatus.PENDING;
  missions.push(await missionRepository.save(pendingMission));

  // Mission acceptée
  const acceptedMission = new Mission();
  acceptedMission.title = 'Livraison de colis';
  acceptedMission.description = 'Livrer un colis fragile à un client';
  acceptedMission.pickupLatitude = 48.8566;
  acceptedMission.pickupLongitude = 2.3522;
  acceptedMission.pickupAddress = 'Bureau de poste, Paris';
  acceptedMission.dropLatitude = 48.8606;
  acceptedMission.dropLongitude = 2.3376;
  acceptedMission.dropAddress = 'Appartement client, Paris';
  acceptedMission.timeWindowStart = new Date(Date.now() + 2 * 60 * 60 * 1000); // Dans 2h
  acceptedMission.timeWindowEnd = new Date(Date.now() + 4 * 60 * 60 * 1000);
  acceptedMission.priceEstimate = 35.0;
  acceptedMission.cashAdvance = 0.0;
  acceptedMission.instructions = 'Colis fragile, manipuler avec précaution';
  acceptedMission.requiresCar = true;
  acceptedMission.requiresTools = false;
  acceptedMission.category = 'livraison';
  acceptedMission.priority = MissionPriority.HIGH;
  acceptedMission.clientId = client.id;
  acceptedMission.assistantId = assistant.id;
  acceptedMission.status = MissionStatus.ACCEPTED;
  acceptedMission.acceptedAt = new Date();
  missions.push(await missionRepository.save(acceptedMission));

  // Mission en cours
  const inProgressMission = new Mission();
  inProgressMission.title = 'Ménage d\'appartement';
  inProgressMission.description = 'Nettoyer un appartement de 2 pièces';
  inProgressMission.pickupLatitude = 48.8566;
  inProgressMission.pickupLongitude = 2.3522;
  inProgressMission.pickupAddress = 'Appartement à nettoyer, Paris';
  inProgressMission.timeWindowStart = new Date();
  inProgressMission.timeWindowEnd = new Date(Date.now() + 3 * 60 * 60 * 1000);
  inProgressMission.priceEstimate = 80.0;
  inProgressMission.cashAdvance = 0.0;
  inProgressMission.instructions = 'Nettoyage complet, produits fournis';
  inProgressMission.requiresCar = false;
  inProgressMission.requiresTools = true;
  inProgressMission.category = 'ménage';
  inProgressMission.priority = MissionPriority.MEDIUM;
  inProgressMission.clientId = client.id;
  inProgressMission.assistantId = assistant.id;
  inProgressMission.status = MissionStatus.IN_PROGRESS;
  inProgressMission.acceptedAt = new Date(Date.now() - 60 * 60 * 1000); // Il y a 1h
  inProgressMission.startedAt = new Date(Date.now() - 30 * 60 * 1000); // Il y a 30min
  missions.push(await missionRepository.save(inProgressMission));

  // Mission terminée
  const completedMission = new Mission();
  completedMission.title = 'Promenade de chien';
  completedMission.description = 'Promener le chien pendant 1 heure';
  completedMission.pickupLatitude = 48.8566;
  completedMission.pickupLongitude = 2.3522;
  completedMission.pickupAddress = 'Domicile client, Paris';
  completedMission.timeWindowStart = new Date(Date.now() - 3 * 60 * 60 * 1000); // Il y a 3h
  completedMission.timeWindowEnd = new Date(Date.now() - 2 * 60 * 60 * 1000); // Il y a 2h
  completedMission.priceEstimate = 20.0;
  completedMission.cashAdvance = 0.0;
  completedMission.instructions = 'Chien calme, promenade dans le parc';
  completedMission.requiresCar = false;
  completedMission.requiresTools = false;
  completedMission.category = 'animaux';
  completedMission.priority = MissionPriority.LOW;
  completedMission.clientId = client.id;
  completedMission.assistantId = assistant.id;
  completedMission.status = MissionStatus.COMPLETED;
  completedMission.acceptedAt = new Date(Date.now() - 4 * 60 * 60 * 1000);
  completedMission.startedAt = new Date(Date.now() - 3 * 60 * 60 * 1000);
  completedMission.completedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
  completedMission.finalPrice = 20.0;
  missions.push(await missionRepository.save(completedMission));

  return missions;
}

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seed();
} 