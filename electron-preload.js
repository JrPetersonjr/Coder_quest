// ============================================================
// ELECTRON PRELOAD SCRIPT
// Securely exposes Electron APIs to the renderer
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // API Key management (stored securely in user data folder)
  getApiKey: (provider) => ipcRenderer.invoke('get-api-key', provider),
  setApiKey: (provider, key) => ipcRenderer.invoke('set-api-key', provider, key),
  
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  checkUpdates: () => ipcRenderer.invoke('check-updates'),
  
  // Oracle pop-out window
  popoutOracle: () => ipcRenderer.invoke('popout-oracle'),
  dockOracle: () => ipcRenderer.invoke('dock-oracle'),
  isOraclePopout: () => ipcRenderer.invoke('is-oracle-popout'),
  sendToOracle: (data) => ipcRenderer.send('oracle-send', data),
  onOracleResponse: (callback) => ipcRenderer.on('oracle-response', (event, data) => callback(data)),
  onOracleDocked: (callback) => ipcRenderer.on('oracle-docked', () => callback()),
  
  // For Oracle window - receive from main
  onOracleReceive: (callback) => ipcRenderer.on('oracle-receive', (event, data) => callback(data)),
  sendOracleResponse: (data) => ipcRenderer.send('oracle-response', data),
  
  // Platform detection
  isElectron: true,
  platform: process.platform,
});

console.log('[Preload] Electron APIs exposed to renderer');
