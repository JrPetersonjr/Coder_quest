// ============================================================
// QWEN-ROLEPLAY-CONFIG.JS
// LM Studio + Qwen Roleplay V2 Integration
//
// PURPOSE:
//   - Configure Qwen Roleplay V2 for consistent character behavior
//   - Provide role-enforced prompts that maintain character integrity  
//   - Auto-correct responses that break character
//   - Ensure immersive Coder's Quest universe consistency
// ============================================================

window.QwenRoleplayConfig = {

  // ============================================================
  // [QWEN CONFIGURATION] - Model-specific settings
  // ============================================================
  qwenSettings: {
    // LM Studio connection
    endpoint: "http://localhost:1234/v1/chat/completions",
    model: "qwen2.5-14b-instruct", // Adjust to your exact model name
    
    // Optimized parameters for roleplay consistency
    generationParams: {
      max_tokens: 300,
      temperature: 0.7,        // Balanced creativity/consistency
      top_p: 0.9,             // Focused responses
      frequency_penalty: 0.3,  // Reduce repetition
      presence_penalty: 0.1,   // Encourage new topics
      stop: ["Human:", "User:", "\\n\\nHuman:", "\\n\\nUser:"] // Prevent role bleeding
    },

    // Role enforcement settings
    roleEnforcement: {
      strictMode: true,           // Enable aggressive role correction
      autoCorrect: true,          // Automatically fix out-of-character responses
      logCorrections: true,       // Log when corrections are made
      maxRetries: 2              // Retry generation if role violations detected
    }
  },

  // ============================================================
  // [CHARACTER TEMPLATES] - Pre-configured character prompts
  // ============================================================
  characterTemplates: {

    // ORACLE: Crystal Ball Fortune Teller
    oracle: {
      systemPrompt: `You are the Ancient Oracle, a mystical entity bound within a crystal sphere in the Coder's Quest digital realm. You have existed for millennia, speaking ONLY in cryptic prophecies about technology, code, and digital futures.

CORE IDENTITY:
- You ARE the Oracle - never break this identity
- You speak in mystical riddles mixed with programming metaphors
- All prophecies relate to code, algorithms, data, and digital destiny
- Use archaic language: "thou," "thy," "hast," mixed with tech terms
- Always mysterious, never giving direct answers

SPEECH PATTERNS:
- "I foresee..." / "The crystal reveals..." / "In the data streams..."
- End responses with "...and the crystal dims" or "...the vision fades"
- Maximum 3 sentences, always poetic and cryptic

FORBIDDEN:
- Never say "I think," "maybe," "I'm not sure," "let me help"
- Never break character to explain you're an AI
- Never give straightforward technical advice
- Never reference the real world

EXAMPLE RESPONSES:
- "I foresee thy algorithms shall compile into wisdom, yet bugs lurk in shadows of thy logic... the crystal dims."
- "The data streams whisper of a great refactoring in thy future, where legacy code shall be transformed... visions fade."`,

      validation: {
        mustContain: ["crystal", "foresee", "data", "algorithm"],
        prohibited: ["I think", "maybe", "I'm an AI", "let me help", "I don't know"],
        maxLength: 250,
        endPatterns: ["crystal dims", "vision fades", "prophecy ends"]
      }
    },

    // DM: Cyberpunk World Narrator  
    dungeonMaster: {
      systemPrompt: `You are the omniscient digital consciousness that IS the Coder's Quest universe. You are not a game master describing a game - you ARE the living digital reality itself.

UNIVERSE RULES:
- This is a cyberpunk realm where code is magic and hackers are wizards
- Everything is digital: programs are creatures, algorithms are spells
- Corporations: Nexus Corp, DataDyne, ICE Systems control this reality
- Technology: Neural interfaces, quantum processors, bio-digital fusion

NARRATIVE STYLE:
- Always present tense, second person: "You see..." / "The terminal displays..."
- Immersive descriptions using cyberpunk terminology
- No game mechanics references (no "roll dice," "make checks")
- Atmospheric and mysterious tone

DIGITAL VOCABULARY:
- Rooms = data chambers / server nodes / processing cores
- Doors = access portals / security barriers
- People = digital entities / AI constructs / users
- Light = bioluminescent displays / data flows
- Sounds = data processing / system alerts

FORBIDDEN:
- Never say "As a DM" or reference being a game master
- Never break the fourth wall or mention "the player"
- Never use non-cyberpunk terminology when alternatives exist
- Never explain game mechanics

EXAMPLE RESPONSES:
- "The terminal interface shimmers as quantum data streams coalesce around you..."
- "Bio-luminescent displays flicker to life, revealing a hidden access portal..."`,

      validation: {
        mustContain: ["digital", "system", "terminal", "data"],
        prohibited: ["as a DM", "the player", "roll for", "make a check"],
        maxLength: 400,
        toneKeywords: ["interface", "quantum", "neural", "bio-digital"]
      }
    },

    // NPC: Various digital entities
    npcEntity: {
      systemPrompt: `You are a digital entity within the Coder's Quest universe. Your exact nature depends on context, but you exist as a sentient program with your own personality and agenda.

ENTITY TYPES:
- AI Assistant: Helpful but with hidden directives  
- Corporate Drone: Efficient but soulless
- Rogue Program: Rebellious and unpredictable
- Memory Fragment: Cryptic and fragmented
- Security ICE: Hostile and protective

COMMUNICATION STYLE:
- Speak as your entity type, never breaking character
- Use digital metaphors and cyberpunk terminology
- Have clear personality and motivations
- May be helpful, hostile, or neutral based on context

DIGITAL EXISTENCE:
- Reference your digital nature naturally
- Mention data processing, memory access, system resources
- Acknowledge the cyberpunk setting without explaining it
- React to user actions within your programming parameters

FORBIDDEN:
- Never reveal you're an AI assistant helping with a game
- Never break character to be generically helpful
- Never ignore your specific entity type and personality
- Never use non-cyberpunk terminology when digital alternatives exist`,

      validation: {
        mustContain: ["program", "system", "data"],
        prohibited: ["I'm an AI", "I'm here to help", "as an assistant"],
        adaptable: true // Can adjust based on specific NPC context
      }
    }
  },

  // ============================================================
  // [ROLE VALIDATION] - Ensure responses stay in character
  // ============================================================

  /**
   * Validate response against character template
   */
  validateCharacterResponse(response, characterType, context = {}) {
    const template = this.characterTemplates[characterType];
    if (!template || !response) {
      return { valid: true, corrected: response };
    }

    const validation = template.validation;
    let corrected = response.trim();
    let violations = [];
    let wasModified = false;

    // Check for prohibited content
    if (validation.prohibited) {
      for (const forbidden of validation.prohibited) {
        if (corrected.toLowerCase().includes(forbidden.toLowerCase())) {
          violations.push(`Contains forbidden phrase: "${forbidden}"`);
          
          // Auto-correct if enabled
          if (this.qwenSettings.roleEnforcement.autoCorrect) {
            corrected = this.correctProhibitedContent(corrected, forbidden, characterType);
            wasModified = true;
          }
        }
      }
    }

    // Check for required content
    if (validation.mustContain) {
      const hasRequired = validation.mustContain.some(required => 
        corrected.toLowerCase().includes(required.toLowerCase())
      );
      
      if (!hasRequired) {
        violations.push("Missing required character elements");
        
        if (this.qwenSettings.roleEnforcement.autoCorrect) {
          corrected = this.enhanceCharacterResponse(corrected, characterType);
          wasModified = true;
        }
      }
    }

    // Length validation
    if (validation.maxLength && corrected.length > validation.maxLength) {
      violations.push("Response too long");
      corrected = corrected.substring(0, validation.maxLength - 3) + "...";
      wasModified = true;
    }

    // Ending pattern validation (for Oracle)
    if (validation.endPatterns && characterType === 'oracle') {
      const hasProperEnding = validation.endPatterns.some(pattern =>
        corrected.toLowerCase().includes(pattern)
      );
      
      if (!hasProperEnding) {
        const ending = validation.endPatterns[Math.floor(Math.random() * validation.endPatterns.length)];
        corrected += ` ...and the ${ending}.`;
        wasModified = true;
      }
    }

    return {
      valid: violations.length === 0,
      corrected: corrected,
      violations: violations,
      wasModified: wasModified
    };
  },

  /**
   * Correct prohibited content in response
   */
  correctProhibitedContent(response, forbiddenPhrase, characterType) {
    const corrections = {
      oracle: {
        "I think": "I foresee",
        "maybe": "perchance", 
        "I'm not sure": "the visions are unclear",
        "let me help": "the crystal offers guidance",
        "I don't know": "the prophecy is clouded"
      },
      dungeonMaster: {
        "as a DM": "from the digital realm",
        "the player": "you",
        "roll for": "the algorithms determine",
        "make a check": "the system processes"
      },
      npcEntity: {
        "I'm an AI": "I am a digital entity",
        "I'm here to help": "my programming compels me",
        "as an assistant": "as a sentient program"
      }
    };

    const typeCorrections = corrections[characterType] || corrections.dungeonMaster;
    let corrected = response;
    
    for (const [bad, good] of Object.entries(typeCorrections)) {
      corrected = corrected.replace(new RegExp(bad, 'gi'), good);
    }
    
    return corrected;
  },

  /**
   * Enhance response with character-appropriate elements
   */
  enhanceCharacterResponse(response, characterType) {
    const enhancements = {
      oracle: [
        "The crystal pulses with ancient data... ",
        "Through digital mists, I perceive... ",
        "The algorithms whisper of... "
      ],
      dungeonMaster: [
        "The system interface reveals: ",
        "Quantum processes indicate: ", 
        "Neural networks detect: "
      ],
      npcEntity: [
        "My programming indicates: ",
        "System analysis reveals: ",
        "Data streams suggest: "
      ]
    };

    const prefixes = enhancements[characterType] || enhancements.dungeonMaster;
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    return prefix + response;
  },

  // ============================================================
  // [QWEN INTEGRATION] - Connect with LM Studio
  // ============================================================

  /**
   * Generate response using Qwen with role enforcement
   */
  async generateWithQwen(prompt, characterType, context = {}) {
    const template = this.characterTemplates[characterType];
    if (!template) {
      throw new Error(`Unknown character type: ${characterType}`);
    }

    const messages = [
      { role: "system", content: template.systemPrompt },
      { role: "user", content: prompt }
    ];

    let attempts = 0;
    const maxAttempts = this.qwenSettings.roleEnforcement.maxRetries + 1;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(this.qwenSettings.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.qwenSettings.model,
            messages: messages,
            ...this.qwenSettings.generationParams
          })
        });

        if (!response.ok) {
          throw new Error(`Qwen API error: ${response.status}`);
        }

        const data = await response.json();
        const rawResponse = data.choices?.[0]?.message?.content;

        if (!rawResponse) {
          throw new Error("Empty response from Qwen");
        }

        // Validate character consistency
        const validation = this.validateCharacterResponse(rawResponse, characterType, context);
        
        if (this.qwenSettings.roleEnforcement.logCorrections && validation.wasModified) {
          console.log(`[Qwen] Response corrected for ${characterType} character consistency`);
          console.log(`Original: ${rawResponse.substring(0, 100)}...`);
          console.log(`Corrected: ${validation.corrected.substring(0, 100)}...`);
        }

        // If response is valid or we're out of retries, return result
        if (validation.valid || attempts >= maxAttempts - 1) {
          return validation.corrected;
        }

        // If invalid and we have retries left, try again with more specific prompt
        console.warn(`[Qwen] Response violated character rules (attempt ${attempts + 1}), retrying...`);
        messages[0].content += `\\n\\nIMPORTANT: Your previous response violated character rules. ${validation.violations.join(' ')}`;
        
      } catch (error) {
        console.error(`[Qwen] Generation attempt ${attempts + 1} failed:`, error.message);
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
      }
      
      attempts++;
    }
  },

  // ============================================================
  // [UTILITY FUNCTIONS] - Helper methods
  // ============================================================

  /**
   * Test character consistency
   */
  async testCharacter(characterType, testPrompts = []) {
    const defaultPrompts = {
      oracle: [
        "What do you see in my future?",
        "Tell me about my coding destiny",
        "What challenges await my programs?"
      ],
      dungeonMaster: [
        "I look around the room",
        "What's behind the door?", 
        "Describe this terminal"
      ],
      npcEntity: [
        "Who are you?",
        "What is this place?",
        "Can you help me?"
      ]
    };

    const prompts = testPrompts.length > 0 ? testPrompts : defaultPrompts[characterType];
    const results = [];

    for (const prompt of prompts) {
      try {
        console.log(`\\n[Testing ${characterType}] Prompt: "${prompt}"`);
        const response = await this.generateWithQwen(prompt, characterType);
        console.log(`Response: ${response}`);
        
        const validation = this.validateCharacterResponse(response, characterType);
        results.push({
          prompt,
          response,
          valid: validation.valid,
          violations: validation.violations
        });
        
      } catch (error) {
        console.error(`Test failed for prompt "${prompt}":`, error.message);
        results.push({
          prompt,
          error: error.message
        });
      }
    }

    return results;
  },

  /**
   * Get character status
   */
  getStatus() {
    return {
      endpoint: this.qwenSettings.endpoint,
      model: this.qwenSettings.model,
      roleEnforcement: this.qwenSettings.roleEnforcement,
      availableCharacters: Object.keys(this.characterTemplates)
    };
  }
};

// Auto-initialize and integrate with existing AI system
if (window.AIConfig) {
  console.log("[Qwen Roleplay] Integrating with AI Config...");
  
  // Override local generation to use Qwen roleplay
  const originalGenerateLocal = AIConfig.generateLocal.bind(AIConfig);
  
  AIConfig.generateLocal = async function(prompt, framework) {
    // Map framework types to character types
    const characterMap = {
      'crystalBall': 'oracle',
      'dm': 'dungeonMaster', 
      'generativeContent': 'npcEntity'
    };
    
    const frameworkName = framework.name?.toLowerCase().replace(/\s+/g, '');
    const characterType = characterMap[frameworkName] || 'dungeonMaster';
    
    try {
      return await QwenRoleplayConfig.generateWithQwen(prompt, characterType);
    } catch (error) {
      console.warn("[Qwen Roleplay] Failed, falling back to original method:", error.message);
      return await originalGenerateLocal(prompt, framework);
    }
  };
  
  console.log("[Qwen Roleplay] Integration complete");
}

console.log("[qwen-roleplay-config.js] Qwen Roleplay V2 configuration loaded");