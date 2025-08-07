Feature: Tests d'authentification simplifiés

Background:
  * url baseUrl

Scenario: Test de santé de l'API
  Given path '/health'
  When method GET
  Then status 200
  And match response contains { status: 'OK' }

Scenario: Inscription d'un nouveau client
  Given path '/api/auth/signup'
  And request 
  """
  {
    "email": "test-client@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "Client",
    "phone": "+33123456789",
    "role": "CLIENT"
  }
  """
  When method POST
  Then status 201
  And match response contains { message: '#string' }
  And match response.user contains { email: 'test-client@example.com', role: 'CLIENT' }

Scenario: Connexion avec des identifiants valides
  Given path '/api/auth/login'
  And request 
  """
  {
    "email": "test-client@example.com",
    "password": "TestPassword123!"
  }
  """
  When method POST
  Then status 200
  And match response contains { token: '#string', user: '#object' }
  And match response.user contains { email: 'test-client@example.com' }

Scenario: Connexion avec des identifiants invalides
  Given path '/api/auth/login'
  And request 
  """
  {
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }
  """
  When method POST
  Then status 401
  And match response contains { error: '#string' }

Scenario: Récupération du profil sans token
  Given path '/api/auth/me'
  When method GET
  Then status 401 