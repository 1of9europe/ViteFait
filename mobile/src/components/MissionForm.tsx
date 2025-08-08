import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { CreateMissionData } from '../types';

interface MissionFormProps {
  onSubmit: (data: CreateMissionData) => void;
  loading?: boolean;
}

export const MissionForm: React.FC<MissionFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<Partial<CreateMissionData>>({
    title: '',
    description: '',
    pickupAddress: '',
    timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    priceEstimate: 0,
    cashAdvance: 0,
    priority: 'medium',
    requiresCar: false,
    requiresTools: false,
    requiresInitialMeeting: false,
    meetingTimeSlot: undefined
  });

  const [showMeetingTimePicker, setShowMeetingTimePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleInputChange = (field: keyof CreateMissionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMeetingTimeChange = (event: any, selectedDate?: Date) => {
    setShowMeetingTimePicker(false);
    if (selectedDate) {
      handleInputChange('meetingTimeSlot', selectedDate.toISOString());
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      handleInputChange('timeWindowStart', selectedDate.toISOString());
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      handleInputChange('timeWindowEnd', selectedDate.toISOString());
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.pickupAddress) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.requiresInitialMeeting && !formData.meetingTimeSlot) {
      Alert.alert('Erreur', 'Veuillez sélectionner un créneau pour la rencontre initiale');
      return;
    }

    if ((formData.priceEstimate || 0) <= 0) {
      Alert.alert('Erreur', 'L\'estimation de prix doit être supérieure à 0');
      return;
    }

    // Validation des dates
    const startTime = new Date(formData.timeWindowStart!);
    const endTime = new Date(formData.timeWindowEnd!);
    const now = new Date();

    if (startTime <= now) {
      Alert.alert('Erreur', 'La fenêtre de temps doit commencer dans le futur');
      return;
    }

    if (endTime <= startTime) {
      Alert.alert('Erreur', 'La fin de la fenêtre de temps doit être après le début');
      return;
    }

    if (formData.meetingTimeSlot) {
      const meetingTime = new Date(formData.meetingTimeSlot);
      if (meetingTime <= now) {
        Alert.alert('Erreur', 'Le créneau de rencontre doit être dans le futur');
        return;
      }
    }

    onSubmit(formData as CreateMissionData);
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer une nouvelle mission</Text>

      {/* Titre */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => handleInputChange('title', text)}
          placeholder="Titre de la mission"
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Description détaillée de la mission"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Adresse de récupération */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Adresse de récupération *</Text>
        <TextInput
          style={styles.input}
          value={formData.pickupAddress}
          onChangeText={(text) => handleInputChange('pickupAddress', text)}
          placeholder="Adresse de récupération"
        />
      </View>

      {/* Fenêtre de temps */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Début de la fenêtre de temps *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.timeWindowStart ? formatDateTime(formData.timeWindowStart) : 'Sélectionner'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fin de la fenêtre de temps *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.timeWindowEnd ? formatDateTime(formData.timeWindowEnd) : 'Sélectionner'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estimation de prix */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Estimation de prix (€) *</Text>
        <TextInput
          style={styles.input}
          value={formData.priceEstimate?.toString()}
          onChangeText={(text) => handleInputChange('priceEstimate', parseFloat(text) || 0)}
          placeholder="0"
          keyboardType="numeric"
        />
      </View>

      {/* Avance en espèces */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avance en espèces (€)</Text>
        <TextInput
          style={styles.input}
          value={formData.cashAdvance?.toString()}
          onChangeText={(text) => handleInputChange('cashAdvance', parseFloat(text) || 0)}
          placeholder="0"
          keyboardType="numeric"
        />
      </View>

      {/* Rencontre initiale */}
      <View style={styles.switchGroup}>
        <Text style={styles.label}>Rencontre initiale requise</Text>
        <Switch
          value={formData.requiresInitialMeeting}
          onValueChange={(value) => {
            handleInputChange('requiresInitialMeeting', value);
            if (!value) {
              handleInputChange('meetingTimeSlot', undefined);
            }
          }}
        />
      </View>

      {/* Créneau de rencontre */}
      {formData.requiresInitialMeeting && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Créneau de rencontre *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowMeetingTimePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.meetingTimeSlot ? formatDateTime(formData.meetingTimeSlot) : 'Sélectionner'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Options */}
      <View style={styles.switchGroup}>
        <Text style={styles.label}>Nécessite une voiture</Text>
        <Switch
          value={formData.requiresCar}
          onValueChange={(value) => handleInputChange('requiresCar', value)}
        />
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Nécessite des outils</Text>
        <Switch
          value={formData.requiresTools}
          onValueChange={(value) => handleInputChange('requiresTools', value)}
        />
      </View>

      {/* Instructions */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instructions (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.instructions}
          onChangeText={(text) => handleInputChange('instructions', text)}
          placeholder="Instructions spéciales"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Bouton de soumission */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Création en cours...' : 'Créer la mission'}
        </Text>
      </TouchableOpacity>

      {/* Note sur les DatePickers */}
      <Text style={styles.note}>
        Note: Les sélecteurs de date/heure nécessitent l'installation de @react-native-community/datetimepicker
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
}); 