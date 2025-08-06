# 🚀 Guide de Déploiement - Conciergerie Urbaine

## 📋 Table des matières

1. [Environnements](#environnements)
2. [Déploiement Local](#déploiement-local)
3. [Déploiement Staging](#déploiement-staging)
4. [Déploiement Production](#déploiement-production)
5. [Configuration Docker](#configuration-docker)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring et Logs](#monitoring-et-logs)
8. [Sécurité](#sécurité)
9. [Troubleshooting](#troubleshooting)

---

## 🌍 Environnements

### Développement
- **URL**: `http://localhost:3000`
- **Base de données**: PostgreSQL local
- **Variables d'environnement**: `.env.development`

### Staging
- **URL**: `https://staging-api.conciergerie.local`
- **Base de données**: PostgreSQL staging
- **Variables d'environnement**: `.env.staging`

### Production
- **URL**: `https://api.conciergerie.local`
- **Base de données**: PostgreSQL production
- **Variables d'environnement**: `.env.production`

---

## 🏠 Déploiement Local

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optionnel)

### Installation rapide avec Docker

```bash
# Cloner le repository
git clone https://github.com/votre-username/conciergerie-urbaine.git
cd conciergerie-urbaine

# Lancer l'environnement complet
docker-compose up -d

# Vérifier que tout fonctionne
curl http://localhost:3000/health
```

### Installation manuelle

```bash
# Installer les dépendances
cd server
npm install

# Configurer la base de données
cp .env.example .env.development
# Éditer .env.development avec vos paramètres

# Initialiser la base de données
npm run migrate

# Créer les données de test
npm run seed

# Lancer l'application
npm run dev
```

### Vérification

```bash
# Test de santé
curl http://localhost:3000/health

# Documentation API
open http://localhost:3000/api-docs

# Tests
npm run test:coverage
```

---

## 🧪 Déploiement Staging

### Avec Docker Compose

```bash
# Lancer l'environnement staging
docker-compose --env-file .env.staging up -d

# Vérifier les services
docker-compose ps

# Logs
docker-compose logs -f api
```

### Variables d'environnement staging

```bash
# .env.staging
NODE_ENV=staging
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=conciergerie_urbaine_staging
JWT_SECRET=staging-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=staging-refresh-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Tests de validation

```bash
# Tests de fumée
curl -f http://staging-api.conciergerie.local/health

# Tests E2E
npm run test:e2e:full

# Vérification de la couverture
npm run check-coverage
```

---

## 🌐 Déploiement Production

### Prérequis
- Serveur avec Docker
- Base de données PostgreSQL
- Certificats SSL
- Domaine configuré

### Déploiement avec Docker

```bash
# Build de l'image
docker build -t conciergerie-api:latest ./server

# Variables d'environnement production
export $(cat .env.production | xargs)

# Lancer le conteneur
docker run -d \
  --name conciergerie-api \
  --env-file .env.production \
  -p 3000:3000 \
  --restart unless-stopped \
  conciergerie-api:latest
```

### Déploiement avec Docker Compose

```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Vérification
docker-compose -f docker-compose.prod.yml ps
```

### Configuration Nginx

```nginx
# /etc/nginx/sites-available/conciergerie
server {
    listen 80;
    server_name api.conciergerie.local;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.conciergerie.local;

    ssl_certificate /etc/letsencrypt/live/api.conciergerie.local/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.conciergerie.local/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🐳 Configuration Docker

### Dockerfile optimisé

```dockerfile
# Multi-stage build pour optimiser la taille
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

USER nodejs
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build: ./server
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: conciergerie_urbaine_prod
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 🔄 CI/CD Pipeline

### Workflow GitHub Actions

Le pipeline CI/CD est configuré dans `.github/workflows/ci.yml` et comprend :

1. **Tests & Qualité**
   - Linting et type checking
   - Tests unitaires avec couverture >80%
   - Tests d'intégration

2. **Tests E2E**
   - Tests end-to-end complets
   - Validation des flux utilisateur

3. **Build & Sécurité**
   - Audit de sécurité
   - Build de l'application
   - Build de l'image Docker

4. **Déploiement**
   - Staging automatique (branche `develop`)
   - Production manuel (branche `main`)

### Déclenchement manuel

```bash
# Déclencher un déploiement staging
gh workflow run ci.yml --ref develop

# Déclencher un déploiement production
gh workflow run ci.yml --ref main
```

---

## 📊 Monitoring et Logs

### Health Checks

```bash
# Vérification de santé
curl -f http://api.conciergerie.local/health

# Métriques détaillées
curl http://api.conciergerie.local/metrics
```

### Logs

```bash
# Logs de l'application
docker logs conciergerie-api

# Logs avec suivi
docker logs -f conciergerie-api

# Logs filtrés
docker logs conciergerie-api | grep ERROR
```

### Monitoring avec Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'conciergerie-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

---

## 🔒 Sécurité

### Variables d'environnement sensibles

```bash
# Ne jamais commiter ces fichiers
.env.production
.env.staging
*.pem
*.key
```

### Certificats SSL

```bash
# Génération avec Let's Encrypt
sudo certbot certonly --nginx -d api.conciergerie.local

# Renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall

```bash
# Configuration UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🔧 Troubleshooting

### Problèmes courants

#### Base de données non accessible
```bash
# Vérifier la connexion
docker exec -it conciergerie-postgres psql -U postgres -d conciergerie_urbaine

# Vérifier les logs
docker logs conciergerie-postgres
```

#### Application ne démarre pas
```bash
# Vérifier les logs
docker logs conciergerie-api

# Vérifier les variables d'environnement
docker exec conciergerie-api env | grep DB_
```

#### Tests qui échouent
```bash
# Nettoyer et relancer
npm run test:coverage -- --clearCache
docker-compose down && docker-compose up -d
```

### Commandes utiles

```bash
# Redémarrer un service
docker-compose restart api

# Voir l'utilisation des ressources
docker stats

# Nettoyer les conteneurs
docker system prune -a

# Sauvegarder la base de données
docker exec conciergerie-postgres pg_dump -U postgres conciergerie_urbaine > backup.sql
```

---

## 📞 Support

Pour toute question ou problème :

1. Consulter les logs : `docker logs conciergerie-api`
2. Vérifier la santé : `curl http://api.conciergerie.local/health`
3. Consulter la documentation : `/api-docs`
4. Ouvrir une issue sur GitHub

---

**🎉 Votre application Conciergerie Urbaine est maintenant déployée !** 