// ============================================================
// BROWSER-LLM.JS
// Browser-based AI using Transformers.js - NO SETUP REQUIRED
//
// PURPOSE:
//   - Runs small LLMs directly in the browser
//   - No API keys, servers, or installation needed
//   - Works offline once models are cached
//   - Perfect fallback for users with zero technical setup
//
// MODELS SUPPORTED:
//   - TinyLlama (1.1B) - Fast, good for simple tasks
//   - DistilGPT-2 - Lightweight text generation
//   - Phi-2 (2.7B) - Better quality, slower loading
//   - Custom fine-tuned models for gaming
// ============================================================

window.BrowserLLM = {
  
  // Configuration
  config: {
    enabled: true,
    model: "TinyLlama/TinyLlama-1.1B-Chat-v1.0", // Default model
    fallbackModel: "Xenova/distilgpt2", // Lighter fallback
    maxTokens: 150,
    temperature: 0.8,
    cacheModels: true, // Cache for offline use
  },

  // State
  state: {
    isInitialized: false,
    isLoading: false,
    currentModel: null,
    generator: null,
    tokenizer: null,
    loadProgress: 0,
    lastError: null,
  },

  // ============================================================
  // [INITIALIZATION] - Setup browser-based AI
  // ============================================================
  async initialize() {
    if (this.state.isInitialized) return true;
    
    try {
      console.log("[BrowserLLM] Initializing browser-based AI...");
      
      // Check if Transformers.js is available
      if (typeof window.Transformers === 'undefined') {
        console.warn("[BrowserLLM] Transformers.js not loaded, trying alternative approach");
        await this.loadTransformers();
      }

      this.state.isLoading = true;
      this.showLoadingProgress("Preparing AI model...", 10);

      // Load lightweight model for instant availability
      await this.loadModel(this.config.fallbackModel);
      
      this.state.isInitialized = true;
      this.state.isLoading = false;
      
      console.log("[BrowserLLM] Browser AI initialized successfully");
      this.showLoadingProgress("AI ready!", 100);
      
      // Preload better model in background
      setTimeout(() => this.preloadBetterModel(), 2000);
      
      return true;
      
    } catch (error) {
      console.error("[BrowserLLM] Initialization failed:", error);
      this.state.lastError = error.message;
      this.state.isLoading = false;
      
      // Try even simpler approach
      this.initializeFallback();
      return false;
    }
  },

  // Load Transformers.js dynamically if not available
  async loadTransformers() {
    try {
      // Import as ES6 module
      const transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.0');
      window.Transformers = transformers;
    } catch (error) {
      console.warn("[BrowserLLM] ES6 import failed, trying script injection");
      await this.injectTransformersScript();
    }
  },

  // Inject Transformers.js via script tag
  async injectTransformersScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.0/dist/transformers.min.js';
      script.onload = () => {
        console.log("[BrowserLLM] Transformers.js loaded via script injection");
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Load specific model
  async loadModel(modelName) {
    try {
      this.showLoadingProgress(`Loading ${modelName}...`, 30);
      
      // Use dynamic import approach
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.0');
      
      this.showLoadingProgress("Preparing text generation...", 60);
      
      this.state.generator = await pipeline('text-generation', modelName, {
        quantized: true, // Use quantized version for speed
        progress_callback: (progress) => {
          this.showLoadingProgress(`Loading model: ${Math.round(progress.progress * 100)}%`, 60 + (progress.progress * 30));
        }
      });
      
      this.state.currentModel = modelName;
      console.log(`[BrowserLLM] Model loaded: ${modelName}`);
      
      return true;
    } catch (error) {
      console.warn(`[BrowserLLM] Failed to load ${modelName}:`, error.message);
      throw error;
    }
  },

  // Preload better model in background
  async preloadBetterModel() {
    if (this.state.currentModel === this.config.model) return;
    
    try {
      console.log("[BrowserLLM] Preloading better model in background...");
      await this.loadModel(this.config.model);
      console.log("[BrowserLLM] Upgraded to better model");
    } catch (error) {
      console.log("[BrowserLLM] Better model preload failed, keeping current model");
    }
  },

  // Show loading progress to user
  showLoadingProgress(message, percent) {
    this.state.loadProgress = percent;
    
    // Try to show in game UI if available
    if (window.gameEngine) {
      gameEngine.output(`🤖 ${message} (${Math.round(percent)}%)`, "hint");
    }
    
    console.log(`[BrowserLLM] ${message} (${percent}%)`);
  },

  // ============================================================
  // [GENERATION] - Generate text responses
  // ============================================================
  async generate(prompt, framework = {}) {
    if (!this.state.isInitialized || !this.state.generator) {
      throw new Error("Browser LLM not initialized");
    }

    try {
      const systemPrompt = framework.systemPrompt || "You are a helpful AI assistant for a cyberpunk RPG game.";
      const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`;

      console.log("[BrowserLLM] Generating response...");
      
      const result = await this.state.generator(fullPrompt, {
        max_new_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        do_sample: true,
        return_full_text: false,
      });

      const response = result[0]?.generated_text?.trim() || "";
      
      // Clean up the response
      const cleanResponse = this.cleanResponse(response, prompt);
      
      console.log("[BrowserLLM] Generated response successfully");
      return cleanResponse;
      
    } catch (error) {
      console.error("[BrowserLLM] Generation failed:", error);
      throw new Error(`Browser AI generation failed: ${error.message}`);
    }
  },

  // Clean up generated response
  cleanResponse(response, originalPrompt) {
    let cleaned = response;
    
    // Remove repetition of the original prompt
    if (cleaned.toLowerCase().includes(originalPrompt.toLowerCase())) {
      cleaned = cleaned.replace(new RegExp(originalPrompt, 'gi'), '').trim();
    }
    
    // Remove common artifacts
    cleaned = cleaned
      .replace(/^(User:|Assistant:)/gi, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Ensure reasonable length
    if (cleaned.length > this.config.maxTokens * 4) {
      cleaned = cleaned.substring(0, this.config.maxTokens * 4).trim();
      // Try to end at a sentence boundary
      const lastPeriod = cleaned.lastIndexOf('.');
      if (lastPeriod > cleaned.length * 0.7) {
        cleaned = cleaned.substring(0, lastPeriod + 1);
      }
    }
    
    return cleaned;
  },

  // ============================================================
  // [FALLBACK] - Simple rule-based responses
  // ============================================================
  initializeFallback() {
    console.log("[BrowserLLM] Initializing rule-based fallback");
    this.state.isInitialized = true;
    this.state.generator = "fallback";
  },

  // Generate fallback responses using rules
  generateFallback(prompt, framework = {}) {
    const responses = framework.fallbackResponses || [
      "The digital winds whisper secrets of ancient code.",
      "Your path through the cyber-realm remains uncertain.",
      "The algorithms speak, but their meaning is veiled.",
      "Data streams reveal glimpses of your destiny.",
      "The network hums with possibility.",
    ];

    // Simple keyword matching for better responses
    const lowPrompt = prompt.toLowerCase();
    
    if (lowPrompt.includes('battle') || lowPrompt.includes('fight')) {
      return "Steel yourself, for conflict approaches through the digital void.";
    }
    
    if (lowPrompt.includes('future') || lowPrompt.includes('destiny')) {
      return "The threads of tomorrow weave through corrupted data streams.";
    }
    
    if (lowPrompt.includes('artifact') || lowPrompt.includes('item')) {
      return "Ancient code fragments hold power beyond imagination.";
    }
    
    // Return random response
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // ============================================================
  // [STATUS] - Check system status
  // ============================================================
  getStatus() {
    return {
      initialized: this.state.isInitialized,
      loading: this.state.isLoading,
      model: this.state.currentModel,
      progress: this.state.loadProgress,
      error: this.state.lastError,
      available: this.state.isInitialized && !this.state.isLoading,
    };
  },

  // Test generation
  async test() {
    try {
      const result = await this.generate("Generate a brief mysterious message about an ancient artifact");
      return {
        success: true,
        result: result,
        model: this.state.currentModel
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Auto-initialize when script loads (non-blocking)
setTimeout(async () => {
  try {
    await BrowserLLM.initialize();
  } catch (error) {
    console.log("[BrowserLLM] Auto-initialization completed with fallback");
  }
}, 1000);

console.log("[browser-llm.js] Browser LLM system loaded");