// ============================================================
// MASTER-AGENTIC-FRAMEWORK.JS
// Complete modular agentic system for any 3D engine/platform
// The god-mode framework for real-time world manipulation
// ============================================================

class MasterAgenticFramework {
    constructor(config = {}) {
        this.config = {
            engine: config.engine || 'auto-detect',
            enableVR: config.enableVR || false,
            enableVoice: config.enableVoice || true,
            enableGestures: config.enableGestures || false,
            processingMode: config.processingMode || 'instant',
            debug: config.debug || false,
            ...config
        };
        
        // Core systems
        this.engineAdapter = null;
        this.agenticFramework = null;
        this.vrSystem = null;
        this.commandProcessor = null;
        this.isInitialized = false;
        this.isGodModeActive = false;
        
        // Performance tracking
        this.metrics = {
            commandsProcessed: 0,
            averageResponseTime: 0,
            successRate: 0,
            startTime: Date.now()
        };
        
        // Plugin registry
        this.plugins = new Map();
        this.hooks = new Map();
        
        this.initialize();
        
        console.log("🌟 Master Agentic Framework initializing...");
    }
    
    async initialize() {
        try {
            // 1. Detect and setup engine adapter
            await this.setupEngineAdapter();
            
            // 2. Initialize core agentic framework
            await this.setupAgenticFramework();
            
            // 3. Initialize command processor
            await this.setupCommandProcessor();
            
            // 4. Setup VR if enabled
            if (this.config.enableVR) {
                await this.setupVRSystem();
            }
            
            // 5. Load and initialize plugins
            await this.loadPlugins();
            
            // 6. Setup global commands and shortcuts
            this.setupGlobalCommands();
            
            // 7. Start monitoring systems
            this.startMonitoring();
            
            this.isInitialized = true;
            this.triggerHook('framework_initialized');
            
            console.log("✅ Master Agentic Framework ready for god mode!");
            
        } catch (error) {
            console.error("❌ Framework initialization failed:", error);
            throw error;
        }
    }
    
    // ============================================================
    // ENGINE DETECTION AND SETUP
    // ============================================================
    
    async setupEngineAdapter() {
        if (this.config.engine === 'auto-detect') {
            this.config.engine = this.detectEngine();
        }
        
        console.log(`🎮 Setting up ${this.config.engine} adapter...`);
        
        switch (this.config.engine) {
            case 'unity':
                const { UnityAgenticIntegration } = await import('./unity-integration-example.js');
                this.engineAdapter = new UnityAgenticIntegration();
                break;
                
            case 'unreal':
                const { UnrealEngineAdapter } = await import('./agentic-3d-framework.js');
                this.engineAdapter = new UnrealEngineAdapter();
                break;
                
            case 'threejs':
                const { ThreeJSAdapter } = await import('./agentic-3d-framework.js');
                this.engineAdapter = new ThreeJSAdapter();
                break;
                
            case 'godot':
                const { GodotEngineAdapter } = await import('./agentic-3d-framework.js');
                this.engineAdapter = new GodotEngineAdapter();
                break;
                
            case 'web':
                this.engineAdapter = new WebEngineAdapter();
                break;
                
            default:
                throw new Error(`Unsupported engine: ${this.config.engine}`);
        }
        
        // Wait for engine connection
        await this.waitForEngineConnection();
    }
    
    detectEngine() {
        // Auto-detect engine based on environment
        if (typeof unityInstance !== 'undefined') {
            return 'unity';
        }
        
        if (typeof UE !== 'undefined') {
            return 'unreal';
        }
        
        if (typeof THREE !== 'undefined') {
            return 'threejs';
        }
        
        if (typeof Godot !== 'undefined') {
            return 'godot';
        }
        
        // Default to web adapter
        return 'web';
    }
    
    async waitForEngineConnection() {
        const maxWait = 10000; // 10 seconds
        const checkInterval = 100;
        let elapsed = 0;
        
        while (!this.engineAdapter.isConnected && elapsed < maxWait) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }
        
