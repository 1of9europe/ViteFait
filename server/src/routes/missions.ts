import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AppDataSource } from '../config/database';
import { Mission, MissionStatus, MissionPriority } from '../models/Mission';
import { MissionStatusHistory } from '../models/MissionStatusHistory';
import { User } from '../models/User';
import { requireClient, requireAssistant } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Schémas de validation
const createMissionSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  pickupLatitude: Joi.number().min(-90).max(90).required(),
  pickupLongitude: Joi.number().min(-180).max(180).required(),
  pickupAddress: Joi.string().min(5).max(255).required(),
  dropLatitude: Joi.number().min(-90).max(90).optional(),
  dropLongitude: Joi.number().min(-180).max(180).optional(),
  dropAddress: Joi.string().min(5).max(255).optional(),
  timeWindowStart: Joi.date().greater('now').required(),
  timeWindowEnd: Joi.date().greater(Joi.ref('timeWindowStart')).required(),
  priceEstimate: Joi.number().positive().max(10000).required(),
  cashAdvance: Joi.number().min(0).max(1000).default(0),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  instructions: Joi.string().max(500).optional(),
  requirements: Joi.string().max(500).optional(),
  requiresCar: Joi.boolean().default(false),
  requiresTools: Joi.boolean().default(false),
  category: Joi.string().max(100).optional()
});

const updateMissionStatusSchema = Joi.object({
  status: Joi.string().valid('accepted', 'in_progress', 'completed', 'cancelled').required(),
  comment: Joi.string().max(500).optional()
});

/**
 * @swagger
 * /api/missions:
 *   post:
 *     summary: Créer une nouvelle mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - pickupLatitude
 *               - pickupLongitude
 *               - pickupAddress
 *               - timeWindowStart
 *               - timeWindowEnd
 *               - priceEstimate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pickupLatitude:
 *                 type: number
 *               pickupLongitude:
 *                 type: number
 *               pickupAddress:
 *                 type: string
 *               dropLatitude:
 *                 type: number
 *               dropLongitude:
 *                 type: number
 *               dropAddress:
 *                 type: string
 *               timeWindowStart:
 *                 type: string
 *                 format: date-time
 *               timeWindowEnd:
 *                 type: string
 *                 format: date-time
 *               priceEstimate:
 *                 type: number
 *               cashAdvance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Mission créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', requireClient, async (req: Request, res: Response) => {
  try {
    const { error, value } = createMissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map((d: any) => d.message)
      });
    }

    const missionRepository = AppDataSource.getRepository(Mission);
    const statusHistoryRepository = AppDataSource.getRepository(MissionStatusHistory);

    // Créer la mission
    const mission = missionRepository.create({
      ...value,
      clientId: req.user!.id,
      finalPrice: value.priceEstimate,
      commissionAmount: value.priceEstimate * 0.10 // 10% de commission
    });

    const savedMission = await missionRepository.save(mission);

    // Créer l'historique de statut initial
    const statusHistory = statusHistoryRepository.create({
      missionId: savedMission.id,
      status: MissionStatus.PENDING,
      changedByUserId: req.user!.id,
      comment: 'Mission créée'
    });

    await statusHistoryRepository.save(statusHistory);

    res.status(201).json({
      message: 'Mission créée avec succès',
      mission: savedMission
    });
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la création de la mission'
    });
  }
});

/**
 * @swagger
 * /api/missions:
 *   get:
 *     summary: Récupérer les missions (géolocalisées ou par utilisateur)
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude pour la recherche géolocalisée
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude pour la recherche géolocalisée
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Rayon de recherche en mètres (défaut: 5000)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrer par statut
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Nombre maximum de résultats (défaut: 20)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: Offset pour la pagination (défaut: 0)
 *     responses:
 *       200:
 *         description: Liste des missions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lng,
      radius = 5000,
      status,
      limit = 20,
      offset = 0,
      myMissions
    } = req.query;

    const missionRepository = AppDataSource.getRepository(Mission);
    let query = missionRepository.createQueryBuilder('mission')
      .leftJoinAndSelect('mission.client', 'client')
      .leftJoinAndSelect('mission.assistant', 'assistant')
      .orderBy('mission.createdAt', 'DESC');

    // Filtrer par utilisateur connecté
    if (myMissions === 'true' && req.user) {
      if (req.user.isClient()) {
        query = query.where('mission.clientId = :userId', { userId: req.user.id });
      } else if (req.user.isAssistant()) {
        query = query.where('mission.assistantId = :userId', { userId: req.user.id });
      }
    }

    // Recherche géolocalisée
    if (lat && lng) {
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusNum = parseFloat(radius as string);

      query = query.where(`
        ST_DWithin(
          ST_MakePoint(mission.pickupLongitude, mission.pickupLatitude)::geography,
          ST_MakePoint(:lng, :lat)::geography,
          :radius
        )
      `, { lat: latNum, lng: lngNum, radius: radiusNum });
    }

    // Filtrer par statut
    if (status) {
      query = query.andWhere('mission.status = :status', { status });
    }

    // Pagination
    query = query.limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const missions = await query.getMany();

    res.json({
      missions,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: missions.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération des missions'
    });
  }
});

/**
 * @swagger
 * /api/missions/{id}:
 *   get:
 *     summary: Récupérer une mission par ID
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Détails de la mission
 *       404:
 *         description: Mission non trouvée
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const missionRepository = AppDataSource.getRepository(Mission);
    const mission = await missionRepository.findOne({
      where: { id },
      relations: ['client', 'assistant', 'statusHistory', 'reviews']
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission demandée n\'existe pas'
      });
    }

    res.json({ mission });
  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération de la mission'
    });
  }
});

/**
 * @swagger
 * /api/missions/{id}/accept:
 *   post:
 *     summary: Accepter une mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Mission acceptée avec succès
 *       400:
 *         description: Mission non disponible
 *       403:
 *         description: Accès refusé
 */
