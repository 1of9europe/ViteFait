import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types';
import apiService, { ApiError } from '@/services/api';
import { mapApiErrorToUserError, logApiError } from '@/utils/apiErrorHandler';

// Types pour le state
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// State initial
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Thunks asynchrones
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getNotifications();
      return response.data!;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'fetchNotifications');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.markNotificationAsRead(id);
      return id;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'markNotificationAsRead');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { clearError, addNotification, markAllAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

// Sélecteurs
export const selectNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications;

export const selectUnreadCount = (state: { notifications: NotificationState }) => 
  state.notifications.unreadCount;

export const selectNotificationsLoading = (state: { notifications: NotificationState }) => 
  state.notifications.isLoading;

export const selectNotificationsError = (state: { notifications: NotificationState }) => 
  state.notifications.error;