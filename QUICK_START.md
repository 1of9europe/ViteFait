# Guide d'Installation Rapide - Conciergerie Urbaine

## 🚀 Démarrage en 5 minutes

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Docker (optionnel)
- Xcode 14+ (pour iOS)

### 1. Cloner le projet

```bash
git clone <repository-url>
cd ViteFait
```

### 2. Configuration de la base de données

#### Option A : Avec Docker (recommandé)

```bash
# Démarrer PostgreSQL avec Docker
docker run --name conciergerie_db \
  -e POSTGRES_DB=conciergerie_urbaine \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14
```

#### Option B : Installation locale

1. Installer PostgreSQL
2. Créer la base de données :
```sql
CREATE DATABASE conciergerie_urbaine;
```

### 3. Configuration du Backend

```bash
cd server

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

**Configuration minimale (.env) :**
```env
# Base de données
DATABASE_URL=postgresql://postgres:password@localhost:5432/conciergerie_urbaine

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Serveur
PORT=3000
NODE_ENV=development
```

### 4. Démarrer le Backend

```bash
# Créer les tables (première fois uniquement)
npm run migrate

# Démarrer en mode développement
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

### 5. Configuration du Mobile

```bash
cd mobile/ios-app

# Installer les dépendances
npm install

# Installer les pods iOS
cd ios && pod install && cd ..
```

### 6. Démarrer l'Application Mobile

```bash
# Démarrer le Metro bundler
npm start

# Dans un autre terminal, lancer l'app iOS
npm run ios
```

## 🧪 Tests

### Backend

```bash
cd server

# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests end-to-end
npm run test:e2e
```

### Mobile

```bash
cd mobile/ios-app

# Tests unitaires
npm test

# Tests end-to-end (Detox)
npm run test:e2e
```

## 📱 Fonctionnalités Testées

### Authentification
- ✅ Inscription utilisateur
- ✅ Connexion avec JWT
- ✅ Gestion des rôles (Client/Assistant)

### Missions
- ✅ Création de mission
- ✅ Recherche géolocalisée
- ✅ Acceptation de mission
- ✅ Suivi des statuts

### Paiements
- ✅ Création PaymentIntent
- ✅ Confirmation de paiement
- ✅ Gestion des escrows

### Évaluations
- ✅ Création d'évaluations
- ✅ Notation bilatérale
- ✅ Historique des avis

## 🔧 Configuration Avancée

### Variables d'environnement complètes

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/conciergerie_urbaine
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=conciergerie_urbaine

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase (notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Serveur
PORT=3000
NODE_ENV=development
```

### Docker Compose (environnement complet)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down
```

## 📊 Monitoring

### Endpoints de santé

- **Backend** : `http://localhost:3000/health`
- **Documentation API** : `http://localhost:3000/api-docs`

### Outils de monitoring

- **Grafana** : `http://localhost:3002` (admin/admin)
- **Prometheus** : `http://localhost:9090`
- **Kibana** : `http://localhost:5601`

## 🚨 Dépannage

### Erreurs courantes

#### Base de données non connectée
```bash
# Vérifier que PostgreSQL est démarré
pg_isready -h localhost -p 5432

# Vérifier les logs
docker logs conciergerie_db
```

#### Port déjà utilisé
```bash
# Trouver le processus qui utilise le port
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

#### Erreurs de dépendances mobile
```bash
cd mobile/ios-app

# Nettoyer le cache
npm run clean

# Réinstaller les pods
cd ios && pod deintegrate && pod install && cd ..
```

### Logs utiles

```bash
# Backend
cd server && npm run dev

# Mobile
cd mobile/ios-app && npm start

# Base de données
docker logs -f conciergerie_db
```

## 📚 Documentation

- [Documentation API complète](API_DOCUMENTATION.md)
- [README principal](README.md)
- [Architecture du projet](ARCHITECTURE.md)

## 🆘 Support

En cas de problème :

1. Vérifier les logs d'erreur
2. Consulter la documentation
3. Vérifier la configuration des variables d'environnement
4. Créer une issue sur GitHub

## 🎯 Prochaines étapes

1. Configurer Stripe pour les paiements
2. Configurer Firebase pour les notifications
3. Déployer en production
4. Configurer le monitoring
5. Ajouter des tests automatisés 