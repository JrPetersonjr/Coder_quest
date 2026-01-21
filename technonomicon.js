// ============================================================
// TECHNONOMICON.JS
// Arcane spellbook UI with circuit board aesthetics
//
// PURPOSE:
//   - Display as an unholy grimoire with circuitry
//   - Multiple pages: Skills, Development, Spells, Recipes, Failures
//   - Terminal-style console rendering
//   - Integrated with game systems
//
// PAGES:
//   1. SKILL TREE - Character progression
//   2. CHARACTER - Stats and development
//   3. SPELLS - Available magical abilities
//   4. RECIPES - Tinker crafting formulas
//   5. FAILURES - Log of failed experiments
// ============================================================

window.Technonomicon = {

  // ============================================================
  // [STATE]
  // ============================================================
  currentPage: "spells",
  pages: ["skills", "character", "spells", "recipes", "failures"],
  gameEngine: null,
  loggingSystem: null,
  paneId: "technonomicon",

  // ============================================================
  // [INIT]
  // ============================================================
  initialize: function(gameEngine, loggingSystem) {
    console.log("[Technonomicon] Initializing arcane spellbook");
    
    this.gameEngine = gameEngine;
    this.loggingSystem = loggingSystem;
    
    if (window.PaneManager) {
      this.createTechnonomicon();
    }
  },

  // ============================================================
  // [CREATE] - Build the Technonomicon pane
  // ============================================================
  createTechnonomicon: function() {
    const content = document.createElement("div");
    content.id = "technonomicon-content";
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #000;
      color: #00ff00;
      font-family: 'Courier Prime', monospace;
    `;

    // Create circuitry background
    const bgCanvas = document.createElement("canvas");
    bgCanvas.id = "technonomicon-bg";
    bgCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0.05;
      pointer-events: none;
    `;
    this.generateCircuitPattern(bgCanvas);

    // Page tabs header
    const tabsDiv = document.createElement("div");
    tabsDiv.style.cssText = `
      display: flex;
      border-bottom: 2px solid #00ff00;
      gap: 1px;
      padding: 8px;
      background: #0a0a0a;
      z-index: 10;
    `;

    const tabNames = ["SKILLS", "CHARACTER", "SPELLS", "RECIPES", "FAILURES"];
    const tabValues = this.pages;

    tabNames.forEach((name, i) => {
      const tab = document.createElement("button");
      tab.textContent = name;
      tab.dataset.page = tabValues[i];
      tab.style.cssText = `
        background: transparent;
        border: 2px solid #00ff00;
        color: #00ff00;
        padding: 6px 12px;
        cursor: pointer;
        font-family: monospace;
        font-weight: bold;
        font-size: 0.85em;
        transition: all 0.2s;
      `;

      if (i === 2) { // Default to SPELLS
        tab.style.background = "#00ff00";
        tab.style.color = "#000";
      }

      tab.onclick = () => this.switchPage(tabValues[i], tab);
      tabsDiv.appendChild(tab);
    });

    // Page content area
    const pageDiv = document.createElement("div");
    pageDiv.id = "technonomicon-page";
    pageDiv.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      position: relative;
      background: linear-gradient(135deg, #000a00 0%, #001a00 100%);
      border: 1px solid #00ff00;
    `;

    content.appendChild(bgCanvas);
    content.appendChild(tabsDiv);
    content.appendChild(pageDiv);

    // Create pane (2/3 width)
    const screenWidth = window.innerWidth;
    const paneWidth = Math.floor(screenWidth * 0.65);

    PaneManager.createPane({
      id: this.paneId,
      title: "⬢ TECHNONOMICON ⬢",
      x: 20,
      y: 20,
      width: paneWidth,
      height: 500,
      minimizable: true,
      closeable: true,
      content: content
    });

    this.renderPage("spells");
    console.log("[Technonomicon] Spellbook created");
  },

  // ============================================================
  // [CIRCUIT PATTERN] - Generate background circuitry
  // ============================================================
  generateCircuitPattern: function(canvas) {
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 0.5;

    // Draw circuit paths
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 30 + Math.random() * 80;

      // Circles
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();

      // Connected lines
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }
  },

  // ============================================================
  // [SWITCH PAGE]
  // ============================================================
  switchPage: function(page, tabButton) {
    this.currentPage = page;

    // Update active tab styling
    document.querySelectorAll("[data-page]").forEach(btn => {
      btn.style.background = "transparent";
      btn.style.color = "#00ff00";
    });

    tabButton.style.background = "#00ff00";
    tabButton.style.color = "#000";

    this.renderPage(page);
  },

  // ============================================================
  // [RENDER PAGE] - Display page content
  // ============================================================
  renderPage: function(page) {
    const pageDiv = document.getElementById("technonomicon-page");
    if (!pageDiv) return;

    pageDiv.innerHTML = "";

    switch (page) {
      case "skills":
        this.renderSkillTree(pageDiv);
        break;
      case "character":
        this.renderCharDevelopment(pageDiv);
        break;
      case "spells":
        this.renderSpells(pageDiv);
        break;
      case "recipes":
        this.renderRecipes(pageDiv);
        break;
      case "failures":
        this.renderFailures(pageDiv);
        break;
    }
  },

  // ============================================================
  // [PAGES]
  // ============================================================

  renderSkillTree: function(container) {
    const html = `
      <div style="color: #88ff00; font-weight: bold; margin-bottom: 12px;">[ SKILL TREE ]</div>
      <div style="border-left: 2px solid #00ff00; padding-left: 12px; color: #00ff00;">
        <div style="margin-bottom: 8px;">
          ├─ COMBAT ARTS
          │  ├─ Blade Mastery (Level 1)
          │  ├─ Dual Wield (Locked)
          │  └─ Parry (Available)
        </div>
        <div style="margin-bottom: 8px;">
        ├─ ARCANE MASTERY
          │  ├─ Fireball (Level 1)
          │  ├─ Mana Shield (Level 1)
          │  └─ Spell Amplify (Available)
        </div>
        <div style="margin-bottom: 8px;">
          ├─ CODE INJECTION
          │  ├─ System Probe (Level 1)
          │  ├─ Exploit (Level 1)
          │  └─ Rootkit (Locked)
        </div>
        <div>
          └─ SURVIVAL
             ├─ Stealth (Available)
             ├─ Camouflage (Locked)
             └─ Vanish (Locked)
        </div>
      </div>
    `;
    container.innerHTML = html;
  },

  renderCharDevelopment: function(container) {
    const char = this.gameEngine?.gameState?.character || {};
    
    const html = `
      <div style="color: #aa77ff; font-weight: bold; margin-bottom: 12px;">[ CHARACTER DEVELOPMENT ]</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <div style="color: #ffaa00; margin-bottom: 4px;">Name:</div>
          <div>${char.name || "Unknown Technomancer"}</div>
          
          <div style="color: #ffaa00; margin-bottom: 4px; margin-top: 8px;">Class:</div>
          <div>${char.class ? char.class.toUpperCase() : "UNASSIGNED"}</div>
          
          <div style="color: #ffaa00; margin-bottom: 4px; margin-top: 8px;">Level:</div>
          <div>${char.level || 1}</div>
        </div>
        <div>
          <div style="color: #ffaa00; margin-bottom: 4px;">Experience:</div>
          <div>${char.experience || 0} / 1000</div>
          
          <div style="color: #ffaa00; margin-bottom: 4px; margin-top: 8px;">Proficiency:</div>
          <div>67%</div>
          
          <div style="color: #ffaa00; margin-bottom: 4px; margin-top: 8px;">Mastery Points:</div>
          <div>12 available</div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  },

  renderSpells: function(container) {
    const spells = window.CastSpells?.spells || {};
    
    let html = `<div style="color: #aa77ff; font-weight: bold; margin-bottom: 12px;">[ SPELLS GRIMOIRE ]</div>`;
    
    Object.values(spells).slice(0, 15).forEach(spell => {
      const cost = spell.manaCost || spell.cost || 0;
      html += `
        <div style="border-bottom: 1px solid #00ff0022; padding: 6px 0; margin: 6px 0;">
          <div style="color: #00ffff; font-weight: bold;">${spell.name}</div>
          <div style="color: #88ff00; font-size: 0.85em;">${spell.description || "Magical ability"}</div>
          <div style="color: #ffaa00; font-size: 0.8em;">Mana Cost: ${cost}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  },

  renderRecipes: function(container) {
    const html = `
      <div style="color: #44ff44; font-weight: bold; margin-bottom: 12px;">[ TINKER RECIPES ]</div>
      <div>
        <div style="border-bottom: 1px solid #00ff0022; padding: 8px 0; margin: 6px 0;">
          <div style="color: #00ffff; font-weight: bold;">⚗ Mana Vial (Tier 1)</div>
          <div style="color: #88ff00; font-size: 0.85em;">Ingredients: Mana Shard x2, Essence x1</div>
          <div style="color: #ffaa00; font-size: 0.8em;">Yield: 3 Potions | Success Rate: 85%</div>
        </div>
        
        <div style="border-bottom: 1px solid #00ff0022; padding: 8px 0; margin: 6px 0;">
          <div style="color: #00ffff; font-weight: bold;">⚡ Arcane Battery</div>
          <div style="color: #88ff00; font-size: 0.85em;">Ingredients: Crystal x1, Copper Wire x5, Voltage Coil x1</div>
          <div style="color: #ffaa00; font-size: 0.8em;">Yield: 1 Battery | Success Rate: 60%</div>
        </div>
        
        <div style="border-bottom: 1px solid #00ff0022; padding: 8px 0; margin: 6px 0;">
          <div style="color: #00ffff; font-weight: bold;">🔮 Scrying Lens</div>
          <div style="color: #88ff00; font-size: 0.85em;">Ingredients: Obsidian Shard x3, Enchanted Glass x2</div>
          <div style="color: #ffaa00; font-size: 0.8em;">Yield: 1 Lens | Success Rate: 40%</div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  },

  renderFailures: function(container) {
    const html = `
      <div style="color: #ff4444; font-weight: bold; margin-bottom: 12px;">[ FAILED EXPERIMENTS ]</div>
      <div style="color: #888; font-size: 0.85em; line-height: 1.6;">
        <div style="margin-bottom: 8px;">
          <span style="color: #ffaa00;">[14:32]</span> Mana Vial recipe failed - insufficient essence
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: #ffaa00;">[13:45]</span> Arcane Battery exploded - unstable voltage coil
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: #ffaa00;">[12:11]</span> Scrying Lens cracked during enchantment
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: #ffaa00;">[11:20]</span> Unknown reagent combination - catastrophic failure
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: #ffaa00;">[10:05]</span> Crystal resonance test - feedback loop detected
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

};

console.log("[technonomicon.js] Technonomicon arcane spellbook loaded");
console.log("[technonomicon.js] Call: Technonomicon.initialize(gameEngine, loggingSystem)");
