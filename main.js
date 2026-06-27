/**
 * main.js — Le cerveau de l'application
 * Gère : création de fenêtre, menu natif, tray, instance unique, cycle de vie
 * Ne contient PAS de logique métier — tout est délégué aux services et IPC
 */

const { app, BrowserWindow, Menu, Tray, Notification, dialog, shell, ipcMain } = require('electron');
const path = require('path');

// ── Instance unique ──────────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) { app.quit(); process.exit(0); }

let mainWindow = null;
let tray = null;

// ── Enregistrement des IPC handlers ─────────────────────────────────────────
// On importe chaque domaine IPC séparément — propre et découpé
function registerAllIpc() {
  require('./ipc/produits.ipc')(ipcMain);
  require('./ipc/ventes.ipc')(ipcMain);
  require('./ipc/export.ipc')(ipcMain, dialog, shell, mainWindow);
  require('./ipc/parametres.ipc')(ipcMain);
  require('./ipc/systeme.ipc')(ipcMain, Notification);
}

// ── Création de la fenêtre principale ────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Épicerie Caisse',
    backgroundColor: '#0f1117',
    show: false, // évite le flash blanc au démarrage
    webPreferences: {
      // Sécurité Electron : les trois piliers obligatoires
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Affichage propre une fois le contenu chargé
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // DevTools uniquement en mode dev
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Sécurité : bloquer toute navigation externe
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Minimiser dans le tray au lieu de fermer
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

// ── Menu natif ───────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: 'Épicerie Caisse',
      submenu: [
        { label: 'À propos', role: 'about' },
        { type: 'separator' },
        { label: 'Quitter', accelerator: 'CmdOrCtrl+Q', click: () => { app.isQuitting = true; app.quit(); } },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Recharger', role: 'reload' },
        { type: 'separator' },
        { label: 'Zoom +', role: 'zoomIn' },
        { label: 'Zoom −', role: 'zoomOut' },
        { label: 'Taille réelle', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Plein écran', role: 'togglefullscreen' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Tray ─────────────────────────────────────────────────────────────────────
function createTray() {
  // En production utiliser un vrai .ico/.png — ici on se passe de l'icône
  // pour que le projet tourne sans assets
  try {
    const iconPath = path.join(__dirname, 'renderer', 'icon.png');
    const fs = require('fs');
    if (!fs.existsSync(iconPath)) return; // pas d'icône = pas de tray, pas de crash

    tray = new Tray(iconPath);
    tray.setToolTip('Épicerie Caisse');
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Ouvrir', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'Quitter', click: () => { app.isQuitting = true; app.quit(); } },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show());
  } catch (_) { /* tray optionnel */ }
}

// ── Démarrage ────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Initialiser la base de données avant tout (sql.js est async)
  const db = require('./services/db');
  await db.init(app.getPath('userData'));

  registerAllIpc();
  buildMenu();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    require('./services/db').close();
    app.quit();
  }
});

// Deuxième instance → focus sur la première
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});
