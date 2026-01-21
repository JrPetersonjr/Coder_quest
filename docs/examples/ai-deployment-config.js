// ============================================================
// AI-DEPLOYMENT-CONFIG.js
// DEPLOYMENT-READY AI CONFIGURATION TEMPLATE
//
// PURPOSE:
//   - Ready-to-use configurations for different environments
//   - Copy & modify for your specific deployment
//   - Handles API keys, feature toggles, fallback settings
//
// USAGE:
//   1. Choose your environment below
//   2. Set your API keys
//   3. Load this file BEFORE ai-config.js in index.html
//
// ============================================================

// ============================================================
// ENVIRONMENT: DEVELOPMENT (Local Model)
// ============================================================
const DEV_CONFIG = {
  name: "Development",
  description: "Local LM Studio model, fastest response time",
  setup: `
    1. Download LM Studio: https://lmstudio.ai
    2. Load a model (e.g., Mistral 7B, Llama 2)
    3. Start local server (port 1234)
    4. Uncomment this config below
  `,
  initialize: () => {
    AIConfig.setLocalModelURL('http://localhost:1234/v1/chat/completions');
    AIConfig.config.primaryProvider = 'local';
    AIConfig.config.fallbackProviders = ['huggingface'];  // Fallback to cloud
    console.log("[Config] Development mode: Local LM Studio");
  }
};

// ============================================================
// ENVIRONMENT: STAGING (HuggingFace Free)
// ============================================================
const STAGING_CONFIG = {
  name: "Staging",
  description: "HuggingFace free tier, rate-limited but free",
  setup: `
    1. Get free token: https://huggingface.co/settings/tokens
    2. Use token below (auto-detects rate limits)
    3. Suitable for small teams testing
  `,
  initialize: (token = null) => {
    if (token) {
      AIConfig.setAPIKey('huggingface', token);
      console.log("[Config] Staging mode: HuggingFace with token (better limits)");
    } else {
      console.log("[Config] Staging mode: HuggingFace free tier (rate-limited)");
    }
    AIConfig.config.primaryProvider = 'huggingface';
    AIConfig.config.fallbackProviders = ['huggingface'];  // Stick with what works
  }
};

// ============================================================
// ENVIRONMENT: PRODUCTION - TIER 1 (HuggingFace Pro)
// ============================================================
const PRODUCTION_HF_CONFIG = {
  name: "Production (HuggingFace Pro)",
  description: "Professional HuggingFace with dedicated resources",
  setup: `
    1. Upgrade to HuggingFace Pro: https://huggingface.co/pricing
    2. Create pro API token
    3. Use token below
    4. Supports 1000+ requests/minute
  `,
  initialize: (proToken) => {
    if (!proToken) {
      console.error("[Config] PRODUCTION requires HuggingFace Pro token!");
      return false;
    }
    AIConfig.setAPIKey('huggingface', proToken);
    AIConfig.config.primaryProvider = 'huggingface';
    AIConfig.config.fallbackProviders = ['huggingface'];
    console.log("[Config] Production mode: HuggingFace Pro");
    return true;
  }
};

// ============================================================
// ENVIRONMENT: PRODUCTION - TIER 2 (OpenAI)
// ============================================================
const PRODUCTION_OPENAI_CONFIG = {
  name: "Production (OpenAI)",
  description: "Highest quality, professional SLA",
  setup: `
    1. Create OpenAI account: https://platform.openai.com
    2. Create API key
    3. Set billing and rate limits
    4. Use key below for GPT-3.5 or GPT-4
  `,
  initialize: (openaiKey) => {
    if (!openaiKey) {
      console.error("[Config] PRODUCTION requires OpenAI API key!");
      return false;
    }
    AIConfig.setAPIKey('openai', openaiKey);
    AIConfig.config.primaryProvider = 'openai';
    AIConfig.config.fallbackProviders = ['openai'];
    console.log("[Config] Production mode: OpenAI GPT");
    return true;
  }
};

