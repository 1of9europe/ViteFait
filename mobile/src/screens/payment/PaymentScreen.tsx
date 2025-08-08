import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Button, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { 
  createPaymentIntent, 
  confirmPayment,
  selectMissionsLoading,
  selectMissionsError 
} from '@/store/missionSlice';
import { selectCurrentMission } from '@/store/missionSlice';

interface RouteParams {
  missionId: string;
}

const PaymentScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { missionId } = route.params as RouteParams;
  
  const mission = useSelector(selectCurrentMission);
  const isLoading = useSelector(selectMissionsLoading);
  const error = useSelector(selectMissionsError);
  
  const { confirmPayment: stripeConfirmPayment, loading: stripeLoading } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (mission) {
      initializePayment();
    }
  }, [mission]);

  const initializePayment = async () => {
    try {
      setPaymentStatus('processing');
      const result = await dispatch(createPaymentIntent(missionId, mission.finalPrice)).unwrap();
      setPaymentIntent(result);
      setPaymentStatus('idle');
    } catch (error) {
      setPaymentStatus('failed');
      Alert.alert('Erreur', 'Impossible d\'initialiser le paiement');
    }
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete || !paymentIntent) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs de la carte');
      return;
    }

    try {
      setPaymentStatus('processing');
      
      const { error: confirmError } = await stripeConfirmPayment(paymentIntent.client_secret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: `${mission.client.firstName} ${mission.client.lastName}`,
            email: mission.client.email,
          },
        },
      });

      if (confirmError) {
        setPaymentStatus('failed');
        Alert.alert('Erreur de paiement', confirmError.message);
      } else {
        // Confirmer le paiement côté serveur
        await dispatch(confirmPayment(paymentIntent.id)).unwrap();
        setPaymentStatus('success');
        
        Alert.alert(
          'Paiement réussi !',
          'Votre paiement a été traité avec succès.',
          [
            {
              text: 'Voir la mission',
              onPress: () => navigation.navigate('MissionDetail' as never, { missionId } as never),
            },
            {
              text: 'Retour aux missions',
              onPress: () => navigation.navigate('Missions' as never),
            },
          ]
        );
      }
    } catch (error) {
      setPaymentStatus('failed');
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement');
    }
  };

  if (!mission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement de la mission...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Paiement Sécurisé</Title>
        <Text style={styles.headerSubtitle}>
          Mission : {mission.title}
        </Text>
      </View>

      <Card style={styles.missionCard}>
        <Card.Content>
          <Title>Détails de la mission</Title>
          <Text style={styles.missionDescription}>{mission.description}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Montant à payer :</Text>
            <Text style={styles.priceAmount}>{mission.finalPrice.toFixed(2)} €</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.paymentCard}>
        <Card.Content>
          <Title>Informations de paiement</Title>
          <Text style={styles.cardSubtitle}>
            Vos informations sont sécurisées par Stripe
          </Text>
          
          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardDetails(cardDetails);
              }}
            />
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityText}>
              🔒 Paiement sécurisé par Stripe
            </Text>
            <Text style={styles.securitySubtext}>
              Vos données de carte ne sont jamais stockées sur nos serveurs
            </Text>
          </View>
        </Card.Content>
      </Card>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handlePayment}
          style={styles.payButton}
          loading={paymentStatus === 'processing' || stripeLoading}
          disabled={paymentStatus === 'processing' || stripeLoading || !cardDetails?.complete}
        >
          {paymentStatus === 'processing' ? 'Traitement...' : `Payer ${mission.finalPrice.toFixed(2)} €`}
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={paymentStatus === 'processing'}
        >
          Annuler
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
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 5,
  },
  missionCard: {
    margin: 20,
  },
  missionDescription: {
    color: '#666',
    marginVertical: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  paymentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardSubtitle: {
    color: '#666',
    marginBottom: 20,
  },
  cardFieldContainer: {
    marginBottom: 20,
  },
  cardField: {
    height: 50,
  },
  securityInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 5,
  },
  securitySubtext: {
    fontSize: 12,
    color: '#666',
  },
  errorCard: {
    margin: 20,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
  },
  buttonContainer: {
    padding: 20,
  },
  payButton: {
    marginBottom: 10,
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});

export default PaymentScreen;
 