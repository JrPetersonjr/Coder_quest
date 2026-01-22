// ============================================================
// AI-DYNAMIC-DELEGATOR.JS
// DYNAMIC AI MODEL MANAGEMENT & ROLE DELEGATION SYSTEM
//
// PURPOSE:
//   - Allow users to register multiple AI models with API keys
//   - Master delegator AI assigns roles dynamically
//   - Support for up to 7+ models with specialized roles
//   - One model gets code generation/editing capabilities
//   - Automatic role balancing and task optimization
//
// USAGE:
//   1. Register models: AIModelManager.registerModel(name, apiKey, capabilities)
//   2. System automatically delegates roles using master AI
//   3. Tasks are routed to optimal model for each category
//   4. Code generation model gets advanced capabilities
//
// ROLES:
//   - npc-dialogue: Character interactions and conversations
//   - dice-mechanics: Game mechanics, probabilities, calculations
//   - dungeon-master: Story progression, narrative control
//   - scene-generation: 2D graphics using assets library
//   - dynamic-content: Quest/item generation, world building
//   - adventure-generation: New storylines and campaign creation
//   - terminal-experiences: Hacking minigames and puzzles
//   - debug-repair: Game debugging and issue resolution
//   - code-generation: Create/edit code (AI assistant capabilities)
//   - master-delegator: Manages and coordinates other models
//
// ============================================================

