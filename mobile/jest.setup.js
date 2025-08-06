import 'react-native-gesture-handler/jestSetup';

// Mock des modules natifs
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock des notifications
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  requestPermissions: jest.fn(),
}));

// Mock de la géolocalisation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

// Mock de Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  useStripe: () => ({
    createPaymentMethod: jest.fn(),
    confirmPayment: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
}));

// Supprimer les logs en test
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 