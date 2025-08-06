# Tests End-to-End avec Karate

## 🎯 Vue d'ensemble

Ce dossier contient les tests end-to-end de l'API ViteFait utilisant le framework Karate. Karate permet de tester les APIs REST avec une syntaxe simple et expressive.

## 📁 Structure

```
tests/karate/
├── karate-config.js          # Configuration principale
├── features/                 # Tests par fonctionnalité
│   ├── auth.feature         # Tests d'authentification
│   ├── missions.feature     # Tests de missions
│   └── payments.feature     # Tests de paiements
├── utils/                   # Utilitaires JavaScript
│   ├── auth-utils.js        # Utilitaires d'authentification
│   ├── mission-utils.js     # Utilitaires de missions
│   └── payment-utils.js     # Utilitaires de paiements
└── README.md               # Cette documentation
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- Serveur backend démarré sur `http://localhost:3000`
- Base de données PostgreSQL configurée

### Installation de Karate
```bash
# Installation globale
npm install -g karate

# Ou installation locale
npm install --save-dev karate
```

## 🧪 Lancement des tests

### Script automatique
```bash
# Tous les tests
./run-karate-tests.sh

# Tests spécifiques
./run-karate-tests.sh dev auth
./run-karate-tests.sh dev missions
./run-karate-tests.sh dev payments

# Environnements différents
./run-karate-tests.sh staging all
./run-karate-tests.sh prod all
```

### Commandes manuelles
```bash
# Tous les tests
karate tests/karate/features/

# Tests parallèles
karate tests/karate/features/ --threads 4

# Tests avec rapport détaillé
karate tests/karate/features/ --output target/karate-reports

# Test spécifique
karate tests/karate/features/auth.feature
```

## 📊 Rapports

Les rapports sont générés dans `target/karate-reports/` et incluent :
- **Rapport HTML** : Vue d'ensemble avec détails des tests
- **Rapport JSON** : Données structurées pour l'intégration CI/CD
- **Logs** : Détails des requêtes et réponses

## 🔧 Configuration

### Variables d'environnement
```bash
# Développement
export KARATE_ENV=dev

# Staging
export KARATE_ENV=staging

# Production
export KARATE_ENV=prod
```

### Configuration dans karate-config.js
```javascript
function fn() {
  var env = karate.env || 'dev';
  var config = {
    baseUrl: 'http://localhost:3000',
    apiPath: '/api',
    timeout: 10000
  };
  
  // Configuration par environnement
  if (env === 'staging') {
    config.baseUrl = 'https://staging-api.vitefait.com';
  }
  
  return config;
}
```

## 📝 Écriture de tests

### Structure d'un test
```gherkin
Feature: Nom de la fonctionnalité

Background:
  * url baseUrl + apiPath
  * def utils = read('classpath:tests/karate/utils/auth-utils.js')

Scenario: Description du test
  Given path '/endpoint'
  And header Authorization = 'Bearer ' + token
  And request { key: 'value' }
  When method POST
  Then status 200
  And match response contains { message: '#string' }
```

### Utilitaires JavaScript
```javascript
function fn() {
  var utils = {};
  
  utils.generateTestData = function() {
    return {
      email: 'test@example.com',
      password: 'password123'
    };
  };
  
  return utils;
}
```

## 🔐 Authentification

Les tests utilisent un système d'authentification automatique :

1. **Création d'utilisateurs de test** : Génération automatique d'emails uniques
2. **Récupération de tokens** : Authentification automatique pour chaque test
3. **Nettoyage** : Suppression des données de test après exécution

## 🗄️ Base de données

### Configuration de test
```javascript
config.testDb = {
  host: 'localhost',
  port: 5432,
  database: 'vitefait_test',
  username: 'postgres',
  password: 'postgres'
};
```

### Nettoyage automatique
Les tests incluent un nettoyage automatique des données :
- Suppression des utilisateurs de test
- Suppression des missions de test
- Suppression des paiements de test

## 🔄 Intégration CI/CD

### GitHub Actions
```yaml
- name: Run Karate Tests
  run: |
    cd backend
    ./run-karate-tests.sh staging all
```

### Variables d'environnement CI
```yaml
env:
  KARATE_ENV: staging
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vitefait_test
  JWT_SECRET: test-secret
  STRIPE_SECRET_KEY: sk_test_dummy
```

## 🐛 Débogage

### Mode debug
```bash
# Activer les logs détaillés
export KARATE_DEBUG=true
karate tests/karate/features/auth.feature
```

### Logs personnalisés
```javascript
* print 'Données de test:', testData
* print 'Réponse:', response
```

### Validation des réponses
```gherkin
Then status 200
And match response contains { 
  message: '#string',
  user: { 
    id: '#string',
    email: '#string'
  }
}
```

## 📈 Métriques

Les tests génèrent des métriques :
- **Temps d'exécution** : Durée de chaque test
- **Taux de réussite** : Pourcentage de tests passés
- **Couverture** : Endpoints testés vs disponibles

## 🚨 Bonnes pratiques

1. **Isolation** : Chaque test doit être indépendant
2. **Nettoyage** : Toujours nettoyer les données de test
3. **Validation** : Vérifier les réponses et les statuts
4. **Documentation** : Commenter les tests complexes
5. **Réutilisabilité** : Utiliser les utilitaires pour éviter la duplication

## 🔗 Ressources

- [Documentation officielle Karate](https://github.com/karatelabs/karate)
- [Syntaxe Gherkin](https://cucumber.io/docs/gherkin/)
- [Exemples Karate](https://github.com/karatelabs/karate/tree/master/karate-demo)

---

*Dernière mise à jour : Décembre 2024* 