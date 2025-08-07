module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-native-community|@react-navigation|@reduxjs|react-redux|axios|formik|yup|date-fns|react-native-paper|react-native-elements|react-native-vector-icons|react-native-maps|@stripe|react-native-push-notification|react-native-device-info|react-native-keychain|@react-native-async-storage|socket.io-client|react-native-splash-screen|react-native-linear-gradient|react-native-modal|react-native-skeleton-placeholder|react-native-fast-image|react-native-svg|react-native-image-picker|react-native-camera|react-native-permissions|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
}; 