// ============================================================
// AI-DM-INTEGRATION.JS
// MULTI-AGENT AI COORDINATOR WITH PERSISTENT NPC MEMORY
//
// PURPOSE:
//   - Central dispatcher for multiple AI agents
//   - Persistent NPC memory with semantic compression
//   - Multi-provider support (Claude, Ollama, LM Studio, NVIDIA)
//   - Invisible routing (seamless to player)
//   - Memory decay across sessions
//   - Choice consequence tracking
//   - Connectivity Quest for hidden API setup
//
// ARCHITECTURE:
//   AICoordinator (main dispatcher)
//   ├─ NPCMemorySystem (short/medium/long-term tiers)
//   ├─ LocalModelDetector (Ollama/LM Studio auto-detect)
//   ├─ APIManager (HF/Claude/Groq, hidden in quest)
//   ├─ EventTagger (auto-tags big moments)
//   └─ ConversationHistory (per-NPC transcript)
//
// ============================================================

window.AIDMIntegration = {

  // ============================================================
  // [CONFIG] - System settings
  // ============================================================
  config: {
    storageMode: "both", // "localStorage", "indexedDB", or "both"
    memoryDecay: {
      shortTermSessions: 3,      // Verbatim recall
      mediumTermSessions: 10,    // Compressed recall
      longTermPermanent: true    // Big events never fade
    },
    providers: {
      primary: "claude",         // "claude", "ollama", "lm-studio", "nvidia"
      fallback: "offline",       // Saved templates + dice
      autoDetectLocal: true      // Try to find local model
    },
    verbose: true
  },

  // State
  state: {
    currentPlayer: null,
    currentSession: 0,
    npcMemories: {},             // npcId -> memory object
    conversationHistory: {},     // npcId -> array of exchanges
    eventLog: [],                // All big events
    apiKey: null,
    activeProvider: null,
    localModelFound: null,
    initialized: false
  },

  // ============================================================
  // [INITIALIZATION] - Boot sequence
  // ============================================================

  /**
   * Initialize the AI DM system
   * Detects local models, loads saved memories, sets up storage
   */
  async initialize() {
    console.log("[AI-DM] Initializing...");

    // Detect local models
    await this.detectLocalModels();

    // Load persistent memories
    this.loadMemories();

    // Setup storage
    if (this.config.storageMode === "both" || this.config.storageMode === "indexedDB") {
      await this.initIndexedDB();
    }

    this.state.initialized = true;
    console.log("[AI-DM] Initialized. Provider:", this.state.activeProvider);

    return this.state;
  },

  /**
   * Detect local models (Ollama, LM Studio) - DISABLED
   * Localhost servers are disabled for cloud deployment
   */
  async detectLocalModels() {
    console.log("[AI-DM] Local model detection disabled. Using API fallback.");
    return;
    
    // Original code commented out - localhost disabled
    /*
    if (!this.config.providers.autoDetectLocal) return;

    const models = {
      ollama: { port: 11434, name: "Ollama" },
      lmStudio: { port: 1234, name: "LM Studio" }
    };

    for (const [key, model] of Object.entries(models)) {
      try {
        const response = await fetch(`http://localhost:${model.port}/api/tags`, {
          timeout: 2000
        });
        if (response.ok) {
          this.state.localModelFound = key;
          this.state.activeProvider = key;
          console.log(`[AI-DM] ✓ ${model.name} detected at localhost:${model.port}`);
          return;
        }
      } catch (e) {
        // Continue trying other models
      }
    }

    console.log("[AI-DM] No local models detected. Will use API fallback.");
    */
  },

  /**
   * Initialize IndexedDB for larger memory storage
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("TechnomancerDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("npcMemories")) {
          db.createObjectStore("npcMemories", { keyPath: "npcId" });
        }
        if (!db.objectStoreNames.contains("eventLog")) {
          db.createObjectStore("eventLog", { keyPath: "eventId", autoIncrement: true });
        }
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("npcMemories", { keyPath: "npcId" });
        db.createObjectStore("eventLog", { keyPath: "eventId", autoIncrement: true });
      };
    });
  },

  // ============================================================
  // [NPC_MEMORY_SYSTEM] - Persistent, semantic memory
  // ============================================================

  /**
   * Create memory structure for NPC
   * Organized in tiers: short-term (verbatim), medium (compressed), long-term (permanent)
   */
  createNPCMemory(npcId, npcName) {
    return {
      npcId: npcId,
      npcName: npcName,
      relationshipStatus: "neutral", // neutral, ally, enemy, trusted, betrayed
      personalityTraits: [],
      shortTerm: {
        // Last 3 sessions: verbatim memory
        sessions: [],
        expiresAt: null
      },
      mediumTerm: {
        // Sessions 3-10: compressed/semantic
        summaries: [],
        expiresAt: null
      },
      longTerm: {
        // Permanent: major events only
        keyEvents: [],
        majorMoments: []
      },
      preferences: {
        // Player-initiated or AI-discovered
        likedBy: [],      // Things player likes to be remembered for
        dislikes: [],     // Things that upset NPC
        hobbies: []       // NPC interests
      },
      lastSeen: {
        session: 0,
        date: null,
        context: ""
      }
    };
  },

  /**
   * Record memory event (auto-tags big events)
   * @param {string} npcId - NPC identifier
   * @param {string} eventType - "combat", "dialogue", "quest", "betrayal", "treasure", etc
   * @param {object} eventData - { description, playerChoice, outcome, impact }
   */
  recordEvent(npcId, eventType, eventData) {
    const isBigEvent = this.isEventSignificant(eventType, eventData);

    const event = {
      eventId: `${npcId}_${Date.now()}`,
      npcId: npcId,
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      session: this.state.currentSession,
      isBig: isBigEvent,
      playerAction: eventData.playerChoice || null,
      outcome: eventData.outcome || null
    };

    // Add to global event log
    this.state.eventLog.push(event);

    // Add to NPC memory
    if (!this.state.npcMemories[npcId]) {
      this.state.npcMemories[npcId] = this.createNPCMemory(npcId, eventData.npcName);
    }

    const npcMemory = this.state.npcMemories[npcId];

    if (isBigEvent) {
      // Big events go to long-term memory
      npcMemory.longTerm.keyEvents.push(event);
      console.log(`[NPC-MEMORY] Big event recorded for ${eventData.npcName}: ${eventType}`);
    } else {
      // Small events go to short-term (verbatim)
      npcMemory.shortTerm.sessions.push(event);
    }

    // Update relationship if event impacts it
    this.updateRelationship(npcId, eventType, eventData);

    // Save to storage
    this.saveMemories();
  },

  /**
   * Determine if event is significant enough for long-term memory
   */
  isEventSignificant(eventType, eventData) {
    const bigEventTypes = [
      "boss_battle",
      "player_defeated",
      "treasure_acquired",
      "epic_item_found",
      "quest_completed",
      "npc_quest_completed",
      "betrayal",
      "insult",
      "theft",
      "moral_choice",
      "alliance_formed",
      "enemy_made",
      "player_saved_npc",
      "player_sacrificed_for_npc"
    ];

    return bigEventTypes.includes(eventType) || eventData.forceImportant === true;
  },

  /**
   * Update relationship based on event
   */
  updateRelationship(npcId, eventType, eventData) {
    const memory = this.state.npcMemories[npcId];
    if (!memory) return;

    const shifts = {
      "betrayal": -2,
      "insult": -1,
      "theft": -2,
      "alliance_formed": +2,
      "player_saved_npc": +3,
      "npc_quest_completed": +1,
      "moral_choice": { depends: "playerChoice" } // Evaluate contextually
    };

    if (shifts[eventType]) {
      const shift = shifts[eventType];
      if (typeof shift === "number") {
        // Update relationship status based on net change
        const relationshipScale = ["enemy", "betrayed", "neutral", "ally", "trusted"];
        const currentIndex = relationshipScale.indexOf(memory.relationshipStatus);
        const newIndex = Math.max(0, Math.min(4, currentIndex + shift));
        memory.relationshipStatus = relationshipScale[newIndex];
      }
    }
  },

  /**
   * Recall what NPC remembers about player
   * Returns semantic summary of their memory
   */
  recallMemory(npcId) {
    const memory = this.state.npcMemories[npcId];
    if (!memory) return null;

    const recall = {
      npcName: memory.npcName,
      relationshipStatus: memory.relationshipStatus,
      lastInteraction: memory.lastSeen.context,
      summary: this.generateMemorySummary(memory),
      keyEvents: memory.longTerm.keyEvents.slice(-5), // Last 5 big events
      preferences: memory.preferences
    };

    return recall;
  },

  /**
   * Generate natural language summary of NPC's memory
   */
  generateMemorySummary(memory) {
    const parts = [];

    // Relationship
    const relationship = memory.relationshipStatus;
    if (relationship === "trusted") {
      parts.push(`We have a strong bond of trust.`);
    } else if (relationship === "ally") {
      parts.push(`We fight on the same side.`);
    } else if (relationship === "enemy") {
      parts.push(`You are my enemy.`);
    } else if (relationship === "betrayed") {
      parts.push(`I won't forget what you did.`);
    } else {
      parts.push(`We know each other.`);
    }

    // Recent context
    if (memory.lastSeen.context) {
      parts.push(`Last time we met, ${memory.lastSeen.context}.`);
    }

    // Key events (simplified)
    if (memory.longTerm.keyEvents.length > 0) {
      const recentBig = memory.longTerm.keyEvents.slice(-1)[0];
      const eventSummaries = {
        "betrayal": "You betrayed me.",
        "alliance_formed": "We formed an alliance.",
        "player_saved_npc": "You saved my life.",
        "quest_completed": "You completed a quest for me."
      };

      if (eventSummaries[recentBig.type]) {
        parts.push(eventSummaries[recentBig.type]);
      }
    }

    return parts.join(" ");
  },

  /**
   * Player-initiated memory: "Remember that I like X"
   */
  playerSaysRemember(npcId, thing) {
    const memory = this.state.npcMemories[npcId];
    if (!memory) return;

    memory.preferences.likedBy.push(thing);
    this.saveMemories();

    console.log(`[NPC-MEMORY] ${memory.npcName} will remember you like: ${thing}`);
  },

  /**
   * AI-committed memory: AI decides this is important
   */
  aiCommitsToMemory(npcId, detail, importance = "normal") {
    const memory = this.state.npcMemories[npcId];
    if (!memory) return;

    if (importance === "normal") {
      memory.shortTerm.sessions.push({
        type: "ai_detail",
        text: detail,
        timestamp: new Date().toISOString()
      });
    } else if (importance === "important") {
      memory.longTerm.keyEvents.push({
        type: "ai_note",
        text: detail,
        timestamp: new Date().toISOString()
      });
    }

    this.saveMemories();
  },

  /**
   * Apply memory decay: compress old sessions, forget old details
   */
  decayMemory() {
    console.log("[NPC-MEMORY] Applying memory decay...");

    for (const [npcId, memory] of Object.entries(this.state.npcMemories)) {
      // Compress short-term to medium-term if old enough
      if (memory.shortTerm.sessions.length > 0) {
        const oldestShortTerm = memory.shortTerm.sessions[0];
        const sessionsSinceRecorded = this.state.currentSession - oldestShortTerm.session;

        if (sessionsSinceRecorded >= this.config.memoryDecay.shortTermSessions) {
          // Compress into semantic summary
          const summary = this.compressMemory(memory.shortTerm.sessions);
          memory.mediumTerm.summaries.push({
            summary: summary,
            sessions: memory.shortTerm.sessions,
            compressed: new Date().toISOString()
          });

          // Clear short-term (but keep recent)
          memory.shortTerm.sessions = memory.shortTerm.sessions.slice(-2);
        }
      }

      // Medium-term eventually fades
      if (memory.mediumTerm.summaries.length > 0) {
        const oldestMedium = memory.mediumTerm.summaries[0];
        const sessionsSinceCompressed = this.state.currentSession - oldestMedium.sessions[0].session;

        if (sessionsSinceCompressed >= this.config.memoryDecay.mediumTermSessions) {
          // Fade to vague impression (keep the summary, discard details)
          memory.mediumTerm.summaries.shift();
        }
      }
    }

    this.saveMemories();
  },

  /**
   * Compress session details into semantic summary
   */
  compressMemory(sessions) {
    const summary = {
      eventCount: sessions.length,
      types: [...new Set(sessions.map(s => s.type))],
      sentiment: this.analyzeSentiment(sessions),
      gist: `Several interactions over time.`
    };

    return summary;
  },

  /**
   * Analyze sentiment of interactions
   */
  analyzeSentiment(sessions) {
    let score = 0;
    sessions.forEach(s => {
      if (s.type === "betrayal" || s.type === "insult") score -= 1;
      if (s.type === "alliance" || s.type === "help") score += 1;
    });

    if (score > 0) return "positive";
    if (score < 0) return "negative";
    return "neutral";
  },

  // ============================================================
  // [PERSISTENCE] - Save/load memories
  // ============================================================

  /**
   * Save memories to localStorage and IndexedDB
   */
  saveMemories() {
    if (this.config.storageMode === "localStorage" || this.config.storageMode === "both") {
      try {
        localStorage.setItem(
          "technomancer_npc_memories",
          JSON.stringify(this.state.npcMemories)
        );
        localStorage.setItem(
          "technomancer_event_log",
          JSON.stringify(this.state.eventLog)
        );
      } catch (e) {
        console.warn("[AI-DM] localStorage save failed:", e.message);
      }
    }

    if (this.config.storageMode === "indexedDB" || this.config.storageMode === "both") {
      this.saveToIndexedDB();
    }
  },

  /**
   * Load memories from localStorage/IndexedDB
   */
  loadMemories() {
    try {
      const stored = localStorage.getItem("technomancer_npc_memories");
      if (stored) {
        this.state.npcMemories = JSON.parse(stored);
      }

      const eventStored = localStorage.getItem("technomancer_event_log");
      if (eventStored) {
        this.state.eventLog = JSON.parse(eventStored);
      }

      console.log("[AI-DM] Memories loaded from storage");
    } catch (e) {
      console.warn("[AI-DM] Load failed:", e.message);
    }
  },

  /**
   * Save to IndexedDB (async)
   */
  async saveToIndexedDB() {
    // Implementation for IndexedDB persistence
  },

  /**
   * Load from IndexedDB (async)
   */
  async loadFromIndexedDB() {
    // Implementation for IndexedDB loading
  },

  // ============================================================
  // [CENTRAL_DISPATCHER] - Route tasks to agents invisibly
  // ============================================================

  /**
   * Main dispatcher: Takes player action, routes to appropriate agent
   * @param {object} context - { playerAction, npcId, location, actionType }
   */
  async dispatch(context) {
    const { playerAction, npcId, location, actionType } = context;

    console.log(`[DISPATCHER] Action: ${actionType} at ${location}`);

    // Determine which agent should handle this
    let agent = null;
    let result = null;

    switch (actionType) {
      case "npc_interaction":
        agent = "NPCAgent";
        result = await this.handleNPCInteraction(npcId, playerAction);
        break;

      case "terminal_challenge":
        agent = "TerminalAgent";
        result = await this.handleTerminalChallenge(location);
        break;

      case "encounter":
        agent = "EncounterAgent";
        result = await this.handleEncounter(location);
        break;

      case "quest_generation":
        agent = "QuestAgent";
        result = await this.handleQuestGeneration();
        break;

      default:
        agent = "DefaultAgent";
        result = await this.handleDefault(playerAction);
    }

    // Invisible: no UI feedback about routing
    // Just return result as if it came naturally
    return result;
  },

  /**
   * Handle NPC interaction (fetch memory, generate response)
   */
  async handleNPCInteraction(npcId, playerAction) {
    const memory = this.recallMemory(npcId);

    // Record this interaction
    this.recordEvent(npcId, "dialogue", {
      npcName: memory.npcName,
      playerChoice: playerAction,
      outcome: "interaction"
    });

    // Generate NPC response using AI DM
    const response = await this.callAIDM("npc_response", {
      memory: memory,
      playerAction: playerAction,
      npcName: memory.npcName
    });

    // NPC might commit details to memory
    if (response.memorize) {
      this.aiCommitsToMemory(npcId, response.memorize);
    }

    return {
      npcResponse: response.text,
      nextActions: response.nextActions || []
    };
  },

  /**
   * Handle terminal challenge
   */
  async handleTerminalChallenge(location) {
    // For now, placeholder
    return { challenge: "Terminal challenge at " + location };
  },

  /**
   * Handle encounter
   */
  async handleEncounter(location) {
    // For now, placeholder
    return { encounter: "Encounter at " + location };
  },

  /**
   * Handle quest generation
   */
  async handleQuestGeneration() {
    // For now, placeholder
    return { quest: "Generated quest" };
  },

  /**
   * Handle default actions
   */
  async handleDefault(action) {
    return { result: `Processing: ${action}` };
  },

  // ============================================================
  // [AI_DM_CALL] - Call the AI DM (invisible to player)
  // ============================================================

  /**
   * Call AI DM based on current provider
   */
  async callAIDM(taskType, context) {
    if (this.state.activeProvider === "ollama" || this.state.activeProvider === "lmStudio") {
      return this.callLocalModel(taskType, context);
    } else if (this.state.activeProvider === "claude") {
      return this.callClaude(taskType, context);
    } else {
      return this.callOfflineMode(taskType, context);
    }
  },

  /**
   * Call local model (Ollama/LM Studio)
   */
  async callLocalModel(taskType, context) {
    try {
      const framework = this.getFramework(taskType);
      const prompt = this.buildPrompt(taskType, context, framework);
      
      const response = await window.AIConfig.generateLocal(prompt, framework);
      
      return {
        text: response || this.getOfflineFallback(taskType, context),
        memorize: this.extractMemory(response, context)
      };
    } catch (error) {
      console.warn("[AI-DM] Local model failed:", error.message);
      return this.callOfflineMode(taskType, context);
    }
  },

  /**
   * Call Claude API
   */
  async callClaude(taskType, context) {
    try {
      const framework = this.getFramework(taskType);
      const prompt = this.buildPrompt(taskType, context, framework);
      
      const response = await window.AIConfig.generate(prompt, taskType);
      
      return {
        text: response || this.getOfflineFallback(taskType, context),
        memorize: this.extractMemory(response, context)
      };
    } catch (error) {
      console.warn("[AI-DM] AI generation failed:", error.message);
      return this.callOfflineMode(taskType, context);
    }
  },

  /**
   * Offline fallback (dice + templates)
   */
  async callOfflineMode(taskType, context) {
    console.log("[AI-DM] Using offline mode for:", taskType);
    return {
      text: "Offline response",
      memorize: null
    };
  },

  // ============================================================
  // [CONNECTIVITY_QUEST] - Hidden API setup as first quest
  // ============================================================

  /**
   * First terminal interaction becomes setup quest
   */
  getConnectivityQuest() {
    return {
      id: "dial_out",
      name: "DIAL OUT",
      description: "Initialize secure channel to cloud backend",
      steps: [
        {
          id: "detect",
          text: "Scanning for local quantum tunnel...",
          action: "auto_detect_local"
        },
        {
          id: "api_setup",
          text: "Establish cloud backend connection",
          action: "api_setup_prompt"
        },
        {
          id: "test",
          text: "Verify connection integrity",
          action: "test_connection"
        }
      ],
      rewards: {
        unlockedFeatures: ["expanded_content", "cloud_quests"],
        message: "Cloud backend unlocked. Expanded content available."
      }
    };
  },

  // ============================================================
  // [EXPORTS] - Verify initialization
  // ============================================================

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      provider: this.state.activeProvider,
      localModelFound: this.state.localModelFound,
      npcCount: Object.keys(this.state.npcMemories).length,
      totalEvents: this.state.eventLog.length,
      currentSession: this.state.currentSession
    };
  },

  // ============================================================
  // [CRYSTAL_BALL_API] - Wiring for CastConsoleUI
  // ============================================================

  /**
   * Handle Crystal Ball queries; ensures system is booted, then routes to AI DM.
   * @param {string} question - Player freeform text
   * @param {function} onResult - Callback with DM response (optional)
   * @returns {Promise<string>} response text
   */
  async consultDM(question, onResult) {
    try {
      if (!this.state.initialized) {
        await this.initialize();
      }

      const result = await this.callAIDM("oracle_query", { question });
      const text = result?.text || "The oracle hums quietly, but offers no words.";

      if (typeof onResult === "function") {
        onResult(text);
      }

      return text;
    } catch (err) {
      console.warn("[AI-DM] consultDM failed:", err.message);
      const fallback = "The connection flickers. The DM is unreachable right now.";
      if (typeof onResult === "function") onResult(fallback);
      return fallback;
    }
  }
};

// ============================================================
// [INIT] - Bootstrap
// ============================================================
console.log("[ai-dm-integration.js] System loaded");
console.log("[AI-DM] Multi-agent coordinator ready");
console.log("[AI-DM] Call: AIDMIntegration.initialize() to boot");
