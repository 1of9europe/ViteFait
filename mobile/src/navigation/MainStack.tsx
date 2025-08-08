import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import MissionDetailScreen from '@/screens/missions/MissionDetailScreen';
import CreateMissionScreen from '@/screens/missions/CreateMissionScreen';
import ChatScreen from '@/screens/chat/ChatScreen';
import PaymentScreen from '@/screens/payment/PaymentScreen';
import ReviewScreen from '@/screens/review/ReviewScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import { RootStackParamList } from '@/types';

const Stack = createStackNavigator<RootStackParamList>();

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="MissionDetail" 
        component={MissionDetailScreen}
        options={{
          headerShown: true,
          title: 'Détails de la mission',
        }}
      />
      <Stack.Screen 
        name="CreateMission" 
        component={CreateMissionScreen}
        options={{
          headerShown: true,
          title: 'Nouvelle mission',
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          headerShown: true,
          title: 'Chat',
        }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          headerShown: true,
          title: 'Paiement',
        }}
      />
      <Stack.Screen 
        name="Review" 
        component={ReviewScreen}
        options={{
          headerShown: true,
          title: 'Avis',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profil',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainStack; 