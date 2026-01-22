// ============================================================
// UI-LAYOUT-MANAGER.JS
// Position windows for Ancient Terminals and 2D Engine
//
// PURPOSE:
//   - Create Ancient Terminals window (top-left)
//   - Create 2D Engine viewport (bottom-right)
//   - Gate 2D Engine visibility on quest completion
//   - Manage window positioning and sizing
// ============================================================

window.UILayoutManager = {

  // ============================================================
  // [STATE]
  // ============================================================
  gameEngine: null,
  graphicsEnabled: false,
  terminalWindowId: null,
  engineWindowId: null,
  crystalBallWindowId: null,

  // ============================================================
  // [INIT]
  // ============================================================
  initialize: function(gameEngine) {
    console.log("[UILayoutManager] Initializing");
    
    this.gameEngine = gameEngine;
    
    // DON'T create Ancient Terminals window by default
    // It will be shown only when player accesses a terminal
    // this.createAncientTerminalsWindow();
    
    // Create Character Status Panel (only if not using docked stats panel)
    if (window.CharacterStatusPanel && !(window.PaneManager && document.querySelector('.stats-panel'))) {
      CharacterStatusPanel.initialize(gameEngine);
    }
    
    // Create 2D Engine window (initially hidden)
    this.createEngineWindow();
    
    // Create Crystal Ball Oracle window (initially hidden)
    this.createCrystalBallWindow();
    
    // Check if graphics should be unlocked
    if (gameEngine.gameState.graphicsUnlocked) {
      this.unlockGraphics();
    }
    
    console.log("[UILayoutManager] Ready");
  },
  
  // Show Ancient Terminals window (called when player uses 'terminal' command)
  showTerminalsWindow: function() {
    if (!this.terminalWindowId) {
      this.createAncientTerminalsWindow();
    } else {
      const pane = document.getElementById(this.terminalWindowId);
      if (pane) pane.style.display = 'flex';
    }
  },
  
  // Show Crystal Ball window
  showCrystalBallWindow: function() {
    if (!this.crystalBallWindowId) {
      this.createCrystalBallWindow();
    } else {
      const pane = document.getElementById(this.crystalBallWindowId);
      if (pane) pane.style.display = 'flex';
    }
  },
  
  // Hide Crystal Ball window
  hideCrystalBallWindow: function() {
    if (this.crystalBallWindowId) {
      const pane = document.getElementById(this.crystalBallWindowId);
      if (pane) pane.style.display = 'none';
    }
  },

  // Hide Ancient Terminals window
  hideTerminalsWindow: function() {
    if (this.terminalWindowId) {
      const pane = document.getElementById(this.terminalWindowId);
      if (pane) pane.style.display = 'none';
    }
  },

  // ============================================================
  // [ANCIENT TERMINALS] - Top-left corner window
  // ============================================================
  createAncientTerminalsWindow: function() {
    if (!window.PaneManager) {
      console.warn("[UILayoutManager] PaneManager not available");
      return;
    }

    const content = document.createElement("div");
    content.id = "ancient-terminals-content";
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #000;
      color: #00ff00;
      font-family: 'Courier Prime', monospace;
      padding: 8px;
      font-size: 0.85em;
    `;

    // Terminal list
    const terminalList = document.createElement("div");
    terminalList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      border: 1px solid #00ff00;
      padding: 8px;
      background: #0a0a0a;
      margin-bottom: 8px;
    `;

    terminalList.innerHTML = `
      <div style="color: #88ff00; font-weight: bold; margin-bottom: 8px;">[ACCESSIBLE TERMINALS]</div>
      <div style="margin-bottom: 6px;">
        <button style="
          background: #000;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 4px 8px;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: monospace;
        " onclick="if(window.AncientTerminal) AncientTerminal.open('security.term')">
          &gt; security.term [HACKING CHALLENGE]
        </button>
      </div>
      <div style="margin-bottom: 6px;">
        <button style="
          background: #000;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 4px 8px;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: monospace;
        " onclick="if(window.AncientTerminal) AncientTerminal.open('mainframe.term')">
          &gt; mainframe.term [DECRYPTION]
        </button>
      </div>
      <div style="margin-bottom: 6px;">
        <button style="
          background: #000;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 4px 8px;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: monospace;
        " onclick="if(window.AncientTerminal) AncientTerminal.open('archivist.term')">
          &gt; archivist.term [LORE SEARCH]
        </button>
      </div>
    `;

    content.appendChild(terminalList);

    // Create window in top-left
    PaneManager.createPane({
      id: "ancient-terminals",
      title: "⬢ ANCIENT TERMINALS ⬢",
      x: 20,
      y: 20,
      width: 300,
      height: 280,
      minimizable: true,
      closeable: false,
      content: content
    });

    this.terminalWindowId = "ancient-terminals";
    console.log("[UILayoutManager] Ancient Terminals window created");
  },

  // ============================================================
  // [CRYSTAL BALL] - Mystical Oracle window
  // ============================================================
  createCrystalBallWindow: function() {
    if (!window.PaneManager) {
      console.warn("[UILayoutManager] PaneManager not available");
      return;
    }

    const content = document.createElement("div");
    content.id = "crystal-ball-content";
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(135deg, #0a0512, #1a0a2a);
      border: 2px solid #c9a227;
      border-radius: 8px;
      padding: 12px;
      font-family: 'Courier Prime', monospace;
      position: relative;
      overflow: hidden;
    `;

    // Add mystical background effect
    content.innerHTML = `
      <!-- Oracle header -->
      <div style="
        color: #c9a227;
        font-size: 1.1em;
        font-weight: bold;
        text-shadow: 0 0 12px rgba(201, 162, 39, 0.8), 0 0 20px rgba(138, 43, 226, 0.5);
        letter-spacing: 3px;
        text-align: center;
        text-transform: uppercase;
        margin-bottom: 12px;
      ">✦ ORACLE OF THE CODE ✦</div>

      <!-- Crystal ball display area -->
      <div id="crystal-ball-display" style="
        flex: 1;
        background: radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(200, 180, 255, 0.6) 30%, rgba(80, 40, 120, 0.4) 60%, transparent 75%);
        border: 3px solid rgba(201, 162, 39, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        min-height: 140px;
        margin: 8px auto;
        max-width: 180px;
        box-shadow: inset 0 0 50px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(201, 162, 39, 0.4);
        aspect-ratio: 1 / 1;
      ">
        <div id="crystal-ball-content" style="
          text-align: center;
          color: #c8d8ff;
          font-size: 0.85em;
          font-style: italic;
          padding: 16px;
          text-shadow: 0 0 12px rgba(100, 140, 200, 0.7), 0 0 4px rgba(255, 255, 255, 0.4);
          z-index: 10;
          position: relative;
        ">
          Ready to divine the mysteries...
        </div>
      </div>

      <!-- Input controls -->
      <div style="margin-top: 8px;">
        <input type="text" id="crystal-ball-input" placeholder="Ask the Oracle..." style="
          width: 100%;
          background: rgba(10, 5, 20, 0.95);
          border: 1px solid rgba(201, 162, 39, 0.5);
          color: #e8d5a3;
          font-family: 'Courier Prime', monospace;
          font-size: 0.85em;
          padding: 6px;
          text-shadow: 0 0 8px rgba(201, 162, 39, 0.4);
          border-radius: 4px;
          margin-bottom: 6px;
        " />
        <button id="crystal-ball-btn" style="
          width: 100%;
          padding: 6px 12px;
          font-size: 0.8em;
          background: linear-gradient(135deg, #c9a227 0%, #8b6914 100%);
          border: none;
          color: #0a0512;
          cursor: pointer;
          font-weight: bold;
          border-radius: 4px;
          font-family: 'Courier Prime', monospace;
        ">✦ CONSULT ORACLE</button>
      </div>

      <!-- Oracle status -->
      <div id="crystal-ball-status" style="
        margin-top: 8px;
        font-size: 0.75em;
        color: #c9a227;
        text-align: center;
        opacity: 0.8;
      ">Oracle status: Ready</div>
    `;

    // Wire up functionality
    setTimeout(() => {
      this.setupCrystalBallEvents();
    }, 100);

    // Calculate position: center-right
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const windowWidth = 320;
    const windowHeight = 400;

    PaneManager.createPane({
      id: "crystal-ball-oracle",
      title: "🔮 ORACLE",
      x: screenWidth - windowWidth - 40,
      y: (screenHeight - windowHeight) / 2,
      width: windowWidth,
      height: windowHeight,
      minimizable: true,
      closeable: true,
      content: content
    });

    this.crystalBallWindowId = "crystal-ball-oracle";
    console.log("[UILayoutManager] Crystal Ball Oracle window created");
  },

  // Setup Crystal Ball event handlers
  setupCrystalBallEvents: function() {
    const input = document.getElementById("crystal-ball-input");
    const button = document.getElementById("crystal-ball-btn");
    const content = document.getElementById("crystal-ball-content");
    const status = document.getElementById("crystal-ball-status");
    const display = document.getElementById("crystal-ball-display");

    if (!input || !button || !content) {
      console.warn("[UILayoutManager] Crystal Ball elements not found");
      return;
    }

    const consultOracle = async () => {
      const question = input.value.trim();
      if (!question) return;

      // Show loading state
      content.textContent = "The crystal swirls with mystical energies...";
      status.textContent = "Oracle status: Divining...";
      display.style.animation = "oracle-active 1.5s ease-in-out infinite alternate";
      button.disabled = true;

      try {
        // Use the AI DM integration's consultDM method
        let response;
        if (window.AIDMIntegration && typeof window.AIDMIntegration.consultDM === 'function') {
          response = await window.AIDMIntegration.consultDM(question);
        } else {
          // Fallback mystical responses
          const fallbackResponses = [
            "The crystal reveals... shadows of code dance in your future. A great debugging awaits.",
            "Ancient algorithms whisper of a path through the digital realm. Trust your instincts.",
            "The Oracle sees... nested loops in your destiny. Beware infinite recursion.",
            "Binary choices await. True or false, the crystal shows both paths.",
            "The spirits of Stack Overflow guide you. The answer lies in documentation."
          ];
          response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }

        content.textContent = response;
        status.textContent = "Oracle status: Prophecy complete";
        
        // Also output to main console
        if (this.gameEngine && typeof this.gameEngine.output === 'function') {
          this.gameEngine.output("🔮 ORACLE: " + response, "spell");
        }

      } catch (error) {
        console.warn("[Crystal Ball] Oracle consultation failed:", error);
        content.textContent = "The crystal dims... the connection falters. Try again when the cosmic alignment improves.";
        status.textContent = "Oracle status: Connection disrupted";
      }

      // Reset UI
      display.style.animation = "";
      button.disabled = false;
      input.value = "";
    };

    // Button click
    button.addEventListener("click", consultOracle);

    // Enter key
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        consultOracle();
      }
    });

    console.log("[UILayoutManager] Crystal Ball events wired up");
  },

  // ============================================================
  // [2D ENGINE] - Bottom-right corner window (gated)
  // ============================================================
  createEngineWindow: function() {
    if (!window.PaneManager) {
      console.warn("[UILayoutManager] PaneManager not available");
      return;
    }

    const content = document.createElement("div");
    content.id = "engine-viewport";
    content.style.cssText = `
      width: 100%;
      height: 100%;
      background: #000;
      border: 1px solid #00ff00;
      position: relative;
      overflow: hidden;
    `;

    // Locked state
    if (!this.gameEngine?.gameState?.graphicsUnlocked) {
      content.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #00ff00;
          text-align: center;
          font-family: monospace;
        ">
          <div style="font-size: 0.9em; margin-bottom: 12px;">[ 2D ENGINE ]</div>
          <div style="
            border: 2px solid #00ff00;
            padding: 12px;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            animation: pulse 2s infinite;
          " style="box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);">
            🔒
          </div>
          <div style="font-size: 0.8em; color: #888;">
            Graphics engine locked<br>
            Complete quests to unlock
          </div>
        </div>
      `;
    } else {
      // Active state - canvas will be inserted here
      content.innerHTML = `<canvas id="game-canvas" style="width: 100%; height: 100%;"></canvas>`;
    }

    // Calculate position: bottom-right
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const windowWidth = 400;
    const windowHeight = 280;

    PaneManager.createPane({
      id: "2d-engine",
      title: "[ 2D ENGINE ]",
      x: screenWidth - windowWidth - 40,
      y: screenHeight - windowHeight - 200,  // Above bottom terminal
      width: windowWidth,
      height: windowHeight,
      minimizable: true,
      closeable: false,
      content: content
    });

    this.engineWindowId = "2d-engine";
    console.log("[UILayoutManager] 2D Engine window created (locked until quest completion)");
  },

  // ============================================================
  // [UNLOCK GRAPHICS] - Called when quest completed
  // ============================================================
  unlockGraphics: function() {
    console.log("[UILayoutManager] Unlocking graphics!");
    
    this.graphicsEnabled = true;
    
    // Update engine window content
    const enginePane = window.PaneManager?.panes["2d-engine"];
    if (enginePane) {
      const viewport = enginePane.content;
      viewport.innerHTML = `<canvas id="game-canvas" style="width: 100%; height: 100%;"></canvas>`;
      
      // Create canvas context and start rendering
      setTimeout(() => {
        const canvas = document.getElementById("game-canvas");
        if (canvas) {
          // Initialize arcane background (particle/fractal/lighting effects)
          if (window.ArcaneBackground && typeof window.ArcaneBackground.initialize === "function") {
            console.log("[UILayoutManager] Initializing arcane background...");
            window.ArcaneBackground.initialize(canvas);
          }
          
          // Initialize graphics engine overlay
          if (window.GraphicsUI && typeof window.GraphicsUI.initCanvas === "function") {
            console.log("[UILayoutManager] Initializing graphics engine...");
            GraphicsUI.initCanvas(canvas);
          }
          
          console.log("[UILayoutManager] Graphics rendering started");
        }
      }, 100);
    }

    // Play unlock fanfare
    if (window.FXSystem?.playAudio) {
      FXSystem.playAudio("unlock", 1.0);
    }

    // Log to system
    if (window.LoggingSystem) {
      window.LoggingSystem.success("oracle-log", "GRAPHICS ENGINE UNLOCKED", "RENDER");
      window.LoggingSystem.cast("2D viewport activated. Arcane background + visual rendering online.", "RENDER");
    }

    if (this.gameEngine?.output) {
      this.gameEngine.output("[GRAPHICS ENGINE UNLOCKED]", "highlight");
      this.gameEngine.output("2D viewport activated. Visual rendering online.", "system");
    }
  },

  // ============================================================
  // [CHECK QUEST STATUS] - Poll for quest completion
  // ============================================================
  checkQuestCompletion: function() {
    if (!this.graphicsEnabled && this.gameEngine?.gameState?.graphicsUnlocked) {
      this.unlockGraphics();
    }
  }

};

console.log("[ui-layout-manager.js] UILayoutManager loaded");
console.log("[ui-layout-manager.js] Call: UILayoutManager.initialize(gameEngine)");
console.log("[ui-layout-manager.js] On quest complete: UILayoutManager.unlockGraphics()");
