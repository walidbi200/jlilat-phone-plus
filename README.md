# 📱 Jlilat Phone Plus - Gestion Professionnelle

Version 1.3 - Application de gestion offline moderne et élégante

## 🎯 Description

Jlilat Phone Plus est une application professionnelle, entièrement en français, pour gérer les produits, ventes de téléphones et réparations. Toutes les données sont stockées localement dans votre navigateur (IndexedDB) et ne nécessitent aucune connexion Internet ou serveur backend.

## ✨ Fonctionnalités

### 📦 Gestion des Produits
- Ajouter, modifier et supprimer des produits
- Suivi du stock en temps réel
- Alertes automatiques pour stock faible
- Catégorisation des produits
- Prix et seuils de stock personnalisables

### 💰 Gestion des Ventes
- Enregistrer des ventes avec plusieurs articles
- Mise à jour automatique du stock
- Historique complet des ventes
- Différentes méthodes de paiement (Espèces, Carte, Virement)
- Calcul automatique des totaux

### 📱 Gestion des Téléphones (NOUVEAU v1.3)
- Enregistrer les ventes de téléphones spécifiques
- Suivi des numéros de série (SN) et IMEI
- Gestion des garanties avec dates
- Impression de bons de garantie professionnels
- Historique complet des ventes de téléphones

### 🔧 Module de Réparations
- Suivi des réparations client
- États : En Attente, En Cours, Terminé
- Historique des réparations
- Coûts et détails des problèmes

### 💾 Sauvegarde et Restauration
- Export des données en JSON (produits, ventes, téléphones, réparations)
- Import pour restauration complète
- Protection contre la perte de données

## 🚀 Installation et Utilisation

### Prérequis
- Un navigateur moderne (Chrome, Firefox, Edge, Safari)
- Pas besoin de serveur ou de connexion Internet

### Démarrage Rapide

1. **Téléchargez tous les fichiers** dans un dossier
2. **Ouvrez `index.html`** dans votre navigateur
3. **C'est tout !** L'application est prête à l'emploi

### Structure des Fichiers
```
phoneplus/
├── index.html              # Page principale
├── print-template.html     # Template d'impression pour garanties
├── styles.css              # Styles de l'application
├── app.js                  # Application principale et navigation
├── storage.js              # Gestion du stockage local
├── products.js             # Gestion des produits
├── sales.js                # Gestion des ventes
├── phones.js               # Gestion des téléphones (NOUVEAU)
├── repairs.js              # Gestion des réparations
├── locale/
│   └── fr.js              # Traductions françaises
├── libs/
│   └── localforage.min.js # Bibliothèque de stockage
└── README.md              # Ce fichier
```

## 📖 Guide d'Utilisation

### Gestion des Produits

1. **Ajouter un produit**
   - Cliquez sur l'onglet "Produits"
   - Remplissez le formulaire à droite
   - Cliquez sur "Enregistrer"

2. **Modifier un produit**
   - Cliquez sur "Modifier" à côté du produit
   - Modifiez les informations
   - Cliquez sur "Enregistrer"

3. **Supprimer un produit**
   - Cliquez sur "Supprimer" à côté du produit
   - Confirmez la suppression

4. **Stock faible**
   - Les produits avec un stock inférieur ou égal au seuil sont surlignés en jaune

### Gestion des Ventes

1. **Créer une vente**
   - Cliquez sur l'onglet "Ventes"
   - Sélectionnez un produit et une quantité
   - Cliquez sur "Ajouter l'Article"
   - Répétez pour ajouter plus d'articles
   - Choisissez la méthode de paiement
   - Cliquez sur "Finaliser la Vente"

2. **Voir les détails d'une vente**
   - Cliquez sur "Voir" à côté de la vente

3. **Supprimer une vente**
   - Cliquez sur "Supprimer" à côté de la vente
   - ⚠️ Le stock ne sera pas restauré automatiquement

### Gestion des Téléphones

1. **Ajouter une vente de téléphone**
   - Cliquez sur l'onglet "Téléphones"
   - Remplissez les informations (date, client, SN, IMEI, prix, garantie)
   - Cliquez sur "Enregistrer"

2. **Imprimer un bon de garantie**
   - Cliquez sur "Imprimer Garantie" à côté de la vente
   - Une nouvelle fenêtre s'ouvre avec le bon formaté
   - Imprimez le document pour le client

3. **Modifier une vente de téléphone**
   - Cliquez sur "Modifier"
   - Modifiez les informations
   - Cliquez sur "Enregistrer"

