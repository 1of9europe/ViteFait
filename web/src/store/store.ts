import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import missionsReducer from './slices/missionsSlice'
import paymentsReducer from './slices/paymentsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    missions: missionsReducer,
    payments: paymentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 