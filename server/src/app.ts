import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { AppDataSource } from './config/database';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import missionRoutes from './routes/missions';
import userRoutes from './routes/users';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';

// Socket handler
import { setupSocketHandler } from './services/socketHandler';

const app = express();
const server = createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.server.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Conciergerie Urbaine API',
      version: '1.0.0',
      description: 'API pour l\'application de conciergerie urbaine',
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.server.rateLimitWindowMs,
  max: config.server.rateLimitMax,
  message: {
    status: 'error',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes, veuillez réessayer plus tard',
    },
  },
});
app.use('/api/', limiter);

// Middleware de parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging des requêtes
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }, 'Requête entrante');
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Service opérationnel',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

// Route 404
app.use('*', notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Configuration Socket.IO
setupSocketHandler(io);

// Initialisation de la base de données et démarrage du serveur
async function startServer() {
  try {
    // Initialiser la connexion à la base de données
    await AppDataSource.initialize();
    logger.info('Connexion à la base de données établie');

    // Démarrer le serveur
    server.listen(config.server.port, () => {
      logger.info(`Serveur démarré sur le port ${config.server.port}`);
      logger.info(`Documentation disponible sur http://localhost:${config.server.port}/api-docs`);
    });
  } catch (error) {
    logger.error({ error }, 'Erreur lors du démarrage du serveur');
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  logger.info('Arrêt du serveur...');
  server.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Arrêt du serveur...');
  server.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

// Démarrer le serveur
startServer();

export default app; 