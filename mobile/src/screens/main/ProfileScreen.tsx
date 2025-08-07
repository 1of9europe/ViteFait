import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Button, Avatar, List, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectUserRole, logout } from '@/store/authSlice';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
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
        <Text>Erreur: Utilisateur non connecté</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={`${user.firstName[0]}${user.lastName[0]}`} 
          style={styles.avatar}
        />
        <Title style={styles.name}>{user.firstName} {user.lastName}</Title>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>
          {userRole === 'client' ? 'Client' : 'Assistant'}
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Informations personnelles</Title>
            <List.Item
              title="Prénom"
              description={user.firstName}
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <Divider />
            <List.Item
              title="Nom"
              description={user.lastName}
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <Divider />
            <List.Item
              title="Email"
              description={user.email}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
            {user.phone && (
              <>
                <Divider />
                <List.Item
                  title="Téléphone"
                  description={user.phone}
                  left={(props) => <List.Icon {...props} icon="phone" />}
                />
              </>
            )}
            {user.address && (
              <>
                <Divider />
                <List.Item
                  title="Adresse"
                  description={user.address}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Statistiques</Title>
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
                  {user.isVerified ? '✓' : '✗'}
                </Text>
                <Text style={styles.statLabel}>Vérifié</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Actions</Title>
            <Button
              mode="outlined"
              icon="account-edit"
              onPress={() => {/* Navigation vers EditProfileScreen */}}
              style={styles.actionButton}
            >
              Modifier le profil
            </Button>
            <Button
              mode="outlined"
              icon="cog"
              onPress={() => {/* Navigation vers SettingsScreen */}}
              style={styles.actionButton}
            >
              Paramètres
            </Button>
            <Button
              mode="outlined"
              icon="help-circle"
              onPress={() => {/* Navigation vers HelpScreen */}}
              style={styles.actionButton}
            >
              Aide et support
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Compte</Title>
            <Button
              mode="outlined"
              icon="logout"
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
              textColor="#d32f2f"
            >
              Se déconnecter
            </Button>
          </Card.Content>
        </Card>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
});

export default ProfileScreen; 