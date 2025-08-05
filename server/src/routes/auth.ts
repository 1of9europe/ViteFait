import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import {
  validateSignup,
  validateLogin,
  validateRefreshToken,
  validateChangePassword,
  validateRequestPasswordReset,
  validateResetPassword,
  validateUpdateProfile,
} from '../validators/auth';

const router = Router();

/**
 * @route POST /api/auth/signup
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/signup', validateSignup, async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  
  logger.info({ email: req.body.email }, 'Inscription réussie');
  
  res.status(201).json({
    status: 'success',
    data: result
  });
});

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  
  logger.info({ email: req.body.email }, 'Connexion réussie');
  
  res.json({
    status: 'success',
    data: result
  });
});

/**
 * @route POST /api/auth/refresh
 * @desc Rafraîchir un token
 * @access Public
 */
router.post('/refresh', validateRefreshToken, async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  
  logger.info({ userId: result.user.id }, 'Token rafraîchi');
  
  res.json({
    status: 'success',
    data: result
  });
});

/**
 * @route GET /api/auth/me
 * @desc Obtenir le profil de l'utilisateur connecté
 * @access Private
 */
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getProfile(req.user.id);
  
  res.json({
    status: 'success',
    data: { user }
  });
});

/**
 * @route PUT /api/auth/profile
 * @desc Mettre à jour le profil utilisateur
 * @access Private
 */
router.put('/profile', authMiddleware, validateUpdateProfile, async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  
  logger.info({ userId: req.user.id }, 'Profil mis à jour');
  
  res.json({
    status: 'success',
    data: { user }
  });
});

/**
 * @route POST /api/auth/change-password
 * @desc Changer le mot de passe
 * @access Private
 */
router.post('/change-password', authMiddleware, validateChangePassword, async (req: AuthenticatedRequest, res: Response) => {
  await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  
  logger.info({ userId: req.user.id }, 'Mot de passe changé');
  
  res.json({
    status: 'success',
    data: { message: 'Mot de passe changé avec succès' }
  });
});

/**
 * @route POST /api/auth/request-password-reset
 * @desc Demander une réinitialisation de mot de passe
 * @access Public
 */
router.post('/request-password-reset', validateRequestPasswordReset, async (req: Request, res: Response) => {
  await authService.requestPasswordReset(req.body.email);
  
  logger.info({ email: req.body.email }, 'Demande de réinitialisation de mot de passe');
  
  res.json({
    status: 'success',
    data: { message: 'Si l\'email existe, un lien de réinitialisation a été envoyé' }
  });
});

/**
 * @route POST /api/auth/reset-password
 * @desc Réinitialiser le mot de passe
 * @access Public
 */
router.post('/reset-password', validateResetPassword, async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.resetToken, req.body.newPassword);
  
  logger.info({ resetToken: req.body.resetToken }, 'Mot de passe réinitialisé');
  
  res.json({
    status: 'success',
    data: { message: 'Mot de passe réinitialisé avec succès' }
  });
});

/**
 * @route POST /api/auth/logout
 * @desc Déconnexion (côté client)
 * @access Private
 */
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  logger.info({ userId: req.user.id }, 'Déconnexion');
  
  res.json({
    status: 'success',
    data: { message: 'Déconnexion réussie' }
  });
});

export default router; 