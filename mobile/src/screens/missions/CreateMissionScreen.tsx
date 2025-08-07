import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title, SegmentedButtons, Chip } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { createMission, selectMissionsLoading, selectMissionsError, clearError } from '@/store/missionSlice';
import { CreateMissionData } from '@/types';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .required('Titre requis'),
  description: Yup.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .required('Description requise'),
  pickupAddress: Yup.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .required('Adresse de prise en charge requise'),
  dropAddress: Yup.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  timeWindowStart: Yup.string()
    .required('Heure de début requise'),
  timeWindowEnd: Yup.string()
    .required('Heure de fin requise'),
  priceEstimate: Yup.number()
    .min(1, 'Le prix doit être supérieur à 0')
    .max(1000, 'Le prix ne peut pas dépasser 1000€')
    .required('Prix estimé requis'),
  cashAdvance: Yup.number()
    .min(0, 'L\'avance ne peut pas être négative')
    .max(500, 'L\'avance ne peut pas dépasser 500€'),
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Priorité invalide')
    .required('Priorité requise'),
  requiresCar: Yup.boolean(),
  requiresTools: Yup.boolean(),
  category: Yup.string()
    .min(2, 'La catégorie doit contenir au moins 2 caractères'),
});

const CreateMissionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isLoading = useSelector(selectMissionsLoading);
  const error = useSelector(selectMissionsError);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    dispatch(clearError());
    getCurrentLocation();
  }, [dispatch]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleCreateMission = async (values: CreateMissionData) => {
    try {
      const missionData = {
        ...values,
        pickupLatitude: currentLocation?.latitude || 0,
        pickupLongitude: currentLocation?.longitude || 0,
      };

      const result = await dispatch(createMission(missionData)).unwrap();
      
      Alert.alert(
        'Mission créée !',
        'Votre mission a été créée avec succès.',
        [
          {
            text: 'Voir les détails',
            onPress: () => navigation.navigate('MissionDetail' as never, { missionId: result.id } as never),
          },
          {
            text: 'Retour aux missions',
            onPress: () => navigation.navigate('Missions' as never),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const categories = [
    'Courses',
    'Livraison',
    'Ménage',
    'Bricolage',
    'Garde d\'enfants',
    'Transport',
    'Autre',
  ];

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Nouvelle Mission</Title>
          
          <Formik
            initialValues={{
              title: '',
              description: '',
              pickupAddress: '',
              dropAddress: '',
              timeWindowStart: '',
              timeWindowEnd: '',
              priceEstimate: 0,
              cashAdvance: 0,
              priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
              requiresCar: false,
              requiresTools: false,
              category: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleCreateMission}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View>
                <TextInput
                  label="Titre de la mission"
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  mode="outlined"
                  style={styles.input}
                  error={touched.title && !!errors.title}
                />
                {touched.title && errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}

                <TextInput
                  label="Description détaillée"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                  error={touched.description && !!errors.description}
                />
                {touched.description && errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}

                <Text style={styles.sectionTitle}>Catégorie</Text>
                <View style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      selected={values.category === category}
                      onPress={() => setFieldValue('category', category)}
                      style={styles.categoryChip}
                    >
                      {category}
                    </Chip>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Priorité</Text>
                <SegmentedButtons
                  value={values.priority}
                  onValueChange={(value) => setFieldValue('priority', value)}
                  buttons={priorities}
                  style={styles.priorityButtons}
                />

                <TextInput
                  label="Adresse de prise en charge"
                  value={values.pickupAddress}
                  onChangeText={handleChange('pickupAddress')}
                  onBlur={handleBlur('pickupAddress')}
                  mode="outlined"
                  style={styles.input}
                  error={touched.pickupAddress && !!errors.pickupAddress}
                />
                {touched.pickupAddress && errors.pickupAddress && (
                  <Text style={styles.errorText}>{errors.pickupAddress}</Text>
                )}

                <TextInput
                  label="Adresse de livraison (optionnel)"
                  value={values.dropAddress}
                  onChangeText={handleChange('dropAddress')}
                  onBlur={handleBlur('dropAddress')}
                  mode="outlined"
                  style={styles.input}
                  error={touched.dropAddress && !!errors.dropAddress}
                />
                {touched.dropAddress && errors.dropAddress && (
                  <Text style={styles.errorText}>{errors.dropAddress}</Text>
                )}

                <View style={styles.timeContainer}>
                  <TextInput
                    label="Heure de début"
                    value={values.timeWindowStart}
                    onChangeText={handleChange('timeWindowStart')}
                    onBlur={handleBlur('timeWindowStart')}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    placeholder="09:00"
                    error={touched.timeWindowStart && !!errors.timeWindowStart}
                  />
                  <TextInput
                    label="Heure de fin"
                    value={values.timeWindowEnd}
                    onChangeText={handleChange('timeWindowEnd')}
                    onBlur={handleBlur('timeWindowEnd')}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    placeholder="17:00"
                    error={touched.timeWindowEnd && !!errors.timeWindowEnd}
                  />
                </View>

                <View style={styles.priceContainer}>
                  <TextInput
                    label="Prix estimé (€)"
                    value={values.priceEstimate.toString()}
                    onChangeText={(text) => setFieldValue('priceEstimate', parseFloat(text) || 0)}
                    onBlur={handleBlur('priceEstimate')}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    keyboardType="numeric"
                    error={touched.priceEstimate && !!errors.priceEstimate}
                  />
                  <TextInput
                    label="Avance (€)"
                    value={values.cashAdvance.toString()}
                    onChangeText={(text) => setFieldValue('cashAdvance', parseFloat(text) || 0)}
                    onBlur={handleBlur('cashAdvance')}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    keyboardType="numeric"
                    error={touched.cashAdvance && !!errors.cashAdvance}
                  />
                </View>

                <View style={styles.requirementsContainer}>
                  <Chip
                    selected={values.requiresCar}
                    onPress={() => setFieldValue('requiresCar', !values.requiresCar)}
                    style={styles.requirementChip}
                  >
                    🚗 Véhicule requis
                  </Chip>
                  <Chip
                    selected={values.requiresTools}
                    onPress={() => setFieldValue('requiresTools', !values.requiresTools)}
                    style={styles.requirementChip}
                  >
                    🔧 Outils requis
                  </Chip>
                </View>

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Créer la mission
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
  },
  input: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    margin: 4,
  },
  priorityButtons: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  requirementsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  requirementChip: {
    margin: 4,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default CreateMissionScreen; 