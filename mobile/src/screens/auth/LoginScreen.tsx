import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch } from '@/store';
import { login, selectError, selectIsLoading } from '@/store/authSlice';
import { LoginCredentials } from '@/types';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Mot de passe trop court').required('Mot de passe requis'),
});

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values: LoginCredentials) => {
    try {
      setIsSubmitting(true);
      await dispatch(login(values)).unwrap();
      // Navigation automatique vers MainStack si login réussi
    } catch (error) {
      Alert.alert('Erreur', error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
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
                    secureTextEntry
                    style={styles.input}
                    error={touched.password && !!errors.password}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.button}
                  >
                    Se connecter
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Signup' as never)}
                    style={styles.linkButton}
                  >
                    Pas encore de compte ? S'inscrire
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('ForgotPassword' as never)}
                    style={styles.linkButton}
                  >
                    Mot de passe oublié ?
                  </Button>
                </View>
              )}
            </Formik>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 5,
  },
});

export default LoginScreen; 