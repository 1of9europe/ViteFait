# ViteFait - Application de Conciergerie Urbaine

## 🚀 Vue d'ensemble

ViteFait est une application de conciergerie urbaine moderne organisée en monorepo, permettant aux utilisateurs de créer et gérer des missions de services urbains.

## 📁 Structure du Projet

```
ViteFait/
├── 📁 backend/          # API REST + WebSocket (Node.js + TypeScript)
├── 📁 mobile/           # Application mobile (React Native + TypeScript)
├── 📁 configs/          # Configurations partagées (ESLint, Prettier, Jest)
├── 📁 DOCS/             # Documentation technique
├── 📁 tests/            # Tests d'intégration
└── 📁 .github/          # CI/CD GitHub Actions
```

## 🛠️ Technologies

### Backend
- **Runtime** : Node.js 18+
- **Language** : TypeScript 5+
- **Framework** : Express.js
- **ORM** : TypeORM
- **Base de données** : PostgreSQL
- **Authentification** : JWT
- **Paiements** : Stripe
- **Notifications** : Firebase

### Mobile
- **Framework** : React Native
- **Language** : TypeScript 5+
- **State Management** : Redux Toolkit
- **Navigation** : React Navigation
- **UI** : React Native Elements

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm 8+
- PostgreSQL 15+
- Docker (optionnel)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/vitefait/vitefait.git
cd vitefait
```

2. **Installation complète**
```bash
npm run install:all
```

3. **Configuration de l'environnement**
```bash
# Backend
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos configurations

# Mobile
cp mobile/.env.example mobile/.env
# Éditer mobile/.env avec vos configurations
```

4. **Démarrage de la base de données**
```bash
# Avec Docker
npm run docker:up

# Ou PostgreSQL local
createdb vitefait_dev
```

5. **Lancement des migrations**
```bash
cd backend
npm run migration:run
```

6. **Démarrage du développement**
```bash
# Développement complet (backend + mobile)
npm run dev

# Ou par projet
npm run dev:backend    # Backend uniquement
npm run dev:mobile     # Mobile uniquement
```

## 📱 Utilisation

### Backend API
- **URL** : http://localhost:3000
- **Documentation** : http://localhost:3000/api-docs
- **Health Check** : http://localhost:3000/health

### Mobile App
- **Plateforme** : iOS/Android
- **Développement** : Expo CLI ou React Native CLI

## 🧪 Tests

### Tests complets
```bash
npm run test
```

### Tests par projet
```bash
npm run test:backend    # Tests backend
npm run test:mobile     # Tests mobile
```

### Tests d'intégration
```bash
cd backend
npm run test:integration
```

## 🔧 Scripts Disponibles

### Développement
- `npm run dev` - Démarrage complet (backend + mobile)
- `npm run dev:backend` - Backend uniquement
- `npm run dev:mobile` - Mobile uniquement

### Build
- `npm run build` - Build complet
- `npm run build:backend` - Build backend
- `npm run build:mobile` - Build mobile

### Tests
- `npm run test` - Tests complets
- `npm run test:backend` - Tests backend
- `npm run test:mobile` - Tests mobile

### Linting
- `npm run lint` - Linting complet
- `npm run lint:fix` - Correction automatique

### Docker
- `npm run docker:up` - Démarrage des conteneurs
- `npm run docker:down` - Arrêt des conteneurs
- `npm run docker:build` - Build des images

## 🗄️ Base de Données

### Schéma Principal
- **users** - Utilisateurs (clients/assistants)
- **missions** - Missions de conciergerie
- **payments** - Paiements Stripe
- **reviews** - Avis et évaluations
- **mission_status_history** - Historique des statuts

### Migrations
```bash
cd backend
npm run migration:generate -- -n NomDeLaMigration
npm run migration:run
npm run migration:revert
```

## 🔐 Configuration

### Variables d'environnement Backend
```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/vitefait

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Serveur
PORT=3000
NODE_ENV=development
```

### Variables d'environnement Mobile
```env
# API
API_BASE_URL=http://localhost:3000/api

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🚀 Déploiement

### Backend
```bash
# Production
npm run build:backend
npm run start:backend

# Avec Docker
docker build -t vitefait-backend ./backend
docker run -p 3000:3000 vitefait-backend
```

### Mobile
```bash
# iOS
cd mobile
npm run build:ios

# Android
cd mobile
npm run build:android
```

## 📊 Monitoring

### Logs
- **Backend** : Winston avec niveaux structurés
- **Mobile** : React Native Debugger

### Métriques
- **Performance** : Temps de réponse, throughput
- **Business** : Missions créées, paiements
- **Erreurs** : Taux d'erreur, types d'erreurs

## 🤝 Contribution

### Workflow Git
1. Fork du repository
2. Création d'une branche feature
3. Développement et tests
4. Pull Request vers `develop`
5. Review et merge

### Standards de Code
- **ESLint** : Configuration partagée dans `configs/`
- **Prettier** : Formatage automatique
- **TypeScript** : Typage strict
- **Tests** : Couverture minimale 80%

### Commit Convention
```
type(scope): description

feat(auth): add JWT authentication
fix(api): resolve payment validation issue
docs(readme): update installation instructions
```

## 📚 Documentation

- **Architecture** : [DOCS/ARCHITECTURE.md](DOCS/ARCHITECTURE.md)
- **API** : [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Démarrage rapide** : [QUICK_START.md](QUICK_START.md)

## 🐛 Support

### Issues
- **Bug Report** : [GitHub Issues](https://github.com/vitefait/vitefait/issues)
- **Feature Request** : [GitHub Discussions](https://github.com/vitefait/vitefait/discussions)

### Contact
- **Email** : support@vitefait.com
- **Discord** : [Serveur ViteFait](https://discord.gg/vitefait)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Contributors** : Tous les contributeurs du projet
- **Open Source** : Communautés Node.js, React Native, TypeScript
- **Partners** : Stripe, Firebase, PostgreSQL

---

**ViteFait** - Simplifiez vos services urbains 🏙️ 