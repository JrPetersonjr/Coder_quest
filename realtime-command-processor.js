// ============================================================
// REALTIME-COMMAND-PROCESSOR.JS
// Real-time natural language processing for live gameplay commands
// Voice, text, gesture integration for seamless god mode experience
// ============================================================

class RealTimeCommandProcessor {
    constructor(agentic3DFramework) {
        this.framework = agentic3DFramework;
        this.isListening = false;
        this.commandQueue = [];
        this.processingCommand = false;
        this.contextMemory = [];
        this.playerState = {};
        this.gameState = {};
        
        // Command processing modes
        this.processingModes = {
            'instant': { delay: 0, batch: false },
            'queued': { delay: 100, batch: true },
            'cinematic': { delay: 500, batch: false, dramatic: true }
        };
        
        this.currentMode = 'instant';
        
        this.initializeProcessor();
        
        console.log("⚡ Real-time Command Processor initialized");
    }
    
    initializeProcessor() {
        // Set up continuous listening
        this.setupContinuousListening();
        
        // Initialize natural language understanding
        this.setupNLU();
        
        // Start real-time processing loop
        this.startProcessingLoop();
        
        // Initialize context awareness
        this.setupContextAwareness();
    }
    
    setupContinuousListening() {
        // Multiple input methods
        this.inputMethods = {
            voice: new ContinuousVoiceCapture(),
            text: new TextCommandCapture(),
            gesture: new GestureCommandCapture(),
            controller: new ControllerCommandCapture()
        };
        
        // Bind all input methods to processor
        for (const [method, capturer] of Object.entries(this.inputMethods)) {
            capturer.onCommand = (command, metadata) => {
                this.queueCommand(command, method, metadata);
            };
        }
    }
    
    setupNLU() {
        this.nlu = new AdvancedNLU();
        
        // Gaming-specific intent patterns
        this.nlu.addIntentPatterns({
            // Environment modification
            'environment.gravity': [
                'reduce gravity here', 'less gravity', 'make gravity lighter',
                'increase gravity', 'more gravity', 'make it heavier'
            ],
            
            'environment.lighting': [
                'make it brighter', 'add lighting', 'more light here',
                'make it darker', 'dim the lights', 'reduce lighting'
            ],
            
            'environment.weather': [
                'make it rain', 'start a storm', 'clear the sky',
                'add fog', 'make it windy', 'change the weather'
            ],
            
            // NPC commands
            'npc.spawn': [
                'create a merchant here', 'spawn a guard', 'add an NPC',
                'generate a character', 'make a person appear'
            ],
            
            'npc.modify': [
                'make them faster', 'change their behavior', 'make them friendly',
                'give them a weapon', 'change their appearance'
            ],
            
            // Asset manipulation
            'asset.place': [
                'put a car here', 'add a building', 'place a tree',
                'spawn some barrels', 'create a fence'
            ],
            
            'asset.move': [
                'move that car', 'push the boulder', 'lift that object',
                'throw this over there', 'rotate that building'
            ],
            
            // Cinematic commands
            'cinematic.effect': [
                'create an explosion', 'add some fire', 'make smoke',
                'trigger special effects', 'add dramatic lighting'
            ],
            
            'cinematic.camera': [
                'follow the action', 'get a close up', 'wide angle shot',
                'dramatic camera angle', 'cinematic view'
            ],
            
            // Music and audio
            'audio.music': [
                'play epic music', 'start battle music', 'ambient sounds',
                'dramatic soundtrack', 'silence the music'
            ],
            
            'audio.effects': [
                'add sound effects', 'play explosion sound', 'footstep sounds',
                'environmental audio', 'realistic sounds'
            ],
            
            // Physics manipulation
            'physics.modify': [
                'make this bouncy', 'remove friction', 'increase mass',
                'make it float', 'freeze in place', 'make it heavy'
            ]
        });
    }
    
