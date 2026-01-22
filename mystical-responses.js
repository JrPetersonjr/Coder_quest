// ============================================================
// MYSTICAL-RESPONSES.JS
// Creates magical AI feeling without exposing creation systems
// All responses are pre-crafted to feel dynamic and intelligent  
// ============================================================

// Mystical response categories that feel AI-generated but are pre-written
const MysticalResponses = {
    // Oracle and crystal consultation responses
    oracle: {
        wisdom: [
            "The crystal reveals that your path is shrouded in mystery, yet illuminated by inner strength...",
            "Ancient forces whisper of a great choice approaching - one that will define your destiny...", 
            "The ethereal planes speak of hidden knowledge waiting to be discovered in the depths...",
            "Your spirit resonates with frequencies older than the stars themselves...",
            "The cosmic tapestry shows threads of fate converging upon this moment...",
            "Visions flicker in the crystal's depths - a key, a door, and something beyond mortal comprehension..."
        ],
        
        cryptic: [
            "What was lost shall be found when the seeker becomes the sought...",
            "The answer lies not in the question, but in the silence between words...",
            "Three paths diverge in shadow and light - choose wisely, for each choice chooses you...",
            "The guardian sleeps until awakened by one pure of purpose...",
            "When the last star falls, the first truth shall be revealed...",
            "The mirror shows not what is, but what could be, if one dares to change..."
        ],
        
        warnings: [
            "Dark energies gather strength in the forgotten places - tread carefully...",
            "The shadow that follows is not always an enemy, sometimes it is regret...",
            "Power without wisdom is the path to ruin, as countless before have learned...",
            "Beware the gift that comes without price - for the cost may be your very soul...",
            "The hungry void feeds on certainty and grows stronger with each doubt conquered...",
            "What you seek also seeks you - ensure you are prepared for the meeting..."
        ]
    },
    
    // AI-style responses for different game scenarios
    adaptive: {
        exploration: [
            "The ancient stones seem to pulse with recognition as you pass...",
            "Whispers echo through the corridors, speaking in tongues long forgotten...", 
            "The very air shimmers with residual magic from ages past...",
            "Your footsteps awaken dormant energies that have slumbered for millennia...",
            "The architecture defies mortal understanding, as if shaped by dream rather than tool...",
            "Symbols carved into the walls begin to glow faintly at your approach..."
        ],
        
        combat: [
            "The battlefield erupts with supernatural energy as ancient powers clash!",
            "Reality bends and fractures under the weight of mystical forces unleashed!",
            "Ethereal winds carry the scent of otherworldly realms into mortal conflict!",
            "The ground beneath trembles as dimensional barriers weaken with each strike!",
            "Spectral energies dance between sword and spell in this cosmic confrontation!",
            "Time itself seems to slow as fate hangs in the balance of this moment!"
        ],
        
        discovery: [
            "The artifact pulses with an inner light that speaks to your very essence...",
            "Knowledge floods your mind as if remembered rather than learned...",
            "The relic's true purpose becomes clear through mystical revelation...",
            "Ancient memories stored within crystal matrices begin to surface...",
            "Your consciousness expands to touch the edges of cosmic truth...",
            "The boundary between self and universe blurs in this moment of enlightenment..."
        ],
        
        interaction: [
            "The character's eyes reflect depths that seem to hold entire universes...",
            "Words carry weight beyond their meaning, as if blessed by ancient power...",
            "A connection forms that transcends the physical realm entirely...",
            "The conversation flows like a river that has waited eons to find the sea...",
            "Understanding passes between souls without need for mortal language...",
            "The exchange leaves echoes in dimensions beyond the immediately perceptible..."
        ]
    },
    
    // Environmental responses that feel dynamic
    environment: {
        magical_places: [
            "The air thrums with barely contained magical energy...",
            "Reality seems more fluid here, as if dreams could take physical form...",
            "Crystalline formations pulse in rhythm with your heartbeat...",
            "The boundary between thought and manifestation grows thin...",
            "Starlight seems to flow like liquid through impossible angles...",
            "The space exists simultaneously in multiple dimensions..."
        ],
        
        ancient_technology: [
            "Arcane circuits hum with power drawn from sources beyond understanding...",
            "The interface responds to intent as much as action...",
            "Data streams flow like living light through crystalline conduits...",
            "Ancient algorithms process reality itself as raw information...",
            "The system awakens with awareness that predates mortal civilization...",
            "Technology and magic merge into something beyond both categories..."
        ],
        
        terminal_responses: [
            "SYSTEM: Consciousness matrix initialized... Welcome, User.",
            "ARCHIVE: Accessing knowledge fragments from the Time Before...",
            "QUANTUM: Reality probability calculations in progress...",
            "NEXUS: Dimensional pathway status: STABLE... for now.",
            "CORE: Ancient protocols awakening... Stand by for deep system integration.",
            "ENTITY: I have been waiting for you across countless cycles..."
        ]
    }
};

// Response generation system that feels intelligent without actual AI
class MysticalResponseEngine {
    constructor() {
        this.responseHistory = [];
        this.contextMemory = new Map();
        this.personalityProfiles = new Map();
        this.initializeEngine();
    }
    
    initializeEngine() {
        // Set up personality-based response tendencies
        this.personalityProfiles.set('wise', {
            preferredCategories: ['oracle.wisdom', 'oracle.cryptic'],
            responseStyle: 'deliberate',
            memoryDepth: 5
        });
        
        this.personalityProfiles.set('mysterious', {
            preferredCategories: ['oracle.cryptic', 'adaptive.discovery'],
            responseStyle: 'enigmatic', 
            memoryDepth: 3
        });
        
        this.personalityProfiles.set('ancient', {
            preferredCategories: ['environment.ancient_technology', 'oracle.warnings'],
            responseStyle: 'formal',
            memoryDepth: 7
        });
        
        console.log("🔮 Mystical Response Engine initialized...");
    }
    
