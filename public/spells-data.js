// ============================================================
// SPELLS-DATA.JS
// CASTCONSOLE SPELL REGISTRY
//
// PURPOSE:
//   - Define all known spells (base library)
//   - Store spell metadata (cost, damage, type, description)
//   - Player-defined spells live in gameState.defined
//   - Terminal-unlocked spells stored here as unlockables
//   - Spell categories: combat, utility, healing, debuff
//
// SPELL SYSTEM:
//   - Base spells are static (always available once learned)
//   - Dynamic spells are created via 'define' command
//   - Terminal challenges unlock new spells as rewards
//   - Spells require MP to cast (except some utility)
//
// ============================================================

window.CastSpells = {

  // ============================================================
  // [SPELLS_COMBAT] - Damage-dealing spells
  // ============================================================
  normalize: {
    id: "normalize",
    name: "Normalize",
    category: "combat",
    cost: 2,
    dmg: 8,
    desc: "Order from chaos. Straightens the enemy's code.",
    flavor: "Reality snaps into focus.",
    type: "logic",
    learned: true,
    scalable: true
  },

  debug: {
    id: "debug",
    name: "Debug",
    category: "combat",
    cost: 3,
    dmg: 12,
    desc: "Trace the error. Find the weak point.",
    flavor: "The enemy's flaws become visible.",
    type: "analysis",
    learned: true,
    scalable: true
  },

  compile: {
    id: "compile",
    name: "Compile",
    category: "combat",
    cost: 2,
    dmg: 9,
    desc: "Build power. Compress and execute.",
    flavor: "Energy solidifies into a strike.",
    type: "logic",
    learned: true,
    scalable: true
  },

  decode: {
    id: "decode",
    name: "Decode",
    category: "combat",
    cost: 3,
    dmg: 11,
    desc: "Unlock secrets. Break the cipher.",
    flavor: "Encrypted defenses crumble.",
    type: "security",
    learned: false,
    unlock: "city:neon-debug"
  },

  encrypt: {
    id: "encrypt",
    name: "Encrypt",
    category: "combat",
    cost: 2,
    dmg: 7,
    desc: "Shield yourself. Obscure your presence.",
    flavor: "You fade into static.",
    type: "security",
    learned: false,
    unlock: "network:spoof-challenge"
  },

  analyze: {
    id: "analyze",
    name: "Analyze",
    category: "combat",
    cost: 2,
    dmg: 6,
    desc: "Examine weak points. Expose vulnerabilities.",
    flavor: "The enemy's structure reveals itself.",
    type: "analysis",
    learned: false,
    unlock: "logic:code-match"
  },

  parse: {
    id: "parse",
    name: "Parse",
    category: "combat",
    cost: 3,
    dmg: 13,
    desc: "Dissect your foe. Break them down.",
    flavor: "The enemy fragments into pieces.",
    type: "logic",
    learned: false,
    unlock: "forest:root-access"
  },

  tokenize: {
    id: "tokenize",
    name: "Tokenize",
    category: "combat",
    cost: 2,
    dmg: 8,
    desc: "Fragment reality. Split the enemy.",
    flavor: "The world stutters.",
    type: "logic",
    learned: false,
    unlock: "hub:nexus-portal"
  },

  optimize: {
    id: "optimize",
    name: "Optimize",
    category: "combat",
    cost: 4,
    dmg: 15,
    desc: "Peak efficiency. Maximum damage output.",
    flavor: "Raw power manifests.",
    type: "logic",
    learned: false,
    unlock: "advanced_combat_training"
  },

  // ============================================================
  // [SPELLS_UTILITY] - Non-combat spells
  // ============================================================
  inspect: {
    id: "inspect",
    name: "Inspect",
    category: "utility",
    cost: 1,
    dmg: 0,
    desc: "Reveal enemy weaknesses and stats.",
    flavor: "You see the truth.",
    type: "analysis",
    learned: true,
    scalable: false
  },

  improvise: {
    id: "improvise",
    name: "Improvise",
    category: "utility",
    cost: 2,
    dmg: 10,
    desc: "Human intuition. Unpredictable magic.",
    flavor: "Something unexpected happens.",
    type: "chaos",
    learned: false,
    unlock: "hub_nexus_full"
  },

  instinct: {
    id: "instinct",
    name: "Instinct",
    category: "utility",
    cost: 3,
    dmg: 12,
    desc: "Trust your gut. Dodge and strike.",
    flavor: "Your body moves on its own.",
    type: "chaos",
    learned: false,
    unlock: "battle_xp_50"
  },

  wild_cast: {
    id: "wild_cast",
    name: "Wild Cast",
    category: "utility",
    cost: 4,
    dmg: 14,
    desc: "Chaos magic. Unpredictable results.",
    flavor: "Reality bends to your will—or breaks.",
    type: "chaos",
    learned: false,
    unlock: "chaos_magic_training"
  },

  // ============================================================
  // [SPELLS_HEALING] - Restoration spells
  // ============================================================
  restoration: {
    id: "restoration",
    name: "Restoration",
    category: "healing",
    cost: 5,
    dmg: 0,
    heal: 20,
    desc: "Rebuild yourself. Restore lost health.",
    flavor: "Warmth spreads through your body.",
    type: "healing",
    learned: false,
    unlock: "forest:root-access"
  },

  cleanse: {
    id: "cleanse",
    name: "Cleanse",
    category: "healing",
    cost: 3,
    dmg: 10,
    heal: 10,
    desc: "Remove corruption. Purify and heal.",
    flavor: "Corruption melts away.",
    type: "healing",
    learned: false,
    unlock: "forest:root-access"
  },

  refresh: {
    id: "refresh",
    name: "Refresh",
    category: "healing",
    cost: 2,
    dmg: 0,
    manaRestore: 10,
    desc: "Restore mana. Clear the mind.",
    flavor: "Energy returns to you.",
    type: "utility",
    learned: false,
    unlock: "mana_training"
  },

  // ============================================================
  // [SPELLS_DEBUFF] - Enemy debilitation spells
  // ============================================================
  trace: {
    id: "trace",
    name: "Trace",
    category: "debuff",
    cost: 2,
    dmg: 5,
    desc: "Follow the execution path. Slow the enemy.",
    flavor: "The enemy's movements become labored.",
    type: "control",
    learned: false,
    unlock: "city:data-vault"
  },

  break: {
    id: "break",
    name: "Break",
    category: "debuff",
    cost: 3,
    dmg: 8,
    desc: "Shatter focus. Interrupt the enemy.",
    flavor: "The enemy's concentration fractures.",
    type: "control",
    learned: false,
    unlock: "logic:code-match"
  },

  poison: {
    id: "poison",
    name: "Poison",
    category: "debuff",
    cost: 2,
    dmg: 3,
    dot: 2,
    dotTurns: 3,
    desc: "Corrupt the system. Damage over time.",
    flavor: "Decay spreads through the enemy.",
    type: "corruption",
    learned: false,
    unlock: "city:neon-debug"
  },

  stun: {
    id: "stun",
    name: "Stun",
    category: "debuff",
    cost: 3,
    dmg: 0,
    effect: "stunned",
    effectTurns: 1,
    desc: "Freeze movement. Paralyze the enemy.",
    flavor: "The enemy halts mid-action.",
    type: "control",
    learned: false,
    unlock: "security_protocol"
  },

  // ============================================================
  // [SPELLS_TERMINAL_UNLOCKS] - Powerful spells from terminals
  // ============================================================
  exorcism: {
    id: "exorcism",
    name: "Exorcism",
    category: "combat",
    cost: 6,
    dmg: 20,
    desc: "Banish spirits. Remove unnatural beings.",
    flavor: "The enemy is torn from reality.",
    type: "banishment",
    learned: false,
    unlock: "the-observer_defeat",
    powerful: true
  },

  decrypt: {
    id: "decrypt",
    name: "Decrypt",
    category: "combat",
    cost: 3,
    dmg: 12,
    desc: "Unlock secrets. Break encrypted defenses.",
    flavor: "All is revealed.",
    type: "security",
    learned: false,
    unlock: "city:neon-debug",
    scalable: true
  },

  purify: {
    id: "purify",
    name: "Purify",
    category: "healing",
    cost: 4,
    dmg: 0,
    heal: 15,
    desc: "Remove all corruption. Restore purity.",
    flavor: "Sickness vanishes.",
    type: "healing",
    learned: false,
    unlock: "wasteland:null-core"
  },

  infinite_loop: {
    id: "infinite_loop",
    name: "Infinite Loop",
    category: "combat",
    cost: 5,
    dmg: 25,
    desc: "Trap the enemy in recursion. Endless damage.",
    flavor: "The enemy repeats its own demise eternally.",
    type: "logic",
    learned: false,
    unlock: "cosmic:architect-gate",
    powerful: true
  },

  remote_execute: {
    id: "remote_execute",
    name: "Remote Execute",
    category: "combat",
    cost: 4,
    dmg: 16,
    desc: "Run code on distant systems. Strike from afar.",
    flavor: "Your command executes miles away.",
    type: "hacking",
    learned: false,
    unlock: "network:spoof-challenge"
  },

  // ============================================================
  // [SPELLS_ADVANCED] - Late-game powerful spells
  // ============================================================
  recursion: {
    id: "recursion",
    name: "Recursion",
    category: "combat",
    cost: 4,
    dmg: 18,
    desc: "Call yourself. Multiplied power.",
    flavor: "You strike twice simultaneously.",
    type: "logic",
    learned: false,
    unlock: "recursive_training",
    powerful: true
  },

  temporal_shift: {
    id: "temporal_shift",
    name: "Temporal Shift",
    category: "utility",
    cost: 5,
    dmg: 0,
    effect: "dodge_next",
    desc: "Rewind your position. Avoid the next attack.",
    flavor: "Time bends around you.",
    type: "reality",
    learned: false,
    unlock: "time_manipulation",
    powerful: true
  },

  network_storm: {
    id: "network_storm",
    name: "Network Storm",
    category: "combat",
    cost: 6,
    dmg: 22,
    desc: "Unleash cascading network attacks. Multi-hit.",
    flavor: "Data storms rage across the connection.",
    type: "hacking",
    learned: false,
    unlock: "network_mastery",
    powerful: true,
    multiHit: 3
  },

  singularity: {
    id: "singularity",
    name: "Singularity",
    category: "combat",
    cost: 8,
    dmg: 50,
    desc: "Create a point of infinite density. Ultimate power.",
    flavor: "Reality collapses inward.",
    type: "reality",
    learned: false,
    unlock: "endgame_ritual",
    powerful: true,
    ultimate: true
  },

  // ============================================================
  // [SPELLS_NARRATIVE] - Story/identity spells
  // ============================================================
  introspect: {
    id: "introspect",
    name: "Introspect",
    category: "utility",
    cost: 3,
    dmg: 0,
    desc: "Look within. Understand yourself.",
    flavor: "You peer into your own code.",
    type: "identity",
    learned: false,
    unlock: "identity_puzzle_advanced",
    narrative: true
  },

  recognize: {
    id: "recognize",
    name: "Recognize",
    category: "utility",
    cost: 2,
    dmg: 0,
    desc: "Know what you're fighting. Understand the enemy.",
    flavor: "Familiarity dawns.",
    type: "identity",
    learned: false,
    unlock: "echo-self_encounter",
    narrative: true
  },

  identity: {
    id: "identity",
    name: "Identity",
    category: "combat",
    cost: 4,
    dmg: 15,
    desc: "Assert who you are. Damage based on definition.",
    flavor: "You become wholly yourself.",
    type: "identity",
    learned: false,
    unlock: "identity_resolution",
    narrative: true,
    scalable: true
  }
};

