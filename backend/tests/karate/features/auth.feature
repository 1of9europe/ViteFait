Feature: Authentification API

Background:
  * url baseUrl + apiPath
  * def authUtils = read('classpath:tests/karate/utils/auth-utils.js')

Scenario: Inscription d'un nouveau client
  Given path '/auth/signup'
  And def userData = authUtils.generateTestUser('CLIENT')
  And request userData
  When method POST
  Then status 201
  And match response contains { message: '#string' }
  And match response.user contains { email: '#string', role: 'CLIENT' }
  And def userId = response.user.id

Scenario: Inscription d'un nouvel assistant
  Given path '/auth/signup'
  And def userData = authUtils.generateTestUser('ASSISTANT')
  And request userData
  When method POST
  Then status 201
  And match response contains { message: '#string' }
  And match response.user contains { email: '#string', role: 'ASSISTANT' }

Scenario: Connexion avec des identifiants valides
  Given path '/auth/login'
  And def userData = authUtils.generateTestUser('CLIENT')
  # Créer l'utilisateur d'abord
  And def signupResponse = call read('classpath:tests/karate/features/auth-signup.feature@signup') { userData: userData }
  And request { email: userData.email, password: userData.password }
  When method POST
  Then status 200
  And match response contains { token: '#string', user: '#object' }
  And match response.user contains { email: userData.email }

Scenario: Connexion avec des identifiants invalides
  Given path '/auth/login'
  And request { email: 'invalid@example.com', password: 'wrongpassword' }
  When method POST
  Then status 401
  And match response contains { error: '#string' }

Scenario: Récupération du profil utilisateur
  Given path '/auth/me'
  And header Authorization = 'Bearer ' + authToken
  When method GET
  Then status 200
  And match response contains { user: '#object' }

Scenario: Récupération du profil sans token
  Given path '/auth/me'
  When method GET
  Then status 401

Scenario: Validation des données d'inscription
  Given path '/auth/signup'
  And request { email: 'invalid-email', password: '123' }
  When method POST
  Then status 400
  And match response contains { error: '#string' }

Scenario: Inscription avec email déjà existant
  Given path '/auth/signup'
  And def userData = authUtils.generateTestUser('CLIENT')
  # Première inscription
  And def firstSignup = call read('classpath:tests/karate/features/auth-signup.feature@signup') { userData: userData }
  # Deuxième inscription avec le même email
  And request userData
  When method POST
  Then status 409
  And match response contains { error: '#string' }

@signup
Scenario: Inscription utilitaire
  Given path '/auth/signup'
  And request userData
  When method POST
  Then status 201 