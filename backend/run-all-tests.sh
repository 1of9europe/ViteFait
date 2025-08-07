#!/bin/bash

# Script pour exécuter tous les tests et générer un rapport complet
# ViteFait - Rapport de Tests Complet

echo "=========================================="
echo "  VITEFAIT - RAPPORT DE TESTS COMPLET"
echo "=========================================="
echo "Date: $(date)"
echo ""

# Variables
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
COVERAGE_TOTAL=0

# Fonction pour extraire les statistiques des tests
extract_test_stats() {
    local output="$1"
    local tests=$(echo "$output" | grep -o "Tests:.*[0-9]* passed" | grep -o "[0-9]* passed" | grep -o "[0-9]*")
    local failed=$(echo "$output" | grep -o "Tests:.*[0-9]* failed" | grep -o "[0-9]* failed" | grep -o "[0-9]*")
    
    if [ -z "$tests" ]; then
        tests=0
    fi
    if [ -z "$failed" ]; then
        failed=0
    fi
    
    echo "$tests $failed"
}

# 1. TESTS UNITAIRES
echo "1. TESTS UNITAIRES"
echo "=================="
echo "Exécution des tests unitaires..."

UNIT_OUTPUT=$(npm run test:unit 2>&1)
UNIT_EXIT_CODE=$?

