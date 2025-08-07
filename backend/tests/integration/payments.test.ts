import request from 'supertest';
import { UserRole } from '../../src/types/enums';

// Importer le serveur de test
const app = require('../../test-server');

describe('Payments Routes Integration Tests', () => {
  let clientToken: string;
  let assistantToken: string;
  let clientUser: any;
  let testMission: any;
  let testPayment: any;

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
      timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      priceEstimate: 100
    };

    const missionResponse = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(missionData)
      .expect(201);

    testMission = missionResponse.body.mission;

    // Créer un paiement de test
    const paymentData = {
      missionId: testMission.id,
      amount: 100
    };

    const paymentResponse = await request(app)
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(paymentData)
      .expect(201);

    testPayment = paymentResponse.body.payment;
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create payment intent successfully', async () => {
      const paymentData = {
        missionId: testMission.id,
        amount: 150
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.message).toBe('Intent de paiement créé (mode développement)');
      expect(response.body.payment).toBeDefined();
      expect(response.body.payment.missionId).toBe(paymentData.missionId);
      expect(response.body.payment.amount).toBe(paymentData.amount);
      expect(response.body.payment.clientId).toBe(clientUser.id);
      expect(response.body.payment.status).toBe('pending');
    });

    it('should return 401 when not authenticated', async () => {
      const paymentData = {
        missionId: testMission.id,
        amount: 100
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when missionId is missing', async () => {
      const paymentData = {
        amount: 100
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBe('Données manquantes');
      expect(response.body.message).toBe('Mission ID et montant sont requis');
    });

    it('should return 400 when amount is missing', async () => {
      const paymentData = {
        missionId: testMission.id
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBe('Données manquantes');
      expect(response.body.message).toBe('Mission ID et montant sont requis');
    });

    it('should return 400 when amount is negative', async () => {
      const paymentData = {
        missionId: testMission.id,
        amount: -50
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when mission does not exist', async () => {
      const paymentData = {
        missionId: 'non-existent-mission-id',
        amount: 100
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentData)
        .expect(404);

      expect(response.body.error).toBe('Mission non trouvée');
      expect(response.body.message).toBe('La mission spécifiée n\'existe pas');
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('should confirm payment successfully', async () => {
      const confirmData = {
        paymentIntentId: testPayment.id,
        missionId: testMission.id
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(200);

      expect(response.body.message).toBe('Paiement confirmé (mode développement)');
      expect(response.body.payment).toBeDefined();
      expect(response.body.payment.id).toBe(testPayment.id);
      expect(response.body.payment.status).toBe('completed');
    });

    it('should return 401 when not authenticated', async () => {
      const confirmData = {
        paymentIntentId: testPayment.id,
        missionId: testMission.id
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when paymentIntentId is missing', async () => {
      const confirmData = {
        missionId: testMission.id
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(400);

      expect(response.body.error).toBe('Données manquantes');
      expect(response.body.message).toBe('Payment Intent ID et Mission ID sont requis');
    });

    it('should return 400 when missionId is missing', async () => {
      const confirmData = {
        paymentIntentId: testPayment.id
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(400);

      expect(response.body.error).toBe('Données manquantes');
      expect(response.body.message).toBe('Payment Intent ID et Mission ID sont requis');
    });

    it('should return 404 when payment does not exist', async () => {
      const confirmData = {
        paymentIntentId: 'non-existent-payment-id',
        missionId: testMission.id
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(404);

      expect(response.body.error).toBe('Paiement non trouvé');
      expect(response.body.message).toBe('Le paiement spécifié n\'existe pas');
    });

    it('should return 400 when payment is already completed', async () => {
      // Confirmer le paiement une première fois
      const confirmData = {
        paymentIntentId: testPayment.id,
        missionId: testMission.id
      };

      await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(200);

      // Essayer de confirmer à nouveau
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(400);

      expect(response.body.error).toBe('Paiement déjà confirmé');
      expect(response.body.message).toBe('Ce paiement a déjà été confirmé');
    });
  });

  describe('GET /api/payments', () => {
    it('should get payments for authenticated user', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('payments');
      expect(Array.isArray(response.body.payments)).toBe(true);
      expect(response.body.payments.length).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/payments')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/payments?status=pending')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.payments).toBeDefined();
      expect(Array.isArray(response.body.payments)).toBe(true);
    });

    it('should filter payments by mission ID', async () => {
      const response = await request(app)
        .get(`/api/payments?missionId=${testMission.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.payments).toBeDefined();
      expect(Array.isArray(response.body.payments)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/payments?page=1&limit=10')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.payments).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should get payment by ID', async () => {
      const response = await request(app)
        .get(`/api/payments/${testPayment.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment.id).toBe(testPayment.id);
      expect(response.body.payment.missionId).toBe(testPayment.missionId);
      expect(response.body.payment.amount).toBe(testPayment.amount);
    });

    it('should return 404 when payment not found', async () => {
      const response = await request(app)
        .get('/api/payments/non-existent-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/payments/${testPayment.id}`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 403 when user is not the payer', async () => {
      const response = await request(app)
        .get(`/api/payments/${testPayment.id}`)
        .set('Authorization', `Bearer ${assistantToken}`)
        .expect(403);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should refund payment successfully', async () => {
      // D'abord confirmer le paiement
      const confirmData = {
        paymentIntentId: testPayment.id,
        missionId: testMission.id
      };

      await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(200);

      // Ensuite demander un remboursement
      const refundData = {
        paymentId: testPayment.id,
        reason: 'Mission annulée par le client'
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(refundData)
        .expect(200);

      expect(response.body.message).toBe('Demande de remboursement créée (mode développement)');
      expect(response.body.refund).toBeDefined();
      expect(response.body.refund.paymentId).toBe(testPayment.id);
      expect(response.body.refund.status).toBe('pending');
    });

    it('should return 401 when not authenticated', async () => {
      const refundData = {
        paymentId: testPayment.id,
        reason: 'Test refund'
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .send(refundData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when paymentId is missing', async () => {
      const refundData = {
        reason: 'Test refund'
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(refundData)
        .expect(400);

      expect(response.body.error).toBe('Données manquantes');
      expect(response.body.message).toBe('Payment ID et raison sont requis');
    });

    it('should return 400 when reason is missing', async () => {
      const refundData = {
        paymentId: testPayment.id
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(refundData)
        .expect(400);

      expect(response.body.error).toBe('Données manquantes');
      expect(response.body.message).toBe('Payment ID et raison sont requis');
    });

    it('should return 400 when payment is not completed', async () => {
      const refundData = {
        paymentId: testPayment.id,
        reason: 'Test refund'
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(refundData)
        .expect(400);

      expect(response.body.error).toBe('Paiement non éligible au remboursement');
      expect(response.body.message).toBe('Seuls les paiements confirmés peuvent être remboursés');
    });

    it('should return 404 when payment does not exist', async () => {
      const refundData = {
        paymentId: 'non-existent-payment-id',
        reason: 'Test refund'
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(refundData)
        .expect(404);

      expect(response.body.error).toBe('Paiement non trouvé');
      expect(response.body.message).toBe('Le paiement spécifié n\'existe pas');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simuler une erreur de base de données
      const response = await request(app)
        .get('/api/payments/invalid-uuid-format')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    it('should handle validation errors in payment creation', async () => {
      const invalidData = {
        missionId: 123, // Type invalide
        amount: 'not-a-number' // Type invalide
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
}); 