# 🏙️ ViteFait - Conciergerie Urbaine

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue.svg)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**ViteFait** est une application complète de conciergerie urbaine développée en monorepo, offrant une solution moderne pour la gestion de missions et de services urbains.

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** v18.0.0+
- **npm** v8.0.0+
- **PostgreSQL** v14+ (ou Docker)

### Installation
```bash
# Cloner le projet
git clone https://github.com/vitefait/vitefait.git
cd vitefait

# Installer les dépendances
npm run install:all

# Configuration
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env

# Base de données
createdb vitefait
cd backend && npm run migrate

# Démarrer le développement
npm run dev
```

### Accès aux applications
- **Backend API** : http://localhost:3000/api
- **Documentation API** : http://localhost:3000/api-docs
- **Application Web** : http://localhost:3002
- **Metro Bundler** : http://localhost:8081

## 📚 Documentation

### 📖 Guides Principaux
- **[Documentation Globale](./DOCUMENTATION_GLOBALE.md)** - Vue d'ensemble complète du projet
- **[Guide d'Installation](./GUIDE_INSTALLATION.md)** - Installation et configuration détaillées
- **[Architecture Technique](./ARCHITECTURE_TECHNIQUE.md)** - Architecture et patterns techniques

### 🔧 Documentation par Application
- **[Backend](./backend/)** - API Node.js/TypeScript
  - [Tests Summary](./backend/TESTS_SUMMARY.md)
  - [Stabilisation Rapport](./backend/STABILISATION_RAPPORT.md)
- **[Web](./web/)** - Application React/Vite
  - [Intégration Web](./INTEGRATION_WEB.md)
  - [README Web](./web/README.md)
- **[Mobile](./mobile/)** - Application React Native
  - [Architecture Mobile](./mobile/ARCHITECTURE_MOBILE.md)
  - [Navigation et Authentification](./mobile/NAVIGATION_ET_AUTHENTIFICATION.md)
  - [Prérequis et Intégration API](./mobile/PREREQUIS_ET_INTEGRATION_API.md)

### 🧪 Tests et Qualité
- **[Rapport Tests Frontend](./RAPPORT_FRONTEND_TESTS_DOCKER.md)** - Tests et Docker
- **[Tests Summary Backend](./backend/TESTS_SUMMARY.md)** - Couverture et résultats

## 🏗️ Architecture

### Monorepo Structure
```
ViteFait/
├── backend/          # API Node.js/TypeScript + Express
├── web/             # Application React + Vite + Tailwind
├── mobile/          # Application React Native
├── tests/           # Tests globaux
├── configs/         # Configurations partagées
├── DOCS/            # Documentation
└── docker-compose.yml
```

### Technologies Utilisées

#### 🔧 Backend
- **Node.js** v18+ avec **TypeScript** v5.2.2
- **Express** v4.21.2 (Framework web)
- **TypeORM** v0.3.25 (ORM PostgreSQL)
- **JWT** + **bcryptjs** (Authentification)
- **Stripe** v14.25.0 (Paiements)
- **Socket.IO** v4.7.4 (Temps réel)
- **Jest** + **Supertest** + **Karate** (Tests)

#### 🌐 Web
- **React** v18.2.0 + **TypeScript** v5.2.2
- **Vite** v5.0.0 (Build tool)
- **Tailwind CSS** v4.1.11 (Styling)
- **Redux Toolkit** v1.9.7 (État global)
- **React Router** v6.20.1 (Routing)
- **Formik** + **Yup** (Formulaires)
- **Vitest** + **Playwright** (Tests)

#### 📱 Mobile
- **React Native** v0.72.6 + **TypeScript** v4.8.4
- **React Navigation** v6.1.9 (Navigation)
- **Redux Toolkit** v1.9.7 (État global)
- **Stripe React Native** v0.35.0 (Paiements)
- **Geolocation** + **Maps** (Localisation)
- **Jest** + **React Test Renderer** (Tests)

## 🚀 Scripts Disponibles

### 🔄 Développement
```bash
npm run dev              # Démarrer toutes les applications
npm run dev:backend      # Backend uniquement
npm run dev:web          # Web uniquement
npm run dev:mobile       # Mobile uniquement
```

### 🏗️ Build
```bash
npm run build            # Build complet
npm run build:backend    # Build backend
npm run build:web        # Build web
npm run build:mobile     # Build mobile
```

### 🧪 Tests
```bash
npm run test             # Tests complets
npm run test:backend     # Tests backend
npm run test:web         # Tests web
npm run test:mobile      # Tests mobile
npm run test:karate      # Tests E2E backend
```

### 🔍 Linting
```bash
npm run lint             # Linting complet
npm run lint:fix         # Correction automatique
```

### 🧹 Maintenance
```bash
npm run install:all      # Installer toutes les dépendances
npm run clean            # Nettoyer node_modules
```

## 📊 Métriques de Qualité

### 🧪 Couverture de Tests
- **Backend** : 85% (Jest Coverage)
- **Web** : 80% (Vitest Coverage)
- **Mobile** : 75% (Jest Coverage)

### 🔍 Linting
- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **TypeScript** : Mode strict activé

### 🚀 Performance
- **Web** : Vite HMR ultra-rapide
- **Mobile** : Metro bundler optimisé
- **Backend** : Cache et pagination

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
- **Issues** : [GitHub Issues](https://github.com/vitefait/vitefait/issues)
- **Discussions** : [GitHub Discussions](https://github.com/vitefait/vitefait/discussions)
- **Documentation** : Wiki détaillé

### 🔧 Maintenance
- **Mises à jour** : Sécurité et fonctionnalités
- **Monitoring** : Surveillance continue
- **Backup** : Sauvegarde automatique

### 📧 Contact
- **Email** : support@vitefait.com
- **Slack** : #vitefait-dev

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **React** et **React Native** pour les frameworks
- **Node.js** et **Express** pour le backend
- **Tailwind CSS** pour le styling
- **TypeScript** pour le typage
- **Jest** et **Vitest** pour les tests
- **Stripe** pour les paiements
- **Socket.IO** pour le temps réel

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

---

<div align="center">
  <p><strong>Développé avec ❤️ par l'équipe ViteFait</strong></p>
  <p>
    <a href="https://github.com/vitefait/vitefait/issues">Issues</a> •
    <a href="https://github.com/vitefait/vitefait/discussions">Discussions</a> •
    <a href="https://github.com/vitefait/vitefait/blob/main/CHANGELOG.md">Changelog</a>
  </p>
</div> 