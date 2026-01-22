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
    
    // Initialize save system
    this.saveSystem = new SaveSystem(this);
    
    // Initialize spell tinkering system (requires dice + AI DM)
    this.spellTinkering = null; // Set after dice/AI DM available
    
    // Initialize game state
    this.initializeGameState();
    
    console.log("[GameEngine] Initialized with quest + audio + spell tinkering");
  }

  /**
   * Parse and execute a command
   * Delegates to CommandParser if available, or internal cmd methods
   */
  async parseCommand(input) {
    if (!input || !input.trim()) return;
    
    // Parse parts for debug commands handling
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. Check for debug commands directly first
    if (command === "debug-graphics") {
        this.cmdDebugGraphics(args);
        return;
    }
    if (command === "debug-ai") {
        this.cmdDebugAI(args);
        return;
    }
    if (command === "apikey") {
        this.cmdApikey(args);
        return;
    }

    // 2. Delegate to CommandParser (if initialized)
    // Send full input string to parser
    if (window.CommandParser && window.CommandParser.parse) {
        window.CommandParser.parse(input);
        return;
    }
    
    // 3. Fallback: Internal dispatch (legacy/direct)
    // Dispatch to cmd[Command] (e.g. cmdStats, cmdHelp)
    const methodName = "cmd" + command.charAt(0).toUpperCase() + command.slice(1);
    if (typeof this[methodName] === "function") {
        await this[methodName](args);
    } else {
        this.output(`Unknown command: '${command}'. Type 'help' for commands.`, "hint");
        this.output("Available commands: help, look, stats, go, battle, inventory, spells, cast, roll, use, map, quests, save, load", "hint");
    }
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

  /**
   * API KEY MANAGEMENT COMMAND
   * Usage: apikey set <key> | apikey clear | apikey status
   */
  async cmdApikey(args) {
    if (!window.electronAPI) {
        this.output("❌ Secure Storage Unavailable: Not running in Electron client.", "error");
        return;
    }

    const action = args[0] ? args[0].toLowerCase() : "status";
    const provider = "anthropic"; // Default for now
    
    if (action === "status") {
        const key = await window.electronAPI.getApiKey(provider);
        this.output("🔑 API KEY STATUS:", "system");
        if (key) {
           this.output(`  Provider: ${provider}`, "info");
           // Show first/last chars
           const masked = key.substring(0, 8) + "..." + key.substring(key.length - 4);
           this.output(`  Key: ${masked}`, "highlight");
           this.output(`  Source: ${key.startsWith("sk-") ? "Valid Format" : "Unknown Format"}`, "hint");
        } else {
           this.output("  No local API Key found.", "info");
           this.output("  Game will attempt to use Backend Proxy.", "hint");
        }
        return;
    }

    if (action === "set") {
        const key = args[1];
        if (!key || key.length < 10) {
            this.output("❌ Invalid Key Format.", "error");
            return;
        }
        
        const result = await window.electronAPI.setApiKey(provider, key);
        if (result) {
            this.output("✅ API Key Saved Securely.", "highlight");
            // Reload config
            if (window.AIConfig) await window.AIConfig.loadElectronApiKey();
        } else {
            this.output("❌ Failed to save key.", "error");
        }
        return;
    }

    if (action === "clear") {
        await window.electronAPI.setApiKey(provider, null);
        this.output("🗑️ API Key Removed.", "system");
        if (window.AIConfig) window.AIConfig.config.apiKeys.anthropic = null;
    }
  }

  // ============================================================
  // [DEBUG TOOLS]
  // ============================================================

  /**
   * DEBUG: Test AI backend connection
   */
  async cmdDebugAI() {
    this.output("🔍 DIAGNOSTIC: Testing AI Backend...", "system");
    
    if (!window.AIConfig) {
      this.output("❌ AIConfig not loaded.", "error");
      return;
    }

    const config = window.AIConfig.config;
    // Mask API Key
    const hasKey = !!config.apiKeys.anthropic;
    
    this.output(`Target URL: ${config.backendUrl}`, "info");
    this.output(`Use Backend: ${config.useBackend}`, "info");
    this.output(`API Key Loaded: ${hasKey ? "YES (Local)" : "NO (Using Proxy)"}`, "highlight");

    this.output("Pinging backend health...", "system");
    try { 
        // We use wait-free fetch to avoid UI freeze if timeout is long
        fetch(`${config.backendUrl}/api/health`, { method: "HEAD" }).then(res => {
             if (res.ok || res.status === 404) { // 404 means server is there but route might be wrong
                 this.output(`✅ Backend Reachable (Status: ${res.status})`, "highlight");
             } else {
                 this.output(`⚠️ Backend warning: Status ${res.status}`, "error");
             }
        }).catch(err => {
             this.output(`❌ Backend Connection Failed: ${err.message}`, "error");
             this.output("Troubleshoot: check internet or if Render server is waking up.", "hint");
        });
    } catch (e) {
        this.output("Fetch Error: " + e.message, "error");
    }

    // Attempt generation via AIConfig
    this.output("Testing generation...", "system");
    try {
        window.AIConfig.generate("Short hello.", "dm").then(res => {
            this.output(`AI Response: "${res}"`, "speech");
        }).catch(err => {
            this.output(`Generation Error: ${err.message}`, "error");
        });
    } catch (e) {
        this.output(`Config Error: ${e.message}`, "error");
    }
  }

  /**
   * DEBUG: Force enable graphics
   */
  cmdDebugGraphics(args) {
    this.output("📺 DIAGNOSTIC: Graphics Layer", "system");
    this.output("Mode: " + (args && args.length > 0 ? args[0] : "Test Loop"), "info");
    
    const container = document.getElementById("graphics-container");
    if (!container) {
        this.output("❌ #graphics-container DIV missing.", "error");
        return;
    }
    
    // Force Visible
    container.style.display = "block";

    // Send Unlock Signal
    if (this.onGraphicsUnlock) {
        this.onGraphicsUnlock(true);
    }

    // Helper to render a specific zone
    const renderZone = (zoneId) => {
        if (!window.graphicsUI) return;
        
        this.output(`🎨 Rendering: ${zoneId.toUpperCase()}`, "info");
        window.graphicsUI.currentZone = zoneId;
        
        // Force refresh background cache test
        if (window.graphicsUI._bgImages) window.graphicsUI._bgImages[zoneId] = null;
        
        window.graphicsUI.draw();
        
        // Simulate an effect
        if (window.graphicsUI.queueAnimation) {
             window.graphicsUI.queueAnimation("zone_transition", 1000);
        }
    };

    // Wait for UI initialization then run test
    setTimeout(() => {
        if (window.graphicsUI) {
            this.output("✅ GraphicsUI Connected", "highlight");
            
            if (args && args.length > 0) {
                // Render specific zone
                renderZone(args[0]);
            } else {
                // Run Test Loop
                const zones = ["hub", "forest", "city", "wasteland", "cosmic"];
                let i = 0;
                this.output("🔄 Starting Visual Test Sequence...", "highlight");
                
                // Immediate first render
                renderZone(zones[0]);
                i++;

                const interval = setInterval(() => {
                    if (i >= zones.length) {
                        clearInterval(interval);
                        this.output("✅ Test Sequence Complete.", "system");
                        // Restore
                        window.graphicsUI.currentZone = this.gameState.zone;
                        window.graphicsUI.draw();
                        return;
                    }
                    renderZone(zones[i]);
                    i++;
                }, 3000);
            }
        } else {
             this.output("❌ GraphicsUI object not found globally.", "error");
        }
    }, 500);
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
      case "terminal":
        this.cmdTerminal(args);
        break;
      case "encounter":
      case "choose":
        this.cmdEncounterChoice(args);
        break;
      case "inventory":
        this.cmdInventory();
        break;
      case "map":
        this.cmdMap();
        break;
      case "boss":
        this.cmdBoss();
        break;
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
    this.output("  map - Show world map", "system");
    this.output("", "system");
    this.output("COMBAT:", "highlight");
    this.output("  battle [enemy] - Start battle", "system");
    this.output("  attack - Attack in battle", "system");
    this.output("  run - Flee battle", "system");
    this.output("  boss - Challenge zone boss", "system");
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
    this.output("EXPLORATION:", "highlight");
    this.output("  terminal [id] - Access ancient terminals", "system");
    this.output("  encounter <choice> - Make encounter decision", "system");
    this.output("  inventory - View your items", "system");
    this.output("", "system");
    this.output("INFO:", "highlight");
    this.output("  stats - View character stats", "system");
    this.output("  quests - View active quests", "system");
    this.output("  save <slot> - Save game (0-2)", "system");
    this.output("  load <slot> - Load game (0-2)", "system");
    this.output("  help - This message", "system");
    this.output("", "system");
    this.output("MUSIC:", "highlight");
    this.output("  music play [theme] - Play music", "system");
    this.output("  music stop - Stop music", "system");
    this.output("  music volume [0-100] - Set volume", "system");
    this.output("", "system");
    this.output("DEBUG:", "highlight");
    this.output("  test ai - Test AI backend connection", "system");
    this.output("  test music - Test MIDI player", "system");
    this.output("  test deck - Test deck functionality", "system");
    this.output("", "system");
  }

  /**
   * DEBUG: Test AI backend connection
   */
  async cmdDebugAI() {
    this.output("🔍 DIAGNOSTIC: Testing AI Backend...", "system");
    
    if (!window.AIConfig) {
      this.output("❌ AIConfig not loaded.", "error");
      return;
    }

    const config = window.AIConfig.config;
    this.output(`Target URL: ${config.backendUrl}`, "info");
    this.output(`Use Backend: ${config.useBackend}`, "info");
    this.output(`API Key Present: ${config.apiKeys.anthropic ? "YES" : "NO"}`, "info");

    try {
      const response = await fetch(`${config.backendUrl}/api/health`); // Note: /api/health might 404, we check connection
      if (response.status !== 503) { // Any response means connection exists
        this.output(`✅ Backend Reachable (Status: ${response.status})`, "highlight");
      } else {
        this.output(`❌ Backend Unavailable (${response.status})`, "error");
      }
    } catch (e) {
        this.output(`❌ Backend Connection Failed: ${e.message}`, "error");
    }

    // Attempt generation
    this.output("Trying simple generation...", "system");
    try {
        const result = await window.AIConfig.generate("Say 'Hello' briefly.", "dm");
        this.output(`Result: ${result}`, "speech");
    } catch (e) {
        this.output(`Generation Error: ${e.message}`, "error");
    }
  }

  /**
   * DEBUG: Force enable graphics
   */
  cmdDebugGraphics() {
    this.output("📺 DIAGNOSTIC: Force enabling graphics layer...", "system");
    
    const container = document.getElementById("graphics-container");
    if (!container) {
        this.output("❌ #graphics-container DIV missing from HTML.", "error");
        return;
    }
    
    this.output("Found container. Force unlocking...", "info");
    container.style.display = "block"; // Force visible
    
    if (this.onGraphicsUnlock) {
        this.onGraphicsUnlock(true);
        this.output("✅ Unlock signal sent.", "highlight");
        
        // Check if canvas exists
        setTimeout(() => {
            const canvas = container.querySelector("canvas");
            if (canvas) {
                this.output("✅ Canvas detected.", "info");
                // Force a redraw
                if (window.graphicsUI) {
                    window.graphicsUI.draw();
                    this.output("✅ Redraw triggered.", "info");
                }
            } else {
                this.output("⚠️ Canvas NOT created yet.", "error");
            }
        }, 500);
    } else {
        this.output("❌ onGraphicsUnlock handler missing.", "error");
    }
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
    
    // Play contextual music for new zone
    this.playContextMusic();

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

    this.startBattle(enemy);
  }

  /**
   * Internal method to start battle with an enemy object
   */
  startBattle(baseEnemy) {
    this.gameState.inBattle = true;
    this.gameState.currentEnemy = JSON.parse(JSON.stringify(baseEnemy));
    
    // Play battle music
    this.playContextMusic();
    
    this.output(`⚔ A ${this.gameState.currentEnemy.name} appears!`, "battle");
    this.output(`HP: ${this.gameState.currentEnemy.hp}`, "battle");
    this.output("Commands: attack, run, stats", "battle");
    
    // Check for active allies
    if (this.summonRituals) {
        const allies = this.summonRituals.getActiveAllies();
        if (allies.length > 0) {
            this.output(`Your allies stand ready: ${allies.map(a => a.name).join(', ')}`, "spell");
        }
    }

    // Track for quest progress
    this.trackAction("battle_entered", 1);
  }

  attack() {
    if (!this.gameState.inBattle) {
      this.output("Not in battle!", "error");
      return;
    }

    const enemy = this.gameState.currentEnemy;
    
    // 1. Player Attack
    const playerDamage = Math.floor(Math.random() * 10) + 5 + this.gameState.level;
    enemy.hp -= playerDamage;
    this.output(`You attack for ${playerDamage} damage!`, "battle");
    
    // Play attack sound
    if (this.audioSystem) this.audioSystem.onAttack();

    // 2. Ally Actions
    if (enemy.hp > 0 && this.summonRituals) {
        const allies = this.summonRituals.getActiveAllies();
        allies.forEach(ally => {
             // Basic ally AI
             if (ally.personality && ally.personality.combatStyle === 'supportive') {
                 // Heal player
                 const heal = Math.floor(ally.level * 1.5);
                 this.gameState.hp = Math.min(this.gameState.maxHp, this.gameState.hp + heal);
                 this.output(`${ally.name} heals you for ${heal} HP!`, "spell");
             } else {
                 // Attack enemy
                 const allyDmg = ally.attack || Math.floor(ally.level * 2);
                 enemy.hp -= allyDmg;
                 this.output(`${ally.name} attacks for ${allyDmg} damage!`, "battle");
             }
             
             // Update ally stats logic hook
             if (this.gameState.inBattle && enemy.hp <= 0) {
                 // handled in endBattle usually, but here we can track contribution
             }
        });
    }

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
      
      // UNLOCK SUMMON RITUAL FOR DEFEATED ENEMY
      if (this.summonRituals) {
          const ritual = this.summonRituals.registerEnemyRitual(enemy);
          if (ritual) {
              this.output(`🔓 Enemy Code Analyzed: ${ritual.name}`, "spell");
              this.output(`   To Reconstruct: summon ${ritual.elements.join(' ')} ${ritual.codeBits.join(' ')}`, "hint");
              this.output(`   Cost: ${ritual.dataCost} Data | Difficulty: ${ritual.minQuality}`, "hint");
          }
      }

      // Play victory music briefly, then return to exploration
      if (window.MIDIPlayer) {
        window.MIDIPlayer.playTheme('victory');
        setTimeout(() => this.playContextMusic(), 3000);
      }
      
      // Play victory sound
      this.audioSystem.onBattleEnd(true);
      
      // Track for quest progress
      this.trackAction("battle_won", 1);

      // Handle Ally Growth & Ephemeral Cleanup
      if (this.summonRituals) {
        this.summonRituals.getActiveAllies().forEach(ally => {
           this.summonRituals.updateAllyStats(ally.id, 0, 0, true); 
        });
        
        const faded = this.summonRituals.cleanupEphemeralAllies();
        if (faded > 0) this.output(`${faded} allies returned to the ether.`, "spell");
      }
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
        this.output(`The aberration attacks immediately!`, "error");
        
        // Force start battle with the aberration
        this.startBattle(result.failedAlly);
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

  // ============================================================
  // [TERMINAL COMMAND] - Ancient Terminal Access
  // ============================================================

  /**
   * Access an ancient terminal
   * Usage: terminal [terminalId] or terminal (lists available)
   */
  cmdTerminal(args) {
    // Check if AncientTerminal system is loaded
    if (!window.AncientTerminal) {
      this.output("Ancient terminal system not initialized.", "error");
      return;
    }

    // If already in a terminal, handle terminal commands
    if (window.AncientTerminal.active) {
      this.output("Already in terminal. Type 'exit' to disconnect.", "hint");
      return;
    }

    // Show the terminals window when accessing terminal system
    if (window.UILayoutManager) {
      UILayoutManager.showTerminalsWindow();
    }

    // List available terminals if no arg
    if (args.length === 0) {
      this.output("════════════════════════════════════", "system");
      this.output("[ AVAILABLE TERMINALS ]", "system");
      this.output("════════════════════════════════════", "system");
      
      // Get terminals for current zone
      const zoneTerminals = Object.keys(window.CastTerminals || {}).filter(id => {
        return id.startsWith(this.gameState.zone + ":");
      });
      
      if (zoneTerminals.length === 0) {
        this.output("No terminals detected in this zone.", "system");
        this.output("", "system");
        this.output("Try exploring other zones:", "hint");
        this.output("  go forest | go city | go wasteland", "hint");
      } else {
        zoneTerminals.forEach(id => {
          const terminal = window.CastTerminals[id];
          this.output(`terminal ${id} - ${terminal.name}`, "hint");
        });
        this.output("", "system");
        this.output("Usage: terminal <id>", "hint");
      }
      return;
    }

    // Open specific terminal
    const terminalId = args.join(":");
    window.AncientTerminal.open(terminalId, (text, type) => this.output(text, type));
  }

  // ============================================================
  // [ENCOUNTER CHOICE] - Resolve Encounter Decisions
  // ============================================================

  /**
   * Make a choice during an encounter
   * Usage: encounter <choice> or choose <choice>
   */
  cmdEncounterChoice(args) {
    // Check if encounter system is loaded
    if (!window.EncounterSystem) {
      this.output("Encounter system not initialized.", "error");
      return;
    }

    // Check if there's an active encounter
    if (!this.gameState.currentEncounter || !this.gameState.currentEncounter.active) {
      this.output("No active encounter. Explore to find one!", "hint");
      return;
    }

    // Need a choice argument
    if (args.length === 0) {
      this.output("What do you choose? Type 'encounter <choice>'", "system");
      window.EncounterSystem.presentChoices(this.gameState.currentEncounter, (text, type) => this.output(text, type));
      return;
    }

    const choice = args[0].toLowerCase();
    
    // Resolve the choice
    window.EncounterSystem.resolveChoice(
      this.gameState,
      choice,
      (text, type) => this.output(text, type),
      (args) => this.cmdBattle(args),
      (args) => this.cmdGo(args)
    );
  }

  // ============================================================
  // [INVENTORY COMMAND] - Show player inventory
  // ============================================================

  cmdInventory() {
    this.output("════════════════════════════════════", "system");
    this.output("[ INVENTORY ]", "system");
    this.output("════════════════════════════════════", "system");
    
    const inventory = this.gameState.inventory || [];
    
    if (inventory.length === 0) {
      this.output("Your pack is empty.", "system");
      this.output("", "system");
      this.output("Find items by:", "hint");
      this.output("  - Defeating enemies", "hint");
      this.output("  - Completing quests", "hint");
      this.output("  - Exploring terminals", "hint");
    } else {
      inventory.forEach((item, index) => {
        if (typeof item === 'string') {
          this.output(`${index + 1}. ${item}`, "info");
        } else {
          this.output(`${index + 1}. ${item.name || item.id} ${item.quantity ? 'x' + item.quantity : ''}`, "info");
          if (item.desc) {
            this.output(`   ${item.desc}`, "system");
          }
        }
      });
      this.output("", "system");
      this.output(`Total items: ${inventory.length}`, "system");
    }
  }

  // ============================================================
  // [MAP COMMAND] - Show zone overview
  // ============================================================

  cmdMap() {
    this.output("════════════════════════════════════", "system");
    this.output("[ WORLD MAP ]", "system");
    this.output("════════════════════════════════════", "system");
    this.output("", "system");
    
    const zones = {
      hub: { name: "The Hub", desc: "Central nexus of all zones", subzones: ["hub_center", "hub_north", "hub_east", "hub_south", "hub_west"] },
      forest: { name: "Digital Forest", desc: "Corrupted data wilderness", subzones: ["forest_clearing", "forest_deep", "forest_grove"] },
      city: { name: "Neon City", desc: "Urban sprawl of light and shadow", subzones: ["city_streets", "city_alley", "city_plaza"] },
      wasteland: { name: "Data Wasteland", desc: "Corrupted memory banks", subzones: ["wasteland_ruins", "wasteland_crater"] },
      cosmic: { name: "Cosmic Void", desc: "Beyond the firewall", subzones: ["cosmic_rift", "cosmic_core"] }
    };
    
    const currentZone = this.gameState.zone;
    const visitedZones = this.gameState.visitedZones || [currentZone];
    
    for (const [id, zone] of Object.entries(zones)) {
      const isCurrent = id === currentZone;
      const isVisited = visitedZones.includes(id);
      const marker = isCurrent ? "▶" : (isVisited ? "✓" : "?");
      
      this.output(`${marker} ${zone.name} (${id})`, isCurrent ? "highlight" : (isVisited ? "system" : "error"));
      if (isVisited || isCurrent) {
        this.output(`  ${zone.desc}`, "system");
      }
    }
    
    this.output("", "system");
    this.output("Travel: go <zone>", "hint");
    this.output("Example: go forest", "hint");
  }

  // ============================================================
  // [BOSS COMMAND] - Trigger boss encounter in boss zones
  // ============================================================

  cmdBoss() {
    // Check if BossEncounters system is loaded
    if (!window.BossEncounters) {
      this.output("Boss encounter system not initialized.", "error");
      return;
    }

    // Check if in a boss zone
    const currentSubzone = this.gameState.subzone || this.gameState.zone + "_center";
    const zoneData = this.getZoneData(this.gameState.zone);
    const subzoneData = zoneData?.subzones?.[currentSubzone];
    
    if (!subzoneData?.bossZone) {
      this.output("════════════════════════════════════", "system");
      this.output("[ NO BOSS HERE ]", "system");
      this.output("════════════════════════════════════", "system");
      this.output("", "system");
      this.output("You sense no overwhelming presence in this area.", "system");
      this.output("", "system");
      this.output("Boss zones:", "hint");
      this.output("  wasteland_abyss - The Abyss Sentinel", "hint");
      this.output("  cosmic_throne - The Auditor", "hint");
      this.output("  train_platform - The Recursion (secret)", "hint");
      return;
    }

    // Get the boss for this zone
    const bossId = subzoneData.boss;
    const boss = window.BossEncounters.bosses[bossId];
    
    if (!boss) {
      this.output("The boss presence has faded... for now.", "error");
      return;
    }

    // Check if already defeated
    if (this.gameState.defeatedBosses && this.gameState.defeatedBosses.includes(bossId)) {
      this.output("════════════════════════════════════", "system");
      this.output("[ BOSS DEFEATED ]", "system");
      this.output("════════════════════════════════════", "system");
      this.output("", "system");
      this.output(`You have already defeated ${boss.name}.`, "system");
      this.output("The echoes of that battle still linger here.", "hint");
      return;
    }

    // Trigger boss encounter
    this.output("", "system");
    this.output("════════════════════════════════════════════", "battle");
    this.output("⚔ BOSS ENCOUNTER ⚔", "battle");
    this.output("════════════════════════════════════════════", "battle");
    this.output("", "system");
    this.output(`${boss.name} emerges!`, "battle");
    this.output(`Tier: ${boss.tier.toUpperCase()}`, "system");
    this.output(`${boss.description}`, "hint");
    this.output("", "system");
    this.output(`HP: ${boss.hp} | ATK: ${boss.attack} | DEF: ${boss.defense}`, "system");
    this.output("", "system");
    
    // Set up boss battle
    const scaledBoss = window.BossEncounters.scaleBossDifficulty(boss, this.gameState);
    this.gameState.inBattle = true;
    this.gameState.currentEnemy = {
      ...scaledBoss,
      isBoss: true
    };
    
    this.output("Type 'attack' to strike or 'cast <spell>' to use magic!", "hint");
    this.output("Type 'run' to attempt escape (bosses are hard to flee!)", "hint");
  }
}

// Export for use in HTML
window.GameEngine = GameEngine;

// ============================================================
// [ADDITIONAL ESSENTIAL COMMANDS] 
// Adding missing commands that players expect to be available
// ============================================================

GameEngine.prototype.cmdInventory = function() {
  this.output("🎒 [INVENTORY]", "system");
  const inventory = this.gameState.inventory || [];
  
  if (inventory.length === 0) {
    this.output("Your pack is empty.", "hint");
    return;
  }
  
  this.output("═════════════════════════════════", "hint");
  inventory.forEach((item, i) => {
    const qty = item.quantity || 1;
    this.output(`${i + 1}. ${item.name} ${qty > 1 ? `(x${qty})` : ''}`, "text");
    if (item.description) {
      this.output(`   ${item.description}`, "hint");
    }
  });
  this.output("═════════════════════════════════", "hint");
};

GameEngine.prototype.cmdRoll = function(args) {
  if (!args || args.length === 0) {
    this.output("Usage: roll dX (e.g., roll d20, roll 2d6)", "hint");
    return;
  }
  
  const diceNotation = args[0];
  
  if (window.DiceSystem && window.DiceSystem.rollNotation) {
    try {
      const result = window.DiceSystem.rollNotation(diceNotation);
      this.output(`🎲 Rolling ${diceNotation}...`, "spell");
      this.output(`Result: ${result.total}`, "highlight");
      
      if (result.rolls && result.rolls.length > 1) {
        this.output(`Individual rolls: [${result.rolls.join(", ")}]`, "hint");
      }
    } catch (error) {
      this.output(`❌ Invalid dice notation: ${diceNotation}`, "error");
      this.output("Examples: d20, 2d6, 3d8+5", "hint");
    }
  } else {
    this.output("❌ Dice system not available", "error");
  }
};

GameEngine.prototype.cmdUse = function(args) {
  if (!args || args.length === 0) {
    this.output("Usage: use [item name]", "hint");
    return;
  }
  
  const itemName = args.join(" ").toLowerCase();
  const inventory = this.gameState.inventory || [];
  const item = inventory.find(i => i.name.toLowerCase().includes(itemName));
  
  if (!item) {
    this.output(`❌ You don't have '${itemName}' in your inventory.`, "error");
    this.output("Use 'inventory' to see what you have.", "hint");
    return;
  }
  
  this.output(`🔧 Using: ${item.name}`, "system");
  
  // Handle specific item types
  if (item.type === "potion") {
    if (item.effect === "heal") {
      const healing = item.power || 20;
      this.gameState.hp = Math.min(this.gameState.maxHp, this.gameState.hp + healing);
      this.output(`💚 Restored ${healing} HP!`, "highlight");
    }
  } else if (item.type === "tool") {
    this.output(`⚙️ ${item.name} activated!`, "highlight");
    if (item.effect) {
      this.output(item.effect, "text");
    }
  } else {
    this.output(`✨ ${item.name} shimmers with unknown power...`, "text");
  }
  
  // Remove item if consumable
  if (item.consumable !== false) {
    if (item.quantity && item.quantity > 1) {
      item.quantity--;
    } else {
      const index = inventory.indexOf(item);
      inventory.splice(index, 1);
    }
  }
};

// Alias commands for convenience
GameEngine.prototype.cmdInv = GameEngine.prototype.cmdInventory;

// ============================================================
// [MUSIC COMMANDS] - MIDI music system integration
// ============================================================

GameEngine.prototype.cmdMusic = function(args) {
  if (!window.MIDIPlayer) {
    this.output("❌ Music system not available", "error");
    return;
  }

  if (!args || args.length === 0) {
    this.output("🎵 [MUSIC PLAYER]", "system");
    this.output("═════════════════════════════════", "hint");
    this.output("Commands:", "text");
    this.output("  music play [theme] - Play music theme", "hint");
    this.output("  music stop - Stop current music", "hint");
    this.output("  music volume [0-100] - Set volume", "hint");
    this.output("  music list - Show available themes", "hint");
    this.output("", "text");
    this.output("Available themes: menu, battle, exploration, victory", "hint");
    return;
  }

  const command = args[0].toLowerCase();
  
  if (command === "play") {
    const theme = args[1] || "menu";
    window.MIDIPlayer.playTheme(theme);
    this.output(`🎵 Now playing: ${theme} theme`, "highlight");
  }
  else if (command === "stop") {
    window.MIDIPlayer.stop();
    this.output("🔇 Music stopped", "system");
  }
  else if (command === "volume") {
    const volume = parseInt(args[1]);
    if (isNaN(volume) || volume < 0 || volume > 100) {
      this.output("Usage: music volume [0-100]", "hint");
      return;
    }
    window.MIDIPlayer.setVolume(volume / 100);
    this.output(`🔊 Volume set to ${volume}%`, "system");
  }
  else if (command === "list") {
    this.output("🎵 Available Music Themes:", "system");
    this.output("═════════════════════════════════", "hint");
    this.output("  menu        - Main Technomancer theme", "text");
    this.output("  battle      - Intense combat music", "text");
    this.output("  exploration - Ambient discovery theme", "text");
    this.output("  victory     - Triumphant success music", "text");
  }
  else {
    this.output("Unknown music command. Type 'music' for help.", "error");
  }
};

// Auto-play contextual music
GameEngine.prototype.playContextMusic = function() {
  if (!window.MIDIPlayer) return;
  
  if (this.gameState.inBattle) {
    window.MIDIPlayer.playTheme('battle');
  } else if (this.gameState.zone === 'hub') {
    window.MIDIPlayer.playTheme('menu');
  } else {
    window.MIDIPlayer.playTheme('exploration');
  }
};

// Test commands for debugging
GameEngine.prototype.cmdTest = function(args) {
  const testType = args[0]?.toLowerCase();
  
  switch (testType) {
    case 'ai':
      this.testAI();
      break;
    case 'music':
      this.testMusic();
      break;
    case 'deck':
      this.testDeck();
      break;
    case 'generate':
      this.testGenerate();
      break;
    case 'local':
      this.testLocalAI();
      break;
    default:
      this.output("Test commands:", "system");
      this.output("  test ai    - Test AI backend connection", "hint");
      this.output("  test music - Test MIDI player", "hint");
      this.output("  test deck  - Test deck functionality", "hint");
      this.output("  test generate - Test AI generation", "hint");
      this.output("  test local - Test local model connection", "hint");
      break;
  }
};

GameEngine.prototype.testAI = async function() {
  this.output("🔍 Testing AI backend connection...", "system");
  
  if (!window.AIConfig) {
    this.output("❌ AI Config not loaded", "error");
    return;
  }
  
  try {
    const result = await AIConfig.testConnection();
    if (result.success) {
      this.output("✅ AI backend connection successful!", "highlight");
      this.output(`Backend URL: ${AIConfig.config.backendUrl}`, "hint");
    } else {
      this.output("❌ AI backend connection failed:", "error");
      this.output(result.error, "error");
    }
    
    // Show provider status
    this.output("", "system");
    this.output("🤖 AI Provider Status (Priority Order):", "system");
    this.output(`1. Local Model: ${AIConfig.state.availableProviders.includes('local') ? '✅ Connected' : '❌ Not Running'}`, "hint");
    this.output(`2. HuggingFace: ${AIConfig.state.availableProviders.includes('huggingface') ? '✅ Available (Free)' : '❌ Unavailable'}`, "hint");
    this.output(`3. OpenRouter: ${AIConfig.config.apiKeys.openrouter ? '✅ User Key Set' : '❌ No Key'}`, "hint");
    this.output(`4. Google Gemini: ${AIConfig.config.apiKeys.google ? '✅ User Key Set' : '❌ No Key'}`, "hint");
    this.output(`5. Claude: ${AIConfig.config.apiKeys.anthropic ? '✅ User Key Set' : '❌ No Key'}`, "hint");
    this.output(`Active Provider: ${AIConfig.state.activeProvider || 'None'}`, "highlight");
    
    // User instructions
    this.output("", "system");
    this.output("📝 Setup Instructions:", "system");
    if (!AIConfig.state.availableProviders.includes('local')) {
      this.output("  For better AI: Install LM Studio or Ollama locally", "hint");
    }
    this.output("  Set API key: AIConfig.setAPIKey('openrouter', 'your-key')", "hint");
    
    // Security status - should be secure now
    const security = AIConfig.checkSecurityStatus();
    if (security.secure) {
      this.output("", "system");
      this.output("✅ SECURITY: Safe for public distribution", "highlight");
    }
    
  } catch (error) {
    this.output("❌ AI test error:", "error");
    this.output(error.message, "error");
  }
};

GameEngine.prototype.testMusic = function() {
  this.output("🎵 Testing MIDI music system...", "system");
  
  if (!window.MIDIPlayer) {
    this.output("❌ MIDI Player not loaded", "error");
    return;
  }
  
  try {
    this.output("✅ MIDI Player loaded", "highlight");
    this.output("Available themes:", "hint");
    Object.keys(window.MIDIPlayer.songs).forEach(theme => {
      this.output(`  - ${theme}`, "text");
    });
    
    this.output("🎶 Playing test melody...", "system");
    window.MIDIPlayer.playTheme('menu');
    
  } catch (error) {
    this.output("❌ MIDI test error:", "error");
    this.output(error.message, "error");
  }
};

GameEngine.prototype.testDeck = function() {
  this.output("🃏 Testing deck functionality...", "system");
  
  if (!window.PaneManager) {
    this.output("❌ Pane Manager not loaded", "error");
    return;
  }
  
  this.output("✅ Pane Manager loaded", "highlight");
  this.output(`Active panes: ${Object.keys(PaneManager.panes).length}`, "hint");
  this.output(`Deck panes: ${PaneManager.deck.panes.length}`, "hint");
  
  if (PaneManager.deck.panes.length > 0) {
    this.output("Deck contents:", "hint");
    PaneManager.deck.panes.forEach(paneId => {
      this.output(`  - ${paneId}`, "text");
    });
    this.output("💡 Click on deck card headers to undock", "system");
  } else {
    this.output("Deck is empty", "hint");
  }
};

GameEngine.prototype.testGenerate = async function() {
  this.output("🧪 Testing AI text generation...", "system");
  
  if (!window.AIConfig) {
    this.output("❌ AI Config not loaded", "error");
    return;
  }
  
  try {
    this.output("Generating test content...", "hint");
    const testPrompt = "Generate a brief mysterious message about an ancient artifact";
    const result = await AIConfig.generate(testPrompt, "crystalBall");
    
    if (result) {
      this.output("✅ AI Generation successful!", "highlight");
      this.output("Generated text:", "system");
      this.output(`"${result}"`, "text");
    } else {
      this.output("❌ AI Generation failed - no response", "error");
    }
  } catch (error) {
    this.output("❌ AI Generation error:", "error");
    this.output(error.message, "error");
  }
};

GameEngine.prototype.testLocalAI = async function() {
  this.output("🖥️ Testing local AI model connection...", "system");
  
  if (!window.AIConfig) {
    this.output("❌ AI Config not loaded", "error");
    return;
  }
  
  try {
    this.output("Checking for LM Studio (port 1234)...", "hint");
    const lmCheck = await AIConfig.checkLocalModel();
    
    if (lmCheck) {
      this.output("✅ Local model detected and available!", "highlight");
      this.output("🎯 Local models provide:", "system");
      this.output("  • Private AI (no data sent to cloud)", "text");
      this.output("  • Faster responses (no internet delay)", "text");
      this.output("  • No API costs or rate limits", "text");
      
      // Test generation if available
      if (AIConfig.state.availableProviders.includes('local')) {
        this.output("", "system");
        this.output("Testing local generation...", "hint");
        const result = await AIConfig.generate("Generate a short test message", "crystalBall");
        if (result) {
          this.output("✅ Local generation successful!", "highlight");
          this.output(`Response: "${result}"`, "text");
        }
      }
    } else {
      this.output("❌ No local model detected", "error");
      this.output("", "system");
      this.output("💡 To setup local AI:", "system");
      this.output("  1. Install LM Studio or Ollama", "hint");
      this.output("  2. Download a model (recommend: Llama 3.1 8B)", "hint");
      this.output("  3. Start the local server", "hint");
      this.output("  4. Game will auto-detect and use it!", "hint");
    }
  } catch (error) {
    this.output("❌ Local AI test error:", "error");
    this.output(error.message, "error");
  }
};
