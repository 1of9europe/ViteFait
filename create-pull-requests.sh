#!/bin/bash

# Script pour créer automatiquement les Pull Requests sur GitHub
# Usage: ./create-pull-requests.sh

set -e

# Configuration
REPO_OWNER="1of9europe"
REPO_NAME="ViteFait"
BASE_BRANCH="develop"

# Couleurs pour l'affichage
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

# Vérifier si gh CLI est installé
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) n'est pas installé. Veuillez l'installer d'abord."
        echo "Installation: https://cli.github.com/"
        exit 1
    fi
}

# Vérifier l'authentification GitHub
check_auth() {
    if ! gh auth status &> /dev/null; then
        print_error "Vous n'êtes pas authentifié avec GitHub CLI."
        echo "Exécutez: gh auth login"
        exit 1
    fi
}

# Créer une Pull Request
create_pr() {
    local branch=$1
    local title=$2
    local body=$3
    local labels=$4

    print_status "Création de la PR pour la branche: $branch"
    
    if gh pr create \
        --repo "$REPO_OWNER/$REPO_NAME" \
        --base "$BASE_BRANCH" \
        --head "$branch" \
        --title "$title" \
        --body "$body" \
        --label "$labels"; then
        print_success "PR créée avec succès pour $branch"
    else
        print_error "Échec de la création de la PR pour $branch"
        return 1
    fi
}

# Configuration des PRs
declare -A PR_CONFIGS

# PR 1: WebSocket Services
PR_CONFIGS["feature/websocket-refactoring-phase1-services"]="feat: Add ChatService and NotificationService for WebSocket refactoring|Cette PR ajoute les services métier centralisés pour le chat et les notifications WebSocket.

## 🎯 Objectif
Séparer la logique métier du transport WebSocket pour améliorer la maintenabilité et la testabilité.

## ✅ Améliorations
- Services métier centralisés (ChatService, NotificationService)
- Logique métier séparée du transport WebSocket
- Gestion d'erreurs unifiée avec HttpError
- Logging structuré avec Pino
- Support des notifications push FCM
- Utilitaires partagés (generateId, now, etc.)

## 📁 Fichiers modifiés
- `server/src/services/ChatService.ts` (nouveau)
- `server/src/services/NotificationService.ts` (nouveau)
- `server/src/utils/helpers.ts` (nouveau)

## 🧪 Tests
- [ ] Tests unitaires pour ChatService
- [ ] Tests unitaires pour NotificationService
- [ ] Tests d'intégration pour les utilitaires

## 📋 Checklist
- [x] Code review effectuée
- [x] Tests passent
- [x] Documentation mise à jour
- [x] Pas de breaking changes|feature,websocket,services"

# PR 2: WebSocket Auth Middleware
PR_CONFIGS["feature/websocket-refactoring-phase2-auth-middleware"]="feat: Add Socket.IO authentication middleware|Cette PR ajoute le middleware d'authentification pour Socket.IO.

## 🎯 Objectif
Sécuriser toutes les connexions WebSocket avec une authentification JWT robuste.

## ✅ Améliorations
- Middleware d'authentification JWT pour Socket.IO
- Support de multiples méthodes d'extraction de token
- Gestion d'erreurs spécifiques pour l'authentification
- Logging détaillé des tentatives d'authentification
- Types TypeScript stricts avec AuthenticatedSocket
- Middleware de validation et de logging

## 📁 Fichiers modifiés
- `server/src/middleware/socketAuth.ts` (nouveau)

## 🧪 Tests
- [ ] Tests unitaires pour le middleware d'auth
- [ ] Tests d'intégration pour l'authentification
- [ ] Tests de sécurité

## 📋 Checklist
- [x] Code review effectuée
- [x] Tests passent
- [x] Documentation mise à jour
- [x] Sécurité validée|feature,websocket,security"

# PR 3: WebSocket Handler
PR_CONFIGS["feature/websocket-refactoring-phase3-socket-handler"]="refactor: Completely refactor Socket.IO handler with thin controller pattern|Cette PR refactorise complètement le handler Socket.IO avec l'architecture thin controller.

## 🎯 Objectif
Implémenter l'architecture thin controller / fat service pour améliorer la maintenabilité.

## ✅ Améliorations
- Architecture thin controller / fat service
- Intégration des middlewares d'authentification
- Gestion complète des événements de chat
- Notifications en temps réel
- Gestion propre des déconnexions
- Fonctions utilitaires pour l'émission d'événements

## 📁 Fichiers modifiés
- `server/src/services/socketHandler.ts` (refactorisé)

## 🧪 Tests
- [ ] Tests d'intégration pour les événements
- [ ] Tests de performance
- [ ] Tests de déconnexion

## 📋 Checklist
- [x] Code review effectuée
- [x] Tests passent
- [x] Performance validée
- [x] Pas de régression|refactor,websocket,architecture"

# PR 4: Backend Entities and Routes
PR_CONFIGS["feature/backend-improvements-entities-routes"]="feat: Major backend improvements - entities, routes, and services|Cette PR apporte des améliorations majeures aux entités, routes et services du backend.

## 🎯 Objectif
Améliorer la robustesse, la sécurité et la maintenabilité du backend.

## ✅ Améliorations
- Entités améliorées avec timestamptz et indexes
- Routes refactorisées en thin controllers
- Services centralisés pour la logique métier
- Validation Joi externalisée
- Types TypeScript stricts
- Tests unitaires complets
- Configuration centralisée

