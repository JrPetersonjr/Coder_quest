// ============================================================
// GAMEUI.JS
// UI LAYER - Connects GameEngine to the DOM
//
// This is where we handle:
// - DOM manipulation
// - Event listeners
// - Rendering engine output to the screen
//
// If you wanted to port to React, you'd replace this file
// and leave GameEngine.js untouched
// ============================================================

class GameUI {
  constructor(engine) {
    this.engine = engine;
    this.outputElement = document.getElementById("output");
    this.inputElement = document.getElementById("console-input") || document.getElementById("input");
    this.sendBtn = document.getElementById("send-btn");
    this.roomText = document.getElementById("room-text");

    this.setupEventListeners();
    this.updateDisplay();

    // Initialize Cast Console UI if available
    if (window.CastConsoleUI) {
      window.CastConsoleUI.init(engine);
      console.log("[GameUI] Cast Console UI initialized");
    }

    console.log("[GameUI] Initialized");
  }

  // ============================================================
  // [EVENT SETUP] - Connect UI to engine
  // ============================================================

  setupEventListeners() {
    // Send button
    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", () => this.handleSend());
    } else {
      console.error("[GameUI] Send button not found!");
    }

    // Enter key in input
    if (this.inputElement) {
      this.inputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.handleSend();
        }
      });
    } else {
      console.error("[GameUI] Input element not found!");
    }

    // Setup engine callbacks
    this.engine.onOutput = (output) => this.handleEngineOutput(output);
    this.engine.onStateChange = (state) => this.handleStateChange(state);
  }

  // ============================================================
  // [INPUT HANDLING]
  // ============================================================

  handleSend() {
    const input = this.inputElement.value.trim();
    if (!input) return;

    // Clear input
    this.inputElement.value = "";
    this.inputElement.focus();

    // Send to engine
    this.engine.handleCommand(input);
  }

  // ============================================================
  // [ENGINE CALLBACKS] - Respond to engine events
  // ============================================================

  /**
   * Called whenever the engine wants to output something
   * This is the bridge between pure logic and rendering
   */
  handleEngineOutput(output) {
    // Add zone emoji if available
    let emoji = '';
    try {
      const zoneKey = this.engine.getCurrentZone ? this.engine.getCurrentZone().id || this.engine.getCurrentZone().zone : null;
      if (window.CastZones && zoneKey && window.CastZones[zoneKey] && window.CastZones[zoneKey].emoji) {
        emoji = window.CastZones[zoneKey].emoji + ' ';
      }
    } catch (e) {}

    const div = document.createElement("div");
    div.className = `line ${output.type}`;
    div.textContent = emoji + output.text;
    this.outputElement.appendChild(div);

    // If the output requests a banner, render it (for zone transitions, etc)
    if (output.banner && Array.isArray(output.banner)) {
      const bannerDiv = document.createElement("pre");
      bannerDiv.className = "zone-banner";
      bannerDiv.textContent = output.banner.join('\n');
      this.outputElement.appendChild(bannerDiv);
    }

    // Auto-scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight;

    // Update Cast Console UI if available
    if (window.CastConsoleUI) {
      window.CastConsoleUI.onEngineOutput(output);
    }
  }

  /**
   * Called whenever game state changes
   * Used to update UI elements
   */
  handleStateChange(state) {
    this.updateDisplay();
  }

  // ============================================================
  // [DISPLAY UPDATES] - Keep UI in sync with state
  // ============================================================

  updateDisplay() {
    this.updateStats();
    this.updateRoom();
    this.updateDefinitions();
  }

  updateStats() {
    const stats = this.engine.getStats();
    const statsDiv = document.getElementById("stats");
    if (statsDiv) {
      statsDiv.innerHTML = `
        <div class="stat-row">HP: ${stats.hp}/${stats.maxHp}</div>
        <div class="stat-row">MP: ${stats.mp}/${stats.maxMp}</div>
        <div class="stat-row">Level: ${stats.level}</div>
      `;
    }
  }

  updateRoom() {
    const zone = this.engine.getCurrentZone();
    if (this.roomText && zone) {
      this.roomText.textContent = zone.name;
    }
  }

  updateDefinitions() {
    const defs = this.engine.getDefinitions();
    const defsDiv = document.getElementById("definitions");
    if (defsDiv) {
      if (Object.keys(defs).length === 0) {
        defsDiv.innerHTML = "<div class='item'>None</div>";
      } else {
        defsDiv.innerHTML = Object.entries(defs)
          .map(([k, v]) => `<div class="item">${k}: ${v}</div>`)
          .join("");
      }
    }
  }

  // ============================================================
  // [UTILITIES]
  // ============================================================

  focus() {
    this.inputElement.focus();
  }

  clearOutput() {
    this.outputElement.innerHTML = "";
  }
}

// Export for use in HTML
window.GameUI = GameUI;
