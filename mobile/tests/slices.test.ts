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
} from '@/store/missionSlice';
import chatReducer, {
  fetchChatMessages,
  sendMessage,
  selectChatMessages,
  selectChatLoading,
  selectChatError,
} from '@/store/chatSlice';
import notificationReducer, {
  fetchNotifications,
  markNotificationAsRead,
  selectNotifications,
  selectUnreadCount,
} from '@/store/notificationSlice';
import { Mission, ChatMessage, Notification } from '@/types';

// Mocks
jest.mock('@/services/api', () => ({
  default: {
    getMissions: jest.fn(),
    getMission: jest.fn(),
    createMission: jest.fn(),
    acceptMission: jest.fn(),
    updateMissionStatus: jest.fn(),
    getChatMessages: jest.fn(),
    sendMessage: jest.fn(),
    getNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
  },
}));

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
      },
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  describe('fetchMissions', () => {
    it('should fetch missions successfully', async () => {
      const mockMissions: Mission[] = [
        {
          id: '1',
          title: 'Test Mission',
          description: 'Test Description',
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
            createdAt: '2024-01-01T08:00:00Z',
            updatedAt: '2024-01-01T08:00:00Z',
          },
        },
      ];

      mockApiService.getMissions.mockResolvedValue({
        data: mockMissions,
        pagination: { limit: 20, offset: 0, total: 1 },
      });

      await store.dispatch(fetchMissions());
      const state = store.getState().missions;

      expect(state.missionsList).toEqual(mockMissions);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetch missions error', async () => {
      const mockError = { status: 500, message: 'Server error' };
      mockApiService.getMissions.mockRejectedValue(mockError);

      await store.dispatch(fetchMissions());
      const state = store.getState().missions;

      expect(state.error).toBe('Server error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('createMission', () => {
    it('should create mission successfully', async () => {
      const createData = {
        title: 'New Mission',
        description: 'New Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: 'Paris, France',
        timeWindowStart: '2024-01-01T09:00:00Z',
        timeWindowEnd: '2024-01-01T17:00:00Z',
        priceEstimate: 50,
        cashAdvance: 0,
        priority: 'medium' as const,
        requiresCar: false,
        requiresTools: false,
      };

      const mockMission: Mission = {
        id: '2',
        ...createData,
        dropLatitude: undefined,
        dropLongitude: undefined,
        dropAddress: undefined,
        finalPrice: 50,
        status: 'pending',
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
          createdAt: '2024-01-01T08:00:00Z',
          updatedAt: '2024-01-01T08:00:00Z',
        },
      };

      mockApiService.createMission.mockResolvedValue({
        data: mockMission,
      });

      await store.dispatch(createMission(createData));
      const state = store.getState().missions;

      expect(state.missionsList).toContain(mockMission);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('selectors', () => {
    it('should select missions correctly', () => {
      const state = { missions: { missionsList: [] } };
      const result = selectMissions(state);
      expect(result).toEqual([]);
    });

    it('should select current mission correctly', () => {
      const mockMission = { id: '1', title: 'Test' } as Mission;
      const state = { missions: { currentMission: mockMission } };
      const result = selectCurrentMission(state);
      expect(result).toEqual(mockMission);
    });

    it('should select loading state correctly', () => {
      const state = { missions: { isLoading: true } };
      const result = selectMissionsLoading(state);
      expect(result).toBe(true);
    });

    it('should select error state correctly', () => {
      const state = { missions: { error: 'Test error' } };
      const result = selectMissionsError(state);
      expect(result).toBe('Test error');
    });
  });
});

describe('Chat Slice', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        chat: chatReducer,
      },
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  describe('fetchChatMessages', () => {
    it('should fetch chat messages successfully', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          missionId: 'mission1',
          senderId: 'user1',
          senderRole: 'client',
          message: 'Hello',
          type: 'text',
          timestamp: '2024-01-01T10:00:00Z',
        },
      ];

      mockApiService.getChatMessages.mockResolvedValue({
        data: mockMessages,
      });

      await store.dispatch(fetchChatMessages('mission1'));
      const state = store.getState().chat;

      expect(state.messages['mission1']).toEqual(mockMessages);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockMessage: ChatMessage = {
        id: '2',
        missionId: 'mission1',
        senderId: 'user1',
        senderRole: 'client',
        message: 'New message',
        type: 'text',
        timestamp: '2024-01-01T11:00:00Z',
      };

      mockApiService.sendMessage.mockResolvedValue({
        data: mockMessage,
      });

      await store.dispatch(sendMessage({ missionId: 'mission1', message: 'New message' }));
      const state = store.getState().chat;

      expect(state.messages['mission1']).toContain(mockMessage);
      expect(state.isLoading).toBe(false);
    });
  });
});

describe('Notification Slice', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        notifications: notificationReducer,
      },
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  describe('fetchNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'mission_accepted',
          title: 'Mission acceptée',
          message: 'Votre mission a été acceptée',
          timestamp: '2024-01-01T10:00:00Z',
          isRead: false,
        },
      ];

      mockApiService.getNotifications.mockResolvedValue({
        data: mockNotifications,
        pagination: { limit: 20, offset: 0, total: 1 },
      });

      await store.dispatch(fetchNotifications());
      const state = store.getState().notifications;

      expect(state.notifications).toEqual(mockNotifications);
      expect(state.unreadCount).toBe(1);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      // Setup initial state with unread notification
      store = configureStore({
        reducer: {
          notifications: notificationReducer,
        },
        preloadedState: {
          notifications: {
            notifications: [
              {
                id: '1',
                type: 'mission_accepted',
                title: 'Mission acceptée',
                message: 'Votre mission a été acceptée',
                timestamp: '2024-01-01T10:00:00Z',
                isRead: false,
              },
            ],
            unreadCount: 1,
            isLoading: false,
            error: null,
          },
        },
      });

      mockApiService.markNotificationAsRead.mockResolvedValue({});

      await store.dispatch(markNotificationAsRead('1'));
      const state = store.getState().notifications;

      expect(state.notifications[0].isRead).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });
}); 