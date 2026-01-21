/**
 * SPELL TINKERING SYSTEM - spell-tinkering.js
 * =============================================
 * Hybrid spell crafting with level scaling, data economy, and quantum Technonomicon
 * 
 * CORE CONCEPT:
 * - Spells are combinations of elements + code bits
 * - Data is the ONLY crafting resource (no hand-holding on recipes)
 * - Level scaling makes god rolls feel like massive accomplishments
 * - EPIC spells require perfect rolls + specific combinations
 * - Technonomicon is quantum: linear path + sandbox variations (observer effect)
 * - Library updates tier gated by data + RNG (miniboss triggers bonus bonuses)
 * - Data collected from enemies (surveillance), environment (items), terminals (rare tools)
 */

class SpellTinkeringSystem {
  constructor(gameState, diceSystem, aiDMIntegration) {
    this.gameState = gameState;
    this.dice = diceSystem;
    this.aiDM = aiDMIntegration;
    
    // Player's grimoire (Technonomicon)
    this.technonomicon = {
      discoveredSpells: new Map(),      // spellName -> spellDefinition
      discoveredElements: new Set(),    // core + esoteric elements player has found
      discoveredCodeBits: new Set(),    // code bits unlocked (heal, damage, drain, delete, etc)
      libraryVersion: 1,                // tracks which library update tier they're in
      totalCrafts: 0,                   // # of times player has successfully crafted
      totalCombinations: new Set(),     // all combinations ever tried (success + failure)
    };

    // Player's data inventory
    this.dataInventory = {
      totalData: 0,                     // primary crafting resource
      dataByType: {
        enemySurveillance: 0,           // from defeated enemies
        environmentalScans: 0,          // from environment items
        terminalExtracts: 0,            // from ancient terminals
        minedBitcoin: 0,                // from bitminers (low priority for spell crafting)
      },
      collectedItems: {
        heatSensor: 0,                  // increases thermal data collection
        moistureSensor: 0,              // increases hydration data collection
        irScanner: 0,                   // increases IR data collection
        densityTester: 0,               // increases density data collection
        microscopicSampler: 0,          // increases microscopic data collection
      },
      surveyenceSystemActive: false,    // continuous passive data collection from enemies
    };

    // Element registry (core + esoteric)
    this.elementRegistry = {
      CORE: {
        earth: { tier: 1, dataWeight: 1, color: '#8B7355' },
        fire: { tier: 1, dataWeight: 1, color: '#FF4500' },
        wind: { tier: 1, dataWeight: 1, color: '#87CEEB' },
        water: { tier: 1, dataWeight: 1, color: '#1E90FF' },
        heart: { tier: 1, dataWeight: 1, color: '#FF1493' },
      },
      ESOTERIC: {
        chaos: { tier: 2, dataWeight: 2, color: '#9932CC' },
        entropy: { tier: 2, dataWeight: 2, color: '#2F4F4F' },
        liminality: { tier: 3, dataWeight: 3, color: '#FFFF00' },
        obsession: { tier: 2, dataWeight: 2, color: '#DC143C' },
        limerance: { tier: 2, dataWeight: 2, color: '#FFB6C1' },
        plasma: { tier: 3, dataWeight: 3, color: '#FFAA00' },
        atoms: { tier: 3, dataWeight: 3, color: '#00FF00' },
        philosophersStone: { tier: 4, dataWeight: 5, color: '#FFD700' },
      }
    };

    // Code bits (unlocked via terminals or crafting)
    this.codeBitRegistry = {
      heal: { tier: 1, manaBase: 20, dataRequired: 50 },
      damage: { tier: 1, manaBase: 15, dataRequired: 50 },
      drain: { tier: 2, manaBase: 25, dataRequired: 100 },
      delete: { tier: 2, manaBase: 35, dataRequired: 150 },
      shield: { tier: 1, manaBase: 20, dataRequired: 75 },
      steal: { tier: 3, manaBase: 40, dataRequired: 200 },
      summon: { tier: 3, manaBase: 50, dataRequired: 250 },
      transmute: { tier: 4, manaBase: 60, dataRequired: 300 },
    };

    // Craftable spells (discovered through sandbox + library updates)
    this.knownSpells = new Map();
    this.initializeSpellRegistry();

    this.log('[SpellTinkering] System initialized. Data economy ready.');
  }

