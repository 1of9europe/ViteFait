# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Structure complète du projet Conciergerie Urbaine V0
- Backend Node.js/Express avec TypeScript
- Modèles de données (User, Mission, Review, Payment, MissionStatusHistory)
- API REST complète avec authentification JWT
- Routes pour authentification, missions, utilisateurs, paiements, évaluations
- Middleware d'authentification et gestion d'erreurs
- WebSockets pour le chat temps réel
- Tests unitaires avec Jest et Supertest
- Configuration ESLint et Prettier
- Mobile React Native avec TypeScript
- Redux Toolkit pour la gestion d'état
- Types TypeScript complets
- CI/CD avec GitHub Actions
- Docker Compose pour le développement
- Documentation complète (README, API, Quick Start)
- Configuration de base de données PostgreSQL avec TypeORM

### Technical
- Architecture modulaire et scalable
- Validation des données avec Joi
- Gestion des erreurs centralisée
- Support des notifications push (Firebase)
- Intégration Stripe pour les paiements
- Géolocalisation et recherche par rayon
- Système de notation bilatéral
- Escrow et remboursements automatiques

## [0.1.0] - 2024-01-XX

### Added
- Version initiale du projet
- Structure de base complète
- Documentation technique

---

## Types de changements

- **Added** pour les nouvelles fonctionnalités
- **Changed** pour les changements dans les fonctionnalités existantes
- **Deprecated** pour les fonctionnalités qui seront bientôt supprimées
- **Removed** pour les fonctionnalités supprimées
- **Fixed** pour les corrections de bugs
- **Security** pour les corrections de vulnérabilités 