# 🎯 Tracking Tester Automatisé

> **Automatisez vos tests de tracking analytics** pour GA4, Amplitude et Mixpanel avec Notion + N8N + Playwright

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

---

## 📋 Qu'est-ce que c'est ?

Un système **low-code** qui :

1. ✅ **Lit votre plan de mesure** depuis Notion
2. 🤖 **Exécute automatiquement** les tests de tracking
3. 🔍 **Valide** que les événements analytics sont bien envoyés
4. 📧 **Vous envoie un rapport** par email chaque semaine
5. ✏️ **Met à jour Notion** avec les résultats

---

## 🎬 Démo Rapide

### Avant
```
❌ Tester manuellement le tracking = 2h par semaine
❌ Bugs de tracking découverts en production
❌ Rapports GA4 incorrects pendant des semaines
```

### Après
```
✅ Tests automatiques chaque lundi matin
✅ Rapport d'anomalies dans votre inbox
✅ Plan de mesure toujours à jour dans Notion
```

---

## 🚀 Quick Start (5 minutes)

### 1. Créer votre base Notion

Votre base est déjà créée ! 🎉

👉 [Accéder à votre Plan de Mesure Notion](https://www.notion.so/147550cf55804f06ab718b987f472bda)

### 2. Ajouter vos premiers tests

Exemple simple :

| Événement | Type | URL | Action | DataLayer | Paramètres | GA4 | Status |
|-----------|------|-----|--------|-----------|------------|-----|--------|
| Page accueil | Page View | https://votresite.com | | page_view | {"page_title": "*"} | ✅ | ⏳ En attente |

### 3. Installer N8N + Déployer

**Option A - Simple (25€/mois) :**
- N8N Cloud (20€) + Railway.app (5€)
- [Guide complet ici →](DEPLOIEMENT_RAILWAY.md)

**Option B - Gratuit (technique) :**
- GitHub Actions
- [Guide complet ici →](COMPARATIF_SOLUTIONS.md)

### 4. Lancer votre premier test

Importez le workflow dans N8N et cliquez sur "Execute" !

---

## 📦 Contenu du Projet

```
tracking-tester/
├── 📄 README.md                    # Ce fichier
├── 📘 GUIDE_INSTALLATION.md        # Guide complet étape par étape
├── 📊 COMPARATIF_SOLUTIONS.md      # Comparaison des alternatives
├── 🚂 DEPLOIEMENT_RAILWAY.md       # Déploiement sur Railway.app
├── 📚 EXEMPLES_TESTS.md            # 20+ exemples de tests prêts à l'emploi
│
├── 🎭 tracking-tester.js           # Script Playwright principal
├── 🌐 api-server.js                # API HTTP (pour N8N Cloud)
├── 🔄 n8n-workflow-tracking-tester.json  # Workflow N8N à importer
│
└── 📦 package.json                 # Dépendances Node.js
```

---

## 🎯 Fonctionnalités

### ✅ Ce qui est testé

- **DataLayer** : Vérifie que les événements sont push dans `window.dataLayer`
- **Requêtes réseau** : Capture les appels à GA4, Amplitude, Mixpanel
- **Paramètres** : Valide que tous les paramètres attendus sont présents
- **Valeurs** : Compare les valeurs exactes ou utilise des wildcards `*`

### 🔧 Actions utilisateur supportées

```javascript
click:.selecteur-css          // Cliquer sur un élément
type:#email:test@email.com    // Remplir un champ
scroll                        // Scroller en bas de page
wait:3000                     // Attendre 3 secondes
```

### 📊 Outils analytics supportés

- ✅ **Google Analytics 4** (GA4)
- ✅ **Amplitude**
- ✅ **Mixpanel**
- 🔜 **Matomo** (facile à ajouter)
- 🔜 **Segment** (facile à ajouter)

---

## 📖 Documentation

| Document | Description | Pour qui ? |
|----------|-------------|------------|
| [GUIDE_INSTALLATION.md](GUIDE_INSTALLATION.md) | Installation complète pas à pas | Tous |
| [COMPARATIF_SOLUTIONS.md](COMPARATIF_SOLUTIONS.md) | Comparaison N8N vs GitHub Actions vs autres | Décideurs |
| [DEPLOIEMENT_RAILWAY.md](DEPLOIEMENT_RAILWAY.md) | Déployer l'API sur Railway.app | Utilisateurs N8N Cloud |
| [EXEMPLES_TESTS.md](EXEMPLES_TESTS.md) | 20+ exemples de tests prêts à copier | Analystes |

---

## 💰 Coûts Estimés

### Option 1 : N8N Cloud + Railway (Recommandé pour profils marketing)
```
N8N Cloud (Starter)    : 20€/mois
Railway.app            : 5€/mois
Notion                 : Gratuit
Email (Gmail SMTP)     : Gratuit
─────────────────────────────────
TOTAL                  : 25€/mois
```

### Option 2 : GitHub Actions (Recommandé pour devs)
```
GitHub Actions         : Gratuit (2000 min/mois)
Notion                 : Gratuit
Email                  : Gratuit
─────────────────────────────────
TOTAL                  : 0€/mois
```

### Option 3 : N8N Self-hosted
```
VPS (DigitalOcean/Hetzner) : 5€/mois
Notion                     : Gratuit
Email                      : Gratuit
─────────────────────────────────
TOTAL                      : 5€/mois
```

---

## 🎨 Cas d'Usage

### E-commerce
```javascript
✅ Ajout au panier
✅ Début checkout
✅ Transaction (événement CRITIQUE)
✅ Vues produits
```

### SaaS / Plateforme
```javascript
✅ Inscription (événement CRITIQUE)
✅ Connexion
✅ Activation features
✅ Conversion trial → paid
```

### Site Contenu / Blog
```javascript
✅ Pages vues
✅ Scroll depth
✅ Newsletter signup
✅ Téléchargement ressources
```

### App Mobile (via WebView)
```javascript
✅ Onboarding steps
✅ In-app purchases
✅ Feature usage
```

---

## 🆘 Support & Aide

### Questions fréquentes

**Q : Ça marche avec mon Tag Manager (GTM, Tealium, etc.) ?**
R : Oui ! Tant qu'il y a un dataLayer ou des requêtes HTTP, ça marche.

**Q : Je peux tester des sites avec authentification ?**
R : Oui, ajoutez des étapes de login dans le script Playwright.

**Q : Ça fonctionne en production ?**
R : Oui, mais recommandé de tester sur un environnement de staging d'abord.

**Q : Et pour les apps mobiles natives ?**
R : Non, seulement pour le web. Pour les apps natives, regardez du côté d'Appium.

---

## 🤝 Contribution

Des améliorations à suggérer ? Des bugs à reporter ?

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -am 'Ajout feature'`)
4. Push (`git push origin feature/amelioration`)
5. Créez une Pull Request

---

## 📜 License

MIT License - Utilisez librement pour vos projets personnels et professionnels !

---

## 🎯 Prochaines Étapes

**Choisissez votre aventure :**

1. 🟢 **Je veux le setup le plus simple**
   → Suivez [DEPLOIEMENT_RAILWAY.md](DEPLOIEMENT_RAILWAY.md)

2. 🔵 **Je veux la solution gratuite**
   → Regardez l'option GitHub Actions dans [COMPARATIF_SOLUTIONS.md](COMPARATIF_SOLUTIONS.md)

3. 📚 **Je veux des exemples de tests**
   → Consultez [EXEMPLES_TESTS.md](EXEMPLES_TESTS.md)

4. 🎓 **Je veux tout comprendre en détail**
   → Lisez [GUIDE_INSTALLATION.md](GUIDE_INSTALLATION.md)

---

## 🌟 Créé avec

- [Playwright](https://playwright.dev/) - Automatisation browser
- [N8N](https://n8n.io/) - Workflow automation
- [Notion](https://notion.so/) - Plan de mesure
- [Railway](https://railway.app/) - Déploiement facile

---

**Fait avec ❤️ pour les équipes analytics qui en ont marre de tester manuellement !**

Des questions ? Besoin d'aide ? Ouvrez une issue ! 🚀
