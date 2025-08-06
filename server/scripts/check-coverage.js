#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Seuils de couverture minimum
const COVERAGE_THRESHOLDS = {
  branches: 80,
  functions: 80,
  lines: 80,
  statements: 80
};

function checkCoverage() {
  try {
    // Lire le rapport de couverture
    const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.error('❌ Rapport de couverture non trouvé. Exécutez d\'abord npm run test:coverage');
      process.exit(1);
    }

    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const totalCoverage = coverageData.total;

    console.log('📊 Vérification de la couverture de code...\n');

    let allThresholdsMet = true;
    const results = [];

    // Vérifier chaque métrique
    Object.keys(COVERAGE_THRESHOLDS).forEach(metric => {
      const threshold = COVERAGE_THRESHOLDS[metric];
      const actual = totalCoverage[metric].pct;
      const passed = actual >= threshold;

      results.push({
        metric,
        threshold,
        actual,
        passed
      });

      if (!passed) {
        allThresholdsMet = false;
      }
    });

    // Afficher les résultats
    console.log('Métrique\t\tSeuil\t\tActuel\t\tStatut');
    console.log('--------\t\t-----\t\t------\t\t------');

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${result.metric.padEnd(16)}\t${result.threshold}%\t\t${result.actual.toFixed(1)}%\t\t${status}`);
    });

    console.log('\n📈 Détails par fichier:');
    console.log('=====================');

    // Afficher les fichiers avec une couverture faible
    Object.keys(coverageData).forEach(file => {
      if (file !== 'total') {
        const fileCoverage = coverageData[file];
        const avgCoverage = (
          fileCoverage.branches.pct +
          fileCoverage.functions.pct +
          fileCoverage.lines.pct +
          fileCoverage.statements.pct
        ) / 4;

        if (avgCoverage < 80) {
          console.log(`⚠️  ${file}: ${avgCoverage.toFixed(1)}%`);
        }
      }
    });

    // Résultat final
    if (allThresholdsMet) {
      console.log('\n🎉 Tous les seuils de couverture sont atteints !');
      console.log('✅ Pipeline CI/CD peut continuer');
      process.exit(0);
    } else {
      console.log('\n❌ Certains seuils de couverture ne sont pas atteints');
      console.log('🚫 Pipeline CI/CD bloqué');
      console.log('\n💡 Suggestions pour améliorer la couverture:');
      console.log('   - Ajoutez des tests pour les branches non couvertes');
      console.log('   - Testez les cas d\'erreur et les exceptions');
      console.log('   - Vérifiez les fonctions non testées');
      console.log('   - Ajoutez des tests d\'intégration');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la couverture:', error.message);
    process.exit(1);
  }
}

// Exécuter la vérification
checkCoverage(); 