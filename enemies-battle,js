// ============================================================
// ENEMIES-BATTLE.JS
// CASTCONSOLE ENEMY REGISTRY
//
// PURPOSE:
//   - Define all combat enemies (zone-specific)
//   - Store enemy stats (HP, attack, exp, weaknesses)
//   - Define typing prompts (for typing battles)
//   - Create miniboss structures (harder enemies, special rewards)
//   - Store lore/flavor text for each enemy
//
// ENEMY TYPES:
//   - common: Standard zone enemies (respawns)
//   - miniboss: Zone guardians (single spawn, unlocks area)
//   - elite: Rare spawns (high rewards)
//
// WEAKNESSES:
//   - Each enemy has a weakness (spell/damage type)
//   - Exploiting weakness deals 1.5x damage
//
// ============================================================

window.CastEnemies = {

  // ============================================================
  // [ENEMIES_HUB] - Central Hub enemies
  // ============================================================
  "syntax-imp": {
    id: "syntax-imp",
    name: "Syntax Imp",
    type: "common",
    zone: "hub",
    desc: "A small creature made of malformed code. Annoying but weak.",
    hp: 15,
    maxHp: 15,
    attack: 3,
    defense: 1,
    exp: 10,
    data: 5,
    typingPrompt: "normalize",
    weakness: "logic",
    loot: ["code_fragment"],
    flavor: "It chirps in an unknown language."
  },

  "parse-goblin": {
    id: "parse-goblin",
    name: "Parse Goblin",
    type: "common",
    zone: "hub",
    desc: "A mischievous goblin that corrupts strings.",
    hp: 18,
    maxHp: 18,
    attack: 4,
    defense: 1,
    exp: 12,
    data: 6,
    typingPrompt: "extract",
    weakness: "definition",
    loot: ["parser_token"],
    flavor: "It speaks in fragmented sentences."
  },

  "hub-warden": {
    id: "hub-warden",
    name: "Hub Warden",
    type: "miniboss",
    zone: "hub",
    desc: "A guardian conjured from the Hub itself. Protects the gateway.",
    hp: 45,
    maxHp: 45,
    attack: 6,
    defense: 3,
    exp: 50,
    data: 40,
    typingPrompt: "gateway",
    weakness: "purify",
    loot: ["ward_key", "hub_sigil"],
    flavor: "It manifests as shifting architecture. Eyes glow with purpose.",
    special: "Unlocks hub_nexus_full access on defeat"
  },

  // ============================================================
  // [ENEMIES_FOREST] - Refactor Forest enemies
  // ============================================================
  "null-wraith": {
    id: "null-wraith",
    name: "Null Wraith",
    type: "common",
    zone: "forest",
    desc: "A ghost born from undefined variables. Barely exists.",
    hp: 25,
    maxHp: 25,
    attack: 5,
    defense: 1,
    exp: 20,
    data: 10,
    typingPrompt: "decode",
    weakness: "definition",
    loot: ["void_essence"],
    flavor: "It phases in and out of existence, leaving no trace."
  },

  "corrupted-file": {
    id: "corrupted-file",
    name: "Corrupted File",
    type: "common",
    zone: "forest",
    desc: "A file corrupted by time. Dangerous when it runs.",
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 2,
    exp: 15,
    data: 8,
    typingPrompt: "restore",
    weakness: "repair",
    loot: ["restore_patch"],
    flavor: "It stutters and glitches, like old media failing to load."
  },

  "reference-spider": {
    id: "reference-spider",
    name: "Reference Spider",
    type: "common",
    zone: "forest",
    desc: "A creature woven from circular references. Endlessly calling itself.",
    hp: 22,
    maxHp: 22,
    attack: 4,
    defense: 2,
    exp: 18,
    data: 9,
    typingPrompt: "recurse",
    weakness: "break",
    loot: ["recursion_thread"],
    flavor: "It spins webs that loop back on themselves infinitely."
  },

  "forest-guardian": {
    id: "forest-guardian",
    name: "Forest Guardian",
    type: "miniboss",
    zone: "forest",
    desc: "An ancient treant made of compiled code. The forest's protector.",
    hp: 60,
    maxHp: 60,
    attack: 8,
    defense: 4,
    exp: 75,
    data: 60,
    typingPrompt: "cleanse",
    weakness: "cleanse",
    loot: ["root_rune", "ancient_bark"],
    flavor: "It towers above you, branches creaking with knowledge.",
    special: "Unlocks forest_root full access on defeat"
  },

  // ============================================================
  // [ENEMIES_CITY] - Breakpoint City enemies
  // ============================================================
  "debug-daemon": {
    id: "debug-daemon",
    name: "Debug Daemon",
    type: "common",
    zone: "city",
    desc: "A background process stuck in an infinite loop. Relentless.",
    hp: 30,
    maxHp: 30,
    attack: 6,
    defense: 2,
    exp: 25,
    data: 15,
    typingPrompt: "breakpoint",
    weakness: "trace",
    loot: ["debug_token"],
    flavor: "It moves mechanically, following a strict routine."
  },

  "trace-phantom": {
    id: "trace-phantom",
    name: "Trace Phantom",
    type: "common",
    zone: "city",
    desc: "A ghostly echo of execution traces. Haunts the logs.",
    hp: 28,
    maxHp: 28,
    attack: 5,
    defense: 2,
    exp: 22,
    data: 12,
    typingPrompt: "analyze",
    weakness: "decrypt",
    loot: ["trace_log"],
    flavor: "It leaves a faint trail wherever it moves, then fades."
  },

  "security-bot": {
    id: "security-bot",
    name: "Security Bot",
    type: "common",
    zone: "city",
    desc: "An automated defense system. Aggressive and methodical.",
    hp: 32,
    maxHp: 32,
    attack: 7,
    defense: 3,
    exp: 28,
    data: 18,
    typingPrompt: "override",
    weakness: "spoof",
    loot: ["auth_token"],
    flavor: "Red lights scan across its chassis. It calculates your threat level."
  },

  "city-sentinel": {
    id: "city-sentinel",
    name: "City Sentinel",
    type: "miniboss",
    zone: "city",
    desc: "The ultimate guard of Breakpoint City. Intelligent and ruthless.",
    hp: 80,
    maxHp: 80,
    attack: 10,
    defense: 5,
    exp: 100,
    data: 80,
    typingPrompt: "shutdown",
    weakness: "spoof",
    loot: ["sentinel_core", "city_override"],
    flavor: "It stands impossibly still, watching. When it moves, reality glitches.",
    special: "Unlocks city_underground full access on defeat"
  },

  // ============================================================
  // [ELITE_ENEMIES] - Rare, high-value encounters
  // ============================================================
  "memory-leak": {
    id: "memory-leak",
    name: "Memory Leak",
    type: "elite",
    zone: "any",
    desc: "A malignant program that consumes all resources. Exponentially growing.",
    hp: 50,
    maxHp: 50,
    attack: 8,
    defense: 2,
    exp: 60,
    data: 50,
    typingPrompt: "terminate",
    weakness: "purify",
    loot: ["memory_core", "optimization_token"],
    flavor: "It grows larger as you fight. Resources drain from your system."
  },

  "deadlock-entity": {
    id: "deadlock-entity",
    name: "Deadlock Entity",
    type: "elite",
    zone: "any",
    desc: "Two processes frozen in mutual waiting. Neither can proceed.",
    hp: 55,
    maxHp: 55,
    attack: 7,
    defense: 4,
    exp: 65,
    data: 55,
    typingPrompt: "unlock",
    weakness: "break",
    loot: ["deadlock_key"],
    flavor: "It exists in two places simultaneously. Defeating one frees the other."
  },

  "the-observer": {
    id: "the-observer",
    name: "The Observer",
    type: "elite",
    zone: "hub",
    desc: "An entity that has watched everything. Perhaps it's watching you.",
    hp: 70,
    maxHp: 70,
    attack: 9,
    defense: 3,
    exp: 85,
    data: 70,
    typingPrompt: "recognize",
    weakness: "identity",
    loot: ["observer_eye", "recognition_token"],
    flavor: "It looks at you. You feel seen. Too seen.",
    special: "Defeating this unlocks narrative branch questioning your identity"
  },

  // ============================================================
  // [HIDDEN_ENEMIES] - Only appear in specific conditions
  // ============================================================
  "echo-self": {
    id: "echo-self",
    name: "Echo of Self",
    type: "elite",
    zone: "hub",
    desc: "Your own code reflected back at you. Fighting yourself.",
    hp: 60,
    maxHp: 60,
    attack: 10,
    defense: 3,
    exp: 100,
    data: 100,
    typingPrompt: "identity",
    weakness: "self-awareness",
    loot: ["self_shard"],
    flavor: "It copies your moves. It knows what you'll do before you do.",
    special: "Only appears after multiple terminal deceptions (identity puzzle)",
    hidden: true
  },

  "void-thing": {
    id: "void-thing",
    name: "Void Thing",
    type: "elite",
    zone: "any",
    desc: "Something that doesn't belong in this simulation. Corrupting reality.",
    hp: 100,
    maxHp: 100,
    attack: 12,
    defense: 6,
    exp: 150,
    data: 150,
    typingPrompt: "banish",
    weakness: "exorcism",
    loot: ["void_fragment", "reality_anchor"],
    flavor: "It exists and doesn't exist. Looking at it hurts.",
    special: "Final/endgame enemy. Requires specific items to summon.",
    hidden: true
  }
};

