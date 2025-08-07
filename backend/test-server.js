const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock data - utilisateurs dynamiques
let users = [];
let missions = [];
let payments = [];

// Fonction pour réinitialiser les données
const resetData = () => {
  users = [];
  missions = [];
  payments = [];
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'test'
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Validation basique
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: 'Données invalides',
      details: ['Tous les champs sont requis']
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Données invalides',
      details: ['Le mot de passe doit contenir au moins 6 caractères']
    });
  }

  // Vérifier si l'email existe déjà
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Un utilisateur avec cet email existe déjà'
      }
    });
  }

  // Simuler une inscription réussie
  const user = {
    id: `user-${Date.now()}`,
    email,
    firstName,
    lastName,
    role: role || 'CLIENT'
  };

  // Ajouter l'utilisateur aux données mockées
  users.push(user);

  res.status(201).json({
    message: 'Inscription réussie',
    user,
    token: 'test-jwt-token',
    refreshToken: 'test-refresh-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Chercher l'utilisateur dans les données mockées
  const user = users.find(u => u.email === email);
  
  if (user && password === 'password123') {
    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token: 'test-jwt-token',
      refreshToken: 'test-refresh-token'
    });
  } else {
    // Pour les autres identifiants, retourner une erreur
    res.status(401).json({
      error: 'Identifiants invalides',
      message: 'Email ou mot de passe incorrect'
    });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh token manquant',
      message: 'Le refresh token est requis'
    });
  }

  if (refreshToken === '') {
    return res.status(400).json({
      error: 'Refresh token vide',
      message: 'Le refresh token ne peut pas être vide'
    });
  }

  if (refreshToken === 'valid-refresh-token') {
    res.status(200).json({
      message: 'Token rafraîchi avec succès',
      token: 'new-jwt-token',
      refreshToken: 'new-refresh-token'
    });
  } else {
    res.status(401).json({
      error: 'Refresh token invalide',
      message: 'Le refresh token est invalide ou expiré'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }

  const token = authHeader.substring(7);

  if (token === 'valid-token') {
    res.status(200).json({
      message: 'Profil récupéré avec succès',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT'
      }
    });
  } else {
    res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide ou expiré'
    });
  }
});

// Routes pour les missions
app.post('/api/missions', (req, res) => {
  const { title, description, pickupLatitude, pickupLongitude, pickupAddress, timeWindowStart, timeWindowEnd, priceEstimate } = req.body;

  // Validation basique
  if (!title || !description || !pickupLatitude || !pickupLongitude || !pickupAddress || !timeWindowStart || !timeWindowEnd || !priceEstimate) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Tous les champs sont requis'
    });
  }

  const mission = {
    id: `mission-${Date.now()}`,
    title,
    description,
    pickupLatitude,
    pickupLongitude,
    pickupAddress,
    timeWindowStart,
    timeWindowEnd,
    priceEstimate,
    status: 'PENDING',
    clientId: 'test-user-id',
    createdAt: new Date().toISOString()
  };

  missions.push(mission);

  res.status(201).json({
    message: 'Mission créée avec succès',
    mission
  });
});

app.get('/api/missions/:id', (req, res) => {
  const { id } = req.params;
  const mission = missions.find(m => m.id === id);

  if (!mission) {
    return res.status(404).json({
      error: 'Mission non trouvée',
      message: 'La mission demandée n\'existe pas'
    });
  }

  res.status(200).json({
    mission
  });
});

app.get('/api/missions', (req, res) => {
  res.status(200).json({
    missions,
    total: missions.length
  });
});

// Routes pour les paiements
app.post('/api/payments/create-intent', (req, res) => {
  const { missionId, amount } = req.body;

  if (!missionId || !amount) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Mission ID et montant sont requis'
    });
  }

  const paymentIntent = {
    id: `pi_${Date.now()}`,
    missionId,
    amount,
    status: 'requires_payment_method',
    client_secret: 'pi_test_secret',
    createdAt: new Date().toISOString()
  };

  payments.push(paymentIntent);

  res.status(201).json({
    message: 'Intent de paiement créé',
    paymentIntent
  });
});

app.post('/api/payments/confirm', (req, res) => {
  const { paymentIntentId, missionId } = req.body;

  if (!paymentIntentId || !missionId) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Payment Intent ID et Mission ID sont requis'
    });
  }

  const payment = payments.find(p => p.id === paymentIntentId);
  if (!payment) {
    return res.status(404).json({
      error: 'Paiement non trouvé',
      message: 'Le paiement demandé n\'existe pas'
    });
  }

  payment.status = 'succeeded';
  payment.confirmedAt = new Date().toISOString();

  res.status(200).json({
    message: 'Paiement confirmé avec succès',
    payment
  });
});

// Route pour réinitialiser les données (pour les tests)
app.post('/reset', (req, res) => {
  resetData();
  res.json({ message: 'Données réinitialisées' });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur de test démarré sur http://localhost:${PORT}`);
    console.log(`📊 Endpoints disponibles:`);
    console.log(`   GET  /health`);
    console.log(`   POST /api/auth/signup`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/refresh`);
    console.log(`   GET  /api/auth/me`);
    console.log(`   POST /api/missions`);
    console.log(`   GET  /api/missions`);
    console.log(`   GET  /api/missions/:id`);
    console.log(`   POST /api/payments/create-intent`);
    console.log(`   POST /api/payments/confirm`);
    console.log(`   POST /reset`);
  });
}

module.exports = app; 