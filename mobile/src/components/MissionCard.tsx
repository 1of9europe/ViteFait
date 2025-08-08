import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Chip, Avatar } from 'react-native-paper';
import { Mission, MissionCardProps } from '@/types';

const MissionCard: React.FC<MissionCardProps> = ({ mission, onPress, showActions = false }) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'urgent': return '#d32f2f';
      default: return '#757575';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyenne';
      case 'high': return 'Élevée';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} €`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Title style={styles.title} numberOfLines={2}>
                {mission.title}
              </Title>
              <Text style={styles.description} numberOfLines={2}>
                {mission.description}
              </Text>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.price}>{formatPrice(mission.priceEstimate)}</Text>
              {mission.cashAdvance > 0 && (
                <Text style={styles.advance}>+{formatPrice(mission.cashAdvance)} avance</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>📍 Prise en charge</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {mission.pickupAddress}
              </Text>
              {mission.dropAddress && (
                <>
                  <Text style={styles.locationLabel}>🎯 Livraison</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {mission.dropAddress}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>⏰ Créneau</Text>
            <Text style={styles.timeText}>
              {formatDate(mission.timeWindowStart)} • {formatTime(mission.timeWindowStart)} - {formatTime(mission.timeWindowEnd)}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(mission.status) }}
              style={[styles.chip, { borderColor: getStatusColor(mission.status) }]}
            >
              {getStatusText(mission.status)}
            </Chip>
            <Chip
              mode="outlined"
              textStyle={{ color: getPriorityColor(mission.priority) }}
              style={[styles.chip, { borderColor: getPriorityColor(mission.priority) }]}
            >
              {getPriorityText(mission.priority)}
            </Chip>
            {mission.requiresCar && (
              <Chip mode="outlined" style={styles.chip}>
                🚗 Véhicule
              </Chip>
            )}
            {mission.requiresTools && (
              <Chip mode="outlined" style={styles.chip}>
                🔧 Outils
              </Chip>
            )}
          </View>

          <View style={styles.clientRow}>
            <Avatar.Text 
              size={24} 
              label={`${mission.client.firstName[0]}${mission.client.lastName[0]}`} 
            />
            <Text style={styles.clientText}>
              {mission.client.firstName} {mission.client.lastName}
            </Text>
            {mission.client.isVerified && (
              <Text style={styles.verifiedBadge}>✓ Vérifié</Text>
            )}
          </View>

          {showActions && (
            <View style={styles.actionsRow}>
              <Text style={styles.actionText}>
                Appuyez pour voir les détails
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  advance: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 2,
  },
  infoRow: {
    marginBottom: 8,
  },
  locationInfo: {
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  timeRow: {
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  actionsRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default MissionCard; 