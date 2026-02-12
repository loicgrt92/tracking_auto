# 🚂 Déploiement sur Railway.app

## Pourquoi Railway ?

✅ **5€/mois** (très abordable)
✅ **Déploiement en 1 clic** depuis GitHub
✅ **HTTPS automatique** (pas de config SSL)
✅ **Compatible avec Playwright** (contrairement à Vercel/Netlify)
✅ **Logs en temps réel** pour débugger

---

## 📦 Étape 1 : Préparer les fichiers

Créez un nouveau dossier sur votre ordinateur avec ces fichiers :

```
tracking-tester/
├── package.json
├── api-server.js
├── README.md
└── railway.json (optionnel)
```

### package.json pour Railway

```json
{
  "name": "tracking-tester-api",
  "version": "1.0.0",
  "description": "API for automated tracking testing",
  "main": "api-server.js",
  "scripts": {
    "start": "node api-server.js",
    "postinstall": "npx playwright install chromium && npx playwright install-deps chromium"
  },
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.40.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### railway.json (optionnel mais recommandé)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node api-server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🚀 Étape 2 : Déployer sur Railway

### Option A : Depuis GitHub (Recommandé)

1. **Créer un repo GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE-USERNAME/tracking-tester.git
   git push -u origin main
   ```

2. **Connecter à Railway**
   - Allez sur https://railway.app
   - Cliquez sur **"Start a New Project"**
   - Choisissez **"Deploy from GitHub repo"**
   - Sélectionnez votre repo `tracking-tester`
   - Railway va automatiquement détecter Node.js et déployer ! 🎉

3. **Configurer les variables d'environnement** (optionnel)
   - Dans Railway, allez dans **Variables**
   - Ajoutez `NODE_ENV=production`

4. **Obtenir votre URL**
   - Railway génère automatiquement une URL : `https://tracking-tester-production-xxxx.up.railway.app`
   - Vous pouvez aussi configurer un domaine custom

### Option B : Depuis le CLI Railway

```bash
# Installer le CLI Railway
npm install -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

---

## 🔗 Étape 3 : Utiliser l'API depuis N8N

### Configuration du nœud HTTP Request dans N8N

1. **Ajouter un nœud "HTTP Request"** après "Préparer Config Tests"

2. **Configurer le nœud :**
   ```
   Method: POST
   URL: https://VOTRE-APP.up.railway.app/test
   
   Body Content Type: JSON
   
   JSON/RAW Parameters:
   {
     "eventName": "{{ $json.eventName }}",
     "url": "{{ $json.url }}",
     "userAction": "{{ $json.userAction }}",
     "dataLayerEventName": "{{ $json.dataLayerEventName }}",
     "expectedParams": "{{ $json.expectedParams }}",
     "testGA4": {{ $json.testGA4 }},
     "testAmplitude": {{ $json.testAmplitude }},
     "testMixpanel": {{ $json.testMixpanel }}
   }
   ```

3. **Vérifier la réponse**
   - Le nœud retournera un JSON avec les résultats
   - Utilisez `{{ $json.results }}` dans les nœuds suivants

---

## 🧪 Étape 4 : Tester l'API

### Test avec curl

```bash
curl -X POST https://VOTRE-APP.up.railway.app/test \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "page_view",
    "url": "https://votresite.com",
    "dataLayerEventName": "page_view",
    "expectedParams": "{\"page_location\": \"*\"}",
    "testGA4": true,
    "testAmplitude": false,
    "testMixpanel": false
  }'
```

### Test avec Postman / Insomnia

1. Créez une nouvelle requête POST
2. URL : `https://VOTRE-APP.up.railway.app/test`
3. Body (JSON) :
```json
{
  "eventName": "add_to_cart",
  "url": "https://votresite.com/produit",
  "userAction": "click:.add-to-cart",
  "dataLayerEventName": "add_to_cart",
  "expectedParams": "{\"currency\": \"EUR\", \"value\": \"*\"}",
  "testGA4": true,
  "testAmplitude": true,
  "testMixpanel": false
}
```

---

## 📊 Étape 5 : Monitoring et Logs

### Voir les logs en temps réel

```bash
railway logs
```

Ou dans le dashboard Railway :
- Allez dans votre projet
- Onglet **"Deployments"**
- Cliquez sur **"View Logs"**

### Métriques importantes

Railway vous montre :
- 🕐 Uptime
- 💾 Utilisation mémoire
- 🌐 Requêtes/minute
- ⏱️ Temps de réponse

---

## 💰 Gestion des Coûts

### Plan gratuit Railway

- **$5 de crédit gratuit** pour commencer
- Puis **$5/mois** pour usage standard
- Scaling automatique selon la charge

### Optimiser les coûts

1. **Limiter les tests** : 1x par semaine suffit généralement
2. **Batch testing** : Utilisez `/batch-test` pour tester plusieurs événements en une seule requête
3. **Sleep mode** : Railway met en veille l'app si pas utilisée (se réveille en <1s)

---

## 🔒 Sécurité (Optionnel)

### Ajouter une clé API

Modifiez `api-server.js` :

```javascript
// Au début du fichier
const API_KEY = process.env.API_KEY || 'votre-cle-secrete';

// Middleware d'authentification
app.use((req, res, next) => {
  const providedKey = req.headers['x-api-key'];
  
  if (req.path === '/health') {
    return next(); // Health check toujours accessible
  }
  
  if (providedKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
});
```

Dans Railway, ajoutez la variable d'environnement :
```
API_KEY=votre_cle_secrete_aleatoire_123456
```

Dans N8N, ajoutez un header :
```
x-api-key: votre_cle_secrete_aleatoire_123456
```

---

## 🆘 Troubleshooting

### ❌ Erreur : "Browser not found"

```bash
# Dans Railway, vérifiez que le postinstall s'exécute
# Ajoutez dans package.json :
"scripts": {
  "postinstall": "npx playwright install-deps chromium && npx playwright install chromium"
}
```

### ❌ Erreur : "Out of memory"

Railway donne 512MB par défaut. Si nécessaire :
- Allez dans Settings → Memory
- Augmentez à 1GB ($0.50 de plus/mois)

### ❌ Timeout après 30 secondes

Dans N8N, augmentez le timeout du nœud HTTP Request :
- Options → Timeout → 60000 (60 secondes)

---

## 🎯 Alternatives à Railway

Si Railway ne vous convient pas :

### Render.com
- Similaire à Railway
- **Plan gratuit** disponible (750h/mois)
- Légèrement plus lent au démarrage

### Fly.io
- **$5/mois** aussi
- Plus de contrôle technique
- Configuration un peu plus complexe

### Heroku
- **$7/mois** (plus cher)
- Très stable
- Grande communauté

---

## ✅ Checklist finale

- [ ] Repo GitHub créé avec les fichiers
- [ ] Déployé sur Railway
- [ ] URL de l'API notée
- [ ] Test avec curl réussi
- [ ] Nœud HTTP Request configuré dans N8N
- [ ] Test end-to-end N8N → Railway → Notion réussi
- [ ] Logs Railway vérifiés

---

**🎉 Félicitations !** Votre système de test automatisé est déployé et prêt à l'emploi.

Besoin d'aide avec le déploiement ? Dites-moi où vous bloquez ! 🚀
