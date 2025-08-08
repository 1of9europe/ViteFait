import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Mission } from '../types';

interface MissionDetailProps {
  mission: Mission;
  onAccept?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  isAssistant?: boolean;
  isClient?: boolean;
}

export const MissionDetail: React.FC<MissionDetailProps> = ({
  mission,
  onAccept,
  onStart,
  onComplete,
  onCancel,
  isAssistant = false,
  isClient = false
}) => {
  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} €`;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: '#FFA500',
      accepted: '#007AFF',
      in_progress: '#FF6B35',
      completed: '#28A745',
      cancelled: '#DC3545',
      disputed: '#FFC107'
    };
    return statusColors[status as keyof typeof statusColors] || '#666';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'En attente',
      accepted: 'Acceptée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
      disputed: 'En litige'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityTexts = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgente'
    };
    return priorityTexts[priority as keyof typeof priorityTexts] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      low: '#28A745',
      medium: '#FFA500',
      high: '#FF6B35',
      urgent: '#DC3545'
    };
    return priorityColors[priority as keyof typeof priorityColors] || '#666';
  };

  const handleAction = (action: () => void | undefined, actionName: string) => {
    if (action) {
      Alert.alert(
        `Confirmer ${actionName}`,
        `Êtes-vous sûr de vouloir ${actionName.toLowerCase()} cette mission ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Confirmer', onPress: action }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>{mission.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mission.status) }]}>
          <Text style={styles.statusText}>{getStatusText(mission.status)}</Text>
        </View>
      </View>

      {/* Priorité */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Priorité</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(mission.priority) }]}>
            <Text style={styles.priorityText}>{getPriorityText(mission.priority)}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{mission.description}</Text>
      </View>

      {/* Rencontre initiale */}
      {mission.requiresInitialMeeting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rencontre initiale</Text>
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingLabel}>Créneau de rencontre :</Text>
            <Text style={styles.meetingTime}>
              {mission.meetingTimeSlot ? formatDateTime(mission.meetingTimeSlot) : 'Non défini'}
            </Text>
          </View>
          <Text style={styles.meetingNote}>
            ⚠️ Cette mission nécessite une rencontre préalable avec l'assistant
          </Text>
        </View>
      )}

      {/* Localisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Point de récupération :</Text>
          <Text style={styles.locationAddress}>{mission.pickupAddress}</Text>
        </View>
        {mission.dropAddress && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Point de livraison :</Text>
            <Text style={styles.locationAddress}>{mission.dropAddress}</Text>
          </View>
        )}
      </View>

      {/* Fenêtre de temps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fenêtre de temps</Text>
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Début :</Text>
          <Text style={styles.timeValue}>{formatDateTime(mission.timeWindowStart)}</Text>
        </View>
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Fin :</Text>
          <Text style={styles.timeValue}>{formatDateTime(mission.timeWindowEnd)}</Text>
        </View>
      </View>

      {/* Prix */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prix</Text>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Estimation :</Text>
          <Text style={styles.priceValue}>{formatPrice(mission.priceEstimate)}</Text>
        </View>
        {mission.cashAdvance > 0 && (
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Avance en espèces :</Text>
            <Text style={styles.priceValue}>{formatPrice(mission.cashAdvance)}</Text>
          </View>
        )}
        {mission.finalPrice > 0 && (
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Prix final :</Text>
            <Text style={[styles.priceValue, styles.finalPrice]}>{formatPrice(mission.finalPrice)}</Text>
          </View>
        )}
      </View>

      {/* Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Options</Text>
        <View style={styles.optionsList}>
          {mission.requiresCar && (
            <View style={styles.optionItem}>
              <Text style={styles.optionText}>🚗 Nécessite une voiture</Text>
            </View>
          )}
          {mission.requiresTools && (
            <View style={styles.optionItem}>
              <Text style={styles.optionText}>🔧 Nécessite des outils</Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      {mission.instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{mission.instructions}</Text>
        </View>
      )}

      {/* Exigences */}
      {mission.requirements && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exigences</Text>
          <Text style={styles.requirements}>{mission.requirements}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {isAssistant && mission.status === 'pending' && onAccept && (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAction(onAccept, 'Accepter')}
          >
            <Text style={styles.actionButtonText}>Accepter la mission</Text>
          </TouchableOpacity>
        )}

        {isAssistant && mission.status === 'accepted' && onStart && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleAction(onStart, 'Démarrer')}
          >
            <Text style={styles.actionButtonText}>Démarrer la mission</Text>
          </TouchableOpacity>
        )}

        {isAssistant && mission.status === 'in_progress' && onComplete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleAction(onComplete, 'Terminer')}
          >
            <Text style={styles.actionButtonText}>Terminer la mission</Text>
          </TouchableOpacity>
        )}

        {(isAssistant || isClient) && ['pending', 'accepted', 'in_progress'].includes(mission.status) && onCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleAction(onCancel, 'Annuler')}
          >
            <Text style={styles.actionButtonText}>Annuler la mission</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  meetingInfo: {
    marginBottom: 8,
  },
  meetingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  meetingNote: {
    fontSize: 14,
    color: '#FF6B35',
    fontStyle: 'italic',
    marginTop: 8,
  },
  locationInfo: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: '#333',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  finalPrice: {
    color: '#28A745',
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  requirements: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#28A745',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#28A745',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 