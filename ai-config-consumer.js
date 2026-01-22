// ============================================================
// AI-CONFIG-CONSUMER.JS 
// Consumer-safe AI configuration - Browser models only
// No external dependencies, no setup required
// ============================================================

// Consumer-friendly AI configuration
const AIConfig = {
    // Browser-only AI models for public deployment
    browserModels: {
        // Lightweight conversation model
        conversation: {
            enabled: true,
            model: "browser-chat-lite",
            maxTokens: 500,
            temperature: 0.7,
            purpose: "Basic NPC conversations and responses"
        },
        
        // Simple voice synthesis
        voice: {
            enabled: true,
            model: "browser-tts-basic", 
            quality: "standard",
            voices: ["narrator", "guard", "merchant", "sage"],
            purpose: "Character voice generation"
        },
        
        // Offline story generation
        story: {
            enabled: true,
            model: "browser-story-lite",
            context: "fantasy_rpg",
            purpose: "Dynamic quest and dialogue generation"
        }
    },
    
    // Hide advanced AI orchestration from public view
    advancedFeatures: {
        multiModelDelegation: false,
        voiceTraining: false, 
        characterGeneration: false,
        databaseCaching: false,
        externalAPIs: false
    },
    
    // Consumer experience settings
    userExperience: {
        seamlessAI: true,           // Hide AI processing indicators
        magicalFeeling: true,       // Make AI feel like game magic
        noSetupRequired: true,      // Zero configuration
        hideComplexity: true,       // Don't show technical details
        instantResponse: true       // Use cached responses when possible
    },
    
    // Fallback responses for when browser AI isn't available
    fallbackResponses: {
        conversation: [
            "The ancient magic stirs with mysterious energy...",
            "A whisper from the void reaches your consciousness...",
            "The crystal resonates with otherworldly knowledge...",
            "The spirits speak in riddles and forgotten tongues..."
        ],
        
        voice: {
            useSystemTTS: true,
            defaultVoice: "system",
            mysticalPrefix: "*mystical voice*"
        },
        
        story: [
            "The path ahead shimmers with possibility...",
            "Fate weaves new threads in the tapestry of your quest...",
            "The world responds to your presence with subtle changes...",
            "Ancient forces align to guide your journey..."
        ]
    }
};

// Consumer-safe AI interface - simplified and magical
class ConsumerAI {
    constructor() {
        this.isReady = false;
        this.mysticalEngine = null;
        this.contentLibrary = null;
        this.loadingResponses = [
            "Consulting the ancient spirits...",
            "Reading the mystical energies...", 
            "Channeling otherworldly wisdom...",
            "Awakening dormant magic..."
        ];
        this.initializeConsumerAI();
    }
    
    async initializeConsumerAI() {
        try {
            // Load pre-made content library
            await this.loadContentLibrary();
            
            // Initialize mystical response engine
            this.mysticalEngine = window.mysticalEngine || new MysticalResponseEngine();
            
            // Load browser models if available
            await this.loadBrowserModels();
            
            this.isReady = true;
            console.log("✨ Mystical AI powers awakened - Consumer Edition");
        } catch (error) {
            console.log("⚡ Using mystical fallback responses");
            this.isReady = false;
        }
    }
    
    async loadContentLibrary() {
        // Initialize pre-made content systems
        if (window.PreMadeCharacters && window.MysticalResponseSystem) {
            this.contentLibrary = {
                characters: window.PreMadeCharacters,
                responses: window.MysticalResponseSystem,
                restrictions: window.ContentRestrictions
            };
            console.log("📚 Curated content library loaded");
        } else {
            throw new Error("Content library not available");
        }
    }
    
