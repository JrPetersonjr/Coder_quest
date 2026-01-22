// ============================================================
// UNITY-INTEGRATION-EXAMPLE.JS
// Example Unity integration for Agentic 3D Framework
// Demonstrates real-world 3D engine integration patterns
// ============================================================

class UnityAgenticIntegration {
    constructor() {
        this.unityInstance = null;
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.queuedMessages = [];
        
        // Unity-specific feature detection
        this.unityFeatures = {
            terrain: false,
            npc: false,
            lighting: false,
            physics: false,
            audio: false,
            effects: false
        };
        
        this.connectToUnity();
        
        console.log("🎮 Unity Agentic Integration initializing...");
    }
    
    async connectToUnity() {
        // Multiple connection methods for Unity
        
        // Method 1: Unity WebGL build integration
        if (typeof unityInstance !== 'undefined') {
            this.unityInstance = unityInstance;
            this.connectionMethod = 'webgl';
            await this.setupWebGLIntegration();
        }
        
        // Method 2: Unity editor plugin via WebSocket
        else if (this.tryWebSocketConnection()) {
            this.connectionMethod = 'websocket';
            await this.setupWebSocketIntegration();
        }
        
        // Method 3: Unity standalone with HTTP API
        else if (this.tryHTTPConnection()) {
            this.connectionMethod = 'http';
            await this.setupHTTPIntegration();
        }
        
        // Method 4: Unity package with direct JS bridge
        else if (this.tryJSBridgeConnection()) {
            this.connectionMethod = 'jsbridge';
            await this.setupJSBridgeIntegration();
        }
        
        if (this.isConnected) {
            await this.detectUnityFeatures();
            console.log("✅ Unity connected via", this.connectionMethod);
        }
    }
    
    async setupWebGLIntegration() {
        // Unity WebGL build integration
        this.unityInstance.Module.UnityAgenticBridge = {
            receiveCommand: (commandJSON) => {
                const command = JSON.parse(commandJSON);
                this.handleUnityMessage(command);
            }
        };
        
        // Test connection
        const response = await this.sendUnityMessage('system', 'ping', {});
        this.isConnected = response?.status === 'ok';
    }
    
