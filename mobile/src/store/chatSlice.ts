import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/types';
import apiService, { ApiError } from '@/services/api';
import { mapApiErrorToUserError, logApiError } from '@/utils/apiErrorHandler';

// Types pour le state
export interface ChatState {
  messages: Record<string, ChatMessage[]>; // missionId -> messages[]
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

// State initial
const initialState: ChatState = {
  messages: {},
  isLoading: false,
  error: null,
  isConnected: false,
};

// Thunks asynchrones
export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (missionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getChatMessages(missionId);
      return { missionId, messages: response.data! };
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'fetchChatMessages');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ missionId, message }: { missionId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.sendMessage(missionId, message);
      return { missionId, message: response.data! };
    } catch (error) {
      const apiError = error as ApiError;
      logApiError(apiError, 'sendMessage');
      const userError = mapApiErrorToUserError(apiError);
      return rejectWithValue(userError.message);
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ missionId: string; message: ChatMessage }>) => {
      const { missionId, message } = action.payload;
      if (!state.messages[missionId]) {
        state.messages[missionId] = [];
      }
      state.messages[missionId].push(message);
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const missionId = action.payload;
      state.messages[missionId] = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchChatMessages
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { missionId, messages } = action.payload;
        state.messages[missionId] = messages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        const { missionId, message } = action.payload;
        if (!state.messages[missionId]) {
          state.messages[missionId] = [];
        }
        state.messages[missionId].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setConnectionStatus, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;

// Sélecteurs
export const selectChatMessages = (state: { chat: ChatState }, missionId: string) => 
  state.chat.messages[missionId] || [];

export const selectChatLoading = (state: { chat: ChatState }) => state.chat.isLoading;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;
export const selectChatConnected = (state: { chat: ChatState }) => state.chat.isConnected;
```

```typescript:mobile/src/screens/chat/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { 
  fetchChatMessages, 
  sendMessage, 
  selectChatMessages, 
  selectChatLoading, 
  selectChatError,
  clearError 
} from '@/store/chatSlice';
import { selectUser } from '@/store/authSlice';
import { ChatMessage } from '@/types';

interface RouteParams {
  missionId: string;
}

const ChatScreen: React.FC = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { missionId } = route.params as RouteParams;
  
  const messages = useSelector((state) => selectChatMessages(state, missionId));
  const isLoading = useSelector(selectChatLoading);
  const error = useSelector(selectChatError);
  const user = useSelector(selectUser);
  
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchChatMessages(missionId));
  }, [dispatch, missionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await dispatch(sendMessage({ missionId, message: newMessage.trim() })).unwrap();
        setNewMessage('');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id;
    
    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwnMessage ? styles.ownMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        {!isOwnMessage && (
          <Avatar.Text 
            size={32} 
            label={item.senderRole === 'client' ? 'C' : 'A'} 
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Aucun message pour le moment</Text>
      <Text style={styles.emptySubtext}>Commencez la conversation !</Text>
    </View>
  );

  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement des messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat de Mission</Text>
        <Text style={styles.headerSubtitle}>Mission #{missionId}</Text>
      </View>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Tapez votre message..."
          mode="outlined"
          style={styles.textInput}
          multiline
          maxLength={500}
          right={
            <TextInput.Icon 
              icon="send" 
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#2196f3',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  avatar: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    backgroundColor: '#fff',
  },
});

export default ChatScreen;
```

## 3. NotificationSlice et NotificationsScreen

```typescript:mobile/src/store/notificationSlice.ts
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
```

```typescript:mobile/src/screens/main/NotificationsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Title, Button, Avatar, Divider, FAB, Menu } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllAsRead,
  selectNotifications, 
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  clearError 
} from '@/store/notificationSlice';

const NotificationsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isLoading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchNotifications()).unwrap();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    setMenuVisible(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mission_accepted':
        return 'check-circle';
      case 'mission_completed':
        return 'flag-checkered';
      case 'message':
        return 'message';
      case 'payment':
        return 'credit-card';
      case 'review':
        return 'star';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'mission_accepted':
        return '#4caf50';
      case 'mission_completed':
        return '#2196f3';
      case 'message':
        return '#ff9800';
      case 'payment':
        return '#9c27b0';
      case 'review':
        return '#ffc107';
      default:
        return '#757575';
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <Card 
      style={[
        styles.notificationCard, 
        !item.isRead && styles.unreadCard
      ]}
      onPress={() => !item.isRead && handleMarkAsRead(item.id)}
    >
      <Card.Content>
        <View style={styles.notificationHeader}>
          <Avatar.Icon 
            size={40} 
            icon={getNotificationIcon(item.type)}
            color="#fff"
            style={{ backgroundColor: getNotificationColor(item.type) }}
          />
          <View style={styles.notificationContent}>
            <Title style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Title>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>
              {new Date(item.timestamp).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {!item.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucune notification</Text>
      <Text style={styles.emptySubtitle}>
        Vous serez notifié des nouvelles activités
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Notifications</Title>
        {unreadCount > 0 && (
          <Text style={styles.unreadBadge}>{unreadCount}</Text>
        )}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button 
              icon="dots-vertical" 
              onPress={() => setMenuVisible(true)}
              mode="text"
            />
          }
        >
          <Menu.Item 
            onPress={handleMarkAllAsRead} 
            title="Tout marquer comme lu"
            leadingIcon="check-all"
          />
        </Menu>
      </View>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {unreadCount > 0 && (
        <FAB
          icon="check-all"
          style={styles.fab}
          onPress={handleMarkAllAsRead}
          label="Tout marquer comme lu"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#f44336',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f3f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 15,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196f3',
    marginLeft: 10,
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default NotificationsScreen;
```

## 4. PaymentScreen avec Stripe

```typescript:mobile/src/screens/payment/PaymentScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Button, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { 
  createPaymentIntent, 
  confirmPayment,
  selectMissionsLoading,
  selectMissionsError 
} from '@/store/missionSlice';
import { selectCurrentMission } from '@/store/missionSlice';

interface RouteParams {
  missionId: string;
}

const PaymentScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { missionId } = route.params as RouteParams;
  
  const mission = useSelector(selectCurrentMission);
  const isLoading = useSelector(selectMissionsLoading);
  const error = useSelector(selectMissionsError);
  
  const { confirmPayment: stripeConfirmPayment, loading: stripeLoading } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (mission) {
      initializePayment();
    }
  }, [mission]);

  const initializePayment = async () => {
    try {
      setPaymentStatus('processing');
      const result = await dispatch(createPaymentIntent(missionId, mission.finalPrice)).unwrap();
      setPaymentIntent(result);
      setPaymentStatus('idle');
    } catch (error) {
      setPaymentStatus('failed');
      Alert.alert('Erreur', 'Impossible d\'initialiser le paiement');
    }
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete || !paymentIntent) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs de la carte');
      return;
    }

    try {
      setPaymentStatus('processing');
      
      const { error: confirmError } = await stripeConfirmPayment(paymentIntent.client_secret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: `${mission.client.firstName} ${mission.client.lastName}`,
            email: mission.client.email,
          },
        },
      });

      if (confirmError) {
        setPaymentStatus('failed');
        Alert.alert('Erreur de paiement', confirmError.message);
      } else {
        // Confirmer le paiement côté serveur
        await dispatch(confirmPayment(paymentIntent.id)).unwrap();
        setPaymentStatus('success');
        
        Alert.alert(
          'Paiement réussi !',
          'Votre paiement a été traité avec succès.',
          [
            {
              text: 'Voir la mission',
              onPress: () => navigation.navigate('MissionDetail' as never, { missionId } as never),
            },
            {
              text: 'Retour aux missions',
              onPress: () => navigation.navigate('Missions' as never),
            },
          ]
        );
      }
    } catch (error) {
      setPaymentStatus('failed');
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement');
    }
  };

  if (!mission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement de la mission...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Paiement Sécurisé</Title>
        <Text style={styles.headerSubtitle}>
          Mission : {mission.title}
        </Text>
      </View>

      <Card style={styles.missionCard}>
        <Card.Content>
          <Title>Détails de la mission</Title>
          <Text style={styles.missionDescription}>{mission.description}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Montant à payer :</Text>
            <Text style={styles.priceAmount}>{mission.finalPrice.toFixed(2)} €</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.paymentCard}>
        <Card.Content>
          <Title>Informations de paiement</Title>
          <Text style={styles.cardSubtitle}>
            Vos informations sont sécurisées par Stripe
          </Text>
          
          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardDetails(cardDetails);
              }}
            />
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityText}>
              🔒 Paiement sécurisé par Stripe
            </Text>
            <Text style={styles.securitySubtext}>
              Vos données de carte ne sont jamais stockées sur nos serveurs
            </Text>
          </View>
        </Card.Content>
      </Card>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handlePayment}
          style={styles.payButton}
          loading={paymentStatus === 'processing' || stripeLoading}
          disabled={paymentStatus === 'processing' || stripeLoading || !cardDetails?.complete}
        >
          {paymentStatus === 'processing' ? 'Traitement...' : `Payer ${mission.finalPrice.toFixed(2)} €`}
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={paymentStatus === 'processing'}
        >
          Annuler
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
 