router.post('/:id/accept', requireAssistant, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const missionRepository = AppDataSource.getRepository(Mission);
    const statusHistoryRepository = AppDataSource.getRepository(MissionStatusHistory);

    const mission = await missionRepository.findOne({
      where: { id },
      relations: ['client']
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission demandée n\'existe pas'
      });
    }

    if (!mission.canBeAccepted()) {
      return res.status(400).json({
        error: 'Mission non disponible',
        message: 'Cette mission ne peut plus être acceptée'
      });
    }

    // Mettre à jour la mission
    mission.status = MissionStatus.ACCEPTED;
    mission.assistantId = req.user!.id;
    mission.acceptedAt = new Date();

    await missionRepository.save(mission);

    // Créer l'historique de statut
    const statusHistory = statusHistoryRepository.create({
      missionId: mission.id,
      status: MissionStatus.ACCEPTED,
      changedByUserId: req.user!.id,
      comment: 'Mission acceptée'
    });

    await statusHistoryRepository.save(statusHistory);

    res.json({
      message: 'Mission acceptée avec succès',
      mission
    });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de la mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de l\'acceptation de la mission'
    });
  }
});

/**
 * @swagger
 * /api/missions/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'une mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, in_progress, completed, cancelled]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *       400:
 *         description: Transition de statut invalide
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateMissionStatusSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map((d: any) => d.message)
      });
    }

    const { status, comment } = value;

    const missionRepository = AppDataSource.getRepository(Mission);
    const statusHistoryRepository = AppDataSource.getRepository(MissionStatusHistory);

    const mission = await missionRepository.findOne({
      where: { id },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      return res.status(404).json({
        error: 'Mission non trouvée',
        message: 'La mission demandée n\'existe pas'
      });
    }

    // Vérifier les permissions
    const canUpdateStatus = 
      (req.user!.id === mission.clientId) || 
      (req.user!.id === mission.assistantId);

    if (!canUpdateStatus) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour modifier cette mission'
      });
    }

    // Mettre à jour le statut et les timestamps
    mission.status = status as MissionStatus;
    
    switch (status) {
      case 'in_progress':
        mission.startedAt = new Date();
        break;
      case 'completed':
        mission.completedAt = new Date();
        break;
      case 'cancelled':
        mission.cancelledAt = new Date();
        break;
    }

    await missionRepository.save(mission);

    // Créer l'historique de statut
    const statusHistory = statusHistoryRepository.create({
      missionId: mission.id,
      status: status as MissionStatus,
      changedByUserId: req.user!.id,
      comment
    });

    await statusHistoryRepository.save(statusHistory);

    res.json({
      message: 'Statut mis à jour avec succès',
      mission
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la mise à jour du statut'
    });
  }
});

export { router as missionRoutes }; 