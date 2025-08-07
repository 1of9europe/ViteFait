import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

/**
 * Middleware pour valider les données de requête avec un schéma Joi
 */
export const validateSchema = (schema: Joi.Schema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[location];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      const validationError = new ValidationError(
        `Validation failed: ${errorMessages.join(', ')}`,
        'VALIDATION_ERROR'
      );
      return next(validationError);
    }

    // Remplacer les données par les données validées
    req[location] = value;
    next();
  };
};

/**
 * Middleware pour valider les paramètres d'URL
 */
export const validateParams = (schema: Joi.Schema) => {
  return validateSchema(schema, 'params');
};

/**
 * Middleware pour valider les query parameters
 */
export const validateQuery = (schema: Joi.Schema) => {
  return validateSchema(schema, 'query');
};

/**
 * Middleware pour valider le body de la requête
 */
export const validateBody = (schema: Joi.Schema) => {
  return validateSchema(schema, 'body');
};

/**
 * Middleware pour valider les fichiers uploadés
 */
export const validateFile = (options: {
  fieldName: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { fieldName, maxSize = 5 * 1024 * 1024, allowedMimeTypes = [], required = false } = options;
    
    const file = req.file || (req.files && (req.files as any)[fieldName]);
    
    if (required && !file) {
      const error = new ValidationError(`Le fichier '${fieldName}' est requis`, 'FILE_REQUIRED');
      return next(error);
    }
    
    if (file) {
      // Vérifier la taille du fichier
      if (file.size > maxSize) {
        const error = new ValidationError(
          `Le fichier '${fieldName}' est trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)}MB`,
          'FILE_TOO_LARGE'
        );
        return next(error);
      }
      
      // Vérifier le type MIME
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
        const error = new ValidationError(
          `Type de fichier non autorisé pour '${fieldName}'. Types autorisés: ${allowedMimeTypes.join(', ')}`,
          'INVALID_FILE_TYPE'
        );
        return next(error);
      }
    }
    
    next();
  };
};

/**
 * Middleware pour valider les IDs UUID
 */
export const validateUUID = (paramName: string) => {
  const uuidSchema = Joi.object({
    [paramName]: Joi.string().uuid().required().messages({
      'string.guid': `L'ID ${paramName} doit être un UUID valide`,
      'any.required': `L'ID ${paramName} est requis`
    })
  });
  
  return validateParams(uuidSchema);
};

/**
 * Middleware pour valider la pagination
 */
export const validatePagination = () => {
  const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.integer': 'Le numéro de page doit être un entier',
      'number.min': 'Le numéro de page doit être supérieur à 0'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.integer': 'La limite doit être un entier',
      'number.min': 'La limite doit être supérieure à 0',
      'number.max': 'La limite ne peut pas dépasser 100'
    }),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'L\'ordre de tri doit être asc ou desc'
    })
  });
  
  return validateQuery(paginationSchema);
};

/**
 * Middleware pour valider les filtres de recherche
 */
export const validateSearchFilters = (allowedFields: string[]) => {
  const filterSchema = Joi.object({
    search: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Le terme de recherche doit contenir au moins 2 caractères',
      'string.max': 'Le terme de recherche ne peut pas dépasser 100 caractères'
    }),
    filters: Joi.object().pattern(
      Joi.string().valid(...allowedFields),
      Joi.any()
    ).optional().messages({
      'object.unknown': `Filtre non autorisé. Filtres autorisés: ${allowedFields.join(', ')}`
    })
  });
  
  return validateQuery(filterSchema);
};

/**
 * Middleware pour valider les coordonnées géographiques
 */
export const validateCoordinates = () => {
  const coordinatesSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required().messages({
      'number.min': 'La latitude doit être entre -90 et 90',
      'number.max': 'La latitude doit être entre -90 et 90',
      'any.required': 'La latitude est requise'
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
      'number.min': 'La longitude doit être entre -180 et 180',
      'number.max': 'La longitude doit être entre -180 et 180',
      'any.required': 'La longitude est requise'
    }),
    radius: Joi.number().positive().max(50).default(10).messages({
      'number.positive': 'Le rayon doit être positif',
      'number.max': 'Le rayon ne peut pas dépasser 50km'
    })
  });
  
  return validateQuery(coordinatesSchema);
};

/**
 * Middleware pour valider les dates
 */
export const validateDateRange = () => {
  const dateRangeSchema = Joi.object({
    startDate: Joi.date().iso().required().messages({
      'date.format': 'La date de début doit être au format ISO',
      'any.required': 'La date de début est requise'
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'date.format': 'La date de fin doit être au format ISO',
      'date.greater': 'La date de fin doit être après la date de début',
      'any.required': 'La date de fin est requise'
    })
  });
  
  return validateBody(dateRangeSchema);
}; 