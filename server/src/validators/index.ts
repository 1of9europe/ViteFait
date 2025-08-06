import Joi from 'joi';

// Schémas d'authentification
export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'L\'email doit être valide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le mot de passe est requis'
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 100 caractères',
    'any.required': 'Le prénom est requis'
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères',
    'any.required': 'Le nom est requis'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional().messages({
    'string.pattern.base': 'Le numéro de téléphone doit être valide'
  }),
  role: Joi.string().valid('client', 'assistant').default('client').messages({
    'any.only': 'Le rôle doit être client ou assistant'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'L\'email doit être valide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Le mot de passe est requis'
  })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Le token de rafraîchissement est requis'
  })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Le mot de passe actuel est requis'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le nouveau mot de passe est requis'
  })
});

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'L\'email doit être valide',
    'any.required': 'L\'email est requis'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Le token de réinitialisation est requis'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le nouveau mot de passe est requis'
  })
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 100 caractères'
  }),
  lastName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional().messages({
    'string.pattern.base': 'Le numéro de téléphone doit être valide'
  }),
  bio: Joi.string().max(500).optional().messages({
    'string.max': 'La bio ne peut pas dépasser 500 caractères'
  }),
  address: Joi.string().max(255).optional().messages({
    'string.max': 'L\'adresse ne peut pas dépasser 255 caractères'
  }),
  city: Joi.string().max(100).optional().messages({
    'string.max': 'La ville ne peut pas dépasser 100 caractères'
  }),
  postalCode: Joi.string().max(10).optional().messages({
    'string.max': 'Le code postal ne peut pas dépasser 10 caractères'
  })
});

// Schémas de missions
export const createMissionSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Le titre doit contenir au moins 5 caractères',
    'string.max': 'Le titre ne peut pas dépasser 200 caractères',
    'any.required': 'Le titre est requis'
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'La description doit contenir au moins 10 caractères',
    'string.max': 'La description ne peut pas dépasser 1000 caractères',
    'any.required': 'La description est requise'
  }),
  pickupLatitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'La latitude doit être entre -90 et 90',
    'number.max': 'La latitude doit être entre -90 et 90',
    'any.required': 'La latitude de récupération est requise'
  }),
  pickupLongitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'La longitude doit être entre -180 et 180',
    'number.max': 'La longitude doit être entre -180 et 180',
    'any.required': 'La longitude de récupération est requise'
  }),
  pickupAddress: Joi.string().max(255).required().messages({
    'string.max': 'L\'adresse de récupération ne peut pas dépasser 255 caractères',
    'any.required': 'L\'adresse de récupération est requise'
  }),
  dropLatitude: Joi.number().min(-90).max(90).optional().messages({
    'number.min': 'La latitude doit être entre -90 et 90',
    'number.max': 'La latitude doit être entre -90 et 90'
  }),
  dropLongitude: Joi.number().min(-180).max(180).optional().messages({
    'number.min': 'La longitude doit être entre -180 et 180',
    'number.max': 'La longitude doit être entre -180 et 180'
  }),
  dropAddress: Joi.string().max(255).optional().messages({
    'string.max': 'L\'adresse de livraison ne peut pas dépasser 255 caractères'
  }),
  timeWindowStart: Joi.date().greater('now').required().messages({
    'date.greater': 'La fenêtre de temps doit commencer dans le futur',
    'any.required': 'Le début de la fenêtre de temps est requis'
  }),
  timeWindowEnd: Joi.date().greater(Joi.ref('timeWindowStart')).required().messages({
    'date.greater': 'La fin de la fenêtre de temps doit être après le début',
    'any.required': 'La fin de la fenêtre de temps est requise'
  }),
  priceEstimate: Joi.number().positive().required().messages({
    'number.positive': 'L\'estimation de prix doit être positive',
    'any.required': 'L\'estimation de prix est requise'
  }),
  cashAdvance: Joi.number().min(0).optional().messages({
    'number.min': 'L\'avance en espèces ne peut pas être négative'
  }),
  instructions: Joi.string().max(500).optional().messages({
    'string.max': 'Les instructions ne peuvent pas dépasser 500 caractères'
  }),
  requirements: Joi.string().max(500).optional().messages({
    'string.max': 'Les exigences ne peuvent pas dépasser 500 caractères'
  }),
  requiresCar: Joi.boolean().default(false),
  requiresTools: Joi.boolean().default(false),
  category: Joi.string().max(100).optional().messages({
    'string.max': 'La catégorie ne peut pas dépasser 100 caractères'
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium').messages({
    'any.only': 'La priorité doit être low, medium, high ou urgent'
  })
});