    setupContextAwareness() {
        this.contextTracker = new ContextTracker();
        
        // Track what the player is looking at
        this.contextTracker.onLookAtChange = (target) => {
            this.currentLookTarget = target;
        };
        
        // Track player actions
        this.contextTracker.onActionChange = (action) => {
            this.currentPlayerAction = action;
        };
        
        // Track recent commands for context
        this.contextTracker.onCommandComplete = (result) => {
            this.contextMemory.push({
                command: result.originalCommand,
                intent: result.intent,
                success: result.success,
                timestamp: Date.now()
            });
            
            // Keep last 10 commands for context
            if (this.contextMemory.length > 10) {
                this.contextMemory.shift();
            }
        };
    }
    
    // ============================================================
    // COMMAND PROCESSING
    // ============================================================
    
    queueCommand(command, inputMethod, metadata = {}) {
        const commandData = {
            text: command,
            inputMethod: inputMethod,
            metadata: metadata,
            timestamp: Date.now(),
            context: this.getCurrentContext(),
            priority: this.calculatePriority(command, inputMethod)
        };
        
        console.log(`📝 Command queued: "${command}" (${inputMethod})`);
        
        this.commandQueue.push(commandData);
        this.sortCommandQueue();
    }
    
    sortCommandQueue() {
        // Sort by priority (higher first) and timestamp (earlier first)
        this.commandQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
        });
    }
    
    calculatePriority(command, inputMethod) {
        let priority = 0;
        
        // Input method priorities
        if (inputMethod === 'gesture') priority += 10; // Gestures are immediate
        if (inputMethod === 'voice') priority += 5;
        if (inputMethod === 'text') priority += 2;
        
        // Command urgency
        if (command.toLowerCase().includes('emergency')) priority += 20;
        if (command.toLowerCase().includes('stop')) priority += 15;
        if (command.toLowerCase().includes('undo')) priority += 12;
        if (command.toLowerCase().includes('explosion')) priority += 8;
        
        return priority;
    }
    
    startProcessingLoop() {
        setInterval(() => {
            this.processNextCommand();
        }, 50); // 20 FPS processing rate
    }
    
    async processNextCommand() {
        if (this.processingCommand || this.commandQueue.length === 0) {
            return;
        }
        
        this.processingCommand = true;
        
        try {
            const commandData = this.commandQueue.shift();
            await this.executeCommand(commandData);
        } catch (error) {
            console.error("❌ Command processing error:", error);
        } finally {
            this.processingCommand = false;
        }
    }
    
    async executeCommand(commandData) {
        console.log(`⚡ Executing: "${commandData.text}"`);
        
        // Parse command with NLU
        const nluResult = await this.nlu.parse(commandData.text, commandData.context);
        
        // Enhance with real-time context
        const enhancedIntent = this.enhanceWithContext(nluResult, commandData);
        
        // Execute through framework
        const result = await this.framework.processGodCommand(
            enhancedIntent.command,
            enhancedIntent.context
        );
        
        // Provide feedback
        this.provideFeedback(result, commandData);
        
        // Update context
        this.updateContext(commandData, result);
        
        return result;
    }
    
    enhanceWithContext(nluResult, commandData) {
        const enhanced = { ...nluResult };
        
        // Add spatial context
        if (commandData.metadata.targetPosition) {
            enhanced.context.targetPosition = commandData.metadata.targetPosition;
        } else if (this.currentLookTarget) {
            enhanced.context.targetPosition = this.currentLookTarget.position;
        } else {
            enhanced.context.targetPosition = this.framework.realTimeContext.playerPosition;
        }
        
        // Add temporal context
        enhanced.context.recentCommands = this.contextMemory.slice(-3);
        enhanced.context.playerAction = this.currentPlayerAction;
        
        // Add environmental context
        enhanced.context.gameState = this.gameState;
        enhanced.context.playerState = this.playerState;
        
        return enhanced;
    }
    
    provideFeedback(result, commandData) {
        if (result.success) {
            this.showSuccessFeedback(result, commandData);
        } else {
            this.showErrorFeedback(result, commandData);
        }
    }
    
    showSuccessFeedback(result, commandData) {
        const feedback = {
            type: 'success',
            message: this.generateSuccessMessage(result),
            visual: this.createVisualFeedback(result),
            audio: this.createAudioFeedback(result),
            haptic: this.createHapticFeedback(result)
        };
        
        this.displayFeedback(feedback);
        
        console.log(`✅ ${commandData.text} → ${feedback.message}`);
    }
    
    showErrorFeedback(result, commandData) {
        const feedback = {
            type: 'error',
            message: `Could not execute: ${commandData.text}`,
            suggestion: this.generateSuggestion(commandData),
            visual: { color: 'red', duration: 1000 },
            audio: { sound: 'error_beep' }
        };
        
        this.displayFeedback(feedback);
        
        console.log(`❌ ${commandData.text} → Failed`);
    }
    
    generateSuccessMessage(result) {
        const messages = {
            'gravity_modified': '🌌 Gravity field altered',
            'npc_spawned': '👤 Character created',
            'lighting_adjusted': '💡 Lighting changed',
            'effect_triggered': '💥 Effect triggered',
            'asset_placed': '📦 Object placed',
            'physics_modified': '⚛️ Physics adjusted',
            'music_started': '🎵 Music playing',
            'camera_moved': '📹 Camera adjusted'
        };
        
        return messages[result.effect] || '✨ Command executed';
    }
    
    getCurrentContext() {
        return {
            playerPosition: this.framework.realTimeContext.playerPosition,
            playerLookDirection: this.framework.realTimeContext.playerLookDirection,
            lookTarget: this.currentLookTarget,
            playerAction: this.currentPlayerAction,
            timestamp: Date.now(),
            gameMode: this.currentMode
        };
    }
    
    // ============================================================
    // SPECIAL COMMAND PROCESSING
    // ============================================================
    
    async processEmergencyCommand(command) {
        // Emergency commands bypass queue
        console.log(`🚨 Emergency command: ${command}`);
        
        if (command.toLowerCase().includes('stop')) {
            await this.stopAllActions();
        } else if (command.toLowerCase().includes('undo')) {
            await this.undoLastAction();
        } else if (command.toLowerCase().includes('reset')) {
            await this.resetToSafeState();
        }
    }
    
    async processContextualCommand(command, gestureData) {
        // Commands enhanced with gesture data
        const enhancedCommand = this.combineCommandWithGesture(command, gestureData);
        
        await this.framework.processGodCommand(enhancedCommand.text, enhancedCommand.context);
    }
    
    combineCommandWithGesture(command, gestureData) {
        return {
            text: command,
            context: {
                gestureType: gestureData.type,
                gesturePosition: gestureData.position,
                gestureIntensity: gestureData.intensity,
                gestureDirection: gestureData.direction
            }
        };
    }
    
    // ============================================================
    // INTELLIGENT COMMAND ENHANCEMENT
    // ============================================================
    
    async enhanceCommandWithAI(command, context) {
        // Use AI to make commands more specific and actionable
        const enhancement = await this.nlu.enhance(command, context);
        
        // Add missing parameters
        if (!enhancement.position && context.playerPosition) {
            enhancement.position = context.playerPosition;
        }
        
        // Infer intent from context
        if (!enhancement.intent && context.recentCommands) {
            enhancement.intent = this.inferIntentFromHistory(context.recentCommands);
        }
        
        return enhancement;
    }
    
    inferIntentFromHistory(recentCommands) {
        // Look for patterns in recent commands
        const patterns = recentCommands.map(cmd => cmd.intent).slice(-3);
        
        // If all recent commands were lighting related, default to lighting
        if (patterns.every(p => p?.includes('lighting'))) {
            return 'lighting_adjustment';
        }
        
        // If recent commands were about NPCs, default to NPC
        if (patterns.some(p => p?.includes('npc'))) {
            return 'npc_interaction';
        }
        
        return 'environment_modification';
    }
    
    // ============================================================
    // CONTINUOUS LEARNING
    // ============================================================
    
    learnFromUsage() {
        // Learn user preferences and common patterns
        const userPatterns = this.analyzeCommandPatterns();
        
        // Adapt NLU to user's vocabulary
        this.nlu.adaptToUser(userPatterns);
        
        // Optimize command priorities based on usage
        this.optimizePriorities(userPatterns);
    }
    
    analyzeCommandPatterns() {
        return {
            commonCommands: this.getCommonCommands(),
            preferredTerms: this.getPreferredTerms(),
            usageFrequency: this.getUsageFrequency(),
            errorPatterns: this.getErrorPatterns()
        };
    }
    
    getCommonCommands() {
        const commandCounts = {};
        
        this.contextMemory.forEach(cmd => {
            commandCounts[cmd.command] = (commandCounts[cmd.command] || 0) + 1;
        });
        
        return Object.entries(commandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }
    
    // ============================================================
    // UTILITY METHODS
    // ============================================================
    
    updateContext(commandData, result) {
        // Update game state based on command result
        if (result.success) {
            this.gameState.lastCommandSuccess = true;
            this.gameState.lastEffect = result.effect;
        } else {
            this.gameState.lastCommandSuccess = false;
            this.gameState.lastError = result.error;
        }
        
        this.gameState.lastCommand = commandData.text;
        this.gameState.lastCommandTime = Date.now();
    }
    
    displayFeedback(feedback) {
        // Display feedback in UI/VR/HUD
        if (this.framework.engineAdapter.showFeedback) {
            this.framework.engineAdapter.showFeedback(feedback);
        } else {
            console.log(`💬 ${feedback.message}`);
        }
    }
    
    createVisualFeedback(result) {
        return {
            color: 'green',
            duration: 2000,
            position: result.targetPosition,
            effect: 'success_glow'
        };
    }
    
    createAudioFeedback(result) {
        return {
            sound: 'success_chime',
            volume: 0.7,
            position: result.targetPosition
        };
    }
    
    createHapticFeedback(result) {
        return {
            pattern: [100, 50, 100],
            intensity: 0.8
        };
    }
    
    // ============================================================
    // EMERGENCY CONTROLS
    // ============================================================
    
    async stopAllActions() {
        console.log("🛑 Stopping all actions");
        
        // Clear command queue
        this.commandQueue.length = 0;
        
        // Stop current processing
        this.processingCommand = false;
        
        // Send stop command to all agents
        await this.framework.agents.forEach(async (agent) => {
            if (agent.stop) {
                await agent.stop();
            }
        });
    }
    
    async undoLastAction() {
        const lastAction = this.contextMemory[this.contextMemory.length - 1];
        
        if (lastAction && lastAction.success) {
            console.log(`↩️ Undoing: ${lastAction.command}`);
            
            const undoCommand = this.generateUndoCommand(lastAction);
            await this.framework.processGodCommand(undoCommand.text, undoCommand.context);
        }
    }
    
    generateUndoCommand(action) {
        const undoMappings = {
            'gravity_modified': 'reset gravity to normal',
            'npc_spawned': 'remove last spawned npc',
            'lighting_adjusted': 'reset lighting to default',
            'asset_placed': 'remove last placed object',
            'effect_triggered': 'clear visual effects'
        };
        
        const undoText = undoMappings[action.intent] || 'undo last action';
        
        return {
            text: undoText,
            context: { undoAction: action }
        };
    }
    
    setProcessingMode(mode) {
        if (this.processingModes[mode]) {
            this.currentMode = mode;
            console.log(`🎮 Processing mode: ${mode}`);
        }
    }
}

