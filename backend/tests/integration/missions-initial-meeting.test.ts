import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { Mission } from '../../src/models/Mission';
import { User } from '../../src/models/User';
import { MissionStatus, UserRole } from '../../src/types/enums';

describe('Missions Initial Meeting Integration Tests', () => {
  let clientToken: string;
  let clientUser: User;
  let testMission: Mission;

  beforeAll(async () => {
    // Initialiser la base de données de test
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Réinitialiser les données avant chaque test
    await AppDataSource.synchronize(true);

    // Créer un utilisateur client de test
    const userRepository = AppDataSource.getRepository(User);
    clientUser = userRepository.create({
      email: 'test-client-initial-meeting@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Client',
      phone: '0123456789',
      role: UserRole.CLIENT
    });
    await userRepository.save(clientUser);

    // Générer un token pour le client
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-client-initial-meeting@example.com',
        password: 'password123'
      });

    clientToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('POST /api/missions - Initial Meeting', () => {
    it('should create a mission without initial meeting', async () => {
      const missionData = {
        title: 'Mission sans rencontre initiale',
        description: 'Cette mission ne nécessite pas de rencontre préalable',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50,
        requiresInitialMeeting: false
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(201);

      expect(response.body.message).toBe('Mission créée avec succès');
      expect(response.body.mission).toBeDefined();
      expect(response.body.mission.requiresInitialMeeting).toBe(false);
      expect(response.body.mission.meetingTimeSlot).toBeNull();
      expect(response.body.mission.title).toBe(missionData.title);
    });

    it('should create a mission with initial meeting', async () => {
      const meetingTimeSlot = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 heures dans le futur
      const missionData = {
        title: 'Mission avec rencontre initiale',
        description: 'Cette mission nécessite une rencontre préalable',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 75,
        requiresInitialMeeting: true,
        meetingTimeSlot: meetingTimeSlot
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(201);

      expect(response.body.message).toBe('Mission créée avec succès');
      expect(response.body.mission).toBeDefined();
      expect(response.body.mission.requiresInitialMeeting).toBe(true);
      expect(response.body.mission.meetingTimeSlot).toBe(meetingTimeSlot);
      expect(response.body.mission.title).toBe(missionData.title);
    });

    it('should reject mission creation when requiresInitialMeeting is true but no meetingTimeSlot provided', async () => {
      const missionData = {
        title: 'Mission avec rencontre initiale manquante',
        description: 'Cette mission nécessite une rencontre préalable',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50,
        requiresInitialMeeting: true
        // meetingTimeSlot manquant
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toContain('"meetingTimeSlot" is required');
    });

    it('should reject mission creation when meetingTimeSlot is in the past', async () => {
      const pastTimeSlot = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 heures dans le passé
      const missionData = {
        title: 'Mission avec créneau passé',
        description: 'Cette mission a un créneau de rencontre dans le passé',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50,
        requiresInitialMeeting: true,
        meetingTimeSlot: pastTimeSlot
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toContain('"meetingTimeSlot" must be greater than "now"');
    });

    it('should ignore meetingTimeSlot when requiresInitialMeeting is false', async () => {
      const missionData = {
        title: 'Mission sans rencontre mais avec créneau fourni',
        description: 'Cette mission ne nécessite pas de rencontre mais un créneau est fourni',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50,
        requiresInitialMeeting: false,
        meetingTimeSlot: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Fourni mais ignoré
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(400);

      // Le schéma Joi devrait rejeter car meetingTimeSlot est fourni mais requiresInitialMeeting est false
      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toContain('"meetingTimeSlot" is not allowed');
    });
  });

  describe('GET /api/missions - Filtering by Initial Meeting', () => {
    beforeEach(async () => {
      // Créer des missions de test avec et sans rencontre initiale
      const missionRepository = AppDataSource.getRepository(Mission);
      
      // Mission sans rencontre
      const missionWithoutMeeting = missionRepository.create({
        title: 'Mission sans rencontre',
        description: 'Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 50,
        requiresInitialMeeting: false,
        meetingTimeSlot: null,
        clientId: clientUser.id,
        status: MissionStatus.PENDING
      });
      await missionRepository.save(missionWithoutMeeting);

      // Mission avec rencontre
      const missionWithMeeting = missionRepository.create({
        title: 'Mission avec rencontre',
        description: 'Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 75,
        requiresInitialMeeting: true,
        meetingTimeSlot: new Date(Date.now() + 2 * 60 * 60 * 1000),
        clientId: clientUser.id,
        status: MissionStatus.PENDING
      });
      await missionRepository.save(missionWithMeeting);
    });

    it('should return all missions including those with initial meetings', async () => {
      const response = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.missions).toHaveLength(2);
      expect(response.body.missions.some((m: any) => m.requiresInitialMeeting)).toBe(true);
      expect(response.body.missions.some((m: any) => !m.requiresInitialMeeting)).toBe(true);
    });

    it('should filter missions by initial meeting requirement', async () => {
      const response = await request(app)
        .get('/api/missions?requiresInitialMeeting=true')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.missions).toHaveLength(1);
      expect(response.body.missions[0].requiresInitialMeeting).toBe(true);
      expect(response.body.missions[0].meetingTimeSlot).toBeDefined();
    });
  });

  describe('GET /api/missions/:id - Mission Details with Initial Meeting', () => {
    beforeEach(async () => {
      // Créer une mission de test avec rencontre initiale
      const missionRepository = AppDataSource.getRepository(Mission);
      const meetingTimeSlot = new Date(Date.now() + 2 * 60 * 60 * 1000);
      
      testMission = missionRepository.create({
        title: 'Mission de test avec rencontre',
        description: 'Description de test',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 60,
        requiresInitialMeeting: true,
        meetingTimeSlot: meetingTimeSlot,
        clientId: clientUser.id,
        status: MissionStatus.PENDING
      });
      await missionRepository.save(testMission);
    });

    it('should return mission details including initial meeting information', async () => {
      const response = await request(app)
        .get(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.mission).toBeDefined();
      expect(response.body.mission.id).toBe(testMission.id);
      expect(response.body.mission.requiresInitialMeeting).toBe(true);
      expect(response.body.mission.meetingTimeSlot).toBe(testMission.meetingTimeSlot?.toISOString());
      expect(response.body.mission.title).toBe('Mission de test avec rencontre');
    });
  });
}); 