export const updateMissionSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'Le titre doit contenir au moins 5 caractères',
    'string.max': 'Le titre ne peut pas dépasser 200 caractères'
  }),
  description: Joi.string().min(10).max(1000).optional().messages({
    'string.min': 'La description doit contenir au moins 10 caractères',
    'string.max': 'La description ne peut pas dépasser 1000 caractères'
  }),
  instructions: Joi.string().max(500).optional().messages({
    'string.max': 'Les instructions ne peuvent pas dépasser 500 caractères'
  }),
  requirements: Joi.string().max(500).optional().messages({
    'string.max': 'Les exigences ne peuvent pas dépasser 500 caractères'
  }),
  priceEstimate: Joi.number().positive().optional().messages({
    'number.positive': 'L\'estimation de prix doit être positive'
  }),
  cashAdvance: Joi.number().min(0).optional().messages({
    'number.min': 'L\'avance en espèces ne peut pas être négative'
  })
});

// Schémas de paiements
export const createPaymentIntentSchema = Joi.object({
  missionId: Joi.string().uuid().required().messages({
    'string.guid': 'L\'ID de mission doit être un UUID valide',
    'any.required': 'L\'ID de mission est requis'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Le montant doit être positif',
    'any.required': 'Le montant est requis'
  }),
  currency: Joi.string().length(3).default('EUR').messages({
    'string.length': 'La devise doit contenir 3 caractères'
  })
});

export const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required().messages({
    'any.required': 'L\'ID du payment intent est requis'
  }),
  missionId: Joi.string().uuid().required().messages({
    'string.guid': 'L\'ID de mission doit être un UUID valide',
    'any.required': 'L\'ID de mission est requis'
  })
});

// Schémas d'avis
export const createReviewSchema = Joi.object({
  missionId: Joi.string().uuid().required().messages({
    'string.guid': 'L\'ID de mission doit être un UUID valide',
    'any.required': 'L\'ID de mission est requis'
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.integer': 'La note doit être un entier',
    'number.min': 'La note doit être entre 1 et 5',
    'number.max': 'La note doit être entre 1 et 5',
    'any.required': 'La note est requise'
  }),
  comment: Joi.string().max(500).optional().messages({
    'string.max': 'Le commentaire ne peut pas dépasser 500 caractères'
  }),
  isPublic: Joi.boolean().default(true)
});

// Schémas d'utilisateurs
export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 100 caractères'
  }),
  lastName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional().messages({
    'string.pattern.base': 'Le numéro de téléphone doit être valide'
  }),
  bio: Joi.string().max(500).optional().messages({
    'string.max': 'La bio ne peut pas dépasser 500 caractères'
  }),
  address: Joi.string().max(255).optional().messages({
    'string.max': 'L\'adresse ne peut pas dépasser 255 caractères'
  }),
  city: Joi.string().max(100).optional().messages({
    'string.max': 'La ville ne peut pas dépasser 100 caractères'
  }),
  postalCode: Joi.string().max(10).optional().messages({
    'string.max': 'Le code postal ne peut pas dépasser 10 caractères'
  }),
  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.min': 'La latitude doit être entre -90 et 90',
    'number.max': 'La latitude doit être entre -90 et 90'
  }),
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.min': 'La longitude doit être entre -180 et 180',
    'number.max': 'La longitude doit être entre -180 et 180'
  })
});

// Export des schémas groupés
export const authSchemas = {
  signup: signupSchema,
  login: loginSchema,
  refresh: refreshTokenSchema,
  changePassword: changePasswordSchema,
  requestPasswordReset: requestPasswordResetSchema,
  resetPassword: resetPasswordSchema,
  updateProfile: updateProfileSchema
};

export const missionSchemas = {
  create: createMissionSchema,
  update: updateMissionSchema
};

export const paymentSchemas = {
  createIntent: createPaymentIntentSchema,
  confirm: confirmPaymentSchema
};

export const reviewSchemas = {
  create: createReviewSchema
};

export const userSchemas = {
  update: updateUserSchema
}; 