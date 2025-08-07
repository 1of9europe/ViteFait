const { device, element, by, expect } = require('detox');

beforeAll(async () => {
  await device.launchApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

describe('ViteFait E2E Tests', () => {
  describe('Authentication Flow', () => {
    it('should login successfully', async () => {
      // Attendre que l'écran de connexion soit visible
      await expect(element(by.text('Connexion'))).toBeVisible();
      
      // Saisir les identifiants
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      
      // Appuyer sur le bouton de connexion
      await element(by.text('Se connecter')).tap();
      
      // Vérifier que l'utilisateur est connecté
      await expect(element(by.text('Accueil'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      await expect(element(by.text('Connexion'))).toBeVisible();
      
      await element(by.id('email-input')).typeText('invalid@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      
      await element(by.text('Se connecter')).tap();
      
      // Vérifier que l'erreur est affichée
      await expect(element(by.text('Identifiants invalides'))).toBeVisible();
    });
  });

  describe('Mission Flow', () => {
    beforeEach(async () => {
      // Se connecter d'abord
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.text('Se connecter')).tap();
    });

    it('should create a new mission', async () => {
      // Aller à l'onglet Missions
      await element(by.text('Missions')).tap();
      
      // Appuyer sur le FAB pour créer une mission
      await element(by.id('create-mi 