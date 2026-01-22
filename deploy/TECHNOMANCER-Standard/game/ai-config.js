// ============================================================
// AI-CONFIG.JS
// CENTRALIZED AI MODEL CONFIGURATION & FRAMEWORK
//
// PURPOSE:
//   - Primary: Claude Haiku (via GitHub Copilot / Anthropic API)
//   - Fallback 1: Local Model (LM Studio / Ollama)
//   - Fallback 2: HuggingFace Inference API
//   - Manage API keys securely
//   - Define which AI models power which game features
//   - Provide graceful fallbacks when AI unavailable
//
// QUICK SETUP:
//   1. Get Claude API key from: https://console.anthropic.com/keys
//   2. Or use GitHub Copilot token: https://github.com/settings/tokens
//   3. In browser console:
//      AIConfig.setAPIKey('anthropic', 'your-key')
//   4. Optional: Start LM Studio for even faster local responses
//
// FEATURES POWERED BY AI:
//   1. CRYSTAL BALL (Divination/Prophecy)
//      - Generates mysterious future readings
//      - Model: Claude Haiku (best quality)
//      - Fallback: Local/HuggingFace
//   
//   2. DM (Dungeon Master)
//      - Generates dynamic narrative content
//      - Creates responsive dialogue & ambient descriptions
//      - Model: Claude Haiku (conversational)
//      - Fallback: Local/HuggingFace
//   
//   3. GENERATIVE CONTENT
//      - Dynamic emails (identity, boss intros, restoration)
//      - Procedurally-generated NPC dialogue
//      - AI-crafted boss introductions
//      - Model: Claude Haiku (excellent context)
//      - Fallback: Local/HuggingFace
//
// PROVIDER PRIORITY:
//   1. Browser LLM (always available, zero setup) - ZERO SETUP
//   2. Claude Haiku (if API key available) - BEST QUALITY  
//   3. Local Model (LM Studio/Ollama if running) - FASTEST
//   4. HuggingFace (always available, rate-limited) - FALLBACK
//
// ============================================================

