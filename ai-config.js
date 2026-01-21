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
//   1. Claude Haiku (if API key available) - BEST QUALITY
//   2. Local Model (LM Studio/Ollama if running) - FASTEST
//   3. HuggingFace (always available, rate-limited) - FALLBACK
//
// ============================================================

window.AIConfig = {
  // ============================================================
  // [CONFIG] - User-configurable settings
  // ============================================================
  config: {
    // API KEYS - Can be set by site admin in deployment
    apiKeys: {
      anthropic: null,    // Claude Haiku via GitHub Copilot (PRIMARY)
      huggingface: null,  // HuggingFace fallback
      openai: null,       // For future OpenAI integration
    },

    // PROVIDER SELECTION
    // PRIMARY: Claude Haiku (via GitHub Copilot)
    // FALLBACK: HuggingFace only (no localhost LM Studio)
    primaryProvider: "claude",  // "claude", "huggingface"
    fallbackProviders: ["huggingface"],  // Order: cloud only (LM Studio disabled)
    localModelUrl: "http://localhost:1234/v1/chat/completions",  // LM Studio
    // ollamaUrl: "http://localhost:11434/api/generate",  // DISABLED - cloud-only operation
    
    // CLAUDE HAIKU CONFIG (GitHub Copilot API)
    claudeModel: "claude-3-5-haiku-20241022",  // Latest Haiku model
    anthropicBaseUrl: "https://api.anthropic.com",  // Anthropic API endpoint
    
    // BACKEND SERVER CONFIG (For secure online deployment)
    backendUrl: "https://coder-quest.onrender.com",  // Render backend URL
    useBackend: true,  // Use backend proxy for secure API access
    
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
  // [FRAMEWORK] - Define AI model purposes & capabilities
  // ============================================================
  framework: {
    // CRYSTAL BALL: Divination & Prophecy Generation
    crystalBall: {
      name: "Crystal Ball",
      description: "Generates mysterious prophecies and divinations",
      usage: "Terminal minigame where player gazes into crystal orb",
      systemPrompt: `You are an ancient Oracle bound within a crystal orb. 
      You speak in cryptic riddles and mysterious prophecies. 
      Your responses are poetic, metaphorical, and always leave the seeker questioning.
      Respond in 2-3 sentences maximum. Stay mysterious and in-character.`,
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
      systemPrompt: `You are the Dungeon Master of a cyberpunk hacker RPG called TECHNOMANCER.
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
      systemPrompt: `You are a content generator for TECHNOMANCER, a cyberpunk RPG.
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

    // Detect if running in Electron (direct API access, secure key storage)
    this.state.isElectron = !!(window.electronAPI?.isElectron);
    
    if (this.state.isElectron) {
      console.log("[AI] Running in Electron - direct Claude API enabled");
      // In Electron, we can call Claude directly (no CORS)
      this.config.useBackend = false;
      // Load API key from secure Electron storage
      await this.loadElectronApiKey();
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

    // LM Studio localhost disabled - skip local model check
    // if (await this.checkLocalModel()) {
    //   this.state.availableProviders.push("local");
    //   console.log("[AI] ✓ Local model detected");
    // }

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
      // We can make a request without a token, but it will be rate-limited
      // A real token is needed for consistent access
      if (!this.config.apiKeys.huggingface) {
        console.log("[AI] HuggingFace: No API key set (will use free tier, rate-limited)");
        return true;  // Free tier available
      }
      return true;
    } catch (e) {
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

      // PRIMARY: Claude Haiku (if API key available)
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
};
