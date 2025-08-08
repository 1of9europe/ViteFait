import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Title, SegmentedButtons } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectError, selectIsLoading, clearError } from '@/store/authSlice';
import { SignupData } from '@/types';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Prénom requis'),
  lastName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Nom requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe doivent être identiques')
    .required('Confirmation du mot de passe requise'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Numéro de téléphone invalide'),
  role: Yup.string()
    .oneOf(['client', 'assistant'], 'Rôle invalide')
    .required('Rôle requis'),
});

const SignupScreen: React.FC = () => {
  const dispatch = useDispatch();
  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSignup = async (values: SignupData) => {
    try {
      await dispatch(signup(values)).unwrap();
      // La navigation sera automatique grâce au sélecteur isAuthenticated
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Créer un compte</Title>
          
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: '',
              role: 'client' as const,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSignup}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
              <View>
                <View style={styles.row}>
                  <TextInput
                    label="Prénom"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    error={touched.firstName && !!errors.firstName}
                  />
                  <TextInput
                    label="Nom"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    error={touched.lastName && !!errors.lastName}
                  />
                </View>
                {touched.firstName && errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
                {touched.lastName && errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}

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

                <TextInput
                  label="Confirmer le mot de passe"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry
                  error={touched.confirmPassword && !!errors.confirmPassword}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                <TextInput
                  label="Téléphone (optionnel)"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  error={touched.phone && !!errors.phone}
                />
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <Text style={styles.label}>Type de compte</Text>
                <SegmentedButtons
                  value={values.role}
                  onValueChange={(value) => setFieldValue('role', value)}
                  buttons={[
                    { value: 'client', label: 'Client' },
                    { value: 'assistant', label: 'Assistant' },
                  ]}
                  style={styles.segmentedButtons}
                />

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
                  Créer le compte
                </Button>

                <Button
                  mode="text"
                  onPress={() => {/* Navigation vers LoginScreen */}}
                  style={styles.linkButton}
                >
                  Déjà un compte ? Se connecter
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    marginTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  linkButton: {
    marginTop: 8,
  },
});

export default SignupScreen; 