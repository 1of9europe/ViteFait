// Générer un utilisateur de test
function generateTestUser(role) {
  var timestamp = new Date().getTime();
  return {
    email: 'test-' + timestamp + '@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+33123456789',
    role: role || 'CLIENT',
    latitude: 48.8566,
    longitude: 2.3522,
    address: '123 Test Street',
    city: 'Paris',
    postalCode: '75001'
  };
}

// Créer un utilisateur et récupérer le token
function createUserAndGetToken(role) {
  var user = generateTestUser(role);
  
  // Inscription
  var signupResponse = karate.http('POST', baseUrl + apiPath + '/auth/signup')
    .header('Content-Type', 'application/json')
    .body(user)
    .send();
  
  if (signupResponse.status !== 201) {
    karate.fail('Échec de l\'inscription: ' + signupResponse.body);
  }
  
  // Connexion
  var loginResponse = karate.http('POST', baseUrl + apiPath + '/auth/login')
    .header('Content-Type', 'application/json')
    .body({
      email: user.email,
      password: user.password
    })
    .send();
  
  if (loginResponse.status !== 200) {
    karate.fail('Échec de la connexion: ' + loginResponse.body);
  }
  
  return {
    user: user,
    token: loginResponse.body.token,
    userId: loginResponse.body.user.id
  };
}

// Nettoyer les données de test
function cleanupTestData(userId) {
  if (userId) {
    // Supprimer l'utilisateur de test
    karate.http('DELETE', baseUrl + apiPath + '/users/' + userId)
      .header('Authorization', 'Bearer ' + authToken)
      .send();
  }
} 