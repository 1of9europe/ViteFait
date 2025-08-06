import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/models/User';
import { Mission } from '../../src/models/Mission';
import { Payment } from '../../src/models/Payment';
import { PaymentStatus } from '../../src/types/enums';
import { stripeService } from '../../src/services/StripeService';
import app from '../../src/app';

// Mock Stripe
jest.mock('../../src/services/StripeService');

describe('Payments API', () => {
  let client: User;
  let assistant: User;
  let mission: Mission;
  let authToken: string;

  beforeAll(async () => {
    await AppDataSource.initialize();
    
    // Créer des utilisateurs de test
    const userRepository = AppDataSource.getRepository(User);
    const missionRepository = AppDataSource.getRepository(Mission);

    client = userRepository.create({
      email: 'client@test.com',
      password: 'hashedpassword',
      firstName: 'Client',
      lastName: 'Test',
      phone: '+33123456789',
      role: 'CLIENT'
    });
    await userRepository.save(client);

    assistant = userRepository.create({
      email: 'assistant@test.com',
      password: 'hashedpassword',
      firstName: 'Assistant',
      lastName: 'Test',
      phone: '+33987654321',
      role: 'ASSISTANT'
    });
    await userRepository.save(assistant);

    mission = missionRepository.create({
      title: 'Mission de test',
      description: 'Description de test',
      category: 'Test',
      latitude: 48.8566,
      longitude: 2.3522,
      address: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      budget: 100,
      deadline: new Date(Date.now() + 86400000), // +1 jour
      client,
      assistant,
      status: 'ASSIGNED'
    });
    await missionRepository.save(mission);

    // Authentifier le client
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'client@test.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Nettoyer les paiements de test
    const paymentRepository = AppDataSource.getRepository(Payment);
    await paymentRepository.delete({});
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create a payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_secret_123',
        status: 'requires_payment_method'
      };

      (stripeService.createPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          missionId: mission.id,
          amount: 100,
          currency: 'eur',
          description: 'Test payment'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('clientSecret', 'pi_test_secret_123');
      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should return 404 for non-existent mission', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          missionId: 'non-existent-id',
          amount: 100
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Mission non trouvée');
    });

    it('should return 400 for mission not assigned', async () => {
      // Créer une mission non assignée
      const missionRepository = AppDataSource.getRepository(Mission);
      const unassignedMission = missionRepository.create({
        title: 'Mission non assignée',
        description: 'Description',
        category: 'Test',
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Test Street',
        city: 'Paris',
        postalCode: '75001',
        budget: 100,
        deadline: new Date(Date.now() + 86400000),
        client,
        status: 'PENDING'
      });
      await missionRepository.save(unassignedMission);

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          missionId: unassignedMission.id,
          amount: 100
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'La mission doit être assignée pour effectuer un paiement');
    });

    it('should return 400 for existing pending payment', async () => {
      // Créer un paiement en attente
      const paymentRepository = AppDataSource.getRepository(Payment);
      const existingPayment = paymentRepository.create({
        mission,
        client,
        assistant,
        amount: 100,
        currency: 'eur',
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: 'pi_existing_123'
      });
      await paymentRepository.save(existingPayment);

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          missionId: mission.id,
          amount: 100
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Un paiement est déjà en cours pour cette mission');
    });
  });

  describe('POST /api/payments/confirm', () => {
    let payment: Payment;

    beforeEach(async () => {
      // Créer un paiement de test
      const paymentRepository = AppDataSource.getRepository(Payment);
      payment = paymentRepository.create({
        mission,
        client,
        assistant,
        amount: 100,
        currency: 'eur',
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: 'pi_test_confirm_123'
      });
      await paymentRepository.save(payment);
    });

    it('should confirm payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_confirm_123',
        status: 'succeeded',
        latest_charge: 'ch_test_123'
      };

      (stripeService.retrievePaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentIntentId: 'pi_test_confirm_123',
          missionId: mission.id
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Paiement confirmé avec succès');
      expect(response.body.payment.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should return 400 for failed payment', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_confirm_123',
        status: 'requires_payment_method'
      };

      (stripeService.retrievePaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentIntentId: 'pi_test_confirm_123',
          missionId: mission.id
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Le paiement nécessite une méthode de paiement');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentIntentId: 'non-existent-pi',
          missionId: mission.id
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Paiement non trouvé');
    });
  });

  describe('GET /api/payments/mission/:missionId', () => {
    it('should return payments for mission', async () => {
      // Créer des paiements de test
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment1 = paymentRepository.create({
        mission,
        client,
        assistant,
        amount: 100,
        currency: 'eur',
        status: PaymentStatus.COMPLETED
      });
      const payment2 = paymentRepository.create({
        mission,
        client,
        assistant,
        amount: 50,
        currency: 'eur',
        status: PaymentStatus.PENDING
      });
      await paymentRepository.save([payment1, payment2]);

      const response = await request(app)
        .get(`/api/payments/mission/${mission.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('payments');
      expect(response.body.payments).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should return 404 for non-existent mission', async () => {
      const response = await request(app)
        .get('/api/payments/mission/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Mission non trouvée');
    });
  });

  describe('POST /api/payments/cancel/:paymentIntentId', () => {
    let payment: Payment;

    beforeEach(async () => {
      // Créer un paiement en attente
      const paymentRepository = AppDataSource.getRepository(Payment);
      payment = paymentRepository.create({
        mission,
        client,
        assistant,
        amount: 100,
        currency: 'eur',
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: 'pi_test_cancel_123'
      });
      await paymentRepository.save(payment);
    });

    it('should cancel payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_cancel_123',
        status: 'canceled'
      };

      (stripeService.cancelPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const response = await request(app)
        .post('/api/payments/cancel/pi_test_cancel_123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Paiement annulé avec succès');
      expect(response.body.payment.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .post('/api/payments/cancel/non-existent-pi')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Paiement non trouvé');
    });
  });
}); 