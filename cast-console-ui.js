// ============================================================
// CAST-CONSOLE-UI.JS
// Cast Console UI Manager - Handles the multipart UI layout
//
// Manages:
// - Terminal output and input
// - Cast log (command history)
// - Stats panel (HP, MANA, DATA bars)
// - Quest tracker
// - Technonomicon (spells, skills, dice roller)
// - Crystal Ball (DM interaction)
// ============================================================

window.CastConsoleUI = {
  
  // ============================================================
  // [STATE] - Track UI state
  // ============================================================
  state: {
    technonomicon_tab: "spells",
    crystal_ball_messages: [],
  },

  // ============================================================
  // [INITIALIZATION] - Setup UI components
  // ============================================================

  /**
   * Initialize Cast Console UI
   */
  init: function(gameEngine) {
    console.log("[CastConsoleUI] Initializing...");
    
    this.gameEngine = gameEngine;
    this.setupTechnonomicon();
    this.setupCrystalBall();
    this.updateStatsPanel();
    this.setupEventListeners();

    console.log("[CastConsoleUI] Initialized");
  },

  // ============================================================
  // [STATS PANEL] - Update character stats
  // ============================================================

  /**
   * Update HP/MANA/DATA bars and text
   */
  updateStatsPanel: function() {
    const state = this.gameEngine.gameState;

    // Update HP
    const hpBar = document.getElementById("stat-hp");
    const hpText = document.getElementById("stat-hp-text");
    if (hpBar && hpText) {
      const hpPercent = (state.hp / state.maxHp) * 100;
      hpBar.style.width = hpPercent + "%";
      hpText.textContent = `${state.hp}/${state.maxHp}`;
    }

    // Update MANA
    const manaBar = document.getElementById("stat-mana");
    const manaText = document.getElementById("stat-mana-text");
    if (manaBar && manaText) {
      const manaPercent = (state.mp / state.maxMp) * 100;
      manaBar.style.width = manaPercent + "%";
      manaText.textContent = `${state.mp}/${state.maxMp}`;
    }

    // Update DATA (use level * 10 as max, or 100)
    const dataMax = Math.max(100, state.level * 10);
    const dataPercent = (state.data / dataMax) * 100;
    const dataBar = document.getElementById("stat-data");
    const dataText = document.getElementById("stat-data-text");
    if (dataBar && dataText) {
      dataBar.style.width = dataPercent + "%";
      dataText.textContent = `${state.data}/${dataMax}`;
    }
  },

  // ============================================================
  // [QUEST TRACKER] - Update quest list
  // ============================================================

  /**
   * Update quests panel
   */
  updateQuestsPanel: function() {
    const quests = this.gameEngine.questSystem ? this.gameEngine.questSystem.getActiveQuests() : [];
    const panel = document.getElementById("quests-panel");
    
    // Defensive null check - quests panel may not exist during early boot
    if (!panel) {
      console.warn("[CastConsoleUI] Quests panel not found - skipping update");
      return;
    }
    
    if (!quests || quests.length === 0) {
      panel.innerHTML = `<div class="quest-item" style="text-align: center; opacity: 0.5;">No active quests</div>`;
      return;
    }

    panel.innerHTML = quests.map(q => `
      <div class="quest-item">
        <div class="quest-title">${q.name || "Unnamed Quest"}</div>
        <div class="quest-objective">${q.description || "No description"}</div>
        ${q.progress ? `<div class="quest-objective" style="color: #00ff00;">Progress: ${q.progress}</div>` : ""}
      </div>
    `).join("");
  },

  // ============================================================
  // [CAST LOG] - Command history
  // ============================================================

  /**
   * Add entry to cast log
   */
  addCastLogEntry: function(command, result) {
    const logContent = document.getElementById("cast-log-content");
    const entry = document.createElement("div");
    entry.className = "cast-log-line";
    entry.innerHTML = `<span style="color: #00ff00;">> ${command}</span><br><span style="color: #88ff00;">← ${result}</span>`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  },

  // ============================================================
  // [TECHNONOMICON] - Spell/Skill/Dice tabs
  // ============================================================

  /**
   * Setup Technonomicon tabs and content
   */
  setupTechnonomicon: function() {
    // Tab switching
    document.querySelectorAll(".technonomicon-tab").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".technonomicon-tab").forEach(t => t.classList.remove("active"));
        e.target.classList.add("active");
        this.state.technonomicon_tab = e.target.dataset.tab;
        this.updateTechnonomicon();
      });
    });

    // Initial content
    this.updateTechnonomicon();
  },

  /**
   * Update Technonomicon content based on active tab
   */
  updateTechnonomicon: function() {
    const content = document.getElementById("technonomicon-content");
    const tab = this.state.technonomicon_tab;

    switch (tab) {
      case "spells":
        this.showSpellLibrary(content);
        break;
      case "skills":
        this.showSkillProgression(content);
        break;
      case "dice":
        this.showDiceRoller(content);
        break;
      default:
        content.innerHTML = "<div style='text-align: center; opacity: 0.5;'>Unknown tab</div>";
    }
  },

  /**
   * Display spell library
   */
  showSpellLibrary: function(container) {
    const spells = this.gameEngine.gameState.learnedSpells || [];
    
    if (spells.length === 0) {
      container.innerHTML = "<div style='text-align: center; opacity: 0.5;'>No spells learned yet</div>";
      return;
    }

    container.innerHTML = spells.map(spell => `
      <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #00ff00;">
        <div style="color: #aa77ff; font-weight: bold;">${spell.toUpperCase()}</div>
        <div style="color: #88ff00; font-size: 0.85em;">Spell slot</div>
      </div>
    `).join("") || "<div style='opacity: 0.5;'>Loading spells...</div>";
  },

  /**
   * Display skill progression
   */
  showSkillProgression: function(container) {
    const state = this.gameEngine.gameState;
    
    container.innerHTML = `
      <div style="margin-bottom: 10px;">
        <div style="color: #00ff00; font-weight: bold; margin-bottom: 4px;">LEVEL</div>
        <div style="color: #88ff00; font-size: 0.9em;">${state.level}</div>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="color: #00ff00; font-weight: bold; margin-bottom: 4px;">EXPERIENCE</div>
        <div style="color: #88ff00; font-size: 0.9em;">${state.exp}/${state.nextExp} EXP</div>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="color: #00ff00; font-weight: bold; margin-bottom: 4px;">CLASS BONUSES</div>
        <div style="color: #88ff00; font-size: 0.85em;">
          ${state.character?.classBonus ? Object.entries(state.character.classBonus).map(([k, v]) => 
            `<div>${k}: ${(v * 100).toFixed(0)}%</div>`
          ).join("") : "No bonuses"}
        </div>
      </div>
    `;
  },

  /**
   * Display dice roller
   */
  showDiceRoller: function(container) {
    container.innerHTML = `
      <div style="text-align: center;">
        <div style="color: #00ff00; font-weight: bold; margin-bottom: 12px; font-size: 1.1em;">🎲 DICE ROLLER 🎲</div>
        
        <div style="margin-bottom: 12px;">
          <div style="color: #88ff00; margin-bottom: 6px;">Roll dice for actions</div>
          <button style="width: 100%; padding: 8px; margin-bottom: 6px;" id="roll-d20-btn">Roll d20</button>
          <button style="width: 100%; padding: 8px; margin-bottom: 6px;" id="roll-d12-btn">Roll d12</button>
          <button style="width: 100%; padding: 8px;" id="roll-d6-btn">Roll d6</button>
        </div>

        <div id="dice-result" style="color: #ffff00; font-weight: bold; font-size: 1.2em; margin-top: 12px;">
          [awaiting roll]
        </div>
      </div>
    `;

    // Setup dice button listeners
    document.getElementById("roll-d20-btn").addEventListener("click", () => {
      this.rollDice(20);
    });
    document.getElementById("roll-d12-btn").addEventListener("click", () => {
      this.rollDice(12);
    });
    document.getElementById("roll-d6-btn").addEventListener("click", () => {
      this.rollDice(6);
    });
  },

  /**
   * Roll dice (for D&D-style mechanics)
   */
  rollDice: function(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    document.getElementById("dice-result").textContent = `[d${sides}] Result: ${result}`;
    
    // Add to cast log
    this.addCastLogEntry(`Roll d${sides}`, `Result: ${result}`);

    // If connected to DM, send roll
    if (window.AIDMIntegration && window.AIDMIntegration.onPlayerAction) {
      window.AIDMIntegration.onPlayerAction(`I rolled a d${sides} and got ${result}`);
    }
  },

  // ============================================================
  // [CRYSTAL BALL] - DM Interaction
  // ============================================================

  /**
   * Setup Crystal Ball interaction
   */
  setupCrystalBall: function() {
    const input = document.getElementById("crystal-ball-input");
    const btn = document.getElementById("crystal-ball-btn");

    btn.addEventListener("click", () => {
      this.consultOracle();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.consultOracle();
      }
    });
  },

  /**
   * Consult the Crystal Ball (send to DM)
   */
  consultOracle: function() {
    const input = document.getElementById("crystal-ball-input");
    const message = input.value.trim();

    if (!message) return;

    // Add to message history
    this.state.crystal_ball_messages.push({
      type: "player",
      text: message
    });

    // Update display
    this.updateCrystalBallDisplay();
    input.value = "";

    // Send to DM integration
    if (window.AIDMIntegration && window.AIDMIntegration.consultDM) {
      window.AIDMIntegration.consultDM(message, (response) => {
        this.state.crystal_ball_messages.push({
          type: "dm",
          text: response
        });
        this.updateCrystalBallDisplay();
      });
    } else {
      // Fallback response
      const response = `[Oracle Response] Your inquiry is noted. The DM system is not yet connected.`;
      this.state.crystal_ball_messages.push({
        type: "dm",
        text: response
      });
      this.updateCrystalBallDisplay();
    }
  },

  /**
   * Update Crystal Ball display
   */
  updateCrystalBallDisplay: function() {
    const display = document.getElementById("crystal-ball-content");
    
    if (this.state.crystal_ball_messages.length === 0) {
      display.textContent = "Ready for DM interaction...";
      return;
    }

    // Show last 3 messages
    const recent = this.state.crystal_ball_messages.slice(-3);
    display.innerHTML = recent.map(msg => `
      <div style="margin-bottom: 8px; text-align: ${msg.type === 'player' ? 'right' : 'left'};
                  color: ${msg.type === 'player' ? '#00ff00' : '#88ff00'};
                  font-style: ${msg.type === 'dm' ? 'italic' : 'normal'};">
        ${msg.text}
      </div>
    `).join("");
  },

  // ============================================================
  // [EVENT LISTENERS] - Setup all listeners
  // ============================================================

  /**
   * Setup all event listeners
   */
  setupEventListeners: function() {
    // Update UI when game state changes
    if (this.gameEngine.onStateChange) {
      const originalCallback = this.gameEngine.onStateChange;
      this.gameEngine.onStateChange = (state) => {
        if (originalCallback) originalCallback(state);
        this.updateStatsPanel();
        this.updateQuestsPanel();
      };
    }
  },

  // ============================================================
  // [PUBLIC API] - Called by other systems
  // ============================================================

  /**
   * Called when output is generated
   */
  onEngineOutput: function(output) {
    this.updateStatsPanel();
    this.updateQuestsPanel();
  },

  /**
   * Force refresh of all UI
   */
  refresh: function() {
    this.updateStatsPanel();
    this.updateQuestsPanel();
    this.updateTechnonomicon();
  }
};

// ============================================================
// [AUTOLOAD] - Initialize when GameEngine is ready
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Will be called during game initialization
  });
}

console.log("[cast-console-ui.js] Loaded");
