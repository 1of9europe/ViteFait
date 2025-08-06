import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Mission } from '../models/Mission';
import { Payment, PaymentType, PaymentStatus } from '../models/Payment';
import { requireClient, requireAssistant } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/payments/create-intent:
 *   post:
 *     summary: Créer un PaymentIntent pour une mission
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *             properties:
 *               missionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: PaymentIntent créé avec succès
 *       400:
 *         description: Mission invalide
 */
router.post('/create-intent', requireClient, async (req: Request, res: Response) => {
  try {
    const { missionId } = req.body;

    if (!missionId) {
      return res.status(400).json({
        error: 'Mission ID requis',
        message: 'L\'ID de la mission est obligatoire'
      });
    }

    const missionRepository = AppDataSource.getRepository(Mission);
    const paymentRepository = AppDataSource.getRepository(Payment);

    const mission = await missionRepository.findOne({
      where: { id: missionId, clientId: req.user!.id }
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission demandée n\'existe pas ou ne vous appartient pas'
      });
    }

    if (mission.stripePaymentIntentId) {
      return res.status(400).json({
        error: 'Paiement déjà initié',
        message: 'Un paiement a déjà été initié pour cette mission'
      });
    }

    // Créer le paiement en base
    const payment = paymentRepository.create({
      missionId: mission.id,
      amount: mission.getTotalAmount(),
      type: PaymentType.ESCROW,
      status: PaymentStatus.PENDING,
      payerId: req.user!.id,
      description: `Paiement pour la mission: ${mission.title}`
    });

    await paymentRepository.save(payment);

    // TODO: Intégrer Stripe pour créer le PaymentIntent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: payment.getAmountInCents(),
    //   currency: 'eur',
    //   metadata: {
    //     paymentId: payment.id,
    //     missionId: mission.id
    //   }
    // });

    // payment.stripePaymentIntentId = paymentIntent.id;
    // await paymentRepository.save(payment);

    res.json({
      message: 'PaymentIntent créé avec succès',
      payment: payment.toJSON(),
      // clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la création du paiement'
    });
  }
});

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Confirmer un paiement
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paiement confirmé avec succès
 */
router.post('/confirm', requireClient, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentRepository = AppDataSource.getRepository(Payment);
    const missionRepository = AppDataSource.getRepository(Mission);

    const payment = await paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId, payerId: req.user!.id },
      relations: ['mission']
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Paiement non trouvé',
        message: 'Le paiement demandé n\'existe pas'
      });
    }

    // TODO: Confirmer le paiement avec Stripe
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // if (paymentIntent.status === 'succeeded') {
    //   payment.status = PaymentStatus.COMPLETED;
    //   payment.processedAt = new Date();
    //   await paymentRepository.save(payment);

    //   // Mettre à jour la mission
    //   payment.mission.stripePaymentIntentId = paymentIntentId;
    //   await missionRepository.save(payment.mission);
    // }

    res.json({
      message: 'Paiement confirmé avec succès',
      payment: payment.toJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la confirmation du paiement'
    });
  }
});

/**
 * @swagger
 * /api/payments/mission/{missionId}:
 *   get:
 *     summary: Récupérer les paiements d'une mission
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/mission/:missionId', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const paymentRepository = AppDataSource.getRepository(Payment);
    const missionRepository = AppDataSource.getRepository(Mission);

    const mission = await missionRepository.findOne({
      where: { id: missionId }
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission demandée n\'existe pas'
      });
    }

    // Vérifier les permissions
    const canViewPayments = 
      (req.user!.id === mission.clientId) || 
      (req.user!.id === mission.assistantId);

    if (!canViewPayments) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour voir les paiements de cette mission'
      });
    }

    const payments = await paymentRepository.find({
      where: { missionId },
      relations: ['payer', 'payee'],
      order: { createdAt: 'DESC' }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération des paiements'
    });
  }
});

export { router as paymentRoutes }; 