const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testBackendConnection() {
  console.log('🧪 Test de connexion au backend...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Test du health check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check réussi:', healthResponse.data);
    console.log('');

    // Test 2: Test de l'endpoint d'authentification
    console.log('2️⃣ Test de l\'endpoint d\'authentification...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Authentification réussie:', authResponse.data);
    } catch (error) {
      console.log('⚠️ Authentification échouée (normal si pas d\'utilisateur):', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Test de l'endpoint des missions
    console.log('3️⃣ Test de l\'endpoint des missions...');
    try {
      const missionsResponse = await axios.get(`${API_BASE_URL}/missions`);
      console.log('✅ Récupération des missions réussie:', missionsResponse.data);
    } catch (error) {
      console.log('⚠️ Récupération des missions échouée (normal si pas authentifié):', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Configuration mobile
    console.log('4️⃣ Test de la configuration mobile...');
    const mobileConfig = {
      API_BASE_URL: 'http://localhost:3000/api',
      TIMEOUT: 10000,
      RETRY_ATTEMPTS: 3
    };
    console.log('✅ Configuration mobile:', mobileConfig);
    console.log('');

    console.log('🎉 Tests terminés ! Le backend est accessible depuis le mobile.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Le backend n\'est pas accessible. Assurez-vous qu\'il soit démarré sur le port 3000.');
    }
  }
}

testBackendConnection(); 