// ============================================================
// [SPELL_CATEGORIES] - Grouping for UI/analysis
// ============================================================
window.SpellCategories = {
  combat: Object.values(CastSpells).filter(s => s.category === "combat"),
  healing: Object.values(CastSpells).filter(s => s.category === "healing"),
  utility: Object.values(CastSpells).filter(s => s.category === "utility"),
  debuff: Object.values(CastSpells).filter(s => s.category === "debuff")
};

// ============================================================
// [UTILITY_FUNCTIONS] - Spell operations
// ============================================================

/**
 * Get spell by ID
 */
window.getSpell = function(spellId) {
  return CastSpells[spellId] || null;
};

/**
 * Check if player can cast spell (has MP)
 */
window.canCastSpell = function(gameState, spellId) {
  const spell = CastSpells[spellId];
  if (!spell) return false;
  return gameState.mp >= spell.cost;
};

/**
 * Cast spell and consume MP
 */
window.castSpell = function(gameState, spellId) {
  const spell = getSpell(spellId);
  if (!spell) return { success: false, msg: "Spell not found." };
  
  if (gameState.mp < spell.cost) {
    return { success: false, msg: "Not enough MP." };
  }
  
  gameState.mp -= spell.cost;
  
  return {
    success: true,
    spell: spell,
    damage: spell.dmg || 0,
    healing: spell.heal || 0,
    manaRestore: spell.manaRestore || 0,
    effect: spell.effect || null,
    msg: `Cast ${spell.name}!`
  };
};

/**
 * Get all unlocked spells for player
 */
window.getUnlockedSpells = function(gameState) {
  const unlocked = [];
  
  // Base learned spells
  Object.values(CastSpells).forEach(spell => {
    if (spell.learned) {
      unlocked.push(spell);
    }
  });
  
  // Check gameState for unlocked spells
  Object.keys(gameState.defined).forEach(key => {
    const spell = CastSpells[key];
    if (spell) {
      unlocked.push(spell);
    }
  });
  
  return unlocked;
};

/**
 * Calculate spell damage with modifiers
 */
window.calculateSpellDamage = function(spell, playerLevel, weakness) {
  let dmg = spell.dmg || 0;
  
  // Level scaling
  dmg += playerLevel * 1.5;
  
  // Weakness exploit
  if (weakness) {
    dmg *= weakness;
  }
  
  return Math.floor(dmg);
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[spells-data.js] CastSpells loaded: " + Object.keys(window.CastSpells).length + " spells");
console.log("[spells-data.js] SpellCategories initialized");