4. **Supprimer une vente de téléphone**
   - Cliquez sur "Supprimer"
   - Confirmez la suppression

### Gestion des Réparations

1. **Ajouter une réparation**
   - Cliquez sur l'onglet "Réparations"
   - Remplissez les informations client et appareil
   - Sélectionnez le statut
   - Cliquez sur "Enregistrer"

2. **Mettre à jour le statut**
   - Cliquez sur "Modifier"
   - Changez le statut
   - Cliquez sur "Enregistrer"

### Sauvegarde et Restauration

1. **Exporter les données**
   - Cliquez sur l'onglet "Gestion des Données"
   - Cliquez sur "Télécharger la Sauvegarde"
   - Un fichier JSON sera téléchargé

2. **Importer les données**
   - Cliquez sur "Choisir un Fichier"
   - Sélectionnez votre fichier de sauvegarde JSON
   - Cliquez sur "Restaurer les Données"
   - ⚠️ Attention : Cela remplacera toutes vos données actuelles

## 💡 Conseils d'Utilisation

1. **Sauvegardez régulièrement** vos données via l'export JSON
2. **Stock faible** : Définissez des seuils appropriés pour être alerté à temps
3. **Ventes** : Vérifiez le stock disponible avant d'enregistrer une vente
4. **Catégories** : Utilisez des catégories cohérentes pour faciliter l'organisation
5. **Navigation** : Les données sont sauvegardées automatiquement à chaque action

## 🔧 Spécifications Techniques

- **Frontend uniquement** : HTML, CSS, JavaScript vanilla
- **Stockage** : IndexedDB via localForage
- **IDs uniques** : crypto.randomUUID()
- **Compatibilité** : Navigateurs modernes avec support IndexedDB
- **Taille** : ~50KB (hors bibliothèque)
- **Offline-first** : Fonctionne entièrement hors ligne

## ⚠️ Limitations

1. **Local uniquement** : Les données ne sont pas synchronisées entre appareils
2. **Navigateur unique** : Chaque navigateur a son propre stockage
3. **Nettoyage du navigateur** : Effacer les données du navigateur supprime les données
4. **Capacité** : Limitée par le quota IndexedDB du navigateur (généralement plusieurs MB)

## 🔒 Sécurité et Confidentialité

- ✅ Aucune donnée envoyée sur Internet
- ✅ Stockage local uniquement
- ✅ Pas de tracking ou analytics
- ✅ Pas de compte utilisateur requis
- ✅ Contrôle total sur vos données

## 🐛 Résolution de Problèmes

### Les données ne se sauvegardent pas
- Vérifiez que votre navigateur supporte IndexedDB
- Vérifiez que le stockage local n'est pas désactivé
- Essayez un autre navigateur

### Erreur lors de l'import
- Vérifiez que le fichier est un JSON valide
- Assurez-vous qu'il provient d'une exportation Jlilat Lite

### Stock non mis à jour après une vente
- Rafraîchissez la page
- Vérifiez la console du navigateur pour les erreurs

## 📝 Notes de Version

### v1.3.1 (26-10-2025) - Redesign Majeur
- **NOUVEAU**: Interface redessinée avec design moderne et professionnel
- **NOUVEAU**: Phosphor Icons - icônes modernes et cohérentes
- **NOUVEAU**: Police Inter - typographie professionnelle
- **NOUVEAU**: Nouveau favicon
- **NOUVEAU**: Palette de couleurs professionnelle
- **NOUVEAU**: Espacement amélioré et "breathing room"
- **NOUVEAU**: Animations et transitions fluides
- Rebranding: "Jlilat Lite" → "Jlilat Phone Plus"
- En-tête collant (sticky header) pour navigation facile
- Ombres et effets visuels améliorés
- Meilleure hiérarchie visuelle

### v1.3 (26-10-2025)
- **NOUVEAU**: Module de gestion des téléphones
- **NOUVEAU**: Impression de bons de garantie
- Suivi des numéros de série (SN) et IMEI
- Gestion des dates de garantie
- Export/import inclut maintenant les données téléphones
- Correction du bug de dropdown dans les ventes

### v1.2 (26-10-2025)
- Interface utilisateur en français
- Système de sauvegarde et restauration
- Module de réparations optionnel
- Alertes de stock faible
- Système de notifications
- Modal pour détails des ventes

## 👨‍💻 Auteur

Walid Bichri

## 📄 Licence

Utilisation libre pour projets personnels et commerciaux.

---

**💡 Astuce** : Ajoutez cette application à vos favoris pour un accès rapide !

