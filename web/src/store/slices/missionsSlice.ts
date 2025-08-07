import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Mission {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  clientId: string
  conciergeId?: string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  budget: number
  category: string
}

interface MissionsState {
  missions: Mission[]
  currentMission: Mission | null
  isLoading: boolean
  error: string | null
}

const initialState: MissionsState = {
  missions: [],
  currentMission: null,
  isLoading: false,
  error: null,
}

const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    fetchMissionsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchMissionsSuccess: (state, action: PayloadAction<Mission[]>) => {
      state.isLoading = false
      state.missions = action.payload
    },
    fetchMissionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setCurrentMission: (state, action: PayloadAction<Mission>) => {
      state.currentMission = action.payload
    },
    updateMissionStatus: (state, action: PayloadAction<{ id: string; status: Mission['status'] }>) => {
      const mission = state.missions.find(m => m.id === action.payload.id)
      if (mission) {
        mission.status = action.payload.status
      }
      if (state.currentMission?.id === action.payload.id) {
        state.currentMission.status = action.payload.status
      }
    },
    addMission: (state, action: PayloadAction<Mission>) => {
      state.missions.unshift(action.payload)
    },
  },
})

export const { 
  fetchMissionsStart, 
  fetchMissionsSuccess, 
  fetchMissionsFailure, 
  setCurrentMission, 
  updateMissionStatus,
  addMission 
} = missionsSlice.actions

export default missionsSlice.reducer 