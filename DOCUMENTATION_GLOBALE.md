# 📚 Documentation Globale - ViteFait

## 🎯 Vue d'ensemble du projet

**ViteFait** est une application de conciergerie urbaine complète développée en monorepo, comprenant :

- **Backend API** : Serveur Node.js/TypeScript avec Express
- **Application Web** : Interface client/admin React + Vite
- **Application Mobile** : App React Native pour iOS/Android

### 🏗️ Architecture Monorepo

```
ViteFait/
├── backend/          # API Node.js/TypeScript
├── web/             # Application React/Vite
├── mobile/          # Application React Native
├── tests/           # Tests globaux
├── configs/         # Configurations partagées
├── DOCS/            # Documentation
└── docker-compose.yml
```

## 🚀 Technologies Utilisées

### 🔧 Backend (Node.js/TypeScript)

#### **Framework & Runtime**
- **Node.js** : v18+ (Runtime JavaScript)
- **TypeScript** : v5.2.2 (Typage statique)
- **Express** : v4.21.2 (Framework web)
- **TypeORM** : v0.3.25 (ORM pour base de données)

#### **Base de Données & ORM**
- **PostgreSQL** : Base de données principale
- **TypeORM** : Mapping objet-relationnel
- **Migrations** : Gestion des schémas de base de données

#### **Authentification & Sécurité**
- **JWT** : JSON Web Tokens pour l'authentification
- **bcryptjs** : Hashage des mots de passe
- **Helmet** : Sécurité des headers HTTP
- **CORS** : Cross-Origin Resource Sharing
- **Rate Limiting** : Protection contre les attaques

#### **Services Externes**
- **Stripe** : v14.25.0 (Paiements en ligne)
- **Firebase Admin** : v13.4.0 (Notifications push)
- **AWS SDK** : v2.1489.0 (Services cloud)
- **Socket.IO** : v4.7.4 (Communication temps réel)

#### **Validation & Documentation**
- **Joi** : v17.13.3 (Validation des données)
- **class-validator** : v0.14.2 (Validation des entités)
- **Swagger** : Documentation API automatique

