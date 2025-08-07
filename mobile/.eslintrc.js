module.exports = {
  root: true,
  extends: [
    '@react-native',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/no-single-element-style-arrays': 'warn',
  },
  env: {
    'react-native/react-native': true,
    es2021: true,
    node: true,
    jest: true,
  },
  settings: {
    'react-native/style-sheet-object-names': ['StyleSheet', 'OtherStyleSheet'],
  },
}; 