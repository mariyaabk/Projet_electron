module.exports = function registerSystemeIpc(ipcMain, Notification) {

  ipcMain.handle('systeme:notify', (_, title, body) => {
    if (Notification.isSupported()) {
      new Notification({
        title: String(title).slice(0, 100),
        body:  String(body).slice(0, 200),
      }).show();
    }
    return { ok: true };
  });

};
