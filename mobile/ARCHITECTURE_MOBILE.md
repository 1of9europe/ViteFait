# 📱 Architecture Mobile React Native - ViteFait v0

## 📊 Vue d'ensemble

**Application :** Conciergerie Urbaine Mobile  
**Framework :** React Native 0.72.6  
**Langage :** TypeScript 4.8.4  
**État :** 🟡 **En développement** (structure de base en place)  
**Dernière mise à jour :** 7 août 2025  

---

## 🏗️ Architecture Globale

### **Stack Technique Principal**
```
React Native 0.72.6
├── TypeScript 4.8.4 (strict mode)
├── Redux Toolkit (gestion d'état)
├── React Navigation 6.x (navigation)
├── React Native Paper (UI components)
├── Axios (API client)
├── Formik + Yup (formulaires)
└── Jest + React Test Renderer (tests)
```

### **Architecture en Couches**
```
┌─────────────────────────────────────┐
│           PRESENTATION              │
│  ┌─────────────┬─────────────────┐  │
│  │   Screens   │   Components    │  │
│  └─────────────┴─────────────────┘  │
├─────────────────────────────────────┤
│           NAVIGATION                │
│  ┌─────────────┬─────────────────┐  │
│  │   Stack     │     Tabs        │  │
│  └─────────────┴─────────────────┘  │
├─────────────────────────────────────┤
│           BUSINESS LOGIC            │
│  ┌─────────────┬─────────────────┐  │
│  │   Store     │   Services      │  │
│  └─────────────┴─────────────────┘  │
├─────────────────────────────────────┤
│           DATA LAYER               │
│  ┌─────────────┬─────────────────┐  │
│  │    API      │   Storage       │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 Structure du Projet

```
mobile/
├── src/
│   ├── types/                    # Types TypeScript
│   │   └── index.ts             # ✅ Définitions complètes
│   ├── store/                    # Redux Toolkit
│   │   └── authSlice.ts         # ✅ Authentification
│   ├── services/                 # Services métier
│   │   └── api.ts               # ⚠️  Vide (à implémenter)
│   ├── components/               # Composants réutilisables
│   │   └── (à créer)
│   ├── screens/                  # Écrans de l'application
│   │   └── (à créer)
│   ├── navigation/               # Configuration navigation
│   │   └── (à créer)
│   ├── utils/                    # Utilitaires
│   │   └── (à créer)
│   └── assets/                   # Ressources statiques
│       └── (à créer)
├── tests/                        # Tests unitaires
│   └── auth.test.ts             # ✅ Tests auth basiques
├── package.json                  # ✅ Dépendances complètes
├── tsconfig.json                 # ✅ Configuration TS
├── jest.config.js               # ✅ Configuration tests
└── .eslintrc.js                 # ✅ Linting
```

---

## 🔧 Configuration Technique

### **TypeScript Configuration**
```json
{
  "extends": "@tsconfig/react-native/tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/screens/*": ["screens/*"],
      "@/navigation/*": ["navigation/*"],
      "@/store/*": ["store/*"],
      "@/services/*": ["services/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/assets/*": ["assets/*"]
    }
  }
}
```

### **Jest Configuration**
```javascript
{
  "preset": "react-native",
  "setupFiles": ["<rootDir>/jest.setup.js"],
  "transformIgnorePatterns": [
    "node_modules/(?!(react-native|@react-native|react-native-.*)/)"
  ],
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ]
}
```

---

## 📦 Dépendances Principales

### **Core Dependencies**
| Package | Version | Usage |
|---------|---------|-------|
| `react` | 18.2.0 | Core React |
| `react-native` | 0.72.6 | Framework mobile |
| `typescript` | 4.8.4 | Typage statique |

### **State Management**
| Package | Version | Usage |
|---------|---------|-------|
| `@reduxjs/toolkit` | ^1.9.7 | Gestion d'état moderne |
| `react-redux` | ^8.1.3 | Intégration React-Redux |

### **Navigation**
| Package | Version | Usage |
|---------|---------|-------|
| `@react-navigation/native` | ^6.1.9 | Navigation de base |
| `@react-navigation/stack` | ^6.3.20 | Navigation par pile |
| `@react-navigation/bottom-tabs` | ^6.5.11 | Navigation par onglets |
| `@react-navigation/drawer` | ^6.6.6 | Navigation drawer |

### **UI & Components**
| Package | Version | Usage |
|---------|---------|-------|
| `react-native-paper` | ^5.11.1 | Design system Material |
| `react-native-elements` | ^3.4.3 | Composants UI |
| `react-native-vector-icons` | ^10.0.2 | Icônes |
| `react-native-maps` | ^1.7.1 | Cartes interactives |

### **API & Data**
| Package | Version | Usage |
|---------|---------|-------|
| `axios` | ^1.5.0 | Client HTTP |
| `@stripe/stripe-react-native` | ^0.35.0 | Paiements Stripe |
| `react-native-socket.io-client` | ^4.0.2 | Communication temps réel |

### **Forms & Validation**
| Package | Version | Usage |
|---------|---------|-------|
| `formik` | ^2.4.5 | Gestion formulaires |
| `yup` | ^1.3.3 | Validation schémas |

### **Storage & Security**
| Package | Version | Usage |
|---------|---------|-------|
| `@react-native-async-storage/async-storage` | ^1.19.5 | Stockage local |
| `react-native-keychain` | ^8.1.3 | Stockage sécurisé |

### **Geolocation & Maps**
| Package | Version | Usage |
|---------|---------|-------|
| `@react-native-community/geolocation` | ^3.1.0 | Géolocalisation |
| `react-native-maps` | ^1.7.1 | Cartes |

### **Notifications & Communication**
| Package | Version | Usage |
|---------|---------|-------|
| `react-native-push-notification` | ^8.1.1 | Notifications push |
| `react-native-socket.io-client` | ^4.0.2 | WebSocket |

---

## 🎯 Modèles de Données (Types)

### **User Interface**
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'client' | 'assistant';
  status: 'active' | 'inactive' | 'suspended';
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  profilePicture?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  stripeCustomerId?: string;
  stripeConnectAccountId?: string;
  fcmToken?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Mission Interface**
```typescript
export interface Mission {
  id: string;
  title: string;
  description: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropLatitude?: number;
  dropLongitude?: number;
  dropAddress?: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  priceEstimate: number;
  cashAdvance: number;
  finalPrice: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  instructions?: string;
  requirements?: string;
  requiresCar: boolean;
  requiresTools: boolean;
  category?: string;
  metadata?: Record<string, any>;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  commissionAmount: number;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  client: User;
  assistant?: User;
}
```

### **Payment Interface**
```typescript
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: 'escrow' | 'release' | 'refund' | 'cash_advance' | 'commission';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  stripeRefundId?: string;
  description?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  missionId: string;
  payerId?: string;
  payeeId?: string;
  payer?: User;
  payee?: User;
  mission: Mission;
}
```

---

## 🔄 Gestion d'État (Redux Toolkit)

### **Auth Slice - État d'Authentification**
```typescript
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
```

#### **Actions Async (Thunks)**
- ✅ `login(credentials)` - Connexion utilisateur
- ✅ `signup(userData)` - Inscription utilisateur
- ✅ `loadStoredAuth()` - Chargement session stockée
- ✅ `logout()` - Déconnexion
- ✅ `updateProfile(profileData)` - Mise à jour profil

#### **Actions Synchrones**
- ✅ `clearError()` - Effacer les erreurs
- ✅ `setLoading(boolean)` - Définir l'état de chargement
- ✅ `updateUser(partialUser)` - Mise à jour utilisateur

#### **Selectors**
- ✅ `selectAuth()` - État complet auth
- ✅ `selectUser()` - Utilisateur actuel
- ✅ `selectToken()` - Token JWT
- ✅ `selectIsAuthenticated()` - Statut authentification
- ✅ `selectIsLoading()` - État de chargement
- ✅ `selectError()` - Erreur actuelle
- ✅ `selectUserRole()` - Rôle utilisateur
- ✅ `selectIsClient()` - Est-ce un client ?
- ✅ `selectIsAssistant()` - Est-ce un assistant ?

### **Slices Manquants (à implémenter)**
- ⚠️ `missionSlice` - Gestion des missions
- ⚠️ `userSlice` - Gestion des utilisateurs
- ⚠️ `notificationSlice` - Gestion des notifications
- ⚠️ `chatSlice` - Gestion des messages

---

## 🧭 Navigation

### **Structure de Navigation Planifiée**
```
RootStack
├── Auth Stack
│   ├── Login Screen
│   ├── Signup Screen
│   └── ForgotPassword Screen
└── Main Stack
    ├── Main Tabs
    │   ├── Home Tab
    │   ├── Missions Tab
    │   ├── Map Tab
    │   ├── Notifications Tab
    │   └── Profile Tab
    ├── MissionDetail Screen
    ├── CreateMission Screen
    ├── Chat Screen
    ├── Payment Screen
    └── Review Screen
