import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Mission, CreateMissionData, MissionStatus } from '@/types';
import apiService, { ApiError } from '@/services/api';
import { mapApiErrorToUserError, logApiError } from '@/utils/apiErrorHandler';

// Types pour le state
export interface MissionState {
  missionsList: Mission[];
  currentMission: Mission | null;
  isLoading: boolean;
  error: string | null;
}

// State initial
const initialState: MissionState = {
  missionsList: [],
  currentMission: null,
  isLoading: false,
  error: null,
};

// Thunks asynchrones
export const fetchMissions = createAsyncThunk(
  'missions/fetchMissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMissions();
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'fetchMissions');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const fetchMissionById = createAsyncThunk(
  'missions/fetchMissionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getMission(id);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'fetchMissionById');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const createMission = createAsyncThunk(
  'missions/createMission',
  async (data: CreateMissionData, { rejectWithValue }) => {
    try {
      const response = await apiService.createMission(data);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'createMission');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const acceptMission = createAsyncThunk(
  'missions/acceptMission',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.acceptMission(id);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'acceptMission');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const updateMissionStatus = createAsyncThunk(
  'missions/updateMissionStatus',
  async ({ id, status }: { id: string; status: MissionStatus }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateMissionStatus(id, status);
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'updateMissionStatus');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

// Slice
const missionSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMission: (state) => {
      state.currentMission = null;
    },
    updateMissionInList: (state, action: PayloadAction<Mission>) => {
      const index = state.missionsList.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.missionsList[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchMissions
    builder
      .addCase(fetchMissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.missionsList = action.payload;
      })
      .addCase(fetchMissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchMissionById
    builder
      .addCase(fetchMissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMission = action.payload;
      })
      .addCase(fetchMissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createMission
    builder
      .addCase(createMission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.missionsList.unshift(action.payload); // Ajouter au début de la liste
        state.currentMission = action.payload;
      })
      .addCase(createMission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // acceptMission
    builder
      .addCase(acceptMission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptMission.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedMission = action.payload;
        
        // Mettre à jour dans la liste
        const index = state.missionsList.findIndex(m => m.id === updatedMission.id);
        if (index !== -1) {
          state.missionsList[index] = updatedMission;
        }
        
        // Mettre à jour la mission courante si c'est la même
        if (state.currentMission?.id === updatedMission.id) {
          state.currentMission = updatedMission;
        }
      })
      .addCase(acceptMission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateMissionStatus
    builder
      .addCase(updateMissionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMissionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedMission = action.payload;
        
        // Mettre à jour dans la liste
        const index = state.missionsList.findIndex(m => m.id === updatedMission.id);
        if (index !== -1) {
          state.missionsList[index] = updatedMission;
        }
        
        // Mettre à jour la mission courante si c'est la même
        if (state.currentMission?.id === updatedMission.id) {
          state.currentMission = updatedMission;
        }
      })
      .addCase(updateMissionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearCurrentMission, updateMissionInList } = missionSlice.actions;

// Sélecteurs
export const selectMissions = (state: { missions: MissionState }) => state.missions.missionsList;
export const selectCurrentMission = (state: { missions: MissionState }) => state.missions.currentMission;
export const selectMissionsLoading = (state: { missions: MissionState }) => state.missions.isLoading;
export const selectMissionsError = (state: { missions: MissionState }) => state.missions.error;

// Sélecteurs dérivés
export const selectPendingMissions = (state: { missions: MissionState }) => 
  state.missions.missionsList.filter(mission => mission.status === 'pending');

export const selectUserMissions = (state: { missions: MissionState; auth: { user: any } }) => {
  const user = state.auth.user;
  if (!user) return [];
  
  return state.missions.missionsList.filter(mission => 
    mission.client.id === user.id || mission.assistant?.id === user.id
  );
};

export default missionSlice.reducer; 