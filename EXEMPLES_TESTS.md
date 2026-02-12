# 📚 Bibliothèque d'Exemples de Tests

## 🎯 Comment utiliser ces exemples

Copiez-collez ces configurations directement dans votre base Notion "Plan de Mesure".

---

## 1. 👀 Page Views (Vues de page)

### Page d'accueil simple
```
Événement: Page vue Accueil
Type: Page View
URL Test: https://votresite.com
Action utilisateur: [vide]
Nom dataLayer: page_view
Paramètres attendus:
{
  "page_location": "https://votresite.com",
  "page_title": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

### Page produit avec ID
```
Événement: Page vue Produit
Type: Page View
URL Test: https://votresite.com/produits/chaussures-running
Action utilisateur: [vide]
Nom dataLayer: page_view
Paramètres attendus:
{
  "page_location": "*chaussures-running*",
  "page_title": "*",
  "product_id": "SHOE-RUN-001"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
```

---

## 2. 🛒 E-commerce

### Ajout au panier
```
Événement: Ajout au panier
Type: E-commerce
URL Test: https://votresite.com/produit/laptop-pro
Action utilisateur: click:.btn-add-to-cart
Nom dataLayer: add_to_cart
Paramètres attendus:
{
  "currency": "EUR",
  "value": "*",
  "items": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
```

### Début de checkout
```
Événement: Début checkout
Type: E-commerce
URL Test: https://votresite.com/panier
Action utilisateur: click:#checkout-button
Nom dataLayer: begin_checkout
Paramètres attendus:
{
  "currency": "EUR",
  "value": "*",
  "items": "*",
  "coupon": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

### Transaction complétée
```
Événement: Achat confirmé
Type: E-commerce
URL Test: https://votresite.com/confirmation?order=TEST123
Action utilisateur: [vide]
Nom dataLayer: purchase
Paramètres attendus:
{
  "transaction_id": "TEST123",
  "currency": "EUR",
  "value": "*",
  "tax": "*",
  "shipping": "*",
  "items": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
Priorité: 🔴 Critique
```

---

## 3. 🖱️ Clics et Interactions

### Clic sur bouton CTA
```
Événement: Clic CTA Newsletter
Type: Click
URL Test: https://votresite.com
Action utilisateur: click:#subscribe-newsletter
Nom dataLayer: cta_click
Paramètres attendus:
{
  "cta_name": "newsletter_subscribe",
  "cta_location": "footer"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

### Clic sur lien externe
```
Événement: Clic lien social
Type: Click
URL Test: https://votresite.com
Action utilisateur: click:.social-facebook
Nom dataLayer: outbound_link
Paramètres attendus:
{
  "link_url": "*facebook.com*",
  "link_domain": "facebook.com"
}
GA4: ✅
Amplitude: ❌
Mixpanel: ❌
```

### Lecture vidéo
```
Événement: Lecture vidéo
Type: Click
URL Test: https://votresite.com/demo
Action utilisateur: click:.video-play-button
Nom dataLayer: video_start
Paramètres attendus:
{
  "video_title": "*",
  "video_duration": "*",
  "video_provider": "youtube"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
```

---

## 4. 📝 Formulaires

### Soumission formulaire contact
```
Événement: Formulaire Contact
Type: Form
URL Test: https://votresite.com/contact
Action utilisateur: type:#name:Test User
Nom dataLayer: form_submit
Paramètres attendus:
{
  "form_id": "contact_form",
  "form_name": "Contact",
  "form_destination": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

### Lead generation
```
Événement: Demande de devis
Type: Form
URL Test: https://votresite.com/devis
Action utilisateur: click:#submit-quote
Nom dataLayer: generate_lead
Paramètres attendus:
{
  "value": "*",
  "currency": "EUR",
  "lead_source": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
Priorité: 🔴 Critique
```

---

## 5. 🔍 Recherche

### Recherche interne
```
Événement: Recherche site
Type: Custom
URL Test: https://votresite.com/search?q=laptop
Action utilisateur: [vide]
Nom dataLayer: search
Paramètres attendus:
{
  "search_term": "laptop",
  "search_results": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

---

## 6. 👤 Utilisateur / Compte

### Inscription
```
Événement: Création compte
Type: Custom
URL Test: https://votresite.com/register/success
Action utilisateur: [vide]
Nom dataLayer: sign_up
Paramètres attendus:
{
  "method": "email",
  "user_id": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
Priorité: 🟠 Haute
```

### Connexion
```
Événement: Connexion utilisateur
Type: Custom
URL Test: https://votresite.com/dashboard
Action utilisateur: [vide]
Nom dataLayer: login
Paramètres attendus:
{
  "method": "email",
  "user_id": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ✅
```

---

## 7. 📱 Interactions avancées

### Scroll profondeur
```
Événement: Scroll 75%
Type: Custom
URL Test: https://votresite.com/blog/article-long
Action utilisateur: scroll
Nom dataLayer: scroll
Paramètres attendus:
{
  "percent_scrolled": "*",
  "page_location": "*blog*"
}
GA4: ✅
Amplitude: ❌
Mixpanel: ❌
```

### Téléchargement fichier
```
Événement: Téléchargement PDF
Type: Click
URL Test: https://votresite.com/resources
Action utilisateur: click:.download-catalog
Nom dataLayer: file_download
Paramètres attendus:
{
  "file_name": "*",
  "file_extension": "pdf",
  "link_url": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

---

## 8. 🎁 Promotions

### Affichage bannière promo
```
Événement: Impression promo
Type: Custom
URL Test: https://votresite.com
Action utilisateur: wait:3000
Nom dataLayer: view_promotion
Paramètres attendus:
{
  "promotion_id": "*",
  "promotion_name": "*",
  "creative_name": "*",
  "creative_slot": "*"
}
GA4: ✅
Amplitude: ❌
Mixpanel: ❌
```

### Clic promo
```
Événement: Clic bannière promo
Type: Click
URL Test: https://votresite.com
Action utilisateur: click:.promo-banner
Nom dataLayer: select_promotion
Paramètres attendus:
{
  "promotion_id": "*",
  "promotion_name": "*"
}
GA4: ✅
Amplitude: ✅
Mixpanel: ❌
```

---

## 🎨 Scénarios Multi-Étapes (Séquences)

Pour tester des parcours complets, vous pouvez créer plusieurs entrées dans Notion qui se suivent :

### Parcours E-commerce complet

**1. Page produit**
```
Événement: 1. Vue produit
URL Test: https://votresite.com/produit/laptop
Action utilisateur: [vide]
Nom dataLayer: view_item
```

**2. Ajout panier**
```
Événement: 2. Ajout panier
URL Test: https://votresite.com/produit/laptop
Action utilisateur: click:.add-to-cart
Nom dataLayer: add_to_cart
```

**3. Vue panier**
```
Événement: 3. Vue panier
URL Test: https://votresite.com/cart
Action utilisateur: [vide]
Nom dataLayer: view_cart
```

**4. Checkout**
```
Événement: 4. Début checkout
URL Test: https://votresite.com/cart
Action utilisateur: click:#checkout-btn
Nom dataLayer: begin_checkout
```

---

## 💡 Astuces Pro

### Utiliser les wildcards `*`
Quand vous ne connaissez pas la valeur exacte mais voulez juste vérifier la présence :
```json
{
  "user_id": "*",           // N'importe quelle valeur
  "page_title": "*",        // N'importe quel titre
  "value": "*"              // N'importe quel montant
}
```

### Valeurs partielles
Pour vérifier qu'une URL contient un mot :
```json
{
  "page_location": "*checkout*"  // URL contient "checkout"
}
```

### Actions multiples
Chaîner plusieurs actions avec des attentes :
```
Action: click:.accept-cookies
Action: wait:1000
Action: click:.add-to-cart
```

---

## 🚨 Tests Critiques à Prioriser

Marquez comme **🔴 Critique** dans Notion :
1. ✅ Transactions (purchase)
2. ✅ Leads (generate_lead, sign_up)
3. ✅ Ajout au panier
4. ✅ Début de checkout

Ces événements ont un impact business direct !

---

Besoin d'un exemple spécifique à votre cas d'usage ? Dites-moi ! 🎯
