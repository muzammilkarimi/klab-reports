import { contextBridge, ipcRenderer } from 'electron';

console.log('--- PRELOAD SCRIPT LOADED ---');
try {
  contextBridge.exposeInMainWorld('electron', {
    ping: () => ipcRenderer.invoke('ping'),
    printReport: (reportId, suggestedName) => ipcRenderer.invoke('print-to-pdf', reportId, suggestedName),
  });
  console.log('--- ELECTRON API EXPOSED ---');
} catch (e) {
  console.error('--- PRELOAD ERROR ---', e);
}
