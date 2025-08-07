import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Button, Chip, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { 
  selectCurrentMission, 
  selectMissionsLoading, 
  selectMissionsError,
  fetchMissionById,
  acceptMission,
  updateMissionStatus,
  clearError 
} from '@/store/missionSlice';
import { selectUser, selectUserRole } from '@/store/authSlice';
import { Mission, MissionStatus } from '@/types';

interface RouteParams {
  missionId: string;
}

const MissionDetailScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { missionId } = route.params as RouteParams;
  
  const mission = useSelector(selectCurrentMission);
  const isLoading = useSelector(selectMissionsLoading);
  const error = useSelector(selectMissionsError);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);

  useEffect(() => {
    // Charger la mission si elle n'existe pas ou ne correspond pas à l'ID
    if (!mission || mission.id !== missionId) {
      dispatch(fetchMissionById(missionId));
    }
  }, [dispatch, mission, missionId]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleAcceptMission = () => {
    Alert.alert(
      'Accepter la mission',
      'Êtes-vous sûr de vouloir accepter cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          style: 'default',
          onPress: () => dispatch(acceptMission(missionId)),
        },
      ]
    );
  };

  const handleCancelMission = () => {
    Alert.alert(
      'Annuler la mission',
      'Êtes-vous sûr de vouloir annuler cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: () => dispatch(updateMissionStatus({ id: missionId, status: 'cancelled' as MissionStatus })),
        },
      ]
    );
  };

  const handleUpdateStatus = (newStatus: MissionStatus) => {
    const statusMessages = {
      'in_progress': 'Démarrer la mission',
      'completed': 'Terminer la mission',
    };

    Alert.alert(
      statusMessages[newStatus] || 'Mettre à jour le statut',
      `Êtes-vous sûr de vouloir ${statusMessages[newStatus]?.toLowerCase()} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => dispatch(updateMissionStatus({ id: missionId, status: newStatus })),
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'accepted': return '#2196f3';
      case 'in_progress': return '#9c27b0';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'disputed': return '#ff5722';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'disputed': return 'En litige';
      default: return status;
    }
  };

  const formatPrice = (price: number) => `${price.toFixed(2)} €`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canUserAct = () => {
    if (!mission || !user) return false;
    
    const isClient = mission.client.id === user.id;
    const isAssistant = mission.assistant?.id === user.id;
    
    return isClient || isAssistant;
  };

  const renderActionButtons = () => {
    if (!mission || !canUserAct()) return null;

    const isClient = mission.client.id === user?.id;
    const isAssistant = mission.assistant?.id === user?.id;

    return (
      <Card style={styles.actionCard}>
        <Card.Content>
          <Title>Actions</Title>
          
          {userRole === 'assistant' && mission.status === 'pending' && (
            <Button
              mode="contained"
              onPress={handleAcceptMission}
              style={styles.actionButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Accepter la mission
            </Button>
          )}

          {isClient && mission.status === 'pending' && (
            <Button
              mode="outlined"
              onPress={handleCancelMission}
              style={[styles.actionButton, styles.cancelButton]}
              loading={isLoading}
              disabled={isLoading}
            >
              Annuler la mission
            </Button>
          )}

          {isAssistant && mission.status === 'accepted' && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus('in_progress')}
              style={styles.actionButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Démarrer la mission
            </Button>
          )}

          {isAssistant && mission.status === 'in_progress' && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus('completed')}
              style={styles.actionButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Terminer la mission
            </Button>
          )}

          {mission.status === 'completed' && (
            <View style={styles.completedActions}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Review' as never, { missionId } as never)}
                style={styles.actionButton}
              >
                Laisser un avis
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Chat' as never, { missionId } as never)}
                style={styles.actionButton}
              >
                Voir le chat
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement de la mission...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button mode="contained" onPress={() => dispatch(fetchMissionById(missionId))}>
          Réessayer
        </Button>
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Mission introuvable</Text>
        <Text style={styles.errorMessage}>La mission demandée n'existe pas ou a été supprimée.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Chip
          mode="outlined"
          textStyle={{ color: getStatusColor(mission.status) }}
          style={[styles.statusChip, { borderColor: getStatusColor(mission.status) }]}
        >
          {getStatusText(mission.status)}
        </Chip>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{mission.title}</Title>
          <Text style={styles.description}>{mission.description}</Text>
          
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Prix estimé</Text>
            <Text style={styles.price}>{formatPrice(mission.priceEstimate)}</Text>
            {mission.cashAdvance > 0 && (
              <Text style={styles.advance}>+{formatPrice(mission.cashAdvance)} avance</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Localisation</Title>
          <View style={styles.locationSection}>
            <Text style={styles.locationLabel}>📍 Prise en charge</Text>
            <Text style={styles.locationText}>{mission.pickupAddress}</Text>
            
            {mission.dropAddress && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.locationLabel}>🎯 Livraison</Text>
                <Text style={styles.locationText}>{mission.dropAddress}</Text>
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Détails</Title>
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>⏰ Créneau</Text>
              <Text style={styles.detailValue}>
                {formatDate(mission.timeWindowStart)} - {formatDate(mission.timeWindowEnd)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🚗 Véhicule requis</Text>
              <Text style={styles.detailValue}>
                {mission.requiresCar ? 'Oui' : 'Non'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🔧 Outils requis</Text>
              <Text style={styles.detailValue}>
                {mission.requiresTools ? 'Oui' : 'Non'}
              </Text>
            </View>
            
            {mission.instructions && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📝 Instructions</Text>
                <Text style={styles.detailValue}>{mission.instructions}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Client</Title>
          <View style={styles.userSection}>
            <Avatar.Text 
              size={50} 
              label={`${mission.client.firstName[0]}${mission.client.lastName[0]}`} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {mission.client.firstName} {mission.client.lastName}
              </Text>
              <Text style={styles.userEmail}>{mission.client.email}</Text>
              {mission.client.isVerified && (
                <Text style={styles.verifiedBadge}>✓ Vérifié</Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {mission.assistant && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Assistant</Title>
            <View style={styles.userSection}>
              <Avatar.Text 
                size={50} 
                label={`${mission.assistant.firstName[0]}${mission.assistant.lastName[0]}`} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {mission.assistant.firstName} {mission.assistant.lastName}
                </Text>
                <Text style={styles.userEmail}>{mission.assistant.email}</Text>
                {mission.assistant.isVerified && (
                  <Text style={styles.verifiedBadge}>✓ Vérifié</Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {renderActionButtons()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusChip: {
    marginBottom: 8,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  priceSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  advance: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 4,
  },
  locationSection: {
    marginTop: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  detailsSection: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  actionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  actionButton: {
    marginTop: 8,
  },
  cancelButton: {
    borderColor: '#f44336',
  },
  completedActions: {
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default MissionDetailScreen; 