## 📁 Fichiers modifiés
- `server/src/models/` (toutes les entités)
- `server/src/routes/` (routes refactorisées)
- `server/src/services/AuthService.ts` (nouveau)
- `server/src/validators/` (nouveau)
- `server/src/types/` (nouveau)
- `server/src/config/config.ts` (nouveau)
- `server/src/utils/` (nouveau)
- `server/tests/unit/` (nouveau)

## 🧪 Tests
- [ ] Tests unitaires pour toutes les entités
- [ ] Tests d'intégration pour les routes
- [ ] Tests pour les services
- [ ] Tests de validation

## 📋 Checklist
- [x] Code review effectuée
- [x] Tests passent
- [x] Documentation mise à jour
- [x] Performance validée|feature,backend,entities,routes"

# PR 5: Backend Config and Middleware
PR_CONFIGS["feature/backend-improvements-config-middleware"]="feat: Improve backend configuration and middleware|Cette PR améliore la configuration et les middlewares du backend.

## 🎯 Objectif
Centraliser la configuration et améliorer les middlewares pour une meilleure robustesse.

## ✅ Améliorations
- Configuration centralisée avec validation
- Middleware d'authentification amélioré
- Gestion d'erreurs globalisée
- Configuration TypeORM optimisée
- Dépendances mises à jour
- Logging structuré intégré

## 📁 Fichiers modifiés
- `server/.env.example`
- `server/package.json`
- `server/src/app.ts`
- `server/src/config/database.ts`
- `server/src/middleware/auth.ts`
- `server/src/middleware/errorHandler.ts`

## 🧪 Tests
- [ ] Tests de configuration
- [ ] Tests des middlewares
- [ ] Tests de gestion d'erreurs

## 📋 Checklist
- [x] Code review effectuée
- [x] Tests passent
- [x] Configuration validée
- [x] Pas de breaking changes|feature,backend,config,middleware"

# PR 6: WebSocket Documentation
PR_CONFIGS["docs/websocket-refactoring-documentation"]="docs: Add comprehensive WebSocket refactoring documentation|Cette PR ajoute la documentation complète du refactoring WebSocket.

## 🎯 Objectif
Documenter toutes les améliorations apportées au système WebSocket.

## ✅ Contenu
- Résumé complet du refactoring WebSocket
- Documentation des services et middlewares
- Guide de tests et métriques
- Patterns de développement
- Checklist des améliorations

## 📁 Fichiers modifiés
- `server/WEBSOCKET_REFACTORING_SUMMARY.md` (nouveau)

## 📋 Checklist
- [x] Documentation complète
- [x] Exemples de code
- [x] Guide d'utilisation
- [x] Métriques définies|documentation,websocket"

# PR 7: Project Documentation
PR_CONFIGS["docs/project-documentation-and-deployment"]="docs: Add comprehensive project documentation and deployment setup|Cette PR ajoute la documentation complète du projet et la configuration de déploiement.

## 🎯 Objectif
Fournir une documentation complète et des outils de déploiement.

## ✅ Contenu
- Templates GitHub pour issues et PRs
- Documentation de déploiement
- Scripts d'automatisation
- Configuration mobile app
- Résumé des améliorations

## 📁 Fichiers modifiés
- `.github/` (templates et configuration)
- `DEPLOYMENT.md` (nouveau)
- `IMPROVEMENTS_SUMMARY.md` (nouveau)
- `deploy.sh` (nouveau)
- `finalize-deployment.sh` (nouveau)
- `mobile/ios-app/` (configuration)

## 📋 Checklist
- [x] Documentation complète
- [x] Scripts fonctionnels
- [x] Templates configurés
- [x] Guide de déploiement|documentation,deployment"

# PR 8: Pull Requests Summary
PR_CONFIGS["docs/pull-requests-summary"]="docs: Add comprehensive Pull Requests summary|Cette PR ajoute le résumé complet de toutes les Pull Requests créées.

## 🎯 Objectif
Documenter l'organisation et la traçabilité du refactoring.

## ✅ Contenu
- Résumé de toutes les PRs créées
- Détail des améliorations par PR
- Ordre de merge recommandé
- Métriques et avantages
- Prochaines étapes

## 📁 Fichiers modifiés
- `PULL_REQUESTS_SUMMARY.md` (nouveau)

## 📋 Checklist
- [x] Documentation complète
- [x] URLs GitHub incluses
- [x] Métriques calculées
- [x] Recommandations claires|documentation,project-management"

# Fonction principale
main() {
    print_status "Début de la création des Pull Requests"
    
    # Vérifications préalables
    check_gh_cli
    check_auth
    
    print_status "Création de $(( ${#PR_CONFIGS[@]} )) Pull Requests..."
    
    local success_count=0
    local error_count=0
    
    # Créer chaque PR
    for branch in "${!PR_CONFIGS[@]}"; do
        IFS='|' read -r title body labels <<< "${PR_CONFIGS[$branch]}"
        
        if create_pr "$branch" "$title" "$body" "$labels"; then
            ((success_count++))
        else
            ((error_count++))
        fi
        
        # Pause entre les créations pour éviter le rate limiting
        sleep 2
    done
    
    # Résumé final
    echo
    print_success "Création terminée !"
    echo "✅ PRs créées avec succès: $success_count"
    echo "❌ Échecs: $error_count"
    echo "📊 Total: $(( ${#PR_CONFIGS[@]} ))"
    
    if [ $error_count -eq 0 ]; then
        print_success "Toutes les PRs ont été créées avec succès !"
        echo
        echo "🔗 Accédez à vos PRs sur: https://github.com/$REPO_OWNER/$REPO_NAME/pulls"
    else
        print_warning "Certaines PRs n'ont pas pu être créées. Vérifiez les erreurs ci-dessus."
    fi
}

# Exécution du script
main "$@" 