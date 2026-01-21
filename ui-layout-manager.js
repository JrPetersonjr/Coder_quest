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

  // ============================================================
  // [INIT]
  // ============================================================
  initialize: function(gameEngine) {
    console.log("[UILayoutManager] Initializing");
    
    this.gameEngine = gameEngine;
    
    // Create Ancient Terminals window
    this.createAncientTerminalsWindow();
    
    // Create Character Status Panel
    if (window.CharacterStatusPanel) {
      CharacterStatusPanel.initialize(gameEngine);
    }
    
    // Create 2D Engine window (initially hidden)
    this.createEngineWindow();
    
    // Check if graphics should be unlocked
    if (gameEngine.gameState.graphicsUnlocked) {
      this.unlockGraphics();
    }
    
    console.log("[UILayoutManager] Ready");
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
