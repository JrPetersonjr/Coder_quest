// ============================================================
// GAMEENGINE.JS
// CORE GAME LOGIC - COMPLETELY DECOUPLED FROM UI
//
// This is the "pure" game engine. It knows nothing about:
// - The DOM
// - How to render things
// - Whether it's running in a browser, Godot, or Roblox
//
// Instead, it accepts callbacks and returns data
// ============================================================

class GameEngine {
  constructor(options = {}) {
    // Output callback: engine calls this when it needs to log something
    this.onOutput = options.onOutput || (() => {});
    
    // State callback: called whenever major state changes
    this.onStateChange = options.onStateChange || (() => {});
    
    // Graphics unlock callback: called when graphics become available
    this.onGraphicsUnlock = options.onGraphicsUnlock || (() => {});
    
    // Audio callbacks: called when game events need sounds
    this.onPlaySound = options.onPlaySound || (() => {});
    
    // Initialize audio system
    this.audioSystem = new AudioSystem();
    
    // Initialize quest system
    this.questSystem = new QuestSystem();
    
    // Initialize spell tinkering system (requires dice + AI DM)
    this.spellTinkering = null; // Set after dice/AI DM available
    
    // Initialize game state
    this.initializeGameState();
    
    console.log("[GameEngine] Initialized with quest + audio + spell tinkering");
  }

  // ============================================================
  // [INITIALIZATION]
  // ============================================================

  initializeGameState() {
    this.gameState = {
      // Core stats
      zone: "hub",
      subzone: "hub_center",
      hp: 50,
      maxHp: 50,
      mp: 20,
      maxMp: 20,
      data: 100,
      level: 1,
      exp: 0,
      nextExp: 100,

      // Systems
      inventory: [],
      learnedSpells: ["normalize", "debug", "compile"],
      learnedCodeBits: ["fire", "ice", "logic", "chaos"],
      discoveredSpells: {},
      completedTerminals: {},
      allies: [],
      hunted_by: [],
      claimed_zones: [],

      // Spell crafting (character profile for spellTinkering)
      character: {
        name: "Player",
        level: 1,
        experience: 0,
        hp: 50,
        maxHp: 50,
        mp: 20,
        maxMp: 20,
        classBonus: {},
        activeBuffs: [],
        activeDebuffs: [],
        equipment: {
          surveyenceSystem: { efficiency: 1.0 }
        }
      },

      // Battle state
      inBattle: false,
      battleMode: null,
      currentEnemy: null,
      currentEncounter: null,

      // Progression
      puzzleSolved: {
        hub_gate: false,
        forest_bridge: false
      },
      visitedSubzones: {},
      questProgress: {},
      graphicsUnlocked: false,
    };
  }

  // ============================================================
  // [OUTPUT ABSTRACTION] - Core concept
  // ============================================================

  /**
   * Central output method - all game messages go through here
   * Instead of manipulating DOM directly, we call this callback
   * This is the KEY to making it platform-agnostic
   */
  output(text, type = "system") {
    this.onOutput({
      text: text,
      type: type,
      timestamp: Date.now()
    });
  }

  // ============================================================
  // [COMMAND PARSER] - Pure game logic
  // ============================================================

