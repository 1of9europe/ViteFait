import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';
import { UserRole } from '../types/enums';

// Schémas de validation
export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'any.required': 'L\'email est requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le mot de passe est requis',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
    'any.required': 'Le prénom est requis',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères',
    'any.required': 'Le nom est requis',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
    'any.only': 'Le rôle doit être client ou assistant',
  }),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Format de numéro de téléphone invalide',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'any.required': 'L\'email est requis',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Le mot de passe est requis',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Le token de rafraîchissement est requis',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Le mot de passe actuel est requis',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le nouveau mot de passe est requis',
  }),
});

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'any.required': 'L\'email est requis',
  }),
});

export const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required().messages({
    'any.required': 'Le token de réinitialisation est requis',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le nouveau mot de passe est requis',
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères',
  }),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Format de numéro de téléphone invalide',
  }),
  avatar: Joi.string().uri().optional().messages({
    'string.uri': 'L\'URL de l\'avatar doit être valide',
  }),
  metadata: Joi.object({
    preferredLanguages: Joi.array().items(Joi.string()).optional(),
    timezone: Joi.string().optional(),
    notificationPreferences: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
    }).optional(),
    preferredMissionTypes: Joi.array().items(Joi.string()).optional(),
    preferredWorkingHours: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      days: Joi.array().items(Joi.number().min(0).max(6)).required(),
    }).optional(),
  }).optional(),
});

// Middlewares de validation
export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = signupSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Données d\'inscription invalides');
  }
  
  req.body = value;
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = loginSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Données de connexion invalides');
  }
  
  req.body = value;
  next();
};

export const validateRefreshToken = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = refreshTokenSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Token de rafraîchissement invalide');
  }
  
  req.body = value;
  next();
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = changePasswordSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Données de changement de mot de passe invalides');
  }
  
  req.body = value;
  next();
};

export const validateRequestPasswordReset = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = requestPasswordResetSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Email invalide');
  }
  
  req.body = value;
  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = resetPasswordSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Données de réinitialisation invalides');
  }
  
  req.body = value;
  next();
};

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = updateProfileSchema.validate(req.body);
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new BadRequestError('VALIDATION_ERROR', 'Données de profil invalides');
  }
  
  req.body = value;
  next();
}; 