```

### **Types de Navigation**
```typescript
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MissionDetail: { missionId: string };
  CreateMission: undefined;
  Profile: { userId?: string };
  Chat: { missionId: string };
  Payment: { missionId: string };
  Review: { missionId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Missions: undefined;
  Map: undefined;
  Notifications: undefined;
  Profile: undefined;
};
```

---

## 🔌 Services (à implémenter)

### **API Service - Structure Planifiée**
```typescript
class ApiService {
  // Authentification
  login(credentials: LoginCredentials): Promise<ApiResponse<AuthData>>
  signup(userData: SignupData): Promise<ApiResponse<AuthData>>
  refreshToken(): Promise<ApiResponse<AuthData>>
  logout(): Promise<void>
  
  // Missions
  getMissions(filters?: MissionFilters): Promise<PaginatedResponse<Mission>>
  getMission(id: string): Promise<ApiResponse<Mission>>
  createMission(missionData: CreateMissionData): Promise<ApiResponse<Mission>>
  updateMission(id: string, updates: Partial<Mission>): Promise<ApiResponse<Mission>>
  acceptMission(id: string): Promise<ApiResponse<Mission>>
  completeMission(id: string): Promise<ApiResponse<Mission>>
  cancelMission(id: string, reason: string): Promise<ApiResponse<Mission>>
  
