import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title, Avatar, Switch } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { updateProfile, selectUser, selectIsLoading, selectError, clearError } from '@/store/authSlice';
import { User } from '@/types';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Prénom requis'),
  lastName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Nom requis'),
  phone: Yup.string()
    .matches(/^[0-9+\s-]+$/, 'Numéro de téléphone invalide'),
  address: Yup.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: Yup.string()
    .min(2, 'La ville doit contenir au moins 2 caractères'),
  postalCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Code postal invalide'),
  bio: Yup.string()
    .max(200, 'La bio ne peut pas dépasser 200 caractères'),
});

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleUpdateProfile = async (values: Partial<User>) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            // La déconnexion sera gérée par le composant parent
            navigation.navigate('Login' as never);
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={`${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`} 
        />
        <Title style={styles.name}>
          {user.firstName} {user.lastName}
        </Title>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>
          {user.role === 'client' ? 'Client' : 'Assistant'}
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.reviewCount}</Text>
              <Text style={styles.statLabel}>Avis</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.isVerified ? '✅' : '⏳'}
              </Text>
              <Text style={styles.statLabel}>Statut</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.formCard}>
        <Card.Content>
          <View style={styles.formHeader}>
            <Title>Informations personnelles</Title>
            <Button
              mode="text"
              onPress={() => setIsEditing(!isEditing)}
              icon={isEditing ? 'close' : 'pencil'}
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </View>

          {isEditing ? (
            <Formik
              initialValues={{
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                postalCode: user.postalCode || '',
                bio: user.bio || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdateProfile}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <TextInput
                    label="Prénom"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    mode="outlined"
                    style={styles.input}
                    error={touched.firstName && !!errors.firstName}
                  />
                  {touched.firstName && errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}

                  <TextInput
                    label="Nom"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    mode="outlined"
                    style={styles.input}
                    error={touched.lastName && !!errors.lastName}
                  />
                  {touched.lastName && errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}

                  <TextInput
                    label="Téléphone"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                    error={touched.phone && !!errors.phone}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}

                  <TextInput
                    label="Adresse"
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    error={touched.address && !!errors.address}
                  />
                  {touched.address && errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}

                  <View style={styles.row}>
                    <TextInput
                      label="Ville"
                      value={values.city}
                      onChangeText={handleChange('city')}
                      onBlur={handleBlur('city')}
                      mode="outlined"
                      style={[styles.input, styles.halfInput]}
                      error={touched.city && !!errors.city}
                    />
                    <TextInput
                      label="Code postal"
                      value={values.postalCode}
                      onChangeText={handleChange('postalCode')}
                      onBlur={handleBlur('postalCode')}
                      mode="outlined"
                      style={[styles.input, styles.halfInput]}
                      keyboardType="numeric"
                      error={touched.postalCode && !!errors.postalCode}
                    />
                  </View>

                  <TextInput
                    label="Bio"
                    value={values.bio}
                    onChangeText={handleChange('bio')}
                    onBlur={handleBlur('bio')}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    error={touched.bio && !!errors.bio}
                  />
                  {touched.bio && errors.bio && (
                    <Text style={styles.errorText}>{errors.bio}</Text>
                  )}

                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.saveButton}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Sauvegarder
                  </Button>
                </View>
              )}
            </Formik>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Prénom :</Text>
                <Text style={styles.infoValue}>{user.firstName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom :</Text>
                <Text style={styles.infoValue}>{user.lastName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone :</Text>
                <Text style={styles.infoValue}>{user.phone || 'Non renseigné'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse :</Text>
                <Text style={styles.infoValue}>{user.address || 'Non renseignée'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ville :</Text>
                <Text style={styles.infoValue}>{user.city || 'Non renseignée'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Code postal :</Text>
                <Text style={styles.infoValue}>{user.postalCode || 'Non renseigné'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bio :</Text>
                <Text style={styles.infoValue}>{user.bio || 'Aucune bio'}</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title>Paramètres</Title>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications push</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Localisation</Text>
            <Switch value={true} />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#d32f2f"
        >
          Se déconnecter
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
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    marginTop: 15,
    fontSize: 24,
  },
  email: {
    marginTop: 5,
    color: '#666',
    fontSize: 16,
  },
  role: {
    marginTop: 5,
    color: '#2196f3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsCard: {
    margin: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    marginTop: 5,
    color: '#666',
    fontSize: 14,
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  infoContainer: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
});

export default ProfileScreen; 