// ============================================================
// COMMAND-PARSER.JS (Enhanced)
// Routes cast_console commands to game modules
//
// PURPOSE:
//   - Parse player input from cast_console
//   - Route to appropriate handlers (dice, spells, status, etc)
//   - Log results to cast_log
//   - Support both built-in and custom commands
//
// COMMAND FORMATS:
//   help → show available commands
//   roll dX → roll dice (d20, d12, d6, d100, etc)
//   cast [spell] → cast a spell
//   status → display character stats
//   questlog → show objectives
//   inv or inventory → show items
//   use [item] → use an item
//   talk [npc] → interact with NPC
//   spells → list learned spells
//   skills → list skills
// ============================================================

window.CommandParser = {

  // ============================================================
  // [STATE] - Command registry and history
  // ============================================================
  commands: {},
  commandHistory: [],
  maxHistory: 50,

  // ============================================================
  // [INIT] - Initialize parser
  // ============================================================
  initialize: function(gameEngine, diceSystem) {
    console.log("[CommandParser] Initializing");
    
    this.gameEngine = gameEngine;
    this.diceSystem = diceSystem;
    
    // Register built-in commands
    this.registerCommand("help", this.cmdHelp.bind(this), "Show available commands");
    this.registerCommand("roll", this.cmdRoll.bind(this), "Roll dice: roll dX");
    this.registerCommand("status", this.cmdStatus.bind(this), "Show character status");
    this.registerCommand("questlog", this.cmdQuestlog.bind(this), "Show active quests");
    this.registerCommand("spells", this.cmdSpells.bind(this), "List learned spells");
    this.registerCommand("skills", this.cmdSkills.bind(this), "List skills");
    this.registerCommand("inventory", this.cmdInventory.bind(this), "Show inventory");
    this.registerCommand("inv", this.cmdInventory.bind(this), "Show inventory (short)");
    this.registerCommand("cast", this.cmdCast.bind(this), "Cast a spell: cast [spell name]");
    this.registerCommand("use", this.cmdUse.bind(this), "Use an item: use [item name]");
    this.registerCommand("talk", this.cmdTalk.bind(this), "Talk to NPC: talk [npc name]");
    this.registerCommand("clear", this.cmdClear.bind(this), "Clear console");
    this.registerCommand("history", this.cmdHistory.bind(this), "Show command history");
    this.registerCommand("debug", this.cmdDebug.bind(this), "Debug info");
    
    console.log("[CommandParser] Ready. Commands registered:", Object.keys(this.commands).length);
  },

  // ============================================================
  // [REGISTER] - Register a custom command
  // ============================================================
  registerCommand: function(name, handler, description = "") {
    this.commands[name.toLowerCase()] = {
      handler: handler,
      description: description
    };
  },

  // ============================================================
  // [PARSE] - Main entry point for parsing input
  // ============================================================
  parse: function(input) {
    if (!input.trim()) return;

    // Add to history
    this.commandHistory.push(input);
    if (this.commandHistory.length > this.maxHistory) {
      this.commandHistory.shift();
    }

    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    const argString = args.join(" ");

    console.log("[CommandParser] Parsing:", command, "Args:", args);

    // Log to cast_log
    this.logToConsole(`> ${input}`, "command");

    // Execute command
    if (this.commands[command]) {
      try {
        this.commands[command].handler(argString, args);
      } catch (error) {
        console.error("[CommandParser] Error executing command:", error);
        this.logToConsole(`Error: ${error.message}`, "error");
      }
    } else {
      this.logToConsole(`Unknown command: '${command}'. Type 'help' for commands.`, "hint");
    }
  },

  // ============================================================
  // [LOGGING] - Output to console and cast_log
  // ============================================================
  logToConsole: function(text, style = "text") {
    if (this.gameEngine && this.gameEngine.output) {
      this.gameEngine.output(text, style);
    }
    console.log("[CommandParser]", text);
  },

  // ============================================================
  // [COMMANDS] - Built-in command handlers
  // ============================================================

  cmdHelp: function() {
    this.logToConsole("[COMMAND HELP]", "highlight");
    this.logToConsole("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "hint");
    
    for (const [name, cmd] of Object.entries(this.commands)) {
      const desc = cmd.description || "No description";
      this.logToConsole(`  ${name.padEnd(12)} → ${desc}`, "hint");
    }
    
    this.logToConsole("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "hint");
  },

  cmdRoll: function(argString, args) {
    if (!args.length) {
      this.logToConsole("Usage: roll dX (e.g., roll d20, roll 2d6)", "hint");
      return;
    }

    const diceNotation = args[0].toLowerCase();
    
    try {
      const result = this.diceSystem.rollNotation(diceNotation);
      
      this.logToConsole(`[DICE ROLL] ${diceNotation}`, "spell");
      this.logToConsole(`Result: ${result.total}`, "highlight");
      
      if (result.rolls && result.rolls.length > 1) {
        this.logToConsole(`Individual rolls: [${result.rolls.join(", ")}]`, "text");
      }
      
    } catch (error) {
      this.logToConsole(`Invalid dice notation: ${diceNotation}`, "error");
    }
  },

  cmdStatus: function() {
    if (!this.gameEngine || !this.gameEngine.gameState) {
      this.logToConsole("Game state not available", "error");
      return;
    }

    const char = this.gameEngine.gameState.character;
    
    this.logToConsole("[CHARACTER STATUS]", "highlight");
    this.logToConsole(`Name:  ${char.name || "Unknown"}`, "text");
    this.logToConsole(`Class: ${char.class || "Unassigned"}`, "text");
    this.logToConsole(`Level: ${char.level || 1}`, "text");
    this.logToConsole(`HP:    ${char.hp}/${char.maxHp}`, "text");
    this.logToConsole(`Mana:  ${char.mp}/${char.maxMp}`, "text");
    this.logToConsole(`Data:  ${char.data || 0}/100`, "text");
    this.logToConsole(`EXP:   ${char.experience || 0}`, "text");
  },

  cmdQuestlog: function() {
    if (!this.gameEngine || !this.gameEngine.questSystem) {
      this.logToConsole("Quest system not available", "error");
      return;
    }

    const quests = this.gameEngine.questSystem.getActiveQuests?.() || [];
    
    if (quests.length === 0) {
      this.logToConsole("[QUESTS] No active quests", "hint");
      return;
    }

    this.logToConsole("[ACTIVE QUESTS]", "highlight");
    quests.forEach((q, i) => {
      this.logToConsole(`${i + 1}. ${q.name}`, "text");
      this.logToConsole(`   ${q.description}`, "hint");
      if (q.progress) {
        this.logToConsole(`   Progress: ${q.progress}`, "hint");
      }
    });
  },

  cmdSpells: function() {
    if (!window.CastSpells || !window.CastSpells.spells) {
      this.logToConsole("Spell database not available", "error");
      return;
    }

    const spells = Object.values(window.CastSpells.spells).slice(0, 10);
    
    this.logToConsole("[SPELLS AVAILABLE]", "spell");
    spells.forEach(spell => {
      const cost = spell.manaCost || spell.cost || 0;
      this.logToConsole(`  ${spell.name.padEnd(20)} (Cost: ${cost} Mana)`, "text");
    });
    
    this.logToConsole(`... and ${Math.max(0, Object.keys(window.CastSpells.spells).length - 10)} more`, "hint");
  },

  cmdSkills: function() {
    this.logToConsole("[SKILLS AVAILABLE]", "spell");
    this.logToConsole("  Fireball          (AOE damage)", "text");
    this.logToConsole("  Heal              (Restore HP)", "text");
    this.logToConsole("  Mana Shield       (Reduce damage)", "text");
    this.logToConsole("  Code Injection    (Control enemy)", "text");
  },

  cmdInventory: function() {
    const inventory = this.gameEngine?.gameState?.inventory || [];
    
    if (inventory.length === 0) {
      this.logToConsole("[INVENTORY] Empty", "hint");
      return;
    }

    this.logToConsole("[INVENTORY]", "highlight");
    inventory.forEach((item, i) => {
      this.logToConsole(`${i + 1}. ${item.name} x${item.quantity || 1}`, "text");
    });
  },

  cmdCast: function(argString, args) {
    if (!argString) {
      this.logToConsole("Usage: cast [spell name]", "hint");
      this.logToConsole("Try: cast fireball", "hint");
      return;
    }

    const spellName = argString.toLowerCase();
    this.logToConsole(`[CAST] Casting: ${spellName}`, "spell");
    this.logToConsole("✦ Channeling arcane energies...", "highlight");
    
    // Wire to actual spell system via GameEngine
    if (window.gameEngine) {
      window.gameEngine.castSpell([spellName]);
    } else {
      this.logToConsole("⚠ Spell system not initialized", "error");
    }
  },

  cmdUse: function(argString, args) {
    if (!argString) {
      this.logToConsole("Usage: use [item name]", "hint");
      return;
    }

    this.logToConsole(`[USE] Using: ${argString}`, "text");
    
    // Wire to inventory system
    if (window.gameEngine && window.gameEngine.gameState) {
      const inventory = window.gameEngine.gameState.inventory || [];
      const itemName = argString.toLowerCase();
      const item = inventory.find(i => i.name.toLowerCase() === itemName);
      
      if (!item) {
        this.logToConsole(`You don't have '${argString}' in your inventory`, "error");
        return;
      }
      
      // Use item (basic implementation - expand based on item types)
      if (item.type === 'consumable') {
        if (item.effect === 'heal') {
          const healed = Math.min(item.value || 20, window.gameEngine.gameState.maxHp - window.gameEngine.gameState.hp);
          window.gameEngine.gameState.hp += healed;
          this.logToConsole(`Used ${item.name}! Restored ${healed} HP`, "highlight");
        } else if (item.effect === 'mana') {
          const restored = Math.min(item.value || 20, window.gameEngine.gameState.maxMp - window.gameEngine.gameState.mp);
          window.gameEngine.gameState.mp += restored;
          this.logToConsole(`Used ${item.name}! Restored ${restored} MANA`, "highlight");
        }
        // Remove consumable from inventory
        const index = inventory.indexOf(item);
        inventory.splice(index, 1);
      } else {
        this.logToConsole(`${item.name} cannot be used this way`, "error");
      }
    } else {
      this.logToConsole("⚠ Game engine not initialized", "error");
    }
  },

  cmdTalk: function(argString, args) {
    if (!argString) {
      this.logToConsole("Usage: talk [npc name]", "hint");
      return;
    }

    this.logToConsole(`[NPC] Talking to: ${argString}`, "text");
    
    // Wire to NPC dialogue system
    if (window.gameEngine && window.gameEngine.gameState) {
      const npcName = argString.toLowerCase();
      const zone = window.gameEngine.gameState.zone;
      
      // Check for NPCs in current zone
      const npcs = {
        'hub': ['archivist', 'gatekeeper', 'terminal-sage'],
        'forest': ['forest-spirit', 'code-hermit'],
        'city': ['street-vendor', 'data-broker', 'security-ai'],
        'wasteland': ['scavenger', 'old-programmer'],
        'cosmic': ['void-entity', 'quantum-observer']
      };
      
      const availableNPCs = npcs[zone] || [];
      
      if (!availableNPCs.includes(npcName)) {
        this.logToConsole(`There's no one named '${argString}' here`, "error");
        this.logToConsole(`NPCs in this zone: ${availableNPCs.join(', ') || 'none'}`, "hint");
        return;
      }
      
      // Basic NPC dialogue (can be expanded with AI DM integration)
      const dialogues = {
        'archivist': "The archives hold many secrets. Speak 'read' to access documents.",
        'gatekeeper': "To pass the gate, you must prove your worth. Type 'battle' to begin.",
        'terminal-sage': "The ancient terminals speak to those who listen. Use 'terminal' command.",
        'forest-spirit': "The code flows through these trees. Seek balance in your spells.",
        'code-hermit': "I've seen patterns you wouldn't believe. Would you like a hint?",
        'street-vendor': "Data for sale! I have items that might interest you.",
        'data-broker': "Information is currency here. What do you seek?",
        'security-ai': "HALT. State your purpose in this sector.",
        'scavenger': "Found some old tech in the ruins. Want to trade?",
        'old-programmer': "Back in my day, we coded with punch cards...",
        'void-entity': "...the void acknowledges your presence...",
        'quantum-observer': "Your observation changes the outcome. Fascinating."
      };
      
      this.logToConsole(`${argString}: "${dialogues[npcName] || 'I have nothing to say.'}"`, "npc");
      
      // If AI DM is available, could generate dynamic dialogue here
      if (window.AIDM && window.AIDM.isConnected()) {
        this.logToConsole("[Type 'ask <question>' for deeper conversation]", "hint");
      }
    } else {
      this.logToConsole("⚠ Game engine not initialized", "error");
    }
  },

  cmdClear: function() {
    const outputDiv = document.getElementById("output");
    if (outputDiv) {
      outputDiv.innerHTML = "";
    }
  },

  cmdHistory: function() {
    if (this.commandHistory.length === 0) {
      this.logToConsole("No command history", "hint");
      return;
    }

    this.logToConsole("[COMMAND HISTORY]", "highlight");
    this.commandHistory.slice(-10).forEach((cmd, i) => {
      this.logToConsole(`${i + 1}. ${cmd}`, "text");
    });
  },

  cmdDebug: function(argString) {
    this.logToConsole("[DEBUG INFO]", "highlight");
    this.logToConsole(`GameEngine ready: ${!!this.gameEngine}`, "text");
    this.logToConsole(`DiceSystem ready: ${!!this.diceSystem}`, "text");
    this.logToConsole(`Spells loaded: ${Object.keys(window.CastSpells?.spells || {}).length}`, "text");
    this.logToConsole(`Commands registered: ${Object.keys(this.commands).length}`, "text");
    
    if (argString === "full" && this.gameEngine) {
      this.logToConsole("Game state:", "text");
      this.logToConsole(JSON.stringify(this.gameEngine.gameState, null, 2), "text");
    }
  }

};

console.log("[command-parser.js] CommandParser loaded");
console.log("[command-parser.js] Call: CommandParser.initialize(gameEngine, diceSystem)");
console.log("[command-parser.js] Then: CommandParser.parse(userInput)");
