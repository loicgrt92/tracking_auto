/**
 * 🎯 TRACKING TESTER - Script Playwright pour N8N
 * 
 * Ce script teste automatiquement votre tracking analytics
 * Compatible avec : GA4, Amplitude, Mixpanel
 */

const { chromium } = require('playwright');

// 📊 Configuration des outils analytics à surveiller
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
 * Fonction principale de test
 * @param {Object} testConfig - Configuration du test depuis Notion
 */
async function runTrackingTest(testConfig) {
  const browser = await chromium.launch({
    headless: true, // Mettre à false pour débugger visuellement
  });
  
  const context = await browser.newContext({
    // Accepter tous les cookies pour éviter les banners
    permissions: ['geolocation'],
  });
  
  const page = await context.newPage();
  
  // 📦 Stockage des résultats
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
    // 🎣 Intercepter les requêtes réseau
    const capturedRequests = [];
    
    page.on('request', request => {
      const url = request.url();
      
      // Capturer GA4
      if (url.includes(ANALYTICS_PATTERNS.ga4.domain)) {
        capturedRequests.push({
          tool: 'ga4',
          url: url,
          payload: extractGA4Payload(url),
          timestamp: Date.now()
        });
        results.toolsDetected.ga4 = true;
      }
      
      // Capturer Amplitude
      if (url.includes(ANALYTICS_PATTERNS.amplitude.domain)) {
        capturedRequests.push({
          tool: 'amplitude',
          url: url,
          payload: request.postDataJSON(),
          timestamp: Date.now()
        });
        results.toolsDetected.amplitude = true;
      }
      
      // Capturer Mixpanel
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
    
    // 🌐 Aller sur la page à tester
    console.log(`📍 Navigation vers : ${testConfig.url}`);
    await page.goto(testConfig.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // ⏳ Attendre un peu que les tags se chargent
    await page.waitForTimeout(2000);
    
    // 🎬 Exécuter l'action utilisateur
    if (testConfig.userAction) {
      console.log(`🎬 Exécution de l'action : ${testConfig.userAction}`);
      await executeUserAction(page, testConfig.userAction);
      
      // Attendre que le tracking se déclenche
      await page.waitForTimeout(3000);
    }
    
    // 📊 Vérifier le dataLayer
    const dataLayerData = await page.evaluate((expectedEventName) => {
      // Pour GA4 / GTM
      if (window.dataLayer) {
        return window.dataLayer.filter(event => {
          return event.event === expectedEventName || 
                 event.event_name === expectedEventName;
        });
      }
      return [];
    }, testConfig.dataLayerEventName);
    
    results.dataLayerEvents = dataLayerData;
    
    // 🔍 Validation des paramètres attendus
    if (testConfig.expectedParams) {
      const expectedParams = JSON.parse(testConfig.expectedParams);
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
      // Si pas de paramètres spécifiques, on valide juste la présence
      results.success = dataLayerData.length > 0 || capturedRequests.length > 0;
      if (!results.success) {
        results.errors.push("Aucun événement détecté dans le dataLayer ou les requêtes réseau");
      }
    }
    
    results.networkRequests = capturedRequests;
    
    console.log(`✅ Test terminé - Succès : ${results.success}`);
    
  } catch (error) {
    console.error(`❌ Erreur pendant le test : ${error.message}`);
    results.errors.push(error.message);
    results.success = false;
  } finally {
    await browser.close();
  }
  
  return results;
}

/**
 * 🎬 Exécute l'action utilisateur sur la page
 */
async function executeUserAction(page, actionDescription) {
  // Format attendu : "click:.add-to-cart-btn" ou "type:#email:test@example.com"
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
      console.warn(`⚠️ Action non reconnue : ${actionType}`);
  }
}

/**
 * 🔍 Valide que les paramètres attendus sont présents
 */
function validateParameters(dataLayerData, networkRequests, expectedParams, config) {
  const errors = [];
  const validatedParams = {};
  let allParamsValid = true;
  
  // Vérifier chaque paramètre attendu
  for (const [paramName, expectedValue] of Object.entries(expectedParams)) {
    let found = false;
    let actualValue = null;
    
    // Chercher dans le dataLayer
    for (const dlEvent of dataLayerData) {
      if (dlEvent[paramName] !== undefined) {
        found = true;
        actualValue = dlEvent[paramName];
        break;
      }
    }
    
    // Si pas dans dataLayer, chercher dans les requêtes réseau
    if (!found) {
      for (const req of networkRequests) {
        // Chercher selon l'outil
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
    
    // Valider la valeur
    if (!found) {
      errors.push(`Paramètre manquant : ${paramName}`);
      allParamsValid = false;
      validatedParams[paramName] = { expected: expectedValue, actual: 'NON TROUVÉ', valid: false };
    } else if (expectedValue !== '*' && actualValue != expectedValue) {
      errors.push(`Paramètre ${paramName} : attendu "${expectedValue}", reçu "${actualValue}"`);
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
 * 📊 Extrait les paramètres d'une URL GA4
 */
function extractGA4Payload(url) {
  const params = new URLSearchParams(url.split('?')[1]);
  const payload = {};
  
  for (const [key, value] of params.entries()) {
    // Décoder les paramètres GA4
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

// 🚀 Point d'entrée pour N8N
// N8N passera la configuration via les items
module.exports = { runTrackingTest };

// Pour test en local
if (require.main === module) {
  const testConfig = {
    eventName: 'add_to_cart',
    url: 'https://votresite.com/produit',
    userAction: 'click:.btn-add-to-cart',
    dataLayerEventName: 'add_to_cart',
    expectedParams: JSON.stringify({
      'currency': 'EUR',
      'value': '*',
      'items': '*'
    }),
    testGA4: true,
    testAmplitude: false,
    testMixpanel: false
  };
  
  runTrackingTest(testConfig).then(results => {
    console.log('\n📊 RÉSULTATS DU TEST :');
    console.log(JSON.stringify(results, null, 2));
  });
}
