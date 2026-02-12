/**
 * 🌐 API HTTP pour Tracking Tester
 * 
 * Service déployable sur Railway.app ou Render.com
 * À utiliser avec N8N Cloud via un nœud HTTP Request
 */

const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));

// 📊 Configuration des outils analytics
const ANALYTICS_PATTERNS = {
  ga4: {
    domain: 'google-analytics.com',
    collectEndpoint: '/g/collect',
    debugEndpoint: '/debug/collect'
  },
  amplitude: {
    domain: 'api.amplitude.com',
    endpoint: '/2/httpapi'
  },
  mixpanel: {
    domain: 'api.mixpanel.com',
    endpoint: '/track'
  }
};

/**
 * 🏥 Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Tracking Tester API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * 📋 Info endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Tracking Tester API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      test: 'POST /test',
      batchTest: 'POST /batch-test'
    },
    documentation: 'https://github.com/votre-repo/tracking-tester'
  });
});

/**
 * 🎯 Endpoint principal pour tester un événement
 * POST /test
 */
app.post('/test', async (req, res) => {
  const testConfig = req.body;
  
  // Validation basique
  if (!testConfig.url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required',
      receivedConfig: testConfig
    });
  }
  
  try {
    console.log(`🎬 Starting test for: ${testConfig.eventName || 'unnamed event'}`);
    
    const results = await runTrackingTest(testConfig);
    
    console.log(`✅ Test completed - Success: ${results.success}`);
    
    res.json({
      success: true,
      results: results
    });
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * 🔄 Endpoint pour tester plusieurs événements en batch
 * POST /batch-test
 */
app.post('/batch-test', async (req, res) => {
  const { tests } = req.body;
  
  if (!Array.isArray(tests) || tests.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'tests array is required'
    });
  }
  
  const results = [];
  
  for (const testConfig of tests) {
    try {
      const result = await runTrackingTest(testConfig);
      results.push({
        testName: testConfig.eventName,
        success: result.success,
        results: result
      });
    } catch (error) {
      results.push({
        testName: testConfig.eventName,
        success: false,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  res.json({
    success: true,
    summary: {
      total: results.length,
      passed: successCount,
      failed: results.length - successCount
    },
    results: results
  });
});

/**
 * 🎭 Fonction principale de test (identique au script standalone)
 */
async function runTrackingTest(testConfig) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Nécessaire pour Railway/Render
  });
  
  const context = await browser.newContext({
    permissions: ['geolocation'],
  });
  
  const page = await context.newPage();
  
  const results = {
    eventName: testConfig.eventName,
    timestamp: new Date().toISOString(),
    success: false,
    dataLayerEvents: [],
    networkRequests: [],
    errors: [],
    toolsDetected: {
      ga4: false,
      amplitude: false,
      mixpanel: false
    }
  };
  
  try {
    const capturedRequests = [];
    
    // Intercepter les requêtes réseau
    page.on('request', request => {
      const url = request.url();
      
      if (url.includes(ANALYTICS_PATTERNS.ga4.domain)) {
        capturedRequests.push({
          tool: 'ga4',
          url: url,
          payload: extractGA4Payload(url),
          timestamp: Date.now()
        });
        results.toolsDetected.ga4 = true;
      }
      
      if (url.includes(ANALYTICS_PATTERNS.amplitude.domain)) {
        capturedRequests.push({
          tool: 'amplitude',
          url: url,
          payload: request.postDataJSON(),
          timestamp: Date.now()
        });
        results.toolsDetected.amplitude = true;
      }
      
      if (url.includes(ANALYTICS_PATTERNS.mixpanel.domain)) {
        capturedRequests.push({
          tool: 'mixpanel',
          url: url,
          payload: request.postDataJSON(),
          timestamp: Date.now()
        });
        results.toolsDetected.mixpanel = true;
      }
    });
    
    // Navigation
    console.log(`📍 Navigating to: ${testConfig.url}`);
    await page.goto(testConfig.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Exécuter l'action utilisateur
    if (testConfig.userAction) {
      console.log(`🎬 Executing action: ${testConfig.userAction}`);
      await executeUserAction(page, testConfig.userAction);
      await page.waitForTimeout(3000);
    }
    
    // Vérifier le dataLayer
    const dataLayerData = await page.evaluate((expectedEventName) => {
      if (window.dataLayer) {
        return window.dataLayer.filter(event => {
          return event.event === expectedEventName || 
                 event.event_name === expectedEventName;
        });
      }
      return [];
    }, testConfig.dataLayerEventName);
    
    results.dataLayerEvents = dataLayerData;
    
    // Validation des paramètres
    if (testConfig.expectedParams) {
      const expectedParams = typeof testConfig.expectedParams === 'string' 
        ? JSON.parse(testConfig.expectedParams) 
        : testConfig.expectedParams;
        
      const validationResult = validateParameters(
        dataLayerData, 
        capturedRequests, 
        expectedParams,
        testConfig
      );
      
      results.success = validationResult.success;
      results.errors = validationResult.errors;
      results.validatedParams = validationResult.validatedParams;
    } else {
      results.success = dataLayerData.length > 0 || capturedRequests.length > 0;
      if (!results.success) {
        results.errors.push("No events detected in dataLayer or network requests");
      }
    }
    
    results.networkRequests = capturedRequests;
    
  } catch (error) {
    console.error(`❌ Error during test: ${error.message}`);
    results.errors.push(error.message);
    results.success = false;
  } finally {
    await browser.close();
  }
  
  return results;
}

/**
 * 🎬 Exécute l'action utilisateur
 */
async function executeUserAction(page, actionDescription) {
  const [actionType, ...params] = actionDescription.split(':');
  
  switch(actionType.toLowerCase()) {
    case 'click':
      await page.click(params[0]);
      break;
    case 'type':
      await page.fill(params[0], params[1]);
      break;
    case 'scroll':
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      break;
    case 'wait':
      await page.waitForTimeout(parseInt(params[0]));
      break;
    default:
      console.warn(`⚠️ Unknown action: ${actionType}`);
  }
}

/**
 * 🔍 Valide les paramètres
 */
function validateParameters(dataLayerData, networkRequests, expectedParams, config) {
  const errors = [];
  const validatedParams = {};
  let allParamsValid = true;
  
  for (const [paramName, expectedValue] of Object.entries(expectedParams)) {
    let found = false;
    let actualValue = null;
    
    // Chercher dans dataLayer
    for (const dlEvent of dataLayerData) {
      if (dlEvent[paramName] !== undefined) {
        found = true;
        actualValue = dlEvent[paramName];
        break;
      }
    }
    
    // Chercher dans les requêtes réseau
    if (!found) {
      for (const req of networkRequests) {
        if (config.testGA4 && req.tool === 'ga4') {
          if (req.payload && req.payload[paramName]) {
            found = true;
            actualValue = req.payload[paramName];
            break;
          }
        }
        if (config.testAmplitude && req.tool === 'amplitude') {
          if (req.payload?.events?.[0]?.event_properties?.[paramName]) {
            found = true;
            actualValue = req.payload.events[0].event_properties[paramName];
            break;
          }
        }
        if (config.testMixpanel && req.tool === 'mixpanel') {
          if (req.payload?.properties?.[paramName]) {
            found = true;
            actualValue = req.payload.properties[paramName];
            break;
          }
        }
      }
    }
    
    if (!found) {
      errors.push(`Missing parameter: ${paramName}`);
      allParamsValid = false;
      validatedParams[paramName] = { expected: expectedValue, actual: 'NOT FOUND', valid: false };
    } else if (expectedValue !== '*' && actualValue != expectedValue) {
      errors.push(`Parameter ${paramName}: expected "${expectedValue}", got "${actualValue}"`);
      allParamsValid = false;
      validatedParams[paramName] = { expected: expectedValue, actual: actualValue, valid: false };
    } else {
      validatedParams[paramName] = { expected: expectedValue, actual: actualValue, valid: true };
    }
  }
  
  return {
    success: allParamsValid && errors.length === 0,
    errors,
    validatedParams
  };
}

/**
 * 📊 Extrait les paramètres GA4
 */
function extractGA4Payload(url) {
  const params = new URLSearchParams(url.split('?')[1]);
  const payload = {};
  
  for (const [key, value] of params.entries()) {
    if (key.startsWith('ep.')) {
      payload[key.substring(3)] = decodeURIComponent(value);
    } else if (key.startsWith('epn.')) {
      payload[key.substring(4)] = decodeURIComponent(value);
    } else {
      payload[key] = decodeURIComponent(value);
    }
  }
  
  return payload;
}

// 🚀 Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
🎯 Tracking Tester API is running!
🌐 Port: ${PORT}
📍 Endpoints:
   - GET  ${PORT === 3000 ? 'http://localhost:' + PORT : 'https://your-app.railway.app'}/health
   - POST ${PORT === 3000 ? 'http://localhost:' + PORT : 'https://your-app.railway.app'}/test
   - POST ${PORT === 3000 ? 'http://localhost:' + PORT : 'https://your-app.railway.app'}/batch-test
  `);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
