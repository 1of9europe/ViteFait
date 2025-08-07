#!/bin/bash

echo "🔧 Correction automatique des erreurs TypeScript..."

# 1. Corriger les imports MissionStatus dans reviews.ts
echo "📝 Correction des imports dans reviews.ts..."
sed -i '' 's/import { Mission, MissionStatus } from '\''\.\.\/models\/Mission'\'';/import { Mission } from '\''\.\.\/models\/Mission'\'';\nimport { MissionStatus } from '\''\.\.\/types\/enums'\'';/' src/routes/reviews.ts

# 2. Ajouter vérifications de paramètres undefined
echo "🔍 Ajout des vérifications de paramètres..."
find src/routes -name "*.ts" -exec sed -i '' 's/const { id } = req.params;/const { id } = req.params;\n  if (!id) { return res.status(400).json({ error: "ID manquant" }); }/' {} \;
find src/routes -name "*.ts" -exec sed -i '' 's/const { missionId } = req.params;/const { missionId } = req.params;\n  if (!missionId) { return res.status(400).json({ error: "Mission ID manquant" }); }/' {} \;
find src/routes -name "*.ts" -exec sed -i '' 's/const { userId } = req.params;/const { userId } = req.params;\n  if (!userId) { return res.status(400).json({ error: "User ID manquant" }); }/' {} \;

# 3. Ajouter retours explicites
echo "↩️ Ajout des retours explicites..."
find src/routes -name "*.ts" -exec sed -i '' 's/res\.json(/return res.json(/g' {} \;
find src/routes -name "*.ts" -exec sed -i '' 's/res\.status(/return res.status(/g' {} \;

# 4. Corriger les variables non utilisées dans services
echo "🧹 Suppression des variables non utilisées..."
find src/services -name "*.ts" -exec sed -i '' 's/import { User } from '\''\.\.\/models\/User'\'';//' {} \;

# 5. Corriger les erreurs de logger dans ChatService et NotificationService
echo "📝 Correction des erreurs de logger..."
# Ces erreurs nécessitent une correction manuelle plus complexe

echo "✅ Corrections appliquées"
echo "⚠️  Certaines erreurs nécessitent une correction manuelle"
echo "🔍 Vérifiez les fichiers suivants :"
echo "   - src/services/ChatService.ts (erreurs de logger)"
echo "   - src/services/NotificationService.ts (erreurs de logger)"
echo "   - src/routes/reviews.ts (erreurs de types complexes)" 