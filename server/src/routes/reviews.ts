import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AppDataSource } from '../config/database';
import { Review } from '../models/Review';
import { Mission, MissionStatus } from '../models/Mission';
import { User } from '../models/User';

const router = Router();

// Schéma de validation pour la création d'une évaluation
const createReviewSchema = Joi.object({
  missionId: Joi.string().uuid().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
  isPublic: Joi.boolean().default(true)
});

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Créer une évaluation pour une mission
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               missionId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Évaluation créée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Mission non terminée ou déjà évaluée
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map((d: any) => d.message)
      });
    }

    const { missionId, rating, comment, isPublic } = value;

    const missionRepository = AppDataSource.getRepository(Mission);
    const reviewRepository = AppDataSource.getRepository(Review);
    const userRepository = AppDataSource.getRepository(User);

    // Vérifier que la mission existe et est terminée
    const mission = await missionRepository.findOne({
      where: { id: missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission demandée n\'existe pas'
      });
    }

    if (mission.status !== MissionStatus.COMPLETED) {
      return res.status(403).json({
        error: 'Mission non terminée',
        message: 'Vous ne pouvez évaluer que les missions terminées'
      });
    }

    // Vérifier que l'utilisateur a participé à la mission
    const isClient = req.user!.id === mission.clientId;
    const isAssistant = req.user!.id === mission.assistantId;

    if (!isClient && !isAssistant) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas participé à cette mission'
      });
    }

    // Déterminer qui est évalué
    const reviewedUserId = isClient ? mission.assistantId! : mission.clientId;

    // Vérifier qu'une évaluation n'existe pas déjà
    const existingReview = await reviewRepository.findOne({
      where: {
        missionId,
        reviewerId: req.user!.id
      }
    });

    if (existingReview) {
      return res.status(400).json({
        error: 'Évaluation déjà existante',
        message: 'Vous avez déjà évalué cette mission'
      });
    }

    // Créer l'évaluation
    const review = reviewRepository.create({
      missionId,
      reviewerId: req.user!.id,
      reviewedId: reviewedUserId,
      rating,
      comment,
      isPublic
    });

    const savedReview = await reviewRepository.save(review);

    // Mettre à jour la note moyenne de l'utilisateur évalué
    const reviewedUser = await userRepository.findOne({
      where: { id: reviewedUserId }
    });

    if (reviewedUser) {
      const userReviews = await reviewRepository.find({
        where: { reviewedId: reviewedUserId, isPublic: true }
      });

      const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
      reviewedUser.rating = totalRating / userReviews.length;
      reviewedUser.reviewCount = userReviews.length;

      await userRepository.save(reviewedUser);
    }

    res.status(201).json({
      message: 'Évaluation créée avec succès',
      review: savedReview
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la création de l\'évaluation'
    });
  }
});

/**
 * @swagger
 * /api/reviews/mission/{missionId}:
 *   get:
 *     summary: Récupérer les évaluations d'une mission
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Liste des évaluations
 *       404:
 *         description: Mission non trouvée
 */
router.get('/mission/:missionId', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const missionRepository = AppDataSource.getRepository(Mission);
    const reviewRepository = AppDataSource.getRepository(Review);

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
    const canViewReviews = 
      (req.user!.id === mission.clientId) || 
      (req.user!.id === mission.assistantId);

    if (!canViewReviews) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour voir les évaluations de cette mission'
      });
    }

    const reviews = await reviewRepository.find({
      where: { missionId },
      relations: ['reviewer', 'reviewed'],
      order: { createdAt: 'DESC' }
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération des évaluations'
    });
  }
});

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Récupérer les évaluations d'un utilisateur
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Nombre maximum de résultats (défaut: 10)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: Offset pour la pagination (défaut: 0)
 *     responses:
 *       200:
 *         description: Liste des évaluations
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const userRepository = AppDataSource.getRepository(User);
    const reviewRepository = AppDataSource.getRepository(Review);

    const user = await userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    const reviews = await reviewRepository.find({
      where: { reviewedId: userId, isPublic: true },
      relations: ['reviewer', 'mission'],
      order: { createdAt: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await reviewRepository.count({
      where: { reviewedId: userId, isPublic: true }
    });

    res.json({
      reviews,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération des évaluations'
    });
  }
});

export { router as reviewRoutes }; 