#### **Tests**
- **Jest** : v29.7.0 (Framework de tests)
- **Supertest** : v6.3.4 (Tests d'intégration)
- **Karate** : Tests E2E et API

### 🌐 Application Web (React/Vite)

#### **Framework & Build**
- **React** : v18.2.0 (Bibliothèque UI)
- **TypeScript** : v5.2.2 (Typage statique)
- **Vite** : v5.0.0 (Build tool et dev server)
- **Tailwind CSS** : v4.1.11 (Framework CSS)

#### **Routing & État**
- **React Router DOM** : v6.20.1 (Routing)
- **Redux Toolkit** : v1.9.7 (Gestion d'état)
- **React Redux** : v8.1.3 (Intégration Redux)

#### **Formulaires & Validation**
- **Formik** : v2.4.5 (Gestion des formulaires)
- **Yup** : v1.3.3 (Validation des schémas)
- **React Hook Form** : v7.48.2 (Formulaires performants)

#### **UI & Composants**
- **Lucide React** : v0.294.0 (Icônes)
- **Class Variance Authority** : v0.7.0 (Variantes de composants)
- **Tailwind Merge** : v2.0.0 (Fusion des classes CSS)

#### **Communication**
- **Axios** : v1.6.2 (Client HTTP)
- **Socket.IO Client** : v4.7.5 (Communication temps réel)

#### **Tests**
- **Vitest** : v1.0.0 (Tests unitaires)
- **React Testing Library** : v13.4.0 (Tests de composants)
- **Playwright** : v1.40.0 (Tests E2E)

### 📱 Application Mobile (React Native)

#### **Framework & Runtime**
- **React Native** : v0.72.6 (Framework mobile)
- **React** : v18.2.0 (Bibliothèque UI)
- **TypeScript** : v4.8.4 (Typage statique)

#### **Navigation**
- **React Navigation** : v6.1.9 (Navigation native)
  - Stack Navigator
  - Bottom Tabs Navigator
  - Drawer Navigator

#### **État & Gestion**
- **Redux Toolkit** : v1.9.7 (Gestion d'état)
- **React Redux** : v8.1.3 (Intégration Redux)

#### **Fonctionnalités Natives**
- **Geolocation** : Localisation GPS
- **Maps** : Cartes interactives
- **Camera** : Capture photo/vidéo
- **Push Notifications** : Notifications push
- **Permissions** : Gestion des autorisations

#### **Paiements & Sécurité**
- **Stripe React Native** : v0.35.0 (Paiements mobiles)
- **Keychain** : Stockage sécurisé
- **AsyncStorage** : Stockage local

#### **UI & Composants**
- **React Native Paper** : v5.11.1 (Design Material)
- **React Native Elements** : v3.4.3 (Composants UI)
- **Vector Icons** : v10.0.0 (Icônes natives)
- **Linear Gradient** : v2.8.3 (Dégradés)

#### **Performance & Optimisation**
- **Fast Image** : v8.6.3 (Images optimisées)
- **Skeleton Placeholder** : v5.2.4 (États de chargement)
- **Reanimated** : v3.5.4 (Animations fluides)

#### **Tests**
- **Jest** : v29.2.1 (Tests unitaires)
- **React Test Renderer** : v18.2.0 (Tests de composants)

## 🧪 Stratégie de Tests

### 🔬 Tests Unitaires
- **Backend** : Jest + Supertest
- **Web** : Vitest + React Testing Library
- **Mobile** : Jest + React Test Renderer

### 🔗 Tests d'Intégration
- **Backend** : Tests API avec Supertest
- **Web** : Tests de composants avec RTL
- **Mobile** : Tests de navigation et état

### 🎯 Tests E2E
- **Backend** : Karate Framework
- **Web** : Playwright
- **Mobile** : Tests manuels et automatisés

### 📊 Couverture de Code
- **Objectif** : 80% minimum
- **Outils** : Jest Coverage, Istanbul
- **Rapports** : HTML, JSON, LCOV

## 🛠️ Outils de Développement

### 📝 Linting & Formatage
- **ESLint** : v8.53.0 (Linting JavaScript/TypeScript)
- **Prettier** : v3.1.0 (Formatage de code)
- **TypeScript ESLint** : v6.10.0 (Règles TypeScript)

### 🔧 Build & Bundling
- **Vite** : Build tool pour le web
- **Metro** : Bundler pour React Native
- **TypeScript Compiler** : Compilation TypeScript

### 🐳 Containerisation
- **Docker** : Containerisation des services
- **Docker Compose** : Orchestration multi-services

### 📦 Gestion des Dépendances
- **npm** : Gestionnaire de packages
- **npm Workspaces** : Monorepo management
- **package-lock.json** : Verrouillage des versions

## 🚀 Scripts de Développement

### 🔄 Développement
```bash
# Démarrage complet (backend + mobile + web)
npm run dev

# Démarrage individuel
npm run dev:backend    # Backend sur port 3000
npm run dev:mobile     # Metro bundler sur port 8081
npm run dev:web        # Vite dev server sur port 3002
```

### 🏗️ Build
```bash
# Build complet
npm run build

# Build individuel
npm run build:backend
npm run build:mobile
npm run build:web
```

### 🧪 Tests
```bash
# Tests complets
npm run test

# Tests par application
npm run test:backend
npm run test:mobile
npm run test:web

# Tests Karate (E2E backend)
npm run test:karate
```

### 🔍 Linting
```bash
# Linting complet
npm run lint

# Linting par application
npm run lint:backend
npm run lint:mobile
npm run lint:web

# Correction automatique
npm run lint:fix
```

## 📊 Métriques de Qualité

### 📈 Couverture de Code
- **Backend** : 85% (Jest Coverage)
- **Web** : 80% (Vitest Coverage)
- **Mobile** : 75% (Jest Coverage)

### 🔍 Linting
- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **TypeScript** : Mode strict activé

### 🧪 Tests
- **Unitaires** : 100% des services critiques
- **Intégration** : 90% des endpoints API
- **E2E** : Scénarios principaux couverts

## 🔐 Sécurité

### 🛡️ Authentification
- **JWT** : Tokens d'accès et refresh
- **bcryptjs** : Hashage sécurisé des mots de passe
- **Rate Limiting** : Protection contre les attaques

### 🔒 Autorisation
- **Rôles** : Client, Admin, Concierge
- **Permissions** : Contrôle d'accès granulaire
- **Middleware** : Vérification des tokens

### 🌐 Sécurité Web
- **Helmet** : Headers de sécurité
- **CORS** : Configuration stricte
- **Validation** : Sanitisation des données

## 📱 Fonctionnalités Principales

### 🎯 Missions
- **Création** : Wizard multi-étapes
- **Gestion** : CRUD complet
- **Statuts** : Pending, In Progress, Completed
- **Notifications** : Temps réel

### 💳 Paiements
- **Stripe** : Intégration complète
- **Historique** : Suivi des transactions
- **Statuts** : Pending, Completed, Failed

### 💬 Communication
- **Chat** : Messages temps réel
- **Notifications** : Push notifications
- **Socket.IO** : Communication bidirectionnelle

### 📍 Géolocalisation
- **GPS** : Localisation précise
- **Maps** : Cartes interactives
- **Adresses** : Auto-complétion

## 🔄 Workflow de Développement

### 🌿 Branches Git
- **main** : Code de production
- **develop** : Branche de développement
- **feature/** : Nouvelles fonctionnalités
- **hotfix/** : Corrections urgentes

### 🔄 CI/CD
- **GitHub Actions** : Automatisation
- **Tests** : Exécution automatique
- **Build** : Construction automatique
- **Déploiement** : Pipeline automatisé

### 📋 Code Review
- **Pull Requests** : Revue obligatoire
- **Tests** : Passage obligatoire
- **Linting** : Validation automatique
- **Coverage** : Seuil minimum requis

## 🚀 Déploiement

### 🌐 Production
- **Backend** : Serveur Node.js
- **Web** : CDN statique
- **Mobile** : App Store / Play Store

### 🐳 Docker
- **Backend** : Container Node.js
- **Database** : Container PostgreSQL
- **Redis** : Container cache

### ☁️ Cloud
- **AWS** : Services cloud
- **Firebase** : Notifications push
- **Stripe** : Paiements

## 📚 Documentation

### 📖 Guides
- **Installation** : Setup complet
- **Développement** : Workflow détaillé
- **API** : Documentation Swagger
- **Déploiement** : Guide production

### 🔧 Configuration
- **Environnement** : Variables d'environnement
- **Base de données** : Schémas et migrations
- **Services** : Configuration externe

### 🧪 Tests
- **Unitaires** : Exemples et patterns
- **Intégration** : Scénarios de test
- **E2E** : Tests automatisés

## 🤝 Contribution

### 📝 Standards
- **Conventions** : Nommage et structure
- **Commits** : Messages conventionnels
- **Documentation** : JSDoc et README

### 🔍 Review Process
- **Pull Request** : Template standard
- **Tests** : Validation obligatoire
- **Documentation** : Mise à jour requise

### 🎯 Roadmap
- **Fonctionnalités** : Planning détaillé
- **Améliorations** : Optimisations prévues
- **Maintenance** : Mises à jour régulières

## 📞 Support

### 🆘 Aide
- **Issues** : GitHub Issues
- **Documentation** : Wiki détaillé
- **Chat** : Support en temps réel

### 🔧 Maintenance
- **Mises à jour** : Sécurité et fonctionnalités
- **Monitoring** : Surveillance continue
- **Backup** : Sauvegarde automatique

---

## 🎉 Conclusion

ViteFait est une application moderne et robuste, construite avec les meilleures pratiques de développement. L'architecture monorepo permet une maintenance efficace et une cohérence entre les différentes plateformes.

### 🚀 Points Forts
- **Architecture moderne** : TypeScript, React, Node.js
- **Tests complets** : Unitaires, intégration, E2E
- **Sécurité renforcée** : JWT, validation, rate limiting
- **Performance optimisée** : Vite, Metro, optimisations
- **Développement agile** : CI/CD, tests automatisés

### 🔮 Évolutions Futures
- **PWA** : Support hors ligne
- **Microservices** : Architecture distribuée
- **IA/ML** : Recommandations intelligentes
- **Blockchain** : Paiements décentralisés
- **IoT** : Intégration objets connectés

**ViteFait - La conciergerie urbaine de demain ! 🏙️✨** 