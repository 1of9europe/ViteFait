#!/bin/bash

# Script pour lancer les tests Karate avec environnement isolé
# Usage: ./run-karate-tests.sh [env] [feature]

set -e

# Configuration par défaut
ENV=${1:-dev}
FEATURE=${2:-all}
REPORT_DIR="karate-env/target/karate-reports"
KARATE_ENV_DIR="karate-env"
PARALLEL_THREADS=4

echo "🚀 Lancement des tests Karate avec environnement isolé"
echo "Environnement: $ENV"
echo "Feature: $FEATURE"
echo "Rapports: $REPORT_DIR"
echo "Environnement Karate: $KARATE_ENV_DIR"

# Créer le dossier de rapports
mkdir -p $REPORT_DIR

# Vérifier que le serveur est démarré
echo "🔍 Vérification du serveur..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Le serveur n'est pas démarré sur http://localhost:3000"
    echo "Démarrez le serveur avec: npm run dev"
    exit 1
fi

echo "✅ Serveur détecté"

# Fonction pour vérifier et installer Maven
check_and_install_maven() {
    if ! command -v mvn &> /dev/null; then
        echo "📦 Maven non trouvé, installation..."
        if command -v brew &> /dev/null; then
            brew install maven
        else
            echo "❌ Maven non trouvé et Homebrew non disponible"
            echo "Installez Maven manuellement: https://maven.apache.org/install.html"
            exit 1
        fi
    fi
    echo "✅ Maven disponible: $(mvn --version | head -n 1)"
}

# Fonction pour vérifier Java
check_java() {
    if ! command -v java &> /dev/null; then
        echo "❌ Java non trouvé"
        echo "Installez Java 11+ manuellement"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 11 ]; then
        echo "❌ Java $JAVA_VERSION détecté, Java 11+ requis"
        exit 1
    fi
    
    echo "✅ Java disponible: $(java -version 2>&1 | head -n 1)"
}

# Fonction pour nettoyer les données de test
cleanup_test_data() {
    echo "🧹 Nettoyage des données de test..."
    # Ici vous pouvez ajouter des commandes pour nettoyer la base de données de test
    echo "✅ Nettoyage terminé"
}

# Fonction pour lancer les tests avec Maven
run_tests_with_maven() {
    local feature_path=$1
    local output_dir=$2
    
    echo "🧪 Lancement des tests avec Maven: $feature_path"
    
    cd $KARATE_ENV_DIR
    
    # Configuration de l'environnement
    export KARATE_ENV=$ENV
    
    # Lancer les tests avec Maven
    if [ "$feature_path" = "all" ]; then
        mvn test -Dkarate.options="--output $output_dir"
    else
        mvn test -Dkarate.options="--output $output_dir" -Dtest="$feature_path"
    fi
    
    cd ..
}

# Vérifications préliminaires
echo "🔧 Vérification de l'environnement..."
check_java
check_and_install_maven

# Nettoyer avant les tests
cleanup_test_data

# Lancer les tests selon le paramètre
case $FEATURE in
    "auth")
        echo "🔐 Tests d'authentification"
        run_tests_with_maven "AuthTest" "$REPORT_DIR/auth"
        ;;
    "missions")
        echo "📋 Tests de missions"
        run_tests_with_maven "MissionsTest" "$REPORT_DIR/missions"
        ;;
    "payments")
        echo "💳 Tests de paiements"
        run_tests_with_maven "PaymentsTest" "$REPORT_DIR/payments"
        ;;
    "all"|*)
        echo "🎯 Tous les tests"
        run_tests_with_maven "all" "$REPORT_DIR/all"
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

echo "🎉 Tests Karate terminés avec succès !" 