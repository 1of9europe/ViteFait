# Conciergerie Urbaine - V0

Application de micro-missions à la demande pour iOS avec backend Node.js/Express et base de données PostgreSQL.

## 🚀 Fonctionnalités

- **Authentification** : Inscription/Connexion (client ou assistant urbain)
- **Gestion des missions** : Publication, géolocalisation, acceptation
- **Suivi en temps réel** : Statut des missions, chat intégré
- **Paiement sécurisé** : Stripe Connect avec escrow et remboursement des achats
- **Évaluations** : Système de notation bilatéral
- **Notifications push** : Alertes en temps réel

## 🏗️ Architecture

```
project-root/
├── mobile/                 # Application React Native iOS
│   ├── ios-app/           # Code source React Native
│   └── tests/             # Tests UI & intégration
├── server/                # Backend Node.js/Express
│   ├── src/
│   │   ├── controllers/   # Contrôleurs API
│   │   ├── models/        # Modèles de données
│   │   ├── routes/        # Routes Express
│   │   ├── services/      # Services (Stripe, géoloc, notifications)
│   │   └── app.js         # Configuration Express
│   ├── migrations/        # Migrations base de données
│   ├── tests/             # Tests backend
│   └── config/            # Configuration (env, clés API)
└── README.md
```

## 🛠️ Technologies

### Mobile (React Native)
- React Native + TypeScript
- React Navigation + Redux Toolkit
- @react-native-community/geolocation
- @stripe/stripe-react-native
- react-native-push-notification

### Backend (Node.js)
- Node.js 18+ + Express + TypeScript
- PostgreSQL + TypeORM
- Stripe API
- Jest + Supertest
- Socket.io (chat temps réel)

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- Xcode 14+ (pour iOS)
- Compte Stripe (clés de test)
- Compte Firebase (notifications push)

## 🚀 Installation

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run migrate
npm run dev
```

### 2. Mobile

```bash
cd mobile/ios-app
npm install
cd ios && pod install
# Configurer les clés API dans ios/Info.plist
npm run ios
```

## 🔧 Configuration

### Variables d'environnement (server/.env)

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/conciergerie_urbaine

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase (notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Serveur
PORT=3000
NODE_ENV=development
```

## 🧪 Tests

### Backend
```bash
cd server
npm test              # Tests unitaires
npm run test:e2e      # Tests d'intégration
npm run test:coverage # Couverture de code
```

### Mobile
```bash
cd mobile/ios-app
npm run test          # Tests unitaires
npm run test:e2e      # Tests end-to-end (Detox)
```

## 📱 Fonctionnalités principales

### 1. Authentification
- Inscription avec email/mot de passe
- Connexion avec JWT
- Rôles : Client / Assistant urbain

### 2. Gestion des missions
- Publication de mission (description, lieu, créneau, prix)
- Géolocalisation et recherche par rayon
- Acceptation et matching automatique

### 3. Suivi en temps réel
- Statuts : En attente → Acceptée → En cours → Terminée
- Chat intégré entre client et assistant
- Notifications push

### 4. Paiement sécurisé
- Escrow Stripe Connect
- Remboursement automatique des achats
- Upload de reçus
- Paiement sécurisé

### 5. Évaluations
- Notation bilatérale (client ↔ assistant)
- Commentaires et historique

## 🔄 Workflow de développement

1. **Feature branch** : `git checkout -b feature/nom-feature`
2. **Développement** : Code + tests unitaires
3. **Tests** : `npm test` + tests d'intégration
4. **Pull Request** : Review + validation
5. **Merge** : Intégration automatique via GitHub Actions

## 📊 Monitoring

- **Sentry** : Gestion des erreurs
- **LogDNA** : Centralisation des logs
- **New Relic** : Performance monitoring

## 🚀 Déploiement

### Backend (Heroku/AWS)
```bash
npm run build
npm run start
```

### Mobile (TestFlight)
```bash
npm run build:ios
# Upload via Xcode ou Fastlane
```

## 📞 Support

Pour toute question ou problème :
- Issues GitHub : [Lien vers les issues]
- Documentation API : [Lien vers Swagger]
- Slack : [Canal de support]

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails. 