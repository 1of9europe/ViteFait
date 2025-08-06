# Utiliser Node.js 18 Alpine pour une image plus légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/cache/apk/*

# Copier les fichiers de configuration des dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY jest.e2e.config.js ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY src/ ./src/
COPY tests/ ./tests/

# Compiler TypeScript
RUN npm run build

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Commande de démarrage
CMD ["npm", "start"] 