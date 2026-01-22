// ============================================================
// UNITY-AGENTIC-SYSTEM.CS
// Complete Unity integration for Agentic 3D Framework
// Real-time asset generation, animation, and world manipulation
// ============================================================

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;
using System.Threading.Tasks;
using Unity.AI.Navigation;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace AgenticFramework.Unity
{
    public class AgenticUnitySystem : MonoBehaviour
    {
        [Header("Core Configuration")]
        public bool enableVoiceCommands = true;
        public bool enableAIAssetGeneration = true;
        public bool enableRealTimeAnimations = true;
        public bool enableMeshyIntegration = true;
        public bool enableKaiberAnimations = true;
        
        [Header("Asset Management")]
        public string assetCachePath = "Assets/AgenticFramework/GeneratedAssets";
        public string backupPath = "Assets/AgenticFramework/Backups";
        public int maxCachedAssets = 100;
        public bool autoBackupAssets = true;
        
        [Header("AI Service Integration")]
        public string meshyAPIKey = "";
        public string kaiberAPIKey = "";
        public string openAIKey = "";
        
        [Header("Performance Settings")]
        public int maxConcurrentGenerations = 3;
        public float assetStreamingDistance = 100f;
        public bool useAssetStreaming = true;
        
        // Core systems
        private AgenticAssetManager assetManager;
        private AgenticAnimationSystem animationSystem;
        private AgenticVoiceProcessor voiceProcessor;
        private AgenticEffectsSystem effectsSystem;
        private AgenticPhysicsSystem physicsSystem;
        
        // AI Integration
        private MeshyIntegration meshyAPI;
        private KaiberIntegration kaiberAPI;
        private BlenderBridge blenderBridge;
        
        // Asset tracking
        private Dictionary<string, GameObject> generatedAssets = new Dictionary<string, GameObject>();
        private Queue<AssetGenerationRequest> generationQueue = new Queue<AssetGenerationRequest>();
        private List<string> recentCommands = new List<string>();
        
        void Start()
        {
            Debug.Log("🌟 Initializing Agentic Unity System...");
            InitializeSystem();
        }
        
        async void InitializeSystem()
        {
            try
            {
                // Initialize asset management
                assetManager = new AgenticAssetManager(assetCachePath, backupPath);
                await assetManager.Initialize();
                
                // Initialize AI integrations
                if (enableMeshyIntegration && !string.IsNullOrEmpty(meshyAPIKey))
                {
                    meshyAPI = new MeshyIntegration(meshyAPIKey);
                    await meshyAPI.Initialize();
                }
                
                if (enableKaiberAnimations && !string.IsNullOrEmpty(kaiberAPIKey))
                {
                    kaiberAPI = new KaiberIntegration(kaiberAPIKey);
                    await kaiberAPI.Initialize();
                }
                
                // Initialize animation system
                animationSystem = new AgenticAnimationSystem(kaiberAPI);
                
                // Initialize voice processing
                if (enableVoiceCommands)
                {
                    voiceProcessor = new AgenticVoiceProcessor();
                    voiceProcessor.OnVoiceCommand += ProcessVoiceCommand;
                    voiceProcessor.StartListening();
                }
                
                // Initialize effects and physics
                effectsSystem = new AgenticEffectsSystem();
                physicsSystem = new AgenticPhysicsSystem();
                
                // Initialize Blender bridge
                blenderBridge = new BlenderBridge();
                
                // Setup JavaScript bridge
                SetupJavaScriptBridge();
                
                Debug.Log("✅ Agentic Unity System initialized successfully!");
                Debug.Log("🎙️ Voice commands ready - say 'generate medieval castle'");
                Debug.Log("🎨 AI asset generation ready - Meshy + Kaiber integrated");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to initialize Agentic System: {e.Message}");
            }
        }
        
        // ============================================================
        // VOICE COMMAND PROCESSING
        // ============================================================
        
        public async void ProcessVoiceCommand(string command)
        {
            Debug.Log($"🎙️ Processing command: '{command}'");
            recentCommands.Add(command);
            
            try
            {
                var intent = ParseVoiceIntent(command);
                await ExecuteIntent(intent);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Command failed: {e.Message}");
                ShowUserFeedback($"Command failed: {e.Message}", false);
            }
        }
        
        VoiceIntent ParseVoiceIntent(string command)
        {
            var intent = new VoiceIntent { OriginalCommand = command };
            command = command.ToLower();
            
            // Asset generation commands
            if (command.Contains("generate") || command.Contains("create") || command.Contains("make"))
            {
                intent.Action = "generate_asset";
                intent.AssetType = ExtractAssetType(command);
                intent.Style = ExtractStyle(command);
                intent.Position = GetTargetPosition(command);
                intent.Scale = ExtractScale(command);
            }
            // Animation commands
            else if (command.Contains("animate") || command.Contains("move") || command.Contains("dance"))
            {
                intent.Action = "create_animation";
                intent.AnimationType = ExtractAnimationType(command);
                intent.Target = GetTargetObject(command);
                intent.Duration = ExtractDuration(command);
            }
            // Physics commands
            else if (command.Contains("gravity") || command.Contains("physics") || command.Contains("force"))
            {
                intent.Action = "modify_physics";
                intent.PhysicsType = ExtractPhysicsType(command);
                intent.Intensity = ExtractIntensity(command);
                intent.Area = GetTargetArea(command);
            }
            // Lighting commands
            else if (command.Contains("light") || command.Contains("bright") || command.Contains("dark"))
            {
                intent.Action = "adjust_lighting";
                intent.LightingType = ExtractLightingType(command);
                intent.Intensity = ExtractIntensity(command);
                intent.Position = GetTargetPosition(command);
            }
            // Environment commands
            else if (command.Contains("terrain") || command.Contains("ground") || command.Contains("landscape"))
            {
                intent.Action = "modify_terrain";
                intent.TerrainType = ExtractTerrainType(command);
                intent.Area = GetTargetArea(command);
                intent.Height = ExtractHeight(command);
            }
            
            return intent;
        }
        
        async Task ExecuteIntent(VoiceIntent intent)
        {
            switch (intent.Action)
            {
                case "generate_asset":
                    await GenerateAsset(intent);
                    break;
                case "create_animation":
                    await CreateAnimation(intent);
                    break;
                case "modify_physics":
                    await ModifyPhysics(intent);
                    break;
                case "adjust_lighting":
                    await AdjustLighting(intent);
                    break;
                case "modify_terrain":
                    await ModifyTerrain(intent);
                    break;
            }
        }
        
        // ============================================================
        // AI ASSET GENERATION
        // ============================================================
        
        public async Task GenerateAsset(VoiceIntent intent)
        {
            Debug.Log($"🎨 Generating {intent.AssetType} asset with {intent.Style} style");
            ShowUserFeedback($"Generating {intent.AssetType}...", true);
            
            try
            {
                // Check cache first
                var cachedAsset = await assetManager.GetCachedAsset(intent.AssetType, intent.Style);
                if (cachedAsset != null)
                {
                    Debug.Log("📦 Using cached asset");
                    await InstantiateAsset(cachedAsset, intent.Position, intent.Scale);
                    return;
                }
                
                // Generate new asset with Meshy
                var assetRequest = new AssetGenerationRequest
                {
                    Description = $"{intent.Style} {intent.AssetType}",
                    AssetType = intent.AssetType,
                    Style = intent.Style,
                    Position = intent.Position,
                    Scale = intent.Scale,
                    Timestamp = DateTime.Now
                };
                
                generationQueue.Enqueue(assetRequest);
                await ProcessGenerationQueue();
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Asset generation failed: {e.Message}");
                ShowUserFeedback($"Generation failed: {e.Message}", false);
            }
        }
        
        async Task ProcessGenerationQueue()
        {
            while (generationQueue.Count > 0)
            {
                var request = generationQueue.Dequeue();
                
                try
                {
                    // Generate 3D model with Meshy
                    var meshData = await meshyAPI.GenerateModel(request.Description);
                    
                    // Create GameObject from mesh data
                    var generatedObject = await CreateGameObjectFromMeshData(meshData, request);
                    
                    // Apply materials and textures
                    await ApplyGeneratedMaterials(generatedObject, meshData);
                    
                    // Position the object
                    generatedObject.transform.position = request.Position;
                    generatedObject.transform.localScale = Vector3.one * request.Scale;
                    
                    // Cache the asset
                    await assetManager.CacheAsset(generatedObject, request.AssetType, request.Style);
                    
                    // Track the asset
                    var assetId = $"{request.AssetType}_{request.Style}_{DateTime.Now.Ticks}";
                    generatedAssets[assetId] = generatedObject;
                    
                    Debug.Log($"✅ Successfully generated {request.AssetType}");
                    ShowUserFeedback($"Generated {request.AssetType}!", true);
                    
                    // Generate animation if requested
                    if (request.AnimationType != null)
                    {
                        await CreateAnimationForAsset(generatedObject, request.AnimationType);
                    }
                    
                }
                catch (Exception e)
                {
                    Debug.LogError($"❌ Failed to generate asset: {e.Message}");
                    ShowUserFeedback($"Generation failed: {e.Message}", false);
                }
            }
        }
        
        async Task<GameObject> CreateGameObjectFromMeshData(MeshData meshData, AssetGenerationRequest request)
        {
            var gameObject = new GameObject($"Generated_{request.AssetType}");
            
            // Create mesh
            var mesh = new Mesh();
            mesh.vertices = meshData.Vertices;
            mesh.triangles = meshData.Triangles;
            mesh.normals = meshData.Normals;
            mesh.uv = meshData.UVs;
            
            // Add components
            var meshRenderer = gameObject.AddComponent<MeshRenderer>();
            var meshFilter = gameObject.AddComponent<MeshFilter>();
            meshFilter.mesh = mesh;
            
            // Add collider based on asset type
            if (IsPhysicsAsset(request.AssetType))
            {
                var collider = gameObject.AddComponent<MeshCollider>();
                collider.convex = true;
                
                // Add rigidbody for physics objects
                var rigidbody = gameObject.AddComponent<Rigidbody>();
            }
            
            // Add NavMesh obstacle for navigation
            if (IsNavigationObstacle(request.AssetType))
            {
                gameObject.AddComponent<NavMeshObstacle>();
            }
            
            return gameObject;
        }
        
        // ============================================================
        // REAL-TIME ANIMATION GENERATION
        // ============================================================
        
        public async Task CreateAnimation(VoiceIntent intent)
        {
            Debug.Log($"🎭 Creating {intent.AnimationType} animation");
            ShowUserFeedback($"Creating {intent.AnimationType} animation...", true);
            
            try
            {
                var target = intent.Target ?? GetNearestObject();
                if (target == null)
                {
                    ShowUserFeedback("No target object found for animation", false);
                    return;
                }
                
                // Generate animation with Kaiber
                var animationData = await kaiberAPI.GenerateAnimation(
                    intent.AnimationType, 
                    intent.Duration,
                    target
                );
                
                // Apply animation to target
                await animationSystem.ApplyAnimation(target, animationData);
                
                Debug.Log($"✅ Animation {intent.AnimationType} applied to {target.name}");
                ShowUserFeedback($"Animation applied!", true);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Animation creation failed: {e.Message}");
                ShowUserFeedback($"Animation failed: {e.Message}", false);
            }
        }
        
        async Task CreateAnimationForAsset(GameObject asset, string animationType)
        {
            try
            {
                var animationData = await kaiberAPI.GenerateAnimation(animationType, 5.0f, asset);
                await animationSystem.ApplyAnimation(asset, animationData);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to create animation for asset: {e.Message}");
            }
        }
        
        // ============================================================
        // PHYSICS MANIPULATION
        // ============================================================
        
        public async Task ModifyPhysics(VoiceIntent intent)
        {
            Debug.Log($"⚛️ Modifying physics: {intent.PhysicsType}");
            ShowUserFeedback($"Modifying {intent.PhysicsType}...", true);
            
            try
            {
                switch (intent.PhysicsType)
                {
                    case "gravity":
                        await physicsSystem.ModifyGravity(intent.Area, intent.Intensity);
                        break;
                    case "friction":
                        await physicsSystem.ModifyFriction(intent.Area, intent.Intensity);
                        break;
                    case "force":
                        await physicsSystem.ApplyForce(intent.Area, intent.Intensity);
                        break;
                    case "magnetism":
                        await physicsSystem.CreateMagneticField(intent.Area, intent.Intensity);
                        break;
                }
                
                ShowUserFeedback($"Physics modified!", true);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Physics modification failed: {e.Message}");
                ShowUserFeedback($"Physics modification failed: {e.Message}", false);
            }
        }
        
        // ============================================================
        // LIGHTING SYSTEM
        // ============================================================
        
        public async Task AdjustLighting(VoiceIntent intent)
        {
            Debug.Log($"💡 Adjusting lighting: {intent.LightingType}");
            ShowUserFeedback($"Adjusting {intent.LightingType}...", true);
            
            try
            {
                switch (intent.LightingType)
                {
                    case "ambient":
                        RenderSettings.ambientIntensity = intent.Intensity;
                        break;
                    case "directional":
                        var sun = GameObject.FindObjectOfType<Light>();
                        if (sun) sun.intensity = intent.Intensity;
                        break;
                    case "point":
                        await CreatePointLight(intent.Position, intent.Intensity);
                        break;
                    case "dramatic":
                        await CreateDramaticLighting(intent.Position);
                        break;
                }
                
                ShowUserFeedback($"Lighting adjusted!", true);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Lighting adjustment failed: {e.Message}");
                ShowUserFeedback($"Lighting adjustment failed: {e.Message}", false);
            }
        }
        
        async Task CreatePointLight(Vector3 position, float intensity)
        {
            var lightObject = new GameObject("Generated_Light");
            lightObject.transform.position = position;
            
            var light = lightObject.AddComponent<Light>();
            light.type = LightType.Point;
            light.intensity = intensity;
            light.range = 10f;
            light.color = Color.white;
        }
        
        // ============================================================
        // TERRAIN MODIFICATION
        // ============================================================
        
        public async Task ModifyTerrain(VoiceIntent intent)
        {
            Debug.Log($"🌍 Modifying terrain: {intent.TerrainType}");
            ShowUserFeedback($"Modifying terrain...", true);
            
            try
            {
                var terrain = Terrain.activeTerrain;
                if (terrain == null)
                {
                    ShowUserFeedback("No terrain found in scene", false);
                    return;
                }
                
                switch (intent.TerrainType)
                {
                    case "raise":
                        await RaiseTerrain(terrain, intent.Area, intent.Height);
                        break;
                    case "lower":
                        await LowerTerrain(terrain, intent.Area, intent.Height);
                        break;
                    case "flatten":
                        await FlattenTerrain(terrain, intent.Area);
                        break;
                    case "smooth":
                        await SmoothTerrain(terrain, intent.Area);
                        break;
                }
                
                ShowUserFeedback($"Terrain modified!", true);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Terrain modification failed: {e.Message}");
                ShowUserFeedback($"Terrain modification failed: {e.Message}", false);
            }
        }
        
        // ============================================================
        // BLENDER INTEGRATION
        // ============================================================
        
        public async Task SendToBlender(GameObject obj, string operation)
        {
            Debug.Log($"🎨 Sending {obj.name} to Blender for {operation}");
            
            try
            {
                await blenderBridge.SendObject(obj, operation);
                var modifiedObj = await blenderBridge.ReceiveModifiedObject();
                
                if (modifiedObj != null)
                {
                    // Replace original with modified version
                    DestroyImmediate(obj);
                    modifiedObj.name = obj.name + "_Modified";
                    
                    Debug.Log($"✅ Received modified object from Blender");
                    ShowUserFeedback("Blender modification complete!", true);
                }
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Blender integration failed: {e.Message}");
                ShowUserFeedback($"Blender integration failed: {e.Message}", false);
            }
        }
        
        // ============================================================
        // JAVASCRIPT BRIDGE
        // ============================================================
        
        void SetupJavaScriptBridge()
        {
            // Expose Unity functions to JavaScript
            Application.ExternalEval(@"
                window.UnityAgenticBridge = {
                    processCommand: function(command) {
                        SendMessage('AgenticUnitySystem', 'ProcessVoiceCommand', command);
                    },
                    generateAsset: function(assetType, style) {
                        SendMessage('AgenticUnitySystem', 'GenerateAssetFromJS', assetType + '|' + style);
                    },
                    getPlayerPosition: function() {
                        return SendMessage('AgenticUnitySystem', 'GetPlayerPosition', '');
                    }
                };
                
                console.log('🌟 Unity Agentic Bridge ready!');
            ");
        }
        
        // Called from JavaScript
        public void GenerateAssetFromJS(string data)
        {
            var parts = data.Split('|');
            var assetType = parts[0];
            var style = parts.Length > 1 ? parts[1] : "realistic";
            
            var intent = new VoiceIntent
            {
                Action = "generate_asset",
                AssetType = assetType,
                Style = style,
                Position = GetPlayerPosition(),
                Scale = 1.0f
            };
            
            _ = GenerateAsset(intent);
        }
        
        // ============================================================
        // UTILITY METHODS
        // ============================================================
        
        Vector3 GetPlayerPosition()
        {
            var player = GameObject.FindWithTag("Player");
            if (player != null) return player.transform.position;
            
            var camera = Camera.main;
            if (camera != null) return camera.transform.position;
            
            return Vector3.zero;
        }
        
        Vector3 GetTargetPosition(string command)
        {
            if (command.Contains("here") || command.Contains("this"))
            {
                return GetPlayerPosition();
            }
            else if (command.Contains("there") || command.Contains("ahead"))
            {
                var playerPos = GetPlayerPosition();
                var playerForward = Camera.main.transform.forward;
                return playerPos + playerForward * 5f;
            }
            
            return GetPlayerPosition() + Vector3.forward * 2f;
        }
        
        void ShowUserFeedback(string message, bool isSuccess)
        {
            Debug.Log($"{(isSuccess ? "✅" : "❌")} {message}");
            
            // Show UI feedback
            var feedbackUI = GameObject.Find("AgenticFeedbackUI");
            if (feedbackUI != null)
            {
                feedbackUI.SendMessage("ShowFeedback", message);
            }
        }
        
        string ExtractAssetType(string command)
        {
            var assetTypes = new Dictionary<string, string>
            {
                {"castle", "castle"}, {"building", "building"}, {"house", "house"},
                {"tree", "tree"}, {"car", "car"}, {"character", "character"},
                {"weapon", "weapon"}, {"furniture", "furniture"}, {"rock", "rock"}
            };
            
            foreach (var type in assetTypes)
            {
                if (command.Contains(type.Key))
                    return type.Value;
            }
            
            return "object";
        }
        
        string ExtractStyle(string command)
        {
            var styles = new Dictionary<string, string>
            {
                {"medieval", "medieval"}, {"modern", "modern"}, {"futuristic", "futuristic"},
                {"cartoon", "cartoon"}, {"realistic", "realistic"}, {"fantasy", "fantasy"}
            };
            
            foreach (var style in styles)
            {
                if (command.Contains(style.Key))
                    return style.Value;
            }
            
            return "realistic";
        }
        
        bool IsPhysicsAsset(string assetType)
        {
            return new[] { "car", "character", "weapon", "furniture" }.Contains(assetType);
        }
        
        bool IsNavigationObstacle(string assetType)
        {
            return new[] { "building", "house", "castle", "tree", "rock" }.Contains(assetType);
        }
    }
    
    // ============================================================
    // SUPPORTING CLASSES
    // ============================================================
    
    [System.Serializable]
    public class VoiceIntent
    {
        public string OriginalCommand;
        public string Action;
        public string AssetType;
        public string Style;
        public Vector3 Position;
        public float Scale = 1.0f;
        public string AnimationType;
        public GameObject Target;
        public float Duration = 5.0f;
        public string PhysicsType;
        public float Intensity = 1.0f;
        public Bounds Area;
        public string LightingType;
        public string TerrainType;
        public float Height;
    }
    
    [System.Serializable]
    public class AssetGenerationRequest
    {
        public string Description;
        public string AssetType;
        public string Style;
        public Vector3 Position;
        public float Scale;
        public string AnimationType;
        public DateTime Timestamp;
    }
    
    [System.Serializable]
    public class MeshData
    {
        public Vector3[] Vertices;
        public int[] Triangles;
        public Vector3[] Normals;
        public Vector2[] UVs;
        public Material[] Materials;
        public Texture2D[] Textures;
    }
}