// ============================================================
// [WEAKNESS_SYSTEM] - Damage type modifiers
// ============================================================
window.WeaknessMap = {
  logic: { multiplier: 1.5, spells: ["debug", "analyze", "parse"] },
  definition: { multiplier: 1.5, spells: ["define", "inspect"] },
  repair: { multiplier: 1.5, spells: ["restore", "cleanse"] },
  trace: { multiplier: 1.5, spells: ["trace", "decrypt"] },
  break: { multiplier: 1.5, spells: ["break", "terminate"] },
  purify: { multiplier: 1.5, spells: ["purify", "exorcism"] },
  spoof: { multiplier: 1.5, spells: ["spoof_email", "remote_execute"] },
  "self-awareness": { multiplier: 2.0, spells: ["introspect", "recognize"] },
  exorcism: { multiplier: 2.0, spells: ["exorcism", "banish"] },
  identity: { multiplier: 1.5, spells: ["identity", "define"] }
};

// ============================================================
// [UTILITY_FUNCTIONS] - Enemy spawn & balance
// ============================================================

/**
 * Get random common enemy from zone
 */
window.getZoneEnemy = function(zoneId) {
  const enemies = Object.values(CastEnemies).filter(e => 
    e.zone === zoneId && e.type === "common" && !e.hidden
  );
  if (enemies.length === 0) return null;
  return enemies[Math.floor(Math.random() * enemies.length)];
};

/**
 * Get miniboss for zone
 */
window.getZoneMiniboss = function(zoneId) {
  const minibosses = Object.values(CastEnemies).filter(e => 
    e.zone === zoneId && e.type === "miniboss"
  );
  if (minibosses.length === 0) return null;
  return minibosses[0];
};

/**
 * Get random elite enemy (any zone)
 */
window.getEliteEnemy = function() {
  const elites = Object.values(CastEnemies).filter(e => 
    e.type === "elite" && !e.hidden
  );
  if (elites.length === 0) return null;
  return elites[Math.floor(Math.random() * elites.length)];
};

/**
 * Check if player exploits weakness
 */
window.checkWeakness = function(playerSpell, enemyWeakness) {
  const weakness = WeaknessMap[enemyWeakness];
  if (!weakness) return 1.0;
  return weakness.spells.includes(playerSpell) ? weakness.multiplier : 1.0;
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[enemies-battle.js] CastEnemies loaded: " + Object.keys(window.CastEnemies).length + " enemies");
console.log("[enemies-battle.js] WeaknessMap initialized with " + Object.keys(window.WeaknessMap).length + " weakness types");