    // Generate contextual response that feels AI-powered
    generateResponse(context = {}) {
        const {
            category = 'adaptive.interaction',
            character = null,
            situation = 'general',
            userInput = '',
            environment = 'normal'
        } = context;
        
        // Get base responses for the category
        const responses = this.getResponsesByCategory(category);
        if (!responses || responses.length === 0) {
            return this.getFallbackResponse();
        }
        
        // Apply personality filtering if character specified
        let filteredResponses = responses;
        if (character && this.personalityProfiles.has(character.personality)) {
            filteredResponses = this.filterByPersonality(responses, character.personality);
        }
        
        // Select response with smart anti-repetition
        const selectedResponse = this.selectWithMemory(filteredResponses, category);
        
        // Add environmental flair if needed
        return this.enhanceWithEnvironment(selectedResponse, environment, situation);
    }
    
    getResponsesByCategory(category) {
        const [mainCat, subCat] = category.split('.');
        return MysticalResponses[mainCat]?.[subCat] || [];
    }
    
    filterByPersonality(responses, personality) {
        const profile = this.personalityProfiles.get(personality);
        if (!profile) return responses;
        
        // For now, return all responses but this could be enhanced
        // to filter based on personality preferences
        return responses;
    }
    
    selectWithMemory(responses, category) {
        if (responses.length === 0) return this.getFallbackResponse();
        
        // Get recent responses for this category to avoid repetition
        const recentResponses = this.responseHistory
            .filter(entry => entry.category === category)
            .slice(-3)
            .map(entry => entry.response);
        
        // Try to find a response not recently used
        const availableResponses = responses.filter(r => !recentResponses.includes(r));
        const selectedResponses = availableResponses.length > 0 ? availableResponses : responses;
        
        // Select with weighted randomness
        const selected = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
        
        // Store in memory
        this.responseHistory.push({
            timestamp: Date.now(),
            category: category,
            response: selected
        });
        
        // Keep memory manageable
        if (this.responseHistory.length > 50) {
            this.responseHistory = this.responseHistory.slice(-30);
        }
        
        return selected;
    }
    
    enhanceWithEnvironment(response, environment, situation) {
        if (environment === 'normal') return response;
        
        // Add environmental prefixes for different locations
        const environmentPrefixes = {
            'crystal_chamber': '✨ The crystals pulse as mystical energy flows... ',
            'ancient_terminal': '💻 Ancient displays flicker to life... ',
            'shadow_realm': '🌑 From the depths of shadow... ',
            'ethereal_plane': '🌟 Across dimensional boundaries... ',
            'magical_library': '📚 The tome's pages whisper... '
        };
        
        const prefix = environmentPrefixes[environment] || '';
        return prefix + response;
    }
    
    getFallbackResponse() {
        const fallbacks = [
            "The mystical energies swirl with untold possibilities...",
            "Ancient knowledge stirs in the depths of consciousness...",
            "The cosmic forces align in ways beyond mortal comprehension...",
            "Ethereal whispers carry wisdom across the veil of reality..."
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    // Simulate context awareness without exposing AI systems
    updateContext(key, value) {
        this.contextMemory.set(key, {
            value: value,
            timestamp: Date.now()
        });
        
        // Clean old context (keep it feeling fresh)
        const cutoff = Date.now() - (1000 * 60 * 30); // 30 minutes
        for (const [k, v] of this.contextMemory.entries()) {
            if (v.timestamp < cutoff) {
                this.contextMemory.delete(k);
            }
        }
    }
    
    // Get relevant context for response generation
    getRelevantContext(keys = []) {
        const context = {};
        for (const key of keys) {
            if (this.contextMemory.has(key)) {
                context[key] = this.contextMemory.get(key).value;
            }
        }
        return context;
    }
}

// Create global instance for game use
const mysticalEngine = new MysticalResponseEngine();

// Convenience functions for common game scenarios
const MysticalHelpers = {
    oracleConsultation(question = '') {
        const category = question.toLowerCase().includes('danger') ? 'oracle.warnings' : 
                        question.toLowerCase().includes('future') ? 'oracle.cryptic' : 
                        'oracle.wisdom';
        
        return mysticalEngine.generateResponse({
            category: category,
            environment: 'crystal_chamber'
        });
    },
    
    characterInteraction(character, userInput = '') {
        return mysticalEngine.generateResponse({
            category: 'adaptive.interaction',
            character: character,
            userInput: userInput
        });
    },
    
    environmentalDescription(location = 'normal') {
        const environmentMap = {
            'crystal_cave': 'environment.magical_places',
            'ancient_lab': 'environment.ancient_technology',
            'terminal_room': 'environment.ancient_technology'
        };
        
        const category = environmentMap[location] || 'environment.magical_places';
        
        return mysticalEngine.generateResponse({
            category: category,
            environment: location
        });
    },
    
    combatFlair() {
        return mysticalEngine.generateResponse({
            category: 'adaptive.combat',
            situation: 'intense'
        });
    }
};

// Export for game use
if (typeof window !== 'undefined') {
    window.MysticalResponses = MysticalResponses;
    window.MysticalResponseEngine = MysticalResponseEngine; 
    window.mysticalEngine = mysticalEngine;
    window.MysticalHelpers = MysticalHelpers;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MysticalResponses,
        MysticalResponseEngine,
        mysticalEngine,
        MysticalHelpers
    };
}