        if (!this.engineAdapter.isConnected) {
            console.warn("⚠️ Engine adapter not connected, some features may be limited");
        }
    }
    
    // ============================================================
    // CORE SYSTEMS SETUP
    // ============================================================
    
    async setupAgenticFramework() {
        const { Agentic3DFramework } = await import('./agentic-3d-framework.js');
        this.agenticFramework = new Agentic3DFramework(this.engineAdapter);
        
        // Connect framework events
        this.connectFrameworkEvents();
    }
    
    async setupCommandProcessor() {
        const { RealTimeCommandProcessor } = await import('./realtime-command-processor.js');
        this.commandProcessor = new RealTimeCommandProcessor(this.agenticFramework);
        
        // Set processing mode
        this.commandProcessor.setProcessingMode(this.config.processingMode);
        
        // Connect command events
        this.connectCommandEvents();
    }
    
    async setupVRSystem() {
        try {
            const { VRGodModeSystem } = await import('./vr-god-mode.js');
            this.vrSystem = new VRGodModeSystem(this.agenticFramework);
            
            // Enable VR god mode
            this.vrSystem.enableVRGodMode();
            
            console.log("🥽 VR God Mode enabled");
        } catch (error) {
            console.warn("⚠️ VR system failed to load:", error.message);
        }
    }
    
    connectFrameworkEvents() {
        // Monitor framework events for metrics and debugging
        const originalProcessCommand = this.agenticFramework.processGodCommand.bind(this.agenticFramework);
        
        this.agenticFramework.processGodCommand = async (command, context) => {
            const startTime = performance.now();
            this.triggerHook('command_start', { command, context });
            
            try {
                const result = await originalProcessCommand(command, context);
                
                // Update metrics
                const endTime = performance.now();
                this.updateMetrics(true, endTime - startTime);
                
                this.triggerHook('command_complete', { command, context, result });
                
                return result;
            } catch (error) {
                this.updateMetrics(false, performance.now() - startTime);
                this.triggerHook('command_error', { command, context, error });
                throw error;
            }
        };
    }
    
    connectCommandEvents() {
        // Connect command processor to framework
        const originalQueueCommand = this.commandProcessor.queueCommand.bind(this.commandProcessor);
        
        this.commandProcessor.queueCommand = (command, inputMethod, metadata) => {
            this.triggerHook('command_queued', { command, inputMethod, metadata });
            return originalQueueCommand(command, inputMethod, metadata);
        };
    }
    
    // ============================================================
    // GOD MODE INTERFACE
    // ============================================================
    
    async activateGodMode() {
        if (this.isGodModeActive) {
            console.log("🌟 God mode already active");
            return;
        }
        
        console.log("🌟 ACTIVATING GOD MODE 🌟");
        
        this.isGodModeActive = true;
        
        // Enable all god mode features
        this.commandProcessor.isListening = true;
        
        if (this.vrSystem) {
            await this.vrSystem.enableVRGodMode();
        }
        
        // Show god mode UI
        this.showGodModeInterface();
        
        // Enable god mode shortcuts
        this.enableGodModeShortcuts();
        
        this.triggerHook('god_mode_activated');
        
        // Welcome message
        this.showWelcomeMessage();
    }
    
    async deactivateGodMode() {
        console.log("⭐ Deactivating god mode");
        
        this.isGodModeActive = false;
        this.commandProcessor.isListening = false;
        
        this.hideGodModeInterface();
        this.disableGodModeShortcuts();
        
        this.triggerHook('god_mode_deactivated');
    }
    
    showWelcomeMessage() {
        const welcome = `
🌟 ========== GOD MODE ACTIVATED ========== 🌟

🎮 AVAILABLE COMMANDS:
• "Add gravity here"          - Modify physics
• "Spawn merchant NPC"        - Create characters  
• "Create explosion"          - Trigger effects
• "Increase lighting"         - Adjust environment
• "Play epic music"           - Control audio
• "Cinematic camera angle"    - Direct cinematics

🗣️ VOICE COMMANDS: Always listening
📝 TEXT COMMANDS: Press \` (backtick) for quick input
${this.config.enableVR ? '🥽 VR GESTURES: Point, pinch, wave for control' : ''}

💡 EXAMPLES:
• "Make this area have zero gravity"
• "Put a food merchant here with a cart"
• "Trigger a massive explosion over there"  
• "Switch to dramatic cinematic lighting"
• "Play intense battle music now"

🌟 You are now a god in your world! 🌟
        `;
        
        console.log(welcome);
        this.showNotification("God Mode Activated", "You have the power to reshape reality!", "success");
    }
    
    // ============================================================
    // PLUGIN SYSTEM
    // ============================================================
    
    async loadPlugins() {
        const defaultPlugins = [
            'cinematic-director',
            'smart-npc-generator',
            'environment-artist',
            'audio-maestro',
            'physics-manipulator'
        ];
        
        for (const pluginName of defaultPlugins) {
            try {
                await this.loadPlugin(pluginName);
            } catch (error) {
                if (this.config.debug) {
                    console.log(`📦 Optional plugin ${pluginName} not available:`, error.message);
                }
            }
        }
    }
    
    async loadPlugin(pluginName) {
        try {
            const plugin = await import(`./plugins/${pluginName}.js`);
            const pluginInstance = new plugin.default(this);
            
            this.plugins.set(pluginName, pluginInstance);
            
            if (pluginInstance.initialize) {
                await pluginInstance.initialize();
            }
            
            console.log(`📦 Plugin loaded: ${pluginName}`);
            this.triggerHook('plugin_loaded', { pluginName, plugin: pluginInstance });
            
        } catch (error) {
            throw new Error(`Failed to load plugin ${pluginName}: ${error.message}`);
        }
    }
    
    registerPlugin(name, pluginClass) {
        // Allow external plugin registration
        const pluginInstance = new pluginClass(this);
        this.plugins.set(name, pluginInstance);
        
        if (pluginInstance.initialize) {
            pluginInstance.initialize();
        }
        
        console.log(`📦 Plugin registered: ${name}`);
    }
    
    // ============================================================
    // HOOK SYSTEM
    // ============================================================
    
    addHook(hookName, callback) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        
        this.hooks.get(hookName).push(callback);
    }
    
    triggerHook(hookName, data = {}) {
        if (this.hooks.has(hookName)) {
            this.hooks.get(hookName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Hook ${hookName} error:`, error);
                }
            });
        }
    }
    
    // ============================================================
    // SHORTCUTS AND INTERFACE
    // ============================================================
    
    setupGlobalCommands() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.altKey) {
                switch (event.key) {
                    case 'g':
                        event.preventDefault();
                        this.toggleGodMode();
                        break;
                        
                    case 'v':
                        if (this.config.enableVR) {
                            event.preventDefault();
                            this.toggleVRMode();
                        }
                        break;
                        
                    case 'c':
                        event.preventDefault();
                        this.activateCinematicMode();
                        break;
                        
                    case 'r':
                        event.preventDefault();
                        this.resetToSafeState();
                        break;
                }
            }
        });
        
        // Quick command hotkey
        document.addEventListener('keydown', (event) => {
            if (event.key === '`' && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                this.showQuickCommandInput();
            }
        });
    }
    
    enableGodModeShortcuts() {
        // Additional shortcuts available in god mode
        this.godModeShortcuts = {
            'F1': () => this.showHelp(),
            'F2': () => this.toggleDebugMode(),
            'F3': () => this.showMetrics(),
            'F4': () => this.exportSession(),
            'Escape': () => this.deactivateGodMode()
        };
        
        this.godModeKeyHandler = (event) => {
            const handler = this.godModeShortcuts[event.key];
            if (handler && this.isGodModeActive) {
                event.preventDefault();
                handler();
            }
        };
        
        document.addEventListener('keydown', this.godModeKeyHandler);
    }
    
    disableGodModeShortcuts() {
        if (this.godModeKeyHandler) {
            document.removeEventListener('keydown', this.godModeKeyHandler);
        }
    }
    
    showQuickCommandInput() {
        if (!this.isGodModeActive) {
            this.showNotification("God Mode Required", "Activate god mode first (Ctrl+Alt+G)", "warning");
            return;
        }
        
        const command = prompt("🎮 God Command:");
        if (command) {
            this.commandProcessor.queueCommand(command, 'text', { source: 'quick_input' });
        }
    }
    
    // ============================================================
    // UI AND FEEDBACK
    // ============================================================
    
    showGodModeInterface() {
        // Create floating god mode UI
        if (document.getElementById('god-mode-ui')) return;
        
        const ui = document.createElement('div');
        ui.id = 'god-mode-ui';
        ui.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: gold;
            padding: 15px;
            border-radius: 10px;
            border: 2px solid gold;
            font-family: monospace;
            z-index: 10000;
            min-width: 300px;
        `;
        
        ui.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                🌟 <strong>GOD MODE ACTIVE</strong> 🌟
            </div>
            <div id="god-status">
                <div>Commands: ${this.metrics.commandsProcessed}</div>
                <div>Success: ${Math.round(this.metrics.successRate)}%</div>
                <div>Response: ${Math.round(this.metrics.averageResponseTime)}ms</div>
            </div>
            <div style="margin-top: 10px; font-size: 12px;">
                Press \` for commands | F1 for help | ESC to exit
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // Update status periodically
        this.uiUpdateInterval = setInterval(() => {
            const status = document.getElementById('god-status');
            if (status) {
                status.innerHTML = `
                    <div>Commands: ${this.metrics.commandsProcessed}</div>
                    <div>Success: ${Math.round(this.metrics.successRate)}%</div>
                    <div>Response: ${Math.round(this.metrics.averageResponseTime)}ms</div>
                `;
            }
        }, 1000);
    }
    
    hideGodModeInterface() {
        const ui = document.getElementById('god-mode-ui');
        if (ui) {
            ui.remove();
        }
        
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
        }
    }
    
    showNotification(title, message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 20000;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // ============================================================
    // UTILITY METHODS
    // ============================================================
    
    toggleGodMode() {
        if (this.isGodModeActive) {
            this.deactivateGodMode();
        } else {
            this.activateGodMode();
        }
    }
    
    toggleVRMode() {
        if (this.vrSystem) {
            if (this.vrSystem.isVRActive) {
                this.vrSystem.disableVR();
            } else {
                this.vrSystem.enableVRGodMode();
            }
        }
    }
    
    activateCinematicMode() {
        if (this.vrSystem) {
            this.vrSystem.enableCinematicMode();
        }
        
        this.commandProcessor.setProcessingMode('cinematic');
        this.showNotification("Cinematic Mode", "Commands will have dramatic timing", "info");
    }
    
    updateMetrics(success, responseTime) {
        this.metrics.commandsProcessed++;
        
        // Update average response time
        const totalTime = this.metrics.averageResponseTime * (this.metrics.commandsProcessed - 1) + responseTime;
        this.metrics.averageResponseTime = totalTime / this.metrics.commandsProcessed;
        
        // Update success rate
        const previousSuccesses = Math.round(this.metrics.successRate / 100 * (this.metrics.commandsProcessed - 1));
        const newSuccesses = previousSuccesses + (success ? 1 : 0);
        this.metrics.successRate = (newSuccesses / this.metrics.commandsProcessed) * 100;
    }
    
    startMonitoring() {
        // Monitor system health
        setInterval(() => {
            this.checkSystemHealth();
        }, 5000);
    }
    
    checkSystemHealth() {
        const health = {
            engineConnected: this.engineAdapter?.isConnected || false,
            commandProcessorActive: this.commandProcessor?.isListening || false,
            vrSystemActive: this.vrSystem?.isVRActive || false,
            memoryUsage: this.getMemoryUsage()
        };
        
        if (this.config.debug) {
            console.log("❤️ System health:", health);
        }
        
        this.triggerHook('health_check', health);
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        
        return null;
    }
    
    showHelp() {
        const help = `
🌟 ========== GOD MODE HELP ========== 🌟

VOICE COMMANDS (Always listening):
• "Create [object] here" - Spawn objects
• "Adjust gravity to [amount]" - Modify physics  
• "Spawn [type] NPC" - Generate characters
• "Play [mood] music" - Control audio
• "Increase/decrease lighting" - Environment
• "Trigger explosion/effects" - Cinematic

KEYBOARD SHORTCUTS:
• \` (backtick) - Quick command input
• F1 - Show this help
• F2 - Toggle debug mode
• F3 - Show performance metrics
• F4 - Export session data
• ESC - Exit god mode
• Ctrl+Alt+G - Toggle god mode
• Ctrl+Alt+V - Toggle VR mode
• Ctrl+Alt+C - Cinematic mode

${this.config.enableVR ? `
VR GESTURES:
• Point + Speak - Targeted commands
• Pinch + Pull - Gravity modification
• Wave Up - Lighting increase
• Circle Draw - Create portals
• Clap - Repeat last command
` : ''}

PLUGIN COMMANDS:
${Array.from(this.plugins.keys()).map(p => `• ${p} commands available`).join('\n')}

🌟 You have the power to reshape reality! 🌟
        `;
        
        console.log(help);
        this.showNotification("God Mode Help", "Check console for full command list", "info");
    }
    
    showMetrics() {
        const metrics = `
📊 ========== PERFORMANCE METRICS ========== 📊

Commands Processed: ${this.metrics.commandsProcessed}
Success Rate: ${Math.round(this.metrics.successRate)}%
Avg Response Time: ${Math.round(this.metrics.averageResponseTime)}ms
Uptime: ${Math.round((Date.now() - this.metrics.startTime) / 1000)}s

Engine: ${this.config.engine} (${this.engineAdapter?.isConnected ? 'Connected' : 'Disconnected'})
Command Processor: ${this.commandProcessor?.isListening ? 'Active' : 'Inactive'}
VR System: ${this.vrSystem?.isVRActive ? 'Active' : 'Inactive'}

Active Plugins: ${this.plugins.size}
        `;
        
        console.log(metrics);
        this.showNotification("Performance Metrics", "Check console for detailed stats", "info");
    }
    
    async resetToSafeState() {
        console.log("🔄 Resetting to safe state...");
        
        // Stop all active commands
        if (this.commandProcessor) {
            await this.commandProcessor.stopAllActions();
        }
        
        // Reset all agents
        if (this.agenticFramework) {
            this.agenticFramework.agents.forEach(agent => {
                if (agent.reset) {
                    agent.reset();
                }
            });
        }
        
        this.showNotification("Safe State", "All systems reset to safe defaults", "success");
    }
}

