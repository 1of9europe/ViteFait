const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'test'
  });
});

// Mock auth routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Tous les champs sont requis'
    });
  }
  
  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user: {
      id: 'test-user-id',
      email,
      firstName,
      lastName,
      role: 'client'
    },
    token: 'test-jwt-token',
    refreshToken: 'test-refresh-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Email et mot de passe requis'
    });
  }
  
  res.status(200).json({
    message: 'Connexion réussie',
    user: {
      id: 'test-user-id',
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'client'
    },
    token: 'test-jwt-token',
    refreshToken: 'test-refresh-token'
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }
  
  res.status(200).json({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'client'
    }
  });
});

// Mock missions routes
app.post('/api/missions', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }
  
  const { title, description, pickupLatitude, pickupLongitude, pickupAddress, timeWindowStart, timeWindowEnd, priceEstimate } = req.body;
  
  if (!title || !description || !pickupLatitude || !pickupLongitude || !pickupAddress || !timeWindowStart || !timeWindowEnd || !priceEstimate) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Tous les champs sont requis'
    });
  }
  
  res.status(201).json({
    message: 'Mission créée avec succès',
    mission: {
      id: 'test-mission-id',
      title,
      description,
      pickupLatitude,
      pickupLongitude,
      pickupAddress,
      timeWindowStart,
      timeWindowEnd,
      priceEstimate,
      status: 'pending',
      clientId: 'test-user-id',
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/missions/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }
  
  const { id } = req.params;
  
  res.status(200).json({
    mission: {
      id,
      title: 'Mission de test',
      description: 'Description de test',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      pickupAddress: '123 Test Street',
      status: 'pending',
      clientId: 'test-user-id',
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/missions', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }
  
  res.status(200).json({
    missions: [
      {
        id: 'test-mission-1',
        title: 'Mission 1',
        description: 'Description 1',
        status: 'pending',
        clientId: 'test-user-id',
        createdAt: new Date().toISOString()
      },
      {
        id: 'test-mission-2',
        title: 'Mission 2',
        description: 'Description 2',
        status: 'accepted',
        clientId: 'test-user-id',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Mock payments routes
app.post('/api/payments/create-intent', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }
  
  const { missionId, amount, currency } = req.body;
  
  if (!missionId || !amount) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Mission ID et montant requis'
    });
  }
  
  res.status(201).json({
    message: 'Intent de paiement créé',
    paymentIntent: {
      id: 'test-payment-intent-id',
      missionId,
      amount,
      currency: currency || 'eur',
      status: 'requires_payment_method',
      clientSecret: 'test-client-secret'
    }
  });
});

app.post('/api/payments/confirm', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }
  
  const { paymentIntentId, missionId } = req.body;
  
  if (!paymentIntentId || !missionId) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Payment Intent ID et Mission ID requis'
    });
  }
  
  res.status(200).json({
    message: 'Paiement confirmé',
    payment: {
      id: 'test-payment-id',
      paymentIntentId,
      missionId,
      status: 'completed',
      amount: 100,
      currency: 'eur'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
});

module.exports = app; 