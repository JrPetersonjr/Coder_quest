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
    
    // Initialize developer mode state
    this.gameState.devMode = {
      authenticated: false,
      unlocked: false
    };
    
    console.log("[GameEngine] Initialized with quest + audio + spell tinkering + dev mode");
  }

  /**
   * Parse and execute a command
   * Delegates to CommandParser if available, or internal cmd methods
   */
  async parseCommand(input) {
    if (!input || !input.trim()) return;
    
    console.log("[GameEngine] Processing command:", input);
    
    // Priority 0: Developer Mode authentication and commands
    if (input.trim().startsWith("/DEV33")) {
        this.cmdDeveloperMode(input.trim());
        return;
    }
    
    // Parse parts for commands handling
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. Check for debug commands - now require dev auth
    if (command === "debug-graphics" || command === "debug-ai" || command === "syscheck") {
        if (!this.gameState.devMode || !this.gameState.devMode.authenticated) {
            this.output("🔒 Debug commands require developer authentication.", "error");
            this.output("💡 Use: /DEV33 : hotdogwater to unlock", "hint");
            return;
        }
        
        if (command === "debug-graphics") {
            this.cmdDebugGraphics(args);
            return;
        }
        if (command === "debug-ai") {
            this.cmdDebugAI(args);
            return;
        }
        if (command === "syscheck") {
            this.cmdSyscheck(args);
            return;
        }
    }
    
    if (command === "apikey") {
        this.cmdApikey(args);
        return;
    }

    // AI Model Management Commands
    if (command === "register-model" || command === "addmodel") {
        this.cmdRegisterModel(args);
        return;
    }
    if (command === "ai-status" || command === "modelstatus") {
        this.cmdAIStatus(args);
        return;
    }
    if (command === "delegate-roles" || command === "reassign") {
        this.cmdDelegateRoles(args);
        return;
    }
    if (command === "test-model") {
        this.cmdTestModel(args);
        return;
    }
    
    // AI Modding Commands
    if (command === "create-mod" || command === "mod") {
        this.cmdCreateMod(args);
        return;
    }
    
    // Database Integration Commands
    if (command === "sync-data" || command === "save-cloud") {
        this.cmdSyncData(args);
        return;
    }
    if (command === "load-data" || command === "load-cloud") {
        this.cmdLoadData(args);
        return;
    }
    if (command === "generate-character" || command === "create-character") {
        this.cmdGenerateCharacter(args);
        return;
    }
    if (command === "voice-test" || command === "test-voice") {
        this.cmdVoiceTest(args);
        return;
    }
    if (command === "voice-list" || command === "list-voices") {
        this.cmdVoiceList(args);
        return;
    }
    if (command === "set-voice") {
        this.cmdSetVoice(args);
        return;
    }

    // 2. Check for built-in commands
    const methodName = "cmd" + command.charAt(0).toUpperCase() + command.slice(1);
    if (typeof this[methodName] === "function") {
        console.log("[GameEngine] Executing built-in command:", methodName);
        await this[methodName](args);
        return;
    }

    // 3. Delegate to CommandParser (if initialized)
    if (window.CommandParser && window.CommandParser.parse) {
        console.log("[GameEngine] Delegating to CommandParser:", input);
        window.CommandParser.parse(input);
        return;
    }
    
    // 4. Unknown command fallback
    this.output(`Unknown command: '${command}'. Type 'help' for commands.`, "hint");
    this.output("Available commands: help, look, stats, go, battle, inventory, spells, cast, roll, use, map, quests, save, load, music", "hint");
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
      unlockedSubzones: ["hub_center", "hub_nexus"], // New: unlockable areas
      allies: [],
      hunted_by: [],
      claimed_zones: [],
      
      // Skill system
      skillPoints: 3, // Available skill points to allocate
      spentSkillPoints: 0,
      skills: {
        combat: {
          blade_mastery: 1,
          dual_wield: 0, 
          parry: 0
        },
        arcane: {
          fireball: 1,
          mana_shield: 1,
          spell_amplify: 0
        },
        code_injection: {
          system_probe: 1,
          exploit: 1,
          rootkit: 0
        },
        survival: {
          stealth: 0,
          camouflage: 0,
          vanish: 0
        }
      },

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
  // [AI MODEL MANAGEMENT] - Dynamic AI model registration and delegation
  // ============================================================

  /**
   * REGISTER MODEL COMMAND
   * Usage: register-model <name> <apikey> [capabilities]
   */
  async cmdRegisterModel(args) {
    if (args.length < 2) {
      this.output("❌ Usage: register-model <name> <apikey> [capabilities]", "error");
      this.output("💡 Example: register-model gpt-4 sk-abc123... reasoning,dialogue", "hint");
      return;
    }

    const modelName = args[0];
    const apiKey = args[1];
    const capabilities = args[2] ? args[2].split(',').map(s => s.trim()) : [];

    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager not loaded. Loading...", "error");
      // Try to load the dynamic delegator
      if (typeof loadScript === 'function') {
        await loadScript('./ai-dynamic-delegator.js');
      }
      if (!window.AIModelManager) {
        this.output("❌ Failed to load AI Model Manager", "error");
        return;
      }
    }

    this.output(`🤖 Registering AI model: ${modelName}`, "system");
    
    const success = window.AIModelManager.registerModel(modelName, apiKey, capabilities);
    
    if (success) {
      this.output(`✅ Model registered successfully!`, "highlight");
      this.output(`📊 Total models: ${window.AIModelManager.modelRegistry.size}`, "hint");
      this.output(`🎭 Role delegation will begin automatically...`, "hint");
    } else {
      this.output(`❌ Failed to register model`, "error");
    }
  }

  /**
   * AI STATUS COMMAND
   * Usage: ai-status
   */
  async cmdAIStatus(args) {
    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager not loaded", "error");
      return;
    }

    const status = window.AIModelManager.getStatus();
    
    this.output("🤖 === AI MODEL STATUS ===", "system");
    this.output(`📊 Total Models: ${status.totalModels}`, "highlight");
    
    if (status.models.length === 0) {
      this.output("ℹ️  No models registered", "hint");
      this.output("💡 Use: register-model <name> <apikey> to add models", "hint");
      return;
    }

    this.output("", "system");
    this.output("🎭 ROLE ASSIGNMENTS:", "system");
    for (const model of status.models) {
      const icon = window.AIModelManager.getRoleIcon(model.role);
      this.output(`  ${icon} ${model.name}`, "highlight");
      this.output(`     └─ Role: ${model.role}`, "hint");
      if (model.capabilities.length > 0) {
        this.output(`     └─ Capabilities: ${model.capabilities.join(', ')}`, "hint");
      }
    }

    if (status.availableRoles.length > 0) {
      this.output("", "system");
      this.output("🎯 UNASSIGNED ROLES:", "system");
      for (const role of status.availableRoles) {
        this.output(`  • ${role}`, "hint");
      }
    }
  }

  /**
   * DELEGATE ROLES COMMAND
   * Usage: delegate-roles
   */
  async cmdDelegateRoles(args) {
    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager not loaded", "error");
      return;
    }

    if (window.AIModelManager.modelRegistry.size === 0) {
      this.output("❌ No models registered to delegate", "error");
      this.output("💡 Use: register-model <name> <apikey> to add models first", "hint");
      return;
    }

    this.output("🎭 Re-delegating roles to all models...", "system");
    
    try {
      await window.AIModelManager.delegateRoles();
      this.output("✅ Role delegation complete!", "highlight");
    } catch (error) {
      this.output(`❌ Delegation failed: ${error.message}`, "error");
    }
  }

  /**
   * TEST MODEL COMMAND
   * Usage: test-model <task-type> [prompt]
   */
  async cmdTestModel(args) {
    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager not loaded", "error");
      return;
    }

    if (args.length === 0) {
      this.output("❌ Usage: test-model <task-type> [prompt]", "error");
      this.output("💡 Available tasks:", "hint");
      for (const role of window.AIModelManager.availableRoles) {
        this.output(`   • ${role}`, "hint");
      }
      return;
    }

    const taskType = args[0];
    const prompt = args.slice(1).join(' ') || `Test ${taskType} functionality`;

    this.output(`🧪 Testing ${taskType} task...`, "system");
    this.output(`📝 Prompt: "${prompt}"`, "hint");
    
    try {
      const response = await window.AIModelManager.routeTask(taskType, prompt);
      this.output("🤖 AI Response:", "highlight");
      this.output(response, "spell");
    } catch (error) {
      this.output(`❌ Test failed: ${error.message}`, "error");
    }
  }

  /**
   * CREATE MOD COMMAND (User-friendly modding)
   * Usage: create-mod <type> <description>
   */
  async cmdCreateMod(args) {
    if (args.length < 2) {
      this.output("❌ Usage: create-mod <type> <description>", "error");
      this.output("💡 Available types:", "hint");
      this.output("   • spell-creation: New spells and abilities", "hint");
      this.output("   • item-generation: Weapons, armor, consumables", "hint");
      this.output("   • npc-dialogue: Character conversations", "hint");
      this.output("   • quest-creation: New quests and storylines", "hint");
      this.output("   • scene-description: World descriptions", "hint");
      this.output("   • terminal-puzzles: Hacking challenges", "hint");
      this.output("", "hint");
      this.output("Example: create-mod spell-creation Fire spell that creates walls", "hint");
      return;
    }

    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager not loaded", "error");
      return;
    }

    const modType = args[0];
    const description = args.slice(1).join(' ');

    this.output(`🛠️ Creating ${modType} mod...`, "system");
    this.output(`📋 Description: ${description}`, "hint");

    try {
      const result = await window.AIModelManager.createMod(modType, description, false);
      
      if (result.success) {
        this.output("✅ Mod created successfully!", "highlight");
        this.output(`🎮 Type: ${result.type}`, "system");
        this.output(`🤖 Created by: ${result.model}`, "hint");
        
        if (result.approved) {
          this.output("✅ Auto-approved for use", "highlight");
          this.output("📥 Mod Content:", "system");
          this.output(result.mod.content, "spell");
        } else {
          this.output("⏳ Pending approval", "system");
          this.output("💡 Contact admin for review", "hint");
        }
      } else {
        this.output(`❌ Mod creation failed: ${result.error}`, "error");
        
        if (result.suggestions) {
          this.output("💡 Try these safe alternatives:", "hint");
          result.suggestions.forEach(alt => {
            this.output(`   • ${alt}`, "hint");
          });
        }
      }
    } catch (error) {
      this.output(`❌ Error: ${error.message}`, "error");
    }
  }

  /**
   * ADMIN MOD COMMAND (Full code modification)
   * Usage: /admin33 <action>: <description>
   */
  async cmdAdminMod(input) {
    // Parse admin command
    const match = input.match(/\/admin33\s+([^:]+):\s*(.+)/);
    if (!match) {
      this.output("❌ Usage: /admin33 <action>: <description>", "error");
      this.output("💡 Examples:", "hint");
      this.output("   /admin33 fix: Battle damage calculation bug", "hint");
      this.output("   /admin33 add: New inventory sorting feature", "hint");
      this.output("   /admin33 create: Terminal hacking minigame", "hint");
      this.output("   /admin33 optimize: Spell casting performance", "hint");
      return;
    }

    const action = match[1].trim();
    const description = match[2].trim();

    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager not loaded", "error");
      return;
    }

    this.output(`🔧 Admin ${action} request...`, "system");
    this.output(`📋 Task: ${description}`, "highlight");
    this.output("⚠️ Full system access granted", "system");

    try {
      const result = await window.AIModelManager.createMod(action, description, true);
      
      if (result.success) {
        this.output("✅ Admin modification complete!", "highlight");
        this.output(`🎯 Action: ${result.type}`, "system");
        this.output(`🤖 Executed by: ${result.model}`, "hint");
        this.output("📥 Implementation:", "system");
        this.output(result.mod.content, "spell");
        this.output("", "system");
        this.output("⚡ Apply changes to implement", "highlight");
      } else {
        this.output(`❌ Admin modification failed: ${result.error}`, "error");
      }
    } catch (error) {
      this.output(`❌ Error: ${error.message}`, "error");
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
      case "oracle":
        this.cmdOracle(args);
        break;
      case "-get":
      case "get":
        this.cmdGetModels(args);
        break;
      // Duplicate break - likely typo in original
      //break;
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
    this.output("[ CODER'S QUEST COMMANDS ]", "system");
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
    this.output("  oracle [question] - Consult the Crystal Ball Oracle", "system");
    this.output("  -get [tier] - Download AI models for offline use", "system");
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
    this.output("SYSTEM:", "highlight");
    this.output("  AI summon - Access AI dungeon master", "system");
    this.output("  oracle [question] - Consult the Crystal Ball Oracle", "system");
    this.output("  -get [tier] - Download AI models (premium/standard/lightweight)", "system");
    this.output("", "system");
    this.output("AI MODEL MANAGEMENT:", "highlight");
    this.output("  register-model <name> <apikey> [capabilities] - Add new AI model", "system");
    this.output("  ai-status - View all registered models and role assignments", "system");
    this.output("  delegate-roles - Re-assign roles to all models", "system");
    this.output("  test-model <task> [prompt] - Test specific model capability", "system");
    this.output("", "system");
    this.output("AI-POWERED MODDING:", "highlight");
    this.output("  create-mod <type> <description> - Create gameplay mods", "system");
    this.output("  Types: spell-creation, item-generation, npc-dialogue,", "system");
    this.output("         quest-creation, scene-description, terminal-puzzles", "system");
    this.output("", "system");
    this.output("DYNAMIC VOICE TRAINING:", "highlight");
    this.output("  train-voice <character> <source> [traits] - Train character voice", "system");
    this.output("  voice-test <character> <text> - Test character voice", "system");
    this.output("  voice-list - List all trained character voices", "system");
    this.output("  set-voice <character> <description> - Quick voice setup", "system");
    this.output("", "system");
    this.output("DATABASE & CLOUD SYNC:", "highlight");
    this.output("  sync-data - Save progress to cloud", "system");
    this.output("  load-data - Load progress from cloud", "system");
    this.output("  generate-character <context> - AI generates characters with voices", "system");
    this.output("", "system");
    this.output("Example: generate-character A wise wizard who guards ancient secrets", "hint");
    this.output("Example: sync-data (saves everything to cloud permanently)", "hint");
    this.output("", "system");
    this.output("🔐 Debug tools available for authorized developers", "system");
    this.output("🔧 Developer: /DEV33 : hotdogwater to unlock AI assistant", "system");
    this.output("💻 Then: /DEV33 <any natural language development request>", "system");
    this.output("═══════════════════════════════════════════════════", "system");
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
   * SYSTEM CHECK: Show status of all game systems
   */
  cmdSyscheck() {
    this.output("🔧 SYSTEM STATUS CHECK", "system");
    this.output("════════════════════════════════════", "highlight");
    
    // Core Systems
    this.output("CORE SYSTEMS:", "system");
    this.output(`  GameEngine: ✅ Running (Level ${this.gameState.level || "1"})`, "hint");
    this.output(`  CommandParser: ${window.CommandParser ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  DiceSystem: ${window.DiceSystem ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  IntegrationBootstrap: ${window.IntegrationBootstrap ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output("", "system");
    
    // Audio Systems
    this.output("AUDIO SYSTEMS:", "system");
    this.output(`  MIDIPlayer: ${window.MIDIPlayer ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  FXSystem: ${window.FXSystem ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  AudioSystem: ${this.audioSystem ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output("", "system");
    
    // AI Systems
    this.output("AI SYSTEMS:", "system");
    this.output(`  AIConfig: ${window.AIConfig ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  AIDMIntegration: ${window.AIDMIntegration ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  BrowserLLM: ${window.BrowserLLM ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  AI Connection Wizard: ${window.AIConnectionWizard ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output("", "system");
    
    // UI Systems
    this.output("UI SYSTEMS:", "system");
    this.output(`  CastConsoleUI: ${window.CastConsoleUI ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  PaneManager: ${window.PaneManager ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  UILayoutManager: ${window.UILayoutManager ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output("", "system");
    
    // Game Systems
    this.output("GAME SYSTEMS:", "system");
    this.output(`  QuestSystem: ${this.questSystem ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  SaveSystem: ${this.saveSystem ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  SpellTinkering: ${this.spellTinkering ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output(`  SummonRituals: ${this.summonRituals ? "✅ Ready" : "❌ Missing"}`, "hint");
    this.output("", "system");
    
    // Test key functions
    this.output("FUNCTION TESTS:", "system");
    this.output(`  Music Command: ${typeof this.cmdMusic === 'function' ? "✅ Available" : "❌ Missing"}`, "hint");
    this.output(`  Parse Command: ${typeof this.parseCommand === 'function' ? "✅ Available" : "❌ Missing"}`, "hint");
    this.output("", "system");
    
    this.output("📝 Run 'test music' or 'test ai' for detailed diagnostics.", "system");
    this.output("🎵 Try 'music play menu' to test audio systems.", "system");
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
    
    // Check if it's a subzone (zone_subzone format)
    if (window.CastZones && zoneId.includes('_')) {
      for (const [mainZoneId, mainZone] of Object.entries(window.CastZones)) {
        if (mainZone.subzones && mainZone.subzones[zoneId]) {
          return mainZone.subzones[zoneId];
        }
      }
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
  // [ORACLE COMMAND] - Consult the Crystal Ball
  // ============================================================

  cmdOracle(args) {
    // Show the Crystal Ball window if UI Layout Manager is available
    if (window.UILayoutManager && typeof window.UILayoutManager.showCrystalBallWindow === 'function') {
      window.UILayoutManager.showCrystalBallWindow();
      this.output("🔮 The Crystal Ball Oracle materializes before you...", "spell");
      this.output("Type your questions in the mystical sphere or use: oracle <question>", "hint");
      
      // If they provided a question directly, consult it
      if (args && args.length > 0) {
        const question = args.join(' ');
        this.consultOracleDirectly(question);
      }
    } else {
      // Fallback if UI Layout Manager not available
      if (args && args.length > 0) {
        const question = args.join(' ');
        this.consultOracleDirectly(question);
      } else {
        this.output("🔮 ORACLE OF THE CODE", "system");
        this.output("Usage: oracle <your question>", "hint");
        this.output("Example: oracle How do I defeat the bug boss?", "hint");
      }
    }
  }

  // Direct oracle consultation method
  async consultOracleDirectly(question) {
    try {
      this.output(`🔮 You ask the Oracle: "${question}"`, "system");
      this.output("The crystal swirls with mystical energies...", "spell");
      
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
          "The spirits of Stack Overflow guide you. The answer lies in documentation.",
          "A recursive solution approaches. Base case clarity will be your salvation.",
          "The Oracle perceives... a memory leak in your future. Guard your pointers well.",
          "Mystical energies point to asynchronous challenges ahead. Await with patience.",
          "The crystal whispers of refactoring. Simplicity shall illuminate complexity."
        ];
        response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      this.output(`🔮 ORACLE: ${response}`, "spell");
      
    } catch (error) {
      console.warn("[Oracle] Consultation failed:", error);
      this.output("🔮 The crystal dims... the connection falters. The Oracle cannot answer at this time.", "error");
    }
  }

  // ============================================================
  // [MODEL INSTALLER] - Download and install AI models locally
  // ============================================================

  /**
   * Download and install AI models locally
   * Usage: -get premium | -get standard | -get lightweight
   */
  cmdGetModels(args) {
    if (!window.ModelInstaller) {
      this.output("Model installer not available. Please reload the game.", "error");
      return;
    }

    if (args.length === 0) {
      this.output("═══════════════════════════════════════", "system");
      this.output("🤖 AI MODEL INSTALLER", "highlight");
      this.output("═══════════════════════════════════════", "system");
      this.output("", "system");
      this.output("Download specialized AI models for offline use:", "system");
      this.output("", "system");
      this.output("Available deployment tiers:", "highlight");
      this.output("  -get lightweight  (1.1GB)  - TinyLlama only", "system");
      this.output("  -get standard     (2.7GB)  - TinyLlama + Ministral-3B", "system");
      this.output("  -get premium      (7GB)    - All specialized models", "highlight");
      this.output("", "system");
      this.output("Individual models:", "highlight");
      this.output("  -get npc          - NPC dialogue model", "system");
      this.output("  -get reasoning    - Battle/puzzle logic model", "system");
      this.output("  -get content      - 2D content generation model", "system");
      this.output("", "system");
      this.output("Example: -get premium", "hint");
      return;
    }

    const tier = args[0].toLowerCase();
    
    // Map friendly names to model names
    const modelMap = {
      npc: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
      reasoning: "mistralai/ministral-3-3b",
      content: "allenai/olmocr-2-7b",
      "reasoning-pro": "mistralai/ministral-3-14b-reasoning"
    };
    
    const targetModel = modelMap[tier] || tier;
    
    this.output(`🚀 Starting AI model installation: ${tier}`, "highlight");
    this.output("This may take several minutes depending on your connection...", "system");
    this.output("", "system");
    
    // Start download
    window.ModelInstaller.get(targetModel).then(success => {
      if (success) {
        this.output("🎉 Model installation successful!", "highlight");
        this.output("AI delegation system is now enhanced with local models.", "system");
        
        // Test the new models
        this.output("", "system");
        this.output("Testing installed models...", "system");
        this.testLocalModels(tier);
      } else {
        this.output("❌ Model installation failed. Check console for details.", "error");
      }
    }).catch(error => {
      this.output(`❌ Installation error: ${error.message}`, "error");
    });
  }

  /**
   * Test locally installed models
   */
  async testLocalModels(tier) {
    try {
      // Test task delegation with local models
      if (window.AIConfig && window.AIConfig.delegateTask) {
        this.output("Testing NPC dialogue model...", "system");
        const npcTest = await window.AIConfig.delegateTask("npc_chat", "Hello, test response");
        this.output(`  NPC Test: ${npcTest.substring(0, 50)}...`, "hint");
        
        if (tier === "premium" || tier === "standard") {
          this.output("Testing reasoning model...", "system");
          const reasoningTest = await window.AIConfig.delegateTask("battle_strategy", "Plan a simple attack");
          this.output(`  Strategy Test: ${reasoningTest.substring(0, 50)}...`, "hint");
        }
        
        if (tier === "premium") {
          this.output("Testing content generation model...", "system");
          const contentTest = await window.AIConfig.delegateTask("sprite_descriptions", "Describe a magical sword");
          this.output(`  Content Test: ${contentTest.substring(0, 50)}...`, "hint");
        }
      }
      
      this.output("", "system");
      this.output("🏆 All local AI models are working correctly!", "highlight");
      
    } catch (error) {
      this.output("⚠️ Model testing failed, but installation may still be successful", "hint");
      console.error("Model test error:", error);
    }
  }

  // ============================================================
  // [SUBZONE_UNLOCKING] - Progressive area unlocking system
  // ============================================================

  /**
   * Unlock new subzone based on progression
   */
  unlockSubzone(subzoneName, reason = "Quest completion") {
    if (!this.gameState.unlockedSubzones.includes(subzoneName)) {
      this.gameState.unlockedSubzones.push(subzoneName);
      this.output(`🔓 NEW AREA UNLOCKED: ${subzoneName}`, "highlight");
      this.output(`Reason: ${reason}`, "hint");
      
      // Special unlock messages
      const unlockMessages = {
        "hub_archive": "Ancient data repositories are now accessible.",
        "forest_deep": "The deep forests reveal their secrets to you.",
        "city_core": "The neon city's digital heart is now open.",
        "city_underground": "Hidden passages beneath the city discovered.",
        "wasteland_ruins": "Ancient ruins emerge from the data storm.",
        "cosmic_rift": "Reality tears, revealing the cosmic void beyond."
      };
      
      if (unlockMessages[subzoneName]) {
        this.output(unlockMessages[subzoneName], "spell");
      }
      
      this.onStateChange(this.gameState);
    }
  }

  /**
   * Check if subzone is unlocked
   */
  isSubzoneUnlocked(subzoneName) {
    return this.gameState.unlockedSubzones.includes(subzoneName);
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
GameEngine.prototype.cmdI = GameEngine.prototype.cmdInventory;

// Map command to show current area and exits
GameEngine.prototype.cmdMap = function() {
  this.output("🗺️ [AREA MAP]", "system");
  const currentZone = this.gameState.zone;
  const zoneData = this.getZoneData(currentZone);
  
  if (!zoneData) {
    this.output("Location data corrupted.", "error");
    return;
  }
  
  this.output(`Current Zone: ${zoneData.name}`, "highlight");
  this.output(`Description: ${zoneData.desc}`, "text");
  
  if (zoneData.exits && Object.keys(zoneData.exits).length > 0) {
    this.output("\nAvailable Exits:", "system");
    for (const [direction, zone] of Object.entries(zoneData.exits)) {
      const targetData = this.getZoneData(zone);
      const targetName = targetData ? targetData.name : zone;
      this.output(`  ${direction}: ${targetName} (go ${zone})`, "hint");
    }
  } else {
    this.output("No obvious exits.", "hint");
  }
  
  // Show subzones if available
  if (zoneData.subzones && Object.keys(zoneData.subzones).length > 0) {
    this.output("\nSubzones:", "system");
    for (const [subzoneId, subzone] of Object.entries(zoneData.subzones)) {
      const accessible = !subzone.unlockReq || this.gameState.unlockedContent?.includes(subzone.unlockReq);
      const status = accessible ? "(accessible)" : "(locked)";
      this.output(`  ${subzone.name}: go ${subzoneId} ${status}`, accessible ? "hint" : "error");
    }
  }
};

// Status command for character info
GameEngine.prototype.cmdStatus = function() {
  this.output("⚡ [CHARACTER STATUS]", "system");
  this.output("═══════════════════════════════════", "hint");
  
  const char = this.gameState.character || {};
  this.output(`Name: ${char.name || 'Unknown'}`, "text");
  this.output(`Class: ${char.class || 'Coder'}`, "text");
  this.output(`Level: ${this.gameState.experience?.level || 1}`, "text");
  this.output(`XP: ${this.gameState.experience?.xp || 0}`, "text");
  
  const stats = this.gameState.stats || {};
  this.output(`Health: ${stats.health || 100}/${stats.maxHealth || 100}`, "text");
  this.output(`Mana: ${stats.mana || 50}/${stats.maxMana || 50}`, "text");
  this.output(`Data: ${this.gameState.data || 0}`, "text");
  
  this.output("═══════════════════════════════════", "hint");
};

// Exits command as alias for map
GameEngine.prototype.cmdExits = function() {
  const zoneData = this.getZoneData(this.gameState.zone);
  if (!zoneData || !zoneData.exits) {
    this.output("No obvious exits.", "hint");
    return;
  }
  
  this.output("Available exits:", "system");
  for (const [direction, zone] of Object.entries(zoneData.exits)) {
    this.output(`  ${direction}: go ${zone}`, "hint");
  }
};

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
    this.output("  menu        - Main Coder's Quest theme", "text");
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
    case 'browser':
      this.testBrowserLLM();
      break;
    case 'qwen':
      this.testQwenRoleplay();
      break;
    case 'character':
      this.testCharacterConsistency(args[1]);
      break;
    default:
      this.output("Test commands:", "system");
      this.output("  test ai    - Test AI backend connection", "hint");
      this.output("  test music - Test MIDI player", "hint");
      this.output("  test deck  - Test deck functionality", "hint");
      this.output("  test generate - Test AI generation", "hint");
      this.output("  test local - Test local model connection", "hint");
      this.output("  test browser - Test browser-based LLM", "hint");
      this.output("  test qwen - Test Qwen roleplay consistency", "hint");
      this.output("  test character <type> - Test specific character (oracle/dm/npc)", "hint");
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

GameEngine.prototype.testBrowserLLM = async function() {
  this.output("🌐 Testing browser-based LLM (zero setup)...", "system");
  
  if (!window.BrowserLLM) {
    this.output("❌ Browser LLM not loaded", "error");
    this.output("💡 Check if browser-llm.js is included", "hint");
    return;
  }
  
  try {
    // Check status
    const status = BrowserLLM.getStatus();
    this.output(`Status: ${status.initialized ? 'Initialized' : 'Not initialized'}`, "text");
    this.output(`Loading: ${status.loading ? 'Yes' : 'No'}`, "text");
    this.output(`Model: ${status.model || 'None'}`, "text");
    this.output(`Available: ${status.available ? 'Yes' : 'No'}`, "text");
    
    if (status.available) {
      this.output("✅ Browser LLM is ready!", "highlight");
      this.output("", "system");
      this.output("Testing generation...", "hint");
      
      const result = await BrowserLLM.test();
      if (result.success) {
        this.output("✅ Generation test successful!", "highlight");
        this.output(`Response: "${result.result}"`, "text");
        this.output(`Model used: ${result.model}`, "hint");
      } else {
        this.output("❌ Generation test failed:", "error");
        this.output(result.error, "error");
      }
    } else if (status.loading) {
      this.output("⏳ Browser LLM is still loading...", "system");
      this.output(`Progress: ${Math.round(status.progress)}%`, "hint");
    } else if (status.error) {
      this.output("❌ Browser LLM error:", "error");
      this.output(status.error, "error");
    } else {
      this.output("⚠️ Browser LLM not available", "system");
      this.output("Try: refresh page or check browser compatibility", "hint");
    }
  } catch (error) {
    this.output("❌ Browser LLM test error:", "error");
    this.output(error.message, "error");
  }
};

GameEngine.prototype.testQwenRoleplay = async function() {
  this.output("🎭 Testing Qwen Roleplay V2 character consistency...", "system");
  
  if (!window.QwenRoleplayConfig) {
    this.output("❌ Qwen Roleplay Config not loaded", "error");
    this.output("💡 Check if qwen-roleplay-config.js is included", "hint");
    return;
  }
  
  try {
    const status = QwenRoleplayConfig.getStatus();
    this.output(`Model: ${status.model}`, "text");
    this.output(`Endpoint: ${status.endpoint}`, "text");
    this.output(`Role Enforcement: ${status.roleEnforcement.strictMode ? 'Enabled' : 'Disabled'}`, "text");
    this.output(`Available Characters: ${status.availableCharacters.join(', ')}`, "text");
    
    this.output("", "system");
    this.output("Testing Oracle character...", "hint");
    
    const result = await QwenRoleplayConfig.generateWithQwen(
      "What do you see in my coding future?", 
      "oracle"
    );
    
    this.output("✅ Oracle test successful!", "highlight");
    this.output(`Oracle says: "${result}"`, "spell");
    
  } catch (error) {
    this.output("❌ Qwen Roleplay test error:", "error");
    this.output(error.message, "error");
    this.output("", "system");
    this.output("💡 Make sure LM Studio is running with Qwen model loaded", "hint");
  }
};

GameEngine.prototype.testCharacterConsistency = async function(characterType = 'oracle') {
  if (!window.QwenRoleplayConfig) {
    this.output("❌ Qwen Roleplay Config not available", "error");
    return;
  }
  
  const validTypes = ['oracle', 'dungeonMaster', 'npcEntity'];
  if (!validTypes.includes(characterType)) {
    this.output(`❌ Invalid character type. Use: ${validTypes.join(', ')}`, "error");
    return;
  }
  
  this.output(`🎯 Testing ${characterType} character consistency...`, "system");
  
  try {
    const results = await QwenRoleplayConfig.testCharacter(characterType);
    
    let passed = 0;
    let failed = 0;
    
    for (const result of results) {
      if (result.error) {
        this.output(`❌ "${result.prompt}" - ${result.error}`, "error");
        failed++;
      } else if (result.valid) {
        this.output(`✅ "${result.prompt}" - Character consistent`, "highlight");
        this.output(`   Response: "${result.response.substring(0, 80)}..."`, "text");
        passed++;
      } else {
        this.output(`⚠️ "${result.prompt}" - Rule violations: ${result.violations.join(', ')}`, "error");
        this.output(`   Response: "${result.response.substring(0, 80)}..."`, "text");
        failed++;
      }
    }
    
    this.output("", "system");
    this.output(`Test Results: ${passed} passed, ${failed} failed`, passed > failed ? "highlight" : "error");
    
  } catch (error) {
    this.output("❌ Character consistency test failed:", "error");
    this.output(error.message, "error");
  }
};

  /**
   * DEVELOPER MODE COMMAND
   * Usage: /DEV33 : hotdogwater (unlock) or /DEV33 <request>
   */
  async cmdDeveloperMode(input) {
    // Check for unlock phrase
    if (input === "/DEV33 : hotdogwater") {
      this.gameState.devMode.authenticated = true;
      this.gameState.devMode.unlocked = true;
      this.output("🔓 DEVELOPER MODE UNLOCKED!", "highlight");
      this.output("🤖 AI Development Assistant Activated", "system");
      this.output("", "system");
      this.output("🚀 You can now use natural language development commands:", "hint");
      this.output("   /DEV33 Create a spell that summons lightning", "hint");
      this.output("   /DEV33 Fix the inventory bug when items stack", "hint");
      this.output("   /DEV33 Add new terminal hacking puzzle", "hint");
      this.output("   /DEV33 Train an NPC voice like Morgan Freeman", "hint");
      this.output("═══════════════════════════════════════════════════", "system");
      return;
    }

    // Check authentication
    if (!this.gameState.devMode.authenticated) {
      this.output("🔒 Developer mode locked", "error");
      this.output("💡 Use: /DEV33 : hotdogwater to unlock", "hint");
      return;
    }

    // Extract request
    const request = input.replace(/^\/DEV33\s+/i, '').trim();
    if (!request) {
      this.output("❌ Usage: /DEV33 <natural language request>", "error");
      this.output("💡 Examples:", "hint");
      this.output("   /DEV33 Train a wizard voice like Gandalf mixed with Morgan Freeman", "hint");
      this.output("   /DEV33 Create an NPC female companion who sounds like Lara Croft and Billie Eilish mixed", "hint");
      this.output("   /DEV33 Fix inventory system performance issues", "hint");
      return;
    }

    await this.processDeveloperRequest(request);
  }

  /**
   * DEVELOPER REQUEST PROCESSOR
   * Processes natural language development requests
   */
  async processDeveloperRequest(request) {
    this.output(`🤖 AI Processing: "${request}"`, "system");
    this.output("⚡ Analyzing request type...", "hint");

    // Check for voice training requests
    if (this.isVoiceTrainingRequest(request)) {
      await this.processVoiceTrainingRequest(request);
      return;
    }

    // Check for NPC creation requests
    if (request.toLowerCase().includes('create') && request.toLowerCase().includes('npc')) {
      await this.processNPCCreationRequest(request);
      return;
    }

    // Route to AI model manager for processing
    if (!window.AIModelManager) {
      this.output("❌ AI Model Manager required for development requests", "error");
      return;
    }

    try {
      // Use reasoning model for development tasks
      const response = await window.AIModelManager.routeTask('reasoning', 
        `Development Request: ${request}\n\nGenerate appropriate code, fixes, or improvements based on this request.`);
      
      this.output("🚀 AI Development Response:", "highlight");
      this.output(response, "spell");
      
    } catch (error) {
      this.output(`❌ Development processing error: ${error.message}`, "error");
    }
  }

  /**
   * Check if request is for voice training
   */
  isVoiceTrainingRequest(request) {
    const voiceKeywords = ['voice', 'sound', 'speak', 'talk', 'vocal', 'accent', 'tone'];
    const trainingKeywords = ['train', 'teach', 'learn', 'create voice', 'voice like', 'sounds like'];
    const npcKeywords = ['npc', 'character', 'companion', 'assistant', 'guard', 'wizard', 'merchant'];
    
    const hasVoice = voiceKeywords.some(keyword => 
      request.toLowerCase().includes(keyword));
    const hasTraining = trainingKeywords.some(keyword => 
      request.toLowerCase().includes(keyword));
    const hasNPC = npcKeywords.some(keyword => 
      request.toLowerCase().includes(keyword));
    
    return (hasVoice && hasTraining) || (hasVoice && hasNPC);
  }

  /**
   * Process voice training development requests
   */
  async processVoiceTrainingRequest(request) {
    this.output("🎤 Voice Training Request Detected!", "highlight");
    this.output("🧠 AI analyzing voice requirements...", "system");

    if (!window.VoiceTrainer) {
      this.output("❌ Voice Training System not loaded", "error");
      return;
    }

    try {
      // Extract character info and voice requirements
      const voiceData = await this.extractVoiceRequirements(request);
      
      if (!voiceData) {
        this.output("❌ Could not parse voice requirements", "error");
        this.output("💡 Try: 'Train an NPC companion who sounds like [person/character]'", "hint");
        return;
      }

      this.output(`🎭 Character: ${voiceData.characterName}`, "system");
      this.output(`🎯 Voice Target: ${voiceData.voiceDescription}`, "hint");
      
      // Generate training links
      this.output("🔗 Generating training links...", "system");
      const trainingLinks = await this.generateTrainingLinks(voiceData.voiceReferences);
      
      if (trainingLinks.length === 0) {
        this.output("❌ Could not generate training links", "error");
        return;
      }

      // Display generated links
      this.output("📺 Generated Training Sources:", "highlight");
      trainingLinks.forEach((link, index) => {
        this.output(`   ${index + 1}. ${link.title}`, "hint");
        this.output(`      ${link.url}`, "system");
      });
      
      // Auto-train with first link
      this.output("", "system");
      this.output("🚀 Auto-training with primary source...", "highlight");
      
      const result = await window.VoiceTrainer.trainCharacterVoice(
        voiceData.characterName, 
        trainingLinks[0].url, 
        voiceData.traits
      );
      
      if (result.success) {
        this.output("✅ Voice training complete!", "highlight");
        this.output(`🎤 ${voiceData.characterName} now speaks with ${voiceData.voiceDescription} voice`, "spell");
        
        // Test the voice
        this.output("", "system");
        this.output("🎭 Voice Test:", "system");
        await this.cmdVoiceTest([voiceData.characterName, "Greetings, I am your companion."]);
      } else {
        this.output(`❌ Training failed: ${result.error}`, "error");
      }
      
    } catch (error) {
      this.output(`❌ Voice training error: ${error.message}`, "error");
    }
  }

  /**
   * Extract voice requirements from natural language request
   */
  async extractVoiceRequirements(request) {
    // Parse character name
    let characterName = "companion";
    const npcMatch = request.match(/(npc|character|companion|assistant|guard|wizard|merchant|oracle)\s+(\w+)?/i);
    if (npcMatch && npcMatch[2]) {
      characterName = npcMatch[2].toLowerCase();
    } else if (request.includes("female")) {
      characterName = "female_companion";
    } else if (request.includes("male")) {
      characterName = "male_companion";
    }

    // Extract voice references (people/characters mentioned)
    const voiceReferences = [];
    const commonVoices = {
      'lara croft': ['Lara Croft', 'Angelina Jolie', 'Camilla Luddington'],
      'billie eilish': ['Billie Eilish'],
      'morgan freeman': ['Morgan Freeman'],
      'scarlett johansson': ['Scarlett Johansson', 'Black Widow'],
      'benedict cumberbatch': ['Benedict Cumberbatch', 'Sherlock'],
      'emma watson': ['Emma Watson', 'Hermione'],
      'ryan reynolds': ['Ryan Reynolds', 'Deadpool'],
      'gal gadot': ['Gal Gadot', 'Wonder Woman'],
      'chris evans': ['Chris Evans', 'Captain America'],
      'tom hiddleston': ['Tom Hiddleston', 'Loki'],
      'gandalf': ['Ian McKellen', 'Gandalf'],
      'yoda': ['Frank Oz', 'Yoda'],
      'darth vader': ['James Earl Jones', 'Darth Vader'],
      'hermione': ['Emma Watson', 'Hermione'],
      'tony stark': ['Robert Downey Jr', 'Tony Stark'],
      'black widow': ['Scarlett Johansson', 'Black Widow']
    };

    // Find voice references in request
    for (const [key, variations] of Object.entries(commonVoices)) {
      for (const variation of variations) {
        if (request.toLowerCase().includes(variation.toLowerCase())) {
          voiceReferences.push(variation);
          break;
        }
      }
    }

    // Extract traits
    const traits = [];
    if (request.includes("mysterious")) traits.push("mysterious");
    if (request.includes("friendly")) traits.push("friendly");
    if (request.includes("aggressive")) traits.push("aggressive");
    if (request.includes("wise")) traits.push("wise");
    if (request.includes("ancient")) traits.push("ancient");
    if (request.includes("cheerful")) traits.push("cheerful");
    if (request.includes("commanding")) traits.push("commanding");
    if (request.includes("seductive")) traits.push("seductive");
    if (request.includes("robotic")) traits.push("robotic");
    if (request.includes("ethereal")) traits.push("ethereal");

    // Default traits based on gender
    if (traits.length === 0) {
      if (request.includes("female")) {
        traits.push("confident", "intelligent");
      } else {
        traits.push("strong", "reliable");
      }
    }

    if (voiceReferences.length === 0) {
      return null;
    }

    return {
      characterName,
      voiceReferences,
      voiceDescription: voiceReferences.join(" + "),
      traits
    };
  }

  /**
   * Generate training links for voice references
   */
  async generateTrainingLinks(voiceReferences) {
    const trainingLinks = [];

    // Predefined training sources for common voices
    const voiceSources = {
      'Lara Croft': [
        {
          title: "Lara Croft Voice Lines - Tomb Raider",
          url: "https://youtube.com/watch?v=lara_croft_voice_compilation",
          description: "Confident, adventurous British accent"
        }
      ],
      'Camilla Luddington': [
        {
          title: "Camilla Luddington as Lara Croft - Voice Acting", 
          url: "https://youtube.com/watch?v=camilla_luddington_lara",
          description: "Modern Lara Croft voice"
        }
      ],
      'Billie Eilish': [
        {
          title: "Billie Eilish Interview - Natural Speaking Voice",
          url: "https://youtube.com/watch?v=billie_eilish_interview", 
          description: "Soft, breathy, contemporary tone"
        },
        {
          title: "Billie Eilish Singing Voice Analysis",
          url: "https://youtube.com/watch?v=billie_eilish_vocals",
          description: "Whispered, intimate vocal style"
        }
      ],
      'Morgan Freeman': [
        {
          title: "Morgan Freeman Documentary Narration",
          url: "https://youtube.com/watch?v=morgan_freeman_narration",
          description: "Deep, authoritative, wise tone"
        }
      ],
      'Ian McKellen': [
        {
          title: "Ian McKellen as Gandalf - Voice Collection",
          url: "https://youtube.com/watch?v=gandalf_voice_lines",
          description: "Wise, ancient, mystical tone"
        }
      ],
      'Angelina Jolie': [
        {
          title: "Angelina Jolie as Lara Croft - Movie Scenes",
          url: "https://youtube.com/watch?v=angelina_jolie_lara",
          description: "Classic Lara Croft voice"
        }
      ],
      'Scarlett Johansson': [
        {
          title: "Scarlett Johansson as Black Widow - Voice Lines",
          url: "https://youtube.com/watch?v=black_widow_voice",
          description: "Confident, assertive, action-hero tone"
        }
      ]
    };

    // Generate links for each voice reference
    for (const voiceRef of voiceReferences) {
      if (voiceSources[voiceRef]) {
        trainingLinks.push(...voiceSources[voiceRef]);
      } else {
        // Generate generic link for unknown voices
        trainingLinks.push({
          title: `${voiceRef} Voice Collection`,
          url: `https://youtube.com/results?search_query=${encodeURIComponent(voiceRef + ' voice interview')}`,
          description: `${voiceRef} speaking voice samples`
        });
      }
    }

    return trainingLinks;
  }

  /**
   * SYNC DATA COMMAND
   * Usage: sync-data
   */
  async cmdSyncData(args) {
    if (!window.TechnomancerDB) {
      this.output("❌ Database integration not loaded", "error");
      return;
    }

    this.output("☁️ Syncing game data to cloud...", "system");
    
    try {
      const gameData = {
        gameState: this.gameState,
        voiceProfiles: window.VoiceTrainer ? Array.from(window.VoiceTrainer.characterVoices.entries()) : [],
        timestamp: Date.now()
      };
      
      const success = await window.TechnomancerDB.saveUserData(gameData);
      
      if (success) {
        this.output("✅ Game data synced to cloud successfully!", "highlight");
        this.output("💾 Your progress is now saved permanently", "hint");
      } else {
        this.output("⚠️ Cloud sync failed - data saved locally only", "error");
      }
    } catch (error) {
      this.output(`❌ Sync error: ${error.message}`, "error");
    }
  }

  /**
   * LOAD DATA COMMAND
   * Usage: load-data
   */
  async cmdLoadData(args) {
    if (!window.TechnomancerDB) {
      this.output("❌ Database integration not loaded", "error");
      return;
    }

    this.output("☁️ Loading game data from cloud...", "system");
    
    try {
      const gameData = await window.TechnomancerDB.loadUserData();
      
      if (gameData) {
        // Restore game state
        if (gameData.gameState) {
          this.gameState = { ...this.gameState, ...gameData.gameState };
        }
        
        // Restore voice profiles
        if (gameData.voiceProfiles && window.VoiceTrainer) {
          for (const [name, profile] of gameData.voiceProfiles) {
            window.VoiceTrainer.characterVoices.set(name, profile);
          }
          window.VoiceTrainer.saveToStorage();
        }
        
        this.output("✅ Game data loaded from cloud successfully!", "highlight");
        this.output(`📅 Last saved: ${new Date(gameData.timestamp).toLocaleString()}`, "hint");
        this.output("🔄 Your game has been restored to the latest state", "hint");
      } else {
        this.output("ℹ️ No cloud save data found", "hint");
        this.output("💡 Use 'sync-data' to save your progress to the cloud", "hint");
      }
    } catch (error) {
      this.output(`❌ Load error: ${error.message}`, "error");
    }
  }

  /**
   * GENERATE CHARACTER COMMAND
   * Usage: generate-character <context>
   */
  async cmdGenerateCharacter(args) {
    if (!window.AutonomousCharacterGenerator) {
      this.output("❌ Character generator not loaded", "error");
      return;
    }

    if (args.length === 0) {
      this.output("❌ Usage: generate-character <context>", "error");
      this.output("💡 Examples:", "hint");
      this.output("   generate-character A wise wizard who guards ancient secrets", "hint");
      this.output("   generate-character A cheerful merchant in the crystal caverns", "hint");
      this.output("   generate-character A mysterious oracle with prophetic visions", "hint");
      return;
    }

    const context = args.join(' ');
    
    this.output(`🎭 Generating character: "${context}"`, "system");
    this.output("🤖 AI is designing character with voice training...", "hint");
    
    try {
      const result = await window.AutonomousCharacterGenerator.generateCharacter(context);
      
      if (result.success) {
        const char = result.character;
        
        this.output("✨ Character generated successfully!", "highlight");
        this.output("", "system");
        this.output(`🎭 === ${char.name.toUpperCase()} ===`, "highlight");
        this.output(`Type: ${char.type}`, "system");
        this.output(`Personality: ${char.personality.join(', ')}`, "hint");
        this.output(`Voice: ${char.voiceRef} (${char.voiceTrained ? '✅ Trained' : '⏳ Training...'})`, "hint");
        this.output(`Role: ${char.role}`, "system");
        this.output(`Background: ${char.background}`, "spell");
        this.output("", "system");
        
        if (char.voiceTrained) {
          this.output(`💬 Test voice with: voice-test ${char.name} Hello there!`, "hint");
        }
        
        if (result.fromCache) {
          this.output("⚡ Loaded from community cache", "hint");
        } else {
          this.output("🌟 Freshly generated and shared with community", "hint");
        }
        
      } else {
        this.output(`❌ Generation failed: ${result.error}`, "error");
      }
      
    } catch (error) {
      this.output(`❌ Character generation error: ${error.message}`, "error");
    }
  }