// ============================================================
// SUPPORTING CLASSES
// ============================================================

class ContinuousVoiceCapture {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.setupVoiceRecognition();
    }
    
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                if (result.isFinal && this.onCommand) {
                    this.onCommand(result[0].transcript, {
                        confidence: result[0].confidence,
                        inputMethod: 'voice'
                    });
                }
            };
            
            this.startListening();
        }
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.isListening = true;
            console.log("🎙️ Voice capture active");
        }
    }
}

class TextCommandCapture {
    constructor() {
        this.setupKeyboardCapture();
    }
    
    setupKeyboardCapture() {
        // Listen for quick command hotkey (e.g., backtick key)
        document.addEventListener('keydown', (event) => {
            if (event.key === '`' && !event.ctrlKey && !event.altKey) {
                this.showCommandInput();
            }
        });
    }
    
    showCommandInput() {
        const input = prompt("🎮 God Command:");
        if (input && this.onCommand) {
            this.onCommand(input, {
                inputMethod: 'text',
                timestamp: Date.now()
            });
        }
    }
}

class AdvancedNLU {
    constructor() {
        this.intentPatterns = new Map();
        this.entityExtractor = new EntityExtractor();
        this.contextResolver = new ContextResolver();
    }
    
    addIntentPatterns(patterns) {
        for (const [intent, phrases] of Object.entries(patterns)) {
            this.intentPatterns.set(intent, phrases);
        }
    }
    
