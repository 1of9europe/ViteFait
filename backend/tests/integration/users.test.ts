import request from 'supertest';
import { UserRole } from '../../src/types/enums';

// Importer le serveur de test
const app = require('../../test-server');

describe('Users Routes Integration Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    // Réinitialiser les données avant chaque test
    await request(app).post('/reset');

    // Créer un utilisateur de test et obtenir un token
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '0123456789',
      role: UserRole.CLIENT
    };

    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(userData)
      .expect(201);

    authToken = signupResponse.body.token;
    testUser = signupResponse.body.user;
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.firstName).toBe(testUser.firstName);
      expect(response.body.user.lastName).toBe(testUser.lastName);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.error).toBe('Non authentifié');
      expect(response.body.message).toBe('Token d\'authentification requis');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        bio: 'Test bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profil mis à jour avec succès');
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
      expect(response.body.user.phone).toBe(updateData.phone);
      expect(response.body.user.address).toBe(updateData.address);
      expect(response.body.user.city).toBe(updateData.city);
      expect(response.body.user.postalCode).toBe(updateData.postalCode);
      expect(response.body.user.bio).toBe(updateData.bio);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBe('Non authentifié');
      expect(response.body.message).toBe('Token d\'authentification requis');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        firstName: '', // Trop court
        lastName: 'A'.repeat(101), // Trop long
        latitude: 100, // Valeur invalide
        longitude: 200 // Valeur invalide
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should update only provided fields', async () => {
      const updateData = {
        firstName: 'Jane'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(testUser.lastName); // Inchangé
      expect(response.body.user.email).toBe(testUser.email); // Inchangé
    });

    it('should handle location coordinates', async () => {
      const updateData = {
        latitude: 48.8566,
        longitude: 2.3522
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.latitude).toBe(updateData.latitude);
      expect(response.body.user.longitude).toBe(updateData.longitude);
    });

    it('should handle FCM token update', async () => {
      const updateData = {
        fcmToken: 'test-fcm-token-123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.fcmToken).toBe(updateData.fcmToken);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user profile by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.firstName).toBe(testUser.firstName);
      expect(response.body.user.lastName).toBe(testUser.lastName);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe(testUser.role);
      expect(response.body.user.createdAt).toBeDefined();
    });

    it('should return 400 when ID is missing', async () => {
      // Test avec un ID vide
      const response2 = await request(app)
        .get('/api/users/ ')
        .expect(400);

      expect(response2.body.error).toBe('ID manquant');
      expect(response2.body.message).toBe('L\'ID de l\'utilisateur est requis');
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
      expect(response.body.message).toBe('Aucun utilisateur trouvé avec cet ID');
    });

    it('should only return public user information', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .expect(200);

      const user = response.body.user;
      
      // Vérifier que les champs sensibles ne sont pas exposés
      expect(user.password).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();
      expect(user.refreshToken).toBeUndefined();
      
      // Vérifier que les champs publics sont présents
      expect(user.id).toBeDefined();
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simuler une erreur de base de données en utilisant un ID malformé
      const response = await request(app)
        .get('/api/users/invalid-uuid-format')
        .expect(500);

      expect(response.body.error).toBe('Erreur interne du serveur');
      expect(response.body.message).toBeDefined();
    });

    it('should handle validation errors in profile update', async () => {
      const invalidData = {
        firstName: 123, // Type invalide
        lastName: null, // Type invalide
        phone: {}, // Type invalide
        latitude: 'not-a-number', // Type invalide
        longitude: 'not-a-number' // Type invalide
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });
}); 