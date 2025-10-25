"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    }
    else {
        var indexPath = path_1.default.join(__dirname, '../frontend/dist/index.html');
        console.log('Chargement du fichier :', indexPath);
        win.loadFile(indexPath);
    }
    win.webContents.openDevTools();
}
electron_1.app.whenReady().then(function () {
    electron_1.protocol.registerFileProtocol('file', function (request, callback) {
        var url = request.url.substr(7);
        callback({ path: decodeURIComponent(url) });
    });
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
