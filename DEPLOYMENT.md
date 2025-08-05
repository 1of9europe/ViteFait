# Guide de Déploiement - Conciergerie Urbaine

## 🚀 Déploiement en Production

Ce guide détaille les étapes pour déployer l'application Conciergerie Urbaine en production.

## 📋 Prérequis

- Compte GitHub avec accès au repository
- Compte Heroku ou AWS (pour le backend)
- Compte Apple Developer (pour l'app iOS)
- Compte Stripe (pour les paiements)
- Compte Firebase (pour les notifications)

## 🔧 Configuration des Services

### 1. Stripe
1. Créer un compte Stripe
2. Récupérer les clés API (publique et secrète)
3. Configurer Stripe Connect pour les assistants
4. Configurer les webhooks

### 2. Firebase
1. Créer un projet Firebase
2. Configurer Cloud Messaging
3. Télécharger le fichier de configuration iOS
4. Récupérer les clés de service

### 3. Base de données PostgreSQL
1. Créer une base de données PostgreSQL
2. Configurer les connexions SSL
3. Sauvegarder les informations de connexion

## 🌐 Déploiement Backend

### Option 1: Heroku

```bash
# Installer Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer l'application
heroku create vitefait-api

# Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_postgresql_url
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set STRIPE_SECRET_KEY=your_stripe_secret
heroku config:set STRIPE_PUBLISHABLE_KEY=your_stripe_public
heroku config:set FIREBASE_PROJECT_ID=your_firebase_project
heroku config:set FIREBASE_PRIVATE_KEY=your_firebase_private_key
heroku config:set FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Déployer
git push heroku main
```

### Option 2: AWS Elastic Beanstalk

```bash
# Installer EB CLI
pip install awsebcli

# Initialiser EB
eb init

# Créer l'environnement
eb create production

# Configurer les variables d'environnement
eb setenv NODE_ENV=production
eb setenv DATABASE_URL=your_postgresql_url
# ... autres variables

# Déployer
eb deploy
```

## 📱 Déploiement Mobile

### iOS (TestFlight)

1. **Configuration Xcode**
   ```bash
   cd mobile/ios-app
   npm install
   cd ios && pod install
   ```

2. **Configuration des certificats**
   - Créer un certificat de développement
   - Créer un certificat de distribution
   - Configurer les provisioning profiles

3. **Build et upload**
   ```bash
   # Build pour TestFlight
   npm run build:ios
   
   # Ou via Xcode
   # Product > Archive > Distribute App
   ```

### Android (Google Play)

1. **Configuration des clés**
   ```bash
   # Générer une keystore
   keytool -genkey -v -keystore vitefait.keystore -alias vitefait -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build et upload**
   ```bash
   # Build pour production
   npm run build:android
   
   # Upload vers Google Play Console
   ```

## 🔄 CI/CD avec GitHub Actions

Le projet inclut déjà une configuration CI/CD. Pour l'activer :

1. **Configurer les secrets GitHub**
   - `HEROKU_API_KEY` (si déploiement Heroku)
   - `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` (si déploiement AWS)
   - `APPLE_ID` et `APPLE_APP_SPECIFIC_PASSWORD` (pour TestFlight)

2. **Activer les workflows**
   - Les workflows se déclenchent automatiquement sur push vers main
   - Vérifier les permissions dans Settings > Actions

## 📊 Monitoring

### 1. Sentry (Gestion des erreurs)
```bash
# Installer Sentry CLI
npm install -g @sentry/cli

# Configurer
sentry-cli init
```

### 2. LogDNA (Logs centralisés)
- Créer un compte LogDNA
- Configurer les endpoints de logs
- Ajouter les variables d'environnement

### 3. New Relic (Performance)
- Créer un compte New Relic
- Installer l'agent Node.js
- Configurer les variables d'environnement

## 🔒 Sécurité

### Variables d'environnement critiques
- `JWT_SECRET`: Clé secrète pour les tokens JWT
- `STRIPE_SECRET_KEY`: Clé secrète Stripe
- `DATABASE_URL`: URL de connexion à la base de données
- `FIREBASE_PRIVATE_KEY`: Clé privée Firebase

### Bonnes pratiques
- Utiliser des secrets managers (AWS Secrets Manager, Heroku Config Vars)
- Rotation régulière des clés
- Monitoring des accès
- Chiffrement des données sensibles

## 🧪 Tests de Production

### Tests de charge
```bash
# Installer Artillery
npm install -g artillery

# Lancer les tests
artillery run load-tests.yml
```

### Tests de sécurité
```bash
# Audit des dépendances
npm audit

# Scan de vulnérabilités
npm run security:scan
```

## 📈 Monitoring Post-Déploiement

1. **Métriques à surveiller**
   - Temps de réponse API
   - Taux d'erreur
   - Utilisation CPU/Mémoire
   - Connexions base de données

2. **Alertes à configurer**
   - Erreurs 5xx > 1%
   - Temps de réponse > 2s
   - Utilisation CPU > 80%
   - Espace disque > 90%

## 🆘 Dépannage

### Problèmes courants

1. **Erreurs de base de données**
   - Vérifier les connexions SSL
   - Vérifier les permissions utilisateur
   - Vérifier les limites de connexions

2. **Erreurs Stripe**
   - Vérifier les clés API
   - Vérifier les webhooks
   - Vérifier les comptes Connect

3. **Erreurs de notifications**
   - Vérifier les certificats Firebase
   - Vérifier les tokens FCM
   - Vérifier les permissions iOS

## 📞 Support

En cas de problème :
1. Vérifier les logs d'application
2. Vérifier les logs de serveur
3. Consulter la documentation des services
4. Contacter l'équipe de développement

---

**Note**: Ce guide doit être mis à jour selon l'évolution du projet et les choix d'infrastructure. 