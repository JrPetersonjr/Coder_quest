/**
 * AI SUMMON RITUAL SYSTEM - ai-summon-ritual.js
 * =============================================
 * Summon ally companions using spells + rituals
 * AI personality generation, persistent memory integration
 * 
 * CORE CONCEPT:
 * - Player combines SUMMON code bit with elements to create ritual spells
 * - AI generates unique companion with personality + memory
 * - Summoned ally fights alongside player, remembers previous summons
 * - Ritual failure = AI generates dramatic NPC instead of ally
 * - Multiple summons create party dynamics with NPC memory system
 */

class AISummonRitualsystem {
  constructor(spellTinkering, aiDMIntegration, diceSystem) {
    this.spellTinkering = spellTinkering;
    this.aiDM = aiDMIntegration;
    this.dice = diceSystem;

    // Player's summoned allies
    this.summonedAllies = [];         // Currently active summons
    this.summonHistory = [];          // All summons ever created
    this.summonCount = 0;             // Total summons performed
    this.failedRituals = [];          // Dramatic NPCs from ritual failures

    // Ritual registry (defined summon spells)
    this.ritualRegistry = new Map();
    this.initializeRitualRegistry();

    this.log("[AI Summon] System initialized. Rituals ready.");
  }

  // ========== RITUAL REGISTRY (DEFINED SUMMONS) ==========

  /**
   * Initialize base ritual spells (linear progression)
   */
  initializeRitualRegistry() {
    // TIER 1: Basic summons (single element + summon)
    this.ritualRegistry.set('lesser_flame_ally', {
      name: 'Lesser Flame Ally',
      tier: 1,
      elements: ['fire'],
      codeBits: ['summon'],
      baseMana: 50,
      dataCost: 250,
      description: 'Summon a small fire spirit to aid you.',
      personality: {
        archetype: 'fire_spirit',
        temperament: 'eager',
        combatStyle: 'aggressive',
      }
    });

    this.ritualRegistry.set('stone_sentinel', {
      name: 'Stone Sentinel',
      tier: 1,
      elements: ['earth'],
      codeBits: ['summon'],
      baseMana: 50,
      dataCost: 250,
      description: 'Summon an earthen guardian.',
      personality: {
        archetype: 'earth_guardian',
        temperament: 'calm',
        combatStyle: 'defensive',
      }
    });

    this.ritualRegistry.set('wind_courier', {
      name: 'Wind Courier',
      tier: 1,
      elements: ['wind'],
      codeBits: ['summon'],
      baseMana: 50,
      dataCost: 250,
      description: 'Summon a swift air elemental.',
      personality: {
        archetype: 'wind_elemental',
        temperament: 'playful',
        combatStyle: 'evasive',
      }
    });

    this.ritualRegistry.set('water_healer', {
      name: 'Water Healer',
      tier: 1,
      elements: ['water'],
      codeBits: ['summon'],
      baseMana: 50,
      dataCost: 250,
      description: 'Summon a restorative water spirit.',
      personality: {
        archetype: 'water_spirit',
        temperament: 'nurturing',
        combatStyle: 'supportive',
      }
    });

    // TIER 2: Advanced summons (combo elements + summon)
    this.ritualRegistry.set('inferno_wyrm', {
      name: 'Inferno Wyrm',
      tier: 2,
      elements: ['fire', 'chaos'],
      codeBits: ['summon', 'damage'],
      baseMana: 75,
      dataCost: 400,
      description: 'Summon a chaotic fire wyrm for devastation.',
      personality: {
        archetype: 'fire_wyrm',
        temperament: 'wild',
        combatStyle: 'destructive',
      }
    });

    this.ritualRegistry.set('entropy_weaver', {
      name: 'Entropy Weaver',
      tier: 2,
      elements: ['entropy', 'chaos'],
      codeBits: ['summon', 'drain'],
      baseMana: 75,
      dataCost: 400,
      description: 'Summon a creature of decay and hunger.',
      personality: {
        archetype: 'entropy_being',
        temperament: 'voracious',
        combatStyle: 'draining',
      }
    });

    // TIER 3: EPIC summons (esoteric + summon, requires god roll)
    this.ritualRegistry.set('limerance_dancer', {
      name: 'Limerance Dancer',
      tier: 3,
      elements: ['limerance', 'heart'],
      codeBits: ['summon', 'steal'],
      baseMana: 100,
      dataCost: 500,
      epicVariant: true,
      requiresRoll: 'high',
      description: 'EPIC: Summon a being of attraction and desire.',
      personality: {
        archetype: 'limerance_being',
        temperament: 'seductive',
        combatStyle: 'charismatic',
      }
    });

    this.ritualRegistry.set('liminality_gate', {
      name: 'Liminality Gate',
      tier: 3,
      elements: ['liminality'],
      codeBits: ['summon', 'transmute'],
      baseMana: 125,
      dataCost: 600,
      epicVariant: true,
      requiresRoll: 'god',
      description: 'EPIC: Summon a guardian of boundaries.',
      personality: {
        archetype: 'liminality_guardian',
        temperament: 'enigmatic',
        combatStyle: 'reality_bending',
      }
    });
  }

