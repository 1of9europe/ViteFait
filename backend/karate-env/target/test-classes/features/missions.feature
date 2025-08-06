Feature: Gestion des Missions API

Background:
  * url baseUrl + apiPath
  * def authUtils = read('classpath:tests/karate/utils/auth-utils.js')
  * def missionUtils = read('classpath:tests/karate/utils/mission-utils.js')
  * def clientAuth = authUtils.createUserAndGetToken('CLIENT')
  * def assistantAuth = authUtils.createUserAndGetToken('ASSISTANT')
  * def authToken = clientAuth.token

Scenario: Création d'une nouvelle mission
  Given path '/missions'
  And header Authorization = 'Bearer ' + authToken
  And def missionData = missionUtils.generateTestMission()
  And request missionData
  When method POST
  Then status 201
  And match response contains { message: '#string', mission: '#object' }
  And match response.mission contains { title: missionData.title, status: 'PENDING' }
  And def missionId = response.mission.id

Scenario: Récupération d'une mission par ID
  Given path '/missions/' + missionId
  And header Authorization = 'Bearer ' + authToken
  When method GET
  Then status 200
  And match response contains { mission: '#object' }
  And match response.mission contains { id: missionId }

Scenario: Récupération d'une mission inexistante
  Given path '/missions/non-existent-id'
  And header Authorization = 'Bearer ' + authToken
  When method GET
  Then status 404

Scenario: Liste des missions disponibles
  Given path '/missions'
  And header Authorization = 'Bearer ' + assistantAuth.token
  And param status = 'PENDING'
  And param category = 'TEST'
  When method GET
  Then status 200
  And match response contains { missions: '#array' }

Scenario: Acceptation d'une mission
  Given path '/missions/' + missionId + '/accept'
  And header Authorization = 'Bearer ' + assistantAuth.token
  When method POST
  Then status 200
  And match response contains { message: '#string', mission: '#object' }
  And match response.mission contains { status: 'ASSIGNED', assistantId: assistantAuth.userId }

Scenario: Mise à jour du statut d'une mission
  Given path '/missions/' + missionId + '/status'
  And header Authorization = 'Bearer ' + assistantAuth.token
  And request { status: 'IN_PROGRESS', comment: 'Début du travail' }
  When method PATCH
  Then status 200
  And match response contains { message: '#string', mission: '#object' }
  And match response.mission contains { status: 'IN_PROGRESS' }

Scenario: Finalisation d'une mission
  Given path '/missions/' + missionId + '/status'
  And header Authorization = 'Bearer ' + assistantAuth.token
  And request { status: 'COMPLETED', comment: 'Mission terminée avec succès' }
  When method PATCH
  Then status 200
  And match response contains { message: '#string', mission: '#object' }
  And match response.mission contains { status: 'COMPLETED' }

Scenario: Création de mission sans authentification
  Given path '/missions'
  And def missionData = missionUtils.generateTestMission()
  And request missionData
  When method POST
  Then status 401

Scenario: Validation des données de mission
  Given path '/missions'
  And header Authorization = 'Bearer ' + authToken
  And request { title: '', description: '', budget: -10 }
  When method POST
  Then status 400
  And match response contains { error: '#string' }

Scenario: Recherche de missions par géolocalisation
  Given path '/missions/search'
  And header Authorization = 'Bearer ' + assistantAuth.token
  And param latitude = 48.8566
  And param longitude = 2.3522
  And param radius = 5000
  When method GET
  Then status 200
  And match response contains { missions: '#array' }

Scenario: Historique des statuts d'une mission
  Given path '/missions/' + missionId + '/status-history'
  And header Authorization = 'Bearer ' + authToken
  When method GET
  Then status 200
  And match response contains { history: '#array' }
  And match response.history[*] contains { status: '#string', createdAt: '#string' }

# Nettoyage après les tests
Scenario: Nettoyage des données de test
  Given path '/cleanup'
  And header Authorization = 'Bearer ' + authToken
  When method DELETE
  Then status 200 