Feature: Gestion des Paiements API

Background:
  * url baseUrl + apiPath
  * def authUtils = read('classpath:tests/karate/utils/auth-utils.js')
  * def missionUtils = read('classpath:tests/karate/utils/mission-utils.js')
  * def clientAuth = authUtils.createUserAndGetToken('CLIENT')
  * def assistantAuth = authUtils.createUserAndGetToken('ASSISTANT')
  * def authToken = clientAuth.token
  * def missionData = missionUtils.generateTestMission()
  * def mission = missionUtils.createMission(missionData)
  * def missionId = mission.id

Scenario: Création d'une intention de paiement
  Given path '/payments/create-intent'
  And header Authorization = 'Bearer ' + authToken
  And request { missionId: missionId, amount: 100, currency: 'eur' }
  When method POST
  Then status 201
  And match response contains { message: '#string', clientSecret: '#string', payment: '#object' }
  And match response.payment contains { status: 'PENDING', amount: 100 }
  And def paymentIntentId = response.payment.stripePaymentIntentId

Scenario: Confirmation d'un paiement
  Given path '/payments/confirm'
  And header Authorization = 'Bearer ' + authToken
  And request { paymentIntentId: paymentIntentId, missionId: missionId }
  When method POST
  Then status 200
  And match response contains { message: '#string', payment: '#object' }
  And match response.payment contains { status: 'COMPLETED' }

Scenario: Récupération des paiements d'une mission
  Given path '/payments/mission/' + missionId
  And header Authorization = 'Bearer ' + authToken
  When method GET
  Then status 200
  And match response contains { payments: '#array', total: '#number' }

Scenario: Annulation d'un paiement
  Given path '/payments/cancel/' + paymentIntentId
  And header Authorization = 'Bearer ' + authToken
  When method POST
  Then status 200
  And match response contains { message: '#string', payment: '#object' }
  And match response.payment contains { status: 'CANCELLED' }

Scenario: Création de paiement pour mission inexistante
  Given path '/payments/create-intent'
  And header Authorization = 'Bearer ' + authToken
  And request { missionId: 'non-existent-id', amount: 100 }
  When method POST
  Then status 404

Scenario: Création de paiement sans authentification
  Given path '/payments/create-intent'
  And request { missionId: missionId, amount: 100 }
  When method POST
  Then status 401

Scenario: Validation des données de paiement
  Given path '/payments/create-intent'
  And header Authorization = 'Bearer ' + authToken
  And request { missionId: missionId, amount: -10 }
  When method POST
  Then status 400
  And match response contains { error: '#string' }

Scenario: Webhook Stripe - Paiement réussi
  Given path '/payments/webhook'
  And header stripe-signature = 'test_signature'
  And def webhookEvent = 
  """
  {
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "status": "succeeded",
        "amount": 10000,
        "currency": "eur",
        "metadata": {
          "paymentId": "test_payment_id",
          "missionId": "test_mission_id"
        }
      }
    }
  }
  """
  And request webhookEvent
  When method POST
  Then status 200
  And match response contains { received: true }

Scenario: Webhook Stripe - Paiement échoué
  Given path '/payments/webhook'
  And header stripe-signature = 'test_signature'
  And def webhookEvent = 
  """
  {
    "type": "payment_intent.payment_failed",
    "data": {
      "object": {
        "id": "pi_test_456",
        "status": "requires_payment_method",
        "last_payment_error": {
          "message": "Your card was declined."
        }
      }
    }
  }
  """
  And request webhookEvent
  When method POST
  Then status 200
  And match response contains { received: true }

Scenario: Double création de paiement pour la même mission
  Given path '/payments/create-intent'
  And header Authorization = 'Bearer ' + authToken
  And request { missionId: missionId, amount: 100 }
  When method POST
  Then status 201
  # Deuxième tentative
  Given path '/payments/create-intent'
  And header Authorization = 'Bearer ' + authToken
  And request { missionId: missionId, amount: 100 }
  When method POST
  Then status 400
  And match response contains { error: '#string' } 