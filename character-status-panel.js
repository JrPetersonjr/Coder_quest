// ============================================================
// CHARACTER-STATUS-PANEL.JS
// Real-time character stats display with HP/MANA/DATA bars
//
// PURPOSE:
//   - Display HP, MANA, DATA as color-coded progress bars
//   - Show active quests and objectives
//   - Update in real-time from gameState
//   - Top-right sidebar panel
// ============================================================

window.CharacterStatusPanel = {

  // ============================================================
  // [STATE]
  // ============================================================
  gameEngine: null,
  panelId: "character-status",
  updateInterval: null,

  // ============================================================
  // [INIT]
  // ============================================================
  initialize: function(gameEngine) {
    console.log("[CharacterStatusPanel] Initializing");
    
    this.gameEngine = gameEngine;
    this.createPanel();
    this.startAutoUpdate();
    
    console.log("[CharacterStatusPanel] Ready");
  },

  // ============================================================
  // [PANEL CREATION]
  // ============================================================
  createPanel: function() {
    if (!window.PaneManager) {
      console.warn("[CharacterStatusPanel] PaneManager not available");
      return;
    }

    const content = document.createElement("div");
    content.id = "character-status-content";
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #000;
      color: #00ff00;
      font-family: 'Courier Prime', monospace;
      padding: 12px;
      font-size: 0.9em;
      gap: 16px;
    `;

    // Stats Section
    const statsSection = document.createElement("div");
    statsSection.innerHTML = `
      <div style="color: #88ff00; font-weight: bold; margin-bottom: 12px; text-align: center; letter-spacing: 2px;">
        [ CHARACTER STATUS ]
      </div>
    `;

    // HP Bar
    const hpContainer = this.createStatBar("HP", "hp", "#00ff00", "#003300");
    
    // MANA Bar
    const manaContainer = this.createStatBar("MANA", "mana", "#8844ff", "#220066");
    
    // DATA Bar
    const dataContainer = this.createStatBar("DATA", "data", "#ff8800", "#442200");

    statsSection.appendChild(hpContainer);
    statsSection.appendChild(manaContainer);
    statsSection.appendChild(dataContainer);

    // Quests Section
    const questsSection = document.createElement("div");
    questsSection.style.cssText = `
      flex: 1;
      border-top: 1px solid #00ff00;
      padding-top: 12px;
      overflow-y: auto;
    `;
    questsSection.innerHTML = `
      <div style="color: #88ff00; font-weight: bold; margin-bottom: 8px; text-align: center; letter-spacing: 2px;">
        [ QUESTS & OBJECTIVES ]
      </div>
      <div id="quests-list" style="font-size: 0.8em; color: #00ff00;"></div>
    `;

    content.appendChild(statsSection);
    content.appendChild(questsSection);

    // Create pane in top-right
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    PaneManager.createPane({
      id: this.panelId,
      title: "⬢ STATUS ⬢",
      x: windowWidth - 280,
      y: 20,
      width: 260,
      height: 400,
      minimizable: true,
      closeable: false,
      content: content
    });

    // Initial update
    this.updateStats();
    this.updateQuests();
  },

  // ============================================================
  // [STAT BAR CREATION]
  // ============================================================
  createStatBar: function(label, id, fillColor, bgColor) {
    const container = document.createElement("div");
    container.style.cssText = `
      margin-bottom: 12px;
    `;

    const labelDiv = document.createElement("div");
    labelDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 0.85em;
      font-weight: bold;
    `;
    labelDiv.innerHTML = `
      <span>${label}</span>
      <span id="${id}-value">0/0</span>
    `;

    const barOuter = document.createElement("div");
    barOuter.style.cssText = `
      width: 100%;
      height: 20px;
      background: ${bgColor};
      border: 1px solid ${fillColor};
      border-radius: 2px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    `;

    const barInner = document.createElement("div");
    barInner.id = `${id}-bar`;
    barInner.style.cssText = `
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, ${fillColor} 0%, ${fillColor} 100%);
      transition: width 0.3s ease;
      box-shadow: 0 0 10px ${fillColor};
    `;

    barOuter.appendChild(barInner);
    container.appendChild(labelDiv);
    container.appendChild(barOuter);

    return container;
  },

  // ============================================================
  // [UPDATE STATS]
  // ============================================================
  updateStats: function() {
    if (!this.gameEngine || !this.gameEngine.gameState) return;

    const state = this.gameEngine.gameState;

    // HP
    this.updateBar("hp", state.hp || 0, state.maxHp || 100);

    // MANA (MP)
    this.updateBar("mana", state.mp || 0, state.maxMp || 100);

    // DATA
    this.updateBar("data", state.data || 0, state.maxData || 1000);
  },

  updateBar: function(id, current, max) {
    const valueElem = document.getElementById(`${id}-value`);
    const barElem = document.getElementById(`${id}-bar`);

    if (valueElem) {
      valueElem.textContent = `${current}/${max}`;
    }

    if (barElem) {
      const percent = Math.max(0, Math.min(100, (current / max) * 100));
      barElem.style.width = percent + "%";
    }
  },

  // ============================================================
  // [UPDATE QUESTS]
  // ============================================================
  updateQuests: function() {
    if (!this.gameEngine || !this.gameEngine.gameState) return;

    const questsListElem = document.getElementById("quests-list");
    if (!questsListElem) return;

    const state = this.gameEngine.gameState;
    const activeQuests = state.activeQuests || [];
    const questsProgress = state.questsProgress || {};

    if (activeQuests.length === 0) {
      questsListElem.innerHTML = `
        <div style="color: #888; font-style: italic; text-align: center; margin-top: 20px;">
          No active quests
        </div>
      `;
      return;
    }

    let html = "";
    activeQuests.forEach(questId => {
      const progress = questsProgress[questId] || {};
      const quest = window.QuestSystem?.quests?.[questId];
      
      if (quest) {
        const progressText = progress.current !== undefined && progress.required !== undefined
          ? `(${progress.current}/${progress.required})`
          : "";

        html += `
          <div style="
            margin-bottom: 10px;
            padding: 6px;
            background: #0a0a0a;
            border-left: 2px solid #00ff00;
            font-size: 0.85em;
          ">
            <div style="color: #88ff00; font-weight: bold; margin-bottom: 2px;">
              ${quest.title || questId}
            </div>
            <div style="color: #00ff00; font-size: 0.9em;">
              ${quest.description || ""}
            </div>
            ${progressText ? `
              <div style="color: #ffaa00; font-size: 0.85em; margin-top: 4px;">
                Progress: ${progressText}
              </div>
            ` : ""}
          </div>
        `;
      }
    });

    questsListElem.innerHTML = html;
  },

  // ============================================================
  // [AUTO UPDATE]
  // ============================================================
  startAutoUpdate: function() {
    // Update every 500ms
    this.updateInterval = setInterval(() => {
      this.updateStats();
      this.updateQuests();
    }, 500);
  },

  stopAutoUpdate: function() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  },

  // ============================================================
  // [MANUAL REFRESH]
  // ============================================================
  refresh: function() {
    this.updateStats();
    this.updateQuests();
  }
};

// ============================================================
// [EXPORTS]
// ============================================================
console.log("[character-status-panel.js] CharacterStatusPanel ready");
