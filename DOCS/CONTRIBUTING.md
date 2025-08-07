# Guide de Contribution - Conciergerie Urbaine

## 🚀 Comment contribuer

Merci de votre intérêt pour contribuer au projet Conciergerie Urbaine ! Ce guide vous aidera à comprendre comment participer au développement.

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- Git
- Xcode 14+ (pour le développement iOS)

## 🔧 Configuration de l'environnement

1. **Fork et clone le projet**
   ```bash
   git clone https://github.com/votre-username/ViteFait.git
   cd ViteFait
   ```

2. **Configuration du backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Configurer les variables d'environnement
   ```

3. **Configuration du mobile**
   ```bash
   cd mobile/ios-app
   npm install
   cd ios && pod install
   ```

## 🌿 Workflow de développement

### 1. Créer une feature branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nom-de-la-feature
```

### 2. Développement
- Suivez les conventions de code (ESLint, Prettier)
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez les changements

### 3. Tests
```bash
# Backend
cd server
npm test
npm run test:e2e

# Mobile
cd mobile/ios-app
npm test
```

### 4. Commit et Push
```bash
git add .
git commit -m "feat: description de la feature"
git push origin feature/nom-de-la-feature
```

### 5. Pull Request
- Créez une Pull Request vers la branche `develop`
- Décrivez clairement les changements
- Assurez-vous que tous les tests passent

## 📝 Conventions de code

### Messages de commit
Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, points-virgules manquants, etc.
- `refactor:` Refactoring du code
- `test:` Ajout ou modification de tests
- `chore:` Mise à jour des tâches de build, etc.

### Code Style
- Backend : ESLint + Prettier
- Mobile : ESLint + Prettier
- TypeScript strict mode activé

## 🧪 Tests

### Backend
- Tests unitaires avec Jest
- Tests d'intégration avec Supertest
- Couverture de code minimum : 80%

### Mobile
- Tests unitaires avec Jest
- Tests E2E avec Detox (iOS)

## 📚 Documentation

- Mettez à jour la documentation API si nécessaire
- Ajoutez des commentaires JSDoc pour les nouvelles fonctions
- Documentez les changements dans le README

## 🔒 Sécurité

- Ne committez jamais de secrets ou de clés API
- Utilisez les variables d'environnement
- Signalez les vulnérabilités de sécurité

## 🐛 Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Version de l'environnement

## 💡 Proposer une fonctionnalité

1. Créez une issue avec le label "enhancement"
2. Décrivez la fonctionnalité souhaitée
3. Expliquez pourquoi elle serait utile
4. Proposez une implémentation si possible

## 📞 Support

- Issues GitHub : [Lien vers les issues]
- Discussions : [Lien vers les discussions]
- Email : [Email de contact]

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

---

Merci de contribuer à Conciergerie Urbaine ! 🎉 