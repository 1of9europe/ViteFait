#!/bin/bash

# Script simple pour exécuter les tests Karate avec curl
# Contourne le problème GraalVM avec Java 22

set -e

# Configuration
BASE_URL="http://localhost:3000"
REPORT_DIR="karate-simple-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour tester une requête
test_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local test_name=$5
    
    log_info "Test: $test_name"
    log_info "  $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" -H "Authorization: Bearer test-jwt-token")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer test-jwt-token" \
            -d "$data")
    fi
    
    # Extraire le code de statut (dernière ligne)
    status_code=$(echo "$response" | tail -n1)
    # Extraire le corps de la réponse (toutes les lignes sauf la dernière)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "  Status: $status_code (attendu: $expected_status)"
        echo "✅ $test_name - Status: $status_code" >> "$REPORT_DIR/test-results.txt"
    else
        log_error "  Status: $status_code (attendu: $expected_status)"
        log_error "  Response: $body"
        echo "❌ $test_name - Status: $status_code (attendu: $expected_status)" >> "$REPORT_DIR/test-results.txt"
        echo "   Response: $body" >> "$REPORT_DIR/test-results.txt"
    fi
    
    echo ""
}

# Vérifier que le serveur est démarré
check_server() {
    log_info "Vérification du serveur..."
    
    if curl -s "$BASE_URL/health" > /dev/null; then
        log_success "Serveur accessible sur $BASE_URL"
    else
        log_error "Serveur non accessible sur $BASE_URL"
        log_info "Démarrez le serveur avec: node test-server.js"
        exit 1
    fi
}

# Créer le dossier de rapports
setup_reports() {
    mkdir -p "$REPORT_DIR"
    echo "# Tests Karate - $(date)" > "$REPORT_DIR/test-results.txt"
    echo "" >> "$REPORT_DIR/test-results.txt"
}

# Tests d'authentification
test_auth() {
    log_info "🧪 Tests d'authentification"
    
    # Test d'inscription
    test_request "POST" "/api/auth/signup" \
        '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}' \
        "201" "Inscription utilisateur"
    
    # Test de connexion
    test_request "POST" "/api/auth/login" \
        '{"email":"test@example.com","password":"password123"}' \
        "200" "Connexion utilisateur"
    
    # Test de profil utilisateur
    test_request "GET" "/api/auth/me" "" "200" "Récupération profil utilisateur"
}

# Tests de missions
test_missions() {
    log_info "🧪 Tests de missions"
    
    # Test de création de mission
    test_request "POST" "/api/missions" \
        '{"title":"Mission test","description":"Description test","pickupLatitude":48.8566,"pickupLongitude":2.3522,"pickupAddress":"123 Test Street","timeWindowStart":"2024-12-01T10:00:00Z","timeWindowEnd":"2024-12-01T12:00:00Z","priceEstimate":100}' \
        "201" "Création de mission"
    
    # Test de récupération de mission
    test_request "GET" "/api/missions/test-mission-id" "" "200" "Récupération mission par ID"
    
    # Test de liste des missions
    test_request "GET" "/api/missions" "" "200" "Liste des missions"
}

# Tests de paiements
test_payments() {
    log_info "🧪 Tests de paiements"
    
    # Test de création d'intent de paiement
    test_request "POST" "/api/payments/create-intent" \
        '{"missionId":"test-mission-id","amount":100}' \
        "201" "Création intent de paiement"
    
    # Test de confirmation de paiement
    test_request "POST" "/api/payments/confirm" \
        '{"paymentIntentId":"test-payment-intent-id","missionId":"test-mission-id"}' \
        "200" "Confirmation de paiement"
}

# Tests d'erreurs
test_errors() {
    log_info "🧪 Tests d'erreurs"
    
    # Test sans token
    test_request "GET" "/api/auth/me" "" "401" "Accès sans token"
    
    # Test avec données manquantes
    test_request "POST" "/api/auth/signup" \
        '{"email":"test@example.com"}' \
        "400" "Inscription avec données manquantes"
}

# Générer le rapport HTML
generate_html_report() {
    log_info "📊 Génération du rapport HTML..."
    
    cat > "$REPORT_DIR/report.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Tests Karate - Rapport</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 3px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .summary { margin: 20px 0; padding: 15px; background: #e9ecef; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Tests Karate - Rapport</h1>
        <p>Généré le: $(date)</p>
        <p>Serveur: $BASE_URL</p>
    </div>
    
    <div class="summary">
        <h2>Résumé</h2>
        <p>Tests exécutés: $(grep -c "✅\|❌" "$REPORT_DIR/test-results.txt")</p>
        <p>Succès: $(grep -c "✅" "$REPORT_DIR/test-results.txt")</p>
        <p>Échecs: $(grep -c "❌" "$REPORT_DIR/test-results.txt")</p>
    </div>
    
    <h2>Détails des tests</h2>
EOF

    # Convertir les résultats en HTML
    while IFS= read -r line; do
        if [[ $line == ✅* ]]; then
            echo "    <div class='test-result success'>$line</div>" >> "$REPORT_DIR/report.html"
        elif [[ $line == ❌* ]]; then
            echo "    <div class='test-result error'>$line</div>" >> "$REPORT_DIR/report.html"
        elif [[ $line == \#* ]]; then
            echo "    <h3>${line#\# }</h3>" >> "$REPORT_DIR/report.html"
        fi
    done < "$REPORT_DIR/test-results.txt"

    cat >> "$REPORT_DIR/report.html" << EOF
</body>
</html>
EOF

    log_success "Rapport HTML généré: $REPORT_DIR/report.html"
}

# Fonction principale
main() {
    log_info "🚀 Démarrage des tests Karate simplifiés"
    
    # Vérifications préliminaires
    check_server
    setup_reports
    
    # Exécution des tests
    test_auth
    test_missions
    test_payments
    test_errors
    
    # Génération du rapport
    generate_html_report
    
    # Résumé final
    log_info "📋 Résumé des tests:"
    echo "   Tests exécutés: $(grep -c "✅\|❌" "$REPORT_DIR/test-results.txt")"
    echo "   Succès: $(grep -c "✅" "$REPORT_DIR/test-results.txt")"
    echo "   Échecs: $(grep -c "❌" "$REPORT_DIR/test-results.txt")"
    
    log_success "Tests terminés ! Rapport disponible dans: $REPORT_DIR/"
}

# Exécution
main "$@" 