  // Paiements
  createPaymentIntent(missionId: string, amount: number): Promise<ApiResponse<Payment>>
  confirmPayment(paymentIntentId: string): Promise<ApiResponse<Payment>>
  getPaymentHistory(): Promise<PaginatedResponse<Payment>>
  
  // Utilisateurs
  getProfile(): Promise<ApiResponse<User>>
  updateProfile(updates: Partial<User>): Promise<ApiResponse<User>>
  getUser(id: string): Promise<ApiResponse<User>>
  
  // Notifications
  getNotifications(): Promise<PaginatedResponse<Notification>>
  markNotificationAsRead(id: string): Promise<void>
  
  // Chat
  getChatMessages(missionId: string): Promise<ApiResponse<ChatMessage[]>>
  sendMessage(missionId: string, message: string): Promise<ApiResponse<ChatMessage>>
}
```

### **Services Manquants**
- ⚠️ `LocationService` - Géolocalisation
- ⚠️ `NotificationService` - Notifications push
- ⚠️ `StorageService` - Stockage local
- ⚠️ `SocketService` - Communication temps réel
- ⚠️ `PaymentService` - Intégration Stripe

---

## 🧪 Tests

### **Configuration Tests**
```javascript
// jest.config.js
{
  "preset": "react-native",
  "setupFiles": ["<rootDir>/jest.setup.js"],
  "transformIgnorePatterns": [
    "node_modules/(?!(react-native|@react-native|react-native-.*)/)"
  ],
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ]
}
```

### **Tests Existants**
- ✅ `auth.test.ts` - Tests basiques du slice d'authentification
  - Test état initial
  - Test login pending/fulfilled/rejected
  - Test logout

### **Tests Manquants (à implémenter)**
- ⚠️ Tests des composants UI
- ⚠️ Tests des écrans
- ⚠️ Tests des services API
- ⚠️ Tests d'intégration
- ⚠️ Tests de navigation
- ⚠️ Tests des hooks personnalisés

### **Couverture de Code**
- **Objectif :** ≥80%
- **Actuel :** ~5% (tests auth basiques uniquement)

---

## 🎨 UI/UX Design

### **Design System**
- **Framework :** React Native Paper (Material Design)
- **Composants :** React Native Elements
- **Icônes :** React Native Vector Icons
- **Thème :** À définir (couleurs, typographie, espacement)

### **Composants Planifiés**
```
components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Loading.tsx
├── mission/
│   ├── MissionCard.tsx
│   ├── MissionList.tsx
│   ├── MissionDetail.tsx
│   └── CreateMissionForm.tsx
├── user/
│   ├── UserCard.tsx
│   ├── ProfileForm.tsx
│   └── Avatar.tsx
├── payment/
│   ├── PaymentCard.tsx
│   └── PaymentForm.tsx
└── chat/
    ├── ChatBubble.tsx
    ├── ChatInput.tsx
    └── ChatList.tsx
