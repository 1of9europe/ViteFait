import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../types/enums';
import { authMiddleware } from '../middleware/auth';

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

    // Validation basique
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email, mot de passe, prénom et nom sont requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // En mode développement sans base de données, simuler une inscription réussie
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone: phone || '',
        role: role || 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      };
      const options: SignOptions = { expiresIn: '7d' };
      const token = jwt.sign(payload, process.env['JWT_SECRET']!, options);

      return res.status(201).json({
        message: 'Utilisateur créé avec succès (mode développement)',
        user: mockUser,
        token
      });
    }

    // Code normal avec base de données
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

    // Validation basique
    if (!email || !password) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email et mot de passe sont requis'
      });
    }

    // En mode développement sans base de données, simuler une connexion réussie
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      // Simuler une connexion réussie pour test@example.com
      if (email === 'test@example.com' && password === 'password123') {
        const mockUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'client',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const payload = {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        };
        const options: SignOptions = { expiresIn: '7d' };
        const token = jwt.sign(payload, process.env['JWT_SECRET']!, options);

        return res.json({
          message: 'Connexion réussie (mode développement)',
          user: mockUser,
          token
        });
      } else {
        return res.status(401).json({
          error: 'Identifiants invalides',
          message: 'Email ou mot de passe incorrect'
        });
      }
    }

    // Code normal avec base de données
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
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token manquant',
        message: 'Le refresh token est requis'
      });
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env['JWT_REFRESH_SECRET']!) as any;
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive()) {
      return res.status(401).json({
        error: 'Refresh token invalide',
        message: 'Le refresh token est invalide ou expiré'
      });
    }

    // Générer un nouveau token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    const options: SignOptions = { expiresIn: '7d' };
    const newToken = jwt.sign(payload, process.env['JWT_SECRET']!, options);

    return res.json({
      message: 'Token rafraîchi avec succès',
      token: newToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Refresh token invalide',
      message: 'Le refresh token est invalide ou expiré'
    });
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
router.get('/me', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token d\'authentification requis'
      });
    }

    // En mode développement sans base de données, retourner les données du token
    if (process.env['NODE_ENV'] === 'development' && process.env['DB_IN_MEMORY'] === 'true') {
      const mockUser = {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName || 'Test',
        lastName: req.user.lastName || 'User',
        role: req.user.role || 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.json({
        user: mockUser
      });
    }

    return res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    return next(error);
  }
});

export { router as authRoutes }; 