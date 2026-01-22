// ============================================================
// AUTONOMOUS-CHARACTER-GENERATOR.JS
// AI-powered autonomous character generation with voice training
// ============================================================

window.AutonomousCharacterGenerator = {

  // Character generation templates
  characterTemplates: {
    companion: {
      baseTraits: ['loyal', 'helpful', 'intelligent'],
      voiceTypes: ['friendly', 'confident', 'warm'],
      roles: ['guide', 'assistant', 'advisor']
    },
    guard: {
      baseTraits: ['disciplined', 'protective', 'alert'],
      voiceTypes: ['commanding', 'authoritative', 'strong'],
      roles: ['protector', 'sentry', 'enforcer']
    },
    wizard: {
      baseTraits: ['wise', 'mystical', 'ancient'],
      voiceTypes: ['scholarly', 'mysterious', 'ethereal'],
      roles: ['mentor', 'spellcaster', 'lorekeeper']
    },
    merchant: {
      baseTraits: ['charismatic', 'business-minded', 'friendly'],
      voiceTypes: ['cheerful', 'persuasive', 'energetic'],
      roles: ['trader', 'shopkeeper', 'negotiator']
    },
    oracle: {
      baseTraits: ['cryptic', 'prophetic', 'otherworldly'],
      voiceTypes: ['whispered', 'mysterious', 'ethereal'],
      roles: ['prophet', 'seer', 'guide']
    }
  },

  // Voice reference database for autonomous selection
  voiceDatabase: {
    'confident female': ['Lara Croft', 'Scarlett Johansson', 'Wonder Woman'],
    'wise male': ['Gandalf', 'Morgan Freeman', 'Dumbledore'],
    'mysterious': ['Benedict Cumberbatch', 'Alan Rickman', 'Loki'],
    'authoritative': ['James Earl Jones', 'Patrick Stewart', 'Samuel L Jackson'],
    'cheerful': ['Robin Williams', 'Tom Hanks', 'Ellen DeGeneres'],
    'ancient': ['Ian McKellen', 'Christopher Lee', 'Frank Oz'],
    'commanding': ['Chris Evans', 'Russell Crowe', 'Gerard Butler'],
    'ethereal': ['Cate Blanchett', 'Tilda Swinton', 'Galadriel']
  },

  // ============================================================
  // [AUTONOMOUS GENERATION ENGINE]
  // ============================================================

  /**
   * Generate character autonomously based on context
   */
  async generateCharacter(context, requirements = {}) {
    console.log('[AutonomousGenerator] Generating character for context:', context);
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context, requirements);
      if (window.TechnomancerDB) {
        const cachedCharacter = await window.TechnomancerDB.getCachedCharacter(cacheKey);
        if (cachedCharacter && window.TechnomancerDB.isValidCache(cachedCharacter)) {
          console.log('[AutonomousGenerator] Using cached character');
          return this.instantiateCharacter(cachedCharacter.character);
        }
      }

      // Generate new character
      const characterSpec = await this.createCharacterSpecification(context, requirements);
      const character = await this.buildCharacterFromSpec(characterSpec);
      
      // Auto-train voice
      if (character.voiceRef) {
        const voiceResult = await this.autoTrainCharacterVoice(character);
        character.voiceTrained = voiceResult.success;
      }
      
      // Cache for future use
      if (window.TechnomancerDB) {
        await window.TechnomancerDB.cacheGeneratedCharacter(character);
      }
      
      return {
        success: true,
        character,
        fromCache: false
      };
      
    } catch (error) {
      console.error('[AutonomousGenerator] Generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Create character specification using AI
   */
  async createCharacterSpecification(context, requirements) {
    const prompt = `
Generate an RPG character for the following context:
${context}

Requirements: ${JSON.stringify(requirements)}

The character should fit naturally into this game world and serve a meaningful role.

Provide a JSON response with:
{
  "name": "Character name",
  "type": "companion/guard/wizard/merchant/oracle/other",
  "personality": ["trait1", "trait2", "trait3"],
  "voiceStyle": "description for voice training",
  "background": "Brief background story",
  "role": "Role in the game world",
  "abilities": ["ability1", "ability2"],
  "appearance": "Physical description",
  "dialogue_style": "How they speak"
}
`;

    if (window.AIModelManager) {
      const response = await window.AIModelManager.routeTask('creative', prompt);
      try {
        return JSON.parse(response);
      } catch {
        return this.parseCharacterFromText(response);
      }
    } else {
      // Fallback to template-based generation
      return this.generateFromTemplate(context, requirements);
    }
  },

  /**
   * Build character from specification
   */
  async buildCharacterFromSpec(spec) {
    const character = {
      id: this.generateCharacterId(),
      name: spec.name || this.generateRandomName(spec.type),
      type: spec.type || 'companion',
      personality: spec.personality || ['friendly'],
      voiceStyle: spec.voiceStyle || 'neutral voice',
      background: spec.background || 'A mysterious figure.',
      role: spec.role || 'helper',
      abilities: spec.abilities || [],
      appearance: spec.appearance || 'Average build.',
      dialogueStyle: spec.dialogue_style || 'Speaks clearly.',
      
      // Generated properties
      voiceRef: this.selectVoiceReference(spec),
      traits: this.extractTraits(spec),
      createdAt: Date.now(),
      source: 'autonomous_generation'
    };
    
    return character;
  },

  /**
   * Select appropriate voice reference for character
   */
  selectVoiceReference(spec) {
    const voiceStyle = spec.voiceStyle?.toLowerCase() || '';
    const personality = spec.personality?.join(' ').toLowerCase() || '';
    const type = spec.type?.toLowerCase() || '';
    
    // Try to match voice style
    for (const [style, voices] of Object.entries(this.voiceDatabase)) {
      if (voiceStyle.includes(style) || personality.includes(style) || type.includes(style)) {
        const randomVoice = voices[Math.floor(Math.random() * voices.length)];
        return randomVoice;
      }
    }
    
    // Fallback based on character type
    const typeMapping = {
      'companion': 'confident female',
      'guard': 'commanding',
      'wizard': 'wise male', 
      'merchant': 'cheerful',
      'oracle': 'ethereal'
    };
    
    const mappedStyle = typeMapping[type] || 'confident female';
    const voices = this.voiceDatabase[mappedStyle] || this.voiceDatabase['confident female'];
    return voices[Math.floor(Math.random() * voices.length)];
  },

  /**
   * Extract traits for voice training
   */
  extractTraits(spec) {
    const traits = [];
    
    // Add personality traits
    if (spec.personality) {
      traits.push(...spec.personality.slice(0, 3));
    }
    
    // Add type-based traits
    const template = this.characterTemplates[spec.type];
    if (template) {
      traits.push(...template.baseTraits.slice(0, 2));
    }
    
    return [...new Set(traits)]; // Remove duplicates
  },

  /**
   * Auto-train character voice
   */
  async autoTrainCharacterVoice(character) {
    if (!window.VoiceTrainer || !character.voiceRef) {
      return { success: false, error: 'Voice trainer not available' };
    }
    
    console.log(`[AutonomousGenerator] Auto-training voice: ${character.voiceRef}`);\n    
    try {
      const result = await window.VoiceTrainer.trainCharacterVoice(
        character.name,
        character.voiceRef,
        character.traits
      );
      
      if (result.success) {
        console.log(`[AutonomousGenerator] Voice trained for ${character.name}`);
      }
      
      return result;
    } catch (error) {
      console.error('[AutonomousGenerator] Voice training error:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================
  // [UTILITY METHODS]
  // ============================================================

  /**
   * Generate cache key for character
   */
  generateCacheKey(context, requirements) {
    const contextHash = this.simpleHash(context);
    const reqHash = this.simpleHash(JSON.stringify(requirements));
    return `char_${contextHash}_${reqHash}`;
  },

  /**
   * Generate unique character ID
   */
  generateCharacterId() {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate random name based on character type
   */
  generateRandomName(type) {
    const nameDatabase = {
      companion: ['Aria', 'Luna', 'Zara', 'Nova', 'Kira'],
      guard: ['Marcus', 'Viktor', 'Thane', 'Gareth', 'Darius'],
      wizard: ['Eldric', 'Morgana', 'Zephyr', 'Seraphina', 'Aldwin'],
      merchant: ['Cornelius', 'Beatrice', 'Finn', 'Rosalind', 'Jasper'],
      oracle: ['Cassandra', 'Morpheus', 'Pythia', 'Sage', 'Mystral']
    };
    
    const names = nameDatabase[type] || nameDatabase.companion;
    return names[Math.floor(Math.random() * names.length)];
  },

  /**
   * Parse character from AI text response
   */
  parseCharacterFromText(text) {
    // Basic text parsing fallback
    return {
      name: this.extractField(text, 'name') || 'Generated Character',
      type: this.extractField(text, 'type') || 'companion',
      personality: this.extractArray(text, 'personality') || ['friendly'],
      voiceStyle: this.extractField(text, 'voice') || 'neutral voice',
      background: this.extractField(text, 'background') || 'Mysterious origin.',
      role: this.extractField(text, 'role') || 'helper'
    };
  },

  /**
   * Extract field from text
   */
  extractField(text, field) {
    const regex = new RegExp(`${field}[\"\\s:]+([^\\n,\"]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  },

  /**
   * Extract array from text
   */
  extractArray(text, field) {
    const regex = new RegExp(`${field}[\"\\s:]+\\[?([^\\]\\n]+)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].split(',').map(item => item.trim().replace(/[\"']/g, ''));
    }
    return null;
  },

  /**
   * Generate from template as fallback
   */
  generateFromTemplate(context, requirements) {
    const type = requirements.type || 'companion';
    const template = this.characterTemplates[type] || this.characterTemplates.companion;
    
    return {
      name: this.generateRandomName(type),
      type: type,
      personality: template.baseTraits.slice(),
      voiceStyle: `${template.voiceTypes[0]} voice`,
      background: `A ${type} encountered in the game world.`,
      role: template.roles[0]
    };
  },

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },

  /**
   * Instantiate cached character
   */
  instantiateCharacter(character) {
    // Load voice if available
    if (character.voiceTrained && window.VoiceTrainer) {
      const cachedVoice = window.VoiceTrainer.getCharacterVoice(character.name);
      if (!cachedVoice) {
        // Re-train voice from cache
        this.autoTrainCharacterVoice(character);
      }
    }
    
    return {
      success: true,
      character,
      fromCache: true
    };
  }
};

// ============================================================
// [INTEGRATION HOOKS]
// ============================================================

// Automatically generate characters when requested by game events
window.addEventListener('gameEvent', async (event) => {
  if (event.detail.type === 'needCharacter') {
    const result = await window.AutonomousCharacterGenerator.generateCharacter(
      event.detail.context,
      event.detail.requirements
    );
    
    if (result.success) {
      // Dispatch character ready event
      window.dispatchEvent(new CustomEvent('characterGenerated', {
        detail: result.character
      }));
    }
  }
});

console.log('[AutonomousCharacterGenerator] Loaded and ready for autonomous character generation');