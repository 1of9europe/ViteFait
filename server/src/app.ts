import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { initializeDatabase } from './config/database';
import { authRoutes } from './routes/auth';
import { missionRoutes } from './routes/missions';
import { userRoutes } from './routes/users';
import { paymentRoutes } from './routes/payments';
import { reviewRoutes } from './routes/reviews';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { socketHandler } from './services/socketHandler';

// Charger les variables d'environnement
dotenv.config();

// Vérification des secrets JWT obligatoires
if (!process.env['JWT_SECRET'] || !process.env['JWT_REFRESH_SECRET']) {
  console.error('❌ Les variables JWT_SECRET et JWT_REFRESH_SECRET doivent être définies');
  process.exit(1);
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
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
      description: 'API pour l\'application de micro-missions à la demande',
    },
    servers: [
      {
        url: `http://localhost:${process.env['PORT'] || 3000}`,
        description: 'Serveur de développement',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limite par IP
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware de parsing
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV']
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/missions', authMiddleware, missionRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/reviews', authMiddleware, reviewRoutes);

// Gestion des erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Configuration Socket.IO
socketHandler(io);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialiser la base de données
    await initializeDatabase();
    
    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

// Démarrer le serveur
startServer();

export default app; 