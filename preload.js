/**
 * preload.js — Le pont sécurisé
 * Seul fichier qui peut parler des deux côtés (main ↔ renderer).
 * Le renderer n'a AUCUN accès à Node.js en dehors de ce qui est exposé ici.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  // ── Produits ────────────────────────────────────────────────────────────
  produits: {
    getAll:        ()         => ipcRenderer.invoke('produits:getAll'),
    search:        (q)        => ipcRenderer.invoke('produits:search', q),
    getByBarcode:  (bc)       => ipcRenderer.invoke('produits:getByBarcode', bc),
    add:           (data)     => ipcRenderer.invoke('produits:add', data),
    update:        (id, data) => ipcRenderer.invoke('produits:update', id, data),
    delete:        (id)       => ipcRenderer.invoke('produits:delete', id),
    lookupOFF:     (bc)       => ipcRenderer.invoke('produits:lookupOFF', bc),
  },

  // ── Ventes ──────────────────────────────────────────────────────────────
  ventes: {
    create:          (data)    => ipcRenderer.invoke('ventes:create', data),
    getAll:          (filters) => ipcRenderer.invoke('ventes:getAll', filters),
    getById:         (id)      => ipcRenderer.invoke('ventes:getById', id),
    getToday:        ()        => ipcRenderer.invoke('ventes:getToday'),
    getDailySummary: (date)    => ipcRenderer.invoke('ventes:getDailySummary', date),
  },

  // ── Export ──────────────────────────────────────────────────────────────
  export: {
    csv: (payload) => ipcRenderer.invoke('export:csv', payload),
    pdf: (payload) => ipcRenderer.invoke('export:pdf', payload),
  },

  // ── Paramètres ──────────────────────────────────────────────────────────
  parametres: {
    get:    ()           => ipcRenderer.invoke('parametres:get'),
    set:    (key, value) => ipcRenderer.invoke('parametres:set', key, value),
  },

  // ── Système ─────────────────────────────────────────────────────────────
  systeme: {
    notify: (title, body) => ipcRenderer.invoke('systeme:notify', title, body),
  },

});