  // ========== RITUAL CASTING ==========

  /**
   * Attempt to cast a summon ritual
   * Returns: { success, ally, ritualQuality, message }
   */
  attemptSummon(elements, codeBits, character) {
    // Check if this includes 'summon' code bit
    if (!codeBits.includes('summon')) {
      return {
        success: false,
        message: 'Ritual must include SUMMON code bit.'
      };
    }

    // Roll for ritual quality
    const rollResult = this.dice.rollD20();
    const characterModifier = this.dice.calculateModifier(character, 'ritual');
    const adjustedRoll = rollResult + characterModifier;

    let rollQuality = 'low';
    if (adjustedRoll >= 18) rollQuality = 'critical';
    else if (adjustedRoll >= 14) rollQuality = 'high';
    else if (adjustedRoll >= 10) rollQuality = 'medium';

    // Check if known ritual (linear path)
    const knownRitual = this.findRitualByComposition(elements, codeBits);

    if (knownRitual && rollQuality !== 'low') {
      // SUCCESS: Summoned known ally
      const dataCost = knownRitual.dataCost;

      if (this.spellTinkering.dataInventory.totalData < dataCost) {
        return {
          success: false,
          message: `Insufficient data. Need ${dataCost}, have ${this.spellTinkering.dataInventory.totalData}.`,
          rollQuality
        };
      }

      // Deduct data
      this.spellTinkering.dataInventory.totalData -= dataCost;

      // Generate ally personality
      const ally = this.generateAlly(knownRitual, character, rollQuality);

      // Add to summoned allies
      this.summonedAllies.push(ally);
      this.summonHistory.push(ally);
      this.summonCount++;

      // Record in NPC memory system
      if (this.aiDM) {
        this.aiDM.recordEvent(ally.id, 'summoned', {
          summoner: character.name,
          elements: elements,
          ritual: knownRitual.name,
          quality: rollQuality,
        });
      }

      return {
        success: true,
        ally: ally,
        rollQuality,
        dataCost,
        message: `✨ ${ally.name} has answered your call!`
      };
    }

    // EXPERIMENTAL: Unknown ritual (sandbox)
    if (rollQuality === 'critical') {
      // GOD ROLL: Experimental becomes permanent ally
      const experimentalAlly = this.generateExperimentalAlly(
        elements, codeBits, character, rollQuality
      );

      this.ritualRegistry.set(
        experimentalAlly.name.toLowerCase().replace(/\s+/g, '_'),
        {
          name: experimentalAlly.name,
          tier: experimentalAlly.tier,
          elements: elements,
          codeBits: codeBits,
          baseMana: experimentalAlly.manaRequired,
          dataCost: experimentalAlly.dataCost,
          description: `Custom ritual discovered.`,
          personality: experimentalAlly.personality,
          isCustom: true,
        }
      );

      this.summonedAllies.push(experimentalAlly);
      this.summonHistory.push(experimentalAlly);
      this.summonCount++;

      return {
        success: true,
        ally: experimentalAlly,
        rollQuality: 'critical',
        isNewDiscovery: true,
        message: `🌟 NEW RITUAL DISCOVERED: ${experimentalAlly.name}!`
      };
    } else if (rollQuality === 'medium' || rollQuality === 'high') {
      // PARTIAL SUCCESS: Create ephemeral ally
      const ephemeralAlly = this.generateExperimentalAlly(
        elements, codeBits, character, rollQuality, true
      );

      this.summonedAllies.push(ephemeralAlly);

      return {
        success: true,
        ally: ephemeralAlly,
        rollQuality,
        isEphemeral: true,
        message: `${ephemeralAlly.name} manifests briefly to aid you...`
      };
    } else {
      // CRITICAL FAILURE: Create dramatic enemy instead
      const dramaticNPC = this.generateFailedRitual(elements, codeBits, character);

      this.failedRituals.push(dramaticNPC);

      return {
        success: false,
        failedAlly: dramaticNPC,
        rollQuality: 'critical_failure',
        message: `⚠️ The ritual spiraled! ${dramaticNPC.name} emerges instead...`
      };
    }
  }

