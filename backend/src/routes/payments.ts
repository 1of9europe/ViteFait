import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Payment, PaymentType } from '../models/Payment';
import { PaymentStatus } from '../types/enums';
import { Mission } from '../models/Mission';
import { requireClient } from '../middleware/auth';

const router = Router();

// Créer un intent de paiement
router.post('/create-intent', requireClient, async (req: Request, res: Response) => {
  try {
    const { missionId, amount } = req.body;

    if (!missionId || !amount) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Mission ID et montant sont requis'
      });
    }

    // En mode développement sans base de données, simuler un intent de paiement
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockPayment = {
        id: `pi_${Date.now()}`,
        missionId,
        amount,
        status: 'pending',
        clientId: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.status(201).json({
        message: 'Intent de paiement créé (mode développement)',
        payment: mockPayment
      });
    }

    // Vérifier que la mission existe
    const missionRepository = AppDataSource.getRepository(Mission);
    const mission = await missionRepository.findOne({
      where: { id: missionId }
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission spécifiée n\'existe pas'
      });
    }

    // Créer le paiement
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payment = paymentRepository.create({
      missionId,
      amount,
      type: PaymentType.ESCROW,
      status: PaymentStatus.PENDING,
      payerId: req.user!.id,
      description: `Paiement pour la mission: ${mission.title}`
    });

    const savedPayment = await paymentRepository.save(payment);

    return res.status(201).json({
      message: 'Intent de paiement créé',
      payment: savedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'intent de paiement:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer l\'intent de paiement'
    });
  }
});

// Confirmer un paiement
router.post('/confirm', requireClient, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, missionId } = req.body;

    if (!paymentIntentId || !missionId) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Payment Intent ID et Mission ID sont requis'
      });
    }

    // En mode développement sans base de données, simuler une confirmation
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockPayment = {
        id: paymentIntentId,
        missionId,
        amount: 100,
        status: 'completed',
        clientId: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        processedAt: new Date()
      };

      return res.status(200).json({
        message: 'Paiement confirmé avec succès (mode développement)',
        payment: mockPayment
      });
    }

    // Vérifier que le paiement existe
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payment = await paymentRepository.findOne({
      where: { id: paymentIntentId }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Paiement non trouvé',
        message: 'Le paiement spécifié n\'existe pas'
      });
    }

    // Mettre à jour le statut du paiement
    payment.status = PaymentStatus.COMPLETED;
    payment.processedAt = new Date();
    await paymentRepository.save(payment);

    return res.status(200).json({
      message: 'Paiement confirmé avec succès',
      payment
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de confirmer le paiement'
    });
  }
});

// Récupérer l'historique des paiements
router.get('/history', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token d\'authentification requis'
      });
    }

    const paymentRepository = AppDataSource.getRepository(Payment);
    const payments = await paymentRepository.find({
      where: { payerId: req.user.id },
      order: { createdAt: 'DESC' }
    });

    return res.json({
      payments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer l\'historique des paiements'
    });
  }
});

export { router as paymentRoutes }; 