  // ========== DATA ECONOMY SYSTEM ==========

  /**
   * Add data from enemy defeat via surveillance systems
   */
  harvestEnemyData(enemy, character) {
    if (!this.dataInventory.surveyenceSystemActive) return 0;

    // Base data from enemy type
    let baseData = enemy.level * 10;
    
    // Multiply by character's surveillance effectiveness
    const surveillanceBonus = (character.equipment?.surveyenceSystem?.efficiency || 1);
    const harvested = Math.floor(baseData * surveillanceBonus);

    this.dataInventory.dataByType.enemySurveillance += harvested;
    this.dataInventory.totalData += harvested;
    
    this.log(`[Data Harvest] +${harvested} data from enemy surveillance`, enemy.name);
    return harvested;
  }

  /**
   * Collect environmental items that boost data farming
   */
  collectEnvironmentItem(itemType) {
    if (!this.dataInventory.collectedItems.hasOwnProperty(itemType)) {
      this.log(`[Collection] Unknown item type: ${itemType}`);
      return;
    }

    this.dataInventory.collectedItems[itemType]++;
    this.log(`[Collection] Found ${itemType} (x${this.dataInventory.collectedItems[itemType]})`);

    // Items passively boost data collection
    this.updateDataCollectionRate();
  }

  /**
   * Activate surveillance system (passive data generation from encounters)
   * Unlocked via ancient terminals
   */
  activateSurveillanceSystem(systemQuality = 'basic') {
    this.dataInventory.surveyenceSystemActive = true;
    this.log('[Surveillance] System online. Passive data collection enabled.');
  }

  /**
   * Calculate effective data collection multiplier based on items + character level
   */
  getDataCollectionMultiplier(character) {
    let multiplier = 1.0;
    
    // Items boost collection
    multiplier += this.dataInventory.collectedItems.heatSensor * 0.05;
    multiplier += this.dataInventory.collectedItems.moistureSensor * 0.05;
    multiplier += this.dataInventory.collectedItems.irScanner * 0.08;
    multiplier += this.dataInventory.collectedItems.densityTester * 0.06;
    multiplier += this.dataInventory.collectedItems.microscopicSampler * 0.10;

    // Character level boosts efficiency
    multiplier += (character.level / 10) * 0.1;

    return multiplier;
  }

  // ========== TECHNONOMICON (QUANTUM GRIMOIRE) ==========

