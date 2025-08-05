#!/bin/bash

# Script de finalisation du déploiement Conciergerie Urbaine
echo "🎉 Finalisation du déploiement Conciergerie Urbaine..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "README.md" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

print_status "Vérification de l'état du repository..."

# Vérifier le statut Git
if [ -n "$(git status --porcelain)" ]; then
    print_status "Fichiers non commités détectés, ajout au staging..."
    git add .
    
    print_status "Création du commit de finalisation..."
    git commit -m "🎉 docs: Finalisation du projet V0

- Ajout du guide de contribution (CONTRIBUTING.md)
- Ajout de la licence MIT (LICENSE)
- Ajout du changelog (CHANGELOG.md)
- Configuration ESLint et Prettier pour mobile
- Configuration Jest pour mobile
- Templates pour issues et Pull Requests
- Guide de déploiement (DEPLOYMENT.md)
- Scripts de déploiement automatisés

Le projet est maintenant prêt pour le développement collaboratif !"
    
    print_success "Commit créé avec succès"
else
    print_status "Aucun fichier à commiter"
fi

# Push vers GitHub
print_status "Push vers GitHub..."
if git push origin develop; then
    print_success "Code poussé vers la branche develop"
else
    print_error "Erreur lors du push vers GitHub"
    exit 1
fi

# Créer une branche de release
print_status "Création de la branche de release v0.1.0..."
git checkout -b release/v0.1.0

if git push origin release/v0.1.0; then
    print_success "Branche de release créée et poussée"
else
    print_error "Erreur lors de la création de la branche de release"
    exit 1
fi

# Retourner sur develop
git checkout develop

# Créer un tag
print_status "Création du tag v0.1.0..."
git tag -a v0.1.0 -m "Version 0.1.0 - Initial Release

- Structure complète du projet
- Backend Node.js/Express avec TypeScript
- Mobile React Native avec TypeScript
- API REST complète
- Authentification JWT
- Gestion des missions
- Système de paiement Stripe
- Tests unitaires et d'intégration
- CI/CD avec GitHub Actions
- Documentation complète"

if git push origin v0.1.0; then
    print_success "Tag v0.1.0 créé et poussé"
else
    print_error "Erreur lors de la création du tag"
    exit 1
fi

# Afficher le résumé
echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "======================================"
echo ""
print_success "✅ Repository GitHub configuré"
print_success "✅ Branche develop créée"
print_success "✅ Branche release/v0.1.0 créée"
print_success "✅ Tag v0.1.0 créé"
print_success "✅ Documentation complète ajoutée"
print_success "✅ Templates GitHub configurés"
echo ""
echo "📋 PROCHAINES ÉTAPES RECOMMANDÉES :"
echo "======================================"
echo ""
echo "1. 🌐 Créer une Pull Request de develop vers main"
echo "2. 🏷️ Créer un release sur GitHub avec le tag v0.1.0"
echo "3. 🔧 Configurer les secrets GitHub pour CI/CD :"
echo "   - HEROKU_API_KEY (si déploiement Heroku)"
echo "   - AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY (si déploiement AWS)"
echo "   - STRIPE_SECRET_KEY"
echo "   - FIREBASE_PRIVATE_KEY"
echo "4. 🗄️ Configurer la base de données PostgreSQL"
echo "5. 💳 Configurer Stripe pour les paiements"
echo "6. 🔔 Configurer Firebase pour les notifications"
echo "7. 📱 Configurer les certificats iOS/Android"
echo ""
echo "📚 DOCUMENTATION DISPONIBLE :"
echo "=============================="
echo "• README.md - Vue d'ensemble du projet"
echo "• QUICK_START.md - Guide d'installation rapide"
echo "• API_DOCUMENTATION.md - Documentation de l'API"
echo "• CONTRIBUTING.md - Guide de contribution"
echo "• DEPLOYMENT.md - Guide de déploiement"
echo "• CHANGELOG.md - Historique des versions"
echo ""
echo "🔗 LIENS UTILES :"
echo "=================="
echo "• Repository GitHub: https://github.com/1of9europe/ViteFait"
echo "• Issues: https://github.com/1of9europe/ViteFait/issues"
echo "• Pull Requests: https://github.com/1of9europe/ViteFait/pulls"
echo ""
print_success "🚀 Le projet Conciergerie Urbaine V0 est maintenant prêt !" 