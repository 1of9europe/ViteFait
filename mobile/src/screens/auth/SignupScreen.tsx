import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title, SegmentedButtons } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch } from '@/store';
import { signup } from '@/store/authSlice';
import { SignupData } from '@/types';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Mot de passe trop court').required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe doivent correspondre')
    .required('Confirmation du mot de passe requise'),
  firstName: Yup.string().required('Prénom requis'),
  lastName: Yup.string().required('Nom requis'),
  phone: Yup.string().matches(/^\+?[0-9\s\-\(\)]+$/, 'Numéro de téléphone invalide'),
  role: Yup.string().oneOf(['client', 'assistant'], 'Rôle invalide').required('Rôle requis'),
});

const SignupScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (values: SignupData) => {
    try {
      setIsSubmitting(true);
      await dispatch(signup(values)).unwrap();
      // Navigation automatique vers MainStack si signup réussi
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
            <Title style={styles.title}>Inscription</Title>
            
            <Formik
              initialValues={{
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phone: '',
                role: 'client' as const,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
            >
              {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
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

                  <TextInput
                    label="Confirmer le mot de passe"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry
                    style={styles.input}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}

                  <TextInput
                    label="Prénom"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    style={styles.input}
                    error={touched.firstName && !!errors.firstName}
                  />
                  {touched.firstName && errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}

                  <TextInput
                    label="Nom"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    style={styles.input}
                    error={touched.lastName && !!errors.lastName}
                  />
                  {touched.lastName && errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}

                  <TextInput
                    label="Téléphone (optionnel)"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    keyboardType="phone-pad"
                    style={styles.input}
                    error={touched.phone && !!errors.phone}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}

                  <Text style={styles.label}>Rôle</Text>
                  <SegmentedButtons
                    value={values.role}
                    onValueChange={(value) => setFieldValue('role', value)}
                    buttons={[
                      { value: 'client', label: 'Client' },
                      { value: 'assistant', label: 'Assistant' },
                    ]}
                    style={styles.segmentedButton}
                  />
                  {touched.role && errors.role && (
                    <Text style={styles.errorText}>{errors.role}</Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.button}
                  >
                    S'inscrire
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login' as never)}
                    style={styles.linkButton}
                  >
                    Déjà un compte ? Se connecter
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  segmentedButton: {
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

export default SignupScreen; 