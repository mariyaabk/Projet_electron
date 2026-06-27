/**
 * ipc/export.ipc.js
 */
const exportService = require('../services/export');
const db = require('../services/db');

module.exports = function registerExportIpc(ipcMain, dialog, shell, mainWindow) {

  ipcMain.handle('export:csv', async (_, { data, filename }) => {
    console.log('[CSV] recu', data ? data.length : 'undefined', 'lignes');
    if (!data || data.length === 0) {
      console.log('[CSV] data vide, abandon');
      return { cancelled: true };
    }
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename || 'ventes.csv',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    });
    if (canceled || !filePath) return { cancelled: true };
    exportService.toCSV(data, filePath);
    shell.showItemInFolder(filePath);
    return { ok: true, filePath };
  });

  ipcMain.handle('export:pdf', async (_, { type, id, date, filename }) => {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename || 'export.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { cancelled: true };

    if (type === 'ticket') {
      const vente = db.getVenteById(id);
      if (!vente) throw new Error('Vente introuvable');
      exportService.ticketPDF(vente, filePath);
    } else if (type === 'rapport') {
      const rapport = db.getDailySummary(date);
      exportService.rapportPDF(rapport, filePath);
    }

    shell.showItemInFolder(filePath);
    return { ok: true, filePath };
  });

};
