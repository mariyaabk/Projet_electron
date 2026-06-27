# 🛒 Épicerie Caisse

Logiciel de caisse desktop pour épicerie de quartier.  
Electron · SQLite · OpenFoodFacts · Bilingue FR/EN · Thème sombre/clair

---

## Installation & Lancement

### Prérequis
- **Node.js 18+** → https://nodejs.org

> Aucune dépendance native C++ — `sql.js` est 100% JavaScript.

### Lancer en développement

```bash
# 1. Dézipper et entrer dans le dossier
cd epicerie-v2

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm start

# Mode développement (DevTools ouverts)
npm run dev
```

### Créer l'installeur

```bash
# Windows → génère un .exe dans dist/
npm run build:win

# macOS → génère un .dmg
npm run build:mac

# Linux → génère un .AppImage
npm run build:linux
```

L'installeur Windows (NSIS) est **one-click** : double-clic → next → finish.  
Raccourci bureau et menu démarrer créés automatiquement.

### Tests

```bash
npm test
```

---

## Structure du projet

```
epicerie-v2/
├── main.js                   cerveau : fenêtre, menu, tray
├── preload.js                pont sécurisé contextBridge
├── services/
│   ├── db.js                 SQLite (sql.js) + toute la logique données
│   ├── openfoodfacts.js      API OpenFoodFacts + gestion hors-ligne
│   └── export.js             génération CSV et PDF
├── ipc/                      1 fichier par domaine métier
│   ├── produits.ipc.js
│   ├── ventes.ipc.js
│   ├── export.ipc.js
│   ├── parametres.ipc.js
│   └── systeme.ipc.js
├── renderer/
│   ├── index.html            point d'entrée + CSP stricte
│   ├── app.js                toute l'UI (vanilla JS, 4 pages)
│   └── style.css             thèmes sombre/clair
└── tests/
    ├── db.test.js
    ├── export.test.js
    └── openfoodfacts.test.js
```

---

## Captures d'écran

### Page Caisse

> Recherche produit, panier en temps réel, paiement espèces ou carte, notification système à chaque vente.

<img width="1897" height="1113" alt="image" src="https://github.com/user-attachments/assets/a1afcb79-f42c-4068-8e95-7c13e73b234f" />


<img width="571" height="235" alt="image" src="https://github.com/user-attachments/assets/b9fb2646-f996-48f8-b8a2-543d392e4db9" />



### Page Produits
> Catalogue complet, ajout avec lookup OpenFoodFacts par code-barres, modification, suppression.
<img width="1903" height="595" alt="image" src="https://github.com/user-attachments/assets/8675edcc-418d-4982-9105-09b19a1a9b49" />
<img width="838" height="691" alt="image" src="https://github.com/user-attachments/assets/30ce441e-29ed-405e-94e7-bc321b8cff53" />
<img width="840" height="676" alt="image" src="https://github.com/user-attachments/assets/94759a12-f4c4-4e5a-9884-c3a648ad270b" />
<img width="550" height="192" alt="image" src="https://github.com/user-attachments/assets/4ef2500f-766a-4f03-b615-b2ad90e8a45d" />




### Page Ventes
> Historique, résumé journalier (CA, panier moyen), export CSV et PDF, détail ticket par vente.
<img width="1873" height="1051" alt="image" src="https://github.com/user-attachments/assets/6968901c-eb44-4ddd-8f7b-59ac42ab14de" />


### Page Paramètres
> Langue FR/EN, thème sombre/clair, nom de la boutique — persistés en base.
<img width="1210" height="634" alt="image" src="https://github.com/user-attachments/assets/cd7302ab-aea4-41ec-bfe4-3e540c2d9b37" />

## Preuve du packaging
<img width="945" height="46" alt="image" src="https://github.com/user-attachments/assets/30afcd7e-136d-449f-9645-625cce5b380a" />


---

## Fonctionnalités

| Fonctionnalité | Détail |
|----------------|--------|
| Encaissement | Recherche produit, panier, quantités, total automatique |
| Paiement | Espèces ou carte, enregistré avec la vente |
| Catalogue | Ajout manuel ou via OpenFoodFacts (code-barres) |
| Hors-ligne | 100% fonctionnel sans internet |
| Historique | Par date, détail ticket, résumé journalier |
| Export CSV | Toutes les ventes avec articles, compatible Excel |
| Export PDF | Ticket de caisse ou rapport journalier |
| Bilingue | FR / EN, mémorisé entre les sessions |
| Thème | Sombre / Clair, mémorisé entre les sessions |
| Notifications | Notification OS native à chaque vente validée |
| Installeur | .exe one-click Windows (electron-builder NSIS) |
