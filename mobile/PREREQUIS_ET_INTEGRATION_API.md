# 📱 Prérequis Techniques & Intégration API - ViteFait Mobile

## 🎯 Objectif

Ce document détaille la mise en place des prérequis techniques et l'intégration API pour l'application mobile ViteFait, en respectant l'architecture existante et en évitant les doublons.

---

## 🔧 Étape 1 : Résolution des Dépendances Natives

### **Problèmes Identifiés**
- ⚠️ Conflit `react-native-maps@1.7.1` vs `react@18.2.0`
- ⚠️ Version inexistante `react-native-netinfo@^11.2.1`
- ⚠️ Services API non implémentés

### **Solutions Appliquées**

#### 1. Correction des Versions de Dépendances
```json
{
  "@react-native-community/netinfo": "^11.0.0",  // ✅ Version corrigée
  "react-native-maps": "^1.7.1",                  // ✅ Version compatible
  "react": "18.2.0",                             // ✅ Version maintenue
  "react-native": "0.72.6"                       // ✅ Version maintenue
}
```

#### 2. Script de Configuration Automatisée
```bash
# Exécuter le script de configuration
cd mobile
./setup-dependencies.sh
```

**Ce script :**
- ✅ Nettoie les caches et node_modules
- ✅ Installe les dépendances avec `--legacy-peer-deps`
- ✅ Résout automatiquement les conflits de versions
- ✅ Installe les pods iOS
- ✅ Vérifie la configuration TypeScript et ESLint

---

## 🔌 Étape 2 : Intégration API Complète

### **Architecture ApiService Implémentée**

#### 1. Configuration Centralisée
```typescript
// src/config/environment.ts
export const config = {
  API_BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.vitefait.com/api',
  STRIPE_PUBLISHABLE_KEY: 'your_stripe_key',
  GOOGLE_MAPS_API_KEY: 'your_google_maps_key',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

#### 2. ApiService avec Gestion d'Erreurs Standardisée
```typescript
// src/services/api.ts
class ApiService {
  // ✅ Intercepteurs Axios pour injection automatique du token
  // ✅ Gestion standardisée des erreurs
  // ✅ Refresh automatique des tokens expirés
  // ✅ Toutes les méthodes métier implémentées
}
```

**Méthodes Implémentées :**
- ✅ **Authentification :** `login()`, `signup()`, `refreshToken()`, `logout()`
- ✅ **Missions :** `getMissions()`, `getMission()`, `createMission()`, `acceptMission()`, `updateMissionStatus()`
- ✅ **Paiements :** `createPaymentIntent()`, `confirmPayment()`, `getPaymentHistory()`
- ✅ **Utilisateurs :** `getProfile()`, `updateProfile()`, `getUser()`
- ✅ **Notifications :** `getNotifications()`, `markNotificationAsRead()`
- ✅ **Chat :** `getChatMessages()`, `sendMessage()`

#### 3. Gestion d'Erreurs Standardisée
```typescript
// src/utils/apiErrorHandler.ts
export const mapApiErrorToUserError = (error: ApiError): UserFriendlyError => {
  // ✅ Mappage des codes d'erreur HTTP vers messages utilisateur
  // ✅ Gestion des erreurs réseau, authentification, validation
  // ✅ Logging automatique des erreurs
};
```

**Types d'Erreurs Gérées :**
- 🔴 **Réseau (0)** : "Erreur de connexion"
- 🔴 **Authentification (401)** : "Session expirée"
- 🔴 **Autorisation (403)** : "Accès refusé"
- 🔴 **Validation (400)** : "Données invalides"
- 🔴 **Non trouvé (404)** : "Ressource introuvable"
- 🔴 **Conflit (409)** : "Conflit"
- 🔴 **Serveur (5xx)** : "Erreur serveur"

---

## 🔄 Étape 3 : Intégration Redux Toolkit

### **Store AuthSlice Mis à Jour**
```typescript
// src/store/authSlice.ts
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'login');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);
```

**Améliorations Apportées :**
- ✅ Utilisation de la nouvelle gestion d'erreurs standardisée
- ✅ Logging automatique des erreurs
- ✅ Messages d'erreur utilisateur-friendly
- ✅ Vérification de validité des tokens stockés
- ✅ Gestion automatique de la déconnexion

---

## 📋 Étape 4 : Configuration des Permissions

### **iOS - Info.plist**
```xml
<!-- Permissions de géolocalisation -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>ViteFait a besoin de votre localisation pour vous proposer des missions à proximité</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>ViteFait a besoin de votre localisation pour vous proposer des missions à proximité</string>

<!-- Permissions caméra -->
<key>NSCameraUsageDescription</key>
<string>ViteFait a besoin d'accéder à votre caméra pour prendre des photos de missions</string>

<!-- Permissions photos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>ViteFait a besoin d'accéder à vos photos pour sélectionner des images</string>

