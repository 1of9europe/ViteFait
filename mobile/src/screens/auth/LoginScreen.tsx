import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectError, selectIsLoading, clearError } from '@/store/authSlice';
import { LoginCredentials } from '@/types';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Mot de passe requis'),
});

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    // Effacer les erreurs au montage du composant
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async (values: LoginCredentials) => {
    try {
      await dispatch(login(values)).unwrap();
      // La navigation sera automatique grâce au sélecteur isAuthenticated
    } catch (error) {
      // L'erreur est déjà gérée par le store Redux
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Connexion</Title>
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <TextInput
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={touched.email && !!errors.email}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  label="Mot de passe"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry
                  error={touched.password && !!errors.password}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Se connecter
                </Button>
              </View>
            )}
          </Formik>

          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => {/* Navigation vers SignupScreen */}}
              style={styles.linkButton}
            >
              Créer un compte
            </Button>
            <Button
              mode="text"
              onPress={() => {/* Navigation vers ForgotPasswordScreen */}}
              style={styles.linkButton}
            >
              Mot de passe oublié ?
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 24,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkButton: {
    flex: 1,
  },
});

export default LoginScreen; 