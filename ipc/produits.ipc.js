const db  = require('../services/db');
const off = require('../services/openfoodfacts');

module.exports = function registerProduitsIpc(ipcMain) {

  ipcMain.handle('produits:getAll', () => {
    return db.getAllProduits();
  });

  ipcMain.handle('produits:search', (_, query) => {
    if (typeof query !== 'string') return [];
    return db.searchProduits(query.slice(0, 100)); // limiter la taille
  });

  ipcMain.handle('produits:getByBarcode', (_, barcode) => {
    if (!barcode) return null;
    return db.getProduitByBarcode(String(barcode));
  });

  ipcMain.handle('produits:add', (_, data) => {
    if (!data?.nom || typeof data.nom !== 'string') {
      throw new Error('Le nom du produit est requis');
    }
    const prix = parseFloat(data.prix);
    if (isNaN(prix) || prix < 0) throw new Error('Prix invalide');
    return db.addProduit(data);
  });

  ipcMain.handle('produits:update', (_, id, data) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error('ID invalide');
    return db.updateProduit(id, data);
  });

  ipcMain.handle('produits:delete', (_, id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error('ID invalide');
    return db.deleteProduit(id);
  });

  ipcMain.handle('produits:lookupOFF', async (_, barcode) => {
    try {
      const data = await off.lookup(barcode);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, message: err.message, offline: !!err.offline };
    }
  });

};