    async parse(text, context = {}) {
        const lowercaseText = text.toLowerCase();
        
        // Find matching intent
        let matchedIntent = null;
        let confidence = 0;
        
        for (const [intent, phrases] of this.intentPatterns) {
            for (const phrase of phrases) {
                const similarity = this.calculateSimilarity(lowercaseText, phrase);
                if (similarity > confidence) {
                    confidence = similarity;
                    matchedIntent = intent;
                }
            }
        }
        
        // Extract entities
        const entities = this.entityExtractor.extract(text);
        
        // Resolve context
        const resolvedContext = this.contextResolver.resolve(context, entities);
        
        return {
            intent: matchedIntent,
            confidence: confidence,
            entities: entities,
            context: resolvedContext,
            originalText: text,
            command: this.generateCommand(matchedIntent, entities, text)
        };
    }
    
    calculateSimilarity(text1, text2) {
        // Simple similarity calculation - could use more sophisticated algorithms
        const words1 = text1.split(' ');
        const words2 = text2.split(' ');
        
        let matches = 0;
        for (const word of words1) {
            if (words2.includes(word)) {
                matches++;
            }
        }
        
        return matches / Math.max(words1.length, words2.length);
    }
    
    generateCommand(intent, entities, originalText) {
        // Convert intent and entities back to command format
        if (!intent) return originalText;
        
        const baseCommand = intent.replace('.', ' ');
        
        // Add entity information
        if (entities.length > 0) {
            const entityText = entities.map(e => e.value).join(' ');
            return `${baseCommand} ${entityText}`;
        }
        
        return baseCommand;
    }
}