  /**
   * Initialize base spell registry (linear progression path)
   * Can be EXPANDED by library updates and sandbox discovery
   */
  initializeSpellRegistry() {
    // TIER 1: Core element combinations (always available after discovery)
    this.knownSpells.set('fireball', {
      name: 'Fireball',
      tier: 1,
      elements: ['fire'],
      codeBits: ['damage'],
      baseMana: 15,
      dataCost: 100,
      description: 'Basic fire damage. Single target.',
      epicVariant: false,
    });

    this.knownSpells.set('healingLight', {
      name: 'Healing Light',
      tier: 1,
      elements: ['heart'],
      codeBits: ['heal'],
      baseMana: 20,
      dataCost: 75,
      description: 'Restore HP. Single target.',
      epicVariant: false,
    });

    this.knownSpells.set('windStrike', {
      name: 'Wind Strike',
      tier: 1,
      elements: ['wind'],
      codeBits: ['damage'],
      baseMana: 12,
      dataCost: 80,
      description: 'Swift air damage. Quick cast.',
      epicVariant: false,
    });

    this.knownSpells.set('stoneArmor', {
      name: 'Stone Armor',
      tier: 1,
      elements: ['earth'],
      codeBits: ['shield'],
      baseMana: 18,
      dataCost: 90,
      description: 'Defensive earth magic. Absorb damage.',
      epicVariant: false,
    });

    this.knownSpells.set('frostNova', {
      name: 'Frost Nova',
      tier: 1,
      elements: ['water'],
      codeBits: ['damage'],
      baseMana: 16,
      dataCost: 85,
      description: 'Freeze damage. AoE.',
      epicVariant: false,
    });

    // TIER 2: Combinations + Esoteric elements (discovered or library-gated)
    this.knownSpells.set('inferno', {
      name: 'Inferno',
      tier: 2,
      elements: ['fire', 'chaos'],
      codeBits: ['damage'],
      baseMana: 30,
      dataCost: 200,
      description: 'Chaos fire. All enemies burn.',
      epicVariant: false,
      requiresRoll: 'high',
    });

    this.knownSpells.set('liminality', {
      name: 'Liminality',
      tier: 3,
      elements: ['liminality'],
      codeBits: ['steal', 'transmute'],
      baseMana: 50,
      dataCost: 300,
      description: 'EPIC: Reality bending magic. Rare.',
      epicVariant: true,
      requiresRoll: 'god',
    });

    this.knownSpells.set('philosophersTransmute', {
      name: "Philosopher's Transmute",
      tier: 4,
      elements: ['philosophersStone', 'atoms'],
      codeBits: ['transmute', 'delete'],
      baseMana: 75,
      dataCost: 500,
      description: 'EPIC: Transmute matter itself. Supreme roll only.',
      epicVariant: true,
      requiresRoll: 'supreme',
    });
  }

  // ========== LEVEL SCALING SYSTEM ==========

  /**
   * Calculate spell power based on character level + roll quality
   * Higher levels = better spell caps but god rolls still rare
   */
  calculateSpellPower(spell, character, rollQuality) {
    const basePower = spell.baseMana;
    const levelBonus = character.level * 1.5;
    
    let rollMultiplier = 1.0;
    
    switch(rollQuality) {
      case 'critical':
        rollMultiplier = 2.0;           // GOD ROLL - feels MASSIVE
        break;
      case 'high':
        rollMultiplier = 1.5;           // Good roll
        break;
      case 'medium':
        rollMultiplier = 1.0;           // Standard
        break;
      case 'low':
        rollMultiplier = 0.6;           // Failed roll
        break;
    }

    const totalPower = Math.floor((basePower + levelBonus) * rollMultiplier);
    return totalPower;
  }

  /**
   * Calculate spell mana cost based on level + complexity
   */
  calculateManaCost(spell, character) {
    let baseCost = spell.baseMana;
    
    // More esoteric elements = higher cost
    let esotericCount = 0;
    spell.elements.forEach(elem => {
      if (this.elementRegistry.ESOTERIC[elem]) {
        esotericCount++;
      }
    });

    baseCost += esotericCount * 10;

    // More code bits = higher cost
    baseCost += spell.codeBits.length * 5;

    // Character level reduces cost (mastery)
    const levelDiscount = Math.floor(character.level / 5);
    baseCost = Math.max(5, baseCost - levelDiscount);

    return baseCost;
  }

  // ========== SPELL CRAFTING (HYBRID SANDBOX + LINEAR) ==========

