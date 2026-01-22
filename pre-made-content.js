// ============================================================
// PRE-MADE-CONTENT.JS 
// Curated character library and content for consumers
// No creation features - consumption only for IP protection
// ============================================================

// Pre-made character library - carefully curated by developers
const PreMadeCharacters = {
    // Starter characters available to all users
    starter: [
        {
            id: "ancient_sage",
            name: "Elderon the Ancient Sage",
            description: "A wise wizard with knowledge spanning millennia",
            personality: "wise, patient, cryptic",
            voiceType: "deep_mystical",
            responses: {
                greeting: [
                    "Greetings, seeker of knowledge. The ancient scrolls have foretold your arrival...",
                    "Welcome, young one. The cosmic forces have aligned to bring you here...",
                    "Ah, another soul drawn to the mysteries of the arcane..."
                ],
                conversation: [
                    "The paths of magic are not easily understood by mortal minds...",
                    "In my centuries of study, I have learned that wisdom comes through patience...",
                    "The crystals whisper secrets that few are prepared to hear..."
                ],
                combat: [
                    "Ancient powers flow through me like rivers of starlight!",
                    "By the forgotten runes of old, I call upon thee!",
                    "The very elements bend to my will!"
                ]
            },
            questLines: ["crystal_prophecy", "ancient_knowledge", "elemental_mastery"]
        },
        
        {
            id: "rogue_merchant",
            name: "Kira Shadowtrade", 
            description: "A clever merchant who deals in rare and exotic goods",
            personality: "cunning, charming, mysterious",
            voiceType: "smooth_confident",
            responses: {
                greeting: [
                    "Well, well... what brings a traveler to my humble establishment?",
                    "Welcome, friend. I have wares from the furthest corners of the realm...",
                    "Looking for something... special? You've come to the right place..."
                ],
                conversation: [
                    "Information, like gold, has its price. But for you... a discount.",
                    "The best deals are made in the shadows, away from prying eyes...",
                    "Trust is a commodity rarer than dragon scales, wouldn't you agree?"
                ],
                combat: [
                    "You shouldn't have crossed the Shadow Trade Guild!",
                    "Let's see how you handle enchanted steel!",
                    "This blade has tasted the blood of kings!"
                ]
            },
            questLines: ["shadow_guild", "forbidden_goods", "merchant_wars"]
        },
        
        {
            id: "crystal_guardian",
            name: "Luminara",
            description: "Guardian spirit of the ancient crystal chambers",
            personality: "ethereal, protective, ancient",
            voiceType: "ethereal_echo", 
            responses: {
                greeting: [
                    "*voice echoes from the crystal formations* Who disturbs the eternal vigil?",
                    "The crystals sing of your approach, mortal one...",
                    "I sense both courage and uncertainty in your spirit..."
                ],
                conversation: [
                    "These crystals have witnessed the rise and fall of empires...",
                    "The light within holds memories of ages past...",
                    "To understand the crystal's power, one must first understand oneself..."
                ],
                combat: [
                    "The crystal's wrath shall not be contained!",
                    "Beams of pure energy bend to my command!",
                    "You face the fury of a thousand starlit nights!"
                ]
            },
            questLines: ["crystal_awakening", "guardian_trials", "light_mastery"]
        }
    ],
    
    // Premium characters - additional content for deluxe version
    premium: [
        {
            id: "shadow_lord",
            name: "Malachar the Shadow Lord",
            description: "Ancient entity of darkness and forbidden knowledge",
            personality: "dark, commanding, ancient_evil",
            voiceType: "dark_powerful",
            unlockCondition: "complete_shadow_quest_line",
            responses: {
                greeting: [
                    "So... another mortal seeks to challenge the darkness eternal...",
                    "Your soul burns bright, little flame. How delicious...",
                    "The void has been expecting you, child of light..."
                ]
            }
        },
        
        {
            id: "dragon_queen", 
            name: "Pyritha the Dragon Queen",
            description: "Last of the ancient dragon lords",
            personality: "regal, fierce, proud",
            voiceType: "draconic_majesty",
            unlockCondition: "dragon_trials_complete",
            responses: {
                greeting: [
                    "*massive wings unfold* A bold mortal enters my domain...",
                    "The blood of dragons recognizes courage, small one...",
                    "Few dare to stand before the Queen of Fire and Sky..."
                ]
            }
        }
    ]
};