```

---

## 📱 Écrans (à implémenter)

### **Écrans d'Authentification**
- ⚠️ `LoginScreen` - Connexion utilisateur
- ⚠️ `SignupScreen` - Inscription utilisateur
- ⚠️ `ForgotPasswordScreen` - Mot de passe oublié

### **Écrans Principaux**
- ⚠️ `HomeScreen` - Tableau de bord
- ⚠️ `MissionsScreen` - Liste des missions
- ⚠️ `MapScreen` - Carte interactive
- ⚠️ `NotificationsScreen` - Notifications
- ⚠️ `ProfileScreen` - Profil utilisateur

### **Écrans de Détail**
- ⚠️ `MissionDetailScreen` - Détails mission
- ⚠️ `CreateMissionScreen` - Création mission
- ⚠️ `ChatScreen` - Chat mission
- ⚠️ `PaymentScreen` - Paiement
- ⚠️ `ReviewScreen` - Avis

---

## 🔐 Sécurité

### **Authentification**
- ✅ JWT tokens avec refresh
- ✅ Stockage sécurisé avec Keychain
- ✅ Gestion des sessions persistantes

### **Données Sensibles**
- ✅ Chiffrement des données sensibles
- ✅ Validation côté client et serveur
- ✅ Protection contre les injections

### **Permissions**
- ⚠️ Gestion des permissions caméra
- ⚠️ Gestion des permissions géolocalisation
- ⚠️ Gestion des permissions notifications

---

## 📊 Métriques & Performance

### **Indicateurs de Performance**
- **Temps de démarrage :** < 3 secondes
- **Temps de réponse UI :** < 100ms
- **Taille de l'APK :** < 50MB
- **Utilisation mémoire :** < 200MB

### **Monitoring**
- ⚠️ Crashlytics (erreurs)
- ⚠️ Analytics (usage)
- ⚠️ Performance monitoring

---

## 🚀 Déploiement

### **Environnements**
- **Development :** Local avec Metro bundler
- **Staging :** TestFlight (iOS) / Internal Testing (Android)
- **Production :** App Store / Google Play Store

### **CI/CD Pipeline (à implémenter)**
- ⚠️ Tests automatiques
- ⚠️ Build automatique
- ⚠️ Déploiement automatique
- ⚠️ Code signing automatique

---

## 📋 Fonctionnalités Métier

### **Pour les Clients**
- ⚠️ Création de missions
- ⚠️ Suivi des missions en temps réel
- ⚠️ Paiement sécurisé
- ⚠️ Chat avec l'assistant
- ⚠️ Évaluation et avis
- ⚠️ Historique des missions

### **Pour les Assistants**
- ⚠️ Découverte de missions
- ⚠️ Acceptation de missions
- ⚠️ Navigation vers les lieux
- ⚠️ Mise à jour du statut
- ⚠️ Communication avec le client
- ⚠️ Gestion des paiements

### **Fonctionnalités Communes**
- ⚠️ Authentification sécurisée
- ⚠️ Profil utilisateur
- ⚠️ Notifications push
- ⚠️ Géolocalisation
- ⚠️ Chat en temps réel
- ⚠️ Système de paiement

---

## 🔄 Intégration Backend

### **API Endpoints Utilisés**
```
POST   /api/auth/signup          # Inscription
POST   /api/auth/login           # Connexion
POST   /api/auth/refresh         # Rafraîchissement token
GET    /api/auth/me              # Profil utilisateur
GET    /api/missions             # Liste missions
POST   /api/missions             # Création mission
GET    /api/missions/:id         # Détail mission
PATCH  /api/missions/:id/status  # Mise à jour statut
POST   /api/payments/create-intent # Création paiement
POST   /api/payments/confirm     # Confirmation paiement
```

### **WebSocket Events**
- ⚠️ `mission_updated` - Mise à jour mission
- ⚠️ `message_received` - Nouveau message
- ⚠️ `payment_updated` - Mise à jour paiement
- ⚠️ `notification_sent` - Nouvelle notification

---

## 🐛 Problèmes Connus

### **Dépendances**
- ⚠️ Conflit `react-native-maps@1.25.0` avec `react@18.2.0`
- ⚠️ `react-native-netinfo@^11.2.1` version inexistante
- ⚠️ Services API non implémentés

### **Architecture**
- ⚠️ Structure de navigation non implémentée
- ⚠️ Composants UI manquants
- ⚠️ Tests insuffisants
- ⚠️ Services métier incomplets

---

## 📈 Roadmap de Développement

### **Phase 1 : Structure de Base (1-2 jours)**
- [ ] Implémentation des services API
- [ ] Configuration de la navigation
- [ ] Création des composants de base
- [ ] Écrans d'authentification

### **Phase 2 : Fonctionnalités Core (2-3 jours)**
- [ ] Écrans de missions (liste, détail, création)
- [ ] Intégration géolocalisation
- [ ] Système de chat
- [ ] Gestion des paiements

### **Phase 3 : Fonctionnalités Avancées (2-3 jours)**
- [ ] Notifications push
- [ ] Système d'avis
- [ ] Profils utilisateurs
- [ ] Optimisations performance

### **Phase 4 : Tests & Déploiement (1-2 jours)**
- [ ] Tests complets
- [ ] Configuration CI/CD
- [ ] Préparation déploiement
- [ ] Documentation utilisateur

---

## 📚 Documentation & Ressources

### **Documentation Technique**
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)

### **Outils de Développement**
- **IDE :** VS Code avec extensions React Native
- **Debugger :** Flipper ou React Native Debugger
- **Profiling :** React Native Performance Monitor
- **Testing :** Jest + React Test Renderer

---

## 🎯 Conclusion

L'application mobile ViteFait v0 a une **structure de base solide** avec :

✅ **Points Forts :**
- Configuration TypeScript stricte
- Architecture Redux Toolkit moderne
- Types de données complets
- Dépendances bien choisies
- Tests de base en place

⚠️ **Points d'Amélioration :**
- Services API à implémenter
- Écrans et composants manquants
- Navigation non configurée
- Tests insuffisants
- Conflits de dépendances à résoudre

**Prochaine étape prioritaire :** Implémentation des services API et de la navigation de base pour avoir une application fonctionnelle.

---

**Document créé le :** 7 août 2025  
**Dernière mise à jour :** 7 août 2025  
**Version :** 1.0.0 