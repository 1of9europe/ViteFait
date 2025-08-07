import request from 'supertest';
import { UserRole } from '../../src/types/enums';

// Importer le serveur de test
const app = require('../../test-server');

describe('Auth Routes Integration Tests', () => {
  beforeEach(async () => {
    // Réinitialiser les données avant chaque test
    await request(app).post('/reset');
  });

  describe('POST /api/auth/signup', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '0123456789',
      role: UserRole.CLIENT
    };

    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(signupData.email);
      expect(response.body.user.firstName).toBe(signupData.firstName);
      expect(response.body.user.lastName).toBe(signupData.lastName);
    });

    it('should return 409 if email already exists', async () => {
      // Créer un premier utilisateur
      await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      // Essayer de créer un second utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(409);

      expect(response.body.error).toHaveProperty('code', 'EMAIL_ALREADY_EXISTS');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Trop court
        firstName: '',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT
    };

    beforeEach(async () => {
      // Créer un utilisateur pour les tests de login
      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'valid-refresh-token'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when refreshToken is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when refreshToken is empty', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: ''
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });
}); 