  /**
   * Attempt to craft a spell from elements + code bits
   * Returns: { success, spell, rollQuality, dataCost, message }
   */
  attemptCraft(elements, codeBits, character) {
    // Roll for crafting success + quality
    const rollResult = this.dice.rollD20();
    const characterModifier = this.dice.calculateModifier(character, 'spellcraft');
    const adjustedRoll = rollResult + characterModifier;

    let rollQuality = 'low';
    if (adjustedRoll >= 18) rollQuality = 'critical';
    else if (adjustedRoll >= 14) rollQuality = 'high';
    else if (adjustedRoll >= 10) rollQuality = 'medium';

    // Check if this is a known spell (linear path)
    const knownSpell = this.findSpellByComposition(elements, codeBits);

    if (knownSpell && rollQuality !== 'low') {
      // SUCCESS: Crafted a known spell
      const manaCost = this.calculateManaCost(knownSpell, character);
      const dataCost = knownSpell.dataCost;

      if (this.dataInventory.totalData < dataCost) {
        return {
          success: false,
          message: `Insufficient data. Need ${dataCost}, have ${this.dataInventory.totalData}.`,
          rollQuality
        };
      }

      // Deduct data
      this.dataInventory.totalData -= dataCost;
      this.technonomicon.totalCrafts++;
      
      // Record combination (feeds Technonomicon's quantum nature)
      this.recordCombination(elements, codeBits, 'success', knownSpell);

      return {
        success: true,
        spell: knownSpell,
        rollQuality,
        manaCost,
        dataCost,
        power: this.calculateSpellPower(knownSpell, character, rollQuality),
        message: `[${knownSpell.name}] Crafted successfully! ${rollQuality === 'critical' ? 'GOD ROLL!' : ''}`
      };
    }

    // EXPERIMENTAL: Unknown combination (sandbox discovery)
    const experimentalSpell = this.generateExperimentalSpell(elements, codeBits, character, rollQuality);

    if (rollQuality === 'critical') {
      // GOD ROLL: Experimental becomes permanent discovery
      this.technonomicon.discoveredSpells.set(experimentalSpell.name, experimentalSpell);
      
      this.log(`[EPIC DISCOVERY] ${experimentalSpell.name}! Added to Technonomicon.`, experimentalSpell);
      
      return {
        success: true,
        spell: experimentalSpell,
        rollQuality: 'critical',
        isNewDiscovery: true,
        dataCost: experimentalSpell.dataCost,
        message: `[${experimentalSpell.name}] NEW SPELL DISCOVERED! ${experimentalSpell.epicVariant ? '*** EPIC ***' : ''}`
      };
    }

    // Record failed attempt (Technonomicon learns what DOESN'T work too)
    this.recordCombination(elements, codeBits, 'failure', null);

    return {
      success: false,
      rollQuality,
      message: `Spell craft failed. The combination was unstable.`
    };
  }

  /**
   * Find if elements + codeBits match a known spell in linear registry
   */
  findSpellByComposition(elements, codeBits) {
    for (let [name, spell] of this.knownSpells.entries()) {
      const elementMatch = elements.length === spell.elements.length &&
        elements.every(e => spell.elements.includes(e));
      
      const codeBitMatch = codeBits.length === spell.codeBits.length &&
        codeBits.every(c => spell.codeBits.includes(c));

      if (elementMatch && codeBitMatch) {
        return spell;
      }
    }
    return null;
  }

  /**
   * Generate experimental spell from unknown combination
   * Used for sandbox discovery
   */
  generateExperimentalSpell(elements, codeBits, character, rollQuality) {
    const elementNames = elements.join(' + ');
    const codeBitNames = codeBits.join(' + ');
    const spellName = `${elementNames}:${codeBitNames}`;

    // Calculate emergent properties based on element interactions
    let baseMana = 0;
    let baseDamage = 0;
    let isEpic = false;

    elements.forEach(elem => {
      const elemData = this.elementRegistry.CORE[elem] || this.elementRegistry.ESOTERIC[elem];
      if (elemData) {
        baseMana += elemData.tier * 5;
        if (elemData.tier >= 3) isEpic = true;
      }
    });

    codeBits.forEach(bit => {
      const bitData = this.codeBitRegistry[bit];
      if (bitData) {
        baseMana += bitData.manaBase;
        if (bitData.tier >= 3) isEpic = true;
      }
    });

    // God roll makes it EPIC
    if (rollQuality === 'critical') isEpic = true;

    const dataCost = isEpic ? 250 : 150;

    return {
      name: spellName,
      tier: isEpic ? 3 : 2,
      elements,
      codeBits,
      baseMana,
      dataCost,
      description: `Experimental spell: ${elementNames} bound with ${codeBitNames}`,
      epicVariant: isEpic,
      isExperimental: true,
    };
  }

