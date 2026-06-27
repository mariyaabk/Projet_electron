const db = require('../services/db');

module.exports = function registerParametresIpc(ipcMain) {

  ipcMain.handle('parametres:get', () => {
    return db.getParametres();
  });

  ipcMain.handle('parametres:set', (_, cle, valeur) => {
    if (typeof cle !== 'string' || cle.length > 50) throw new Error('Clé invalide');
    return db.setParametre(cle, valeur);
  });

};
