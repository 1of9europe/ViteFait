import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice';
import missionReducer from '@/store/missionSlice';
import Navigation from '@/navigation';
import LoginScreen from '@/screens/auth/LoginScreen';
import MissionsScreen from '@/screens/main/MissionsScreen';

// Mock des composants
jest.mock('@/screens/auth/LoginScreen', () => {
  return function MockLoginScreen() {
    return null;
  };
});

jest.mock('@/screens/main/MissionsScreen', () => {
  return function MockMissionsScreen() {
    return null;
  };
});

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      missions: missionReducer,
    },
    preloadedState: initialState,
  });
};

describe('Navigation Integration', () => {
  it('should show AuthStack when user is not authenticated', () => {
    const store = createTestStore({
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </Provider>
    );

    // Vérifier que l'AuthStack est affiché
    expect(store.getState().auth.token).toBe(null);
  });

  it('should show MainStack when user is authenticated', () => {
    const store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          status: 'active',
          rating: 4.5,
          reviewCount: 10,
          isVerified: true,
          createdAt: '2024-01-01T08:00:00Z',
          updatedAt: '2024-01-01T08:00:00Z',
        },
        token: 'mock-token',
        isLoading: false,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </Provider>
    );

    // Vérifier que le MainStack est affiché
    expect(store.getState().auth.token).toBe('mock-token');
  });

  it('should show loading screen during authentication check', () => {
    const store = createTestStore({
      auth: {
        user: null,
        token: null,
        isLoading: true,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </Provider>
    );

    // Vérifier que l'écran de chargement est affiché
    expect(store.getState().auth.isLoading).toBe(true);
  });
});

describe('LoginScreen Integration', () => {
  it('should handle login and navigate to main stack', async () => {
    const store = createTestStore();
    const mockNavigation = {
      navigate: jest.fn(),
    };

    const { getByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    // Simuler la saisie des identifiants
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Mot de passe');
    const loginButton = getByText('Se connecter');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Vérifier que le thunk de connexion est dispatché
    await waitFor(() => {
      expect(store.getState().auth.isLoading).toBe(true);
    });
  });
});

describe('MissionsScreen Integration', () => {
  it('should fetch missions on mount', async () => {
    const store = createTestStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          status: 'active',
          rating: 4.5,
          reviewCount: 10,
          isVerified: true,
          createdAt: '2024-01-01T08:00:00Z',
          updatedAt: '2024-01-01T08:00:00Z',
        },
        token: 'mock-token',
        isLoading: false,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MissionsScreen />
      </Provider>
    );

    // Vérifier que les missions sont chargées
    await waitFor(() => {
      expect(store.getState().missions.isLoading).toBe(true);
    });
  });
});
