// ============================================================
// ENCOUNTERS.JS
// CASTCONSOLE DYNAMIC ENCOUNTER SYSTEM
//
// PURPOSE:
//   - DM-narrated encounters (not just "enemy appears")
//   - Dice-rolled enemy composition
//   - Player narrative choices (fight, flee, recruit, negotiate)
//   - Dynamic NPC reactions based on player choices
//   - Consequences ripple through game state
//   - Integration with DM AI for flavor narration
//
// FLOW:
//   1. Player enters zone/subzone
//   2. Check encounter chance → DM rolls (3d12 → size/difficulty)
//   3. DM narrates encounter scenario
//   4. Player presented with choices (fight, negotiate, recruit, flee)
//   5. Player choice → DM responds dynamically
//   6. Battle OR consequence added to game state
//
// ============================================================

window.EncounterSystem = {

  // ============================================================
  // [ENCOUNTER_TABLES] - NPC descriptions & behaviors
  // ============================================================
  npcPersonalities: {
    "cowardly": {
      id: "cowardly",
      name: "Cowardly",
      fleeChance: 0.8,
      recruitChance: 0.6,
      negotiateChance: 0.9,
      aggressionLevel: 1,
      description: "Easily frightened, prefers escape to combat."
    },
    "neutral": {
      id: "neutral",
      name: "Neutral",
      fleeChance: 0.4,
      recruitChance: 0.3,
      negotiateChance: 0.5,
      aggressionLevel: 2,
      description: "Neither aggressive nor peaceful. Pragmatic."
    },
    "aggressive": {
      id: "aggressive",
      name: "Aggressive",
      fleeChance: 0.2,
      recruitChance: 0.1,
      negotiateChance: 0.3,
      aggressionLevel: 4,
      description: "Wants to fight. Enjoys combat."
    },
    "curious": {
      id: "curious",
      name: "Curious",
      fleeChance: 0.1,
      recruitChance: 0.7,
      negotiateChance: 0.8,
      aggressionLevel: 2,
      description: "Interested in you. Wants to learn more."
    },
    "malevolent": {
      id: "malevolent",
      name: "Malevolent",
      fleeChance: 0.05,
      recruitChance: 0.0,
      negotiateChance: 0.1,
      aggressionLevel: 5,
      description: "Pure evil. Seeks to destroy."
    }
  },

  // ============================================================
  // [ENCOUNTER_SCENARIOS] - Pre-written + AI-generated
  // ============================================================
  scenarios: {
    "pack_scattered": {
      id: "pack_scattered",
      title: "Pack Scattered",
      template: "A pack of {enemyType} blocks your path. [{roll} rolled] Only {actualCount} stand their ground. The rest scatter.",
      choices: ["fight_all", "fight_one", "negotiate", "recruit", "flee"],
      difficulty: "normal"
    },

    "ambush": {
      id: "ambush",
      title: "Ambush!",
      template: "{enemyType} leap from the shadows! [{roll} rolled] {actualCount} enemies surround you.",
      choices: ["fight", "negotiate", "flee", "distract"],
      difficulty: "hard"
    },

    "lone_guardian": {
      id: "lone_guardian",
      title: "Lone Guardian",
      template: "A solitary {enemyType} bars your way. [{roll} rolled] It looks determined but outnumbered by your presence.",
      choices: ["fight", "negotiate", "recruit", "bypass"],
      difficulty: "easy"
    },

    "desperate_refugees": {
      id: "desperate_refugees",
      title: "Desperate Refugees",
      template: "{enemyType} flee in panic. [{roll} rolled] {actualCount} are too frightened to move. They're trapped.",
      choices: ["help", "ignore", "exploit", "shelter"],
      difficulty: "special"
    },

    "territorial_claim": {
      id: "territorial_claim",
      title: "Territorial Claim",
      template: "A {enemyType} claims this zone as theirs. [{roll} rolled] {actualCount} allies stand with them. This is their home.",
      choices: ["fight", "negotiate", "respect_territory", "challenge_leader"],
      difficulty: "normal"
    },

    "mysterious_gathering": {
      id: "mysterious_gathering",
      title: "Mysterious Gathering",
      template: "{enemyType} gather in strange formation. [{roll} rolled] {actualCount} are present. Something ancient stirs in them.",
      choices: ["investigate", "fight", "flee", "communicate"],
      difficulty: "hard"
    }
  },

  // ============================================================
  // [CONSEQUENCE_SYSTEM] - Actions have lasting effects
  // ============================================================
  consequences: {
    "defeated_enemy": {
      id: "defeated_enemy",
      type: "positive",
      effect: (gameState, enemy) => {
        gameState.exp += enemy.exp;
        gameState.data += enemy.data || 5;
        if (enemy.loot) {
          enemy.loot.forEach(item => gameState.inventory.push(item));
        }
      },
      narrative: "Victory. One less threat in the world."
    },

    "enemy_fled": {
      id: "enemy_fled",
      type: "neutral",
      effect: (gameState, enemy) => {
        if (!gameState.fleeing_enemies) gameState.fleeing_enemies = [];
        gameState.fleeing_enemies.push(enemy.id);
      },
      narrative: "They escaped. You may face them again."
    },

    "enemy_recruited": {
      id: "enemy_recruited",
      type: "positive",
      effect: (gameState, enemy) => {
        if (!gameState.allies) gameState.allies = [];
        gameState.allies.push({
          id: enemy.id,
          name: enemy.name,
          hp: enemy.hp,
          status: "loyal"
        });
      },
      narrative: "A new companion joins your cause."
    },

    "negotiation_failed": {
      id: "negotiation_failed",
      type: "negative",
      effect: (gameState, enemy) => {
        if (!gameState.hostile_npcs) gameState.hostile_npcs = [];
        gameState.hostile_npcs.push(enemy.id);
        enemy.aggressionLevel += 2;
      },
      narrative: "They're insulted by your attempt. Now they're angry."
    },

    "player_injured": {
      id: "player_injured",
      type: "negative",
      effect: (gameState) => {
        gameState.hp = Math.max(1, gameState.hp - 15);
      },
      narrative: "You're wounded but alive."
    },

    "territory_claimed": {
      id: "territory_claimed",
      type: "positive",
      effect: (gameState, zone) => {
        if (!gameState.claimed_zones) gameState.claimed_zones = [];
        gameState.claimed_zones.push(zone);
      },
      narrative: "This zone now feels familiar. You're welcome here."
    },

    "hunted": {
      id: "hunted",
      type: "negative",
      effect: (gameState, enemy) => {
        if (!gameState.hunted_by) gameState.hunted_by = [];
        gameState.hunted_by.push({
          id: enemy.id,
          name: enemy.name,
          vendetta: true
        });
      },
      narrative: "They remember you. They will seek revenge."
    }
  },

  // ============================================================
  // [TRIGGER_ENCOUNTER] - Main entry point
  // ============================================================

  /**
   * Check and trigger encounter when player moves zones
   * @param {object} gameState - Player state
   * @param {string} zoneId - Current zone
   * @param {object} appendLine - UI output function
   * @returns {boolean} Encounter triggered
   */
  checkEncounter(gameState, zoneId, appendLine) {
    // Determine encounter chance by zone
    const encounterChances = {
      hub: 0.15,
      forest: 0.35,
      city: 0.25,
      wasteland: 0.45,
      cosmic: 0.60
    };

    const chance = encounterChances[zoneId] || 0.2;

    if (Math.random() > chance) {
      return false; // No encounter
    }

    // Roll encounter composition
    const roll = DiceSystem.rollEncounter();
    this.triggerEncounter(gameState, zoneId, roll, appendLine);
    return true;
  },

  /**
   * Trigger a full encounter sequence
   * @param {object} gameState - Player state
   * @param {string} zoneId - Zone ID
   * @param {object} rollResult - From DiceSystem.rollEncounter()
   * @param {object} appendLine - UI output function
   */
  triggerEncounter(gameState, zoneId, rollResult, appendLine) {
    // Pick random scenario
    const scenarioKeys = Object.keys(this.scenarios);
    const scenario = this.scenarios[scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)]];

    // Pick enemy group for zone
    const enemyPool = Object.values(CastEnemies).filter(e => e.zone === zoneId);
    if (enemyPool.length === 0) return;

    const primaryEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];

    // Determine actual enemy count based on roll
    let actualCount = 1;
    if (rollResult.encounterSize.includes("PAIR")) actualCount = 2;
    else if (rollResult.encounterSize.includes("GROUP")) actualCount = 3;
    else if (rollResult.encounterSize.includes("PACK")) actualCount = 5;
    else if (rollResult.encounterSize.includes("HORDE")) actualCount = 7;

    // Assign personalities
    const personalities = Object.values(this.npcPersonalities);
    const composition = [];
    for (let i = 0; i < actualCount; i++) {
      const personality = personalities[Math.floor(Math.random() * personalities.length)];
      composition.push({
        ...JSON.parse(JSON.stringify(primaryEnemy)),
        id: primaryEnemy.id + "_" + i,
        personality: personality
      });
    }

    // Build encounter
    const encounter = {
      id: "encounter_" + Date.now(),
      scenario: scenario,
      zone: zoneId,
      primaryEnemy: primaryEnemy,
      composition: composition,
      actualCount: actualCount,
      roll: rollResult,
      active: true,
      playerChoice: null
    };

    // Store in gameState
    gameState.currentEncounter = encounter;

    // Narrate scenario
    const narrativeText = scenario.template
      .replace("{enemyType}", primaryEnemy.name)
      .replace("{roll}", rollResult.roll)
      .replace("{actualCount}", actualCount);

    appendLine("", "system");
    appendLine("════════════════════════════════════", "system");
    appendLine("⚔ ENCOUNTER", "battle");
    appendLine("════════════════════════════════════", "system");
    appendLine(narrativeText, "battle");
    appendLine("", "system");

    // Present choices
    this.presentChoices(encounter, appendLine);
  },

  /**
   * Present player with narrative choices
   * @param {object} encounter - Encounter data
   * @param {object} appendLine - UI output function
   */
  presentChoices(encounter, appendLine) {
    const choices = encounter.scenario.choices;

    appendLine("What do you do?", "system");
    appendLine("", "system");

    const choiceDescriptions = {
      fight_all: "fight_all - Engage all enemies in combat",
      fight_one: "fight_one - Focus on the strongest enemy",
      fight: "fight - Draw your weapons",
      negotiate: "negotiate - Attempt peaceful dialogue",
      recruit: "recruit - Try to convince them to join you",
      flee: "flee - Run away from the encounter",
      distract: "distract - Create a diversion",
      help: "help - Offer assistance to the enemies",
      ignore: "ignore - Walk past them",
      exploit: "exploit - Take advantage of them",
      shelter: "shelter - Give them refuge",
      respect_territory: "respect_territory - Acknowledge their claim",
      challenge_leader: "challenge_leader - Duel their leader",
      investigate: "investigate - Learn more",
      communicate: "communicate - Attempt telepathy",
      bypass: "bypass - Find another route"
    };

    choices.forEach(choice => {
      appendLine(choiceDescriptions[choice] || choice, "hint");
    });

    appendLine("", "system");
    appendLine("(Type: encounter <choice>)", "system");
  },

  // ============================================================
  // [RESOLVE_CHOICE] - Handle player decision
  // ============================================================

  /**
   * Resolve player's encounter choice
   * @param {object} gameState - Player state
   * @param {string} choice - Player's choice
   * @param {object} appendLine - UI output function
   * @param {object} cmdBattle - Battle function from core.js
   * @param {object} cmdGo - Go function from core.js
   */
  resolveChoice(gameState, choice, appendLine, cmdBattle, cmdGo) {
    const encounter = gameState.currentEncounter;
    if (!encounter || !encounter.active) {
      appendLine("No active encounter.", "error");
      return;
    }

    encounter.playerChoice = choice;

    switch (choice) {
      case "fight":
      case "fight_all":
        this.choiceFight(gameState, encounter, appendLine, cmdBattle);
        break;

      case "fight_one":
        this.chooseFightOne(gameState, encounter, appendLine, cmdBattle);
        break;

      case "negotiate":
        this.choiceNegotiate(gameState, encounter, appendLine);
        break;

      case "recruit":
        this.choiceRecruit(gameState, encounter, appendLine);
        break;

      case "flee":
        this.choiceFlee(gameState, encounter, appendLine, cmdGo);
        break;

      case "distract":
        this.choiceDistract(gameState, encounter, appendLine);
        break;

      case "help":
        this.choiceHelp(gameState, encounter, appendLine);
        break;

      case "ignore":
        this.choiceIgnore(gameState, encounter, appendLine);
        break;

      case "exploit":
        this.choiceExploit(gameState, encounter, appendLine, cmdBattle);
        break;

      case "shelter":
        this.choiceShelter(gameState, encounter, appendLine);
        break;

      case "respect_territory":
        this.choiceRespectTerritory(gameState, encounter, appendLine);
        break;

      case "challenge_leader":
        this.choiceChallengeLeader(gameState, encounter, appendLine, cmdBattle);
        break;

      case "investigate":
        this.choiceInvestigate(gameState, encounter, appendLine);
        break;

      case "communicate":
        this.choiceCommunicate(gameState, encounter, appendLine);
        break;

      case "bypass":
        this.choiceBypass(gameState, encounter, appendLine);
        break;

      default:
        appendLine("Invalid choice.", "error");
    }
  },

  // ============================================================
  // [CHOICE_IMPLEMENTATIONS] - Individual response handlers
  // ============================================================

  choiceFight(gameState, encounter, appendLine, cmdBattle) {
    appendLine("You draw your weapons and step forward.", "battle");
    appendLine("The enemies hesitate... then charge!", "battle");
    appendLine("", "system");

    encounter.active = false;

    // Start battle with primary enemy
    cmdBattle([encounter.primaryEnemy.id]);
  },

  chooseFightOne(gameState, encounter, appendLine, cmdBattle) {
    const strongest = encounter.composition.reduce((prev, curr) =>
      prev.hp > curr.hp ? prev : curr
    );

    appendLine(`You focus on the strongest: ${strongest.name}.`, "battle");
    appendLine("The others... hesitate. Some scatter.", "battle");
    appendLine("", "system");

    encounter.active = false;

    // Battle just the strongest
    cmdBattle([strongest.id]);
  },

  choiceNegotiate(gameState, encounter, appendLine) {
    const negotiateChances = encounter.composition.map(e => e.personality.negotiateChance);
    const avgChance = negotiateChances.reduce((a, b) => a + b) / negotiateChances.length;
    const roll = Math.random();

    appendLine("You hold up your hands peacefully.", "system");
    appendLine(`[NEGOTIATION ROLL: ${roll.toFixed(2)} vs ${avgChance.toFixed(2)}]`, "system");
    appendLine("", "system");

    if (roll > avgChance) {
      appendLine("They don't trust you. Negotiations fail.", "error");
      appendLine("They become hostile!", "battle");
      encounter.composition.forEach(e => {
        this.applyConsequence(gameState, "negotiation_failed", e);
      });
      appendLine("You must fight!", "battle");
      encounter.active = false;
    } else {
      appendLine("A tense peace settles between you.", "highlight");
      appendLine("They lower their weapons. You pass.", "highlight");
      appendLine("", "system");
      encounter.active = false;
      gameState.currentEncounter = null;
    }
  },

  choiceRecruit(gameState, encounter, appendLine) {
    const recruitChances = encounter.composition.map(e => e.personality.recruitChance);
    const mostRecruitableIdx = recruitChances.indexOf(Math.max(...recruitChances));
    const recruit = encounter.composition[mostRecruitableIdx];

    appendLine(`You appeal to ${recruit.name}.`, "system");
    appendLine(`[RECRUITMENT ROLL: ${recruit.personality.recruitChance.toFixed(2)}]`, "system");
    appendLine("", "system");

    if (Math.random() > recruit.personality.recruitChance) {
      appendLine("They refuse. This insults the others.", "error");
      appendLine("Combat imminent!", "battle");
      encounter.active = false;
    } else {
      appendLine(`${recruit.name} steps forward.`, "highlight");
      appendLine('"I\'ll follow you," they say.', "highlight");
      this.applyConsequence(gameState, "enemy_recruited", recruit);
      appendLine("", "system");
      appendLine("The others... reluctantly disperse.", "system");
      encounter.active = false;
      gameState.currentEncounter = null;
    }
  },

  choiceFlee(gameState, encounter, appendLine, cmdGo) {
    const fleeChances = encounter.composition.map(e => e.personality.fleeChance);
    const willLetYouFlee = fleeChances.some(chance => Math.random() < chance);

    appendLine("You turn and run!", "system");
    appendLine("[ESCAPE ROLL...]", "system");
    appendLine("", "system");

    if (!willLetYouFlee) {
      appendLine("They pursue! You can't escape!", "battle");
      appendLine("Forced to fight!", "battle");
      encounter.active = false;
    } else {
      appendLine("You manage to escape!", "highlight");
      appendLine("The sounds of pursuit fade.", "system");
      encounter.active = false;
      gameState.currentEncounter = null;
      appendLine("You've returned to safety (for now).", "system");
    }
  },

  choiceDistract(gameState, encounter, appendLine) {
    appendLine("You create a loud noise to draw attention.", "system");
    appendLine("Some scatter, confused.", "system");
    appendLine("You slip past them.", "highlight");
    appendLine("", "system");
    encounter.active = false;
    gameState.currentEncounter = null;
  },

  choiceHelp(gameState, encounter, appendLine) {
    appendLine("You offer aid to the desperate enemies.", "system");
    appendLine("They're shocked. Enemies lower their weapons.", "highlight");
    appendLine("A fragile peace. You gain their gratitude.", "highlight");
    encounter.active = false;
    gameState.currentEncounter = null;
    gameState.exp += 25; // Peaceful resolution bonus
  },

  choiceIgnore(gameState, encounter, appendLine) {
    const ignoreSuccess = Math.random() > 0.4;

    if (ignoreSuccess) {
      appendLine("You walk past them casually.", "system");
      appendLine("They don't bother you. Strange.", "system");
      encounter.active = false;
      gameState.currentEncounter = null;
    } else {
      appendLine("They take your indifference as disrespect!", "error");
      appendLine("They attack!", "battle");
      encounter.composition.forEach(e => {
        e.aggressionLevel += 2;
      });
      encounter.active = false;
    }
  },

  choiceExploit(gameState, encounter, appendLine, cmdBattle) {
    appendLine("You see their weakness and strike fast.", "system");
    appendLine("Cowardly ones flee immediately.", "battle");
    const actual = encounter.composition.filter(e => e.personality.fleeChance < 0.5);
    appendLine(`Only ${actual.length} stand to fight.`, "battle");
    encounter.active = false;
  },

  choiceShelter(gameState, encounter, appendLine) {
    appendLine("You offer sanctuary to the frightened ones.", "system");
    appendLine("They gratefully accept. A debt is owed.", "highlight");
    encounter.active = false;
    gameState.currentEncounter = null;
    gameState.exp += 30; // Compassion bonus
  },

  choiceRespectTerritory(gameState, encounter, appendLine) {
    appendLine("You acknowledge their claim to this land.", "system");
    appendLine("Mutual respect. They step aside.", "highlight");
    this.applyConsequence(gameState, "territory_claimed", encounter.zone);
    encounter.active = false;
    gameState.currentEncounter = null;
  },

  choiceChallengeLeader(gameState, encounter, appendLine, cmdBattle) {
    const leader = encounter.composition[0];
    appendLine(`You challenge ${leader.name} to single combat!`, "battle");
    appendLine("The others watch. This will be decided 1v1.", "battle");
    appendLine("", "system");
    encounter.active = false;
    cmdBattle([leader.id]);
  },

  choiceInvestigate(gameState, encounter, appendLine) {
    appendLine("You approach cautiously, observing.", "system");
    appendLine("Something ancient stirs in their movements...", "system");
    appendLine("A fragment of understanding touches your mind.", "highlight");
    gameState.exp += 20;
    encounter.active = false;
    gameState.currentEncounter = null;
  },

  choiceCommunicate(gameState, encounter, appendLine) {
    appendLine("You reach out mentally...", "system");
    appendLine("[TELEPATHY ATTEMPT...]", "system");
    appendLine("", "system");
    const success = Math.random() > 0.4;

    if (success) {
      appendLine("Contact! You sense their thoughts.", "highlight");
      appendLine("Fear. Hunger. Loneliness.", "system");
      appendLine("They're not monsters. Just... lost.", "system");
      encounter.active = false;
      gameState.currentEncounter = null;
      gameState.exp += 35; // Insight bonus
    } else {
      appendLine("The connection breaks violently!", "error");
      appendLine("They're enraged! Combat imminent!", "battle");
      encounter.composition.forEach(e => e.aggressionLevel += 3);
      encounter.active = false;
    }
  },

  choiceBypass(gameState, encounter, appendLine) {
    appendLine("You look for an alternate route...", "system");
    const success = Math.random() > 0.5;

    if (success) {
      appendLine("There's a path around them! You slip away.", "highlight");
      encounter.active = false;
      gameState.currentEncounter = null;
    } else {
      appendLine("No way around. They block all paths.", "error");
      appendLine("You must deal with them now.", "battle");
      encounter.active = false;
    }
  },

  // ============================================================
  // [UTILITY] - Helper functions
  // ============================================================

  /**
   * Apply consequence to game state
   * @param {object} gameState - Player state
   * @param {string} consequenceId - Consequence type
   * @param {object} data - Contextual data (enemy, zone, etc.)
   */
  applyConsequence(gameState, consequenceId, data) {
    const consequence = this.consequences[consequenceId];
    if (consequence && consequence.effect) {
      consequence.effect(gameState, data);
    }
  },

  /**
   * End current encounter
   * @param {object} gameState - Player state
   */
  endEncounter(gameState) {
    gameState.currentEncounter = null;
  }
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[encounters.js] EncounterSystem initialized");
console.log("[encounters.js] Scenarios: " + Object.keys(window.EncounterSystem.scenarios).length);
console.log("[encounters.js] Personalities: " + Object.keys(window.EncounterSystem.npcPersonalities).length);
console.log("[encounters.js] Consequences: " + Object.keys(window.EncounterSystem.consequences).length);