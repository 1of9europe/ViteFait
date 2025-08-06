module.exports = {
  extends: ['../configs/eslint.base.js'],
  env: {
    es2021: true,
    node: true,
    jest: true,
    'react-native/react-native': true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-native'],
  rules: {
    // Règles spécifiques au mobile
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
  },
}; 