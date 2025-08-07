#!/bin/bash

# Script pour exécuter les tests E2E avec Karate
# ViteFait - Tests E2E

echo "=========================================="
echo "  VITEFAIT - TESTS E2E AVEC KARATE"
echo "=========================================="
echo "Date: $(date)"
echo ""

# Vérifier si Karate est installé
if ! command -v java &> /dev/null; then
    echo "❌ Java n'est pas installé. Impossible d'exécuter Karate."
    exit 1
fi

# Vérifier si le serveur de test est en cours d'exécution
echo "Vérification du serveur de test..."
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "⚠️  Le serveur de test n'est pas accessible sur le port 3001"
    echo "Démarrage du serveur de test..."
    
    # Démarrer le serveur de test en arrière-plan
    npm run test:server &
    SERVER_PID=$!
    
    # Attendre que le serveur démarre
    echo "Attente du démarrage du serveur..."
    sleep 5
    
    # Vérifier si le serveur a démarré
    if ! curl -s http://localhost:3001/health > /dev/null; then
        echo "❌ Impossible de démarrer le serveur de test"
        exit 1
    fi
    
    echo "✅ Serveur de test démarré (PID: $SERVER_PID)"
else
    echo "✅ Serveur de test déjà en cours d'exécution"
    SERVER_PID=""
fi

# Créer le répertoire pour les tests Karate s'il n'existe pas
mkdir -p tests/e2e

# Créer un test Karate de base si aucun n'existe
if [ ! -f "tests/e2e/auth.feature" ]; then
    echo "Création d'un test Karate de base..."
    
    cat > "tests/e2e/auth.feature" << 'EOF'
Feature: Tests d'authentification E2E

Background:
    * url 'http://localhost:3001'

Scenario: Inscription d'un nouvel utilisateur
    Given path '/api/auth/signup'
    And request 
    """
    {
        "email": "test-e2e@example.com",
        "password": "password123",
        "firstName": "Test",
        "lastName": "E2E",
        "phone": "0123456789",
        "role": "CLIENT"
    }
    """
    When method POST
    Then status 201
    And match response contains { "success": true }
    And match response.mission == "#present"

Scenario: Connexion d'un utilisateur
    Given path '/api/auth/login'
    And request 
    """
    {
        "email": "test-e2e@example.com",
        "password": "password123"
    }
    """
    When method POST
    Then status 200
    And match response contains { "success": true }
    And match response.token == "#present"

Scenario: Accès au profil utilisateur
    Given path '/api/users/profile'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    And match response contains { "success": true }
    And match response.user.email == "test-e2e@example.com"
EOF
fi

# Créer un test pour les missions
if [ ! -f "tests/e2e/missions.feature" ]; then
    cat > "tests/e2e/missions.feature" << 'EOF'
Feature: Tests des missions E2E

Background:
    * url 'http://localhost:3001'
    * def token = ''

Scenario: Création d'une mission
    Given path '/api/auth/login'
    And request 
    """
    {
        "email": "test-e2e@example.com",
        "password": "password123"
    }
    """
    When method POST
    Then status 200
    * def token = response.token
    
    Given path '/api/missions'
    And header Authorization = 'Bearer ' + token
    And request 
    """
    {
        "title": "Test Mission E2E",
        "description": "Description de test pour E2E",
        "pickupLatitude": 48.8566,
        "pickupLongitude": 2.3522,
        "pickupAddress": "123 Test Street, Paris",
        "timeWindowStart": "2024-12-25T10:00:00.000Z",
        "timeWindowEnd": "2024-12-25T11:00:00.000Z",
        "priceEstimate": 50
    }
    """
    When method POST
    Then status 201
    And match response contains { "success": true }
    And match response.mission.title == "Test Mission E2E"

Scenario: Récupération des missions
    Given path '/api/auth/login'
    And request 
    """
    {
        "email": "test-e2e@example.com",
        "password": "password123"
    }
    """
    When method POST
    Then status 200
    * def token = response.token
    
    Given path '/api/missions'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    And match response contains { "success": true }
    And match response.missions == "#array"
EOF
fi

# Créer un test pour les paiements
if [ ! -f "tests/e2e/payments.feature" ]; then
    cat > "tests/e2e/payments.feature" << 'EOF'
Feature: Tests des paiements E2E

Background:
    * url 'http://localhost:3001'
    * def token = ''
    * def missionId = ''

Scenario: Création d'un intent de paiement
    Given path '/api/auth/login'
    And request 
    """
    {
        "email": "test-e2e@example.com",
        "password": "password123"
    }
    """
    When method POST
    Then status 200
    * def token = response.token
    
    # Créer une mission d'abord
    Given path '/api/missions'
    And header Authorization = 'Bearer ' + token
    And request 
    """
    {
        "title": "Mission pour Paiement E2E",
        "description": "Mission pour tester les paiements",
        "pickupLatitude": 48.8566,
        "pickupLongitude": 2.3522,
        "pickupAddress": "123 Test Street, Paris",
        "timeWindowStart": "2024-12-25T10:00:00.000Z",
        "timeWindowEnd": "2024-12-25T11:00:00.000Z",
        "priceEstimate": 100
    }
    """
    When method POST
    Then status 201
    * def missionId = response.mission.id
    
    # Créer l'intent de paiement
    Given path '/api/payments/create-intent'
    And header Authorization = 'Bearer ' + token
    And request 
    """
    {
        "missionId": "#(missionId)",
        "amount": 100
    }
    """
    When method POST
    Then status 201
    And match response contains { "success": true }
    And match response.payment.amount == 100
EOF
fi

# Vérifier si Karate JAR est disponible
KARATE_JAR="karate.jar"
if [ ! -f "$KARATE_JAR" ]; then
    echo "Téléchargement de Karate..."
    curl -L -o "$KARATE_JAR" "https://github.com/karatelabs/karate/releases/latest/download/karate.jar"
fi

# Exécuter les tests Karate
echo "Exécution des tests E2E avec Karate..."
echo ""

java -jar "$KARATE_JAR" tests/e2e/ --output target/karate-reports

KARATE_EXIT_CODE=$?

echo ""
echo "=========================================="
echo "  RÉSULTATS DES TESTS E2E"
echo "=========================================="

if [ $KARATE_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests E2E: SUCCÈS"
else
    echo "❌ Tests E2E: ÉCHEC"
fi

# Extraire les statistiques des rapports
if [ -f "target/karate-reports/karate-summary.html" ]; then
    echo "📄 Rapport détaillé généré: target/karate-reports/karate-summary.html"
fi

# Nettoyer le serveur de test si nous l'avons démarré
if [ ! -z "$SERVER_PID" ]; then
    echo "Arrêt du serveur de test (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null
fi

echo ""
echo "=========================================="
echo "  FIN DES TESTS E2E"
echo "=========================================="

exit $KARATE_EXIT_CODE 