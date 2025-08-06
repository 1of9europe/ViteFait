#!/bin/bash

# Script pour lancer les tests Karate
# Usage: ./run-karate-tests.sh [env] [feature]

set -e

# Configuration par défaut
ENV=${1:-dev}
FEATURE=${2:-all}
REPORT_DIR="target/karate-reports"
PARALLEL_THREADS=4

echo "🚀 Lancement des tests Karate"
echo "Environnement: $ENV"
echo "Feature: $FEATURE"
echo "Rapports: $REPORT_DIR"

# Créer le dossier de rapports
mkdir -p $REPORT_DIR

# Vérifier que le serveur est démarré
echo "🔍 Vérification du serveur..."
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Le serveur n'est pas démarré sur http://localhost:3000"
    echo "Démarrez le serveur avec: npm run dev"
    exit 1
fi

echo "✅ Serveur détecté"

# Fonction pour nettoyer les données de test
cleanup_test_data() {
    echo "🧹 Nettoyage des données de test..."
    # Ici vous pouvez ajouter des commandes pour nettoyer la base de données de test
    echo "✅ Nettoyage terminé"
}

# Fonction pour lancer les tests
run_tests() {
    local feature_path=$1
    local output_dir=$2
    
    echo "🧪 Lancement des tests: $feature_path"
    
    # Utiliser npx pour exécuter Karate si installé
    if command -v karate &> /dev/null; then
        karate $feature_path --output $output_dir
    else
        # Fallback: utiliser Java si Karate est installé via Maven/Gradle
        if command -v java &> /dev/null; then
            java -jar karate.jar $feature_path --output $output_dir
        else
            echo "❌ Karate n'est pas installé"
            echo "Installez Karate avec: npm install -g karate"
            exit 1
        fi
    fi
}

# Nettoyer avant les tests
cleanup_test_data

# Lancer les tests selon le paramètre
case $FEATURE in
    "auth")
        echo "🔐 Tests d'authentification"
        run_tests "tests/karate/features/auth.feature" "$REPORT_DIR/auth"
        ;;
    "missions")
        echo "📋 Tests de missions"
        run_tests "tests/karate/features/missions.feature" "$REPORT_DIR/missions"
        ;;
    "payments")
        echo "💳 Tests de paiements"
        run_tests "tests/karate/features/payments.feature" "$REPORT_DIR/payments"
        ;;
    "all"|*)
        echo "🎯 Tous les tests"
        run_tests "tests/karate/features/" "$REPORT_DIR/all"
        ;;
esac

# Nettoyer après les tests
cleanup_test_data

echo "✅ Tests terminés"
echo "📊 Rapports disponibles dans: $REPORT_DIR"

# Ouvrir le rapport HTML si disponible
if [ -f "$REPORT_DIR/all/karate-summary.html" ]; then
    echo "🌐 Ouverture du rapport..."
    open "$REPORT_DIR/all/karate-summary.html"
elif [ -f "$REPORT_DIR/karate-summary.html" ]; then
    echo "🌐 Ouverture du rapport..."
    open "$REPORT_DIR/karate-summary.html"
fi 