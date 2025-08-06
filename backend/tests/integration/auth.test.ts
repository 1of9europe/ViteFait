import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/models/User';
import { UserRole } from '../../src/types/enums';

describe('Auth Routes Integration Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Nettoyer la base de données
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.clear();
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
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Créer un utilisateur et obtenir un refresh token
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.CLIENT
        })
        .expect(201);

      refreshToken = signupResponse.body.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.token).not.toBe(refreshToken);
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should return 400 when refreshToken is missing', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);
    });

    it('should return 400 when refreshToken is empty', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' })
        .expect(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
    let user: User;

    beforeEach(async () => {
      // Créer un utilisateur et obtenir un token
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.CLIENT
        })
        .expect(201);

      authToken = signupResponse.body.token;
      user = signupResponse.body.user;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
}); 