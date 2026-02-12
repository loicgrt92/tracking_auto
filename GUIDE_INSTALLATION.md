# 🎯 Guide d'Installation - Tracking Tester Automatisé

## 📋 Vue d'ensemble

Ce système automatise vos tests de tracking analytics pour **GA4, Amplitude et Mixpanel**. Il lit votre plan de mesure dans Notion, exécute les tests avec Playwright, et vous envoie un rapport hebdomadaire.

---

## 🚀 Installation (Étape par Étape)

### 1️⃣ Prérequis

Vous aurez besoin de :
- ✅ Un compte **N8N** (version cloud ou self-hosted)
- ✅ Un compte **Notion** (votre base est déjà créée !)
- ✅ Node.js installé sur votre serveur N8N (si self-hosted)

---

### 2️⃣ Configuration de Notion

#### A. Récupérer votre clé API Notion

1. Allez sur https://www.notion.so/my-integrations
2. Cliquez sur **"+ Nouvelle intégration"**
3. Donnez un nom : `Tracking Tester`
4. Copiez le **"Internal Integration Token"** (commence par `secret_...`)
5. Dans votre base de données Notion "Plan de Mesure", cliquez sur les `⋯` en haut à droite
6. Allez dans **"Connexions"** → **"Ajouter des connexions"**
7. Sélectionnez votre intégration `Tracking Tester`

#### B. Récupérer l'ID de votre base de données

Votre ID de base est : **`b56e975df0f84fe48284aa40f1dadda7`**

✅ C'est déjà configuré dans le workflow !

---

### 3️⃣ Installation de Playwright dans N8N

#### Option A : N8N Cloud
```bash
# Vous ne pouvez pas installer Playwright directement dans N8N Cloud
# SOLUTION : Utilisez un webhook externe avec ce script sur votre serveur
```

#### Option B : N8N Self-Hosted (Recommandé)
```bash
# SSH dans votre serveur N8N
cd ~/.n8n/custom

# Installer les dépendances
npm init -y
npm install playwright

# Installer les navigateurs Playwright
npx playwright install chromium
npx playwright install-deps
```

#### Option C : Service externe (Alternative low-code)
Si vous utilisez N8N Cloud, vous pouvez :
1. Héberger le script Playwright sur **Railway.app** ou **Render.com** (gratuit)
2. Créer un endpoint HTTP qui exécute les tests
3. Appeler ce endpoint depuis N8N avec un nœud HTTP Request

**Je peux vous créer ce service externe si vous préférez cette option !**

---

### 4️⃣ Import du Workflow dans N8N

1. Connectez-vous à N8N
2. Cliquez sur **"Workflows"** → **"Add workflow"**
3. Cliquez sur les `⋯` (menu) → **"Import from File"**
4. Uploadez le fichier `n8n-workflow-tracking-tester.json`
5. Le workflow apparaît avec tous les nœuds configurés !

---

### 5️⃣ Configuration des Credentials dans N8N

