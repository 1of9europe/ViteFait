function fn() {
  var utils = {};

  // Générer une mission de test
  utils.generateTestMission = function() {
    return {
      title: 'Mission de test Karate',
      description: 'Description de test pour les tests end-to-end',
      category: 'TEST',
      latitude: 48.8566,
      longitude: 2.3522,
      address: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      budget: 100,
      deadline: new Date(Date.now() + 86400000).toISOString(), // +1 jour
      priority: 'NORMAL'
    };
  };

  // Créer une mission
  utils.createMission = function(missionData) {
    var response = karate.http('POST', baseUrl + apiPath + '/missions')
      .header('Authorization', 'Bearer ' + authToken)
      .header('Content-Type', 'application/json')
      .body(missionData)
      .send();
    
    if (response.status !== 201) {
      karate.fail('Échec de la création de mission: ' + response.body);
    }
    
    return response.body.mission;
  };

  // Accepter une mission
  utils.acceptMission = function(missionId) {
    var response = karate.http('POST', baseUrl + apiPath + '/missions/' + missionId + '/accept')
      .header('Authorization', 'Bearer ' + authToken)
      .send();
    
    if (response.status !== 200) {
      karate.fail('Échec de l\'acceptation de mission: ' + response.body);
    }
    
    return response.body.mission;
  };

  // Mettre à jour le statut d'une mission
  utils.updateMissionStatus = function(missionId, status, comment) {
    var response = karate.http('PATCH', baseUrl + apiPath + '/missions/' + missionId + '/status')
      .header('Authorization', 'Bearer ' + authToken)
      .header('Content-Type', 'application/json')
      .body({
        status: status,
        comment: comment || 'Mise à jour via tests Karate'
      })
      .send();
    
    if (response.status !== 200) {
      karate.fail('Échec de la mise à jour du statut: ' + response.body);
    }
    
    return response.body.mission;
  };

  return utils;
} 