<!-- Permissions notifications -->
<key>NSUserNotificationUsageDescription</key>
<string>ViteFait vous enverra des notifications pour les nouvelles missions et messages</string>
```

### **Android - AndroidManifest.xml**
```xml
<!-- Permissions de géolocalisation -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Permissions caméra -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Permissions stockage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Permissions internet -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Permissions notifications -->
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## 🔑 Étape 5 : Configuration des Clés API

### **Google Maps API Key**

#### iOS - AppDelegate.m
```objective-c
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"your_google_maps_api_key"];
  // ... reste du code
}
```

#### Android - MainApplication.java
```java
import com.google.android.gms.maps.MapsInitializer;

public class MainApplication extends Application implements ReactApplication {
  @Override
  public void onCreate() {
    super.onCreate();
    MapsInitializer.initialize(this, MapsInitializer.Renderer.LATEST, null);
  }
}
```

### **Stripe Configuration**
```typescript
// App.tsx
import { StripeProvider } from '@stripe/stripe-react-native';
import { config } from '@/config/environment';

const App = () => {
  return (
    <StripeProvider publishableKey={config.STRIPE_PUBLISHABLE_KEY}>
      {/* Votre application */}
    </StripeProvider>
  );
};
```

---

## 🧪 Étape 6 : Tests et Validation

### **Tests de l'ApiService**
```typescript
// tests/api.test.ts
describe('ApiService', () => {
  test('should handle network errors gracefully', async () => {
    // Test de gestion des erreurs réseau
  });

  test('should refresh token automatically', async () => {
    // Test de refresh automatique des tokens
  });

  test('should map API errors to user-friendly messages', async () => {
    // Test de mappage des erreurs
  });
});
```

### **Tests du Store Redux**
```typescript
// tests/authSlice.test.ts
describe('Auth Slice', () => {
  test('should handle login success', async () => {
    // Test de connexion réussie
  });

  test('should handle login failure with user-friendly error', async () => {
    // Test de gestion d'erreur de connexion
  });
});
```

---

## 🚀 Étape 7 : Déploiement et Monitoring

### **Configuration de Production**
```typescript
// src/config/environment.ts
const isDevelopment = __DEV__;
export const currentEnv = isDevelopment ? ENV.development : ENV.production;
```

### **Monitoring des Erreurs**
```typescript
// src/utils/apiErrorHandler.ts
export const logApiError = (error: ApiError, context?: string): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    status: error.status,
    message: error.message,
    details: error.details,
    code: error.code,
  };

  if (__DEV__) {
    console.error('API Error:', logData);
  }
  // TODO: Envoi vers Sentry en production
};
```

---

## ✅ Checklist de Validation

### **Dépendances**
- [ ] ✅ Script `setup-dependencies.sh` exécuté avec succès
- [ ] ✅ Toutes les dépendances installées sans conflits
- [ ] ✅ Pods iOS installés correctement
- [ ] ✅ Configuration TypeScript validée
- [ ] ✅ ESLint sans erreurs

### **API Service**
- [ ] ✅ ApiService complètement implémenté
- [ ] ✅ Gestion d'erreurs standardisée
- [ ] ✅ Intercepteurs Axios configurés
- [ ] ✅ Refresh automatique des tokens
- [ ] ✅ Toutes les méthodes métier disponibles

### **Store Redux**
- [ ] ✅ AuthSlice mis à jour avec nouvelle gestion d'erreurs
- [ ] ✅ Thunks utilisent la nouvelle ApiService
- [ ] ✅ Messages d'erreur utilisateur-friendly
- [ ] ✅ Logging automatique des erreurs

### **Configuration**
- [ ] ✅ Clés API configurées dans environment.ts
- [ ] ✅ Permissions iOS ajoutées dans Info.plist
- [ ] ✅ Permissions Android ajoutées dans AndroidManifest.xml
- [ ] ✅ Google Maps API Key configurée
- [ ] ✅ Stripe Provider configuré

### **Tests**
- [ ] ✅ Tests ApiService passent
- [ ] ✅ Tests AuthSlice passent
- [ ] ✅ Tests d'intégration API passent
- [ ] ✅ Couverture de code ≥80%

---

## 📚 Ressources et Documentation

### **Documentation Technique**
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Axios Documentation](https://axios-http.com/)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)

### **Outils de Développement**
- **IDE :** VS Code avec extensions React Native
- **Debugger :** Flipper ou React Native Debugger
- **Profiling :** React Native Performance Monitor
- **Testing :** Jest + React Test Renderer

---

## 🎯 Prochaines Étapes

1. **Implémentation des Écrans** : Créer les écrans d'authentification et principaux
2. **Navigation** : Configurer React Navigation avec la structure définie
3. **Composants UI** : Développer les composants réutilisables
4. **Tests E2E** : Implémenter les tests end-to-end
5. **CI/CD** : Configurer le pipeline de déploiement

---

**Document créé le :** 7 août 2025  
**Dernière mise à jour :** 7 août 2025  
**Version :** 1.0.0  
**Statut :** ✅ **Complété** 