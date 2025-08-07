import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store } from '@/store';
import Navigation from '@/navigation';
import { config } from '@/config/environment';

const App: React.FC = () => {
  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <StripeProvider publishableKey={config.STRIPE_PUBLISHABLE_KEY}>
          <Navigation />
        </StripeProvider>
      </PaperProvider>
    </StoreProvider>
  );
};

export default App; 