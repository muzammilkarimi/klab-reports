import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess; // Keep global for `will-quit` handler

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  console.log('Preload Path:', path.join(__dirname, 'preload.cjs'));

  // Determine correct URL
  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  console.log(`Loading URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  // Open DevTools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// PDF Generation Handler
ipcMain.handle('print-to-pdf', async (event, reportId, suggestedName) => {
  console.log('=== PRINT-TO-PDF HANDLER CALLED ===');
  console.log('Report ID:', reportId);
  
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  const isDev = !app.isPackaged;
  const baseUrl = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  const printUrl = isDev 
    ? `${baseUrl}/#/print-report/${reportId}` 
    : `${baseUrl}#/print-report/${reportId}`;
    
  console.log(`Loading Print URL: ${printUrl}`);

  try {
    await win.loadURL(printUrl);
    console.log('URL loaded successfully');
  } catch (error) {
    console.error('Failed to load URL:', error);
    win.close();
    return { success: false, error: 'Failed to load report page' };
  }

  // Add timeout to prevent infinite hanging
  return new Promise((resolve, reject) => {
    // Give the page time to fully render (React + API calls + rendering)
    // We use a fixed delay since did-finish-load doesn't work reliably with React
    console.log('Waiting 3 seconds for page to render...');
    
    setTimeout(async () => {
      console.log('Page should be ready, generating PDF...');
      
      try {
        const pdfData = await win.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        console.log('PDF generated, showing save dialog...');
        
        const { filePath, canceled } = await dialog.showSaveDialog({
          title: 'Save Report',
          defaultPath: suggestedName ? `${suggestedName}.pdf` : `Report_${reportId}.pdf`,
          filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });

        if (canceled || !filePath) {
          console.log('Save dialog cancelled');
          win.close();
          resolve({ success: false, error: 'Cancelled' });
          return;
        }

        fs.writeFileSync(filePath, pdfData);
        console.log('PDF saved to:', filePath);
        
        shell.openPath(filePath);
        win.close();
        resolve({ success: true, filePath });
      } catch (error) {
        console.error('PDF Generation Error:', error);
        win.close();
        resolve({ success: false, error: error.message });
      }
    }, 3000); // 3 second delay to let React render
  });
});

app.whenReady().then(() => {
  // Start Backend
  const isDev = !app.isPackaged;
  const backendPath = isDev 
    ? path.join(__dirname, '../backend/server.js')
    : path.join(process.resourcesPath, 'app.asar.unpacked/backend/server.js');
    
  const BACKEND_PORT = 5000;
  backendProcess = fork(backendPath, [], {
    env: { 
      ...process.env, 
      PORT: BACKEND_PORT,
      NODE_ENV: isDev ? 'development' : 'production',
      USER_DATA_PATH: app.getPath('userData')
    }
  });

  console.log('Backend started with path:', backendPath);
  console.log('Backend PID:', backendProcess.pid);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('will-quit', () => {
    if (backendProcess) {
      backendProcess.kill();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