  /**
   * Record all crafting attempts (feeds Technonomicon's quantum nature)
   */
  recordCombination(elements, codeBits, result, spell) {
    const combo = `${elements.sort().join(',')}|${codeBits.sort().join(',')}`;
    this.technonomicon.totalCombinations.add(combo);

    // Trigger library update chance on successful crafts
    if (result === 'success' && this.technonomicon.totalCrafts % 5 === 0) {
      this.checkLibraryUpdate();
    }
  }

  // ========== LIBRARY UPDATES (DATA-GATED + RNG) ==========

  /**
   * Attempt library update (triggered by crafting milestones + data thresholds)
   * Can unlock: new elements, code bits, or AI-inserted bonus spells
   */
  checkLibraryUpdate() {
    // Need data investment to trigger library evolution
    const dataCostThreshold = this.technonomicon.libraryVersion * 500;

    if (this.dataInventory.totalData < dataCostThreshold) {
      return; // Not enough data invested
    }

    // Roll for library update quality
    const updateRoll = this.dice.rollD20();

    if (updateRoll <= 5) {
      // FAILED - no update
      return;
    } else if (updateRoll <= 12) {
      // STANDARD - unlock new element + code bit
      this.unlockRandomElement();
      this.unlockRandomCodeBit();
    } else if (updateRoll <= 18) {
      // GOOD - unlock multiple features
      this.unlockRandomElement();
      this.unlockRandomElement();
      this.unlockRandomCodeBit();
      this.unlockRandomCodeBit();
    } else if (updateRoll === 19) {
      // GOD ROLL - unlock ALL pending features
      this.unlockAllElements();
      this.unlockAllCodeBits();
    } else if (updateRoll === 20) {
      // SUPREME ROLL - library triggers miniboss + AI bonus spell
      this.triggerLibraryMiniboss();
    }

    this.technonomicon.libraryVersion++;
    this.log(`[Library Update] Technonomicon evolved to v${this.technonomicon.libraryVersion}`);
  }

  /**
   * Unlock random esoteric element
   */
  unlockRandomElement() {
    const esotericElements = Object.keys(this.elementRegistry.ESOTERIC);
    const locked = esotericElements.filter(e => !this.technonomicon.discoveredElements.has(e));

    if (locked.length > 0) {
      const chosen = locked[Math.floor(Math.random() * locked.length)];
      this.technonomicon.discoveredElements.add(chosen);
      this.log(`[Element Unlocked] ${chosen}`);
    }
  }

  /**
   * Unlock random code bit
   */
  unlockRandomCodeBit() {
    const codeBits = Object.keys(this.codeBitRegistry);
    const locked = codeBits.filter(b => !this.technonomicon.discoveredCodeBits.has(b));

    if (locked.length > 0) {
      const chosen = locked[Math.floor(Math.random() * locked.length)];
      this.technonomicon.discoveredCodeBits.add(chosen);
      this.log(`[Code Bit Unlocked] ${chosen}`);
    }
  }

  /**
   * Unlock ALL remaining elements + code bits
   */
  unlockAllElements() {
    Object.keys(this.elementRegistry.CORE).forEach(e => this.technonomicon.discoveredElements.add(e));
    Object.keys(this.elementRegistry.ESOTERIC).forEach(e => this.technonomicon.discoveredElements.add(e));
    this.log('[Elements Unlocked] All elements discovered!');
  }

  unlockAllCodeBits() {
    Object.keys(this.codeBitRegistry).forEach(b => this.technonomicon.discoveredCodeBits.add(b));
    this.log('[Code Bits Unlocked] All code bits discovered!');
  }