if [ $UNIT_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests unitaires: SUCCÈS"
else
    echo "❌ Tests unitaires: ÉCHEC"
fi

UNIT_STATS=$(extract_test_stats "$UNIT_OUTPUT")
UNIT_PASSED=$(echo $UNIT_STATS | cut -d' ' -f1)
UNIT_FAILED=$(echo $UNIT_STATS | cut -d' ' -f2)

echo "   - Tests passés: $UNIT_PASSED"
echo "   - Tests échoués: $UNIT_FAILED"
echo ""

# 2. TESTS D'INTÉGRATION
echo "2. TESTS D'INTÉGRATION"
echo "======================"
echo "Exécution des tests d'intégration..."

INTEGRATION_OUTPUT=$(npm run test:integration 2>&1)
INTEGRATION_EXIT_CODE=$?

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests d'intégration: SUCCÈS"
else
    echo "❌ Tests d'intégration: ÉCHEC"
fi

INTEGRATION_STATS=$(extract_test_stats "$INTEGRATION_OUTPUT")
INTEGRATION_PASSED=$(echo $INTEGRATION_STATS | cut -d' ' -f1)
INTEGRATION_FAILED=$(echo $INTEGRATION_STATS | cut -d' ' -f2)

echo "   - Tests passés: $INTEGRATION_PASSED"
echo "   - Tests échoués: $INTEGRATION_FAILED"
echo ""

# 3. TESTS E2E (KARATE)
echo "3. TESTS E2E (KARATE)"
echo "====================="
echo "Exécution des tests E2E avec Karate..."

if [ -f "run-karate-tests.sh" ]; then
    KARATE_OUTPUT=$(./run-karate-tests.sh 2>&1)
    KARATE_EXIT_CODE=$?
    
    if [ $KARATE_EXIT_CODE -eq 0 ]; then
        echo "✅ Tests E2E Karate: SUCCÈS"
    else
        echo "❌ Tests E2E Karate: ÉCHEC"
    fi
    
    # Extraire les statistiques Karate
    KARATE_SCENARIOS=$(echo "$KARATE_OUTPUT" | grep -o "scenarios:.*[0-9]*" | grep -o "[0-9]*" | tail -1)
    KARATE_PASSED=$(echo "$KARATE_OUTPUT" | grep -o "passed:.*[0-9]*" | grep -o "[0-9]*" | tail -1)
    KARATE_FAILED=$(echo "$KARATE_OUTPUT" | grep -o "failed:.*[0-9]*" | grep -o "[0-9]*" | tail -1)
    
    if [ -z "$KARATE_SCENARIOS" ]; then
        KARATE_SCENARIOS=0
        KARATE_PASSED=0
        KARATE_FAILED=0
    fi
    
    echo "   - Scénarios: $KARATE_SCENARIOS"
    echo "   - Tests passés: $KARATE_PASSED"
    echo "   - Tests échoués: $KARATE_FAILED"
else
    echo "⚠️  Script Karate non trouvé"
    KARATE_SCENARIOS=0
    KARATE_PASSED=0
    KARATE_FAILED=0
fi
echo ""

# 4. TESTS DE COUVERTURE
echo "4. TESTS DE COUVERTURE"
echo "======================"
echo "Génération du rapport de couverture..."

COVERAGE_OUTPUT=$(npm run test:coverage 2>&1)
COVERAGE_EXIT_CODE=$?

if [ $COVERAGE_EXIT_CODE -eq 0 ]; then
    echo "✅ Rapport de couverture: GÉNÉRÉ"
    
    # Extraire la couverture
    COVERAGE_LINES=$(echo "$COVERAGE_OUTPUT" | grep "All files" | grep -o "[0-9]*%" | head -1)
    COVERAGE_FUNCTIONS=$(echo "$COVERAGE_OUTPUT" | grep "All files" | grep -o "[0-9]*%" | head -2 | tail -1)
    COVERAGE_BRANCHES=$(echo "$COVERAGE_OUTPUT" | grep "All files" | grep -o "[0-9]*%" | head -3 | tail -1)
    COVERAGE_STATEMENTS=$(echo "$COVERAGE_OUTPUT" | grep "All files" | grep -o "[0-9]*%" | head -4 | tail -1)
    
    echo "   - Lignes: ${COVERAGE_LINES:-0%}"
    echo "   - Fonctions: ${COVERAGE_FUNCTIONS:-0%}"
    echo "   - Branches: ${COVERAGE_BRANCHES:-0%}"
    echo "   - Instructions: ${COVERAGE_STATEMENTS:-0%}"
else
    echo "❌ Rapport de couverture: ÉCHEC"
    COVERAGE_LINES="0%"
    COVERAGE_FUNCTIONS="0%"
    COVERAGE_BRANCHES="0%"
    COVERAGE_STATEMENTS="0%"
fi
echo ""

# 5. CALCUL DES TOTAUX
echo "5. RÉSUMÉ GLOBAL"
echo "================"

TOTAL_PASSED=$((UNIT_PASSED + INTEGRATION_PASSED + KARATE_PASSED))
TOTAL_FAILED=$((UNIT_FAILED + INTEGRATION_FAILED + KARATE_FAILED))
TOTAL_TESTS=$((TOTAL_PASSED + TOTAL_FAILED))

if [ $TOTAL_FAILED -eq 0 ]; then
    echo "🎉 TOUS LES TESTS SONT PASSÉS!"
    OVERALL_STATUS="✅ SUCCÈS"
else
    echo "⚠️  CERTAINS TESTS ONT ÉCHOUÉ"
    OVERALL_STATUS="❌ ÉCHEC"
fi

echo "Statut global: $OVERALL_STATUS"
echo "Total des tests: $TOTAL_TESTS"
echo "Tests passés: $TOTAL_PASSED"
echo "Tests échoués: $TOTAL_FAILED"

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=2; $TOTAL_PASSED * 100 / $TOTAL_TESTS" | bc -l)
    echo "Taux de succès: ${SUCCESS_RATE}%"
else
    echo "Taux de succès: 0%"
fi
echo ""

# 6. DÉTAIL PAR CATÉGORIE
echo "6. DÉTAIL PAR CATÉGORIE"
echo "======================="
echo "Tests Unitaires:"
echo "  - Passés: $UNIT_PASSED"
echo "  - Échoués: $UNIT_FAILED"
echo "  - Total: $((UNIT_PASSED + UNIT_FAILED))"
echo ""

echo "Tests d'Intégration:"
echo "  - Passés: $INTEGRATION_PASSED"
echo "  - Échoués: $INTEGRATION_FAILED"
echo "  - Total: $((INTEGRATION_PASSED + INTEGRATION_FAILED))"
echo ""

echo "Tests E2E (Karate):"
echo "  - Scénarios: $KARATE_SCENARIOS"
echo "  - Passés: $KARATE_PASSED"
echo "  - Échoués: $KARATE_FAILED"
echo ""

echo "Couverture de Code:"
echo "  - Lignes: ${COVERAGE_LINES:-0%}"
echo "  - Fonctions: ${COVERAGE_FUNCTIONS:-0%}"
echo "  - Branches: ${COVERAGE_BRANCHES:-0%}"
echo "  - Instructions: ${COVERAGE_STATEMENTS:-0%}"
echo ""

# 7. RECOMMANDATIONS
echo "7. RECOMMANDATIONS"
echo "=================="

if [ $TOTAL_FAILED -gt 0 ]; then
    echo "❌ Actions recommandées:"
    echo "  1. Corriger les tests qui échouent"
    echo "  2. Vérifier la logique métier"
    echo "  3. Mettre à jour les mocks si nécessaire"
    echo "  4. Revoir les assertions des tests"
else
    echo "✅ Excellent travail!"
    echo "  1. Tous les tests passent"
    echo "  2. La qualité du code est bonne"
    echo "  3. Continuer à maintenir cette qualité"
fi

if [ "$COVERAGE_LINES" != "0%" ] && [ "$COVERAGE_LINES" != "" ]; then
    COVERAGE_NUM=$(echo "$COVERAGE_LINES" | sed 's/%//')
    if (( $(echo "$COVERAGE_NUM < 80" | bc -l) )); then
        echo "  4. Améliorer la couverture de code (actuellement $COVERAGE_LINES)"
    else
        echo "  4. Couverture de code excellente ($COVERAGE_LINES)"
    fi
fi
echo ""

# 8. GÉNÉRATION DU RAPPORT
echo "8. GÉNÉRATION DU RAPPORT"
echo "========================"

REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# Rapport de Tests ViteFait
**Date:** $(date)  
**Statut Global:** $OVERALL_STATUS

## Résumé Exécutif
- **Total des tests:** $TOTAL_TESTS
- **Tests passés:** $TOTAL_PASSED
- **Tests échoués:** $TOTAL_FAILED
- **Taux de succès:** ${SUCCESS_RATE:-0}%

## Détail par Type de Test

### Tests Unitaires
- Passés: $UNIT_PASSED
- Échoués: $UNIT_FAILED
- Total: $((UNIT_PASSED + UNIT_FAILED))

### Tests d'Intégration
- Passés: $INTEGRATION_PASSED
- Échoués: $INTEGRATION_FAILED
- Total: $((INTEGRATION_PASSED + INTEGRATION_FAILED))

### Tests E2E (Karate)
- Scénarios: $KARATE_SCENARIOS
- Passés: $KARATE_PASSED
- Échoués: $KARATE_FAILED

## Couverture de Code
- **Lignes:** ${COVERAGE_LINES:-0%}
- **Fonctions:** ${COVERAGE_FUNCTIONS:-0%}
- **Branches:** ${COVERAGE_BRANCHES:-0%}
- **Instructions:** ${COVERAGE_STATEMENTS:-0%}

## Recommandations
$(if [ $TOTAL_FAILED -gt 0 ]; then
    echo "- Corriger les tests qui échouent"
    echo "- Vérifier la logique métier"
    echo "- Mettre à jour les mocks si nécessaire"
    echo "- Revoir les assertions des tests"
else
    echo "- Excellent travail!"
    echo "- Tous les tests passent"
    echo "- La qualité du code est bonne"
    echo "- Continuer à maintenir cette qualité"
fi)

$(if [ "$COVERAGE_LINES" != "0%" ] && [ "$COVERAGE_LINES" != "" ]; then
    COVERAGE_NUM=$(echo "$COVERAGE_LINES" | sed 's/%//')
    if (( $(echo "$COVERAGE_NUM < 80" | bc -l) )); then
        echo "- Améliorer la couverture de code (actuellement $COVERAGE_LINES)"
    else
        echo "- Couverture de code excellente ($COVERAGE_LINES)"
    fi
fi)
EOF

echo "📄 Rapport généré: $REPORT_FILE"
echo ""

# 9. FINAL
echo "=========================================="
echo "  FIN DU RAPPORT DE TESTS"
echo "=========================================="

# Retourner le code de sortie approprié
if [ $TOTAL_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi 