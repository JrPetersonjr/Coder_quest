// ============================================================
// DICE.JS
// CASTCONSOLE UNIFIED DICE SYSTEM
//
// PURPOSE:
//   - Provide both JRPG (d6) and DM (dN) dice rolls
//   - Handle stat-based combat calculations (HP, DEF, armor, resistance)
//   - Support narrative dice (3d12, 2d20, etc.)
//   - Track roll history for debugging/narrative
//   - Seed randomness for reproducibility (optional)
//
// USAGE:
//   JRPG: DiceSystem.rollCombat(attacker, defender)
//   DM:   DiceSystem.rollDM("3d12", "escape difficulty")
//   Raw:  DiceSystem.roll(6) or DiceSystem.rollMultiple(3, 12)
//
// ============================================================

window.DiceSystem = {

  // ============================================================
  // [CONFIGURATION] - Dice behavior
  // ============================================================
  config: {
    trackHistory: true,
    maxHistory: 100,
    seed: null, // Set for reproducible rolls
    verbose: false
  },

  history: [],

  // ============================================================
  // [CORE_ROLLS] - Basic dice mechanics
  // ============================================================

  /**
   * Roll a single die (1dN)
   * @param {number} sides - Number of sides (6, 20, 12, etc.)
   * @returns {number} Result (1 to sides inclusive)
   */
  roll(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    
    if (this.config.trackHistory) {
      this.history.push({
        type: "single",
        sides: sides,
        result: result,
        timestamp: Date.now()
      });
      if (this.history.length > this.config.maxHistory) {
        this.history.shift();
      }
    }

    if (this.config.verbose) {
      console.log(`[DICE] d${sides} → ${result}`);
    }

    return result;
  },

  /**
   * Roll multiple dice (XdN)
   * @param {number} count - Number of dice
   * @param {number} sides - Sides per die
   * @returns {object} { total, rolls, average }
   */
  rollMultiple(count, sides) {
    const rolls = [];
    let total = 0;

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    const average = (total / count).toFixed(2);

    const result = {
      total: total,
      rolls: rolls,
      average: parseFloat(average),
      notation: `${count}d${sides}`
    };

    if (this.config.trackHistory) {
      this.history.push({
        type: "multiple",
        notation: `${count}d${sides}`,
        result: result,
        timestamp: Date.now()
      });
      if (this.history.length > this.config.maxHistory) {
        this.history.shift();
      }
    }

    if (this.config.verbose) {
      console.log(`[DICE] ${count}d${sides} → ${rolls.join("+")} = ${total}`);
    }

    return result;
  },

  /**
   * Parse and roll notation like "3d12+5" or "2d20-2"
   * @param {string} notation - Dice notation (e.g., "3d12", "2d6+3")
   * @returns {object} { total, rolls, modifier, result }
   */
  rollNotation(notation) {
    const regex = /^(\d+)d(\d+)([\+\-])?(\d+)?$/i;
    const match = notation.match(regex);

    if (!match) {
      console.error(`[DICE] Invalid notation: ${notation}`);
      return { error: true, msg: "Invalid notation" };
    }

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const operation = match[3] || "";
    const modifier = match[4] ? parseInt(match[4]) : 0;

    const rollResult = this.rollMultiple(count, sides);
    let final = rollResult.total;

    if (operation === "+") {
      final += modifier;
    } else if (operation === "-") {
      final -= modifier;
    }

    const result = {
      ...rollResult,
      modifier: modifier,
      operation: operation,
      final: final,
      notation: notation
    };

    if (this.config.trackHistory) {
      this.history.push({
        type: "notation",
        notation: notation,
        result: result,
        timestamp: Date.now()
      });
    }

    if (this.config.verbose) {
      console.log(`[DICE] ${notation} → ${rollResult.total}${operation}${modifier} = ${final}`);
    }

    return result;
  },

  // ============================================================
  // [JRPG_COMBAT] - d6-based battle rolls
  // ============================================================

  /**
   * Calculate attack roll (attacker vs defender)
   * Attack = Base(d6) + ATK - DEF
   * @param {object} attacker - Player/enemy with stats
   * @param {object} defender - Target with stats
   * @returns {object} { roll, attack, defense, damage, isHit }
   */
  rollCombat(attacker, defender) {
    const atkRoll = this.roll(6);
    const defRoll = this.roll(6);

    const attackTotal = atkRoll + (attacker.attack || 0);
    const defenseTotal = defRoll + (defender.defense || 0);

    const rawDamage = attackTotal - defenseTotal;
    const damage = Math.max(1, rawDamage); // Minimum 1 damage

    const isHit = attackTotal > defenseTotal;

    const result = {
      attackRoll: atkRoll,
      defenseRoll: defRoll,
      attackTotal: attackTotal,
      defenseTotal: defenseTotal,
      rawDamage: rawDamage,
      finalDamage: damage,
      isHit: isHit,
      hitChance: `${((attackTotal / (attackTotal + defenseTotal)) * 100).toFixed(1)}%`
    };

    if (this.config.trackHistory) {
      this.history.push({
        type: "jrpg_combat",
        attacker: attacker.name,
        defender: defender.name,
        result: result,
        timestamp: Date.now()
      });
    }

    if (this.config.verbose) {
      console.log(`[JRPG] ${attacker.name} attacks ${defender.name}: ${atkRoll}+${attacker.attack} vs ${defRoll}+${defender.defense} = ${damage} damage`);
    }

    return result;
  },

  /**
   * Calculate damage with armor/resistance
   * Damage = Base - (Armor * 0.5) - (Resistance * 0.25)
   * @param {number} baseDamage - Raw damage
   * @param {object} target - Defender with armor/resistance
   * @returns {object} { baseDamage, armor, resistance, finalDamage }
   */
  calculateArmorMitigation(baseDamage, target) {
    const armorReduction = (target.armor || 0) * 0.5;
    const resistanceReduction = (target.resistance || 0) * 0.25;
    
    const finalDamage = Math.max(1, baseDamage - armorReduction - resistanceReduction);

    const result = {
      baseDamage: baseDamage,
      armor: target.armor || 0,
      armorReduction: armorReduction,
      resistance: target.resistance || 0,
      resistanceReduction: resistanceReduction,
      totalMitigation: armorReduction + resistanceReduction,
      finalDamage: Math.floor(finalDamage)
    };

    if (this.config.verbose) {
      console.log(`[ARMOR] ${baseDamage} - ${armorReduction} - ${resistanceReduction} = ${result.finalDamage}`);
    }

    return result;
  },

  /**
   * Full combat resolution (attack + armor)
   * @param {object} attacker - Attacker stats
   * @param {object} defender - Defender stats
   * @returns {object} Complete combat result
   */
  resolveCombat(attacker, defender) {
    const combatRoll = this.rollCombat(attacker, defender);
    
    if (!combatRoll.isHit) {
      return {
        ...combatRoll,
        armor: { finalDamage: 0 },
        result: "MISS"
      };
    }

    const armorCalc = this.calculateArmorMitigation(combatRoll.finalDamage, defender);

    return {
      ...combatRoll,
      armor: armorCalc,
      result: "HIT",
      totalDamage: armorCalc.finalDamage
    };
  },

  // ============================================================
  // [DM_ENCOUNTERS] - Narrative dice rolls
  // ============================================================

  /**
   * DM-style roll (narrative context)
   * @param {string} notation - Dice notation (e.g., "3d12")
   * @param {string} purpose - What is being rolled for
   * @returns {object} { notation, purpose, total, interpretation }
   */
  rollDM(notation, purpose) {
    const rollResult = this.rollNotation(notation);

    if (rollResult.error) {
      return rollResult;
    }

    // Interpret the roll narratively
    const percentile = (rollResult.final / (rollResult.notation.split("d")[0] * parseInt(rollResult.notation.split("d")[1]))) * 100;
    
    let interpretation = "NEUTRAL";
    if (percentile >= 80) interpretation = "CRITICAL SUCCESS";
    else if (percentile >= 60) interpretation = "SUCCESS";
    else if (percentile >= 40) interpretation = "PARTIAL SUCCESS";
    else if (percentile >= 20) interpretation = "FAILURE";
    else interpretation = "CRITICAL FAILURE";

    const result = {
      notation: notation,
      purpose: purpose,
      total: rollResult.final,
      percentile: percentile.toFixed(1),
      interpretation: interpretation,
      narrative: this.generateNarrative(interpretation, purpose)
    };

    if (this.config.trackHistory) {
      this.history.push({
        type: "dm_roll",
        notation: notation,
        purpose: purpose,
        result: result,
        timestamp: Date.now()
      });
    }

    if (this.config.verbose) {
      console.log(`[DM] ${notation} for ${purpose}: ${result.total} (${interpretation})`);
    }

    return result;
  },

  /**
   * Generate narrative flavor for roll result
   * @param {string} interpretation - Roll outcome
   * @param {string} purpose - Context
   * @returns {string} Narrative text
   */
  generateNarrative(interpretation, purpose) {
    const narratives = {
      "CRITICAL SUCCESS": [
        "Everything aligns perfectly in your favor.",
        "Fortune smiles upon you.",
        "An unlikely breakthrough occurs."
      ],
      "SUCCESS": [
        "Your action succeeds as intended.",
        "Things go according to plan.",
        "You overcome the challenge."
      ],
      "PARTIAL SUCCESS": [
        "You succeed, but at a cost.",
        "Progress is made, but complications arise.",
        "Success comes with unforeseen consequences."
      ],
      "FAILURE": [
        "Your attempt falls short.",
        "Something goes wrong.",
        "The challenge proves greater than expected."
      ],
      "CRITICAL FAILURE": [
        "Everything goes wrong in spectacular fashion.",
        "Reality itself seems to conspire against you.",
        "The worst possible outcome occurs."
      ]
    };

    const options = narratives[interpretation] || ["Something happens."];
    return options[Math.floor(Math.random() * options.length)];
  },

  /**
   * Roll for encounter composition (3d12 → monster count/difficulty)
   * @returns {object} { roll, encounterSize, difficulty }
   */
  rollEncounter() {
    const roll = this.rollMultiple(3, 12).total; // 3d12

    let encounterSize = "SOLO";
    let difficulty = "EASY";

    if (roll <= 10) {
      encounterSize = "SOLO";
      difficulty = "EASY";
    } else if (roll <= 18) {
      encounterSize = "PAIR";
      difficulty = "NORMAL";
    } else if (roll <= 25) {
      encounterSize = "GROUP (3-4)";
      difficulty = "HARD";
    } else if (roll <= 32) {
      encounterSize = "PACK (5-6)";
      difficulty = "VERY HARD";
    } else {
      encounterSize = "HORDE (7+)";
      difficulty = "DEADLY";
    }

    const result = {
      roll: roll,
      encounterSize: encounterSize,
      difficulty: difficulty,
      narrative: `A ${encounterSize.toLowerCase()} enemy encounter (${difficulty})`
    };

    if (this.config.verbose) {
      console.log(`[ENCOUNTER] 3d12 → ${roll}: ${encounterSize} (${difficulty})`);
    }

    return result;
  },

  // ============================================================
  // [MODIFIER_SYSTEM] - Character stat calculations
  // ============================================================

  /**
   * Calculate total modifier for a character's action
   * Modifier = (level/2) + classBonus + equipment + buffs - debuffs
   * @param {object} character - Character with modifiers
   * @param {string} type - "attack", "defense", "spell", etc
   * @returns {number} Total modifier
   */
  calculateModifier(character, type = "attack") {
    let modifier = 0;

    // Base modifiers
    if (character.level) {
      modifier += Math.floor(character.level / 2);
    }

    // Class-based bonus
    if (character.classBonus && character.classBonus[type]) {
      modifier += character.classBonus[type];
    }

    // Equipment
    if (character.equipment && character.equipment[type]) {
      modifier += character.equipment[type];
    }

    // Active buffs
    if (character.activeBuffs && Array.isArray(character.activeBuffs)) {
      character.activeBuffs.forEach(buff => {
        if (buff.type === type || buff.type === "all") {
          modifier += buff.value || 0;
        }
      });
    }

    // Active debuffs
    if (character.activeDebuffs && Array.isArray(character.activeDebuffs)) {
      character.activeDebuffs.forEach(debuff => {
        if (debuff.type === type || debuff.type === "all") {
          modifier -= debuff.value || 0;
        }
      });
    }

    return modifier;
  },

  /**
   * Apply percentage-based effect (HP restore, damage as % of target HP, etc)
   * @param {number} percentage - Amount to apply (0-100 or higher)
   * @param {number} baseValue - Target stat (maxHP, maxMP, target HP, etc)
   * @param {string} operation - "restore", "damage", "drain"
   * @returns {object} { percentage, baseValue, amount, result }
   */
  calculatePercentage(percentage, baseValue, operation = "damage") {
    const amount = Math.floor((percentage / 100) * baseValue);

    let result = baseValue;
    if (operation === "damage" || operation === "drain") {
      result = Math.max(0, baseValue - amount);
    } else if (operation === "restore") {
      result = Math.min(baseValue * 2, baseValue + amount); // Cap at 2x
    }

    return {
      percentage: percentage,
      baseValue: baseValue,
      amount: amount,
      operation: operation,
      result: result
    };
  },

  // ============================================================
  // [AI_DM_DECISION_SYSTEM] - AI makes decisions, player rolls
  // ============================================================

  /**
   * AI silently calculates what should happen, determines roll type
   * @param {object} context - { player, target, action, difficulty }
   * @returns {object} { rollType, rollDice, difficulty, silentDecision }
   */
  aiCalculateOutcome(context) {
    const { player, target, action, difficulty = 12 } = context;

    // Calculate success modifier based on player stats
    const modifier = this.calculateModifier(player, action) || 0;
    const successChance = Math.min(95, Math.max(5, 50 + modifier * 5));

    // Determine what roll type AI wants
    let rollType, rollDice;

    switch (action) {
      case "negotiate":
      case "persuade":
      case "deceive":
        rollType = "social";
        rollDice = "3d12";
        break;
      case "attack":
      case "combat":
        rollType = "combat";
        rollDice = "2d6+level";
        break;
      case "dodge":
      case "escape":
        rollType = "dexterity";
        rollDice = "2d20";
        break;
      case "magic":
      case "spell":
        rollType = "spellcheck";
        rollDice = "1d20+level";
        break;
      default:
        rollType = "general";
        rollDice = "2d12";
    }

    // AI's silent decision about outcome
    const silentDecision = {
      wouldSucceed: Math.random() * 100 < successChance,
      criticalChance: successChance > 75 ? 0.2 : successChance > 50 ? 0.1 : 0,
      failureChance: 100 - successChance,
      targetDifficulty: difficulty,
      modifiedDifficulty: Math.max(1, difficulty - modifier)
    };

    return {
      rollType: rollType,
      rollDice: rollDice,
      difficulty: difficulty,
      modifier: modifier,
      silentDecision: silentDecision,
      prompt: `Roll ${rollDice} (DC ${Math.max(1, difficulty - modifier)})`
    };
  },

  /**
   * Process player's roll against AI's silent decision
   * @param {number} playerRoll - Result of player's dice roll
   * @param {object} aiDecision - From aiCalculateOutcome()
   * @param {object} outcomes - { highRoll, midRoll, lowRoll }
   * @returns {object} { success, outcome, narrative, roll, difficulty }
   */
  resolveRoll(playerRoll, aiDecision, outcomes = {}) {
    const { difficulty, modifier, silentDecision } = aiDecision;
    const effectiveDC = difficulty - modifier;

    // Determine success level
    let success = false;
    let outcome = "failure";

    if (playerRoll >= effectiveDC + 10) {
      outcome = "critical_success";
      success = true;
    } else if (playerRoll >= effectiveDC + 5) {
      outcome = "success";
      success = true;
    } else if (playerRoll >= effectiveDC) {
      outcome = "success";
      success = true;
    } else if (playerRoll >= effectiveDC - 5) {
      outcome = "partial_success";
      success = false;
    } else {
      outcome = "failure";
      success = false;
    }

    // Get outcome narrative
    const outcomeData = outcomes[outcome] || {
      narrative: "Something happens.",
      rewards: [],
      consequences: []
    };

    return {
      playerRoll: playerRoll,
      difficulty: difficulty,
      effectiveDC: effectiveDC,
      success: success,
      outcome: outcome,
      narrative: outcomeData.narrative || "",
      rewards: outcomeData.rewards || [],
      consequences: outcomeData.consequences || [],
      margin: playerRoll - effectiveDC
    };
  },

  // ============================================================
  // [TEMPLATE_SAVE_SYSTEM] - For procedural expansion
  // ============================================================

  /**
   * Save encounter/quest/battle as template for offline expansion
   * @param {object} data - { type, rolls, outcomes, scaling, context }
   * @returns {object} Templated data for expansion cards
   */
  createExpansionTemplate(data) {
    const { type, rolls, outcomes, scaling, context, aiNarrative } = data;

    return {
      // Metadata
      templateType: type, // "encounter", "quest", "battle", "negotiation"
      created: new Date().toISOString(),
      id: `${type}_${Date.now()}`,

      // Roll information (for reference)
      rolls: {
        initial: rolls?.initial || null,
        playerRoll: rolls?.playerRoll || null,
        aiRolls: rolls?.aiRolls || []
      },

      // Outcome branches (for scaling)
      outcomes: {
        highRoll: outcomes?.highRoll || { narrative: "", rewards: [] },
        midRoll: outcomes?.midRoll || { narrative: "", rewards: [] },
        lowRoll: outcomes?.lowRoll || { narrative: "", rewards: [] }
      },

      // Scaling parameters
      scaling: {
        difficulty: scaling?.difficulty || 12,
        rewardScaling: scaling?.rewardScaling || 1.0,
        enemyLevelScale: scaling?.enemyLevelScale || 0,
        lootMultiplier: scaling?.lootMultiplier || 1.0
      },

      // Context (for AI to understand)
      context: {
        location: context?.location || "unknown",
        npcNames: context?.npcNames || [],
        theme: context?.theme || "generic",
        difficulty: context?.difficulty || "medium"
      },

      // AI's narration (for human review)
      aiNarrative: aiNarrative || "",

      // Status
      validated: false,
      notes: ""
    };
  },

  /**
   * Store template for later conversion to expansion card
   * @param {object} template - From createExpansionTemplate()
   * @param {string} label - Human-readable name
   */
  saveTemplate(template, label = "") {
    if (!window.offlineTemplates) {
      window.offlineTemplates = [];
    }

    const saved = {
      ...template,
      label: label,
      savedAt: new Date().toISOString()
    };

    window.offlineTemplates.push(saved);

    // Also save to localStorage for persistence
    try {
      const existing = JSON.parse(localStorage.getItem("technomancer_templates") || "[]");
      existing.push(saved);
      localStorage.setItem("technomancer_templates", JSON.stringify(existing));
    } catch (e) {
      console.warn("[DICE] Could not save to localStorage:", e.message);
    }

    if (this.config.verbose) {
      console.log(`[SAVE] Template saved: ${label || template.id}`);
    }

    return saved;
  },

  /**
   * Get all saved templates (for dev to convert to expansion)
   * @returns {array} All templates
   */
  getTemplates() {
    return window.offlineTemplates || [];
  },

  /**
   * Export templates as JSON (for offline processing)
   * @returns {string} JSON stringified templates
   */
  exportTemplates() {
    return JSON.stringify(window.offlineTemplates || [], null, 2);
  },

  // ============================================================
  // [UTILITY] - Helpers and history
  // ============================================================

  /**
   * Get roll history (for debugging/narrative)
   * @param {number} limit - Number of recent rolls
   * @returns {array} Recent rolls
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  },

  /**
   * Clear roll history
   */
  clearHistory() {
    this.history = [];
  },

  /**
   * Get statistics on rolls
   * @returns {object} Roll stats
   */  /**
   * Convenience: Roll a d6 (combat die)
   */
  rollD6() {
    return this.roll(6);
  },

  /**
   * Convenience: Roll a d20 (narrative die)
   */
  rollD20() {
    return this.roll(20);
  },
  getStats() {
    const combatRolls = this.history.filter(h => h.type === "jrpg_combat");
    const dmRolls = this.history.filter(h => h.type === "dm_roll");
    const encounterRolls = this.history.filter(h => h.type === "encounter");

    return {
      totalRolls: this.history.length,
      combatRolls: combatRolls.length,
      dmRolls: dmRolls.length,
      encounterRolls: encounterRolls.length,
      hitRate: combatRolls.filter(r => r.result.isHit).length / (combatRolls.length || 1)
    };
  }
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[dice.js] DiceSystem initialized");
console.log("[dice.js] Combat: roll, rollMultiple, rollNotation, rollCombat, rollDM, rollEncounter");
console.log("[dice.js] Modifiers: calculateModifier, calculatePercentage");
console.log("[dice.js] AI DM: aiCalculateOutcome, resolveRoll");
console.log("[dice.js] Saving: createExpansionTemplate, saveTemplate, getTemplates, exportTemplates");