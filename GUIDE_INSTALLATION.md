# 🚀 Guide d'Installation - ViteFait

## 📋 Prérequis

### 🖥️ Système
- **OS** : macOS, Linux, Windows (WSL recommandé)
- **Node.js** : v18.0.0 ou supérieur
- **npm** : v8.0.0 ou supérieur
- **Git** : v2.0.0 ou supérieur

### 📱 Mobile (optionnel)
- **Xcode** : v14+ (pour iOS)
- **Android Studio** : v2022+ (pour Android)
- **CocoaPods** : v1.12+ (pour iOS)

### 🗄️ Base de données
- **PostgreSQL** : v14+ ou Docker

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone https://github.com/vitefait/vitefait.git
cd vitefait
```

### 2. Installer les dépendances
```bash
# Installation complète (recommandé)
npm run install:all

# Ou installation manuelle
npm install
cd backend && npm install
cd ../mobile && npm install
cd ../web && npm install
cd ..
```

### 3. Configuration de l'environnement

#### Backend
```bash
cd backend
cp .env.example .env
```

Éditer `backend/.env` :
```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitefait
DB_USER=vitefait
DB_PASSWORD=vitefait

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-1
```

#### Web
```bash
cd web
cp .env.example .env
```

Éditer `web/.env` :
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ViteFait
VITE_APP_VERSION=1.0.0
VITE_STRIPE_KEY=pk_test_your_stripe_public_key
VITE_SOCKET_URL=http://localhost:3000
```

#### Mobile
```bash
cd mobile
cp .env.example .env
```

Éditer `mobile/.env` :
```env
API_BASE_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key
```

### 4. Base de données

#### Option A : PostgreSQL local
```bash
# Installer PostgreSQL
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Créer la base de données
createdb vitefait
```

#### Option B : Docker
```bash
# Démarrer PostgreSQL avec Docker
docker run --name vitefait-postgres \
  -e POSTGRES_DB=vitefait \
  -e POSTGRES_USER=vitefait \
  -e POSTGRES_PASSWORD=vitefait \
  -p 5432:5432 \
  -d postgres:14
```

### 5. Migrations de base de données
```bash
cd backend
npm run migrate
```

## 🚀 Démarrage

### Développement complet
```bash
# Démarrer toutes les applications
npm run dev
```

### Démarrage individuel

#### Backend
```bash
npm run dev:backend
# Serveur sur http://localhost:3000
# API sur http://localhost:3000/api
# Swagger sur http://localhost:3000/api-docs
```

#### Web
```bash
npm run dev:web
# Application sur http://localhost:3002
```

#### Mobile
```bash
npm run dev:mobile
# Metro bundler sur http://localhost:8081
```

## 🧪 Tests

### Tests complets
```bash
npm run test
```

### Tests par application
```bash
# Backend
npm run test:backend

# Web
npm run test:web

# Mobile
npm run test:mobile
```

### Tests E2E (Backend)
```bash
npm run test:karate
```

## 🔧 Scripts utiles

### Build
```bash
# Build complet
npm run build

# Build par application
npm run build:backend
npm run build:web
npm run build:mobile
```

### Linting
```bash
# Linting complet
npm run lint

# Correction automatique
npm run lint:fix
```

### Nettoyage
```bash
# Nettoyer les node_modules
npm run clean

# Réinstaller
npm run install:all
```

## 📱 Configuration Mobile

### iOS
```bash
cd mobile/ios
pod install
cd ..
npm run ios
```

### Android
```bash
cd mobile
npm run android
```

## 🐳 Docker (optionnel)

### Démarrer avec Docker Compose
```bash
docker-compose up -d
```

### Build des images
```bash
docker-compose build
```

## 🔍 Vérification

### Backend
- ✅ API accessible sur `http://localhost:3000/api`
- ✅ Documentation Swagger sur `http://localhost:3000/api-docs`
- ✅ Base de données connectée
- ✅ Tests passent

### Web
- ✅ Application accessible sur `http://localhost:3002`
- ✅ Tailwind CSS fonctionnel
- ✅ Connexion API active
- ✅ Tests passent

### Mobile
- ✅ Metro bundler sur `http://localhost:8081`
- ✅ App installée sur émulateur/appareil
- ✅ Connexion API active
- ✅ Tests passent

## 🚨 Dépannage

### Erreurs courantes

#### Port déjà utilisé
```bash
# Vérifier les ports utilisés
lsof -i :3000
lsof -i :3002
lsof -i :8081

# Tuer les processus
pkill -f node
pkill -f vite
```

#### Dépendances manquantes
```bash
# Nettoyer et réinstaller
npm run clean
npm run install:all
```

#### Erreurs de base de données
```bash
# Vérifier la connexion
cd backend
npm run migrate:revert
npm run migrate
```

#### Erreurs Tailwind (Web)
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

### Logs
```bash
# Backend
cd backend && npm run dev

# Web
cd web && npm run dev

# Mobile
cd mobile && npm run start
```

## 📚 Ressources

### Documentation
- [Documentation Globale](./DOCUMENTATION_GLOBALE.md)
- [Architecture Mobile](./mobile/ARCHITECTURE_MOBILE.md)
- [Intégration Web](./INTEGRATION_WEB.md)

### API
- [Swagger UI](http://localhost:3000/api-docs)
- [Postman Collection](./backend/postman/)

### Tests
- [Rapport Tests Backend](./backend/TESTS_SUMMARY.md)
- [Rapport Tests Frontend](./RAPPORT_FRONTEND_TESTS_DOCKER.md)

## 🆘 Support

### Issues
- [GitHub Issues](https://github.com/vitefait/vitefait/issues)
- [Discussions](https://github.com/vitefait/vitefait/discussions)

### Contact
- **Email** : support@vitefait.com
- **Slack** : #vitefait-dev

---

## 🎉 Félicitations !

Votre environnement de développement ViteFait est maintenant configuré et prêt à l'emploi !

### Prochaines étapes
1. **Explorer l'API** : Visiter `http://localhost:3000/api-docs`
2. **Tester l'application web** : Visiter `http://localhost:3002`
3. **Lancer l'app mobile** : Utiliser l'émulateur ou un appareil
4. **Lire la documentation** : Consulter les guides détaillés
5. **Contribuer** : Créer des issues et pull requests

**Bon développement ! 🚀** 