// ============================================================
// ENVIRONMENT: PRODUCTION - TIER 3 (Hybrid)
// ============================================================
const PRODUCTION_HYBRID_CONFIG = {
  name: "Production (Hybrid)",
  description: "Local + Cloud redundancy (best reliability)",
  setup: `
    1. Set up local LM Studio as primary (fast, always available)
    2. Set up HuggingFace Pro as fallback (cloud reliability)
    3. Configure both below
    4. Provides excellent uptime and performance
  `,
  initialize: (hfToken) => {
    if (!hfToken) {
      console.error("[Config] HYBRID requires HuggingFace Pro token!");
      return false;
    }
    
    AIConfig.setLocalModelURL('http://localhost:1234/v1/chat/completions');
    AIConfig.setAPIKey('huggingface', hfToken);
    
    // Try local first, fall back to cloud
    AIConfig.config.primaryProvider = 'local';
    AIConfig.config.fallbackProviders = ['huggingface'];
    
    console.log("[Config] Production mode: Hybrid (Local + HuggingFace)");
    return true;
  }
};

// ============================================================
// ENVIRONMENT: OFFLINE (Fallback Only)
// ============================================================
const OFFLINE_CONFIG = {
  name: "Offline",
  description: "No AI - uses pre-written fallback content",
  setup: `
    1. This requires NO setup
    2. Game uses built-in fallback content
    3. Works on any network
    4. Perfect for testing, demos, air-gapped environments
  `,
  initialize: () => {
    // Don't set any AI provider - will use fallbacks
    AIConfig.config.primaryProvider = null;
    AIConfig.config.fallbackProviders = [];
    AIConfig.config.aiFeatures = {
      crystalBall: true,
      dmNarrative: true,
      generativeContent: true,
      // Features still work, just using fallback content
    };
    console.log("[Config] Offline mode: All AI features use pre-written fallbacks");
  }
};

// ============================================================
// FEATURE TOGGLES - Enable/Disable specific AI features
// ============================================================
const FEATURE_PRESETS = {
  // All features enabled
  "all": {
    crystalBall: true,
    dmNarrative: true,
    generativeContent: true,
  },
  
  // Narrative only (no procedural content)
  "narrative": {
    crystalBall: true,
    dmNarrative: true,
    generativeContent: false,
  },
  
  // Minimal AI (crystal ball only)
  "minimal": {
    crystalBall: true,
    dmNarrative: false,
    generativeContent: false,
  },
  
  // All disabled (fallback mode)
  "none": {
    crystalBall: false,
    dmNarrative: false,
    generativeContent: false,
  },
};

// ============================================================
// MASTER CONFIGURATION FUNCTION
// ============================================================

/**
 * Apply configuration profile
 * @param {object} config - Config object (e.g., DEV_CONFIG)
 * @param {string} env - Environment (for logging)
 */
