// ============================================================
// ELECTRON MAIN PROCESS
// Makes TECHNOMANCER a downloadable desktop app
// 
// Benefits:
// - No CORS issues (direct Claude API calls work)
// - No hosting costs
// - Works offline (except AI features need internet)
// - Can auto-update from GitHub releases
// - Pop-out Oracle window for second monitor
// - Voice input support
// ============================================================

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep global references of window objects
let mainWindow;
let oracleWindow = null;

// Development mode check
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'favicon.ico'),
    title: 'TECHNOMANCER: Quest for the Code',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js'),
      // Allow loading local files
      webSecurity: true,
    },
    // Frameless for custom title bar (optional)
    // frame: false,
    // titleBarStyle: 'hidden',
  });

  // Load the game
  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================================
// APP LIFECYCLE
// ============================================================

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================================
// IPC HANDLERS - Secure API key storage
// ============================================================

// Get stored API key (from local config file)
ipcMain.handle('get-api-key', async (event, provider) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.apiKeys?.[provider] || null;
    }
  } catch (e) {
    console.error('Failed to read API key:', e);
  }
  return null;
});

// Store API key securely in user data folder
ipcMain.handle('set-api-key', async (event, provider, key) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    if (!config.apiKeys) config.apiKeys = {};
    config.apiKeys[provider] = key;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to save API key:', e);
    return false;
  }
});

// Get app version
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Check for updates (simple version check against GitHub)
ipcMain.handle('check-updates', async () => {
  try {
    const response = await fetch('https://api.github.com/repos/JrPetersonjr/Coder_quest/releases/latest');
    const release = await response.json();
    const latestVersion = release.tag_name?.replace('v', '');
    const currentVersion = app.getVersion();
    
    return {
      hasUpdate: latestVersion > currentVersion,
      latestVersion,
      currentVersion,
      downloadUrl: release.assets?.[0]?.browser_download_url
    };
  } catch (e) {
    return { hasUpdate: false, error: e.message };
  }
});

// ============================================================
// POP-OUT ORACLE WINDOW
// ============================================================

// Create pop-out Oracle window
ipcMain.handle('popout-oracle', async (event) => {
  if (oracleWindow) {
    // If already open, focus it
    oracleWindow.focus();
    return { success: true, action: 'focused' };
  }

  oracleWindow = new BrowserWindow({
    width: 500,
    height: 650,
    minWidth: 400,
    minHeight: 500,
    icon: path.join(__dirname, 'favicon.ico'),
    title: '✦ ORACLE ✦',
    backgroundColor: '#0a0512',
    alwaysOnTop: true,  // Float above other windows
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js'),
    },
  });

  // Load the oracle page
  oracleWindow.loadFile('oracle-popout.html');

  // Handle close
  oracleWindow.on('closed', () => {
    oracleWindow = null;
    // Notify main window that oracle was docked
    if (mainWindow) {
      mainWindow.webContents.send('oracle-docked');
    }
  });

  return { success: true, action: 'opened' };
});

// Close/dock the Oracle window
ipcMain.handle('dock-oracle', async () => {
  if (oracleWindow) {
    oracleWindow.close();
    oracleWindow = null;
  }
  return { success: true };
});

// Send message from main window to Oracle
ipcMain.on('oracle-send', (event, data) => {
  if (oracleWindow) {
    oracleWindow.webContents.send('oracle-receive', data);
  }
});

// Send response from Oracle back to main window
ipcMain.on('oracle-response', (event, data) => {
  if (mainWindow) {
    mainWindow.webContents.send('oracle-response', data);
  }
});

// Check if Oracle is popped out
ipcMain.handle('is-oracle-popout', () => {
  return oracleWindow !== null;
});

console.log('[Electron] TECHNOMANCER Desktop App Started');
