# Architecture ViteFait - Monorepo

## 🏗️ Vue d'ensemble

ViteFait est une application de conciergerie urbaine organisée en monorepo avec une architecture moderne et scalable.

```
ViteFait/
├── 📁 backend/          # API REST + WebSocket
├── 📁 mobile/           # Application React Native
├── 📁 configs/          # Configurations partagées
├── 📁 DOCS/             # Documentation
└── 📁 .github/          # CI/CD
```

## 🎯 Objectifs de l'Architecture

- **Séparation des responsabilités** : Backend et mobile indépendants
- **Réutilisabilité** : Configurations partagées
- **Scalabilité** : Architecture modulaire
- **Maintenabilité** : Code organisé et documenté
- **Qualité** : Tests automatisés et linting

## 📱 Backend (Node.js + TypeScript)

### Structure
```
backend/
├── 📁 src/
│   ├── 📁 models/           # Entités TypeORM
│   ├── 📁 routes/           # Contrôleurs Express
│   ├── 📁 services/         # Logique métier
│   ├── 📁 middleware/       # Middlewares Express
│   ├── 📁 utils/            # Utilitaires
│   └── 📁 config/           # Configuration
├── 📁 migrations/           # Migrations base de données
├── 📁 tests/               # Tests unitaires
└── 📁 coverage/            # Rapports de couverture
```

### Technologies
- **Runtime** : Node.js 18+
- **Language** : TypeScript 5+
- **Framework** : Express.js
- **ORM** : TypeORM
- **Base de données** : PostgreSQL
- **Authentification** : JWT
- **Paiements** : Stripe
- **Notifications** : Firebase
- **Tests** : Jest + Supertest

### API Endpoints
- `POST /api/auth/*` - Authentification
- `GET/POST/PUT/DELETE /api/missions/*` - Gestion des missions
- `GET/POST/PUT/DELETE /api/users/*` - Gestion des utilisateurs
- `GET/POST/PUT/DELETE /api/payments/*` - Gestion des paiements
- `GET/POST/PUT/DELETE /api/reviews/*` - Gestion des avis

## 📱 Mobile (React Native + TypeScript)

### Structure
```
mobile/
├── 📁 src/
│   ├── 📁 store/            # Redux Toolkit
│   ├── 📁 services/         # Services API
│   ├── 📁 types/            # Types TypeScript
│   ├── 📁 components/       # Composants réutilisables
│   ├── 📁 screens/          # Écrans de l'application
│   └── 📁 utils/            # Utilitaires
└── 📁 tests/               # Tests unitaires
```

### Technologies
- **Framework** : React Native
- **Language** : TypeScript 5+
- **State Management** : Redux Toolkit
- **Navigation** : React Navigation
- **UI** : React Native Elements
- **Tests** : Jest + React Native Testing Library

## 🔧 Configurations Partagées

### Structure
```
configs/
├── 📄 eslint.base.js       # Configuration ESLint de base
├── 📄 prettier.base.js     # Configuration Prettier de base
└── 📄 jest.base.js         # Configuration Jest de base
```

### Avantages
- **Cohérence** : Mêmes règles de code partout
- **Maintenance** : Une seule source de vérité
- **Évolutivité** : Facile d'ajouter de nouveaux projets

## 🚀 Workflow de Développement

### 1. Installation
```bash
# Installation complète
npm run install:all

# Ou par projet
cd backend && npm install
cd mobile && npm install
```

### 2. Développement
```bash
# Développement complet
npm run dev

# Ou par projet
npm run dev:backend
npm run dev:mobile
```

### 3. Tests
```bash
# Tests complets
npm run test

# Ou par projet
npm run test:backend
npm run test:mobile
```

### 4. Linting
```bash
# Linting complet
npm run lint

# Correction automatique
npm run lint:fix
```

## 🔄 CI/CD Pipeline

### Déclencheurs
- **Push/Pull Request** sur `main` ou `develop`
- **Détection automatique** des changements par projet

### Jobs
1. **detect-changes** : Détecte quels projets ont changé
2. **backend** : Tests, lint, build du backend
3. **mobile** : Tests, lint, build du mobile
4. **integration-tests** : Tests d'intégration
5. **security-scan** : Scan de sécurité
6. **deploy-staging** : Déploiement staging (develop)
7. **deploy-production** : Déploiement production (main)

### Environnements
- **Staging** : `develop` branch
- **Production** : `main` branch

## 🗄️ Base de Données

### Schéma Principal
- **users** : Utilisateurs (clients/assistants)
- **missions** : Missions de conciergerie
- **payments** : Paiements Stripe
- **reviews** : Avis et évaluations
- **mission_status_history** : Historique des statuts

### Migrations
- **Gestion automatique** via TypeORM
- **Versioning** des schémas
- **Rollback** possible

## 🔐 Sécurité

### Authentification
- **JWT** pour l'authentification API
- **Refresh tokens** pour la persistance
- **Middleware** de vérification des rôles

### Autorisation
- **RBAC** (Role-Based Access Control)
- **Permissions** granulaires
- **Validation** des données

### Paiements
- **Stripe** pour la sécurité des paiements
- **Webhooks** pour la synchronisation
- **Chiffrement** des données sensibles

## 📊 Monitoring et Observabilité

### Logs
- **Structured logging** avec Winston
- **Niveaux** : error, warn, info, debug
- **Context** : user, request, performance

### Métriques
- **Performance** : temps de réponse, throughput
- **Business** : missions créées, paiements
- **Erreurs** : taux d'erreur, types d'erreurs

### Alertes
- **Seuils** automatiques
- **Notifications** Slack/Email
- **Escalade** automatique

## 🚀 Déploiement

### Backend
- **Conteneurisation** : Docker
- **Orchestration** : Kubernetes
- **Environnements** : dev, staging, prod

### Mobile
- **Build** : Expo/React Native CLI
- **Distribution** : App Store, Google Play
- **CI/CD** : Fastlane

## 📈 Évolutivité

### Horizontal Scaling
- **Load balancing** pour l'API
- **Database sharding** si nécessaire
- **CDN** pour les assets statiques

### Vertical Scaling
- **Optimisation** des requêtes
- **Caching** Redis
- **Database indexing**

## 🔧 Maintenance

### Mises à jour
- **Dépendances** : Renovate/Dependabot
- **Sécurité** : Snyk
- **Compatibilité** : Tests automatisés

### Sauvegarde
- **Base de données** : Backup automatique
- **Code** : Versioning Git
- **Configuration** : Infrastructure as Code

## 📚 Documentation

### Technique
- **API** : Swagger/OpenAPI
- **Architecture** : Ce document
- **Déploiement** : README détaillé

### Utilisateur
- **Guide utilisateur** : Mobile app
- **FAQ** : Questions fréquentes
- **Support** : Documentation d'aide

## 🎯 Roadmap

### Court terme (1-3 mois)
- [ ] Tests d'intégration complets
- [ ] Monitoring avancé
- [ ] Documentation API

### Moyen terme (3-6 mois)
- [ ] Microservices
- [ ] Event sourcing
- [ ] GraphQL

### Long terme (6+ mois)
- [ ] IA/ML pour recommandations
- [ ] Blockchain pour paiements
- [ ] IoT integration

---

*Dernière mise à jour : Décembre 2024* 