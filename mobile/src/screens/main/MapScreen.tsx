import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';

const MapScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Carte</Title>
          <Text>Carte interactive à venir...</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 2,
  },
});

export default MapScreen; 