// ============================================================
// WEB ENGINE ADAPTER (Fallback)
// ============================================================

class WebEngineAdapter {
    constructor() {
        this.isConnected = true;
        this.simulatedObjects = new Map();
        console.log("🌐 Web Engine Adapter active (simulation mode)");
    }
    
    async spawnNPC(npcData) {
        console.log("👤 [Simulated] NPC spawned:", npcData.id);
        this.simulatedObjects.set(npcData.id, npcData);
        return { success: true, npcId: npcData.id };
    }
    
    async modifyTerrain(position, params) {
        console.log("🌍 [Simulated] Terrain modified at:", position);
        return { success: true };
    }
    
    async createGravityZone(zoneData) {
        console.log("🌌 [Simulated] Gravity zone created");
        return { success: true, zoneId: `zone_${Date.now()}` };
    }
    
    async spawnEffect(effectData) {
        console.log("💥 [Simulated] Effect triggered:", effectData.type);
        return { success: true, effectId: `effect_${Date.now()}` };
    }
    
    async showFeedback(feedback) {
        console.log(`💬 ${feedback.type}: ${feedback.message}`);
        return { success: true };
    }
    
    getPlayerPosition() {
        return { x: 0, y: 0, z: 0 };
    }
    
    getPlayerLookDirection() {
        return { x: 0, y: 0, z: 1 };
    }
}

// ============================================================
// INITIALIZATION HELPERS
// ============================================================

// Easy initialization function
window.initializeGodMode = async (config = {}) => {
    try {
        const framework = new MasterAgenticFramework(config);
        
        // Wait for initialization
        await new Promise(resolve => {
            const checkInit = () => {
                if (framework.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkInit, 100);
                }
            };
            checkInit();
        });
        
        // Auto-activate god mode if requested
        if (config.autoActivate !== false) {
            await framework.activateGodMode();
        }
        
        // Make globally available
        window.godMode = framework;
        
        return framework;
        
    } catch (error) {
        console.error("❌ Failed to initialize God Mode:", error);
        throw error;
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.MasterAgenticFramework = MasterAgenticFramework;
    window.WebEngineAdapter = WebEngineAdapter;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MasterAgenticFramework,
        WebEngineAdapter
    };
}