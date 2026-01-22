// ============================================================
// DEPLOYMENT-CONFIG.JS  
// Configure AI models for different deployment scenarios
//
// PURPOSE:
//   - Define deployment tiers (lightweight, standard, premium)
//   - Specialized model assignments for different game features
//   - Offline model caching and loading strategies
//   - Size and performance optimization settings
// ============================================================

window.DeploymentConfig = {
  
  // ============================================================
  // [DEPLOYMENT_TIERS] - Different AI model configurations
  // ============================================================
  tiers: {
    
    // LIGHTWEIGHT (1.1GB total) - Single model for all tasks
    lightweight: {
      name: "Lightweight Deployment",
      description: "Single TinyLlama model for all AI tasks", 
      totalSize: "1.1GB",
      models: {
        universal: "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
      },
      tasks: {
        npc_chat: "universal",
        battle_strategy: "universal", 
        content_generation: "universal",
        puzzle_solving: "universal"
      },
      ideal_for: ["Mobile deployment", "Low bandwidth", "Quick demo"]
    },

    // STANDARD (2.7GB total) - Specialized models for better quality
    standard: {
      name: "Standard Deployment", 
      description: "Balanced performance with specialized models",
      totalSize: "2.7GB",
      models: {
        npc: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",        // 1.1GB - Fast NPCs
        reasoning: "mistralai/ministral-3-3b",            // 1.6GB - Better logic
      },
      tasks: {
        npc_chat: "npc",
        ambient_dialogue: "npc", 
        quick_responses: "npc",
        battle_strategy: "reasoning",
        puzzle_solving: "reasoning",
        content_generation: "reasoning",
        story_branching: "reasoning"
      },
      ideal_for: ["Standard web deployment", "Good balance of size/quality"]
    },

    // PREMIUM (7GB total) - Maximum quality with largest models  
    premium: {
      name: "Premium Deployment",
      description: "Maximum quality with specialized large models",
      totalSize: "7GB", 
      models: {
        npc: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",        // 1.1GB - Fast NPCs
        content: "allenai/olmocr-2-7b",                   // 2.7GB - Content generation
        reasoning: "mistralai/ministral-3-14b-reasoning", // 3.2GB - Complex logic
      },
      tasks: {
        npc_chat: "npc",
        ambient_dialogue: "npc",
        sprite_descriptions: "content",
        ui_text: "content", 
        world_descriptions: "content",
        visual_narratives: "content",
        battle_strategy: "reasoning",
        puzzle_generation: "reasoning",
        complex_narratives: "reasoning",
        boss_mechanics: "reasoning",
        story_branching: "reasoning"
      },
      ideal_for: ["Desktop deployment", "High-end gaming", "Maximum AI quality"]
    }
  },

  // ============================================================
  // [OFFLINE_CACHE] - Model caching strategy
  // ============================================================
  caching: {
    enabled: true,
    strategy: "progressive", // Load core model first, others in background
    
    // Pre-cache models based on deployment tier
    precache: {
      lightweight: ["TinyLlama/TinyLlama-1.1B-Chat-v1.0"],
      standard: ["TinyLlama/TinyLlama-1.1B-Chat-v1.0", "mistralai/ministral-3-3b"],
      premium: [
        "TinyLlama/TinyLlama-1.1B-Chat-v1.0", 
        "allenai/olmocr-2-7b",
        "mistralai/ministral-3-14b-reasoning"
      ]
    },

    // Loading priority (1 = load first)
    priority: {
      "TinyLlama/TinyLlama-1.1B-Chat-v1.0": 1,        // Always load first
      "mistralai/ministral-3-3b": 2,                   // Load second
      "allenai/olmocr-2-7b": 3,                        // Background load
      "mistralai/ministral-3-14b-reasoning": 4         // Background load
    }
  },

  // ============================================================
  // [TASK_ROUTING] - Route game tasks to appropriate models  
  // ============================================================
  
  /**
   * Get the best model for a specific game task
   * @param {string} taskType - Type of AI task
   * @param {string} deploymentTier - Current deployment tier
   * @returns {string} Model name to use
   */
  getModelForTask(taskType, deploymentTier = "standard") {
    const tier = this.tiers[deploymentTier];
    if (!tier) {
      console.warn(`[DeploymentConfig] Unknown tier: ${deploymentTier}, using standard`);
      return this.getModelForTask(taskType, "standard");
    }

    const modelKey = tier.tasks[taskType];
    if (!modelKey) {
      console.warn(`[DeploymentConfig] No model assigned for task: ${taskType}`);
      // Default to first available model
      return Object.values(tier.models)[0];
    }

    return tier.models[modelKey];
  },

  /**
   * Get deployment recommendations based on target environment
   */
  getRecommendedTier(environment) {
    const recommendations = {
      mobile: "lightweight",
      web: "standard", 
      desktop: "premium",
      demo: "lightweight",
      production: "standard"
    };
    
    return recommendations[environment] || "standard";
  },

  /**
   * Estimate loading time based on tier and connection speed
   */
  estimateLoadTime(tier, connectionSpeed = "standard") {
    const tierSize = this.tiers[tier]?.totalSize || "1.1GB";
    const sizeMB = parseFloat(tierSize) * 1024; // Convert GB to MB
    
    const speeds = {
      slow: 1,     // 1 MB/s
      standard: 5, // 5 MB/s  
      fast: 20     // 20 MB/s
    };
    
    const speed = speeds[connectionSpeed] || speeds.standard;
    const timeSeconds = sizeMB / speed;
    
    return {
      seconds: Math.round(timeSeconds),
      minutes: Math.round(timeSeconds / 60),
      formattedTime: timeSeconds > 60 ? 
        `${Math.round(timeSeconds / 60)} minutes` : 
        `${Math.round(timeSeconds)} seconds`
    };
  }
};