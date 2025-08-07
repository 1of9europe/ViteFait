import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { selectUser, selectUserRole } from '@/store/authSlice';

const HomeScreen: React.FC = () => {
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);

  const getWelcomeMessage = () => {
    if (!user) return 'Bienvenue sur ViteFait';
    
    const time = new Date().getHours();
    let greeting = '';
    
    if (time < 12) greeting = 'Bonjour';
    else if (time < 18) greeting = 'Bon après-midi';
    else greeting = 'Bonsoir';
    
    return `${greeting}, ${user.firstName} !`;
  };

  const getRoleMessage = () => {
    switch (userRole) {
      case 'client':
        return 'Trouvez des assistants pour vos missions quotidiennes';
      case 'assistant':
        return 'Découvrez des missions à proximité';
      default:
        return 'Bienvenue sur ViteFait';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
        <Text style={styles.subtitle}>{getRoleMessage()}</Text>
      </View>

      <View style={styles.content}>
        {userRole === 'client' ? (
          // Interface pour les clients
          <View>
            <Card style={styles.card}>
              <Card.Content>
                <Title>Nouvelle mission</Title>
                <Text>Créez une nouvelle mission pour trouver un assistant</Text>
                <Button mode="contained" style={styles.button}>
                  Créer une mission
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Mes missions</Title>
                <Text>Suivez l'état de vos missions en cours</Text>
                <Button mode="outlined" style={styles.button}>
                  Voir mes missions
                </Button>
              </Card.Content>
            </Card>
          </View>
        ) : (
          // Interface pour les assistants
          <View>
            <Card style={styles.card}>
              <Card.Content>
                <Title>Missions disponibles</Title>
                <Text>Découvrez les missions à proximité</Text>
                <Button mode="contained" style={styles.button}>
                  Voir les missions
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Mes missions</Title>
                <Text>Gérez vos missions acceptées</Text>
                <Button mode="outlined" style={styles.button}>
                  Mes missions
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Title>Profil</Title>
            <View style={styles.profileSection}>
              <Avatar.Text 
                size={50} 
                label={user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'} 
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || 'email@example.com'}
                </Text>
              </View>
            </View>
            <Button mode="outlined" style={styles.button}>
              Modifier le profil
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  button: {
    marginTop: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen; 