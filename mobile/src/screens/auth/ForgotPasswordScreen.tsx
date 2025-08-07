import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
});

const ForgotPasswordScreen: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    try {
      // TODO: Implémenter l'appel API pour réinitialiser le mot de passe
      console.log('Demande de réinitialisation pour:', values.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
    }
  };

  if (isSubmitted) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Email envoyé</Title>
            <Text style={styles.message}>
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </Text>
            <Button
              mode="contained"
              onPress={() => {/* Navigation vers LoginScreen */}}
              style={styles.button}
            >
              Retour à la connexion
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Mot de passe oublié</Title>
          <Text style={styles.message}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </Text>
          
          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
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

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                >
                  Envoyer le lien
                </Button>

                <Button
                  mode="text"
                  onPress={() => {/* Navigation vers LoginScreen */}}
                  style={styles.linkButton}
                >
                  Retour à la connexion
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
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
  },
  input: {
    marginBottom: 8,
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

export default ForgotPasswordScreen; 