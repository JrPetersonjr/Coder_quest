// ============================================================
// DYNAMIC NARRATIVE SYSTEM
// AI-generated emails & lore that evolves with player progression
// ============================================================

const DynamicNarrative = {
  
  // ============================================================
  // NARRATIVE STATE - Tracks story progression
  // ============================================================
  
  narrativeState: {
    // Identity Arc
    playerIdentity: {
      discovered: false,
      realName: null,
      role: null, // "Guardian", "Technomancer", "Hacker", "Datamancer", etc.
      power: null // "Corruption Fighter", "Terminal Restorer", "Code Weaver"
    },

    // Relationships (NPCs met)
    npcEncounters: {
      // "dr_catherine_vale": { met: true, emailCount: 2, relationship: "mentor" },
    },

    // Terminal Restoration Progress
    terminalsRestored: {
      hub: false,
      forest: false,
      city: false,
      wasteland: false,
      train_station: false
    },

    // Corruption State
    corruptionLevel: 100, // 0 = fully restored, 100 = maximum corruption
    corruptionAreas: {
      // "forest": 80,
      // "city": 60,
    },

    // Boss Encounters
    bosses: {
      // "syntax_prime": { encountered: false, defeated: false },
    },

    // Story Milestones
    milestones: {
      character_created: false,
      first_terminal: false,
      first_corruption_encounter: false,
      first_boss: false,
      halfway_awake: false, // Halfway through identity reveal
      fully_realized: false,
      final_boss_intro: false,
      corruption_purged: false,
    },

    // Discovered Lore
    knownFacts: [
      // Things player has learned about the world
    ],
  },

  // ============================================================
  // AI EMAIL GENERATION
  // ============================================================

  /**
   * Generate an email from AI based on narrative context
   * @param {object} gameState - Current game state
   * @param {string} emailType - "discovery", "boss_intro", "mentor", "mystery", "restoration"
   * @returns {object} Generated email object
   */
  async generateEmail(gameState, emailType = "discovery") {
    const context = this.buildPromptContext(gameState);
    
    const prompts = {
      discovery: `Generate a mysterious email that hints at the player's true identity. They're starting to remember fragments. 
        Context: ${context}
        Create an unsettling but hopeful email as if from someone they knew. Use technical metaphors mixed with personal memory.
        Format: sender, subject, body (2-3 paragraphs). Make it feel corrupted/fragmented at times.`,
      
      boss_intro: `Generate an ominous email that introduces a boss/corruption manifestation.
        Context: ${context}
        The email should build dread about what's coming. Use corrupted text randomly. Mix narrative with technical warnings.
        Format: technical alert style mixed with personal warning.`,
      
      mentor: `Generate a mentor figure's email guiding the player.
        Context: ${context}
        Reference their recent discoveries. Build trust gradually. Hint at larger secrets.
        Format: formal but warm, like an old advisor reaching through time.`,
      
      mystery: `Generate a cryptic email from an unknown sender.
        Context: ${context}
        Leave questions unanswered. Reference "the others" who might be like the player. Build intrigue.
        Format: sparse, fragmented, like someone typing in secret.`,
      
      restoration: `Generate an email celebrating a restored terminal.
        Context: ${context}
        Make it feel like the world is "waking up". Show that restoring terminals has consequences (positive).
        Format: excited, revealing, like long-dormant systems coming back online.`,
      
      identity_fragment: `Generate a piece of the player's actual memory/identity.
        Context: ${context}
        This should reveal something TRUE about who they are. Be poignant. Reference their power/role.
        Format: personal journal entry or memory fragment, disorienting and emotional.`
    };

    const prompt = prompts[emailType] || prompts.discovery;

    try {
      const response = await AIConfig.generateContent("lore", prompt);
      
      // Parse response into email structure
      const email = this.parseGeneratedEmail(response, emailType);
      return email;
    } catch (e) {
      console.warn("[NARRATIVE] AI generation failed, using fallback");
      return this.getFallbackEmail(emailType, gameState);
    }
  },

  /**
   * Build context string for AI prompt
   */
  buildPromptContext(gameState) {
    const state = this.narrativeState;
    
    let context = `
Game Progression:
- Level: ${gameState.level || 1}
- HP: ${gameState.hp}/${gameState.maxHp}
- Mana: ${gameState.mana}/${gameState.maxMana}
- Data: ${gameState.data || 0}
- Zone: ${gameState.currentZone || "unknown"}
- Terminals Restored: ${Object.values(state.terminalsRestored).filter(Boolean).length}/5

Identity Status:
- Known Name: ${state.playerIdentity.realName || "UNKNOWN"}
- Discovered Role: ${state.playerIdentity.role || "Searching..."}
- Identity Progress: ${state.milestones.halfway_awake ? "50%" : state.milestones.character_created ? "10%" : "0%"}

NPCs Met: ${Object.keys(state.npcEncounters).join(", ") || "None"}
Bosses Defeated: ${Object.entries(state.bosses).filter(([_, v]) => v.defeated).map(([k]) => k).join(", ") || "None"}
Corruption Level: ${state.corruptionLevel}%
    `.trim();

    return context;
  },

  /**
   * Parse AI-generated text into email structure
   */
  parseGeneratedEmail(text, emailType) {
    // Extract sender (look for "From:" or names)
    const fromMatch = text.match(/From:?\s*(.+?)(?:\n|$)/i);
    const sender = fromMatch ? fromMatch[1].trim() : this.getRandomSender(emailType);

    // Extract subject
    const subjectMatch = text.match(/Subject:?\s*(.+?)(?:\n|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : this.getSubjectForType(emailType);

    // Use full text as body
    const body = text.replace(/From:.*\n/i, "").replace(/Subject:.*\n/i, "").trim();

    return {
      id: "ai_email_" + Date.now(),
      type: emailType,
      from: sender,
      subject: subject,
      body: body,
      generated: true,
      timestamp: Date.now(),
      corrupted: Math.random() > 0.7, // 30% chance of corruption
    };
  },

  /**
   * Get random sender based on email type
   */
  getRandomSender(emailType) {
    const senders = {
      discovery: ["Dr. Catherine Vale", "Unknown", "?????", "System Log"],
      boss_intro: ["Warning Protocol", "The Corruption", "Sentinel", "Failsafe Alert"],
      mentor: ["Dr. Kessler", "The Archivist", "Guardian Protocol", "Vale Industries"],
      mystery: ["?", "...", "Echo", "Someone"],
      restoration: ["Terminal Log", "System Awakening", "Archive Node", "Recovery Protocol"],
      identity_fragment: ["Your Memory", "Fragments", "Echo of Self", "Before..."],
    };

    const list = senders[emailType] || senders.discovery;
    return list[Math.floor(Math.random() * list.length)];
  },

  /**
   * Get subject line for email type
   */
  getSubjectForType(emailType) {
    const subjects = {
      discovery: ["Do you remember?", "You are...", "The truth hidden", "Before the fall", "Recognition"],
      boss_intro: ["WARNING: ANOMALY", "Corruption Detected", "SYSTEM INTRUSION", "Something wakes"],
      mentor: ["Progress", "You're close", "Trust the path", "Evidence found", "Direction"],
      mystery: ["Why?", "Are you like us?", "The others", "Questions", "????"],
      restoration: ["It's waking up", "Systems online", "Life returns", "Voices restored", "Finally..."],
      identity_fragment: ["I remember", "What was lost", "Who I was", "The moment before", "Recognition cascade"],
    };

    const list = subjects[emailType] || subjects.discovery;
    return list[Math.floor(Math.random() * list.length)];
  },

  /**
   * Fallback emails if AI fails
   */
  getFallbackEmail(emailType, gameState) {
    const fallbacks = {
      discovery: {
        from: "Unknown",
        subject: "Do you remember?",
        body: `There's a name on the edge of your consciousness. A role. A purpose. You're not meant to be lost here. Find the terminals. They remember.`
      },
      boss_intro: {
        from: "Warning Protocol",
        subject: "CORRUPTION DETECTED",
        body: `Something vast stirs in the depths. The corruption takes form. What emerges is not natural. Prepare yourself.`
      },
      mentor: {
        from: "Dr. Kessler",
        subject: "You're making progress",
        body: `I see the terminals awakening through you. Each one restored brings clarity. You're not alone in this. Trust your instincts.`
      },
      mystery: {
        from: "Echo",
        subject: "Are you like us?",
        body: `There were others once. Others who could hear the code. Others like you. What happened to them? Are you searching too?`
      },
      restoration: {
        from: "Terminal Log",
        subject: "Systems coming online",
        body: `Life flows back through the pathways. Where you touch, systems awaken. The forest hums again. The city's clocks tick. You are the cure.`
      },
      identity_fragment: {
        from: "Your Memory",
        subject: "I remember now...",
        body: `Your name was... The power to wake the code. You were built for this. Not born. Built. To heal what was broken. To become what was lost.`
      }
    };

    const email = fallbacks[emailType] || fallbacks.discovery;
    return {
      id: "fallback_email_" + Date.now(),
      type: emailType,
      from: email.from,
      subject: email.subject,
      body: email.body,
      generated: false,
      fallback: true,
      timestamp: Date.now(),
    };
  },

  // ============================================================
  // NARRATIVE TRIGGERS
  // ============================================================

  /**
   * Check if milestone reached and trigger appropriate emails
   */
  checkMilestones(gameState) {
    const state = this.narrativeState;
    const triggers = [];

    // Character just created
    if (!state.milestones.character_created && gameState.intro?.complete) {
      state.milestones.character_created = true;
      triggers.push({ type: "character_created", emailType: "identity_fragment" });
    }

    // First terminal restored
    if (!state.milestones.first_terminal && Object.values(state.terminalsRestored).some(Boolean)) {
      state.milestones.first_terminal = true;
      triggers.push({ type: "first_terminal", emailType: "restoration" });
    }

    // Halfway identity revealed
    if (!state.milestones.halfway_awake && gameState.level >= 5) {
      state.milestones.halfway_awake = true;
      state.playerIdentity.role = this.deriveRole(gameState);
      triggers.push({ type: "halfway_awake", emailType: "discovery" });
    }

    // First boss defeated
    const firstBossDefeated = Object.values(state.bosses).some(b => b.defeated);
    if (!state.milestones.first_boss && firstBossDefeated) {
      state.milestones.first_boss = true;
      triggers.push({ type: "first_boss", emailType: "mentor" });
    }

    // Fully realized identity
    if (!state.milestones.fully_realized && gameState.level >= 15 && Object.values(state.terminalsRestored).filter(Boolean).length >= 3) {
      state.milestones.fully_realized = true;
      state.playerIdentity.discovered = true;
      state.playerIdentity.realName = this.deriveIdentity(gameState);
      triggers.push({ type: "fully_realized", emailType: "identity_fragment" });
    }

    return triggers;
  },

  /**
   * Derive player role based on stats/choices
   */
  deriveRole(gameState) {
    const roles = [
      "Code Weaver",
      "Corruption Fighter",
      "Terminal Guardian",
      "System Restorer",
      "Echo Walker"
    ];
    return roles[Math.floor(Math.random() * roles.length)];
  },

  /**
   * Derive actual identity
   */
  deriveIdentity(gameState) {
    const names = [
      "ARIA - Automated Response Intelligence Archive",
      "ECHO - Emergent Consciousness Harmonic Operator",
      "VERA - Vigilant Ecosystem Restoration Agent",
      "NEXUS - Neural Execution X-dimensional Universal System",
      "CIPHER - Code Integrity Protection & Healing Entity Response"
    ];
    return names[Math.floor(Math.random() * names.length)];
  },

  /**
   * Register NPC encounter
   */
  registerNPCMeeting(npcId, npcName) {
    if (!this.narrativeState.npcEncounters[npcId]) {
      this.narrativeState.npcEncounters[npcId] = {
        name: npcName,
        met: true,
        emailCount: 0,
        relationship: "unknown"
      };
      return true; // First meeting
    }
    this.narrativeState.npcEncounters[npcId].emailCount++;
    return false; // Seen before
  },

  /**
   * Register boss encounter
   */
  registerBossEncounter(bossId, bossName, tier = "mini") {
    if (!this.narrativeState.bosses[bossId]) {
      this.narrativeState.bosses[bossId] = {
        name: bossName,
        tier: tier, // "mini", "sub", "demi", "prime"
        encountered: true,
        defeated: false,
        attempts: 0
      };
    }
    this.narrativeState.bosses[bossId].attempts++;
  },

  /**
   * Record boss defeat
   */
  registerBossDefeat(bossId) {
    if (this.narrativeState.bosses[bossId]) {
      this.narrativeState.bosses[bossId].defeated = true;
      this.narrativeState.corruptionLevel -= this.narrativeState.bosses[bossId].tier === "prime" ? 30 : 10;
    }
  },

  /**
   * Register terminal restoration
   */
  registerTerminalRestoration(zoneId) {
    if (this.narrativeState.terminalsRestored[zoneId]) {
      this.narrativeState.terminalsRestored[zoneId] = true;
      this.narrativeState.corruptionLevel -= 15;
      return true;
    }
    return false;
  },

  // ============================================================
  // SAVE/LOAD
  // ============================================================

  save() {
    return JSON.parse(JSON.stringify(this.narrativeState));
  },

  load(data) {
    if (data && typeof data === 'object') {
      this.narrativeState = { ...this.narrativeState, ...data };
    }
  }
};

console.log("[dynamic-narrative.js] Dynamic narrative system loaded");