  /**
   * Find if elements + codeBits match a known ritual
   */
  findRitualByComposition(elements, codeBits) {
    for (let [name, ritual] of this.ritualRegistry.entries()) {
      const elementMatch = elements.length === ritual.elements.length &&
        elements.every(e => ritual.elements.includes(e));
      
      const codeBitMatch = codeBits.length === ritual.codeBits.length &&
        codeBits.every(c => ritual.codeBits.includes(c));

      if (elementMatch && codeBitMatch) {
        return ritual;
      }
    }
    return null;
  }

  // ========== ALLY GENERATION ==========

  /**
   * Generate a summoned ally with personality + stats
   */
  generateAlly(ritual, character, rollQuality) {
    const allyTier = Math.floor(character.level / 5) + ritual.tier;

    // Generate unique name
    const allyName = this.generateAllyName(ritual.personality.archetype);

    // Generate combat stats
    const baseStat = character.level * 2 + ritual.tier * 5;
    const statBonus = rollQuality === 'critical' ? 1.5 : (rollQuality === 'high' ? 1.2 : 1.0);

    return {
      id: `ally_${this.summonCount}_${Date.now()}`,
      name: allyName,
      ritual: ritual.name,
      tier: allyTier,
      level: character.level,
      
      // Combat stats
      hp: Math.floor(baseStat * statBonus),
      maxHp: Math.floor(baseStat * statBonus),
      attack: Math.floor(baseStat * 0.8 * statBonus),
      defense: Math.floor(baseStat * 0.6 * statBonus),
      
      // Personality profile (for AI DM memory)
      personality: ritual.personality,
      temperament: ritual.personality.temperament,
      combatStyle: ritual.personality.combatStyle,
      
      // Relationship data (for NPC memory system)
      relationship: {
        loyalty: rollQuality === 'critical' ? 100 : 75,
        compatibility: Math.random() * 30 + 70,  // 70-100
        memories: [],
      },
      
      // Ritual info
      summonedAt: new Date().toLocaleString(),
      summoner: character.name,
      rollQuality: rollQuality,
    };
  }

  /**
   * Generate experimental ally (sandbox discovery)
   */
  generateExperimentalAlly(elements, codeBits, character, rollQuality, isEphemeral = false) {
    const elementNames = elements.join(' + ');
    const codeBitNames = codeBits.filter(c => c !== 'summon').join(' + ') || 'summon';
    const allyName = `${elementNames} ${codeBitNames}`.trim();

    // Generate emergent personality from elements
    const personality = this.generatePersonalityFromElements(elements, codeBits);

    return {
      id: `experimental_${this.summonCount}_${Date.now()}`,
      name: allyName,
      tier: elements.length + codeBits.length,
      level: character.level,
      
      // Combat stats
      hp: Math.floor(character.level * (elements.length + 2)),
      maxHp: Math.floor(character.level * (elements.length + 2)),
      attack: Math.floor(character.level * 1.5),
      defense: Math.floor(character.level * 1.2),
      
      // Personality
      personality: personality,
      
      // Mark as experimental
      isExperimental: true,
      isEphemeral: isEphemeral,
      dataCost: elements.length * 150 + codeBits.length * 100,
      manaRequired: elements.length * 30 + codeBits.length * 20,
    };
  }

  /**
   * Generate dramatic NPC from failed ritual
   */
  generateFailedRitual(elements, codeBits, character) {
    const conflictName = `Ritual Aberration [${elements[0].toUpperCase()}]`;
    
    return {
      id: `aberration_${Date.now()}`,
      name: conflictName,
      type: 'aberration',
      level: character.level + 2,
      
      // Combat stats (stronger than normal enemies)
      hp: Math.floor(character.level * 4),
      attack: Math.floor(character.level * 2),
      defense: Math.floor(character.level * 0.8),
      
      // Story info
      description: 'A warped creature born from ritual failure.',
      elements: elements,
      hostility: 'immediate',
      
      // Memory hook
      memory: `Accidentally summoned by ${character.name}`,
    };
  }

