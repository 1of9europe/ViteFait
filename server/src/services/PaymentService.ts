import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus, PaymentType } from '../models/Payment';
import { Mission } from '../models/Mission';
import { User } from '../models/User';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/errorHandler';
import Stripe from 'stripe';

export interface CreatePaymentIntentData {
  missionId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface PaymentWebhookData {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: string;
  payment_method_types: string[];
  metadata?: Record<string, string>;
}

export class PaymentService {
  private paymentRepository: Repository<Payment>;
  private missionRepository: Repository<Mission>;
  private userRepository: Repository<User>;
  private stripe: Stripe;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.missionRepository = AppDataSource.getRepository(Mission);
    this.userRepository = AppDataSource.getRepository(User);
    
    this.stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
      apiVersion: '2023-10-16'
    });
  }

  /**
   * Créer un PaymentIntent Stripe
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<{ paymentIntent: Stripe.PaymentIntent; payment: Payment }> {
    // Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id: data.missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    // Vérifier que la mission n'a pas déjà un paiement en cours
    const existingPayment = await this.paymentRepository.findOne({
      where: { missionId: data.missionId, status: PaymentStatus.PENDING }
    });

    if (existingPayment) {
      throw new BadRequestError('PAYMENT_ALREADY_EXISTS', 'Un paiement est déjà en cours pour cette mission');
    }

    // Créer le PaymentIntent Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Stripe utilise les centimes
      currency: data.currency || 'EUR',
      description: data.description || `Paiement pour la mission: ${mission.title}`,
      metadata: {
        missionId: data.missionId,
        clientId: mission.clientId,
        assistantId: mission.assistantId || ''
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // Créer l'enregistrement de paiement en base
    const payment = new Payment();
    payment.missionId = data.missionId;
    payment.payerId = mission.clientId;
    payment.payeeId = mission.assistantId || mission.clientId; // Si pas d'assistant, le client paie à lui-même
    payment.amount = data.amount;
    payment.currency = data.currency || 'EUR';
    payment.status = PaymentStatus.PENDING;
    payment.type = PaymentType.ESCROW;
    payment.stripePaymentIntentId = paymentIntent.id;
    payment.metadata = {
      stripePaymentIntentId: paymentIntent.id,
      description: data.description || `Paiement pour la mission: ${mission.title}`
    };

    const savedPayment = await this.paymentRepository.save(payment);

    return { paymentIntent, payment: savedPayment };
  }

  /**
   * Confirmer un paiement
   */
  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId }
    });

    if (!payment) {
      throw new NotFoundError('PAYMENT_NOT_FOUND', 'Paiement non trouvé');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestError('INVALID_STATUS', 'Le paiement n\'est pas en attente');
    }

    // Vérifier le statut avec Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.status = PaymentStatus.COMPLETED;
      payment.metadata = {
        ...payment.metadata,
        confirmedAt: new Date().toISOString(),
        stripeStatus: paymentIntent.status
      };
    } else if (paymentIntent.status === 'canceled') {
      payment.status = PaymentStatus.CANCELLED;
      payment.metadata = {
        ...payment.metadata,
        cancelledAt: new Date().toISOString(),
        stripeStatus: paymentIntent.status
      };
    } else {
      throw new BadRequestError('PAYMENT_NOT_READY', 'Le paiement n\'est pas encore confirmé');
    }

    return this.paymentRepository.save(payment);
  }

  /**
   * Traiter un webhook Stripe
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        // Ignorer les autres événements
        break;
    }
  }

  /**
   * Gérer un paiement réussi
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      throw new NotFoundError('PAYMENT_NOT_FOUND', 'Paiement non trouvé');
    }

    // Mettre à jour le statut du paiement
    payment.status = PaymentStatus.COMPLETED;
    payment.metadata = {
      ...payment.metadata,
      succeededAt: new Date().toISOString(),
      stripeStatus: paymentIntent.status
    };

    await this.paymentRepository.save(payment);

    // Mettre à jour la mission
    const mission = await this.missionRepository.findOne({
      where: { id: payment.missionId }
    });

    if (mission) {
      mission.stripePaymentIntentId = paymentIntent.id;
      await this.missionRepository.save(mission);
    }

    // TODO: Envoyer une notification au client et à l'assistant
  }

  /**
   * Gérer un paiement échoué
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      throw new NotFoundError('PAYMENT_NOT_FOUND', 'Paiement non trouvé');
    }

    payment.status = PaymentStatus.FAILED;
    payment.metadata = {
      ...payment.metadata,
      failedAt: new Date().toISOString(),
      stripeStatus: paymentIntent.status,
      failureReason: paymentIntent.last_payment_error?.message || 'Paiement échoué'
    };

    await this.paymentRepository.save(payment);

    // TODO: Envoyer une notification d'échec au client
  }

  /**
   * Gérer un paiement annulé
   */
  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      throw new NotFoundError('PAYMENT_NOT_FOUND', 'Paiement non trouvé');
    }

    payment.status = PaymentStatus.CANCELLED;
    payment.metadata = {
      ...payment.metadata,
      cancelledAt: new Date().toISOString(),
      stripeStatus: paymentIntent.status
    };

    await this.paymentRepository.save(payment);
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(paymentId: string, userId: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['mission']
    });

    if (!payment) {
      throw new NotFoundError('PAYMENT_NOT_FOUND', 'Paiement non trouvé');
    }

    // Vérifier les autorisations (seul le client ou l'assistant peut demander un remboursement)
    if (payment.payerId !== userId && payment.payeeId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à rembourser ce paiement');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestError('INVALID_STATUS', 'Seuls les paiements complétés peuvent être remboursés');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestError('INVALID_PAYMENT', 'Paiement Stripe non trouvé');
    }

    // Créer le remboursement Stripe
    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        reason: reason || 'Remboursement demandé',
        refundedBy: userId
      }
    });

    // Créer un nouveau paiement pour le remboursement
    const refundPayment = new Payment();
    refundPayment.missionId = payment.missionId;
    refundPayment.payerId = payment.payeeId || '';
    refundPayment.payeeId = payment.payerId || '';
    refundPayment.amount = payment.amount;
    refundPayment.currency = payment.currency;
    refundPayment.status = PaymentStatus.COMPLETED;
    refundPayment.type = PaymentType.REFUND;
    refundPayment.stripePaymentIntentId = refund.id;
    refundPayment.metadata = {
      originalPaymentId: payment.id,
      refundId: refund.id,
      reason: reason || 'Remboursement demandé',
      refundedBy: userId
    };

    return this.paymentRepository.save(refundPayment);
  }

  /**
   * Obtenir les paiements d'une mission
   */
  async getMissionPayments(missionId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { missionId },
      relations: ['payer', 'payee'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtenir les paiements d'un utilisateur
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: [
        { payerId: userId },
        { payeeId: userId }
      ],
      relations: ['mission', 'payer', 'payee'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtenir un paiement par ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['mission', 'payer', 'payee']
    });

    if (!payment) {
      throw new NotFoundError('PAYMENT_NOT_FOUND', 'Paiement non trouvé');
    }

    return payment;
  }

  /**
   * Vérifier la signature du webhook Stripe
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env['STRIPE_WEBHOOK_SECRET'] || ''
      );
    } catch (error) {
      throw new BadRequestError('INVALID_SIGNATURE', 'Signature webhook invalide');
    }
  }
}

export const paymentService = new PaymentService(); 