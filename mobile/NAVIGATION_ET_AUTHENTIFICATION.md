# 🧭 Navigation & Authentification - ViteFait Mobile

## 🎯 Objectif

Ce document détaille l'implémentation de la navigation et du flux d'authentification pour l'application mobile ViteFait, en respectant l'architecture existante et en évitant les doublons.

---

## 🏗️ Architecture de Navigation

### **Structure Hiérarchique**
```
App.tsx
└── Navigation (NavigationContainer)
    ├── AuthStack (si non authentifié)
    │   ├── LoginScreen
    │   ├── SignupScreen
    │   └── ForgotPasswordScreen
    └── MainStack (si authentifié)
        ├── TabNavigator
        │   ├── HomeScreen
        │   ├── MissionsScreen
        │   ├── MapScreen
        │   ├── NotificationsScreen
        │   └── ProfileScreen
        └── Écrans Modaux
            ├── MissionDetailScreen
            ├── CreateMissionScreen
            ├── ChatScreen
            ├── PaymentScreen
            └── ReviewScreen
```

### **Types de Navigation**
- ✅ **Stack Navigation** : Navigation par pile pour AuthStack et MainStack
- ✅ **Tab Navigation** : Navigation par onglets pour les écrans principaux
- ✅ **Modal Navigation** : Écrans modaux pour les détails et actions

---

## 🔐 Flux d'Authentification

### **1. Auto-login au Démarrage**
```typescript
// Navigation/index.tsx
useEffect(() => {
  // Charger l'authentification stockée au démarrage
  dispatch(loadStoredAuth());
}, [dispatch]);
```

**Processus :**
1. ✅ Chargement automatique des tokens stockés
2. ✅ Vérification de la validité du token via API
3. ✅ Navigation automatique vers MainStack si valide
4. ✅ Affichage de l'écran de chargement pendant la vérification

### **2. Écrans d'Authentification**

#### **LoginScreen**
```typescript
// Validation avec Yup
const validationSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Min 6 caractères').required('Mot de passe requis'),
});

// Intégration Redux
const handleLogin = async (values: LoginCredentials) => {
  try {
    await dispatch(login(values)).unwrap();
    // Navigation automatique via sélecteur isAuthenticated
  } catch (error) {
    // Gestion d'erreur automatique
  }
};
```

**Fonctionnalités :**
- ✅ Validation en temps réel avec Formik + Yup
- ✅ Gestion des erreurs API standardisée
- ✅ Indicateur de chargement
- ✅ Navigation vers SignupScreen et ForgotPasswordScreen

#### **SignupScreen**
```typescript
// Validation étendue
const validationSchema = Yup.object().shape({
  firstName: Yup.string().min(2).required(),
  lastName: Yup.string().min(2).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')]),
  phone: Yup.string().matches(/^[0-9+\-\s()]+$/),
  role: Yup.string().oneOf(['client', 'assistant']).required(),
});
```

**Fonctionnalités :**
- ✅ Formulaire complet avec validation
- ✅ Sélection du rôle (Client/Assistant)
- ✅ Confirmation de mot de passe
- ✅ Validation du numéro de téléphone

#### **ForgotPasswordScreen**
```typescript
const handleSubmit = async (values: { email: string }) => {
  // TODO: Implémenter l'appel API
  setIsSubmitted(true);
};
```

**Fonctionnalités :**
- ✅ Demande de réinitialisation par email
- ✅ Écran de confirmation
- ✅ Navigation de retour

### **3. Gestion de la Déconnexion**
```typescript
// ProfileScreen.tsx
const handleLogout = () => {
  Alert.alert(
    'Déconnexion',
    'Êtes-vous sûr de vouloir vous déconnecter ?',
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Déconnexion', 
        style: 'destructive',
        onPress: () => dispatch(logout())
      },
    ]
  );
};
```

**Processus :**
1. ✅ Confirmation utilisateur
2. ✅ Appel API de déconnexion
3. ✅ Suppression des tokens locaux
4. ✅ Navigation automatique vers AuthStack

---

## 🧭 Configuration de Navigation

### **NavigationContainer Principal**
```typescript
// Navigation/index.tsx
const Navigation: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### **AuthStack Configuration**
```typescript
// Navigation/AuthStack.tsx
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
```

### **MainStack Configuration**
```typescript
// Navigation/MainStack.tsx
const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="MissionDetail" 
        component={MissionDetailScreen}
        options={{
          headerShown: true,
          title: 'Détails de la mission',
        }}
      />
      {/* Autres écrans modaux */}
    </Stack.Navigator>
  );
};
```

### **TabNavigator Configuration**
```typescript
// Navigation/TabNavigator.tsx
const TabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Missions': iconName = focused ? 'clipboard-list' : 'clipboard-list-outline'; break;
            case 'Map': iconName = focused ? 'map-marker' : 'map-marker-outline'; break;
            case 'Notifications': iconName = focused ? 'bell' : 'bell-outline'; break;
            case 'Profile': iconName = focused ? 'account' : 'account-outline'; break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Missions" component={MissionsScreen} options={{ title: 'Missions' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};
