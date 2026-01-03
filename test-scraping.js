/**
 * Test script voor Funda scraping endpoints
 * Test alle beschikbare scraping endpoints
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
// Gebruik een echte Funda URL voor betere tests
// Vervang dit met een echte woninglink van Funda.nl
const TEST_FUNDA_URL = process.env.TEST_FUNDA_URL || 'https://www.funda.nl/koop/amsterdam/huis-12345678-address/';

// Test URLs - voeg hier echte Funda links toe
const TEST_URLS = [
  // Voorbeeld: 'https://www.funda.nl/koop/amsterdam/koningin-julianalaan-20-3951aa-leersum/',
  // Voeg hier meer echte test URLs toe
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, endpoint, url) {
  log(`\n🧪 Testing ${name}...`, 'cyan');
  log(`   Endpoint: ${endpoint}`, 'blue');
  log(`   URL: ${url}`, 'blue');

  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const duration = Date.now() - startTime;
    const result = await response.json();

    if (response.ok && result.success) {
      log(`   ✅ SUCCESS (${duration}ms)`, 'green');
      log(`   Title: ${result.data?.title || 'N/A'}`, 'green');
      log(`   Address: ${result.data?.address || 'N/A'}`, 'green');
      log(`   Price: ${result.data?.price || 'N/A'}`, 'green');
      return { success: true, duration, data: result.data };
    } else {
      log(`   ❌ FAILED (${duration}ms) - Status: ${response.status}`, 'red');
      log(`   Error: ${result.message || result.error || 'Unknown error'}`, 'red');
      if (result.errorCode) {
        log(`   Error Code: ${result.errorCode}`, 'yellow');
      }
      return { success: false, duration, error: result.message || result.error, status: response.status };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`   ❌ ERROR (${duration}ms)`, 'red');
    log(`   ${error.message}`, 'red');
    return { success: false, duration, error: error.message };
  }
}


async function runTests() {
  log('\n🚀 Starting Funda Scraping Tests', 'cyan');
  log(`   Base URL: ${BASE_URL}`, 'blue');
  log(`   Test URL: ${TEST_FUNDA_URL}`, 'blue');
  log(`   ⚠️  Note: Using a placeholder URL. Replace with a real Funda URL for accurate testing.`, 'yellow');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    endpoints: [],
  };

  // Test scraping endpoint
  const endpoints = [
    { name: 'Funda Scraping API', path: '/api/scrape-funda' },
  ];

  for (const endpoint of endpoints) {
    results.total++;
    
    const result = await testEndpoint(endpoint.name, endpoint.path, TEST_FUNDA_URL);
    results.endpoints.push({ name: endpoint.name, ...result });
    if (result.success) results.passed++;
    else results.failed++;

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  log('\n📊 Test Summary', 'cyan');
  log(`   Total: ${results.total}`, 'blue');
  log(`   ✅ Passed: ${results.passed}`, 'green');
  log(`   ❌ Failed: ${results.failed}`, 'red');

  // Detailed results
  log('\n📋 Detailed Results:', 'cyan');
  results.endpoints.forEach(endpoint => {
    if (endpoint.success) {
      log(`   ✅ ${endpoint.name}`, 'green');
      if (endpoint.duration) {
        log(`      Duration: ${endpoint.duration}ms`, 'blue');
      }
    } else {
      log(`   ❌ ${endpoint.name}`, 'red');
      if (endpoint.error) {
        log(`      Error: ${endpoint.error}`, 'yellow');
      }
      if (endpoint.status) {
        log(`      Status: ${endpoint.status}`, 'yellow');
      }
    }
  });

  // Recommendations
  log('\n💡 Recommendations:', 'cyan');
  if (results.failed === results.total) {
    log('   ⚠️  All endpoints failed. This is likely due to:', 'yellow');
    log('      - IP blocking by Funda', 'yellow');
    log('      - Bot detection', 'yellow');
    log('      - Network issues', 'yellow');
    log('   💡 Consider:', 'yellow');
    log('      - Using a proxy service (ScraperAPI)', 'yellow');
    log('      - Using manual property entry', 'yellow');
    log('      - Testing from a different network', 'yellow');
  } else if (results.passed > 0) {
    log(`   ✅ ${results.passed} endpoint(s) working!`, 'green');
    const working = results.endpoints.filter(e => e.success);
    log(`   💡 Use these endpoints: ${working.map(e => e.name).join(', ')}`, 'green');
  }

  log('\n✨ Tests completed!\n', 'cyan');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  log('❌ Error: fetch is not available. Please use Node.js 18+ or install node-fetch', 'red');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

