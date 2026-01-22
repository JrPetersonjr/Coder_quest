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
    
    // Music Controls Section
    const musicSection = document.createElement("div");
    musicSection.style.cssText = `
      border-top: 1px solid #00ff00;
      padding-top: 12px;
      margin-top: 12px;
    `;
    musicSection.innerHTML = `
      <div style="color: #88ff00; font-weight: bold; margin-bottom: 8px; text-align: center; letter-spacing: 2px;">
        [ MUSIC CONTROLS ]
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; gap: 4px;">
          <button id="music-play-menu" class="music-btn" data-theme="menu" title="Main Theme">▶️</button>
          <button id="music-play-battle" class="music-btn" data-theme="battle" title="Battle Theme">⚔️</button>
          <button id="music-play-exploration" class="music-btn" data-theme="exploration" title="Exploration">🌍</button>
          <button id="music-stop" class="music-btn" title="Stop Music">⏹️</button>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8em;">
          <span style="color: #00ff00; min-width: 40px;">Vol:</span>
          <input type="range" id="music-volume" min="0" max="100" value="70" style="
            flex: 1;
            height: 16px;
            background: #002200;
            accent-color: #00ff00;
          ">
          <span id="volume-display" style="color: #ffaa00; min-width: 30px;">70%</span>
        </div>
      </div>
    `;

    content.appendChild(statsSection);
    content.appendChild(questsSection);
    content.appendChild(musicSection);

    // Create pane in top-right
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Add music button styles
    if (!document.getElementById('music-control-styles')) {
      const styles = document.createElement('style');
      styles.id = 'music-control-styles';
      styles.textContent = `
        .music-btn {
          background: #001100;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s ease;
          min-width: 32px;
        }
        .music-btn:hover {
          background: #003300;
          box-shadow: 0 0 8px #00ff00;
        }
        .music-btn:active {
          background: #005500;
        }
        .music-btn.playing {
          background: #004400;
          box-shadow: 0 0 12px #00ff00;
        }
      `;
      document.head.appendChild(styles);
    }

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
    
    // Attach music control listeners
    this.attachMusicControls();
  },
  
  // ============================================================
  // [MUSIC CONTROLS]
  // ============================================================
  attachMusicControls: function() {
    // Theme buttons
    document.querySelectorAll('.music-btn[data-theme]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.playMusicTheme(theme);
        this.updateMusicButtons(theme);
      });
    });
    
    // Stop button
    const stopBtn = document.getElementById('music-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.stopMusic();
        this.updateMusicButtons(null);
      });
    }
    
    // Volume control
    const volumeSlider = document.getElementById('music-volume');
    const volumeDisplay = document.getElementById('volume-display');
    if (volumeSlider && volumeDisplay) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value);
        this.setMusicVolume(volume);
        volumeDisplay.textContent = volume + '%';
      });
    }
  },
  
  playMusicTheme: function(theme) {
    if (window.MIDIPlayer) {
      window.MIDIPlayer.playTheme(theme);
      console.log(`[CharacterStatusPanel] Playing theme: ${theme}`);
      
      // Also output to game if available
      if (this.gameEngine) {
        this.gameEngine.output(`🎵 Now playing: ${theme} theme`, "system");
      }
    } else {
      console.warn('[CharacterStatusPanel] MIDI Player not available');
    }
  },
  
  stopMusic: function() {
    if (window.MIDIPlayer) {
      window.MIDIPlayer.stop();
      console.log('[CharacterStatusPanel] Music stopped');
      
      if (this.gameEngine) {
        this.gameEngine.output("🔇 Music stopped", "system");
      }
    }
  },
  
  setMusicVolume: function(volume) {
    if (window.MIDIPlayer) {
      window.MIDIPlayer.setVolume(volume / 100);
    }
  },
  
  updateMusicButtons: function(currentTheme) {
    document.querySelectorAll('.music-btn').forEach(btn => {
      btn.classList.remove('playing');
    });
    
    if (currentTheme) {
      const activeBtn = document.querySelector(`.music-btn[data-theme="${currentTheme}"]`);
      if (activeBtn) {
        activeBtn.classList.add('playing');
      }
    }
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
      this.updateMusicState();
    }, 500);
  },
  
  updateMusicState: function() {
    // Check if music is playing and update button states
    if (window.MIDIPlayer && window.MIDIPlayer.state) {
      const isPlaying = window.MIDIPlayer.state.isPlaying;
      const currentSong = window.MIDIPlayer.state.currentSong;
      
      if (isPlaying && currentSong) {
        // Determine theme from song name
        let theme = 'menu';
        if (currentSong.name.includes('Battle')) theme = 'battle';
        else if (currentSong.name.includes('Exploration')) theme = 'exploration';
        
        this.updateMusicButtons(theme);
      } else {
        this.updateMusicButtons(null);
      }
    }
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
