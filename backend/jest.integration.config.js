const baseConfig = require('../configs/jest.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'backend-integration',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app.ts',
  ],
}; 