class EntityExtractor {
    extract(text) {
        const entities = [];
        
        // Extract positions
        if (text.includes('here')) {
            entities.push({ type: 'position', value: 'here' });
        }
        
        // Extract objects
        const objects = ['car', 'building', 'tree', 'npc', 'light', 'fire'];
        for (const obj of objects) {
            if (text.includes(obj)) {
                entities.push({ type: 'object', value: obj });
            }
        }
        
        // Extract quantities
        const quantities = text.match(/\b\d+\b/g);
        if (quantities) {
            quantities.forEach(q => {
                entities.push({ type: 'quantity', value: parseInt(q) });
            });
        }
        
        return entities;
    }
}

class ContextResolver {
    resolve(context, entities) {
        const resolved = { ...context };
        
        // Resolve position entities
        entities.forEach(entity => {
            if (entity.type === 'position' && entity.value === 'here') {
                resolved.targetPosition = context.playerPosition;
            }
        });
        
        return resolved;
    }
}

class ContextTracker {
    constructor() {
        this.trackingActive = false;
        this.currentTarget = null;
        this.currentAction = null;
    }
    
    startTracking() {
        this.trackingActive = true;
        // Implement actual tracking based on game engine
    }
    
    updateLookTarget(target) {
        if (this.currentTarget !== target && this.onLookAtChange) {
            this.onLookAtChange(target);
        }
        this.currentTarget = target;
    }
    
    updatePlayerAction(action) {
        if (this.currentAction !== action && this.onActionChange) {
            this.onActionChange(action);
        }
        this.currentAction = action;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.RealTimeCommandProcessor = RealTimeCommandProcessor;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RealTimeCommandProcessor,
        ContinuousVoiceCapture,
        TextCommandCapture,
        AdvancedNLU
    };
}