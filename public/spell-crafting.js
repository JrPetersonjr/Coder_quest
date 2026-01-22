// ============================================================
// SPELL-CRAFTING.JS
// CASTCONSOLE SPELL TINKERING & COMBINATION SYSTEM
//
// PURPOSE:
//   - Combine code bits + zone objects + modifiers
//   - Procedurally generate infinite spell variations
//   - Store discovered combinations in gameState
//   - Scale crafting cost with player level
//   - Track learned code bits (unlock via quests/terminals)
//   - AI can generate dynamic combinations outside base set
//
// STRUCTURE:
//   CodeBits = Modifiers (learned progressively)
//   ZoneObjects = Physical ingredients from exploration
//   BaseCombinations = Tutorial/prereq spells (hand-crafted)
//   DiscoveredSpells = Player creations (stored in gameState)
//
// ============================================================

window.SpellCrafting = {

  // ============================================================
  // [CODE_BITS] - Modifiers (learned via progression)
  // ============================================================
  codeBits: {
    // Base bits (learned early)
    "fire": {
      id: "fire",
      name: "Fire",
      type: "element",
      description: "Intense heat and combustion.",
      learned: true,
      unlockedAt: "start",
      tags: ["damage", "heat"]
    },
    "ice": {
      id: "ice",
      name: "Ice",
      type: "element",
      description: "Freezing cold and brittleness.",
      learned: true,
      unlockedAt: "start",
      tags: ["damage", "control"]
    },
    "logic": {
      id: "logic",
      name: "Logic",
      type: "element",
      description: "Pure computational power.",
      learned: true,
      unlockedAt: "start",
      tags: ["damage", "precision"]
    },
    "chaos": {
      id: "chaos",
      name: "Chaos",
      type: "element",
      description: "Unpredictable and wild.",
      learned: true,
      unlockedAt: "start",
      tags: ["damage", "unpredictable"]
    },
    "void": {
      id: "void",
      name: "Void",
      type: "element",
      description: "Absence and negation.",
      learned: false,
      unlockedAt: "forest:root-access",
      tags: ["damage", "corruption"]
    },
    "life": {
      id: "life",
      name: "Life",
      type: "element",
      description: "Vitality and restoration.",
      learned: false,
      unlockedAt: "restoration_terminal",
      tags: ["healing", "growth"]
    },
    "data": {
      id: "data",
      name: "Data",
      type: "element",
      description: "Information and knowledge.",
      learned: false,
      unlockedAt: "city:neon-debug",
      tags: ["utility", "information"]
    },

    // Modifiers (learned via quests/terminals)
    "boost": {
      id: "boost",
      name: "Boost",
      type: "modifier",
      description: "Increase power output.",
      learned: false,
      unlockedAt: "hub:nexus-portal",
      damageMultiplier: 1.5,
      costMultiplier: 1.3,
      tags: ["amplify", "expensive"]
    },
    "compress": {
      id: "compress",
      name: "Compress",
      type: "modifier",
      description: "Reduce mana cost.",
      learned: false,
      unlockedAt: "mana_training",
      costMultiplier: 0.7,
      damageMultiplier: 0.9,
      tags: ["efficiency", "weak"]
    },
    "chain": {
      id: "chain",
      name: "Chain",
      type: "modifier",
      description: "Strike multiple times.",
      learned: false,
      unlockedAt: "advanced_combat_training",
      hits: 2,
      costMultiplier: 1.2,
      tags: ["multi-hit", "expensive"]
    },
    "pierce": {
      id: "pierce",
      name: "Pierce",
      type: "modifier",
      description: "Ignore armor.",
      learned: false,
      unlockedAt: "city:data-vault",
      armor_ignore: 0.5,
      tags: ["penetration", "tactical"]
    },
    "drain": {
      id: "drain",
      name: "Drain",
      type: "modifier",
      description: "Steal health from enemy.",
      learned: false,
      unlockedAt: "void_terminal",
      lifeSteal: 0.5,
      tags: ["lifesteal", "dark"]
    },
    "slow": {
      id: "slow",
      name: "Slow",
      type: "modifier",
      description: "Reduce enemy speed.",
      learned: false,
      unlockedAt: "control_training",
      effect: "slowed",
      effectTurns: 2,
      tags: ["control", "debuff"]
    },
    "reflect": {
      id: "reflect",
      name: "Reflect",
      type: "modifier",
      description: "Bounce damage back.",
      learned: false,
      unlockedAt: "defensive_training",
      reflects: 0.3,
      tags: ["defense", "counter"]
    },
    "silent": {
      id: "silent",
      name: "Silent",
      type: "modifier",
      description: "Prevent enemy casting.",
      learned: false,
      unlockedAt: "silence_terminal",
      silences: true,
      tags: ["control", "disrupt"]
    },
    "volatile": {
      id: "volatile",
      name: "Volatile",
      type: "modifier",
      description: "Chance to backfire.",
      learned: false,
      unlockedAt: "chaos_training",
      backfireChance: 0.2,
      backfireDamage: 0.5,
      tags: ["risky", "high-reward"]
    }
  },

  // ============================================================
  // [ZONE_OBJECTS] - Physical ingredients from exploration
  // ============================================================
  zoneObjects: {
    // Hub
    "code_fragment": {
      id: "code_fragment",
      name: "Code Fragment",
      zone: "hub",
      type: "material",
      rarity: "common",
      description: "A piece of pure code.",
      tags: ["logic", "precision"]
    },
    "circuit": {
      id: "circuit",
      name: "Circuit Board",
      zone: "hub",
      type: "material",
      rarity: "uncommon",
      description: "Etched pathways of power.",
      tags: ["logic", "structure"]
    },

    // Forest
    "leaf": {
      id: "leaf",
      name: "Ancient Leaf",
      zone: "forest",
      type: "material",
      rarity: "common",
      description: "Code-written organic matter.",
      tags: ["life", "growth", "nature"]
    },
    "wood": {
      id: "wood",
      name: "Petrified Code Wood",
      zone: "forest",
      type: "material",
      rarity: "uncommon",
      description: "Crystallized tree bark.",
      tags: ["structure", "stability"]
    },
    "seed": {
      id: "seed",
      name: "Recursive Seed",
      zone: "forest",
      type: "material",
      rarity: "rare",
      description: "Contains infinite growth.",
      tags: ["life", "recursion", "infinite"]
    },

    // City
    "neon_shard": {
      id: "neon_shard",
      name: "Neon Shard",
      zone: "city",
      type: "material",
      rarity: "common",
      description: "Glowing fragments of light.",
      tags: ["light", "energy", "signal"]
    },
    "copper_wire": {
      id: "copper_wire",
      name: "Copper Wire",
      zone: "city",
      type: "material",
      rarity: "common",
      description: "Conductive pathway.",
      tags: ["electricity", "connection"]
    },
    "silicon_dust": {
      id: "silicon_dust",
      name: "Silicon Dust",
      zone: "city",
      type: "material",
      rarity: "uncommon",
      description: "Processor remnants.",
      tags: ["logic", "computation"]
    },

    // Universal
    "water": {
      id: "water",
      name: "Liquid Data",
      zone: "any",
      type: "material",
      rarity: "common",
      description: "Flowing information.",
      tags: ["flow", "adaptability"]
    },
    "stone": {
      id: "stone",
      name: "Encrypted Stone",
      zone: "any",
      type: "material",
      rarity: "uncommon",
      description: "Immovable foundation.",
      tags: ["stability", "defense"]
    },
    "lightning": {
      id: "lightning",
      name: "Bottled Lightning",
      zone: "any",
      type: "material",
      rarity: "rare",
      description: "Raw electrical energy.",
      tags: ["electricity", "damage", "speed"]
    },
    "sand": {
      id: "sand",
      name: "Binary Sand",
      zone: "any",
      type: "material",
      rarity: "common",
      description: "Granular data particles.",
      tags: ["chaos", "scatter"]
    }
  },

  // ============================================================
  // [BASE_COMBINATIONS] - Hand-crafted tutorial spells
  // ============================================================
  baseCombinations: {
    "fire_basic": {
      id: "fire_basic",
      name: "Fireball",
      codeBits: ["fire"],
      zoneObjects: [],
      modifiers: [],
      cost: 3,
      damage: 12,
      description: "A basic flame spell. Your first true creation.",
      type: "combat",
      tutorial: true,
      learned: false,
      unlockedAt: "start"
    },

    "ice_basic": {
      id: "ice_basic",
      name: "Frost Bolt",
      codeBits: ["ice"],
      zoneObjects: [],
      modifiers: [],
      cost: 3,
      damage: 12,
      effect: "slowed",
      effectTurns: 1,
      description: "A freezing spell. Control the battlefield.",
      type: "combat",
      tutorial: true,
      learned: false,
      unlockedAt: "start"
    },

    "logic_basic": {
      id: "logic_basic",
      name: "Analyze",
      codeBits: ["logic"],
      zoneObjects: [],
      modifiers: [],
      cost: 2,
      damage: 8,
      effect: "revealed",
      description: "Pure logical assault.",
      type: "combat",
      tutorial: true,
      learned: false,
      unlockedAt: "start"
    },

    "chaos_basic": {
      id: "chaos_basic",
      name: "Chaos Bolt",
      codeBits: ["chaos"],
      zoneObjects: [],
      modifiers: [],
      cost: 3,
      damage: 14,
      unpredictable: true,
      description: "Chaotic magic. Unpredictable results.",
      type: "combat",
      tutorial: true,
      learned: false,
      unlockedAt: "start"
    },

    "fire_ice_steam": {
      id: "fire_ice_steam",
      name: "Steam Cloud",
      codeBits: ["fire", "ice"],
      zoneObjects: ["water"],
      modifiers: [],
      cost: 5,
      damage: 10,
      aoe: true,
      description: "Combine heat and cold to create scalding vapor.",
      type: "combat",
      tutorial: false,
      learned: false,
      unlockedAt: "forest:root-access"
    },

    "life_healing": {
      id: "life_healing",
      name: "Mend",
      codeBits: ["life"],
      zoneObjects: ["leaf"],
      modifiers: [],
      cost: 4,
      heal: 15,
      description: "Restore vitality.",
      type: "healing",
      tutorial: false,
      learned: false,
      unlockedAt: "restoration_terminal"
    }
  },

  // ============================================================
  // [DISCOVERY] - Player-created spells (stored in gameState)
  // ============================================================

  /**
   * Create a new spell from components
   * @param {object} gameState - Player game state
   * @param {array} codeBits - Code bit IDs
   * @param {array} zoneObjects - Zone object IDs
   * @param {array} modifiers - Modifier IDs
   * @returns {object} Created spell or error
   */
  craftSpell(gameState, codeBits, zoneObjects, modifiers) {
    // Validate inputs
    if (!codeBits || codeBits.length === 0) {
      return { error: true, msg: "No code bits selected." };
    }

    // Check if player has learned these bits
    codeBits.forEach(bitId => {
      const bit = this.codeBits[bitId];
      if (!bit || !bit.learned) {
        return { error: true, msg: `Code bit "${bitId}" not learned.` };
      }
    });

    // Check if player has ingredients
    zoneObjects.forEach(objId => {
      const obj = this.zoneObjects[objId];
      if (!obj || !gameState.inventory.includes(objId)) {
        return { error: true, msg: `Missing ingredient: ${objId}` };
      }
    });

    modifiers.forEach(modId => {
      const mod = this.codeBits[modId];
      if (!mod || mod.type !== "modifier" || !mod.learned) {
        return { error: true, msg: `Modifier "${modId}" not learned.` };
      }
    });

    // Calculate cost based on player level
    const baseCost = 10;
    const levelMultiplier = 1 + (gameState.level * 0.5);
    const craftingCost = Math.floor(baseCost * levelMultiplier);

    if ((gameState.data || 0) < craftingCost) {
      return { error: true, msg: `Not enough data. Need ${craftingCost}, have ${gameState.data}.` };
    }

    // Generate spell
    const spell = this.generateSpell(codeBits, zoneObjects, modifiers, gameState.level);

    // Deduct cost
    gameState.data -= craftingCost;

    // Consume ingredients
    zoneObjects.forEach(objId => {
      const idx = gameState.inventory.indexOf(objId);
      if (idx > -1) {
        gameState.inventory.splice(idx, 1);
      }
    });

    // Store in gameState
    if (!gameState.discoveredSpells) {
      gameState.discoveredSpells = {};
    }
    gameState.discoveredSpells[spell.id] = spell;

    return {
      success: true,
      spell: spell,
      costPaid: craftingCost,
      msg: `Created "${spell.name}"! It feels powerful.`
    };
  },

  /**
   * Generate spell stats from components
   * @param {array} codeBits - Code bit IDs
   * @param {array} zoneObjects - Zone object IDs
   * @param {array} modifiers - Modifier IDs
   * @param {number} playerLevel - For scaling
   * @returns {object} Generated spell
   */
  generateSpell(codeBits, zoneObjects, modifiers, playerLevel) {
    const id = `custom_${Date.now()}`;
    const name = this.generateSpellName(codeBits, zoneObjects, modifiers);

    // Base damage
    let damage = 10 + (codeBits.length * 3) + (playerLevel * 2);
    let cost = 3 + (codeBits.length * 1) + (modifiers.length * 1);
    let description = `A custom spell combining ${codeBits.join(", ")}`;

    // Apply modifiers
    const effects = [];
    modifiers.forEach(modId => {
      const mod = this.codeBits[modId];
      if (mod.damageMultiplier) damage *= mod.damageMultiplier;
      if (mod.costMultiplier) cost *= mod.costMultiplier;
      if (mod.hits) effects.push(`Hits ${mod.hits} times`);
      if (mod.effect) effects.push(mod.effect);
    });

    // Zone object bonuses
    zoneObjects.forEach(objId => {
      const obj = this.zoneObjects[objId];
      if (obj.rarity === "rare") damage *= 1.3;
      if (obj.rarity === "uncommon") damage *= 1.15;
    });

    return {
      id: id,
      name: name,
      codeBits: codeBits,
      zoneObjects: zoneObjects,
      modifiers: modifiers,
      cost: Math.floor(cost),
      damage: Math.floor(damage),
      description: description,
      effects: effects,
      type: "custom",
      discovered: true,
      discoveredAt: Date.now(),
      playerLevel: playerLevel
    };
  },

  /**
   * Generate procedural spell name
   * @param {array} codeBits - Code bit IDs
   * @param {array} zoneObjects - Zone object IDs
   * @param {array} modifiers - Modifier IDs
   * @returns {string} Generated name
   */
  generateSpellName(codeBits, zoneObjects, modifiers) {
    const prefixes = [
      "Arcane", "Quantum", "Void", "Eternal", "Cascading",
      "Resonant", "Fractal", "Primal", "Volatile", "Temporal"
    ];

    const coreNames = {
      fire: "Flame",
      ice: "Frost",
      logic: "Pulse",
      chaos: "Storm",
      void: "Null",
      life: "Bloom",
      data: "Stream"
    };

    const suffixes = [
      "Strike", "Surge", "Burst", "Wave", "Cascade",
      "Torrent", "Maelstrom", "Nexus", "Vortex", "Echo"
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const core = coreNames[codeBits[0]] || "Force";
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    if (modifiers.length > 0) {
      const modName = this.codeBits[modifiers[0]]?.name || "";
      return `${prefix} ${modName} ${core}${suffix}`;
    }

    return `${prefix} ${core}${suffix}`;
  },

  /**
   * Learn a new code bit
   * @param {object} gameState - Player state
   * @param {string} bitId - Code bit to learn
   * @returns {object} Result
   */
  learnCodeBit(gameState, bitId) {
    const bit = this.codeBits[bitId];
    if (!bit) {
      return { error: true, msg: "Code bit not found." };
    }

    if (bit.learned) {
      return { error: true, msg: "Already learned." };
    }

    bit.learned = true;

    if (!gameState.learnedCodeBits) {
      gameState.learnedCodeBits = [];
    }
    gameState.learnedCodeBits.push(bitId);

    return {
      success: true,
      bit: bit,
      msg: `Learned "${bit.name}": ${bit.description}`
    };
  },

  /**
   * Get learnable code bits (for UI)
   * @returns {array} Available bits
   */
  getLearnableBits() {
    return Object.values(this.codeBits).filter(b => !b.learned);
  },

  /**
   * Get available zone objects in inventory
   * @param {array} inventory - Player inventory
   * @returns {array} Zone objects player has
   */
  getAvailableObjects(inventory) {
    return inventory
      .filter(item => this.zoneObjects[item])
      .map(item => this.zoneObjects[item]);
  }
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[spell-crafting.js] SpellCrafting initialized");
console.log("[spell-crafting.js] Code bits: " + Object.keys(window.SpellCrafting.codeBits).length);
console.log("[spell-crafting.js] Zone objects: " + Object.keys(window.SpellCrafting.zoneObjects).length);
console.log("[spell-crafting.js] Base combinations: " + Object.keys(window.SpellCrafting.baseCombinations).length);