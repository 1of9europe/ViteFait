import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, FAB, Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { 
  selectMissions, 
  selectMissionsLoading, 
  selectMissionsError,
  selectUserMissions,
  fetchMissions,
  clearError 
} from '@/store/missionSlice';
import { selectUserRole } from '@/store/authSlice';
import MissionCard from '@/components/MissionCard';
import { Mission } from '@/types';

const MissionsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const missions = useSelector(selectMissions);
  const userMissions = useSelector(selectUserMissions);
  const isLoading = useSelector(selectMissionsLoading);
  const error = useSelector(selectMissionsError);
  const userRole = useSelector(selectUserRole);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Charger les missions au montage du composant
    dispatch(fetchMissions());
  }, [dispatch]);

  useEffect(() => {
    // Effacer les erreurs au montage
    dispatch(clearError());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMissions()).unwrap();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleMissionPress = (mission: Mission) => {
    navigation.navigate('MissionDetail' as never, { missionId: mission.id } as never);
  };

  const handleCreateMission = () => {
    navigation.navigate('CreateMission' as never);
  };

  const filteredMissions = React.useMemo(() => {
    let filtered = userRole === 'client' ? userMissions : missions;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [missions, userMissions, userRole, searchQuery]);

  const renderMissionItem = ({ item }: { item: Mission }) => (
    <MissionCard
      mission={item}
      onPress={() => handleMissionPress(item)}
      showActions={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {userRole === 'client' ? 'Aucune mission créée' : 'Aucune mission disponible'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {userRole === 'client' 
          ? 'Créez votre première mission pour trouver un assistant'
          : 'Aucune mission ne correspond à vos critères pour le moment'
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorTitle}>Erreur de chargement</Text>
      <Text style={styles.errorMessage}>{error}</Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement des missions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {userRole === 'client' ? 'Mes Missions' : 'Missions Disponibles'}
        </Text>
        <Searchbar
          placeholder="Rechercher une mission..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {error && !isLoading ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredMissions}
          renderItem={renderMissionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {userRole === 'client' && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateMission}
          label="Nouvelle mission"
        />
      )}
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Espace pour le FAB
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MissionsScreen; 