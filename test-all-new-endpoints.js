const http = require('http');

const endpoints = [
  // Health check
  { path: '/api/health', method: 'GET', description: 'Health check' },
  
  // Attractions
  { path: '/api/attractions', method: 'GET', description: 'Get all attractions' },
  { path: '/api/attractions/search?q=abidjan', method: 'GET', description: 'Search attractions' },
  
  // Audio Guides
  { path: '/api/audio-guides', method: 'GET', description: 'Get all audio guides' },
  
  // Tours
  { path: '/api/tours', method: 'GET', description: 'Get all tours' },
  { path: '/api/tours/search?q=culture', method: 'GET', description: 'Search tours' },
  { path: '/api/tours/featured', method: 'GET', description: 'Get featured tours' },
  
  // General
  { path: '/api/search?q=museum', method: 'GET', description: 'Global search' },
  { path: '/api/categories', method: 'GET', description: 'Get categories' },
  { path: '/api/cities', method: 'GET', description: 'Get cities' },
  { path: '/api/regions', method: 'GET', description: 'Get regions' },
  { path: '/api/recommendations', method: 'GET', description: 'Get recommendations' },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          path: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          status: res.statusCode,
          data: data.substring(0, 150) + (data.length > 150 ? '...' : '')
        });
      });
    });

    req.on('error', (e) => {
      reject({
        path: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        error: e.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        path: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        error: 'Timeout'
      });
    });

    req.setTimeout(5000);
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🧪 Test complet des endpoints - API Côte d\'Ivoire Audio Guide\n');
  console.log('=' .repeat(80));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      console.log(`✅ ${result.method} ${result.path}`);
      console.log(`   📋 ${result.description}`);
      console.log(`   📊 Status: ${result.status}`);
      
      if (result.data) {
        try {
          const jsonData = JSON.parse(result.data.replace('...', ''));
          if (jsonData.success) {
            console.log(`   ✅ Success: ${jsonData.message || 'OK'}`);
            if (jsonData.data && Array.isArray(jsonData.data)) {
              console.log(`   📈 Data: ${jsonData.data.length} items`);
            } else if (jsonData.data) {
              console.log(`   📈 Data: Object returned`);
            }
          } else {
            console.log(`   ⚠️  Success: false - ${jsonData.message || 'Unknown error'}`);
          }
        } catch (e) {
          console.log(`   📄 Response preview: ${result.data}`);
        }
      }
      
      successCount++;
      console.log('');
    } catch (error) {
      console.log(`❌ ${error.method} ${error.path}`);
      console.log(`   📋 ${error.description}`);
      console.log(`   💥 Error: ${error.error}`);
      console.log('');
      errorCount++;
    }
  }
  
  console.log('=' .repeat(80));
  console.log(`📊 Résumé des tests:`);
  console.log(`   ✅ Succès: ${successCount}/${endpoints.length}`);
  console.log(`   ❌ Erreurs: ${errorCount}/${endpoints.length}`);
  console.log(`   📈 Taux de réussite: ${Math.round((successCount / endpoints.length) * 100)}%`);
}

testAllEndpoints().catch(console.error);
