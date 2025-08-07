import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AppDataSource } from '../config/database';
import { Mission } from '../models/Mission';
import { MissionStatus } from '../types/enums';
import { MissionStatusHistory } from '../models/MissionStatusHistory';
import { requireClient, requireAssistant } from '../middleware/auth';

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

// Créer une nouvelle mission
router.post('/', requireClient, async (req: Request, res: Response) => {
  try {
    // En mode développement sans base de données, simuler une création réussie
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockMission = {
        id: `mission-${Date.now()}`,
        title: req.body.title || 'Mission test',
        description: req.body.description || 'Description test',
        status: 'pending',
        clientId: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.status(201).json({
        message: 'Mission créée avec succès (mode développement)',
        mission: mockMission
      });
    }

    const { error, value } = createMissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map((d: any) => d.message)
      });
    }

    const missionRepository = AppDataSource.getRepository(Mission);
    const statusHistoryRepository = AppDataSource.getRepository(MissionStatusHistory);

    const mission = new Mission();
    Object.assign(mission, {
      ...value,
      clientId: req.user!.id,
      status: MissionStatus.PENDING
    });

    const savedMission = await missionRepository.save(mission) as Mission;

    // Créer l'historique de statut initial
    const statusHistory = new MissionStatusHistory();
    statusHistory.missionId = savedMission.id;
    statusHistory.status = MissionStatus.PENDING;
    statusHistory.changedByUserId = req.user!.id;
    statusHistory.comment = 'Mission créée';
    await statusHistoryRepository.save(statusHistory);

    return res.status(201).json({
      message: 'Mission créée avec succès',
      mission: savedMission
    });
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer la mission'
    });
  }
});

// Récupérer les missions
router.get('/', async (req: Request, res: Response) => {
  try {
    // En mode développement sans base de données, simuler une liste de missions
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockMissions = [
        {
          id: 'test-mission-id',
          title: 'Mission test',
          description: 'Description test',
          status: 'pending',
          clientId: 'test-user-id',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return res.json({
        missions: mockMissions,
        total: mockMissions.length,
        limit: 20,
        offset: 0
      });
    }

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

    return res.json({
      missions,
      total: missions.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération des missions'
    });
  }
});

// Récupérer une mission par ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'ID manquant',
        message: 'L\'ID de la mission est requis'
      });
    }

    // En mode développement sans base de données, simuler une mission
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockMission = {
        id: id,
        title: 'Mission test',
        description: 'Description test',
        status: 'pending',
        clientId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.json({
        mission: mockMission
      });
    }

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

    return res.json({ mission });
  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération de la mission'
    });
  }
});

// Accepter une mission
router.post('/:id/accept', requireAssistant, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'ID manquant',
        message: 'L\'ID de la mission est requis'
      });
    }

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
    const statusHistory = new MissionStatusHistory();
    statusHistory.missionId = mission.id;
    statusHistory.status = MissionStatus.ACCEPTED;
    statusHistory.changedByUserId = req.user!.id;
    statusHistory.comment = 'Mission acceptée';
    await statusHistoryRepository.save(statusHistory);

    return res.json({
      message: 'Mission acceptée avec succès',
      mission
    });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de la mission:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de l\'acceptation de la mission'
    });
  }
});

// Mettre à jour le statut d'une mission
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'ID manquant',
        message: 'L\'ID de la mission est requis'
      });
    }
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
    if (req.user) {
      if (req.user.isClient() && mission.clientId !== req.user.id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous n\'avez pas les permissions pour modifier cette mission'
        });
      }
      if (req.user.isAssistant() && mission.assistantId !== req.user.id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous n\'avez pas les permissions pour modifier cette mission'
        });
      }
    }

    // Mettre à jour le statut
    mission.status = status as MissionStatus;
    await missionRepository.save(mission);

    // Créer l'historique de statut
    const statusHistory = new MissionStatusHistory();
    statusHistory.missionId = mission.id;
    statusHistory.status = status as MissionStatus;
    statusHistory.changedByUserId = req.user!.id;
    statusHistory.comment = comment;
    await statusHistoryRepository.save(statusHistory);

    return res.json({
      message: 'Statut mis à jour avec succès',
      mission
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la mise à jour du statut'
    });
  }
});

export { router as missionRoutes }; 