    async loadBrowserModels() {
        // Simulate loading browser models (actual implementation would load real models)
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("📚 Ancient knowledge libraries loaded");
                resolve();
            }, 1000);
        });
    }
    
    // Generate response using curated content and mystical systems
    async generateResponse(type, input, context = {}) {
        // Check if action is allowed in consumer version
        if (this.contentLibrary?.restrictions && !this.contentLibrary.restrictions.isActionAllowed(type)) {
            return this.contentLibrary.restrictions.getBlockMessage(type);
        }
        
        // Show mystical loading message
        const loadingMsg = this.getRandomLoading();
        console.log(loadingMsg);
        
        // Route to appropriate content system
        switch (type) {
            case 'character_interaction':
                return await this.handleCharacterInteraction(input, context);
            case 'oracle_consultation':
                return await this.handleOracleConsultation(input, context);
            case 'environment_description':
                return await this.handleEnvironmentDescription(input, context);
            case 'quest_content':
                return await this.handleQuestContent(input, context);
            default:
                return await this.handleGenericResponse(input, context);
        }
    }
    
    async handleCharacterInteraction(input, context) {
        if (this.contentLibrary?.responses) {
            return this.contentLibrary.responses.generateResponse(
                context.characterId, context, input
            );
        } else if (this.mysticalEngine) {
            return this.mysticalEngine.generateResponse({
                category: 'adaptive.interaction',
                character: context.character,
                userInput: input
            });
        }
        return this.getMysticalFallback('conversation');
    }
    
    async handleOracleConsultation(input, context) {
        if (this.mysticalEngine && window.MysticalHelpers) {
            return window.MysticalHelpers.oracleConsultation(input);
        }
        return this.getMysticalFallback('oracle');
    }
    
    async handleEnvironmentDescription(input, context) {
        if (this.mysticalEngine && window.MysticalHelpers) {
            return window.MysticalHelpers.environmentalDescription(context.location);
        }
        return this.getMysticalFallback('environment');
    }
    
    async handleQuestContent(input, context) {
        // Use pre-made quest content only
        if (this.contentLibrary?.characters?.starter) {
            const quest = window.PreMadeQuests?.starter?.find(q => q.id === context.questId);
            if (quest) {
                return quest.chapters[context.chapterIndex || 0];
            }
        }
        return this.getMysticalFallback('quest');
    }
    
    async handleGenericResponse(input, context) {
        if (this.mysticalEngine) {
            return this.mysticalEngine.generateResponse({
                category: 'adaptive.interaction',
                situation: context.situation || 'general'
            });
        }
        return this.getMysticalFallback('generic');
    }
    
    async generateConversation(input, context) {
        // Simulate mystical AI conversation generation
        const responses = [
            "The crystal's light flickers as ancient wisdom flows through...",
            "A voice echoes from beyond the veil of reality...",
            "The spirits whisper secrets in the language of old...",
            "Mystical energies coalesce into meaningful words..."
        ];
        
        // Add slight delay to feel magical, not instant
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    async generateVoice(input, context) {
        // Browser-based voice synthesis without exposing voice training
        if ('speechSynthesis' in window) {
            return {
                type: 'browser_speech',
                text: input,
                voice: context.character || 'mystical',
                ready: true
            };
        } else {
            return {
                type: 'text_only',
                text: `*${context.character || 'mystical'} voice* ${input}`,
                ready: true
            };
        }
    }
    
    async generateStory(input, context) {
        // Generate story content without revealing complexity
        const storyElements = [
            "The path diverges into shadow and light...",
            "Ancient runes begin to glow with inner fire...", 
            "A distant melody carries on the wind...",
            "The very air trembles with magical potential...",
            "Whispers of forgotten legends stir the soul..."
        ];
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return storyElements[Math.floor(Math.random() * storyElements.length)];
    }
    
    getRandomLoading() {
        return this.loadingResponses[Math.floor(Math.random() * this.loadingResponses.length)];
    }
    
    getMysticalFallback(type) {
        const fallbacks = AIConfig.fallbackResponses[type];
        if (Array.isArray(fallbacks)) {
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        } else if (fallbacks && fallbacks.useSystemTTS) {
            return { type: 'system_fallback', message: "The mystical energies are dormant..." };
        }
        return "The ancient magic remains silent...";
    }
}

// Initialize consumer AI globally
window.ConsumerAI = new ConsumerAI();

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIConfig, ConsumerAI };
}