  /**
   * SUPREME ROLL: Technonomicon manifests a miniboss that when defeated,
   * grants an AI-generated bonus spell with special properties
   */
  triggerLibraryMiniboss() {
    const miniboss = {
      name: 'The Technonomicon Warden',
      level: 25,
      hp: 500,
      description: 'A guardian entity that protects the grimoire\'s deepest secrets.',
      reward: 'AI-Generated Bonus Spell',
    };

    this.log(`[Supreme Roll] ${miniboss.name} appears! Defeat to unlock bonus spell.`, miniboss);

    // This would integrate with GameEngine combat system
    // After defeat, AI generates a unique spell tailored to player's playstyle
    return miniboss;
  }

  /**
   * Generate AI bonus spell (called after defeating Technonomicon Warden)
   */
  generateAIBonusSpell(playerPlaystyle, playerElements) {
    // AI evaluates what player has discovered + crafted
    // Generates a thematic spell that feels like a reward

    const aiContext = {
      playstyle: playerPlaystyle,        // 'aggressive', 'defensive', 'hybrid', 'experimental'
      favoriteElements: playerElements,  // what they craft most
      crafts: this.technonomicon.totalCrafts,
      discoveries: this.technonomicon.discoveredSpells.size,
    };

    // This would call ai-dm-integration.js generateSpellBonus() method
    // For now, return template

    return {
      name: 'Customized Bonus Spell',
      tier: 4,
      elements: playerElements.slice(0, 2),
      codeBits: ['transmute'],
      epicVariant: true,
      custom: true,
      message: 'The Technonomicon weaves your playstyle into a new spell...'
    };
  }

  // ========== UTILITIES ==========

  /**
   * Export Technonomicon state for saves
   */
  exportTechnonomicon() {
    return {
      discoveredSpells: Array.from(this.technonomicon.discoveredSpells),
      discoveredElements: Array.from(this.technonomicon.discoveredElements),
      discoveredCodeBits: Array.from(this.technonomicon.discoveredCodeBits),
      libraryVersion: this.technonomicon.libraryVersion,
      totalCrafts: this.technonomicon.totalCrafts,
      totalCombinations: Array.from(this.technonomicon.totalCombinations),
    };
  }

  /**
   * Export data inventory for saves
   */
  exportDataInventory() {
    return {
      totalData: this.dataInventory.totalData,
      dataByType: { ...this.dataInventory.dataByType },
      collectedItems: { ...this.dataInventory.collectedItems },
      surveyenceSystemActive: this.dataInventory.surveyenceSystemActive,
    };
  }

  /**
   * Get spell registry for UI (what's available to player)
   */
  getAvailableSpells(character) {
    const available = [];

    for (let [name, spell] of this.knownSpells.entries()) {
      const canCraft = this.canCraftSpell(spell, character);
      if (canCraft) {
        available.push({
          ...spell,
          manaCost: this.calculateManaCost(spell, character),
          levelRequired: spell.tier * 5,
        });
      }
    }

    return available;
  }

  /**
   * Check if character can craft a specific spell
   */
  canCraftSpell(spell, character) {
    // Need minimum level
    if (character.level < spell.tier * 5) return false;

    // Need to have discovered elements + code bits
    const hasElements = spell.elements.every(e => 
      this.technonomicon.discoveredElements.has(e) ||
      Object.keys(this.elementRegistry.CORE).includes(e) // core always available
    );

    const hasCodeBits = spell.codeBits.every(b =>
      this.technonomicon.discoveredCodeBits.has(b)
    );

    return hasElements && hasCodeBits;
  }

  log(msg, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
      console.log(`[${timestamp}] ${msg}`, data);
    } else {
      console.log(`[${timestamp}] ${msg}`);
    }
  }
}

// ========== EXPORT ==========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpellTinkeringSystem;
}