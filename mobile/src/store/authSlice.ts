import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, LoginCredentials, SignupData, User } from '@/types';
import apiService, { ApiError } from '@/services/api';
import { mapApiErrorToUserError, logApiError } from '@/utils/apiErrorHandler';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'login');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: SignupData, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(userData);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'signup');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        // Vérifier que le token est toujours valide
        try {
          await apiService.getProfile();
          return { user, token };
        } catch (error) {
          // Token invalide, supprimer les données stockées
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
          return rejectWithValue('Session expirée');
        }
      }

      return rejectWithValue('Aucune session trouvée');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors du chargement de la session');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'logout');
      // Continuer même si la requête échoue
      return true;
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProfile(profileData);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'updateProfile');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectIsClient = (state: { auth: AuthState }) => state.auth.user?.role === 'client';
export const selectIsAssistant = (state: { auth: AuthState }) => state.auth.user?.role === 'assistant';

export default authSlice.reducer; 