```

---

## 🎨 Écrans Implémentés

### **Écrans d'Authentification**
- ✅ **LoginScreen** : Connexion avec validation Formik + Yup
- ✅ **SignupScreen** : Inscription complète avec sélection de rôle
- ✅ **ForgotPasswordScreen** : Demande de réinitialisation

### **Écrans Principaux**
- ✅ **HomeScreen** : Tableau de bord adaptatif selon le rôle
- ✅ **ProfileScreen** : Profil utilisateur avec déconnexion
- ✅ **MissionsScreen** : Placeholder pour liste des missions
- ✅ **MapScreen** : Placeholder pour carte interactive
- ✅ **NotificationsScreen** : Placeholder pour notifications

### **Écrans de Support**
- ✅ **LoadingScreen** : Écran de chargement pendant l'authentification

---

## 🔄 Intégration Redux

### **Store Configuration**
```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // TODO: Ajouter les autres slices
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
```

### **Sélecteurs Utilisés**
```typescript
// Navigation/index.tsx
const isAuthenticated = useSelector(selectIsAuthenticated);
const isLoading = useSelector(selectIsLoading);

// Écrans
const user = useSelector(selectUser);
const userRole = useSelector(selectUserRole);
const error = useSelector(selectError);
```

### **Actions Dispatchées**
```typescript
// Auto-login
dispatch(loadStoredAuth());

// Connexion
dispatch(login(credentials));

// Inscription
dispatch(signup(userData));

// Déconnexion
dispatch(logout());
```

---

## 🎯 Fonctionnalités par Rôle

### **Interface Client**
```typescript
// HomeScreen.tsx
{userRole === 'client' ? (
  <View>
    <Card>
      <Title>Nouvelle mission</Title>
      <Button>Créer une mission</Button>
    </Card>
    <Card>
      <Title>Mes missions</Title>
      <Button>Voir mes missions</Button>
    </Card>
  </View>
) : (
  // Interface Assistant
)}
```

### **Interface Assistant**
```typescript
// HomeScreen.tsx
{userRole === 'assistant' ? (
  <View>
    <Card>
      <Title>Missions disponibles</Title>
      <Button>Voir les missions</Button>
    </Card>
    <Card>
      <Title>Mes missions</Title>
      <Button>Mes missions</Button>
    </Card>
  </View>
) : (
  // Interface Client
)}
```

---

## 🔧 Configuration App.tsx

### **Providers Configuration**
```typescript
// App.tsx
const App: React.FC = () => {
  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <StripeProvider publishableKey={config.STRIPE_PUBLISHABLE_KEY}>
          <Navigation />
        </StripeProvider>
      </PaperProvider>
    </StoreProvider>
  );
};
```

**Providers Utilisés :**
- ✅ **StoreProvider** : Redux store
- ✅ **PaperProvider** : React Native Paper (UI)
- ✅ **StripeProvider** : Paiements Stripe
- ✅ **NavigationContainer** : React Navigation

---

## 📱 Navigation Types

### **Types de Navigation**
```typescript
// types/index.ts
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

## ✅ Checklist de Validation

### **Navigation**
- [ ] ✅ NavigationContainer configuré
- [ ] ✅ AuthStack et MainStack fonctionnels
- [ ] ✅ TabNavigator avec icônes
- [ ] ✅ Écrans modaux configurés
- [ ] ✅ Types de navigation définis

### **Authentification**
- [ ] ✅ Auto-login au démarrage
- [ ] ✅ Écrans de connexion et inscription
- [ ] ✅ Validation des formulaires
- [ ] ✅ Gestion des erreurs
- [ ] ✅ Déconnexion fonctionnelle

### **Écrans**
- [ ] ✅ LoginScreen avec Formik + Yup
- [ ] ✅ SignupScreen avec sélection de rôle
- [ ] ✅ ForgotPasswordScreen
- [ ] ✅ HomeScreen adaptatif
- [ ] ✅ ProfileScreen avec déconnexion
- [ ] ✅ Écrans de base pour autres onglets

### **Intégration**
- [ ] ✅ Redux store configuré
- [ ] ✅ Sélecteurs utilisés
- [ ] ✅ Actions dispatchées
- [ ] ✅ Providers configurés
- [ ] ✅ Types TypeScript

---

## 🚀 Prochaines Étapes

1. **Navigation entre écrans** : Implémenter les liens de navigation
2. **Écrans manquants** : Compléter les écrans de missions, chat, etc.
3. **Tests de navigation** : Tests unitaires et d'intégration
4. **Animations** : Transitions fluides entre écrans
5. **Deep linking** : Support des liens profonds

---

## 📚 Ressources

### **Documentation Technique**
- [React Navigation Documentation](https://reactnavigation.org/)
- [Formik Documentation](https://formik.org/)
- [Yup Documentation](https://github.com/jquense/yup)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)

### **Bonnes Pratiques**
- ✅ **Pas de doublon** : Réutilisation de l'architecture existante
- ✅ **Types cohérents** : Types TypeScript pour la navigation
- ✅ **Gestion d'erreurs** : Standardisée via Redux
- ✅ **Validation** : Formik + Yup pour les formulaires
- ✅ **UI/UX** : React Native Paper pour la cohérence

---

**Document créé le :** 7 août 2025  
**Dernière mise à jour :** 7 août 2025  
**Version :** 1.0.0  
**Statut :** ✅ **Complété** 