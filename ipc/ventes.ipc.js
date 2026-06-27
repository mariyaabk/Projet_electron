const db = require('../services/db');

module.exports = function registerVentesIpc(ipcMain) {

  ipcMain.handle('ventes:create', (_, data) => {
    if (!data?.articles?.length) throw new Error('Panier vide');
    const total = parseFloat(data.total);
    if (isNaN(total) || total < 0) throw new Error('Total invalide');
    return db.createVente(data);
  });

  ipcMain.handle('ventes:getAll', (_, filters) => {
    return db.getAllVentes(filters || {});
  });

  ipcMain.handle('ventes:getById', (_, id) => {
    if (!Number.isInteger(id) || id <= 0) return null;
    return db.getVenteById(id);
  });

  ipcMain.handle('ventes:getToday', () => {
    return db.getTodayVentes();
  });

  ipcMain.handle('ventes:getDailySummary', (_, date) => {
    return db.getDailySummary(date);
  });

};
