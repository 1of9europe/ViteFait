const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  // Éviter l'initialisation de la base de données
  setupFiles: ['<rootDir>/jest.unit.setup.js']
}; 