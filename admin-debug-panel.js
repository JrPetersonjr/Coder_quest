// ============================================================
// ADMIN-DEBUG-PANEL.JS
// Secret admin panel for debug commands - Access via /admin33
// ============================================================

window.AdminDebugPanel = {
  
  state: {
    isOpen: false,
    isAuthenticated: false,
    logs: []
  },

  // Authentication and panel toggle
  authenticate(command) {
    if (command === "/admin33") {
      this.state.isAuthenticated = true;
      this.show();
      return true;
    }
    return false;
  },

  // Show the debug panel
  show() {
    if (this.state.isOpen) return;
    
    this.state.isOpen = true;
    this.createDebugPanel();
    this.logInfo("🔧 Admin Debug Panel Activated");
  },

  // Hide the debug panel
  hide() {
    const panel = document.getElementById('admin-debug-panel');
    if (panel) {
      panel.remove();
    }
    this.state.isOpen = false;
    this.logInfo("🔒 Admin Debug Panel Closed");
  },

  // Create the debug panel UI
  createDebugPanel() {
    // Remove any existing panel
    const existing = document.getElementById('admin-debug-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'admin-debug-panel';
    panel.innerHTML = `
      <div class="admin-overlay">
        <div class="admin-modal">
          <div class="admin-header">
            <h2>🔧 ADMIN DEBUG PANEL</h2>
            <div class="admin-auth-info">
              <span>🔐 Authenticated Admin</span>
              <button class="admin-close" onclick="AdminDebugPanel.hide()">✖</button>
            </div>
          </div>
          
          <div class="admin-content">
            <!-- Debug Commands Section -->
            <div class="admin-section">
              <h3>🎯 Debug Commands</h3>
              <div class="admin-buttons">
                <button onclick="AdminDebugPanel.executeDebug('syscheck')" class="debug-btn">
                  🔧 System Check
                </button>
                <button onclick="AdminDebugPanel.executeDebug('debug-graphics')" class="debug-btn">
                  📺 Force Graphics
                </button>
                <button onclick="AdminDebugPanel.executeDebug('debug-ai')" class="debug-btn">
                  🤖 Test AI Backend
                </button>
                <button onclick="AdminDebugPanel.executeDebug('test music')" class="debug-btn">
                  🎵 Test Music System
                </button>
              </div>
            </div>

            <!-- System Tests Section -->
            <div class="admin-section">
              <h3>🧪 System Tests</h3>
              <div class="admin-buttons">
                <button onclick="AdminDebugPanel.executeTest('ai')" class="test-btn">
                  🔮 AI Systems
                </button>
                <button onclick="AdminDebugPanel.executeTest('audio')" class="test-btn">
                  🔊 Audio Systems
                </button>
                <button onclick="AdminDebugPanel.executeTest('ui')" class="test-btn">
                  🖥️ UI Systems
                </button>
                <button onclick="AdminDebugPanel.executeTest('integration')" class="test-btn">
                  ⚙️ Integration Test
                </button>
              </div>
            </div>

            <!-- Developer Tools Section -->
            <div class="admin-section">
              <h3>⚡ Developer Tools</h3>
              <div class="admin-buttons">
                <button onclick="AdminDebugPanel.devTool('console')" class="dev-btn">
                  📝 Browser Console
                </button>
                <button onclick="AdminDebugPanel.devTool('reload')" class="dev-btn">
                  🔄 Force Reload
                </button>
                <button onclick="AdminDebugPanel.devTool('clear')" class="dev-btn">
                  🧹 Clear Storage
                </button>
                <button onclick="AdminDebugPanel.devTool('export')" class="dev-btn">
                  💾 Export State
                </button>
              </div>
            </div>

            <!-- Quick Commands Section -->
            <div class="admin-section">
              <h3>⚡ Quick Commands</h3>
              <div class="admin-input-group">
                <input type="text" id="admin-command-input" placeholder="Enter command..." />
                <button onclick="AdminDebugPanel.executeCustom()" class="execute-btn">Execute</button>
              </div>
            </div>
          </div>

          <!-- Debug Log Section -->
          <div class="admin-log-section">
            <h3>📋 Debug Log</h3>
            <div id="admin-debug-log" class="admin-log">
              <div class="log-entry">🔧 Debug panel initialized</div>
            </div>
            <div class="log-controls">
              <button onclick="AdminDebugPanel.clearLog()" class="clear-btn">Clear Log</button>
              <button onclick="AdminDebugPanel.exportLog()" class="export-btn">Export Log</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .admin-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        font-family: 'Courier Prime', monospace;
      }
      
      .admin-modal {
        background: linear-gradient(135deg, #001a00, #003300);
        border: 3px solid #ff6600;
        border-radius: 10px;
        width: 95%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 0 50px rgba(255, 102, 0, 0.5);
        color: #ff6600;
      }
      
      .admin-header {
        padding: 20px;
        border-bottom: 2px solid #ff6600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #002200;
      }
      
      .admin-header h2 {
        margin: 0;
        color: #ff6600;
        text-shadow: 0 0 10px #ff6600;
      }
      
      .admin-auth-info {
        display: flex;
        align-items: center;
        gap: 15px;
        color: #ffaa00;
        font-size: 0.9em;
      }
      
      .admin-close {
        background: #660000;
        border: 1px solid #ff6600;
        color: #ff6600;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
      }
      
      .admin-close:hover {
        background: #880000;
        box-shadow: 0 0 10px #ff6600;
      }
      
      .admin-content {
        padding: 20px;
      }
      
      .admin-section {
        margin-bottom: 25px;
        border: 1px solid #ff6600;
        border-radius: 5px;
        padding: 15px;
        background: rgba(0, 20, 0, 0.3);
      }
      
      .admin-section h3 {
        margin: 0 0 15px 0;
        color: #ffaa00;
        border-bottom: 1px solid #ff6600;
        padding-bottom: 5px;
      }
      
      .admin-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
      }
      
      .debug-btn, .test-btn, .dev-btn {
        background: #003300;
        border: 1px solid #ff6600;
        color: #ff6600;
        padding: 12px 16px;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9em;
        transition: all 0.3s ease;
      }
      
      .debug-btn:hover {
        background: #004400;
        box-shadow: 0 0 15px rgba(255, 102, 0, 0.3);
        transform: translateY(-2px);
      }
      
      .test-btn {
        background: #002a44;
        border-color: #0088ff;
        color: #0088ff;
      }
      
      .test-btn:hover {
        background: #003366;
        box-shadow: 0 0 15px rgba(0, 136, 255, 0.3);
      }
      
      .dev-btn {
        background: #440033;
        border-color: #ff00aa;
        color: #ff00aa;
      }
      
      .dev-btn:hover {
        background: #550044;
        box-shadow: 0 0 15px rgba(255, 0, 170, 0.3);
      }
      
      .admin-input-group {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      #admin-command-input {
        flex: 1;
        background: #002200;
        border: 1px solid #ff6600;
        color: #ff6600;
        padding: 10px;
        border-radius: 4px;
        font-family: inherit;
      }
      
      .execute-btn {
        background: #006600;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
      }
      
      .execute-btn:hover {
        background: #008800;
        box-shadow: 0 0 10px #00ff00;
      }
      
      .admin-log-section {
        border-top: 2px solid #ff6600;
        background: #001100;
        padding: 15px;
      }
      
      .admin-log-section h3 {
        margin: 0 0 10px 0;
        color: #ffaa00;
      }
      
      .admin-log {
        background: #000800;
        border: 1px solid #ff6600;
        height: 200px;
        overflow-y: auto;
        padding: 10px;
        font-family: 'Courier New', monospace;
        font-size: 0.85em;
      }
      
      .log-entry {
        margin: 2px 0;
        color: #00ff88;
      }
      
      .log-entry.error {
        color: #ff4444;
      }
      
      .log-entry.warning {
        color: #ffaa00;
      }
      
      .log-controls {
        margin-top: 10px;
        display: flex;
        gap: 10px;
      }
      
      .clear-btn, .export-btn {
        background: #330000;
        border: 1px solid #ff6600;
        color: #ff6600;
        padding: 6px 12px;
        cursor: pointer;
        border-radius: 3px;
        font-family: inherit;
        font-size: 0.8em;
      }
      
      .clear-btn:hover, .export-btn:hover {
        background: #550000;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    // Setup enter key for command input
    document.getElementById('admin-command-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.executeCustom();
      }
    });
  },

  // Execute debug commands
  executeDebug(command) {
    this.logInfo(`🔧 Executing debug command: ${command}`);
    
    try {
      if (window.gameEngine && typeof window.gameEngine.parseCommand === 'function') {
        window.gameEngine.parseCommand(command);
        this.logInfo(`✅ Command executed: ${command}`);
      } else {
        this.logError(`❌ GameEngine not available for command: ${command}`);
      }
    } catch (error) {
      this.logError(`❌ Error executing ${command}: ${error.message}`);
    }
  },

  // Execute system tests
  executeTest(system) {
    this.logInfo(`🧪 Running ${system} system test...`);
    
    switch (system) {
      case 'ai':
        this.testAISystems();
        break;
      case 'audio':
        this.testAudioSystems();
        break;
      case 'ui':
        this.testUISystems();
        break;
      case 'integration':
        this.testIntegration();
        break;
    }
  },

  // Test AI systems
  testAISystems() {
    const results = [];
    results.push(`AIConfig: ${window.AIConfig ? "✅" : "❌"}`);
    results.push(`AIDMIntegration: ${window.AIDMIntegration ? "✅" : "❌"}`);
    results.push(`BrowserLLM: ${window.BrowserLLM ? "✅" : "❌"}`);
    results.push(`AI Wizard: ${window.AIConnectionWizard ? "✅" : "❌"}`);
    
    results.forEach(result => this.logInfo(`🤖 ${result}`));
  },

  // Test audio systems
  testAudioSystems() {
    const results = [];
    results.push(`MIDIPlayer: ${window.MIDIPlayer ? "✅" : "❌"}`);
    results.push(`FXSystem: ${window.FXSystem ? "✅" : "❌"}`);
    results.push(`SpeechSynthesis: ${'speechSynthesis' in window ? "✅" : "❌"}`);
    
    results.forEach(result => this.logInfo(`🔊 ${result}`));
    
    // Test music playback if available
    if (window.MIDIPlayer && window.MIDIPlayer.playTheme) {
      try {
        window.MIDIPlayer.playTheme('menu');
        this.logInfo(`🎵 Music test: Theme played successfully`);
        setTimeout(() => {
          if (window.MIDIPlayer.stop) window.MIDIPlayer.stop();
        }, 1000);
      } catch (e) {
        this.logError(`🎵 Music test failed: ${e.message}`);
      }
    }
  },

  // Test UI systems
  testUISystems() {
    const results = [];
    results.push(`CastConsoleUI: ${window.CastConsoleUI ? "✅" : "❌"}`);
    results.push(`PaneManager: ${window.PaneManager ? "✅" : "❌"}`);
    results.push(`UILayoutManager: ${window.UILayoutManager ? "✅" : "❌"}`);
    
    results.forEach(result => this.logInfo(`🖥️ ${result}`));
  },

  // Test integration
  testIntegration() {
    this.logInfo(`⚙️ Running integration tests...`);
    
    if (window.gameEngine) {
      this.logInfo(`✅ GameEngine active`);
      this.logInfo(`📊 HP: ${window.gameEngine.gameState.hp}/${window.gameEngine.gameState.maxHp}`);
      this.logInfo(`⚡ MP: ${window.gameEngine.gameState.mp}/${window.gameEngine.gameState.maxMp}`);
      this.logInfo(`🎯 Level: ${window.gameEngine.gameState.level}`);
    } else {
      this.logError(`❌ GameEngine not available`);
    }
  },

  // Developer tools
  devTool(tool) {
    this.logInfo(`⚡ Running dev tool: ${tool}`);
    
    switch (tool) {
      case 'console':
        this.logInfo(`📝 Opening browser console...`);
        // Focus on console (browser dependent)
        if (window.console && console.clear) {
          console.log("%cADMIN DEBUG MODE ACTIVE", "color: #ff6600; font-size: 20px; font-weight: bold;");
          console.log("GameEngine:", window.gameEngine);
          console.log("Available systems:", {
            CommandParser: window.CommandParser,
            MIDIPlayer: window.MIDIPlayer,
            AIConfig: window.AIConfig
          });
        }
        break;
        
      case 'reload':
        this.logInfo(`🔄 Force reloading page...`);
        setTimeout(() => location.reload(true), 1000);
        break;
        
      case 'clear':
        this.logInfo(`🧹 Clearing localStorage...`);
        localStorage.clear();
        this.logInfo(`✅ Storage cleared`);
        break;
        
      case 'export':
        this.exportGameState();
        break;
    }
  },

  // Execute custom command
  executeCustom() {
    const input = document.getElementById('admin-command-input');
    const command = input.value.trim();
    
    if (!command) return;
    
    this.logInfo(`⚡ Custom command: ${command}`);
    
    try {
      if (window.gameEngine && typeof window.gameEngine.parseCommand === 'function') {
        window.gameEngine.parseCommand(command);
        this.logInfo(`✅ Custom command executed`);
      } else {
        this.logError(`❌ Cannot execute custom command - GameEngine unavailable`);
      }
    } catch (error) {
      this.logError(`❌ Custom command error: ${error.message}`);
    }
    
    input.value = '';
  },

  // Export game state
  exportGameState() {
    try {
      const state = {
        gameState: window.gameEngine?.gameState,
        timestamp: new Date().toISOString(),
        systems: {
          CommandParser: !!window.CommandParser,
          MIDIPlayer: !!window.MIDIPlayer,
          AIConfig: !!window.AIConfig
        }
      };
      
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coder-quest-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.logInfo(`💾 Game state exported`);
    } catch (error) {
      this.logError(`❌ Export failed: ${error.message}`);
    }
  },

  // Logging functions
  logInfo(message) {
    this.addLogEntry(message, 'info');
  },

  logError(message) {
    this.addLogEntry(message, 'error');
  },

  logWarning(message) {
    this.addLogEntry(message, 'warning');
  },

  addLogEntry(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    
    this.state.logs.push({ message: entry, type, timestamp });
    
    const logElement = document.getElementById('admin-debug-log');
    if (logElement) {
      const logDiv = document.createElement('div');
      logDiv.className = `log-entry ${type}`;
      logDiv.textContent = entry;
      logElement.appendChild(logDiv);
      logElement.scrollTop = logElement.scrollHeight;
    }
    
    // Also log to console for debugging
    console.log(`[Admin] ${message}`);
  },

  // Clear debug log
  clearLog() {
    this.state.logs = [];
    const logElement = document.getElementById('admin-debug-log');
    if (logElement) {
      logElement.innerHTML = '<div class="log-entry">🧹 Log cleared</div>';
    }
  },

  // Export debug log
  exportLog() {
    const logText = this.state.logs.map(entry => entry.message).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.logInfo(`📋 Debug log exported`);
  }
};

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Admin] Debug panel system loaded. Access via /admin33');
});