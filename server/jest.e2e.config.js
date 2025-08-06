module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.e2e.test.ts',
    '**/tests/**/*.integration.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: false,
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 