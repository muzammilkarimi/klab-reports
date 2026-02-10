const { contextBridge, ipcRenderer } = require('electron');

console.log('--- PRELOAD CJS SCRIPT LOADED ---');

try {
  contextBridge.exposeInMainWorld('electron', {
    ping: () => ipcRenderer.invoke('ping'),
    printReport: (reportId) => ipcRenderer.invoke('print-to-pdf', reportId),
  });
  console.log('--- ELECTRON API EXPOSED (CJS) ---');
} catch (e) {
  console.error('--- PRELOAD CJS ERROR ---', e);
}
