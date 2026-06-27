# Dossier de Conception — Épicerie Caisse

## 1. Analyse du besoin

La gérante d'une épicerie de quartier a besoin d'un logiciel de caisse desktop simple, robuste, et utilisable sans compétences techniques. Les contraintes principales sont :

- Fonctionne **hors-ligne** (internet instable)
- **Bilingue** FR/EN avec mémorisation du choix
- **Installeur simple** (pas de terminal pour l'utilisateur final)
- Enrichissement produit via **OpenFoodFacts** (code-barres)
- Export des données pour le **comptable** (CSV, PDF)

---

## 2. Modèle de données

```
┌─────────────────────────────────────────────────────┐
│  produits                                           │
│  id · barcode · nom · marque · categorie            │
│  prix · unite · image_url · off_data                │
│  cree_le · modifie_le                               │
└───────────────────┬─────────────────────────────────┘
                    │ 1─────────────────n
┌───────────────────▼─────────────────────────────────┐
│  vente_articles                                     │
│  id · vente_id · produit_id                         │
│  produit_nom* · produit_prix*   ← snapshots         │
│  quantite · sous_total                              │
└───────────────────┬─────────────────────────────────┘
                    │ n─────────────────1
┌───────────────────▼─────────────────────────────────┐
│  ventes                                             │
│  id · total · paiement · note · cree_le             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  parametres                                         │
│  cle · valeur                                       │
│  (langue, theme, nom_boutique)                      │
└─────────────────────────────────────────────────────┘
```

**Choix clé — snapshots prix/nom** : `produit_nom` et `produit_prix` sont copiés dans `vente_articles` au moment de la vente. Si la gérante modifie un prix demain, l'historique reste correct. C'est une règle comptable fondamentale.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  MAIN PROCESS (Node.js)                                         │
│                                                                 │
│  main.js          fenêtre, menu natif, tray, cycle de vie       │
│                                                                 │
│  services/        logique pure — ne connaît PAS Electron        │
│    db.js            SQLite via sql.js (100% JS)                 │
│    openfoodfacts.js API OFF + gestion hors-ligne                │
│    export.js        génération CSV et PDF                       │
│                                                                 │
│  ipc/             frontière Electron ↔ services                 │
│    produits.ipc.js  1 fichier par domaine métier                │
│    ventes.ipc.js                                                │
│    export.ipc.js                                                │
│    parametres.ipc.js                                            │
│    systeme.ipc.js                                               │
├───────────────────┬─────────────────────────────────────────────┤
│  preload.js       │ pont sécurisé — contextBridge               │
├───────────────────┴─────────────────────────────────────────────┤
│  RENDERER PROCESS (HTML/CSS/JS pur)                             │
│                                                                 │
│  renderer/index.html   point d'entrée + CSP stricte            │
│  renderer/app.js       routage + 4 pages (vanilla JS)          │
│  renderer/style.css    thèmes sombre/clair (CSS variables)     │
└─────────────────────────────────────────────────────────────────┘
```

**Principe central** : le renderer n'a **jamais** accès à Node.js directement. Tout passe par le `preload.js` via `contextBridge.exposeInMainWorld`. C'est la bonne pratique de sécurité Electron moderne.

---

## 4. Choix techniques justifiés

### Electron
Application desktop native Windows/Mac/Linux depuis une base web. Permet le menu natif, les notifications OS, le tray, et la distribution via installeur.

### sql.js (SQLite 100% JavaScript)
Choix délibéré plutôt qu'une solution native. `sql.js` compile SQLite en WebAssembly, `npm install` fonctionne directement sans outil de compilation. La base est chargée en mémoire au démarrage et persistée sur disque après chaque écriture.

### Vanilla JS (pas de React/Vue)
L'interface est simple (4 pages, pas de composants complexes). Un framework ajouterait du poids et de la complexité inutiles. Le routing est géré manuellement en ~10 lignes.

### Event Delegation
Tous les boutons dans le HTML généré dynamiquement utilisent des `data-action` + un seul `addEventListener` sur le conteneur parent. Évite les problèmes de listeners perdus lors du re-render.

### OpenFoodFacts — deux chemins séparés
- **Produit avec code-barres** → lookup OFF (timeout 8s) → succès ou fallback manuel
- **Produit sans code-barres** → formulaire manuel directement

Les deux logiques sont distinctes dans le code. L'erreur réseau (`.offline`) est différenciée de "produit introuvable".

### electron-builder (NSIS)
Génère un installeur `.exe` one-click pour Windows. L'utilisateur final double-clique, next/finish, raccourci bureau créé automatiquement. Aucun terminal requis.

---

## 5. Sécurité Electron

| Mesure | Détail |
|--------|--------|
| `contextIsolation: true` | Le renderer ne voit pas le contexte Node |
| `nodeIntegration: false` | Pas de `require()` dans le renderer |
| `sandbox: true` | Isolation maximale du renderer |
| CSP stricte | `default-src 'self'`, images OFF autorisées explicitement |
| Navigation bloquée | `will-navigate` + `setWindowOpenHandler` |
| Instance unique | `requestSingleInstanceLock` |
| Validation IPC | Chaque handler valide les entrées avant de déléguer |

---

## 6. Fonctionnement hors-ligne

100% des fonctionnalités core (encaissement, catalogue, historique, export) fonctionnent sans internet. Seul le lookup OpenFoodFacts nécessite une connexion — avec un message explicite et un fallback vers la saisie manuelle. Un indicateur visuel (point vert/rouge) informe en temps réel dans la sidebar.
