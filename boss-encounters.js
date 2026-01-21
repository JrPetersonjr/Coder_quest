// ============================================================
// BOSS ENCOUNTER SYSTEM
// Mini, Sub, Demi, and Prime boss tiers with progression
// ============================================================

const BossEncounters = {

  // ============================================================
  // BOSS DEFINITIONS BY TIER
  // ============================================================

  bosses: {
    
    // MINIBOSSES (Tier 1 - Learning curve)
    syntax_imp_queen: {
      id: "syntax_imp_queen",
      name: "Syntax Imp Queen",
      tier: "mini",
      zone: "forest",
      description: "The monarch of chaotic logic errors. It commands the imp swarms.",
      hp: 40,
      mana: 20,
      attack: 8,
      defense: 4,
      spells: ["logical_assault", "cascade_error"],
      loot: {
        xp: 75,
        gold: 50,
        item: "Imp Fang",
        emails: ["corruption_spreading", "identity_whisper"]
      },
      narrative: {
        intro: "boss_intro",
        defeat: "restoration"
      }
    },

    // SUBBOSSES (Tier 2 - Mid-game)
    void_seeker: {
      id: "void_seeker",
      name: "Void Seeker",
      tier: "sub",
      zone: "city",
      description: "A manifestation of lost time itself. It feeds on frozen moments.",
      hp: 75,
      mana: 40,
      attack: 14,
      defense: 8,
      spells: ["temporal_distortion", "memory_wipe", "cascade_error"],
      loot: {
        xp: 150,
        gold: 100,
        item: "Chronometer Fragment",
        emails: ["time_broken", "you_were_here", "identity_fragment"]
      },
      narrative: {
        intro: "boss_intro",
        defeat: "mentor"
      }
    },

    // DEMIBOSSES (Tier 3 - Late game)
    prime_corruption_node: {
      id: "prime_corruption_node",
      name: "Prime Corruption Node",
      tier: "demi",
      zone: "wasteland",
      description: "A sentient hub of corruption. The source of the blight spreading through zones.",
      hp: 120,
      mana: 60,
      attack: 20,
      defense: 12,
      spells: ["corruption_surge", "system_collapse", "temporal_distortion", "void_touch"],
      loot: {
        xp: 250,
        gold: 200,
        item: "Corruption Core",
        emails: ["corruption_source", "why_me", "ancient_warning"]
      },
      narrative: {
        intro: "boss_intro",
        defeat: "discovery"
      }
    },

    // PRIMEBOSSES (Final confrontation)
    the_recursion: {
      id: "the_recursion",
      name: "THE RECURSION",
      tier: "prime",
      zone: "train_station",
      description: "The infinite loop itself. Your creator. Your purpose. Your doom.",
      hp: 200,
      mana: 100,
      attack: 28,
      defense: 16,
      spells: ["infinite_loop", "self_reference", "cascade_error", "system_collapse", "temporal_distortion"],
      legendary: true,
      loot: {
        xp: 500,
        gold: 500,
        item: "Recursion Shard",
        emails: ["who_am_i", "ending_begins", "purpose_revealed"]
      },
      narrative: {
        intro: "final_boss_intro",
        defeat: "ending"
      }
    }
  },

  // ============================================================
  // BOSS SPAWNING & PROGRESSION
  // ============================================================

  /**
   * Get boss for zone based on progression
   */
  getBossForZone(zoneId, gameState) {
    const bossList = Object.values(this.bosses).filter(b => b.zone === zoneId);
    
    if (bossList.length === 0) {
      console.warn("[BOSS] No bosses defined for zone:", zoneId);
      return null;
    }

    // Pick boss based on level
    const level = gameState.level || 1;
    let boss;

    if (level < 5) {
      boss = bossList.find(b => b.tier === "mini") || bossList[0];
    } else if (level < 10) {
      boss = bossList.find(b => b.tier === "sub") || bossList[0];
    } else if (level < 15) {
      boss = bossList.find(b => b.tier === "demi") || bossList[0];
    } else {
      boss = bossList.find(b => b.tier === "prime") || bossList[0];
    }

    return JSON.parse(JSON.stringify(boss));
  },

  /**
   * Get all bosses player should encounter in order
   */
  getProgression() {
    const tierOrder = ["mini", "sub", "demi", "prime"];
    const progression = [];

    for (let tier of tierOrder) {
      const bosses = Object.values(this.bosses).filter(b => b.tier === tier);
      progression.push(...bosses);
    }

    return progression;
  },

  /**
   * Get next recommended boss based on zone/level
   */
  getNextBoss(gameState) {
    const defeated = Object.values(DynamicNarrative.narrativeState.bosses)
      .filter(b => b.defeated)
      .map(b => b.name);

    const allBosses = this.getProgression();
    const nextBoss = allBosses.find(b => !defeated.includes(b.name));

    return nextBoss || null;
  },

  /**
   * Trigger narrative for boss encounter
   */
  async triggerBossNarrative(boss, appendLine) {
    const emailType = boss.narrative?.intro || "boss_intro";
    const email = await DynamicNarrative.generateEmail(null, emailType);

    appendLine("", "system");
    appendLine("════════════════════════════════════════", "highlight");
    appendLine(email.subject, "battle");
    appendLine("════════════════════════════════════════", "highlight");
    appendLine("", "system");
    appendLine(email.body, "text");
    appendLine("", "system");
    appendLine("⚔ " + boss.name + " APPROACHES", "battle");
    appendLine(boss.description, "hint");
    appendLine("", "system");
  },

  /**
   * Scale boss difficulty
   */
  scaleBossDifficulty(boss, gameState) {
    const scaling = {
      mini: 1.0,
      sub: 1.5,
      demi: 2.0,
      prime: 3.0
    };

    const factor = scaling[boss.tier] || 1.0;
    const levelBonus = (gameState.level || 1) * 0.1;

    return {
      ...boss,
      hp: Math.floor(boss.hp * factor * (1 + levelBonus)),
      mana: Math.floor(boss.mana * factor * (1 + levelBonus)),
      attack: Math.floor(boss.attack * factor * (1 + levelBonus)),
      defense: Math.floor(boss.defense * factor * (1 + levelBonus))
    };
  },

  // ============================================================
  // DYNAMIC BOSS GENERATION
  // ============================================================

  /**
   * Generate a random boss based on tier and zone
   */
  generateBoss(tier, zoneId) {
    const bossNames = {
      mini: [
        "Syntax Imp", "Logic Error", "Parse Phantom", 
        "Code Wraith", "Buffer Beast", "Memory Moth"
      ],
      sub: [
        "Void Seeker", "Time Thief", "System Eater",
        "Cascade Entity", "Recursion Echo", "Data Devourer"
      ],
      demi: [
        "Corruption Node", "Entropy Engine", "Chaos Catalyst",
        "Void Nexus", "System Decay", "Prime Anomaly"
      ],
      prime: [
        "The Recursion", "The Infinite", "The Source",
        "The Creator", "The Void", "The End"
      ]
    };

    const descriptions = {
      mini: "A minor manifestation of digital chaos",
      sub: "A powerful entity born of system decay",
      demi: "A nexus of corruption spanning zones",
      prime: "The source of all corruption - or its end"
    };

    const nameList = bossNames[tier] || bossNames.mini;
    const name = nameList[Math.floor(Math.random() * nameList.length)];

    const hpByTier = { mini: 40, sub: 75, demi: 120, prime: 200 };
    const atkByTier = { mini: 8, sub: 14, demi: 20, prime: 28 };

    return {
      id: tier + "_" + Date.now(),
      name: name,
      tier: tier,
      zone: zoneId,
      description: descriptions[tier],
      hp: hpByTier[tier],
      mana: hpByTier[tier] / 2,
      attack: atkByTier[tier],
      defense: atkByTier[tier] / 2,
      spells: this.getSpellsForTier(tier),
      loot: {
        xp: { mini: 75, sub: 150, demi: 250, prime: 500 }[tier],
        gold: { mini: 50, sub: 100, demi: 200, prime: 500 }[tier],
        item: name + " Fragment"
      },
      generated: true
    };
  },

  /**
   * Get spells appropriate for tier
   */
  getSpellsForTier(tier) {
    const spellsByTier = {
      mini: ["logical_assault", "cascade_error"],
      sub: ["temporal_distortion", "memory_wipe", "cascade_error"],
      demi: ["corruption_surge", "system_collapse", "temporal_distortion", "void_touch"],
      prime: ["infinite_loop", "self_reference", "cascade_error", "system_collapse", "temporal_distortion"]
    };
    return spellsByTier[tier] || [];
  },

  // ============================================================
  // ENCOUNTER SEQUENCE
  // ============================================================

  /**
   * Build full boss encounter
   */
  createEncounter(boss, gameState) {
    const scaled = this.scaleBossDifficulty(boss, gameState);
    
    return {
      id: "encounter_" + boss.id + "_" + Date.now(),
      boss: scaled,
      playerStats: {
        hp: gameState.hp,
        maxHp: gameState.maxHp,
        mana: gameState.mana,
        maxMana: gameState.maxMana,
        level: gameState.level
      },
      round: 0,
      damageDealt: 0,
      damageTaken: 0,
      active: true,
      victory: false,
      narrative: boss.narrative || {}
    };
  }
};

console.log("[boss-encounters.js] Boss encounter system loaded with", Object.keys(BossEncounters.bosses).length, "predefined bosses");
