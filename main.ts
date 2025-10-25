import { app, BrowserWindow } from 'electron';
import path from 'path';

// const isDev = true; // Forcer le mode dev pour tester
const isDev = process.env.NODE_ENV === 'development';
async function createWindow() {
  console.log('Mode dev ?', isDev);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow().catch(error => {
    console.error('Erreur dans createWindow:', error);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch(error => {
      console.error('Erreur dans createWindow (activate):', error);
    });
  }
});