window.AIModelManager = {
  // ============================================================
  // [REGISTRY] - Dynamic model registration
  // ============================================================
  modelRegistry: new Map(),
  apiKeys: new Map(), 
  roleAssignments: new Map(),
  capabilities: new Map(),
  
  // Available specialized roles
  availableRoles: [
    'npc-dialogue',
    'dice-mechanics', 
    'dungeon-master',
    'scene-generation',
    'dynamic-content',
    'adventure-generation',
    'terminal-experiences', 
    'debug-repair',
    'code-generation',
    'user-modding',
    'admin-modding',
    'master-delegator'
  ],
  
  // User modding restrictions
  userModLimits: {
    allowedCategories: [
      'spell-creation',
      'item-generation', 
      'npc-dialogue',
      'quest-creation',
      'scene-description',
      'character-customization',
      'terminal-puzzles'
    ],
    restrictedCategories: [
      'code-modification',
      'system-changes',
      'security-bypasses',
      'admin-functions',
      'core-mechanics'
    ],
    maxComplexity: 'medium',
    requiresApproval: true
  },
  
  // Role descriptions for delegation
  roleDescriptions: {
    'npc-dialogue': 'Handle NPC conversations, character interactions, and ambient dialogue',
    'dice-mechanics': 'Manage dice rolls, probability calculations, and game mechanics',
    'dungeon-master': 'Control narrative flow, encounters, story progression, and world responses',
    'scene-generation': 'Generate 2D scene descriptions using our assets library for visual narratives',
    'dynamic-content': 'Create quests, items, NPCs, locations, and procedural game content',
    'adventure-generation': 'Design new adventures, storylines, campaigns, and branching narratives',
    'terminal-experiences': 'Design and run ancient terminal hacking minigames and puzzles',
    'debug-repair': 'Debug game issues, suggest fixes, and help with technical problems',
    'code-generation': 'Create and edit game code with AI assistant capabilities (like GitHub Copilot)',
    'user-modding': 'Create user-friendly gameplay modifications within safe boundaries',
    'admin-modding': 'Full code modification and system-level changes (admin only)',
    'master-delegator': 'Analyze and coordinate other AI models, assign optimal roles'
  },

  // ============================================================
  // [REGISTRATION] - Add new models to the system
  // ============================================================
  
  /**
   * Register a new AI model with API key and capabilities
   * @param {string} modelName - Name/identifier of the model
   * @param {string} apiKey - API key for the model  
   * @param {array} capabilities - Array of what this model does well
   * @param {object} config - Additional configuration
   * @returns {boolean} Success status
   */
  registerModel: function(modelName, apiKey, capabilities = [], config = {}) {
    console.log(`[AIModelManager] Registering new model: ${modelName}`);
    
    // Validate inputs
    if (!modelName || !apiKey) {
      console.error('[AIModelManager] Model name and API key are required');
      return false;
    }
    
    // Store model information
    this.modelRegistry.set(modelName, {
      name: modelName,
      registered: new Date(),
      active: true,
      provider: config.provider || 'custom',
      endpoint: config.endpoint || null,
      ...config
    });
    
    this.apiKeys.set(modelName, apiKey);
    this.capabilities.set(modelName, capabilities);
    
    // Trigger automatic role delegation
    this.delegateRoles();
    
    // Notify user
    if (window.gameEngine) {
      window.gameEngine.output(`🤖 Model registered: ${modelName}`, 'system');
      window.gameEngine.output(`📊 Total models: ${this.modelRegistry.size}`, 'hint');
    }
    
    return true;
  },
  
  /**
   * Remove a model from the system
   */
  unregisterModel: function(modelName) {
    this.modelRegistry.delete(modelName);
    this.apiKeys.delete(modelName);
    this.roleAssignments.delete(modelName);
    this.capabilities.delete(modelName);
    
    // Re-delegate remaining models
    if (this.modelRegistry.size > 0) {
      this.delegateRoles();
    }
    
    console.log(`[AIModelManager] Removed model: ${modelName}`);
    return true;
  },

  // ============================================================
  // [ROLE_DELEGATION] - Automatic role assignment
  // ============================================================
  
  /**
   * Automatically delegate roles to all registered models
   */
  delegateRoles: async function() {
    const models = Array.from(this.modelRegistry.keys());
    if (models.length === 0) {
      console.log('[AIModelManager] No models to delegate');
      return;\n    }\n\n    console.log(`[AIModelManager] Delegating roles to ${models.length} models`);\n    \n    // Find current master delegator\n    let masterDelegator = this.findMasterDelegator();\n    \n    // If no master delegator, assign one\n    if (!masterDelegator && models.length > 0) {\n      masterDelegator = this.assignMasterDelegator(models);\n    }\n    \n    // Use master delegator to assign roles\n    try {\n      const assignments = await this.callMasterDelegator(masterDelegator, models);\n      this.applyRoleAssignments(assignments);\n      this.notifyRoleAssignments();\n    } catch (error) {\n      console.warn('[AIModelManager] Master delegation failed, using fallback');\n      this.fallbackRoleAssignment(models);\n    }\n  },\n  \n  /**\n   * Find existing master delegator\n   */\n  findMasterDelegator: function() {\n    for (const [modelName, role] of this.roleAssignments) {\n      if (role === 'master-delegator') {\n        return modelName;\n      }\n    }\n    return null;\n  },\n  \n  /**\n   * Assign a model as master delegator\n   */\n  assignMasterDelegator: function(models) {\n    // Choose the first model as master delegator for now\n    // TODO: Could be enhanced to pick based on capabilities\n    const masterModel = models[0];\n    this.roleAssignments.set(masterModel, 'master-delegator');\n    console.log(`[AIModelManager] Assigned ${masterModel} as master delegator`);\n    return masterModel;\n  },\n\n  /**\n   * Call master delegator to assign roles to all models\n   */\n  callMasterDelegator: async function(masterModel, allModels) {\n    const prompt = this.buildDelegationPrompt(allModels);\n    \n    try {\n      const response = await this.callModel(masterModel, prompt);\n      return this.parseDelegationResponse(response);\n    } catch (error) {\n      console.error('[AIModelManager] Master delegator call failed:', error);\n      throw error;\n    }\n  },\n  \n  /**\n   * Build delegation prompt for master AI\n   */\n  buildDelegationPrompt: function(models) {\n    const modelList = models.map(name => {\n      const caps = this.capabilities.get(name) || [];\n      return `${name} (capabilities: ${caps.join(', ') || 'general'})`;\n    }).join('\\n');\n    \n    const prompt = `You are the Master AI Delegator for a cyberpunk RPG game system. Analyze these ${models.length} AI models and assign each one a specialized role.\n\nRegistered Models:\n${modelList}\n\nAvailable Roles:\n${this.availableRoles.map(role => `- ${role}: ${this.roleDescriptions[role]}`).join('\\n')}\n\nAssignment Rules:\n1. Each model gets exactly ONE role\n2. Distribute roles evenly - don't assign duplicate roles unless you have more models than roles\n3. Consider model capabilities when assigning roles\n4. One model should get 'code-generation' (most advanced coding capabilities)\n5. One model remains 'master-delegator' (yourself)\n6. Prioritize game experience: npc-dialogue, dungeon-master, and dynamic-content are core\n\nReturn ONLY a JSON object mapping each model to its assigned role:\n{\n  \"model1\": \"role1\",\n  \"model2\": \"role2\",\n  \"model3\": \"role3\"\n}\n\nExample output:\n{\n  \"gpt-4\": \"master-delegator\",\n  \"claude-3\": \"code-generation\", \n  \"llama-2\": \"dungeon-master\",\n  \"mistral-7b\": \"npc-dialogue\"\n}`;\n    \n    return prompt;\n  },\n  \n  /**\n   * Parse delegation response from master AI\n   */\n  parseDelegationResponse: function(response) {\n    try {\n      // Extract JSON from response\n      const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);\n      if (!jsonMatch) {\n        throw new Error('No JSON found in response');\n      }\n      \n      const assignments = JSON.parse(jsonMatch[0]);\n      \n      // Validate assignments\n      for (const [model, role] of Object.entries(assignments)) {\n        if (!this.modelRegistry.has(model)) {\n          console.warn(`[AIModelManager] Unknown model in assignment: ${model}`);\n        }\n        if (!this.availableRoles.includes(role)) {\n          console.warn(`[AIModelManager] Unknown role in assignment: ${role}`);\n        }\n      }\n      \n      return assignments;\n    } catch (error) {\n      console.error('[AIModelManager] Failed to parse delegation response:', error);\n      throw error;\n    }\n  },\n\n  /**\n   * Apply role assignments from master delegator\n   */\n  applyRoleAssignments: function(assignments) {\n    console.log('[AIModelManager] Applying role assignments:', assignments);\n    \n    // Clear existing assignments\n    this.roleAssignments.clear();\n    \n    // Apply new assignments\n    for (const [modelName, role] of Object.entries(assignments)) {\n      if (this.modelRegistry.has(modelName)) {\n        this.roleAssignments.set(modelName, role);\n      }\n    }\n    \n    // Ensure we have a master delegator\n    const hasMaster = Array.from(this.roleAssignments.values()).includes('master-delegator');\n    if (!hasMaster && this.roleAssignments.size > 0) {\n      const firstModel = Array.from(this.roleAssignments.keys())[0];\n      this.roleAssignments.set(firstModel, 'master-delegator');\n    }\n  },\n  \n  /**\n   * Fallback role assignment if master delegator fails\n   */\n  fallbackRoleAssignment: function(models) {\n    console.log('[AIModelManager] Using fallback role assignment');\n    \n    this.roleAssignments.clear();\n    \n    models.forEach((model, index) => {\n      const role = this.availableRoles[index % this.availableRoles.length];\n      this.roleAssignments.set(model, role);\n    });\n    \n    this.notifyRoleAssignments();\n  },\n  \n  /**\n   * Notify about role assignments\n   */\n  notifyRoleAssignments: function() {\n    if (window.gameEngine) {\n      window.gameEngine.output('🎭 AI roles assigned:', 'system');\n      for (const [model, role] of this.roleAssignments) {\n        const icon = this.getRoleIcon(role);\n        window.gameEngine.output(`  ${icon} ${model} → ${role}`, 'hint');\n      }\n    }\n  },\n  \n  /**\n   * Get icon for role\n   */\n  getRoleIcon: function(role) {\n    const icons = {\n      'npc-dialogue': '💬',\n      'dice-mechanics': '🎲',\n      'dungeon-master': '🏰', \n      'scene-generation': '🎨',\n      'dynamic-content': '📝',\n      'adventure-generation': '📚',\n      'terminal-experiences': '💻',\n      'debug-repair': '🔧',\n      'code-generation': '⚡',\n      'master-delegator': '👑'\n    };\n    return icons[role] || '🤖';\n  },\n\n  // ============================================================\n  // [TASK_ROUTING] - Route tasks to appropriate models\n  // ============================================================\n  \n  /**\n   * Route a task to the appropriate model based on role assignments\n   * @param {string} taskType - Type of task to perform\n   * @param {string} prompt - Prompt for the AI\n   * @param {object} options - Additional options\n   * @returns {Promise<string>} AI response\n   */\n  routeTask: async function(taskType, prompt, options = {}) {\n    console.log(`[AIModelManager] Routing ${taskType} task`);\n    \n    // Find model assigned to this task type\n    let assignedModel = null;\n    for (const [modelName, role] of this.roleAssignments) {\n      if (role === taskType) {\n        assignedModel = modelName;\n        break;\n      }\n    }\n    \n    // Fallback logic for common task mappings\n    if (!assignedModel) {\n      const taskMappings = {\n        'npc': 'npc-dialogue',\n        'reasoning': 'dungeon-master',\n        'content': 'dynamic-content',\n        'debug': 'debug-repair',\n        'code': 'code-generation'\n      };\n      \n      const mappedTask = taskMappings[taskType];\n      if (mappedTask) {\n        for (const [modelName, role] of this.roleAssignments) {\n          if (role === mappedTask) {\n            assignedModel = modelName;\n            break;\n          }\n        }\n      }\n    }\n    \n    // Use master delegator as final fallback\n    if (!assignedModel) {\n      for (const [modelName, role] of this.roleAssignments) {\n        if (role === 'master-delegator') {\n          assignedModel = modelName;\n          break;\n        }\n      }\n    }\n    \n    if (assignedModel) {\n      return await this.callModel(assignedModel, prompt, options);\n    } else {\n      // Fallback to existing AIConfig system\n      console.warn('[AIModelManager] No model found, falling back to AIConfig');\n      return await window.AIConfig.delegateTask(taskType, prompt, options);\n    }\n  },\n\n  // ============================================================\n  // [MODEL_CALLING] - Direct model communication\n  // ============================================================\n  \n  /**\n   * Call a specific model directly\n   * @param {string} modelName - Name of model to call\n   * @param {string} prompt - Prompt to send\n   * @param {object} options - Additional options\n   * @returns {Promise<string>} Model response\n   */\n  callModel: async function(modelName, prompt, options = {}) {\n    const apiKey = this.apiKeys.get(modelName);\n    const modelInfo = this.modelRegistry.get(modelName);\n    \n    if (!apiKey || !modelInfo) {\n      throw new Error(`Model not found or no API key: ${modelName}`);\n    }\n    \n    console.log(`[AIModelManager] Calling ${modelName}`);\n    \n    // Enhanced prompt for code generation models\n    if (this.roleAssignments.get(modelName) === 'code-generation') {\n      prompt = this.enhanceCodePrompt(prompt);\n    }\n    \n    try {\n      // This would be implemented based on the model's specific API\n      // For now, simulate the call\n      const response = await this.makeAPICall(modelName, apiKey, prompt, options);\n      return response;\n    } catch (error) {\n      console.error(`[AIModelManager] Error calling ${modelName}:`, error);\n      throw error;\n    }\n  },\n  \n  /**\n   * Enhance prompts for code generation models\n   */\n  enhanceCodePrompt: function(prompt) {\n    const codeContext = `You are an advanced AI coding assistant with GitHub Copilot-like capabilities. You can:\n- Analyze and understand game code structure\n- Create new game features and components\n- Edit existing code with precision\n- Debug and fix issues\n- Suggest optimizations and improvements\n- Work with JavaScript, HTML, CSS, and game engine code\n\nCurrent game context: TECHNOMANCER - A cyberpunk text-based RPG with AI integration.\n\nUser request: ${prompt}\n\nProvide precise, functional code that integrates with the existing game architecture.`;\n    \n    return codeContext;\n  },\n  \n  /**\n   * Make actual API call to model\n   */\n  makeAPICall: async function(modelName, apiKey, prompt, options) {\n    const modelInfo = this.modelRegistry.get(modelName);\n    \n    // Simulate API call for now\n    // In real implementation, this would make actual HTTP requests\n    // to the model's API endpoint using the provided API key\n    \n    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simulate network delay\n    \n    // Return a simulated response based on the role\n    const role = this.roleAssignments.get(modelName);\n    return this.simulateModelResponse(role, prompt);\n  },\n  \n  /**\n   * Simulate model responses for testing\n   */\n  simulateModelResponse: function(role, prompt) {\n    const responses = {\n      'npc-dialogue': `*NPC looks up from their terminal* \"${prompt.substring(0, 50)}...\" *they gesture towards the data streams*`,\n      'dice-mechanics': `Rolling probability matrices... Result calculated with quantum randomness: ${Math.floor(Math.random() * 20) + 1}`,\n      'dungeon-master': `The digital realm responds to your action. ${prompt.includes('examine') ? 'Data cascades reveal hidden patterns.' : 'New pathways manifest in the code.'} What do you do next?`,\n      'scene-generation': `[2D Scene] ${prompt.includes('room') ? 'A neon-lit chamber with floating holographic terminals.' : 'Shadows dance across chrome surfaces as data flows overhead.'}`,\n      'dynamic-content': `Generated content: A mysterious ${['data crystal', 'neural interface', 'quantum key'][Math.floor(Math.random() * 3)]} appears, pulsing with digital energy.`,\n      'adventure-generation': `New adventure path: The ${['Shadowed Subnet', 'Crystal Cache', 'Neural Nexus'][Math.floor(Math.random() * 3)]} awaits exploration. Multiple routes detected.`,\n      'terminal-experiences': `[Terminal Hack] Access node detected. Password pattern: ${Math.random().toString(36).substring(2, 8).toUpperCase()}. Time remaining: ${Math.floor(Math.random() * 30 + 10)}s`,\n      'debug-repair': `Analysis complete. Issue detected in ${['memory allocation', 'data synchronization', 'neural pathway'][Math.floor(Math.random() * 3)]}. Suggested fix: ${['optimize buffer', 'reset connections', 'reinitialize'][Math.floor(Math.random() * 3)]}.`,\n      'code-generation': `// Generated code for: ${prompt}\\nfunction handleTask() {\\n  // AI-generated implementation\\n  console.log('Feature implemented with AI assistance');\\n  return 'success';\\n}`,\n      'master-delegator': `Task delegation analysis: ${prompt} → Optimal assignment: ${this.availableRoles[Math.floor(Math.random() * this.availableRoles.length)]} model.`\n    };\n    \n    return responses[role] || `AI Response: ${prompt}`;\n  },\n\n  // ============================================================\n  // [UTILITIES] - Helper functions\n  // ============================================================\n  \n  /**\n   * Get status of all registered models\n   */\n  getStatus: function() {\n    return {\n      totalModels: this.modelRegistry.size,\n      assignedRoles: Array.from(this.roleAssignments.entries()),\n      availableRoles: this.availableRoles.filter(role => \n        !Array.from(this.roleAssignments.values()).includes(role)\n      ),\n      models: Array.from(this.modelRegistry.entries()).map(([name, info]) => ({\n        name,\n        role: this.roleAssignments.get(name) || 'unassigned',\n        capabilities: this.capabilities.get(name) || [],\n        registered: info.registered\n      }))\n    };\n  },\n  \n  /**\n   * Initialize the dynamic model manager\n   */\n  initialize: function() {\n    console.log('[AIModelManager] Initializing dynamic AI model management');\n    \n    // Set up integration with existing AIConfig\n    if (window.AIConfig) {\n      const originalDelegate = window.AIConfig.delegateTask;\n      window.AIConfig.delegateTask = async function(taskType, prompt, options) {\n        // Try dynamic manager first\n        if (window.AIModelManager.modelRegistry.size > 0) {\n          return await window.AIModelManager.routeTask(taskType, prompt, options);\n        } else {\n          // Fall back to original system\n          return await originalDelegate.call(this, taskType, prompt, options);\n        }\n      };\n    }\n    \n    console.log('[AIModelManager] Dynamic AI management ready');\n  }\n};\n\n// ============================================================\n// [INTEGRATION] - GameEngine command integration\n// ============================================================\n\n// Add model management commands to GameEngine\nif (typeof window !== 'undefined') {\n  // Initialize when loaded\n  window.addEventListener('DOMContentLoaded', () => {\n    if (window.AIModelManager) {\n      window.AIModelManager.initialize();\n    }\n  });\n  \n  // Initialize immediately if DOM is already loaded\n  if (document.readyState === 'loading') {\n    window.AIModelManager.initialize();\n  }\n}\n\nconsole.log('[AIModelManager] Dynamic AI Model Management System loaded');\n