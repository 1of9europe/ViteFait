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