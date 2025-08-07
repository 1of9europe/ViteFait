import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading, loadStoredAuth } from '@/store/authSlice';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import LoadingScreen from '@/screens/LoadingScreen';

const Stack = createStackNavigator();

const Navigation: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    // Charger l'authentification stockée au démarrage
    dispatch(loadStoredAuth());
  }, [dispatch]);

  // Afficher l'écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 