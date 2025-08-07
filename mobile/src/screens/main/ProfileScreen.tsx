import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Button, Avatar, List } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '@/store';
import { logout, selectUser } from '@/store/authSlice';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Utilisateur non connecté</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={`${user.firstName[0]}${user.lastName[0]}`} />
        <Title style={styles.name}>{`${user.firstName} ${user.lastName}`}</Title>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role === 'client' ? 'Client' : 'Assistant'}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Informations personnelles</Title>
          <List.Item
            title="Téléphone"
            description={user.phone || 'Non renseigné'}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
          <List.Item
            title="Adresse"
            description={user.address || 'Non renseignée'}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
          />
          <List.Item
            title="Ville"
            description={user.city || 'Non renseignée'}
            left={(props) => <List.Icon {...props} icon="city" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Statistiques</Title>
          <List.Item
            title="Note moyenne"
            description={`${user.rating.toFixed(1)}/5 (${user.reviewCount} avis)`}
            left={(props) => <List.Icon {...props} icon="star" />}
          />
          <List.Item
            title="Statut"
            description={user.status === 'active' ? 'Actif' : 'Inactif'}
            left={(props) => <List.Icon {...props} icon="check-circle" />}
          />
          <List.Item
            title="Membre depuis"
            description={new Date(user.createdAt).toLocaleDateString('fr-FR')}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Actions</Title>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditProfile' as never)}
            style={styles.actionButton}
            icon="account-edit"
          >
            Modifier le profil
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Settings' as never)}
            style={styles.actionButton}
            icon="cog"
          >
            Paramètres
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Help' as never)}
            style={styles.actionButton}
            icon="help-circle"
          >
            Aide et support
          </Button>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
            icon="logout"
            buttonColor="#FF3B30"
          >
            Se déconnecter
          </Button>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  name: {
    marginTop: 10,
    fontSize: 24,
  },
  email: {
    color: '#666',
    marginTop: 5,
  },
  role: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  actionButton: {
    marginVertical: 5,
  },
  logoutButton: {
    marginTop: 10,
  },
});

export default ProfileScreen; 