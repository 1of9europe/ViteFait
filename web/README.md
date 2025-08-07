# ViteFait Web - Application Client/Admin

Application web React pour la gestion des missions de conciergerie urbaine ViteFait.

## 🚀 Technologies

- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **React Router DOM** pour le routing
- **Redux Toolkit** pour la gestion d'état
- **Formik + Yup** pour les formulaires et validations
- **Axios** pour les appels API
- **Lucide React** pour les icônes
- **Socket.IO Client** pour la communication temps réel

## 📁 Structure du projet

```
web/
├── src/
│   ├── components/
│   │   ├── ui/                 # Composants réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── Alert.tsx
│   │   └── ProtectedRoute.tsx  # Guard de routes
│   ├── layouts/
│   │   └── MainLayout.tsx      # Layout principal
│   ├── pages/                  # Pages de l'application
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Missions.tsx
│   │   ├── NouvelleMission.tsx
│   │   ├── MissionDetails.tsx
│   │   ├── Paiements.tsx
│   │   ├── Messages.tsx
│   │   └── Parametres.tsx
│   ├── services/
│   │   └── api.ts             # Service API avec intercepteurs
│   ├── store/                 # Redux store
│   │   ├── store.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── missionsSlice.ts
│   │       └── paymentsSlice.ts
│   ├── utils/
│   │   └── cn.ts              # Utilitaires
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env                       # Variables d'environnement
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Backend ViteFait en cours d'exécution

### Installation depuis la racine du monorepo

```bash
# Installer toutes les dépendances du monorepo
npm run install:all

# Ou installer uniquement les dépendances web
cd web && npm install
```

### Variables d'environnement

Créer un fichier `.env` dans le dossier `web/` :

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=ViteFait
VITE_APP_VERSION=1.0.0
VITE_STRIPE_KEY=pk_test_your_stripe_public_key_here
VITE_SOCKET_URL=http://localhost:3001
```

## 🚀 Démarrage

### Développement

```bash
# Depuis la racine du monorepo
npm run dev:web

# Ou depuis le dossier web
cd web && npm run dev
```

L'application sera accessible sur `http://localhost:3004` (ou le port suivant disponible).

### Production

```bash
# Build de production
npm run build:web

# Prévisualiser le build
npm run preview
```

Le build sera généré dans le dossier `web/dist/`.

## 🔐 Authentification

L'application utilise un système d'authentification JWT avec :

- **Login/Logout** : Gestion des sessions
- **Refresh Token** : Renouvellement automatique des tokens
- **Routes protégées** : Redirection automatique vers `/login`
- **Gestion des rôles** : Client, Admin, Concierge

## 📱 Fonctionnalités

### Dashboard
- Vue d'ensemble des missions
- Statistiques en temps réel
- Missions récentes

### Missions
- **Liste** : Filtres, recherche, pagination
- **Détails** : Informations complètes + actions
- **Création** : Wizard 4 étapes
  - Infos générales
  - Adresses
  - Créneau horaire
  - Paiement & confirmation

### Paiements
- Historique des transactions
- Intégration Stripe (préparée)
- Statuts de paiement

### Messagerie
- Conversations par mission
- Messages temps réel (préparé)

### Paramètres
- Gestion du profil utilisateur
- Préférences de notification

## 🔧 API Integration

### Services disponibles

- **Auth** : `login`, `logout`, `getProfile`, `updateProfile`
- **Missions** : `getMissions`, `getMission`, `createMission`, `updateMissionStatus`
- **Paiements** : `getPayments`, `createPaymentIntent`, `confirmPayment`
- **Chat** : `getChatMessages`, `sendMessage`
- **Notifications** : `getNotifications`, `markAsRead`

### Gestion d'erreurs

- **Intercepteurs Axios** : Gestion automatique des tokens
- **Refresh Token** : Renouvellement automatique
- **Messages d'erreur** : Traduction user-friendly
- **Logs développement** : Détails des erreurs en mode dev

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests E2E (Playwright)
npm run e2e
```

### Tests disponibles

- **ProtectedRoute** : Vérification des guards
- **Wizard** : Validations par étape
- **API Service** : Intercepteurs et gestion d'erreurs
- **Composants UI** : Rendu et interactions

## 📦 Build & Déploiement

### Build de production

```bash
npm run build:web
```

Le build optimisé sera dans `web/dist/` avec :
- Code minifié et optimisé
- Assets optimisés
- Source maps pour le debugging

### Déploiement

L'application peut être déployée sur :
- **Vercel** : Déploiement automatique depuis Git
- **Netlify** : Drag & drop du dossier `dist/`
- **Serveur statique** : Nginx, Apache, etc.

### Variables de production

```env
VITE_API_BASE_URL=https://api.vitefait.com
VITE_STRIPE_KEY=pk_live_your_stripe_public_key
```

## 🔄 Intégration Monorepo

### Scripts disponibles

```bash
# Développement
npm run dev:web          # Frontend uniquement
npm run dev              # Backend + Frontend

# Build
npm run build:web        # Build frontend
npm run build            # Build complet

# Tests
npm run test:web         # Tests frontend
npm run test             # Tests complets

# Linting
npm run lint:web         # Lint frontend
npm run lint             # Lint complet
```

### Workspaces

L'application web est intégrée dans le monorepo via npm workspaces :

```json
{
  "workspaces": [
    "backend",
    "mobile", 
    "web"
  ]
}
```

## 🐛 Debugging

### Mode développement

- **Hot Reload** : Vite HMR
- **Source Maps** : Debugging TypeScript
- **Logs API** : Détails des requêtes/réponses
- **Redux DevTools** : Inspection du state

### Variables d'environnement

```bash
# Mode développement
NODE_ENV=development

# Logs détaillés
DEBUG=vitefait:*
```

## 📚 Documentation API

L'API backend doit exposer les endpoints suivants :

### Authentification
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Missions
- `GET /api/missions`
- `GET /api/missions/:id`
- `POST /api/missions`
- `PUT /api/missions/:id`
- `PATCH /api/missions/:id/status`

### Paiements
- `GET /api/payments`
- `POST /api/payments/create-intent`
- `POST /api/payments/confirm`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code

- **ESLint** : Configuration monorepo
- **Prettier** : Formatage automatique
- **TypeScript** : Mode strict activé
- **Tests** : Couverture minimale 80%

## 📄 Licence

Ce projet fait partie de ViteFait et est sous licence propriétaire.

## 🆘 Support

Pour toute question ou problème :
- **Issues GitHub** : [Créer une issue](https://github.com/vitefait/web/issues)
- **Documentation** : [Wiki du projet](https://github.com/vitefait/web/wiki)
- **Email** : support@vitefait.com