#### A. Notion API
1. Dans le workflow, cliquez sur le nœud **"📋 Lire Plan de Mesure Notion"**
2. Sous "Credentials", cliquez sur **"Create New"**
3. Nommez-la `Notion - Tracking`
4. Collez votre token Notion (de l'étape 2A)
5. Sauvegardez

#### B. Email (optionnel mais recommandé)
1. Cliquez sur le nœud **"📨 Envoyer Email"**
2. Configurez avec vos paramètres SMTP :
   - **Gmail** : smtp.gmail.com, port 587
   - **Outlook** : smtp-mail.outlook.com, port 587
   - **SendGrid, Mailgun, etc.** : selon votre provider

---

### 6️⃣ Déployer le Script Playwright

#### Option Simple : Sur le même serveur que N8N
```bash
# Copier le fichier tracking-tester.js sur votre serveur
scp tracking-tester.js user@votre-serveur:/home/claude/

# Se connecter au serveur
ssh user@votre-serveur

# Installer les dépendances
cd /home/claude
npm install playwright
```

#### Option Cloud : Railway.app (Gratuit)
```bash
# 1. Créer un compte sur railway.app
# 2. Nouveau projet → Deploy from GitHub
# 3. Je peux vous créer un repo prêt à l'emploi si besoin !
```

---

### 7️⃣ Remplir votre Plan de Mesure Notion

Retournez dans Notion et ajoutez vos premiers événements à tester :

| Événement | Type | URL Test | Action utilisateur | Nom dataLayer | Paramètres attendus | GA4 | Amplitude | Mixpanel | Statut |
|-----------|------|----------|-------------------|---------------|-------------------|-----|-----------|----------|--------|
| Page vue accueil | Page View | https://votresite.com | | page_view | {"page_location": "*", "page_title": "*"} | ✅ | ✅ | | ⏳ En attente |
| Ajout au panier | E-commerce | https://votresite.com/produit | click:.btn-add-cart | add_to_cart | {"currency": "EUR", "value": "*", "items": "*"} | ✅ | ✅ | ✅ | ⏳ En attente |

**Format des actions utilisateur :**
- `click:.selecteur-css` → Clic sur un élément
- `type:#email:test@example.com` → Remplir un champ
- `scroll` → Scroller en bas de page
- `wait:3000` → Attendre 3 secondes

**Format des paramètres attendus :**
```json
{
  "nom_parametre": "valeur_exacte",
  "autre_param": "*"
}
```
> `"*"` = n'importe quelle valeur (juste vérifier la présence)

---

### 8️⃣ Tester le Workflow

1. Dans N8N, cliquez sur **"Execute Workflow"** (bouton Play)
2. Vérifiez que chaque nœud s'exécute correctement
3. Regardez les résultats dans Notion - le statut devrait se mettre à jour !

---

## 🎨 Personnalisation

### Changer la fréquence d'exécution
Dans le nœud **"⏰ Déclenchement Hebdomadaire"** :
- Modifier `weeksInterval` pour changer la fréquence
- Modifier `triggerAtHour` pour l'heure
- Modifier `triggerAtDay` pour le jour (1=Lundi, 7=Dimanche)

### Ajouter plus d'outils analytics
Dans `tracking-tester.js`, ajoutez votre outil dans `ANALYTICS_PATTERNS` :
```javascript
matomo: {
  domain: 'votredomaine.com',
  endpoint: '/matomo.php'
}
```

---

## 🆘 Dépannage

### ❌ "Cannot find module 'playwright'"
```bash
cd /home/claude
npm install playwright
npx playwright install chromium
```

### ❌ "Notion API authentication failed"
- Vérifiez que vous avez bien ajouté l'intégration à votre page Notion
- Vérifiez que le token commence par `secret_`

### ❌ "No browser found"
```bash
npx playwright install chromium
npx playwright install-deps
```

### ❌ Tests échouent mais le tracking fonctionne en manuel
- Augmentez les `waitForTimeout` dans le script
- Vérifiez que les sélecteurs CSS sont corrects
- Testez en mode `headless: false` pour voir ce qui se passe

---

## 📊 Alternatives et Options

### Alternative 1 : Sans N8N (Python + Cron)
Je peux vous créer une version Python standalone qui tourne avec un simple cron job.

### Alternative 2 : Zapier (+ cher mais + simple)
Zapier peut remplacer N8N mais les prix montent vite avec les tâches automatisées.

### Alternative 3 : GitHub Actions (Gratuit)
Solution 100% gratuite qui exécute les tests dans GitHub. Parfait pour les développeurs !

---

## 🚀 Prochaines Étapes

**Voulez-vous que je vous aide avec :**
1. ✨ La configuration du service externe pour N8N Cloud ?
2. 📝 Des exemples de tests pour des cas d'usage spécifiques ?
3. 🎨 Une version Python standalone ?
4. 🔧 L'ajout d'un outil analytics supplémentaire ?

Dites-moi ce qui vous serait le plus utile ! 🎯