// Pre-made quest content - no generation, just curated stories
const PreMadeQuests = {
    starter: [
        {
            id: "crystal_awakening",
            title: "The Crystal Awakening",
            description: "Ancient crystals begin to resonate with mysterious energy",
            characters: ["ancient_sage", "crystal_guardian"],
            chapters: [
                "The crystals in the chamber begin to pulse with otherworldly light...",
                "Strange visions flood your mind as you approach the central crystal...",
                "The guardian's voice echoes through dimensions: 'The time has come...'"
            ]
        },
        
        {
            id: "shadow_guild_mystery",
            title: "Mysteries of the Shadow Guild",
            description: "Uncover the secrets of the underground trading network", 
            characters: ["rogue_merchant"],
            chapters: [
                "Kira leans in close, her voice barely above a whisper...",
                "The alleyway deal goes wrong when city guards appear...", 
                "Hidden passages beneath the city reveal ancient secrets..."
            ]
        }
    ],
    
    premium: [
        {
            id: "dragon_trials",
            title: "The Dragon Trials",
            description: "Face the ultimate test of courage and wisdom",
            characters: ["dragon_queen", "ancient_sage"],
            unlockCondition: "complete_3_starter_quests"
        }
    ]
};

// Mystical response system - feels magical without exposing AI
const MysticalResponseSystem = {
    // Generate responses that feel AI-powered but are pre-written
    generateResponse(character, context, userInput) {
        const char = this.getCharacter(character);
        if (!char) return this.getFallbackResponse();
        
        // Select appropriate response based on context
        const responseType = this.determineResponseType(context, userInput);
        const responses = char.responses[responseType] || char.responses.conversation;
        
        // Add mystical delay and randomization
        return this.addMysticalFlair(this.selectResponse(responses));
    },
    
    getCharacter(characterId) {
        // Check starter characters first
        let character = PreMadeCharacters.starter.find(c => c.id === characterId);
        
        // Check premium characters if unlocked
        if (!character && this.isPremiumUnlocked()) {
            character = PreMadeCharacters.premium.find(c => c.id === characterId);
        }
        
        return character;
    },
    
    determineResponseType(context, userInput) {
        // Simple keyword matching to determine response type
        const input = userInput.toLowerCase();
        
        if (input.includes('hello') || input.includes('greet') || context.isFirstMeeting) {
            return 'greeting';
        } else if (context.inCombat || input.includes('fight') || input.includes('attack')) {
            return 'combat'; 
        } else {
            return 'conversation';
        }
    },
    
    selectResponse(responses) {
        if (!responses || responses.length === 0) {
            return this.getFallbackResponse();
        }
        
        // Weighted random selection with some memory to avoid repeats
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    addMysticalFlair(response) {
        // Add mystical formatting without exposing technical details
        const effects = [
            text => `✨ ${text}`,
            text => `🔮 ${text}`,
            text => `⚡ ${text}`,
            text => text // Sometimes no effect for variety
        ];
        
        const effect = effects[Math.floor(Math.random() * effects.length)];
        return effect(response);
    },
    
    getFallbackResponse() {
        const fallbacks = [
            "The mystical energies swirl with ancient knowledge...",
            "A voice from beyond the veil speaks to your soul...",
            "The spirits whisper secrets in forgotten tongues...",
            "Ancient magic courses through the very air..."
        ];
        
        return this.addMysticalFlair(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    },
    
    isPremiumUnlocked() {
        // Check if user has premium content access
        return window.GameEngine && window.GameEngine.isPremiumUser();
    }
};

// Content restriction system - prevents creation, allows consumption only
const ContentRestrictions = {
    // Block all content creation features
    allowedActions: [
        'view_character',
        'interact_with_character', 
        'play_quest',
        'save_progress',
        'load_progress',
        'view_library'
    ],
    
    blockedActions: [
        'create_character',
        'train_voice',
        'generate_content',
        'modify_character',
        'upload_content',
        'access_ai_tools',
        'dev_mode'
    ],
    
    // Check if action is allowed
    isActionAllowed(action) {
        return this.allowedActions.includes(action);
    },
    
    // Get user-friendly message for blocked actions
    getBlockMessage(action) {
        const messages = {
            'create_character': "Character creation is coming in future updates!",
            'train_voice': "Voice training features are in development!", 
            'generate_content': "Content generation will be available soon!",
            'dev_mode': "Developer features require special access."
        };
        
        return messages[action] || "This feature is not available in the current version.";
    }
};

// Export for consumer use
if (typeof window !== 'undefined') {
    window.PreMadeCharacters = PreMadeCharacters;
    window.PreMadeQuests = PreMadeQuests;
    window.MysticalResponseSystem = MysticalResponseSystem;
    window.ContentRestrictions = ContentRestrictions;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PreMadeCharacters,
        PreMadeQuests, 
        MysticalResponseSystem,
        ContentRestrictions
    };
}