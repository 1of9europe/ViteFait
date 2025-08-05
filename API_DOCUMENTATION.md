# Documentation API - Conciergerie Urbaine

## Vue d'ensemble

L'API Conciergerie Urbaine est une API RESTful construite avec Node.js, Express et TypeScript. Elle gère l'authentification, les missions, les paiements et les évaluations pour l'application mobile.

## Base URL

- **Développement** : `http://localhost:3000/api`
- **Production** : `https://api.conciergerie-urbaine.com/api`

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête `Authorization` :

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentification

#### POST /auth/signup
Inscription d'un nouvel utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33123456789",
  "role": "client"
}
```

**Réponse :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Connexion d'un utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client"
  },
  "token": "jwt-token"
}
```

#### GET /auth/me
Récupérer le profil de l'utilisateur connecté.

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Réponse :**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client",
    "rating": 4.5,
    "reviewCount": 10
  }
}
```

### Missions

#### POST /missions
Créer une nouvelle mission (Client uniquement).

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Body :**
```json
{
  "title": "Course au supermarché",
  "description": "Acheter des produits alimentaires",
  "pickupLatitude": 48.8566,
  "pickupLongitude": 2.3522,
  "pickupAddress": "123 Rue de la Paix, Paris",
  "dropLatitude": 48.8584,
  "dropLongitude": 2.2945,
  "dropAddress": "456 Avenue des Champs, Paris",
  "timeWindowStart": "2024-01-01T14:00:00.000Z",
  "timeWindowEnd": "2024-01-01T16:00:00.000Z",
  "priceEstimate": 25.00,
  "cashAdvance": 50.00,
  "priority": "medium",
  "instructions": "Préférer les produits bio",
  "requiresCar": false,
  "requiresTools": false,
  "category": "courses"
}
```

#### GET /missions
Récupérer les missions avec filtres.

**Query Parameters :**
- `lat` : Latitude pour la recherche géolocalisée
- `lng` : Longitude pour la recherche géolocalisée
- `radius` : Rayon de recherche en mètres (défaut: 5000)
- `status` : Filtrer par statut
- `limit` : Nombre maximum de résultats (défaut: 20)
- `offset` : Offset pour la pagination (défaut: 0)
- `myMissions` : Récupérer uniquement les missions de l'utilisateur

**Exemple :**
```
GET /missions?lat=48.8566&lng=2.3522&radius=5000&status=pending&limit=10
```

#### GET /missions/:id
Récupérer une mission par ID.

#### POST /missions/:id/accept
Accepter une mission (Assistant uniquement).

#### PATCH /missions/:id/status
Mettre à jour le statut d'une mission.

**Body :**
```json
{
  "status": "in_progress",
  "comment": "Début de la mission"
}
```

### Utilisateurs

#### GET /users/profile
Récupérer le profil de l'utilisateur connecté.

#### PUT /users/profile
Mettre à jour le profil de l'utilisateur connecté.

**Body :**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33123456789",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "bio": "Assistant urbain disponible",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

#### GET /users/:id
Récupérer le profil d'un utilisateur par ID.

### Paiements

#### POST /payments/create-intent
Créer un PaymentIntent pour une mission.

**Body :**
```json
{
  "missionId": "mission-uuid"
}
```

#### POST /payments/confirm
Confirmer un paiement.

**Body :**
```json
{
  "paymentIntentId": "pi_test_123"
}
```

#### GET /payments/mission/:missionId
Récupérer les paiements d'une mission.

### Évaluations

#### POST /reviews
Créer une évaluation pour une mission.

**Body :**
```json
{
  "missionId": "mission-uuid",
  "rating": 5,
  "comment": "Excellent service !",
  "isPublic": true
}
```

#### GET /reviews/mission/:missionId
Récupérer les évaluations d'une mission.

#### GET /reviews/user/:userId
Récupérer les évaluations d'un utilisateur.

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 409 | Conflit (ex: email déjà utilisé) |
| 500 | Erreur interne du serveur |

## Exemples d'erreurs

```json
{
  "error": "Données invalides",
  "details": [
    "Le champ 'email' doit être une adresse email valide",
    "Le champ 'password' doit contenir au moins 6 caractères"
  ]
}
```

```json
{
  "error": "Token d'authentification manquant",
  "message": "Veuillez fournir un token Bearer valide"
}
```

## WebSocket Events

L'API supporte les WebSockets pour les fonctionnalités en temps réel.

### Connexion
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Events

#### Rejoindre un chat de mission
```javascript
socket.emit('join-mission-chat', 'mission-uuid');
```

#### Envoyer un message
```javascript
socket.emit('send-message', {
  missionId: 'mission-uuid',
  message: 'Bonjour !',
  type: 'text'
});
```

#### Mettre à jour le statut d'une mission
```javascript
socket.emit('mission-status-update', {
  missionId: 'mission-uuid',
  status: 'in_progress',
  comment: 'Début de la mission'
});
```

### Écouter les events

#### Nouveau message
```javascript
socket.on('new-message', (messageData) => {
  console.log('Nouveau message:', messageData);
});
```

#### Statut de mission mis à jour
```javascript
socket.on('mission-status-changed', (statusData) => {
  console.log('Statut mis à jour:', statusData);
});
```

#### Notification
```javascript
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
});
```

## Rate Limiting

L'API applique un rate limiting de 100 requêtes par IP par fenêtre de 15 minutes.

## Pagination

Les endpoints qui retournent des listes supportent la pagination avec les paramètres `limit` et `offset`.

**Exemple de réponse paginée :**
```json
{
  "missions": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150
  }
}
```

## Géolocalisation

Les recherches géolocalisées utilisent la formule de Haversine pour calculer les distances entre les coordonnées GPS.

## Sécurité

- Tous les mots de passe sont hashés avec bcrypt
- Les tokens JWT expirent après 7 jours
- Les requêtes sensibles nécessitent une authentification
- Validation des données avec Joi
- Protection CSRF avec Helmet
- Rate limiting pour prévenir les abus

## Monitoring

L'API expose un endpoint de santé :

```
GET /health
```

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
``` 