#!/bin/bash

# Script de configuration des dépendances mobiles ViteFait
echo "🚀 Configuration des dépendances mobiles ViteFait..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire mobile/"
    exit 1
fi

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build
rm -f package-lock.json
rm -f yarn.lock

# Installer les dépendances avec legacy peer deps pour éviter les conflits
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

# Vérifier les conflits de versions
echo "🔍 Vérification des conflits de versions..."

# Vérifier React Native Maps
if npm list react-native-maps | grep -q "UNMET PEER DEPENDENCY"; then
    echo "⚠️  Conflit détecté avec react-native-maps, installation en mode legacy..."
    npm install react-native-maps@1.7.1 --legacy-peer-deps
fi

# Vérifier NetInfo
if npm list @react-native-community/netinfo | grep -q "UNMET PEER DEPENDENCY"; then
    echo "⚠️  Conflit détecté avec @react-native-community/netinfo, installation en mode legacy..."
    npm install @react-native-community/netinfo@11.0.0 --legacy-peer-deps
fi

# Installer les pods pour iOS
echo "🍎 Installation des pods iOS..."
cd ios
pod install --repo-update
cd ..

# Vérifier la configuration TypeScript
echo "🔧 Vérification de la configuration TypeScript..."
npx tsc --noEmit

# Vérifier ESLint
echo "🔍 Vérification ESLint..."
npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0

echo "✅ Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurer les clés API dans src/config/environment.ts"
echo "2. Ajouter les permissions dans ios/Info.plist et android/app/src/main/AndroidManifest.xml"
echo "3. Configurer Stripe dans le composant racine"
echo "4. Tester l'application : npm run ios ou npm run android" 