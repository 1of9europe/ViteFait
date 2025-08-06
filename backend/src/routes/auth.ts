import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../types/enums';
import { authService } from '../services/AuthService';

const router = Router();

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
router.post('/signup', async (req: Request, res: Response, next) => {
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
    const options: SignOptions = { expiresIn: '7d' };

    const token = jwt.sign(payload, process.env['JWT_SECRET']!, options);

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    return next(error);
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
router.post('/login', async (req: Request, res: Response, next) => {
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
    const options: SignOptions = { expiresIn: '7d' };

    const token = jwt.sign(payload, process.env['JWT_SECRET']!, options);

    return res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    return next(error);
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
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return res.json(result);
  } catch (error) {
    return next(error);
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

    const userProfile = await authService.getProfile(req.user.id);
    return res.json({ user: userProfile });
  } catch (error) {
    return next(error);
  }
});

export { router as authRoutes }; 