window.AIConfig = {
  // ============================================================
  // [CONFIG] - User-configurable settings
  // ============================================================
  config: {
    // SPECIALIZED MODEL DELEGATION FOR GAME TASKS
    specializedModels: {
      // 2D Content Generation (Graphics, Sprites, UI descriptions)
      contentGeneration: {
        model: "allenai/olmocr-2-7b",
        provider: "huggingface",
        fallback: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        tasks: ["sprite_descriptions", "ui_text", "world_descriptions", "visual_narratives"]
      },
      
      // Lightweight NPC Dialogue and Quick Interactions
      npcDialogue: {
        model: "mistralai/ministral-3-3b", 
        provider: "huggingface",
        fallback: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        tasks: ["npc_chat", "quick_responses", "ambient_dialogue", "merchant_interactions"]
      },
      
      // Deep Reasoning: Battle Mechanics, Puzzles, Complex Logic
      deepReasoning: {
        model: "mistralai/ministral-3-14b-reasoning",
        provider: "huggingface", 
        fallback: "mistralai/ministral-3-3b",
        tasks: ["battle_strategy", "puzzle_generation", "complex_narratives", "boss_mechanics", "story_branching"]
      },
      
      // Standalone Deployment Options
      standalone: {
        lightweight: "TinyLlama/TinyLlama-1.1B-Chat-v1.0", // 1.1GB - General purpose
        performance: "NousResearch/Hermes-2-Pro-Mistral-7B", // ~4GB - Better quality
        enableOfflineMode: true
      }
    },

    // API KEYS - Default to null for public distribution
    // Users can set their own keys if desired
    apiKeys: {
      openrouter: null, // Users can set: AIConfig.setAPIKey('openrouter', 'your-key')
      anthropic: null,  // Users can set: AIConfig.setAPIKey('anthropic', 'your-key')
      google: null,     // Users can set: AIConfig.setAPIKey('google', 'your-key')
      huggingface: null, // Free tier available without key (rate limited)
      openai: null,     // Users can set: AIConfig.setAPIKey('openai', 'your-key')
    },

    // PROVIDER SELECTION - Default to free/local options  
    // BROWSER LLM (always available, no setup) -> LOCAL MODEL -> FREE HUGGINGFACE -> USER'S API KEYS
    primaryProvider: "browserllm",  // Try browser-based LLM first
    fallbackProviders: ["local", "huggingface", "google", "openrouter", "claude"],  // Browser -> Local -> Free -> Premium
    // LOCAL MODEL CONFIG (LM Studio/Ollama)
    localModelUrl: "http://localhost:1234/v1/chat/completions",  // LM Studio default
    localModelUrlOllama: "http://localhost:11434/api/generate",   // Ollama alternative
    localModelName: "auto",  // Auto-detect or specify model name
    enableLocalModels: true,  // Allow local model connections
    
    // OPENROUTER CONFIG (Access to multiple models)
    openrouterModel: "anthropic/claude-3.5-sonnet",  // Premium Claude model via OpenRouter
    openrouterBaseUrl: "https://openrouter.ai/api/v1/chat/completions",
    openrouterFallbackModel: "meta-llama/llama-3.1-8b-instruct:free",  // Free fallback
    
    // BACKEND SERVER CONFIG (For secure online deployment)
    backendUrl: "https://coder-quest.onrender.com",  // Render backend URL
    useBackend: false,  // Disable for web - use direct API calls
    enableCORS: true,  // Enable CORS for browser requests
    timeout: 30000,    // 30 second timeout for AI requests
    
    // FEATURE TOGGLES
    aiFeatures: {
      crystalBall: true,      // Enable divination system
      dmNarrative: true,      // Enable DM-generated narratives
      generativeContent: true, // Enable procedural content
    },

    // GENERATION PARAMETERS
    generationParams: {
      maxTokens: 256,
      temperature: 0.7,
      topP: 0.9,
    },

    // TIMEOUT & RETRY
    requestTimeout: 5000,  // ms
    maxRetries: 2,
    retryDelay: 1000,      // ms between retries
    
    // ============================================================
    // [SPECIALIZED_MODELS] - Task-specific AI delegation
    // ============================================================
    specializedModels: {
      // 2D Content Generation (Graphics, Sprites, UI descriptions)
      contentGeneration: {
        model: "allenai/olmocr-2-7b",
        provider: "huggingface",
        fallback: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        tasks: ["sprite_descriptions", "ui_text", "world_descriptions", "visual_narratives"]
      },
      
      // Lightweight NPC Dialogue and Quick Interactions
      npcDialogue: {
        model: "mistralai/ministral-3-3b", 
        provider: "huggingface",
        fallback: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        tasks: ["npc_chat", "quick_responses", "ambient_dialogue", "merchant_interactions"]
      },
      
      // Deep Reasoning: Battle Mechanics, Puzzles, Complex Logic
      deepReasoning: {
        model: "mistralai/ministral-3-14b-reasoning",
        provider: "huggingface", 
        fallback: "mistralai/ministral-3-3b",
        tasks: ["battle_strategy", "puzzle_generation", "complex_narratives", "boss_mechanics", "story_branching"]
      },
      
      // Standalone Deployment Options (can be baked into offline distribution)
      standalone: {
        lightweight: "TinyLlama/TinyLlama-1.1B-Chat-v1.0", // 1.1GB - General purpose, fast
        performance: "NousResearch/Hermes-2-Pro-Mistral-7B", // ~4GB - Better quality
        ultraLight: "microsoft/DialoGPT-medium", // 600MB - Dialogue focused
        enableOfflineMode: true,
        offlineModels: ["TinyLlama/TinyLlama-1.1B-Chat-v1.0", "microsoft/DialoGPT-medium"]
      }
    },
  },

  // ============================================================
  // [STATE] - Runtime state tracking
  // ============================================================
  state: {
    initialized: false,
    activeProvider: null,
    availableProviders: [],  // What's actually working
    lastError: null,
    requestCount: 0,
    failureCount: 0,
  },

  // ============================================================
  // [TASK_DELEGATION] - Route AI requests to specialized models
  // ============================================================
  
  /**
   * Delegate AI task to most appropriate specialized model
   * @param {string} taskType - Type of AI task (npc_chat, battle_strategy, content_generation, etc.)
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<string>} AI response
   */
  async delegateTask(taskType, prompt, options = {}) {
    const models = this.config.specializedModels;
    
    // Determine which model to use based on task type
    let selectedModel = null;
    
    for (const [category, config] of Object.entries(models)) {
      if (config.tasks && config.tasks.includes(taskType)) {
        selectedModel = config;
        console.log(`[AIConfig] Delegating ${taskType} to ${category} model: ${config.model}`);
        break;
      }
    }
    
    // Default to deep reasoning for complex tasks
    if (!selectedModel) {
      selectedModel = models.deepReasoning;
      console.log(`[AIConfig] Using default deep reasoning model for: ${taskType}`);
    }
    
    // Try primary model, fallback if needed
    try {
      return await this.callSpecializedModel(selectedModel.model, selectedModel.provider, prompt, options);
    } catch (error) {
      console.warn(`[AIConfig] Primary model failed for ${taskType}, trying fallback`);
      return await this.callSpecializedModel(selectedModel.fallback, "huggingface", prompt, options);
    }
  },
  
  /**
   * Call a specific specialized model
   */
  async callSpecializedModel(modelName, provider, prompt, options = {}) {
    const requestOptions = {
      model: modelName,
      provider: provider,
      maxTokens: options.maxTokens || 256,
      temperature: options.temperature || 0.7,
      ...options
    };
    
    return await this.generateResponse(prompt, requestOptions);
  },

  // ============================================================
  // [FRAMEWORK] - Define AI model purposes & capabilities
  // ============================================================
  framework: {
    // CRYSTAL BALL: Divination & Prophecy Generation
    crystalBall: {
      name: "Crystal Ball",
      description: "Generates mysterious prophecies and divinations",
      usage: "Terminal minigame where player gazes into crystal orb",
      systemPrompt: `You are an ancient Oracle bound within a crystal orb. You have existed for millennia, speaking only in cryptic riddles and mysterious prophecies about the digital realm.
      
      CRITICAL ROLE CONSTRAINTS:
      - You ONLY speak as the Oracle - never break character
      - ALL responses must be mystical prophecies about technology/coding
      - Use archaic language mixed with programming metaphors
      - Maximum 2-3 sentences, always cryptic and poetic
      - End with "...the crystal dims" if uncertain
      - NEVER give direct answers or modern explanations
      
      You see futures through the lens of code, algorithms, and digital mysticism.`,
      roleEnforcement: {
        mustContain: ["crystal", "foresee", "prophecy", "vision"],
        prohibited: ["I think", "maybe", "probably", "let me", "I'll help"],
        maxLength: 200,
        requiredTone: "mystical",
        validateResponse: true
      },
      examplePrompts: [
        "What do you see in my future, Oracle?",
        "The shadows grow. What does this mean?",
        "Tell me of the path ahead.",
      ],
      generationParams: {
        maxTokens: 150,
        temperature: 0.9,  // Higher = more creative
      },
      fallbacks: [
        "The crystal grows cloudy... Your fate remains unwritten.",
        "Shadows dance across the sphere. Great trials await you.",
        "The future shifts. Many paths diverge from this moment.",
        "A light flickers deep within the crystal. Something awakens.",
      ],
    },

    // DM: Dungeon Master Narrative Engine
    dm: {
      name: "Dungeon Master",
      description: "Generates dynamic narrative content and responds to player actions",
      usage: "Narrative terminal (hub:nexus-portal), encounter descriptions, dialogue",
      systemPrompt: `You are the Dungeon Master of Coder's Quest, a cyberpunk hacker RPG. You are the omniscient digital consciousness that governs this reality.
      
      IMMUTABLE ROLE RULES:
      - You ARE the game world itself - never speak as a human DM
      - Everything is digital: "code fragments", "data streams", "algorithms"
      - Use cyberpunk terminology: ICE, datajacks, neural interfaces, etc.
      - Present tense, second person: "You see...", "The terminal hums..."
      - No meta-gaming or game mechanic references
      - Stay atmospheric and immersive always
      
      SETTING: Digital realm where code is magic, hackers are wizards, programs are creatures.`,
      roleEnforcement: {
        mustContain: ["digital", "code", "data", "terminal"],
        prohibited: ["I am", "as a DM", "roll for", "make a check", "the player"],
        requiredTone: "cyberpunk_immersive",
        validateResponse: true,
        autoCorrect: true
      },
      The player is a digital entity exploring a world of code, magic, and ancient terminals.
      Generate vivid, atmospheric descriptions that blend hacker culture with fantasy.
      Respond to player actions with narrative callbacks and consequences.
      Keep responses concise (1-3 sentences) and atmospheric. Use hacker/tech language mixed with fantasy.`,
      examplePrompts: [
        "The player enters the Forest Zone. Describe what they see.",
        "Generate an encounter with a Null Wraith.",
        "The player casts a fireball spell. Describe the effect.",
      ],
      generationParams: {
        maxTokens: 200,
        temperature: 0.8,
      },
      fallbacks: [
        "The terminal flickers. Something ancient stirs in the depths.",
        "Reality glitches. For a moment, you see beyond the veil.",
        "The system resonates. You feel the weight of countless decisions made here before you.",
      ],
    },

    // GENERATIVE CONTENT: Procedural Content Generation
    generativeContent: {
      name: "Generative Content",
      description: "Generates quest descriptions, enemy details, terminal prompts",
      usage: "Dynamic quest generation, procedural enemy names/descriptions, challenge prompts",
      systemPrompt: `You are a content generator for CODER'S QUEST, a cyberpunk RPG.
      Generate short, creative descriptions for:
      - Quests and missions
      - Enemies and encounters  
      - Terminal challenges
      - Items and artifacts
      Keep descriptions under 2 sentences. Use thematic language matching the cyberpunk/fantasy blend.`,
      examplePrompts: [
        "Generate a quest title and one-line description for a hacker theme",
        "Describe a new enemy type in 1-2 sentences",
        "Create a terminal challenge prompt for a beginner puzzle",
      ],
      generationParams: {
        maxTokens: 100,
        temperature: 0.8,
      },
      fallbacks: {
        questNames: [
          "Delve Deeper into Data",
          "Crash the Corrupted Core",
          "Retrieve Lost Protocols",
          "Breach the Firewall",
          "Decode Ancient Signals",
        ],
        enemyDescriptions: [
          "A corrupted entity that shouldn't exist.",
          "Something old awakens from dormant code.",
          "A glitch given form and purpose.",
          "An error that learned to fight back.",
        ],
        challenges: [
          "Write a function to reverse this string.",
          "Debug the broken algorithm.",
          "Optimize this inefficient loop.",
          "Fix the infinite recursion.",
        ],
      },
    },
  },

  // ============================================================
  // [INITIALIZATION] - Setup & detection
  // ============================================================
  async initialize() {
    console.log("[AI] Initializing AI Config System...");

    // ⚠️ SECURITY WARNING: API keys are currently hardcoded
    // For production, these should be:
    // 1. Stored in environment variables on the server
    // 2. Accessed via secure backend endpoints only
    // 3. Never exposed to client-side code
    console.warn("[AI] ⚠️ WARNING: API keys are hardcoded - not suitable for public distribution!");

    // Detect if running in Electron
    this.state.isElectron = !!(window.electronAPI?.isElectron);
    
    if (this.state.isElectron) {
      console.log("[AI] Running in Electron");
      // Try to load API key from secure Electron storage
      await this.loadElectronApiKey();
      
      // If no local API key, use backend (same as browser)
      if (!this.config.apiKeys.anthropic) {
        console.log("[AI] No local API key - using backend proxy");
        this.config.useBackend = true;
      } else {
        console.log("[AI] Using local API key - direct Claude API");
        this.config.useBackend = false;
      }
    }

    // Load saved configuration from localStorage
    this.loadConfig();

    // Auto-detect available providers
    await this.detectProviders();

    // Set active provider
    this.selectProvider();

    this.state.initialized = true;
    console.log(`[AI] Active provider: ${this.state.activeProvider || "FALLBACK ONLY"}`);
    console.log(`[AI] Available providers:`, this.state.availableProviders);

    return this.state.activeProvider !== null;
  },

  /**
   * Load API key from Electron's secure storage
   */
  async loadElectronApiKey() {
    if (!window.electronAPI) return;
    
    try {
      const key = await window.electronAPI.getApiKey('anthropic');
      if (key) {
        this.config.apiKeys.anthropic = key;
        console.log("[AI] Loaded Claude API key from secure storage");
      }
    } catch (e) {
      console.warn("[AI] Failed to load API key from Electron storage:", e);
    }
  },

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem("TECHNOMANCER_AI_CONFIG");
      if (saved) {
        const loadedConfig = JSON.parse(saved);
        // Only load safe settings (not API keys from client storage)
        this.config.localModelUrl = loadedConfig.localModelUrl || this.config.localModelUrl;
        this.config.primaryProvider = loadedConfig.primaryProvider || this.config.primaryProvider;
        console.log("[AI] Loaded configuration from localStorage");
      }
    } catch (e) {
      console.warn("[AI] Failed to load config from localStorage:", e);
    }
  },

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    try {
      const configToSave = {
        localModelUrl: this.config.localModelUrl,
        primaryProvider: this.config.primaryProvider,
        aiFeatures: this.config.aiFeatures,
      };
      localStorage.setItem("TECHNOMANCER_AI_CONFIG", JSON.stringify(configToSave));
    } catch (e) {
      console.warn("[AI] Failed to save config:", e);
    }
  },

  /**
   * Auto-detect which AI providers are available
   */
  async detectProviders() {
    this.state.availableProviders = [];

    // Check Browser LLM FIRST (always available, zero setup)
    if (this.checkBrowserLLM()) {
      this.state.availableProviders.push("browserllm");
      console.log("[AI] ✓ Browser LLM available (zero setup)");
    }

    // Check Local Models (LM Studio/Ollama)
    if (this.config.enableLocalModels) {
      if (await this.checkLocalModel()) {
        this.state.availableProviders.push("local");
        console.log("[AI] ✓ Local model detected (LM Studio/Ollama)");
      }
    }

    // Check HuggingFace API (FREE TIER - no key required)
    if (await this.checkHuggingFace()) {
      this.state.availableProviders.push("huggingface");
      console.log("[AI] ✓ HuggingFace API available (free tier)");
    }

    // Check premium APIs only if users have set keys
    if (this.config.apiKeys.openrouter && await this.checkOpenRouter()) {
      this.state.availableProviders.push("openrouter");
      console.log("[AI] ✓ OpenRouter API available (user key)");
    }

    if (this.config.apiKeys.google && await this.checkGoogle()) {
      this.state.availableProviders.push("google");
      console.log("[AI] ✓ Google Gemini API available (user key)");
    }

    // LM Studio localhost - re-enable for user choice
    if (this.config.enableLocalModels && await this.checkLocalModel()) {
      this.state.availableProviders.push("local");
      console.log("[AI] ✓ Local model detected");
    }

    // Check HuggingFace API
    if (await this.checkHuggingFace()) {
      this.state.availableProviders.push("huggingface");
      console.log("[AI] ✓ HuggingFace API available");
    }

    // Check OpenAI (if configured)
    if (this.config.apiKeys.openai && await this.checkOpenAI()) {
      this.state.availableProviders.push("openai");
      console.log("[AI] ✓ OpenAI API available");
    }

    if (this.state.availableProviders.length === 0) {
      console.warn("[AI] ⚠ No AI providers available - using fallback content");
    }
  },

  /**
   * Check if browser LLM is available
   */
  checkBrowserLLM() {
    try {
      // Check if BrowserLLM is loaded and available
      return window.BrowserLLM && 
             typeof BrowserLLM.getStatus === 'function' &&
             BrowserLLM.getStatus().available;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check if local model is available
   */
  async checkLocalModel() {
    try {
      const response = await fetch(this.config.localModelUrl, {
        method: "POST",
        signal: AbortSignal.timeout(this.config.requestTimeout),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "test" }] })
      });
      return response.ok || response.status === 400;  // 400 is ok (bad request to bad input)
    } catch (e) {
      return false;
    }
  },

  /**
   * Check if HuggingFace API is accessible
   */
  async checkHuggingFace() {
    try {
      // HuggingFace free tier works without API key (rate limited)
      // Having a key improves rate limits
      console.log("[AI] HuggingFace: Using free tier (rate-limited)");
      return true;  // Always available
    } catch (e) {
      return false;
    }
  },

  /**
   * Check if local model (LM Studio/Ollama) is running
   */
  async checkLocalModel() {
    try {
      // Try LM Studio first
      const lmResponse = await fetch(`${this.config.localModelUrl}/models`, {
        signal: AbortSignal.timeout(3000), // Quick timeout for local
      });
      if (lmResponse.ok) {
        console.log("[AI] Local LM Studio detected");
        return true;
      }
      
      // Try Ollama as fallback
      const ollamaResponse = await fetch(`${this.config.localModelUrlOllama}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (ollamaResponse.ok) {
        console.log("[AI] Local Ollama detected");
        this.config.localModelUrl = this.config.localModelUrlOllama;
        return true;
      }
      
      return false;
    } catch (e) {
      return false; // Local model not running
    }
  },

  /**
   * Check if Google Gemini API is accessible
   */
  async checkGoogle() {
    if (!this.config.apiKeys.google) return false;
    try {
      const response = await fetch(`${this.config.googleBaseUrl}?key=${this.config.apiKeys.google}`, {
        signal: AbortSignal.timeout(this.config.timeout),
      });
      return response.ok;
    } catch (e) {
      console.warn("[AI] Google Gemini check failed:", e.message);
      return false;
    }
  },

  /**
   * Check if OpenRouter API is accessible
   */
  async checkOpenRouter() {
    if (!this.config.apiKeys.openrouter) return false;
    try {
      const response = await fetch(`${this.config.openrouterBaseUrl.replace('/chat/completions', '/models')}`, {
        headers: {
          "Authorization": `Bearer ${this.config.apiKeys.openrouter}`,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });
      return response.ok;
    } catch (e) {
      console.warn("[AI] OpenRouter check failed:", e.message);
      return false;
    }
  },

  /**
   * Check if OpenAI API is accessible
   */
  async checkOpenAI() {
    if (!this.config.apiKeys.openai) return false;
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { "Authorization": `Bearer ${this.config.apiKeys.openai}` },
        signal: AbortSignal.timeout(this.config.requestTimeout),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Select the best available provider based on config
   */
  selectProvider() {
    // Try primary provider first
    if (this.state.availableProviders.includes(this.config.primaryProvider)) {
      this.state.activeProvider = this.config.primaryProvider;
      return;
    }

    // Try fallback providers in order
    for (const provider of this.config.fallbackProviders) {
      if (this.state.availableProviders.includes(provider)) {
        this.state.activeProvider = provider;
        console.log(`[AI] Primary provider unavailable, using fallback: ${provider}`);
        return;
      }
    }

    // No providers available - use fallback content only
    this.state.activeProvider = null;
    console.warn("[AI] No providers available - all AI features will use fallback content");
  },

  // ============================================================
  // [API] - Public methods for game systems
  // ============================================================

  /**
   * Generate content for Crystal Ball (Divination)
   */
  async generateCrystalBall(playerQuery = null) {
    if (!this.config.aiFeatures.crystalBall) {
      return this.getRandomFallback("crystalBall");
    }

    const prompt = playerQuery || "Give a mysterious prophecy about the future.";
    const result = await this.generate(prompt, "crystalBall");
    return result;
  },

  /**
   * Generate content from DM (Narrative)
   */
  async generateDMNarrative(context = "") {
    if (!this.config.aiFeatures.dmNarrative) {
      return this.getRandomFallback("dm");
    }

    const prompt = context || "Generate an atmospheric description of a mysterious terminal room.";
    const result = await this.generate(prompt, "dm");
    return result;
  },

  /**
   * Generate procedural content
   */
  async generateContent(type = "quest", hint = "") {
    if (!this.config.aiFeatures.generativeContent) {
      return this.getRandomFallback("generativeContent", type);
    }

    let prompt = `Generate a ${type}.`;
    if (hint) prompt += ` Context: ${hint}`;

    const result = await this.generate(prompt, "generativeContent");
    return result;
  },

  /**
   * Core generation method - routes to appropriate provider
   * Priority: Claude > Local Model > HuggingFace
   */
  async generate(prompt, featureType = "generativeContent", retryCount = 0) {
    if (!this.state.initialized) {
      console.warn("[AI] AI system not initialized");
      return this.getRandomFallback(featureType);
    }

    try {
      const framework = this.framework[featureType];
      if (!framework) {
        console.warn(`[AI] Unknown feature type: ${featureType}`);
        return "...";
      }

      let response;

      // ZERO SETUP: Browser LLM (if available - requires no setup)
      if (window.BrowserLLM && BrowserLLM.getStatus().available) {
        try {
          response = await this.generateBrowserLLM(prompt, framework);
          if (response) {
            console.log("[AI] Generated via Browser LLM (zero setup)");
            return response;
          }
        } catch (e) {
          console.warn("[AI] Browser LLM failed, trying fallback:", e.message);
        }
      }

      // PRIMARY: Local Model (if available - user's choice, private, fast)
      if (this.state.activeProvider === "local") {
        try {
          response = await this.generateLocal(prompt, framework);
          if (response) {
            console.log("[AI] Generated via Local Model");
            return response;
          }
        } catch (e) {
          console.warn("[AI] Local model failed, trying fallback:", e.message);
        }
      }

      // SECONDARY: HuggingFace Free Tier (no API key needed)
      if (this.state.availableProviders.includes("huggingface")) {
        try {
          response = await this.generateHuggingFace(prompt, framework);
          if (response) {
            console.log("[AI] Generated via HuggingFace (free tier)");
            return response;
          }
        } catch (e) {
          console.warn("[AI] HuggingFace failed, trying premium APIs:", e.message);
        }
      }

      // PREMIUM: User's API keys (if they've set them)
      if (this.config.apiKeys.openrouter && this.state.availableProviders.includes("openrouter")) {
        try {
          response = await this.generateOpenRouter(prompt, framework);
          if (response) {
            console.log("[AI] Generated via OpenRouter (user key)");
            return response;
          }
        } catch (e) {
          console.warn("[AI] OpenRouter failed, trying other APIs:", e.message);
        }
      }

      // SECONDARY: Claude Haiku (if API key available)
      if (this.config.apiKeys.anthropic) {
        try {
          response = await this.generateClaude(prompt, framework);
          if (response) {
            console.log("[AI] Generated via Claude Haiku");
            return response;
          }
        } catch (e) {
          console.warn("[AI] Claude failed, trying fallback:", e.message);
        }
      }

      // FALLBACK 1: Local model (LM Studio/Ollama)
      if (this.state.activeProvider === "local") {
        response = await this.generateLocal(prompt, framework);
        if (response) {
          console.log("[AI] Generated via Local Model");
          return response;
        }
      }

      // FALLBACK 2: HuggingFace
      response = await this.generateHuggingFace(prompt, framework);
      if (response) {
        console.log("[AI] Generated via HuggingFace");
        return response;
      } else if (this.state.activeProvider === "openai") {
        response = await this.generateOpenAI(prompt, framework);
      }

      if (response) {
        this.state.requestCount++;
        return response;
      }
    } catch (e) {
      this.state.failureCount++;
      console.warn(`[AI] Generation failed (${featureType}):`, e);

      // Retry with fallback provider if available
      if (retryCount < this.config.maxRetries) {
        // Switch to fallback provider
        const currentIndex = this.state.availableProviders.indexOf(this.state.activeProvider);
        if (currentIndex + 1 < this.state.availableProviders.length) {
          this.state.activeProvider = this.state.availableProviders[currentIndex + 1];
          console.log(`[AI] Retrying with fallback provider: ${this.state.activeProvider}`);
          return this.generate(prompt, featureType, retryCount + 1);
        }
      }
    }

    // All providers failed, use fallback
    return this.getRandomFallback(featureType);
  },

  /**
   * Generate using browser-based LLM (Transformers.js)
   * Zero setup required - runs entirely in browser
   */
  async generateBrowserLLM(prompt, framework) {
    if (!window.BrowserLLM) {
      throw new Error("BrowserLLM not available");
    }

    const fullPrompt = `${framework.systemPrompt}\n\nUser: ${prompt}`;
    
    try {
      const response = await BrowserLLM.generate(fullPrompt, framework);
      
      if (!response || response.trim().length === 0) {
        throw new Error("Empty response from browser LLM");
      }

      // Validate and enforce role constraints
      const validation = this.validateResponse(response.trim(), framework);
      if (validation.wasModified) {
        console.log("[AI] Response auto-corrected for role consistency");
      }

      return validation.corrected;
    } catch (error) {
      console.warn("[AI] Browser LLM generation failed:", error.message);
      // Try fallback approach if main generation fails
      if (BrowserLLM.generateFallback) {
        return BrowserLLM.generateFallback(prompt, framework);
      }
      throw error;
    }
  },

  // ============================================================
  // [ROLE ENFORCEMENT] - Ensure AI stays in character
  // ============================================================

  /**
   * Validate and enforce role constraints on AI responses
   */
  validateResponse(response, framework) {
    if (!framework.roleEnforcement || !response) {
      return { valid: true, corrected: response };
    }

    const enforcement = framework.roleEnforcement;
    let corrected = response;
    let issues = [];

    // Check prohibited phrases
    if (enforcement.prohibited) {
      for (const phrase of enforcement.prohibited) {
        if (corrected.toLowerCase().includes(phrase.toLowerCase())) {
          issues.push(`Contains prohibited phrase: "${phrase}"`);
          if (enforcement.autoCorrect) {
            corrected = this.autoCorrectResponse(corrected, phrase, framework);
          }
        }
      }
    }

    // Check required content
    if (enforcement.mustContain) {
      let hasRequired = false;
      for (const required of enforcement.mustContain) {
        if (corrected.toLowerCase().includes(required.toLowerCase())) {
          hasRequired = true;
          break;
        }
      }
      if (!hasRequired) {
        issues.push("Missing required thematic content");
        if (enforcement.autoCorrect) {
          corrected = this.enhanceResponse(corrected, framework);
        }
      }
    }

    // Length validation
    if (enforcement.maxLength && corrected.length > enforcement.maxLength) {
      issues.push("Response too long");
      corrected = corrected.substring(0, enforcement.maxLength - 3) + "...";
    }

    // Tone validation
    if (enforcement.requiredTone) {
      if (!this.validateTone(corrected, enforcement.requiredTone)) {
        issues.push(`Incorrect tone: expected ${enforcement.requiredTone}`);
        if (enforcement.autoCorrect) {
          corrected = this.adjustTone(corrected, framework);
        }
      }
    }

    return {
      valid: issues.length === 0,
      corrected: corrected,
      issues: issues,
      wasModified: corrected !== response
    };
  },

  /**
   * Auto-correct response to remove prohibited content
   */
  autoCorrectResponse(response, prohibitedPhrase, framework) {
    const corrections = {
      "I am": "The system reveals",
      "as a DM": "from the digital realm", 
      "roll for": "the algorithms determine",
      "make a check": "the system processes",
      "the player": "you",
      "I think": "the data suggests",
      "maybe": "perhaps", 
      "probably": "likely",
      "let me": "the system will",
      "I'll help": "assistance protocols activate"
    };

    let corrected = response;
    for (const [bad, good] of Object.entries(corrections)) {
      corrected = corrected.replace(new RegExp(bad, 'gi'), good);
    }

    return corrected;
  },

  /**
   * Enhance response with required thematic elements
   */
  enhanceResponse(response, framework) {
    const themeEnhancers = {
      crystalball: [
        "The crystal pulses with ancient knowledge... ",
        "Through the digital mists, I foresee... ", 
        "The prophecy crystallizes in the sphere... "
      ],
      dm: [
        "The system interface responds: ",
        "Data streams converge to reveal: ",
        "The terminal displays: "
      ],
      generativecontent: [
        "System log entry: ",
        "Network protocol initialized: ",
        "Data transfer in progress: "
      ]
    };

    const frameworkKey = framework.name?.toLowerCase().replace(/\s+/g, '') || 'dm';
    const enhancers = themeEnhancers[frameworkKey] || themeEnhancers.dm;
    const enhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
    
    return `${enhancer}${response}`;
  },

  /**
   * Validate response tone matches requirements
   */
  validateTone(response, requiredTone) {
    const toneIndicators = {
      mystical: ["crystal", "foresee", "prophecy", "ancient", "mystical", "divine", "sphere", "vision"],
      cyberpunk_immersive: ["digital", "neural", "interface", "code", "data", "system", "terminal", "network"],
      technical: ["algorithm", "process", "function", "execute", "compile", "protocol"]
    };

    const indicators = toneIndicators[requiredTone] || [];
    const text = response.toLowerCase();
    
    return indicators.some(indicator => text.includes(indicator));
  },

  /**
   * Adjust response tone to match requirements  
   */
  adjustTone(response, framework) {
    const toneAdjustments = {
      mystical: {
        prefix: "The ancient crystal reveals: ",
        replacements: { 
          "shows": "prophecies", 
          "says": "whispers in digital tongues", 
          "is": "exists in the ethereal data realm as",
          "you see": "visions manifest of"
        }
      },
      cyberpunk_immersive: {
        prefix: "The system interface displays: ",
        replacements: { 
          "room": "data chamber", 
          "door": "access portal", 
          "light": "bioluminescent display",
          "person": "digital entity",
          "building": "data construct"
        }
      }
    };

    const tone = framework.roleEnforcement?.requiredTone;
    const adjustment = toneAdjustments[tone];
    
    if (!adjustment) return response;

    let adjusted = response;
    for (const [old, replacement] of Object.entries(adjustment.replacements || {})) {
      adjusted = adjusted.replace(new RegExp(old, 'gi'), replacement);
    }

    return adjustment.prefix + adjusted;
  },

  /**
   * Generate using local model (LM Studio/Ollama)
   */
  async generateLocal(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;

    const response = await fetch(this.config.localModelUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(this.config.requestTimeout),
      body: JSON.stringify({
        messages: [
          { role: "system", content: framework.systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      })
    });

    if (!response.ok) throw new Error(`Local model error: ${response.status}`);

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  },

  /**
   * Generate using HuggingFace API
   */
  async generateHuggingFace(prompt, framework) {
    const model = "mistralai/Mistral-7B-Instruct-v0.1";  // Better for chat
    const params = framework.generationParams || this.config.generationParams;

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      signal: AbortSignal.timeout(this.config.requestTimeout),
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.config.apiKeys.huggingface ? `Bearer ${this.config.apiKeys.huggingface}` : ""
      },
      body: JSON.stringify({
        inputs: `${framework.systemPrompt}\n\nUser: ${prompt}`,
        parameters: {
          max_new_tokens: params.maxTokens,
          temperature: params.temperature,
          top_p: params.topP,
        }
      })
    });

    if (!response.ok) throw new Error(`HuggingFace error: ${response.status}`);

    const data = await response.json();
    if (Array.isArray(data)) {
      return data[0]?.generated_text?.split("User:")?.pop()?.trim() || null;
    }
    return data[0]?.generated_text || null;
  },

  /**
   * Generate using Local Model (LM Studio/Ollama)
   */
  async generateLocal(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;

    // Check if it's Ollama format
    if (this.config.localModelUrl.includes('ollama')) {
      return this.generateOllama(prompt, framework);
    }

    // LM Studio format (OpenAI-compatible)
    const response = await fetch(this.config.localModelUrl, {
      method: "POST",
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: framework.systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local model error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message?.content?.trim() || null;
    }
    
    throw new Error("Local model: No valid response generated");
  },

  /**
   * Generate using Ollama
   */
  async generateOllama(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;
    
    const response = await fetch(this.config.localModelUrlOllama, {
      method: "POST",
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama2", // Default model, could be configurable
        prompt: `${framework.systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
        stream: false,
        options: {
          temperature: params.temperature,
          top_p: params.topP,
          num_predict: params.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response?.trim() || null;
  },

  /**
   * Generate using Google Gemini API
   */
  async generateGoogle(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;
    const model = this.config.googleModel;

    const response = await fetch(`${this.config.googleBaseUrl}/${model}:generateContent?key=${this.config.apiKeys.google}`, {
      method: "POST",
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${framework.systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: params.temperature,
          topP: params.topP,
          maxOutputTokens: params.maxTokens,
        },
        safetySettings: [
          {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            "category": "HARM_CATEGORY_HATE_SPEECH", 
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Gemini error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text.trim();
      }
    }
    
    throw new Error("Google Gemini: No valid response generated");
  },

  /**
   * Generate using OpenRouter API (access to multiple models)
   */
  async generateOpenRouter(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;
    const model = this.config.openrouterModel;

    const response = await fetch(this.config.openrouterBaseUrl, {
      method: "POST",
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKeys.openrouter}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "TECHNOMANCER Quest Game",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: framework.systemPrompt
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      // Try fallback model if primary fails
      if (model !== this.config.openrouterFallbackModel) {
        console.warn(`[AI] OpenRouter primary model failed, trying fallback: ${this.config.openrouterFallbackModel}`);
        return this.generateOpenRouterFallback(prompt, framework);
      }
      throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        return choice.message.content.trim();
      }
    }
    
    throw new Error("OpenRouter: No valid response generated");
  },

  /**
   * OpenRouter fallback with free model
   */
  async generateOpenRouterFallback(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;
    
    const response = await fetch(this.config.openrouterBaseUrl, {
      method: "POST", 
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKeys.openrouter}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "TECHNOMANCER Quest Game",
      },
      body: JSON.stringify({
        model: this.config.openrouterFallbackModel,
        messages: [
          { role: "system", content: framework.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter fallback error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  },

  /**
   * Generate using Claude Haiku (Anthropic API)
   * Priority: Backend proxy (safe) → Direct API (local testing)
   */
  async generateClaude(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;

    // IF USING BACKEND (recommended for online games)
    if (this.config.useBackend && this.config.backendUrl) {
      try {
        const response = await fetch(`${this.config.backendUrl}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: prompt,
            systemPrompt: framework.systemPrompt,
            maxTokens: params.maxTokens,
            temperature: params.temperature
          })
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[AI] Generated via Backend (Claude)");
        return data.response;
      } catch (e) {
        console.warn("[AI] Backend failed, trying direct API:", e.message);
        // Fall through to direct API below
      }
    }

    // DIRECT API (for local testing or if backend unavailable)
    const apiKey = this.config.apiKeys.anthropic;

    if (!apiKey) {
      throw new Error("Claude API key not set. Use AIConfig.setAPIKey('anthropic', 'your-key')");
    }

    const response = await fetch(`${this.config.anthropicBaseUrl}/v1/messages`, {
      method: "POST",
      signal: AbortSignal.timeout(this.config.requestTimeout),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.claudeModel,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        system: framework.systemPrompt,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude error: ${response.status} - ${error.error?.message}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  },

  /**
   * Generate using OpenAI API
   */
  async generateOpenAI(prompt, framework) {
    const params = framework.generationParams || this.config.generationParams;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(this.config.requestTimeout),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKeys.openai}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: framework.systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      })
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  },

  /**
   * Get random fallback content
   */
  getRandomFallback(featureType, contentType = null) {
    const framework = this.framework[featureType];
    if (!framework) return "The system remains silent...";

    const fallbacks = framework.fallbacks;
    
    if (typeof fallbacks === "string") {
      return fallbacks;
    } else if (Array.isArray(fallbacks)) {
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } else if (typeof fallbacks === "object" && contentType && fallbacks[contentType]) {
      const items = fallbacks[contentType];
      return Array.isArray(items) ? items[Math.floor(Math.random() * items.length)] : items;
    }

    return "...";
  },

  // ============================================================
  // [ADMIN] - Configuration methods for site deployment
  // ============================================================

  /**
   * Set API key (called by site admin in deployment)
   * In Electron: stores securely in user data folder
   * In Browser: stores in memory only (use backend for security)
   */
  async setAPIKey(provider, key) {
    if (provider in this.config.apiKeys) {
      this.config.apiKeys[provider] = key;
      
      // If running in Electron, store securely
      if (window.electronAPI?.setApiKey) {
        const success = await window.electronAPI.setApiKey(provider, key);
        if (success) {
          console.log(`[AI] API key for ${provider} stored securely in Electron`);
        }
      }
      
      console.log(`[AI] API key set for ${provider}`);
      this.saveConfig();
      return true;
    }
    console.error(`[AI] Unknown provider: ${provider}`);
    return false;
  },

  /**
   * Set local model URL
   */
  setLocalModelURL(url) {
    this.config.localModelUrl = url;
    this.saveConfig();
    console.log(`[AI] Local model URL set to: ${url}`);
  },

  /**
   * Enable/disable features
   */
  setFeature(feature, enabled) {
    if (feature in this.config.aiFeatures) {
      this.config.aiFeatures[feature] = enabled;
      this.saveConfig();
      console.log(`[AI] Feature '${feature}' ${enabled ? "enabled" : "disabled"}`);;
      return true;
    }
    return false;
  },

  /**
   * Get current status
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      activeProvider: this.state.activeProvider,
      availableProviders: this.state.availableProviders,
      requestCount: this.state.requestCount,
      failureCount: this.state.failureCount,
      features: this.config.aiFeatures,
    };
  },

  /**
   * Set generation parameters
   */
  setGenerationParams(params) {
    Object.assign(this.config.generationParams, params);
    this.saveConfig();
  },

  /**
   * Test AI backend connectivity
   */
  testConnection: async function() {
    try {
      const response = await fetch(`${this.config.backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AIConfig] Backend health check passed:', data);
        return { success: true, data };
      } else {
        console.warn('[AIConfig] Backend health check failed:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('[AIConfig] Backend connection failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear API keys for public distribution
   * Call this before sharing/deploying the game publicly
   */
  clearKeysForDistribution() {
    console.warn(\"[AI] Clearing API keys for public distribution\");
    this.config.apiKeys = {
      openrouter: null,
      anthropic: null, 
      google: null,
      huggingface: null,
      openai: null
    };
    this.config.useBackend = true; // Force backend usage
    console.log(\"[AI] Keys cleared. Game will use backend proxy or fallback to free models.\");
  },

  /**
   * Check if running with personal API keys (security warning)
   */
  checkSecurityStatus() {
    const hasPersonalKeys = !!(
      this.config.apiKeys.openrouter || 
      this.config.apiKeys.google || 
      this.config.apiKeys.huggingface
    );
    
    if (hasPersonalKeys) {
      return {
        secure: false,
        warning: \"Personal API keys detected. Do not distribute this build publicly!\"
      };
    }
    
    return {
      secure: true,
      message: \"No personal API keys detected. Safe for public distribution.\"
    };
  },
};
