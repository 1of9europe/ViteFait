import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { authService } from '@/services/authService';
import { missionsService } from '@/services/missionsService';

const HomeScreen: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Test de connexion au backend
      const profile = await authService.getProfile();
      setUser(profile);
      setIsConnected(true);
      
      // Récupérer quelques missions
      const missionsData = await missionsService.getMissions({ limit: 5 });
      setMissions(missionsData.data || []);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setIsConnected(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      const response = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      Alert.alert('Succès', 'Connexion réussie !');
      setUser(response.user);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      Alert.alert('Succès', 'Déconnexion réussie !');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur de déconnexion');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ViteFait Mobile</Text>
        <Text style={styles.subtitle}>Application de Conciergerie Urbaine</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Statut de la connexion :</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>
            {isConnected === null ? 'Vérification...' : isConnected ? 'Connecté' : 'Déconnecté'}
          </Text>
        </View>
      </View>

      {user && (
        <View style={styles.userContainer}>
          <Text style={styles.userTitle}>Utilisateur connecté :</Text>
          <Text style={styles.userInfo}>Nom : {user.firstName} {user.lastName}</Text>
          <Text style={styles.userInfo}>Email : {user.email}</Text>
          <Text style={styles.userInfo}>Rôle : {user.role}</Text>
        </View>
      )}

      {missions.length > 0 && (
        <View style={styles.missionsContainer}>
          <Text style={styles.missionsTitle}>Missions récentes :</Text>
          {missions.map((mission) => (
            <View key={mission.id} style={styles.missionItem}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionStatus}>Statut : {mission.status}</Text>
              <Text style={styles.missionPrice}>Prix : {mission.price}€</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!user ? (
          <TouchableOpacity style={styles.button} onPress={handleTestLogin}>
            <Text style={styles.buttonText}>Test Connexion</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Déconnexion</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.button} onPress={checkConnection}>
          <Text style={styles.buttonText}>Actualiser</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  statusContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusIndicator: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 14,
    marginBottom: 5,
  },
  missionsContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  missionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  missionStatus: {
    fontSize: 12,
    color: '#666',
  },
  missionPrice: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  buttonContainer: {
    margin: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 