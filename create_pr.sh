#!/bin/bash

# Script pour créer une Pull Request via l'API GitHub
# Nécessite un token GitHub avec les permissions repo

REPO="1of9europe/ViteFait"
BRANCH="feat/backend-stabilization"
BASE="main"
TITLE="feat: Stabilisation complète du backend ViteFait v0"
BODY_FILE="pr_body.md"

# Vérifier si le token GitHub est défini
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN non défini"
    echo "Pour créer la PR, vous devez :"
    echo "1. Aller sur https://github.com/settings/tokens"
    echo "2. Créer un token avec les permissions 'repo'"
    echo "3. Exporter le token : export GITHUB_TOKEN=your_token"
    echo ""
    echo "Ou utiliser le lien direct :"
    echo "https://github.com/$REPO/pull/new/$BRANCH"
    exit 1
fi

# Créer la Pull Request
echo "🚀 Création de la Pull Request..."
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO/pulls \
  -d "{
    \"title\": \"$TITLE\",
    \"body\": \"$(cat $BODY_FILE)\",
    \"head\": \"$BRANCH\",
    \"base\": \"$BASE\"
  }"

echo ""
echo "✅ Pull Request créée avec succès !"
echo "URL: https://github.com/$REPO/pulls" 