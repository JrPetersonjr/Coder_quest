// ============================================================
// DICE-UI.JS
// UI layer for DiceSystem - buttons, visual rolls, integration
//
// PURPOSE:
//   - Create clickable dice roller buttons (d20, d12, d6, etc)
//   - Display rolls with animations and results
//   - Integration with logging system
//   - Support both button clicks and text commands
//   - Wire dice rolls to actual game mechanics (combat, checks, etc)
//
// DICE SUPPORT:
//   - Single rolls: d20, d12, d6, d100
//   - Multiple rolls: 2d6, 3d20, etc
//   - Notations: d20+5, 2d8-2, etc
// ============================================================

window.DiceUI = {

  // ============================================================
  // [STATE] - Track roll history
  // ============================================================
  diceSystem: null,
  loggingSystem: null,
  lastRolls: [],
  maxHistory: 20,
  animating: false,

  // ============================================================
  // [INIT] - Initialize dice UI
  // ============================================================
  initialize: function(diceSystem, loggingSystem) {
    console.log("[DiceUI] Initializing");
    
    this.diceSystem = diceSystem;
    this.loggingSystem = loggingSystem;
    
    // Create dice roller pane
    this.createDicePanel();
    
    console.log("[DiceUI] Ready");
  },

  // ============================================================
  // [PANEL] - Create dice roller UI panel
  // ============================================================
  createDicePanel: function() {
    if (!window.PaneManager) {
      console.warn("[DiceUI] PaneManager not available");
      return;
    }

    // Create button layout
    const content = document.createElement("div");
    content.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 8px;
      font-family: monospace;
    `;

    // Common dice buttons
    const diceButtons = [
      { label: "d4", notation: "d4", color: "#ff4444" },
      { label: "d6", notation: "d6", color: "#ffaa00" },
      { label: "d8", notation: "d8", color: "#88ff00" },
      { label: "d10", notation: "d10", color: "#00ff88" },
      { label: "d12", notation: "d12", color: "#00ffff" },
      { label: "d20", notation: "d20", color: "#aa77ff" },
      { label: "d100", notation: "d100", color: "#ff77aa" },
      { label: "2d6", notation: "2d6", color: "#ffff00" }
    ];

    diceButtons.forEach(dice => {
      const btn = document.createElement("button");
      btn.textContent = dice.label;
      btn.style.cssText = `
        background: #000;
        border: 2px solid ${dice.color};
        color: ${dice.color};
        padding: 8px;
        cursor: pointer;
        font-family: monospace;
        font-weight: bold;
        font-size: 0.9em;
        transition: all 0.2s;
      `;
      
      btn.onmouseover = () => {
        btn.style.background = dice.color;
        btn.style.color = "#000";
        btn.style.boxShadow = `0 0 10px ${dice.color}`;
      };
      
      btn.onmouseout = () => {
        btn.style.background = "#000";
        btn.style.color = dice.color;
        btn.style.boxShadow = "none";
      };
      
      btn.onclick = () => this.rollDice(dice.notation);
      
      content.appendChild(btn);
    });

    // Add custom input field
    const inputDiv = document.createElement("div");
    inputDiv.style.cssText = "grid-column: 1 / -1; margin-top: 8px;";
    
    const label = document.createElement("label");
    label.textContent = "Custom: ";
    label.style.cssText = "color: #00ff00; font-size: 0.8em; margin-right: 4px;";
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "e.g., 3d6+2";
    input.style.cssText = `
      background: #0a0a0a;
      border: 1px solid #00ff00;
      color: #00ff00;
      padding: 4px;
      font-family: monospace;
      width: 100%;
      box-sizing: border-box;
      outline: none;
    `;
    
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const notation = input.value.trim();
        if (notation) {
          this.rollDice(notation);
          input.value = "";
        }
      }
    });
    
    inputDiv.appendChild(label);
    inputDiv.appendChild(input);
    content.appendChild(inputDiv);

    // Add last roll display
    const lastRollDiv = document.createElement("div");
    lastRollDiv.id = "dice-last-roll";
    lastRollDiv.style.cssText = `
      grid-column: 1 / -1;
      margin-top: 8px;
      padding: 8px;
      background: #0a0a0a;
      border: 1px solid #00ff00;
      color: #00ff00;
      font-size: 0.85em;
      line-height: 1.4;
      min-height: 60px;
      max-height: 120px;
      overflow-y: auto;
    `;
    lastRollDiv.textContent = "Roll dice to see results...";
    content.appendChild(lastRollDiv);

    // Create pane
    PaneManager.createPane({
      id: "dice-panel",
      title: "DICE ROLLER",
      x: 50,
      y: 400,
      width: 320,
      height: 400,
      minimizable: true,
      closeable: true,
      content: content
    });

    console.log("[DiceUI] Dice panel created");
  },

  // ============================================================
  // [ROLL] - Execute dice roll and display result
  // ============================================================
  rollDice: function(notation) {
    console.log("[DiceUI] Rolling:", notation);
    
    if (!this.diceSystem) {
      console.error("[DiceUI] DiceSystem not initialized");
      return;
    }

    try {
      const result = this.diceSystem.rollNotation(notation);
      this.displayRoll(notation, result);
      
      // Log to tech log
      if (this.loggingSystem) {
        const rollStr = result.rolls ? `[${result.rolls.join(", ")}]` : "";
        this.loggingSystem.tech(
          `${notation} = ${result.total} ${rollStr}`,
          "DICE",
          "#ffff00"
        );
      }
      
    } catch (error) {
      console.error("[DiceUI] Roll error:", error);
      if (this.loggingSystem) {
        this.loggingSystem.error("tech", `Invalid dice notation: ${notation}`, "DICE");
      }
      alert(`Invalid dice notation: ${notation}`);
    }
  },

  // ============================================================
  // [DISPLAY] - Show roll result with animation
  // ============================================================
  displayRoll: function(notation, result) {
    const lastRollDiv = document.getElementById("dice-last-roll");
    if (!lastRollDiv) return;

    let html = `<strong style="color: #00ffff;">${notation}</strong><br>`;
    html += `<span style="color: #ffff00; font-weight: bold;">Result: ${result.total}</span><br>`;
    
    if (result.rolls && result.rolls.length > 1) {
      html += `<span style="color: #88ff00; font-size: 0.85em;">Individual: [${result.rolls.join(", ")}]</span><br>`;
    }
    
    if (result.modifier) {
      html += `<span style="color: #aa77ff; font-size: 0.85em;">Modifier: ${result.modifier}</span><br>`;
    }

    html += `<span style="color: #888; font-size: 0.8em;">${new Date().toLocaleTimeString()}</span>`;

    lastRollDiv.innerHTML = html;

    // Add to history
    this.lastRolls.unshift({
      notation: notation,
      result: result.total,
      timestamp: new Date()
    });

    if (this.lastRolls.length > this.maxHistory) {
      this.lastRolls.pop();
    }
  },

  // ============================================================
  // [QUICK ROLL] - Roll with result returned (for mechanics)
  // ============================================================
  quickRoll: function(notation) {
    if (!this.diceSystem) return null;
    
    try {
      const result = this.diceSystem.rollNotation(notation);
      this.displayRoll(notation, result);
      return result.total;
    } catch (error) {
      console.error("[DiceUI] Quick roll error:", error);
      return null;
    }
  },

  // ============================================================
  // [STATS] - Get roll statistics
  // ============================================================
  getStats: function() {
    if (this.lastRolls.length === 0) return null;

    const totals = this.lastRolls.map(r => r.result);
    const sum = totals.reduce((a, b) => a + b, 0);
    const avg = sum / totals.length;
    const min = Math.min(...totals);
    const max = Math.max(...totals);

    return {
      rolls: this.lastRolls.length,
      average: avg.toFixed(2),
      total: sum,
      min: min,
      max: max
    };
  }

};

console.log("[dice-ui.js] DiceUI loaded");
console.log("[dice-ui.js] Call: DiceUI.initialize(diceSystem, loggingSystem)");
console.log("[dice-ui.js] Then: DiceUI.rollDice(notation) or DiceUI.quickRoll(notation)");
