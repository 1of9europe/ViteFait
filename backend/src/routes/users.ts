import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

const router = Router();

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  postalCode: Joi.string().max(10).optional(),
  bio: Joi.string().max(500).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  fcmToken: Joi.string().optional()
});

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token d\'authentification requis'
      });
    }

    return res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération du profil'
    });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token d\'authentification requis'
      });
    }

    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map((d: any) => d.message)
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    
    // Mettre à jour le profil
    Object.assign(req.user, value);
    const updatedUser = await userRepository.save(req.user);

    return res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la mise à jour du profil'
    });
  }
});

// Récupérer le profil d'un utilisateur par ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'ID manquant',
        message: 'L\'ID de l\'utilisateur est requis'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la récupération de l\'utilisateur'
    });
  }
});

export { router as userRoutes }; 