  /**
   * Generate unique ally names based on archetype
   */
  generateAllyName(archetype) {
    const names = {
      fire_spirit: ['Embercall', 'Flamebringer', 'Scorch', 'Ignara', 'Pyrix'],
      earth_guardian: ['Stoneheart', 'Bedrock', 'Terramax', 'Granite', 'Earthward'],
      wind_elemental: ['Zephyr', 'Windwhisper', 'Driftwind', 'Stormkin', 'Breeza'],
      water_spirit: ['Tidecaller', 'Aquamarine', 'Streamflow', 'Wavenyx', 'Thalassa'],
      fire_wyrm: ['Infernathor', 'Drakonfire', 'Blazescale', 'Ignox', 'Pyrrhon'],
      entropy_being: ['Voidmaw', 'Decayspawn', 'Entropia', 'Duskmaw', 'Consumption'],
      limerance_being: ['Lovecall', 'Desirewhisper', 'Attraction', 'Seraphine', 'Heartsbane'],
      liminality_guardian: ['Threshold', 'Boundarykeeper', 'Liminal', 'Gateward', 'Between'],
    };

    const nameList = names[archetype] || ['Spirit', 'Entity', 'Manifestation'];
    return nameList[Math.floor(Math.random() * nameList.length)];
  }

  /**
   * Generate personality traits from element combination
   */
  generatePersonalityFromElements(elements, codeBits) {
    const elementTraits = {
      fire: { temperament: 'aggressive', trait: 'passionate' },
      earth: { temperament: 'steadfast', trait: 'reliable' },
      wind: { temperament: 'playful', trait: 'unpredictable' },
      water: { temperament: 'calm', trait: 'adaptive' },
      heart: { temperament: 'compassionate', trait: 'empathetic' },
      chaos: { temperament: 'wild', trait: 'chaotic' },
      entropy: { temperament: 'hungry', trait: 'consuming' },
      liminality: { temperament: 'enigmatic', trait: 'boundary-bound' },
      obsession: { temperament: 'focused', trait: 'singular' },
      limerance: { temperament: 'attractive', trait: 'magnetic' },
    };

    // Average traits from all elements
    let avgTemperament = 'neutral';
    let traits = [];

    elements.forEach(elem => {
      if (elementTraits[elem]) {
        traits.push(elementTraits[elem].trait);
      }
    });

    const codeBitStyle = codeBits.includes('damage') ? 'aggressive' : 
                         codeBits.includes('heal') ? 'supportive' : 'balanced';

    return {
      archetype: elements.join('_'),
      temperament: avgTemperament,
      traits: traits,
      combatStyle: codeBitStyle,
    };
  }

  // ========== ALLY MANAGEMENT ==========

  /**
   * Get active allies in battle
   */
  getActiveAllies() {
    return this.summonedAllies.filter(a => !a.isEphemeral);
  }

  /**
   * Dismiss an ally (returns it to spectral form)
   */
  dismissAlly(allyId) {
    const index = this.summonedAllies.findIndex(a => a.id === allyId);
    if (index > -1) {
      this.summonedAllies.splice(index, 1);
      this.log(`[Summon] ${this.summonedAllies[index].name} dismissed.`);
    }
  }

  /**
   * Update ally stats after combat
   */
  updateAllyStats(allyId, damageDealt, damageReceived, victory) {
    const ally = this.summonedAllies.find(a => a.id === allyId);
    if (!ally) return;

    ally.hp -= damageReceived;

    // Update relationship/loyalty based on combat
    if (victory) {
      ally.relationship.loyalty += 5;
      ally.relationship.memories.push(`Fought alongside you in victory.`);
    } else {
      ally.relationship.memories.push(`Fought alongside you in defeat.`);
    }
  }

  /**
   * Get ally statistics for display
   */
  getAllyStats(allyId) {
    const ally = this.summonedAllies.find(a => a.id === allyId);
    if (!ally) return null;

    return {
      name: ally.name,
      level: ally.level,
      hp: `${ally.hp}/${ally.maxHp}`,
      attack: ally.attack,
      defense: ally.defense,
      loyalty: ally.relationship.loyalty,
      compatibility: Math.floor(ally.relationship.compatibility),
    };
  }

  /**
   * List all summoned allies
   */
  listAllies() {
    return this.summonedAllies.map(a => ({
      name: a.name,
      ritual: a.ritual,
      level: a.level,
      hp: `${a.hp}/${a.maxHp}`,
      temperament: a.temperament,
      loyalty: a.relationship.loyalty,
    }));
  }

  // ========== UTILITIES ==========

  /**
   * Export summoned allies for saves
   */
  exportAllies() {
    return {
      summonedAllies: this.summonedAllies,
      summonHistory: this.summonHistory,
      summonCount: this.summonCount,
      failedRituals: this.failedRituals,
    };
  }

  /**
   * Import summoned allies from saves
   */
  importAllies(data) {
    this.summonedAllies = data.summonedAllies || [];
    this.summonHistory = data.summonHistory || [];
    this.summonCount = data.summonCount || 0;
    this.failedRituals = data.failedRituals || [];
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
  module.exports = AISummonRitualsystem;
}