import { Router, Request, Response } from 'express';
import Joi from 'joi';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { authService } from '../services/AuthService';
import { validateSignup, validateLogin, validateRefreshToken } from '../validators/auth';

const router = Router();

// Schémas de validation (gardés pour compatibilité)
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('client', 'assistant').default('client')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [client, assistant]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/signup', validateSignup, async (req: Request, res: Response, next) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Vérifier si l'email existe déjà
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const user = userRepository.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      role: role as UserRole
    });

    await userRepository.save(user);

    // Générer le token JWT
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    const options: SignOptions = { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' };

    const token = jwt.sign(payload, process.env['JWT_SECRET']!, options);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', validateLogin, async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    // Rechercher l'utilisateur
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le statut du compte
    if (!user.isActive()) {
      return res.status(403).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été suspendu ou désactivé'
      });
    }

    // Mettre à jour lastSeen
    user.lastSeen = new Date();
    await userRepository.save(user);

    // Générer le token JWT
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    const options: SignOptions = { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' };

    const token = jwt.sign(payload, process.env['JWT_SECRET']!, options);

    res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *       401:
 *         description: Token de rafraîchissement invalide
 */
router.post('/refresh', validateRefreshToken, async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/me', async (req: Request, res: Response, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token d\'authentification requis'
      });
    }

    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes }; 