  /**
   * Main command handler - this is what the UI calls
   * Input: raw user command string
   * Output: Nothing (side effects via callbacks)
   */
  handleCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) return;

    // Echo the command
    this.output(`> ${input}`, "command");

    // Parse command
    const parts = input.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check for custom commands first (tutorial, system, debug)
    if (window.CommandHandlers && CommandHandlers.isRegistered(cmd)) {
      CommandHandlers.execute(cmd, args, this);
      this.onStateChange(this.gameState);
      return;
    }

    // Route to appropriate handler
    switch (cmd) {
      case "help":
        this.cmdHelp();
        break;
      case "look":
        this.cmdLook();
        break;
      case "stats":
        this.cmdStats();
        break;
      case "go":
        this.cmdGo(args);
        break;

      case "inspect":
        this.cmdInspect(args);
        break;
      case "quest":
        this.cmdQuest(args);
        break;
      case "quests":
        this.cmdQuests();
        break;
      case "audio":
        this.cmdAudio(args);
        break;
      case "save":
        this.cmdSave(args);
        break;
      case "load":
        this.cmdLoad(args);
        break;
      case "battle":
        this.cmdBattle(args);
        break;
      case "attack":
        this.attack();
        break;
      case "run":
        this.run();
        break;
      case "cast":
        this.castSpell(args);
        break;
      case "summon":
        this.summonAlly(args);
        break;
      case "allies":
        this.cmdListAllies();
        break;
      case "spells":
        this.cmdListSpells();
        break;
      case "data":
        this.cmdShowData();
        break;
      default:
        this.output("Unknown command. Type 'help' for commands.", "error");
    }

    // Notify that state may have changed
    this.onStateChange(this.gameState);
  }

  // ============================================================
  // [CORE COMMANDS] - Game mechanics (all pure logic!)
  // ============================================================

  cmdHelp() {
    this.output("════════════════════════════════════", "system");
    this.output("[ TECHNOMANCER COMMANDS ]", "system");
    this.output("════════════════════════════════════", "system");
    this.output("", "system");
    this.output("MOVEMENT:", "highlight");
    this.output("  look - Examine current zone", "system");
    this.output("  go <zone> - Travel to zone", "system");
    this.output("", "system");
    this.output("COMBAT:", "highlight");
    this.output("  battle [enemy] - Start battle", "system");
    this.output("  attack - Attack in battle", "system");
    this.output("  run - Flee battle", "system");
    this.output("", "system");
    this.output("SPELL CRAFTING:", "highlight");
    this.output("  cast <element> <codebit> - Craft and cast spell (e.g., 'cast fire damage')", "system");
    this.output("  spells - List all castable spells", "system");
    this.output("  data - Show data inventory + items", "system");
    this.output("", "system");
    this.output("SUMMONING:", "highlight");
    this.output("  summon <element> <summon> - Perform ritual (e.g., 'summon fire summon')", "system");
    this.output("  allies - List active party members", "system");
    this.output("", "system");
    this.output("INFO:", "highlight");
    this.output("  stats - View character stats", "system");
    this.output("  quests - View active quests", "system");
    this.output("  help - This message", "system");
    this.output("", "system");
  }

  cmdStats() {
    const s = this.gameState;
    this.output("════════════════════════════════════", "system");
    this.output(`HP:    ${s.hp}/${s.maxHp}`, "system");
    this.output(`MP:    ${s.mp}/${s.maxMp}`, "system");
    this.output(`DATA:  ${s.data}`, "system");
    this.output(`Level: ${s.level} | EXP: ${s.exp}/${s.nextExp}`, "system");
    this.output("════════════════════════════════════", "system");
  }

  cmdLook() {
    const zone = this.getZoneData(this.gameState.zone);
    if (!zone) {
      this.output("Zone not found.", "error");
      return;
    }
    
    this.output(`[ ${zone.name} ]`, "system");
    this.output(zone.description, "system");
    this.output("", "system");
  }

  cmdGo(args) {
    if (args.length === 0) {
      this.output("Usage: go <zone>", "error");
      return;
    }

    const targetZone = args[0].toLowerCase();
    const currentZone = this.gameState.zone;

    if (targetZone === currentZone) {
      this.output("You're already there.", "system");
      return;
    }

    const zone = this.getZoneData(targetZone);
    if (!zone) {
      this.output("That zone doesn't exist.", "error");
      return;
    }

    // Update state
    this.gameState.zone = targetZone;
    this.output(`You travel to ${zone.name}...`, "system");

    // Play zone transition sound
    this.audioSystem.onZoneChange(targetZone);

    // Track zone visit for quests
    this.trackAction("zone_visited", targetZone);

    // Dynamic encounter system
    if (!this._zoneClearTimestamps) this._zoneClearTimestamps = {};
    const now = Date.now();
    const lastClear = this._zoneClearTimestamps[targetZone] || 0;
    const fiveMin = 5 * 60 * 1000;
    let encounterTriggered = false;
    if (now - lastClear > fiveMin) {
      // 30% chance for normal encounter
      if (Math.random() < 0.3) {
        // 5% chance for epic corrupted memory
        if (Math.random() < 0.05) {
          this.triggerEpicEncounter(targetZone);
        } else {
          this.triggerDynamicEncounter(targetZone);
        }
        encounterTriggered = true;
      }
    }
    if (!encounterTriggered) {
      // Trigger look automatically
      setTimeout(() => this.cmdLook(), 300);
    }
  }

  triggerDynamicEncounter(zoneId) {
    if (window.EncounterSystem && window.DiceSystem) {
      const appendLine = (msg, type) => this.output(msg, type || "encounter");
      const roll = DiceSystem.rollEncounter();
      EncounterSystem.triggerEncounter(this.gameState, zoneId, roll, appendLine);
      // Mark zone as cleared for 5 min
      if (!this._zoneClearTimestamps) this._zoneClearTimestamps = {};
      this._zoneClearTimestamps[zoneId] = Date.now();
    } else {
      this.output("[ERROR] Encounter system not loaded.", "error");
      setTimeout(() => this.cmdLook(), 300);
    }
  }

  triggerEpicEncounter(zoneId) {
    if (window.EncounterSystem && window.DiceSystem) {
      const appendLine = (msg, type) => this.output(msg, type || "epic");
      // Use a special roll or scenario for epic
      const roll = { roll: 36, encounterSize: "EPIC", difficulty: "EPIC", narrative: "A corrupted memory manifests!" };
      EncounterSystem.triggerEncounter(this.gameState, zoneId, roll, appendLine);
      // Mark zone as cleared for 5 min
      if (!this._zoneClearTimestamps) this._zoneClearTimestamps = {};
      this._zoneClearTimestamps[zoneId] = Date.now();
    } else {
      this.output("[ERROR] Encounter system not loaded.", "error");
      setTimeout(() => this.cmdLook(), 300);
    }
  }



  cmdBattle(args) {
    if (this.gameState.inBattle) {
      this.output("Already in battle!", "error");
      return;
    }

    const enemyName = args.length > 0 ? args[0].toLowerCase() : "syntax-imp";
    const enemy = this.getEnemyData(enemyName);

    if (!enemy) {
      this.output(`Enemy '${enemyName}' not found.`, "error");
      return;
    }

    // Start battle
    this.gameState.inBattle = true;
    this.gameState.currentEnemy = JSON.parse(JSON.stringify(enemy));
    this.output(`⚔ A ${enemy.name} appears!`, "battle");
    this.output(`HP: ${enemy.hp}`, "battle");
    this.output("Commands: attack, run, stats", "battle");
    
    // Track for quest progress
    this.trackAction("battle_entered", 1);
  }

  attack() {
    if (!this.gameState.inBattle) {
      this.output("Not in battle!", "error");
      return;
    }

    const enemy = this.gameState.currentEnemy;
    const damage = Math.floor(Math.random() * 10) + 5 + this.gameState.level;

    enemy.hp -= damage;
    this.output(`You attack for ${damage} damage!`, "battle");
    
    // Play attack sound
    this.audioSystem.onAttack();

    if (enemy.hp <= 0) {
      this.endBattle(true);
    } else {
      this.enemyAttack();
    }
  }

  enemyAttack() {
    const enemy = this.gameState.currentEnemy;
    const damage = Math.floor(Math.random() * 5) + 2;

    this.gameState.hp -= damage;
    this.output(`${enemy.name} attacks for ${damage} damage!`, "battle");

    if (this.gameState.hp <= 0) {
      this.gameState.hp = this.gameState.maxHp;
      this.gameState.inBattle = false;
      this.output("You were defeated! Returned to hub.", "error");
      this.gameState.zone = "hub";
    }
  }

  run() {
    if (!this.gameState.inBattle) {
      this.output("Not in battle!", "error");
      return;
    }

    this.endBattle(false);
  }

  endBattle(victory) {
    const enemy = this.gameState.currentEnemy;

    if (victory) {
      this.output(`Defeated ${enemy.name}!`, "battle");
      this.gameState.exp += enemy.exp || 10;
      this.output(`Gained ${enemy.exp || 10} EXP!`, "highlight");
      
      // Harvest data from defeated enemy (spell tinkering)
      if (this.spellTinkering) {
        const dataHarvested = this.spellTinkering.harvestEnemyData(enemy, this.gameState.character);
        if (dataHarvested > 0) {
          this.output(`+${dataHarvested} data harvested via surveillance`, "highlight");
        }
      }
      
      // Play victory sound
      this.audioSystem.onBattleEnd(true);
      
      // Track for quest progress
      this.trackAction("battle_won", 1);
    } else {
      this.output("Escaped from battle!", "system");
      this.audioSystem.onBattleEnd(false);
    }

    this.gameState.inBattle = false;
    this.gameState.currentEnemy = null;
  }

  // ============================================================
  // [DATA ACCESS] - Stub methods for zone/enemy data
  // ============================================================

  getZoneData(zoneId) {
    // Use actual CastZones data from zones-puzzles.js
    if (window.CastZones && window.CastZones[zoneId]) {
      return window.CastZones[zoneId];
    }
    
    // Fallback for basic zones if CastZones not loaded
    const fallbackZones = {
      hub: {
        id: "hub",
        name: "Central Hub",
        desc: "A nexus of infinite corridors. The air hums with potential."
      },
      forest: {
        id: "forest",
        name: "Refactor Forest",
        desc: "Ancient trees made of nested code. Branches hum with logic."
      },
      city: {
        id: "city",
        name: "Breakpoint City",
        desc: "Neon skyscrapers flicker with paused execution. Time feels frozen."
      },
      wasteland: {
        id: "wasteland",
        name: "Debug Wasteland",
        desc: "Scorched earth where errors burn eternal."
      },
      cosmic: {
        id: "cosmic",
        name: "Cosmic Archive",
        desc: "Beyond reality, where all code converges."
      }
    };

    return fallbackZones[zoneId] || null;
  }

  getEnemyData(enemyId) {
    // Use actual CastEnemies data from encounters/battle systems
    if (window.CastEnemies && window.CastEnemies[enemyId]) {
      return window.CastEnemies[enemyId];
    }
    
    // Fallback for basic enemies if CastEnemies not loaded
    const fallbackEnemies = {
      "syntax-imp": {
        id: "syntax-imp",
        name: "Syntax Imp",
        hp: 15,
        attack: 3,
        exp: 10,
        level: 1
      },
      "null-wraith": {
        id: "null-wraith",
        name: "Null Wraith",
        hp: 25,
        attack: 5,
        exp: 20,
        level: 2
      },
      "debug-daemon": {
        id: "debug-daemon",
        name: "Debug Daemon",
        hp: 30,
        attack: 6,
        exp: 25,
        level: 3
      },
      "memory-leak": {
        id: "memory-leak",
        name: "Memory Leak",
        hp: 20,
        attack: 4,
        exp: 15,
        level: 2
      },
      "stack-overflow": {
        id: "stack-overflow",
        name: "Stack Overflow",
        hp: 40,
        attack: 8,
        exp: 35,
        level: 4
      }
    };

    return fallbackEnemies[enemyId] || null;
  }

  // ============================================================
  // [STATE ACCESS] - Getters for UI layer
  // ============================================================

  getState() {
    return this.gameState;
  }

  getStats() {
    return {
      hp: this.gameState.hp,
      maxHp: this.gameState.maxHp,
      mp: this.gameState.mp,
      maxMp: this.gameState.maxMp,
      level: this.gameState.level,
      exp: this.gameState.exp,
      nextExp: this.gameState.nextExp
    };
  }

  getCurrentZone() {
    return this.getZoneData(this.gameState.zone);
  }

  // ============================================================
  // [QUEST SYSTEM INTEGRATION]
  // ============================================================

  cmdQuest(args) {
    const action = args[0];

    switch (action) {
      case "start":
        const questId = args[1];
        if (!questId) {
          this.output("Usage: quest start <quest_id>", "error");
          return;
        }
        if (this.questSystem.startQuest(questId)) {
          const quest = this.questSystem.getQuestStatus(questId);
          this.output(`[QUEST START] ${quest.name}`, "system");
          this.output(quest.description, "hint");
        } else {
          this.output("Failed to start quest.", "error");
        }
        break;

      case "abandon":
        const abandonId = args[1];
        if (!abandonId) {
          this.output("Usage: quest abandon <quest_id>", "error");
          return;
        }
        if (this.questSystem.abandonQuest(abandonId)) {
          this.output(`Quest abandoned.`, "system");
        }
        break;

      default:
        this.output("Usage: quest start <id> | quest abandon <id>", "error");
    }
  }

  cmdQuests() {
    const activeQuests = this.questSystem.getActiveQuests();
    const completed = this.questSystem.completedQuests.length;

    if (activeQuests.length === 0) {
      this.output("No active quests. Type 'quest start <id>' to begin one.", "hint");
    } else {
      this.output("[ACTIVE QUESTS]", "system");
      for (let quest of activeQuests) {
        const questDef = this.questSystem.quests[quest.id];
        this.output(`  • ${quest.name} (${quest.progress}/${quest.total})`, "highlight");
      }
    }

    if (completed > 0) {
      this.output(`\nCompleted quests: ${completed}`, "hint");
    }

    if (this.questSystem.isGraphicsUnlocked()) {
      this.output("\n[GRAPHICS MODE UNLOCKED]", "battle");
      this.output("The visual rendering layer is active.", "highlight");
    }
  }

  cmdAudio(args) {
    const action = args[0];

    switch (action) {
      case "on":
        this.audioSystem.enabled = true;
        this.output("Audio enabled.", "system");
        this.audioSystem.playSFX("ui_confirm");
        break;

      case "off":
        this.audioSystem.enabled = false;
        this.output("Audio disabled.", "system");
        break;

      case "volume":
        const volume = parseFloat(args[1]);
        if (isNaN(volume) || volume < 0 || volume > 1) {
          this.output("Usage: audio volume <0.0-1.0>", "error");
          return;
        }
        this.audioSystem.setMasterVolume(volume);
        this.output(`Master volume: ${Math.round(volume * 100)}%`, "system");
        this.audioSystem.playSFX("ui_confirm");
        break;

      case "test":
        this.output("Testing audio...", "system");
        this.audioSystem.playSFX("ui_confirm");
        setTimeout(() => this.audioSystem.playSFX("spell_cast"), 200);
        setTimeout(() => this.audioSystem.playSFX("victory"), 400);
        break;

      default:
        this.output("Audio commands: on | off | volume <0-1> | test", "hint");
    }
  }

  cmdSave(args) {
    const slotNumber = parseInt(args[0]) || 0;
    
    if (isNaN(slotNumber) || slotNumber < 0 || slotNumber >= 3) {
      this.output("Save slots: 0, 1, 2", "error");
      return;
    }
    
    if (this.saveSystem.saveGame(slotNumber)) {
      this.output(`Game saved to slot ${slotNumber}`, "system");
      this.audioSystem.playSFX("ui_confirm");
    } else {
      this.output("Failed to save game", "error");
    }
  }

  cmdLoad(args) {
    const slotNumber = parseInt(args[0]) || 0;
    
    if (isNaN(slotNumber) || slotNumber < 0 || slotNumber >= 3) {
      this.output("Save slots: 0, 1, 2", "error");
      return;
    }
    
    if (this.saveSystem.loadGame(slotNumber)) {
      this.output(`Game loaded from slot ${slotNumber}`, "system");
      this.output(`Welcome back! You are level ${this.gameState.level} in ${this.gameState.zone}`, "highlight");
      this.audioSystem.playSFX("ui_confirm");
      this.onStateChange(this.gameState);
    } else {
      this.output("No save found in that slot", "error");
    }
  }

  // ============================================================
  // [QUEST TRACKING]
  // ============================================================

  trackAction(action, value = 1) {
    this.questSystem.trackAction(action, value);

    // Check if graphics should be unlocked
    if (this.questSystem.isGraphicsUnlocked() && !this.gameState.graphicsUnlocked) {
      this.unlockGraphics();
    }
  }

  unlockGraphics() {
    this.gameState.graphicsUnlocked = true;
    this.output("", "system");
    this.output("[SYSTEM ALERT]", "battle");
    this.output("A new layer of reality materializes...", "battle");
    this.output("The visual rendering system is now ONLINE.", "battle");
    this.output("Graphics mode has been UNLOCKED.", "battle");
    this.output("", "system");
    
    // Play graphics unlock sound
    this.audioSystem.onGraphicsUnlock();

    // Fire graphics unlock callback
    this.onGraphicsUnlock(true);
  }

  // ============================================================
  // [SPELL TINKERING COMMANDS]
  // ============================================================

  /**
   * Craft and cast a spell using spell-tinkering system
   * Usage: cast fire damage
   */
  castSpell(args) {
    if (!this.spellTinkering) {
      this.output("Spell tinkering system not initialized.", "error");
      return;
    }

    if (args.length < 2) {
      this.output("Usage: cast [element] [codebit] [codebit...]\\nExample: cast fire damage", "error");
      return;
    }

    const elements = [args[0].toLowerCase()];
    const codeBits = args.slice(1).map(b => b.toLowerCase());

    // Attempt to craft and cast
    const result = this.spellTinkering.attemptCraft(elements, codeBits, this.gameState.character);

    if (!result.success) {
      this.output(`Spell cast failed: ${result.message}`, "error");
      return;
    }

    // Deduct mana
    if (this.gameState.mp < result.manaCost) {
      this.output(`Not enough mana! Need ${result.manaCost}, have ${this.gameState.mp}.`, "error");
      return;
    }

    this.gameState.mp -= result.manaCost;

    // Cast spell
    this.output(`✨ Cast ${result.spell.name}!`, "spell");
    this.output(`Power: ${result.power} | Mana: ${result.manaCost} | Roll: ${result.rollQuality.toUpperCase()}`, "spell");

    if (result.isNewDiscovery) {
      this.output(`🌟 NEW SPELL DISCOVERED: ${result.spell.name}!`, "highlight");
    }

    // Apply spell in battle
    if (this.gameState.inBattle) {
      const enemy = this.gameState.currentEnemy;
      if (result.spell.codeBits.includes('damage')) {
        const damageDealt = Math.floor(result.power * 1.5);
        enemy.hp -= damageDealt;
        this.output(`${enemy.name} takes ${damageDealt} damage!`, "battle");
      }
      if (result.spell.codeBits.includes('heal')) {
        const healed = Math.min(this.gameState.maxHp, this.gameState.hp + result.power) - this.gameState.hp;
        this.gameState.hp += healed;
        this.output(`Healed for ${healed} HP!`, "battle");
      }

      if (enemy.hp <= 0) {
        this.endBattle(true);
      } else {
        this.enemyAttack();
      }
    }
  }

  /**
   * List available spells player can craft
   */
  cmdListSpells() {
    if (!this.spellTinkering) {
      this.output("Spell tinkering not initialized.", "error");
      return;
    }

    const available = this.spellTinkering.getAvailableSpells(this.gameState.character);
    
    if (available.length === 0) {
      this.output("No spells available yet. Explore and gather data!", "system");
      return;
    }

    this.output("📖 Available Spells:", "system");
    available.forEach(spell => {
      const affordable = this.spellTinkering.dataInventory.totalData >= spell.dataCost ? "✓" : "✗";
      this.output(`${affordable} ${spell.name} - ${spell.dataCost} data, ${spell.manaCost} mana`, "info");
    });
  }

  /**
   * Show current data inventory
   */
  cmdShowData() {
    if (!this.spellTinkering) {
      this.output("Spell tinkering not initialized.", "error");
      return;
    }

    const data = this.spellTinkering.dataInventory;
    this.output("💾 Data Inventory:", "system");
    this.output(`Total: ${data.totalData}`, "info");
    this.output(`- Enemy Surveillance: ${data.dataByType.enemySurveillance}`, "info");
    this.output(`- Environmental Scans: ${data.dataByType.environmentalScans}`, "info");
    this.output(`- Terminal Extracts: ${data.dataByType.terminalExtracts}`, "info");
    this.output(`Items Collected:`, "info");
    for (let [item, count] of Object.entries(data.collectedItems)) {
      if (count > 0) {
        this.output(`  ${item}: ${count}`, "info");
      }
    }
  }

  /**
   * Perform a summon ritual
   * Usage: summon fire summon
   */
  summonAlly(args) {
    if (!this.summonRituals) {
      this.output("Summon ritual system not initialized.", "error");
      return;
    }

    if (args.length < 2) {
      this.output("Usage: summon [element] [summon] [...]\\nExample: summon fire summon", "error");
      return;
    }

    const elements = [args[0].toLowerCase()];
    const codeBits = args.slice(1).map(b => b.toLowerCase());

    // Attempt summon ritual
    const result = this.summonRituals.attemptSummon(elements, codeBits, this.gameState.character);

    if (!result.success) {
      this.output(`Ritual failed: ${result.message}`, "error");
      
      if (result.failedAlly) {
        this.output(`⚠️ ${result.failedAlly.name} appears instead!`, "battle");
        this.output(`Type 'battle' to engage the aberration!`, "hint");
      }
      return;
    }

    const ally = result.ally;
    this.output(`✨ SUMMON RITUAL SUCCESSFUL!`, "spell");
    this.output(`${ally.name} has answered your call!`, "spell");
    this.output(`Level: ${ally.level} | HP: ${ally.hp} | Attack: ${ally.attack}`, "info");
    this.output(`Temperament: ${ally.temperament}`, "info");

    if (result.isNewDiscovery) {
      this.output(`🌟 NEW RITUAL DISCOVERED: ${ally.name}!`, "highlight");
    }

    if (result.isEphemeral) {
      this.output(`⏳ This ally will fade after battle.`, "hint");
    }
  }

  /**
   * List all active allies
   */
  cmdListAllies() {
    if (!this.summonRituals) {
      this.output("Summon ritual system not initialized.", "error");
      return;
    }

    const allies = this.summonRituals.listAllies();

    if (allies.length === 0) {
      this.output("No active allies. Perform a summon ritual!", "system");
      return;
    }

    this.output("👥 Active Allies:", "system");
    allies.forEach((ally, index) => {
      this.output(`${index + 1}. ${ally.name}`, "info");
      this.output(`   Ritual: ${ally.ritual} | Level: ${ally.level} | HP: ${ally.hp}`, "info");
      this.output(`   Temperament: ${ally.temperament} | Loyalty: ${ally.loyalty}%`, "info");
    });
  }

  /**
   * Get definitions for lore/encyclopedia
   */
  getDefinitions() {
    return this.gameState.definitions || {};
  }
}

// Export for use in HTML
window.GameEngine = GameEngine;