    async setupWebSocketIntegration() {
        try {
            this.socket = new WebSocket('ws://localhost:8765');
            
            this.socket.onopen = () => {
                console.log("🔗 Unity WebSocket connected");
                this.isConnected = true;
                this.flushQueuedMessages();
            };
            
            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleUnityMessage(message);
            };
            
            this.socket.onerror = (error) => {
                console.error("❌ Unity WebSocket error:", error);
                this.isConnected = false;
            };
        } catch (error) {
            console.log("⚠️ WebSocket connection failed:", error.message);
            return false;
        }
    }
    
    async setupHTTPIntegration() {
        try {
            const response = await fetch('http://localhost:7777/unity-agentic/status');
            if (response.ok) {
                this.isConnected = true;
                this.httpEndpoint = 'http://localhost:7777/unity-agentic';
                console.log("🌐 Unity HTTP API connected");
                return true;
            }
        } catch (error) {
            console.log("⚠️ HTTP connection failed:", error.message);
            return false;
        }
    }
    
    tryJSBridgeConnection() {
        // Check for Unity JS Bridge plugin
        if (typeof UnityBridge !== 'undefined' && UnityBridge.isReady) {
            this.unityBridge = UnityBridge;
            this.isConnected = true;
            return true;
        }
        return false;
    }
    
    // ============================================================
    // UNITY MESSAGE HANDLING
    // ============================================================
    
    async sendUnityMessage(category, action, data = {}) {
        const message = {
            category: category,
            action: action,
            data: data,
            timestamp: Date.now(),
            id: this.generateMessageId()
        };
        
        if (!this.isConnected) {
            this.queuedMessages.push(message);
            return { status: 'queued' };
        }
        
        try {
            let response;
            
            switch (this.connectionMethod) {
                case 'webgl':
                    response = await this.sendWebGLMessage(message);
                    break;
                    
                case 'websocket':
                    response = await this.sendWebSocketMessage(message);
                    break;
                    
                case 'http':
                    response = await this.sendHTTPMessage(message);
                    break;
                    
                case 'jsbridge':
                    response = await this.sendJSBridgeMessage(message);
                    break;
            }
            
            return response;
        } catch (error) {
            console.error("❌ Failed to send Unity message:", error);
            return { status: 'error', error: error.message };
        }
    }
    
    async sendWebGLMessage(message) {
        return new Promise((resolve) => {
            const responseHandler = (response) => {
                this.messageHandlers.delete(message.id);
                resolve(JSON.parse(response));
            };
            
            this.messageHandlers.set(message.id, responseHandler);
            
            // Call Unity C# method
            this.unityInstance.SendMessage(
                'AgenticController', 
                'ProcessCommand', 
                JSON.stringify(message)
            );
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (this.messageHandlers.has(message.id)) {
                    this.messageHandlers.delete(message.id);
                    resolve({ status: 'timeout' });
                }
            }, 5000);
        });
    }
    
    async sendWebSocketMessage(message) {
        return new Promise((resolve) => {
            const responseHandler = (response) => {
                this.messageHandlers.delete(message.id);
                resolve(response);
            };
            
            this.messageHandlers.set(message.id, responseHandler);
            this.socket.send(JSON.stringify(message));
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (this.messageHandlers.has(message.id)) {
                    this.messageHandlers.delete(message.id);
                    resolve({ status: 'timeout' });
                }
            }, 5000);
        });
    }
    
    async sendHTTPMessage(message) {
        const response = await fetch(`${this.httpEndpoint}/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });
        
        return await response.json();
    }
    
    handleUnityMessage(message) {
        if (message.responseId && this.messageHandlers.has(message.responseId)) {
            const handler = this.messageHandlers.get(message.responseId);
            handler(message);
            return;
        }
        
        // Handle Unity-initiated messages
        console.log("📨 Unity message:", message);
    }
    
    // ============================================================
    // AGENTIC FRAMEWORK INTEGRATION
    // ============================================================
    
    async spawnNPC(npcData) {
        console.log("👤 Spawning NPC in Unity:", npcData.template.model);
        
        const response = await this.sendUnityMessage('npc', 'spawn', {
            npcId: npcData.id,
            prefabName: npcData.template.model,
            position: npcData.position,
            animations: npcData.template.animations,
            dialogue: npcData.template.dialogue,
            behavior: npcData.template.behavior,
            customProperties: npcData.parameters
        });
        
        if (response.status === 'success') {
            return {
                success: true,
                unityGameObjectId: response.gameObjectId,
                npcId: npcData.id
            };
        }
        
        return { success: false, error: response.error };
    }
    
    async modifyTerrain(position, params) {
        console.log("🌍 Modifying Unity terrain at:", position);
        
        const response = await this.sendUnityMessage('terrain', 'modify', {
            position: position,
            modificationType: params.type || 'height',
            strength: params.strength || 1.0,
            radius: params.radius || 5.0,
            value: params.value || 0.0
        });
        
        return { success: response.status === 'success' };
    }
    
    async createGravityZone(zoneData) {
        console.log("🌌 Creating Unity gravity zone");
        
        const response = await this.sendUnityMessage('physics', 'gravity_zone', {
            center: zoneData.center,
            radius: zoneData.radius,
            gravityMultiplier: zoneData.gravityMultiplier,
            shape: 'sphere'  // Could be 'box', 'capsule', etc.
        });
        
        return { success: response.status === 'success', zoneId: response.zoneId };
    }
    
    async adjustLighting(position, params) {
        console.log("💡 Adjusting Unity lighting");
        
        const response = await this.sendUnityMessage('lighting', 'adjust', {
            position: position,
            lightType: params.type || 'point',
            intensity: params.intensity || 1.0,
            color: params.color || { r: 1, g: 1, b: 1 },
            range: params.range || 10.0,
            shadows: params.shadows || true
        });
        
        return { success: response.status === 'success', lightId: response.lightId };
    }
    
    async spawnEffect(effectData) {
        console.log("💥 Spawning Unity effect:", effectData.type);
        
        const response = await this.sendUnityMessage('effects', 'spawn', {
            effectType: effectData.type,
            position: effectData.position,
            intensity: effectData.intensity,
            duration: effectData.duration,
            particleSystemName: this.getParticleSystemName(effectData.type)
        });
        
        return { success: response.status === 'success', effectId: response.effectId };
    }
    
    async playAudio(audioData) {
        console.log("🎵 Playing Unity audio");
        
        const response = await this.sendUnityMessage('audio', 'play', {
            audioClip: audioData.clip,
            position: audioData.position,
            volume: audioData.volume || 1.0,
            pitch: audioData.pitch || 1.0,
            loop: audioData.loop || false,
            is3D: audioData.spatial || true
        });
        
        return { success: response.status === 'success', audioId: response.audioId };
    }
    
    async controlCamera(cameraData) {
        console.log("📹 Controlling Unity camera");
        
        const response = await this.sendUnityMessage('camera', 'control', {
            mode: cameraData.mode || 'follow',
            target: cameraData.target,
            position: cameraData.position,
            rotation: cameraData.rotation,
            fieldOfView: cameraData.fov || 60,
            smooth: cameraData.smooth || true,
            duration: cameraData.duration || 1.0
        });
        
        return { success: response.status === 'success' };
    }
    
    // ============================================================
    // UNITY-SPECIFIC HELPERS
    // ============================================================
    
    getParticleSystemName(effectType) {
        const particleSystems = {
            'explosion': 'ExplosionParticles',
            'fire': 'FireParticles',
            'smoke': 'SmokeParticles',
            'magic': 'MagicSparkles',
            'water': 'WaterSplash',
            'lightning': 'LightningBolt'
        };
        
        return particleSystems[effectType] || 'GenericEffect';
    }
    
    async detectUnityFeatures() {
        const response = await this.sendUnityMessage('system', 'detect_features', {});
        
        if (response.status === 'success') {
            this.unityFeatures = response.features;
            console.log("🔍 Unity features detected:", this.unityFeatures);
        }
    }
    
    async getPlayerPosition() {
        const response = await this.sendUnityMessage('player', 'get_position', {});
        
        if (response.status === 'success') {
            return response.position;
        }
        
        return { x: 0, y: 0, z: 0 };
    }
    
    async getPlayerLookDirection() {
        const response = await this.sendUnityMessage('player', 'get_look_direction', {});
        
        if (response.status === 'success') {
            return response.direction;
        }
        
        return { x: 0, y: 0, z: 1 };
    }
    
    async createVRIndicator(indicator) {
        if (this.unityFeatures.vr) {
            const response = await this.sendUnityMessage('vr', 'create_indicator', {
                position: indicator.position,
                type: indicator.type,
                color: indicator.color,
                size: indicator.size
            });
            
            return { success: response.status === 'success' };
        }
        
        return { success: false, error: 'VR not supported' };
    }
    
    async showFeedback(feedback) {
        const response = await this.sendUnityMessage('ui', 'show_feedback', {
            type: feedback.type,
            message: feedback.message,
            duration: feedback.duration || 2000,
            position: feedback.position
        });
        
        return { success: response.status === 'success' };
    }
    
    // ============================================================
    // UTILITY METHODS
    // ============================================================
    
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    flushQueuedMessages() {
        console.log(`📤 Sending ${this.queuedMessages.length} queued messages`);
        
        this.queuedMessages.forEach(message => {
            this.sendUnityMessage(message.category, message.action, message.data);
        });
        
        this.queuedMessages.length = 0;
    }
    
    tryWebSocketConnection() {
        // Check if Unity WebSocket server is available
        return typeof WebSocket !== 'undefined';
    }
    
    tryHTTPConnection() {
        // Check if Unity HTTP API is available
        return typeof fetch !== 'undefined';
    }
}

// ============================================================
// UNITY C# BRIDGE HELPERS
// ============================================================

// Example Unity C# MonoBehaviour script structure:
/*
using UnityEngine;
using System.Collections;

public class AgenticController : MonoBehaviour
{
    [System.Serializable]
    public class AgenticCommand
    {
        public string category;
        public string action;
        public string data;
        public long timestamp;
        public string id;
    }
    
    // Called from JavaScript
    public void ProcessCommand(string commandJSON)
    {
        AgenticCommand command = JsonUtility.FromJson<AgenticCommand>(commandJSON);
        
        switch (command.category)
        {
            case "npc":
                ProcessNPCCommand(command);
                break;
            case "terrain":
                ProcessTerrainCommand(command);
                break;
            case "physics":
                ProcessPhysicsCommand(command);
                break;
            case "lighting":
                ProcessLightingCommand(command);
                break;
            case "effects":
                ProcessEffectsCommand(command);
                break;
        }
    }
    
    private void ProcessNPCCommand(AgenticCommand command)
    {
        // Unity NPC spawning logic
        var response = new { status = "success", gameObjectId = "npc_001" };
        SendResponseToJS(command.id, JsonUtility.ToJson(response));
    }
    
    private void SendResponseToJS(string messageId, string responseJSON)
    {
        // Send response back to JavaScript
        Application.ExternalEval($"window.unityInstance.Module.UnityAgenticBridge.receiveCommand('{responseJSON}')");
    }
}
*/

// Example Unity package.json for NPM integration:
/*
{
  "name": "com.yourcompany.unity-agentic",
  "version": "1.0.0",
  "displayName": "Unity Agentic Framework",
  "description": "Real-time AI command processing for Unity",
  "unity": "2022.3",
  "keywords": ["ai", "commands", "real-time", "vr", "ar"],
  "author": {
    "name": "Your Company",
    "email": "contact@yourcompany.com"
  }
}
*/

// Export for use
if (typeof window !== 'undefined') {
    window.UnityAgenticIntegration = UnityAgenticIntegration;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnityAgenticIntegration };
}