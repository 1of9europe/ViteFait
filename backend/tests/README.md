# Tests Backend ViteFait

## 📁 Structure des tests

```
backend/tests/
├── unit/                    # Tests unitaires
│   └── services/           # Tests des services
│       └── AuthService.test.ts
├── integration/            # Tests d'intégration
│   └── auth.test.ts       # Tests des routes API
├── setup.ts               # Configuration globale des tests
└── README.md             # Cette documentation
```

## 🧪 Types de tests

### Tests unitaires (`unit/`)
- **Objectif** : Tester les fonctions et méthodes individuelles
- **Framework** : Jest + mocks
- **Exemple** : `AuthService.test.ts` teste les méthodes du service d'authentification

### Tests d'intégration (`integration/`)
- **Objectif** : Tester les routes API et l'intégration des composants
- **Framework** : Jest + Supertest
- **Exemple** : `auth.test.ts` teste les endpoints d'authentification

### Tests end-to-end (`karate-env/`)
- **Objectif** : Tester les workflows complets de l'application
- **Framework** : Karate (Java/Maven)
- **Exemple** : Tests d'authentification, missions, paiements

## 🚀 Scripts disponibles

### Backend uniquement
```bash
# Tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration

# Tests end-to-end avec Karate
npm run test:karate
npm run test:karate:auth
npm run test:karate:missions
npm run test:karate:payments
```

### Depuis la racine du projet
```bash
# Tests backend
npm run test:backend
npm run test:backend:unit
npm run test:backend:integration

# Tests Karate
npm run test:karate
npm run test:karate:ci
```

## 📊 Rapports

- **Tests Jest** : `coverage/` (généré automatiquement)
- **Tests Karate** : `karate-env/target/karate-reports/`

## 🔧 Configuration

### Jest
- **Fichier** : `jest.config.js`
- **Setup** : `jest.setup.js`
- **Environnement** : Node.js

### Karate
- **Fichier** : `karate-env/pom.xml`
- **Configuration** : `karate-env/src/test/java/karate-config.js`
- **Environnement** : Java 11+ + Maven

## 🎯 Bonnes pratiques

1. **Tests unitaires** : Utiliser des mocks pour isoler les dépendances
2. **Tests d'intégration** : Tester les routes API avec Supertest
3. **Tests E2E** : Utiliser Karate pour les workflows complets
4. **Nettoyage** : Toujours nettoyer les données de test
5. **Isolation** : Chaque test doit être indépendant

## 📝 Ajout de nouveaux tests

### Test unitaire
```bash
# Créer le fichier dans tests/unit/services/
touch tests/unit/services/NewService.test.ts
```

### Test d'intégration
```bash
# Créer le fichier dans tests/integration/
touch tests/integration/new-feature.test.ts
```

### Test Karate
```bash
# Créer le fichier dans karate-env/src/test/java/features/
touch karate-env/src/test/java/features/new-feature.feature
```

---

*Dernière mise à jour : Décembre 2024* 