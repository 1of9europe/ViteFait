import { configureStore } from '@reduxjs/toolkit';
import missionReducer, {
  fetchMissions,
  fetchMissionById,
  createMission,
  acceptMission,
  updateMissionStatus,
  selectMissions,
  selectCurrentMission,
  selectMissionsLoading,
  selectMissionsError,
  selectPendingMissions,
  selectUserMissions,
} from '@/store/missionSlice';
import { Mission, CreateMissionData, MissionStatus } from '@/types';

// Mock de l'ApiService
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    getMissions: jest.fn(),
    getMission: jest.fn(),
    createMission: jest.fn(),
    acceptMission: jest.fn(),
    updateMissionStatus: jest.fn(),
  },
}));

// Mock de l'utilitaire d'erreur
jest.mock('@/utils/apiErrorHandler', () => ({
  mapApiErrorToUserError: jest.fn((error) => ({ message: error.message })),
  logApiError: jest.fn(),
}));

import apiService from '@/services/api';
import { mapApiErrorToUserError, logApiError } from '@/utils/apiErrorHandler';

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('Mission Slice', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        missions: missionReducer,
        auth: {
          reducer: (state = { user: null }, action: any) => state,
          actions: {},
        },
      },
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().missions;
      expect(state).toEqual({
        missionsList: [],
        currentMission: null,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('fetchMissions', () => {
    const mockMissions: Mission[] = [
      {
        id: '1',
        title: 'Mission Test 1',
        description: 'Description test 1',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: 'Paris, France',
        timeWindowStart: '2024-01-01T09:00:00Z',
        timeWindowEnd: '2024-01-01T17:00:00Z',
        priceEstimate: 50,
        cashAdvance: 0,
        finalPrice: 50,
        status: 'pending',
        priority: 'medium',
        requiresCar: false,
        requiresTools: false,
        commissionAmount: 5,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
        client: {
          id: 'client1',
          email: 'client@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          status: 'active',
          rating: 4.5,
          reviewCount: 10,
          isVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    ];

    it('should handle fetchMissions.pending', async () => {
      mockApiService.getMissions.mockResolvedValue({ data: mockMissions });

      const promise = store.dispatch(fetchMissions());
      
      expect(store.getState().missions.isLoading).toBe(true);
      expect(store.getState().missions.error).toBe(null);

      await promise;
    });

    it('should handle fetchMissions.fulfilled', async () => {
      mockApiService.getMissions.mockResolvedValue({ data: mockMissions });

      await store.dispatch(fetchMissions());

      expect(store.getState().missions.isLoading).toBe(false);
      expect(store.getState().missions.missionsList).toEqual(mockMissions);
      expect(store.getState().missions.error).toBe(null);
    });

    it('should handle fetchMissions.rejected', async () => {
      const error = { message: 'Erreur réseau' };
      mockApiService.getMissions.mockRejectedValue(error);

      await store.dispatch(fetchMissions());

      expect(store.getState().missions.isLoading).toBe(false);
      expect(store.getState().missions.error).toBe('Erreur réseau');
      expect(logApiError).toHaveBeenCalledWith(error, 'fetchMissions');
    });
  });

  describe('fetchMissionById', () => {
    const mockMission: Mission = {
      id: '1',
      title: 'Mission Test',
      description: 'Description test',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      pickupAddress: 'Paris, France',
      timeWindowStart: '2024-01-01T09:00:00Z',
      timeWindowEnd: '2024-01-01T17:00:00Z',
      priceEstimate: 50,
      cashAdvance: 0,
      finalPrice: 50,
      status: 'pending',
      priority: 'medium',
      requiresCar: false,
      requiresTools: false,
      commissionAmount: 5,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
      client: {
        id: 'client1',
        email: 'client@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'client',
        status: 'active',
        rating: 4.5,
        reviewCount: 10,
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    it('should handle fetchMissionById.fulfilled', async () => {
      mockApiService.getMission.mockResolvedValue({ data: mockMission });

      await store.dispatch(fetchMissionById('1'));

      expect(store.getState().missions.isLoading).toBe(false);
      expect(store.getState().missions.currentMission).toEqual(mockMission);
      expect(store.getState().missions.error).toBe(null);
    });

    it('should handle fetchMissionById.rejected', async () => {
      const error = { message: 'Mission introuvable' };
      mockApiService.getMission.mockRejectedValue(error);

      await store.dispatch(fetchMissionById('999'));

      expect(store.getState().missions.isLoading).toBe(false);
      expect(store.getState().missions.error).toBe('Mission introuvable');
    });
  });

  describe('createMission', () => {
    const mockCreateData: CreateMissionData = {
      title: 'Nouvelle Mission',
      description: 'Description de la nouvelle mission',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      pickupAddress: 'Paris, France',
      timeWindowStart: '2024-01-01T09:00:00Z',
      timeWindowEnd: '2024-01-01T17:00:00Z',
      priceEstimate: 50,
      cashAdvance: 0,
      priority: 'medium',
      requiresCar: false,
      requiresTools: false,
    };

    const mockCreatedMission: Mission = {
      id: '2',
      title: 'Nouvelle Mission',
      description: 'Description de la nouvelle mission',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      pickupAddress: 'Paris, France',
      timeWindowStart: '2024-01-01T09:00:00Z',
      timeWindowEnd: '2024-01-01T17:00:00Z',
      priceEstimate: 50,
      cashAdvance: 0,
      finalPrice: 50,
      status: 'pending',
      priority: 'medium',
      requiresCar: false,
      requiresTools: false,
      commissionAmount: 5,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
      client: {
        id: 'client1',
        email: 'client@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'client',
        status: 'active',
        rating: 4.5,
        reviewCount: 10,
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    it('should handle createMission.fulfilled', async () => {
      mockApiService.createMission.mockResolvedValue({ data: mockCreatedMission });

      await store.dispatch(createMission(mockCreateData));

      expect(store.getState().missions.isLoading).toBe(false);
      expect(store.getState().missions.missionsList).toContain(mockCreatedMission);
      expect(store.getState().missions.currentMission).toEqual(mockCreatedMission);
    });
  });

  describe('acceptMission', () => {
    const mockAcceptedMission: Mission = {
      id: '1',
      title: 'Mission Test',
      description: 'Description test',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      pickupAddress: 'Paris, France',
      timeWindowStart: '2024-01-01T09:00:00Z',
      timeWindowEnd: '2024-01-01T17:00:00Z',
      priceEstimate: 50,
      cashAdvance: 0,
      finalPrice: 50,
      status: 'accepted',
      priority: 'medium',
      requiresCar: false,
      requiresTools: false,
      commissionAmount: 5,
      acceptedAt: '2024-01-01T10:00:00Z',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
      client: {
        id: 'client1',
        email: 'client@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'client',
        status: 'active',
        rating: 4.5,
        reviewCount: 10,
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      assistant: {
        id: 'assistant1',
        email: 'assistant@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'assistant',
        status: 'active',
        rating: 4.8,
        reviewCount: 25,
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    it('should handle acceptMission.fulfilled', async () => {
      // Préparer l'état initial avec une mission en attente
      const initialState = {
        missionsList: [mockAcceptedMission],
        currentMission: mockAcceptedMission,
        isLoading: false,
        error: null,
      };

      const testStore = configureStore({
        reducer: {
          missions: missionReducer,
          auth: {
            reducer: (state = { user: null }, action: any) => state,
            actions: {},
          },
        },
        preloadedState: {
          missions: initialState,
        },
      });

      mockApiService.acceptMission.mockResolvedValue({ data: mockAcceptedMission });

      await testStore.dispatch(acceptMission('1'));

      const state = testStore.getState().missions;
      expect(state.isLoading).toBe(false);
      expect(state.missionsList[0].status).toBe('accepted');
      expect(state.currentMission?.status).toBe('accepted');
    });
  });

  describe('updateMissionStatus', () => {
    it('should handle updateMissionStatus.fulfilled', async () => {
      const mockUpdatedMission: Mission = {
        id: '1',
        title: 'Mission Test',
        description: 'Description test',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: 'Paris, France',
        timeWindowStart: '2024-01-01T09:00:00Z',
        timeWindowEnd: '2024-01-01T17:00:00Z',
        priceEstimate: 50,
        cashAdvance: 0,
        finalPrice: 50,
        status: 'cancelled',
        priority: 'medium',
        requiresCar: false,
        requiresTools: false,
        commissionAmount: 5,
        cancelledAt: '2024-01-01T11:00:00Z',
        cancellationReason: 'Annulé par le client',
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z',
        client: {
          id: 'client1',
          email: 'client@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          status: 'active',
          rating: 4.5,
          reviewCount: 10,
          isVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.updateMissionStatus.mockResolvedValue({ data: mockUpdatedMission });

      await store.dispatch(updateMissionStatus({ id: '1', status: 'cancelled' as MissionStatus }));

      expect(store.getState().missions.isLoading).toBe(false);
    });
  });

  describe('Selectors', () => {
    const mockMissions: Mission[] = [
      {
        id: '1',
        title: 'Mission Pending',
        description: 'Description 1',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: 'Paris, France',
        timeWindowStart: '2024-01-01T09:00:00Z',
        timeWindowEnd: '2024-01-01T17:00:00Z',
        priceEstimate: 50,
        cashAdvance: 0,
        finalPrice: 50,
        status: 'pending',
        priority: 'medium',
        requiresCar: false,
        requiresTools: false,
        commissionAmount: 5,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
        client: {
          id: 'client1',
          email: 'client@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          status: 'active',
          rating: 4.5,
          reviewCount: 10,
          isVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
      {
        id: '2',
        title: 'Mission Accepted',
        description: 'Description 2',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: 'Paris, France',
        timeWindowStart: '2024-01-01T09:00:00Z',
        timeWindowEnd: '2024-01-01T17:00:00Z',
        priceEstimate: 75,
        cashAdvance: 0,
        finalPrice: 75,
        status: 'accepted',
        priority: 'high',
        requiresCar: true,
        requiresTools: false,
        commissionAmount: 7.5,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
        client: {
          id: 'client2',
          email: 'client2@test.com',
          firstName: 'Alice',
          lastName: 'Johnson',
          role: 'client',
          status: 'active',
          rating: 4.2,
          reviewCount: 5,
          isVerified: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    ];

    beforeEach(() => {
      store = configureStore({
        reducer: {
          missions: missionReducer,
          auth: {
            reducer: (state = { user: null }, action: any) => state,
            actions: {},
          },
        },
        preloadedState: {
          missions: {
            missionsList: mockMissions,
            currentMission: mockMissions[0],
            isLoading: false,
            error: null,
          },
        },
      });
    });

    it('should select missions list', () => {
      const missions = selectMissions(store.getState());
      expect(missions).toEqual(mockMissions);
    });

    it('should select current mission', () => {
      const currentMission = selectCurrentMission(store.getState());
      expect(currentMission).toEqual(mockMissions[0]);
    });

    it('should select loading state', () => {
      const isLoading = selectMissionsLoading(store.getState());
      expect(isLoading).toBe(false);
    });

    it('should select error state', () => {
      const error = selectMissionsError(store.getState());
      expect(error).toBe(null);
    });

    it('should select pending missions', () => {
      const pendingMissions = selectPendingMissions(store.getState());
      expect(pendingMissions).toHaveLength(1);
      expect(pendingMissions[0].status).toBe('pending');
    });

    it('should select user missions', () => {
      const testStore = configureStore({
        reducer: {
          missions: missionReducer,
          auth: {
            reducer: (state = { user: { id: 'client1' } }, action: any) => state,
            actions: {},
          },
        },
        preloadedState: {
          missions: {
            missionsList: mockMissions,
            currentMission: null,
            isLoading: false,
            error: null,
          },
        },
      });

      const userMissions = selectUserMissions(testStore.getState());
      expect(userMissions).toHaveLength(1);
      expect(userMissions[0].client.id).toBe('client1');
    });
  });
}); 