function applyAIConfig(config, env = "custom") {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[AI CONFIG] Applying: ${config.name}`);
  console.log(`[AI CONFIG] Environment: ${env}`);
  console.log(`${"=".repeat(60)}\n`);
  
  if (config.initialize) {
    config.initialize();
  }
  
  console.log(`[AI CONFIG] Ready for ${env}\n`);
}

// ============================================================
// QUICK START TEMPLATES
// ============================================================

/**
 * Development Setup
 */
function setupDevelopment() {
  applyAIConfig(DEV_CONFIG, "development");
}

/**
 * Staging Setup (with or without token)
 */
function setupStaging(optionalToken = null) {
  applyAIConfig(STAGING_CONFIG, "staging");
  STAGING_CONFIG.initialize(optionalToken);
}

/**
 * Production Setup - HuggingFace
 */
function setupProductionHuggingFace(proToken) {
  const success = PRODUCTION_HF_CONFIG.initialize(proToken);
  if (success) {
    applyAIConfig(PRODUCTION_HF_CONFIG, "production");
  }
}

/**
 * Production Setup - OpenAI
 */
function setupProductionOpenAI(apiKey) {
  const success = PRODUCTION_OPENAI_CONFIG.initialize(apiKey);
  if (success) {
    applyAIConfig(PRODUCTION_OPENAI_CONFIG, "production");
  }
}

/**
 * Production Setup - Hybrid
 */
function setupProductionHybrid(hfToken) {
  const success = PRODUCTION_HYBRID_CONFIG.initialize(hfToken);
  if (success) {
    applyAIConfig(PRODUCTION_HYBRID_CONFIG, "production");
  }
}

/**
 * Offline Setup (no AI)
 */
function setupOffline() {
  applyAIConfig(OFFLINE_CONFIG, "offline");
}

// ============================================================
// EXAMPLE USAGE IN index.html
// ============================================================

/*
  <!-- Option 1: Development (Local LM Studio) -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  <script>
    setupDevelopment();
    AIConfig.initialize();
  </script>

  <!-- Option 2: Staging with HuggingFace Free -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  <script>
    setupStaging(); // No token = free tier
    AIConfig.initialize();
  </script>

  <!-- Option 3: Staging with HuggingFace Token -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  <script>
    setupStaging('hf_YOUR_TOKEN_HERE');
    AIConfig.initialize();
  </script>

  <!-- Option 4: Production with OpenAI -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  <script>
    setupProductionOpenAI('sk_YOUR_OPENAI_KEY');
    AIConfig.initialize();
  </script>

  <!-- Option 5: Production Hybrid (Local + Cloud) -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  <script>
    setupProductionHybrid('hf_YOUR_HF_PRO_TOKEN');
    AIConfig.initialize();
  </script>

  <!-- Option 6: Offline (No AI) -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  <script>
    setupOffline();
    AIConfig.initialize();
  </script>
*/

// ============================================================
// ENVIRONMENT DETECTION (Auto-setup)
// ============================================================

/**
 * Auto-detect environment from URL or configuration
 */
function autoDetectEnvironment() {
  // Check URL parameters
  const params = new URLSearchParams(window.location.search);
  const env = params.get('ai-env');
  
  if (env === 'dev' || env === 'development') {
    setupDevelopment();
  } else if (env === 'staging') {
    setupStaging();
  } else if (env === 'prod' || env === 'production') {
    // Production defaults to offline (requires explicit config)
    setupOffline();
    console.warn("[Config] Production without AI config - using fallback");
  } else {
    // Default: Staging mode
    setupStaging();
  }
}

// ============================================================
// DIAGNOSTIC TOOLS
// ============================================================

/**
 * Check AI system health
 */
function checkAIHealth() {
  const status = AIConfig.getStatus();
  
  console.group("[AI Health Check]");
  console.log("Initialized:", status.initialized);
  console.log("Active Provider:", status.activeProvider || "OFFLINE (fallback)");
  console.log("Available Providers:", status.availableProviders.join(", ") || "None");
  console.log("Requests Made:", status.requestCount);
  console.log("Failures:", status.failureCount);
  console.log("Features:");
  console.log("  - Crystal Ball:", status.features.crystalBall);
  console.log("  - DM Narrative:", status.features.dmNarrative);
  console.log("  - Generative Content:", status.features.generativeContent);
  console.groupEnd();
  
  return status;
}

/**
 * Test specific AI feature
 */
async function testAIFeature(feature) {
  console.log(`[AI Test] Testing ${feature}...`);
  
  try {
    let result;
    if (feature === 'crystalBall') {
      result = await AIConfig.generateCrystalBall("Test query");
    } else if (feature === 'dm') {
      result = await AIConfig.generateDMNarrative("Test context");
    } else if (feature === 'content') {
      result = await AIConfig.generateContent("quest", "test");
    } else {
      console.error("[AI Test] Unknown feature:", feature);
      return;
    }
    
    console.log(`[AI Test] ${feature} result:`, result);
    return result;
  } catch (e) {
    console.error(`[AI Test] ${feature} failed:`, e);
  }
}

/**
 * Full system test
 */
async function testAISystem() {
  console.log("\n[AI System Test] Starting comprehensive test...\n");
  
  await testAIFeature('crystalBall');
  await testAIFeature('dm');
  await testAIFeature('content');
  
  checkAIHealth();
  
  console.log("\n[AI System Test] Complete\n");
}

// ============================================================
// EXPORT FOR USE IN HTML
// ============================================================

// These are now available globally:
// - setupDevelopment()
// - setupStaging(token)
// - setupProductionHuggingFace(token)
// - setupProductionOpenAI(key)
// - setupProductionHybrid(token)
// - setupOffline()
// - autoDetectEnvironment()
// - checkAIHealth()
// - testAIFeature(feature)
// - testAISystem()
// - FEATURE_PRESETS
