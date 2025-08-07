Feature: Inscription utilisateur - Utilitaires

Background:
  * url baseUrl + apiPath

@signup
Scenario: Inscription utilitaire
  Given path '/auth/signup'
  And request userData
  When method POST
  Then status 201
  And match response contains { message: '#string', user: '#object', token: '#string', refreshToken: '#string' } 