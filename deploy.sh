#!/bin/bash

# Script de déploiement pour Conciergerie Urbaine
echo "🚀 Déploiement du projet Conciergerie Urbaine vers GitHub..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "README.md" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Ajouter tous les fichiers
echo "📁 Ajout des fichiers..."
git add .

# Vérifier le statut
echo "📊 Statut Git:"
git status --porcelain

# Commit des nouveaux fichiers
echo "💾 Création du commit..."
git commit -m "📚 docs: Ajout de la documentation et configuration complète

- Guide de contribution (CONTRIBUTING.md)
- Licence MIT (LICENSE)
- Changelog (CHANGELOG.md)
- Configuration ESLint mobile
- Configuration Prettier mobile
- Configuration Jest mobile
- Script de déploiement

Améliore la structure du projet et facilite la contribution."

# Push vers GitHub
echo "🌐 Push vers GitHub..."
git push origin develop

# Créer une branche de release
echo "🏷️ Création de la branche de release..."
git checkout -b release/v0.1.0

# Push de la branche de release
git push origin release/v0.1.0

# Retourner sur develop
git checkout develop

echo "✅ Déploiement terminé avec succès!"
echo "📋 Prochaines étapes:"
echo "1. Créer une Pull Request de develop vers main"
echo "2. Créer un release sur GitHub avec le tag v0.1.0"
echo "3. Configurer les secrets GitHub pour CI/CD"
echo "4. Configurer les variables d'environnement" 