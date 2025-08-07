import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import missionReducer from './missionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    missions: missionReducer,
    // TODO: Ajouter les autres slices (notifications, chat, etc.)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer les actions non-sérialisables pour les dates
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 