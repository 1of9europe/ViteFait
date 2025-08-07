import request from 'supertest';
import { UserRole, MissionStatus } from '../../src/types/enums';

// Importer le serveur de test
const app = require('../../test-server');

describe('Missions Routes Integration Tests', () => {
  let clientToken: string;
  let assistantToken: string;
  let clientUser: any;
  let testMission: any;

  beforeEach(async () => {
    // Réinitialiser les données avant chaque test
    await request(app).post('/reset');

    // Créer un utilisateur client
    const clientData = {
      email: 'client@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Client',
      phone: '0123456789',
      role: UserRole.CLIENT
    };

    const clientResponse = await request(app)
      .post('/api/auth/signup')
      .send(clientData)
      .expect(201);

    clientToken = clientResponse.body.token;
    clientUser = clientResponse.body.user;

    // Créer un utilisateur assistant
    const assistantData = {
      email: 'assistant@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Assistant',
      phone: '0987654321',
      role: UserRole.ASSISTANT
    };

    const assistantResponse = await request(app)
      .post('/api/auth/signup')
      .send(assistantData)
      .expect(201);

    assistantToken = assistantResponse.body.token;

    // Créer une mission de test
    const missionData = {
      title: 'Test Mission',
      description: 'This is a test mission description',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      pickupAddress: '123 Test Street, Paris',
      dropLatitude: 48.8584,
      dropLongitude: 2.2945,
      dropAddress: '456 Test Avenue, Paris',
      timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
      timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Demain + 1h
      priceEstimate: 50,
      cashAdvance: 10,
      priority: 'medium',
      instructions: 'Test instructions',
      requirements: 'Test requirements',
      requiresCar: false,
      requiresTools: false,
      category: 'test'
    };

    const missionResponse = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(missionData)
      .expect(201);

    testMission = missionResponse.body.mission;
  });

  describe('POST /api/missions', () => {
    it('should create a mission successfully', async () => {
      const missionData = {
        title: 'New Test Mission',
        description: 'This is a new test mission description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 New Test Street, Paris',
        dropLatitude: 48.8584,
        dropLongitude: 2.2945,
        dropAddress: '456 New Test Avenue, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 75,
        cashAdvance: 15,
        priority: 'high',
        instructions: 'New test instructions',
        requirements: 'New test requirements',
        requiresCar: true,
        requiresTools: true,
        category: 'urgent'
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(201);

      expect(response.body.message).toBe('Mission créée avec succès');
      expect(response.body.mission).toBeDefined();
      expect(response.body.mission.title).toBe(missionData.title);
      expect(response.body.mission.description).toBe(missionData.description);
      expect(response.body.mission.status).toBe(MissionStatus.PENDING);
      expect(response.body.mission.clientId).toBe(clientUser.id);
    });

    it('should return 401 when not authenticated', async () => {
      const missionData = {
        title: 'Test Mission',
        description: 'Test description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50
      };

      const response = await request(app)
        .post('/api/missions')
        .send(missionData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 403 when assistant tries to create mission', async () => {
      const missionData = {
        title: 'Test Mission',
        description: 'Test description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${assistantToken}`)
        .send(missionData)
        .expect(403);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Trop court
        description: 'Short', // Trop court
        pickupLatitude: 100, // Valeur invalide
        pickupLongitude: 200, // Valeur invalide
        pickupAddress: '', // Trop court
        timeWindowStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Passé
        timeWindowEnd: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // Avant start
        priceEstimate: -10, // Valeur négative
        priority: 'invalid' // Valeur invalide
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should handle optional fields correctly', async () => {
      const missionData = {
        title: 'Minimal Mission',
        description: 'This is a minimal mission description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Minimal Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        priceEstimate: 50
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(missionData)
        .expect(201);

      expect(response.body.mission).toBeDefined();
      expect(response.body.mission.dropLatitude).toBeUndefined();
      expect(response.body.mission.dropLongitude).toBeUndefined();
      expect(response.body.mission.dropAddress).toBeUndefined();
      expect(response.body.mission.cashAdvance).toBe(0); // Valeur par défaut
      expect(response.body.mission.priority).toBe('medium'); // Valeur par défaut
      expect(response.body.mission.requiresCar).toBe(false); // Valeur par défaut
      expect(response.body.mission.requiresTools).toBe(false); // Valeur par défaut
    });
  });

  describe('GET /api/missions', () => {
    it('should get missions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('missions');
      expect(Array.isArray(response.body.missions)).toBe(true);
      expect(response.body.missions.length).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/missions')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should filter missions by status', async () => {
      const response = await request(app)
        .get('/api/missions?status=pending')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.missions).toBeDefined();
      expect(Array.isArray(response.body.missions)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/missions?page=1&limit=10')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.missions).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/missions/:id', () => {
    it('should get mission by ID', async () => {
      const response = await request(app)
        .get(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('mission');
      expect(response.body.mission.id).toBe(testMission.id);
      expect(response.body.mission.title).toBe(testMission.title);
      expect(response.body.mission.description).toBe(testMission.description);
    });

    it('should return 404 when mission not found', async () => {
      const response = await request(app)
        .get('/api/missions/non-existent-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/missions/${testMission.id}`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/missions/:id/status', () => {
    it('should update mission status successfully', async () => {
      const statusData = {
        status: 'accepted',
        comment: 'Mission accepted by assistant'
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}/status`)
        .set('Authorization', `Bearer ${assistantToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.message).toBe('Statut de la mission mis à jour');
      expect(response.body.mission.status).toBe(statusData.status);
    });

    it('should return 401 when not authenticated', async () => {
      const statusData = {
        status: 'accepted',
        comment: 'Mission accepted'
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}/status`)
        .send(statusData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid status', async () => {
      const invalidData = {
        status: 'invalid_status',
        comment: 'Invalid status'
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}/status`)
        .set('Authorization', `Bearer ${assistantToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toBeDefined();
    });

    it('should return 404 when mission not found', async () => {
      const statusData = {
        status: 'accepted',
        comment: 'Mission accepted'
      };

      const response = await request(app)
        .put('/api/missions/non-existent-id/status')
        .set('Authorization', `Bearer ${assistantToken}`)
        .send(statusData)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/missions/:id', () => {
    it('should update mission successfully', async () => {
      const updateData = {
        title: 'Updated Mission Title',
        description: 'Updated mission description',
        priceEstimate: 75,
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Mission mise à jour avec succès');
      expect(response.body.mission.title).toBe(updateData.title);
      expect(response.body.mission.description).toBe(updateData.description);
      expect(response.body.mission.priceEstimate).toBe(updateData.priceEstimate);
      expect(response.body.mission.priority).toBe(updateData.priority);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 403 when assistant tries to update mission', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${assistantToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Trop court
        priceEstimate: -10, // Valeur négative
        priority: 'invalid' // Valeur invalide
      };

      const response = await request(app)
        .put(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('DELETE /api/missions/:id', () => {
    it('should delete mission successfully', async () => {
      const response = await request(app)
        .delete(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.message).toBe('Mission supprimée avec succès');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/missions/${testMission.id}`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 403 when assistant tries to delete mission', async () => {
      const response = await request(app)
        .delete(`/api/missions/${testMission.id}`)
        .set('Authorization', `Bearer ${assistantToken}`)
        .expect(403);

      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when mission not found', async () => {
      const response = await request(app)
        .delete('/api/missions/non-existent-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/missions/:id/history', () => {
    it('should get mission status history', async () => {
      const response = await request(app)
        .get(`/api/missions/${testMission.id}/history`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/missions/${testMission.id}/history`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when mission not found', async () => {
      const response = await request(app)
        .get('/api/missions/non-existent-id/history')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simuler une erreur de base de données
      const response = await request(app)
        .get('/api/missions/invalid-uuid-format')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    it('should handle validation errors in mission creation', async () => {
      const invalidData = {
        title: 123, // Type invalide
        description: null, // Type invalide
        pickupLatitude: 'not-a-number', // Type invalide
        pickupLongitude: 'not-a-number', // Type invalide
        timeWindowStart: 'invalid-date', // Type invalide
        priceEstimate: 'not-a-number' // Type invalide
      };

      const response = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });
  });
}); 