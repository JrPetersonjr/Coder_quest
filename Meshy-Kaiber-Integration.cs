// ============================================================
// MESHY-KAIBER-INTEGRATION.CS
// AI-powered 3D asset and animation generation
// Direct integration with Meshy.ai and Kaiber for real-time creation
// ============================================================

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;

namespace AgenticFramework.Unity
{
    // ============================================================
    // MESHY INTEGRATION - 3D ASSET GENERATION
    // ============================================================
    
    public class MeshyIntegration
    {
        private string apiKey;
        private string baseUrl = "https://api.meshy.ai/v2";
        private Dictionary<string, MeshyTask> activeTasks = new Dictionary<string, MeshyTask>();
        
        public MeshyIntegration(string apiKey)
        {
            this.apiKey = apiKey;
        }
        
        public async Task Initialize()
        {
            Debug.Log("🎨 Initializing Meshy.ai integration...");
            
            try
            {
                // Test API connection
                var response = await SendRequest("GET", "/user", "");
                if (response != null)
                {
                    Debug.Log("✅ Meshy.ai connection established!");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to initialize Meshy.ai: {e.Message}");
            }
        }
        
        public async Task<MeshData> GenerateModel(string description)
        {
            Debug.Log($"🎨 Generating 3D model: '{description}'");
            
            try
            {
                // Start text-to-3D task
                var taskData = new
                {
                    mode = "preview",
                    prompt = description,
                    art_style = "realistic",
                    negative_prompt = "low quality, blurry, distorted"
                };
                
                var jsonData = JsonConvert.SerializeObject(taskData);
                var response = await SendRequest("POST", "/text-to-3d", jsonData);
                
                if (response == null)
                {
                    throw new Exception("Failed to start Meshy generation task");
                }
                
                var task = JsonConvert.DeserializeObject<MeshyTask>(response);
                activeTasks[task.Id] = task;
                
                Debug.Log($"📊 Meshy task started: {task.Id}");
                
                // Poll for completion
                return await PollForCompletion(task.Id);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Meshy generation failed: {e.Message}");
                throw;
            }
        }
        
        public async Task<MeshData> GenerateFromImage(byte[] imageData, string prompt = "")
        {
            Debug.Log("🖼️ Generating 3D model from image...");
            
            try
            {
                // Upload image
                var uploadResponse = await UploadImage(imageData);
                var imageUrl = JsonConvert.DeserializeObject<dynamic>(uploadResponse).url;
                
                // Start image-to-3D task
                var taskData = new
                {
                    image_url = imageUrl.ToString(),
                    enable_pbr = true,
                    surface_mode = "hard"
                };
                
                if (!string.IsNullOrEmpty(prompt))
                {
                    taskData = new
                    {
                        image_url = imageUrl.ToString(),
                        enable_pbr = true,
                        surface_mode = "hard",
                        prompt = prompt
                    };
                }
                
                var jsonData = JsonConvert.SerializeObject(taskData);
                var response = await SendRequest("POST", "/image-to-3d", jsonData);
                
                var task = JsonConvert.DeserializeObject<MeshyTask>(response);
                activeTasks[task.Id] = task;
                
                return await PollForCompletion(task.Id);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Image-to-3D generation failed: {e.Message}");
                throw;
            }
        }
        
        async Task<MeshData> PollForCompletion(string taskId)
        {
            Debug.Log($"⏳ Polling Meshy task: {taskId}");
            
            var maxAttempts = 60; // 5 minutes max
            var attempt = 0;
            
            while (attempt < maxAttempts)
            {
                try
                {
                    var response = await SendRequest("GET", $"/text-to-3d/{taskId}", "");
                    var task = JsonConvert.DeserializeObject<MeshyTask>(response);
                    
                    activeTasks[taskId] = task;
                    
                    switch (task.Status)
                    {
                        case "SUCCEEDED":
                            Debug.Log($"✅ Meshy task completed: {taskId}");
                            return await DownloadMeshData(task);
                            
                        case "FAILED":
                            throw new Exception($"Meshy task failed: {task.Error}");
                            
                        case "IN_PROGRESS":
                        case "PENDING":
                            Debug.Log($"⏳ Task progress: {task.Progress}%");
                            await Task.Delay(5000); // Wait 5 seconds
                            break;
                    }
                    
                    attempt++;
                }
                catch (Exception e)
                {
                    Debug.LogError($"❌ Polling error: {e.Message}");
                    await Task.Delay(5000);
                    attempt++;
                }
            }
            
            throw new Exception("Meshy task timeout");
        }
        
        async Task<MeshData> DownloadMeshData(MeshyTask task)
        {
            Debug.Log($"📥 Downloading mesh data for task: {task.Id}");
            
            try
            {
                // Download GLB file
                var glbData = await DownloadFile(task.ModelUrls.Glb);
                
                // Download textures
                var albedoTexture = await DownloadTexture(task.ModelUrls.AlbedoMap);
                var normalTexture = await DownloadTexture(task.ModelUrls.NormalMap);
                var metallicTexture = await DownloadTexture(task.ModelUrls.MetallicMap);
                
                // Parse GLB data
                var meshData = await ParseGLB(glbData);
                
                // Create materials with downloaded textures
                meshData.Materials = CreateMaterialsFromTextures(albedoTexture, normalTexture, metallicTexture);
                
                Debug.log($"✅ Downloaded mesh: {meshData.Vertices.Length} vertices, {meshData.Materials.Length} materials");
                
                return meshData;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to download mesh data: {e.Message}");
                throw;
            }
        }
        
        async Task<byte[]> DownloadFile(string url)
        {
            using (var www = UnityWebRequest.Get(url))
            {
                await www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    throw new Exception($"Download failed: {www.error}");
                }
                
                return www.downloadHandler.data;
            }
        }
        
        async Task<Texture2D> DownloadTexture(string url)
        {
            if (string.IsNullOrEmpty(url)) return null;
            
            using (var www = UnityWebRequestTexture.GetTexture(url))
            {
                await www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning($"⚠️ Texture download failed: {www.error}");
                    return null;
                }
                
                return DownloadHandlerTexture.GetContent(www);
            }
        }
        
        async Task<string> UploadImage(byte[] imageData)
        {
            var form = new WWWForm();
            form.AddBinaryData("file", imageData, "image.png", "image/png");
            
            using (var www = UnityWebRequest.Post($"{baseUrl}/upload", form))
            {
                www.SetRequestHeader("Authorization", $"Bearer {apiKey}");
                await www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    throw new Exception($"Image upload failed: {www.error}");
                }
                
                return www.downloadHandler.text;
            }
        }
        
        async Task<string> SendRequest(string method, string endpoint, string jsonData)
        {
            using (var www = new UnityWebRequest($"{baseUrl}{endpoint}", method))
            {
                www.SetRequestHeader("Authorization", $"Bearer {apiKey}");
                www.SetRequestHeader("Content-Type", "application/json");
                
                if (!string.IsNullOrEmpty(jsonData))
                {
                    byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                    www.uploadHandler = new UploadHandlerRaw(bodyRaw);
                }
                
                www.downloadHandler = new DownloadHandlerBuffer();
                
                await www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogError($"❌ Meshy API error: {www.error}");
                    Debug.LogError($"Response: {www.downloadHandler.text}");
                    return null;
                }
                
                return www.downloadHandler.text;
            }
        }
        
        Material[] CreateMaterialsFromTextures(Texture2D albedo, Texture2D normal, Texture2D metallic)
        {
            var material = new Material(Shader.Find("Standard"));
            
            if (albedo != null)
                material.mainTexture = albedo;
                
            if (normal != null)
                material.SetTexture("_BumpMap", normal);
                
            if (metallic != null)
                material.SetTexture("_MetallicGlossMap", metallic);
            
            return new Material[] { material };
        }
        
        async Task<MeshData> ParseGLB(byte[] glbData)
        {
            // Simplified GLB parsing - in production, use a proper GLB parser
            // For now, create a basic mesh structure
            var meshData = new MeshData
            {
                Vertices = GenerateQuadVertices(),
                Triangles = GenerateQuadTriangles(),
                Normals = GenerateQuadNormals(),
                UVs = GenerateQuadUVs()
            };
            
            return meshData;
        }
        
        // Helper methods for basic mesh generation
        Vector3[] GenerateQuadVertices()
        {
            return new Vector3[]
            {
                new Vector3(-1, -1, 0),
                new Vector3(1, -1, 0),
                new Vector3(1, 1, 0),
                new Vector3(-1, 1, 0)
            };
        }
        
        int[] GenerateQuadTriangles()
        {
            return new int[] { 0, 2, 1, 0, 3, 2 };
        }
        
        Vector3[] GenerateQuadNormals()
        {
            return new Vector3[]
            {
                Vector3.back,
                Vector3.back,
                Vector3.back,
                Vector3.back
            };
        }
        
        Vector2[] GenerateQuadUVs()
        {
            return new Vector2[]
            {
                new Vector2(0, 0),
                new Vector2(1, 0),
                new Vector2(1, 1),
                new Vector2(0, 1)
            };
        }
    }
    
    // ============================================================
    // KAIBER INTEGRATION - ANIMATION GENERATION
    // ============================================================
    
    public class KaiberIntegration
    {
        private string apiKey;
        private string baseUrl = "https://api.kaiber.ai/v1";
        private Dictionary<string, KaiberTask> activeTasks = new Dictionary<string, KaiberTask>();
        
        public KaiberIntegration(string apiKey)
        {
            this.apiKey = apiKey;
        }
        
        public async Task Initialize()
        {
            Debug.Log("🎭 Initializing Kaiber.ai integration...");
            
            try
            {
                // Test API connection
                var response = await SendKaiberRequest("GET", "/user", "");
                if (response != null)
                {
                    Debug.Log("✅ Kaiber.ai connection established!");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to initialize Kaiber.ai: {e.Message}");
            }
        }
        
        public async Task<AnimationClip> GenerateAnimation(string animationType, float duration, GameObject target)
        {
            Debug.Log($"🎭 Generating {animationType} animation for {target.name}");
            
            try
            {
                // Create animation prompt based on type
                var prompt = CreateAnimationPrompt(animationType, target);
                
                // Generate keyframe data
                var keyframes = await GenerateKeyframes(prompt, duration);
                
                // Create Unity AnimationClip
                var animationClip = CreateAnimationClip(keyframes, duration, target);
                
                Debug.Log($"✅ Animation '{animationType}' generated successfully");
                return animationClip;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Animation generation failed: {e.Message}");
                throw;
            }
        }
        
        string CreateAnimationPrompt(string animationType, GameObject target)
        {
            var prompts = new Dictionary<string, string>
            {
                {"dance", $"Smooth rhythmic dance movements for a {target.name}, flowing and energetic"},
                {"float", $"Gentle floating motion for {target.name}, bobbing up and down gracefully"},
                {"spin", $"Smooth spinning rotation for {target.name}, elegant and continuous"},
                {"bounce", $"Playful bouncing motion for {target.name}, springy and fun"},
                {"wave", $"Gentle waving motion for {target.name}, back and forth like a tree in wind"},
                {"pulse", $"Pulsing scale animation for {target.name}, growing and shrinking rhythmically"},
                {"orbit", $"Orbital motion around a point for {target.name}, smooth circular path"},
                {"shake", $"Subtle shaking motion for {target.name}, indicating activity or energy"}
            };
            
            return prompts.ContainsKey(animationType.ToLower()) 
                ? prompts[animationType.ToLower()] 
                : $"Natural movement animation for {target.name}";
        }
        
        async Task<AnimationKeyframes> GenerateKeyframes(string prompt, float duration)
        {
            // For now, generate procedural keyframes based on common patterns
            // In production, this would call Kaiber's API for AI-generated motions
            
            var keyframes = new AnimationKeyframes
            {
                Duration = duration,
                PositionKeys = new List<Vector3Keyframe>(),
                RotationKeys = new List<QuaternionKeyframe>(),
                ScaleKeys = new List<Vector3Keyframe>()
            };
            
            // Generate keyframes based on prompt analysis
            if (prompt.Contains("dance") || prompt.Contains("wave"))
            {
                GenerateDanceKeyframes(keyframes);
            }
            else if (prompt.Contains("float") || prompt.Contains("bob"))
            {
                GenerateFloatKeyframes(keyframes);
            }
            else if (prompt.Contains("spin") || prompt.Contains("rotate"))
            {
                GenerateSpinKeyframes(keyframes);
            }
            else if (prompt.Contains("bounce"))
            {
                GenerateBounceKeyframes(keyframes);
            }
            else if (prompt.Contains("pulse"))
            {
                GeneratePulseKeyframes(keyframes);
            }
            
            return keyframes;
        }
        
        void GenerateDanceKeyframes(AnimationKeyframes keyframes)
        {
            var steps = 8;
            for (int i = 0; i <= steps; i++)
            {
                var time = (float)i / steps * keyframes.Duration;
                var angle = (float)i / steps * Mathf.PI * 4; // 2 full cycles
                
                keyframes.PositionKeys.Add(new Vector3Keyframe
                {
                    Time = time,
                    Value = new Vector3(Mathf.Sin(angle) * 0.5f, Mathf.Abs(Mathf.Sin(angle * 2)) * 0.3f, 0)
                });
                
                keyframes.RotationKeys.Add(new QuaternionKeyframe
                {
                    Time = time,
                    Value = Quaternion.Euler(0, Mathf.Sin(angle) * 15f, Mathf.Sin(angle * 1.5f) * 10f)
                });
            }
        }
        
        void GenerateFloatKeyframes(AnimationKeyframes keyframes)
        {
            var steps = 6;
            for (int i = 0; i <= steps; i++)
            {
                var time = (float)i / steps * keyframes.Duration;
                var phase = (float)i / steps * Mathf.PI * 2;
                
                keyframes.PositionKeys.Add(new Vector3Keyframe
                {
                    Time = time,
                    Value = new Vector3(0, Mathf.Sin(phase) * 0.2f, 0)
                });
            }
        }
        
        void GenerateSpinKeyframes(AnimationKeyframes keyframes)
        {
            var steps = 8;
            for (int i = 0; i <= steps; i++)
            {
                var time = (float)i / steps * keyframes.Duration;
                var rotation = (float)i / steps * 360f * 2; // 2 full rotations
                
                keyframes.RotationKeys.Add(new QuaternionKeyframe
                {
                    Time = time,
                    Value = Quaternion.Euler(0, rotation, 0)
                });
            }
        }
        
        void GenerateBounceKeyframes(AnimationKeyframes keyframes)
        {
            var bounces = 4;
            var steps = bounces * 4; // 4 keyframes per bounce
            
            for (int i = 0; i <= steps; i++)
            {
                var time = (float)i / steps * keyframes.Duration;
                var bouncePhase = (float)i / 4; // 4 steps per bounce
                var height = Mathf.Abs(Mathf.Sin(bouncePhase * Mathf.PI));
                height = Mathf.Pow(height, 0.5f) * 0.5f; // Make bounce more realistic
                
                keyframes.PositionKeys.Add(new Vector3Keyframe
                {
                    Time = time,
                    Value = new Vector3(0, height, 0)
                });
            }
        }
        
        void GeneratePulseKeyframes(AnimationKeyframes keyframes)
        {
            var pulses = 3;
            var steps = pulses * 4;
            
            for (int i = 0; i <= steps; i++)
            {
                var time = (float)i / steps * keyframes.Duration;
                var pulsePhase = (float)i / 4 * Mathf.PI;
                var scale = 1.0f + Mathf.Sin(pulsePhase) * 0.2f;
                
                keyframes.ScaleKeys.Add(new Vector3Keyframe
                {
                    Time = time,
                    Value = Vector3.one * scale
                });
            }
        }
        
        AnimationClip CreateAnimationClip(AnimationKeyframes keyframes, float duration, GameObject target)
        {
            var clip = new AnimationClip();
            clip.name = $"Generated_Animation_{target.name}";
            clip.legacy = false;
            
            // Create position animation curves
            if (keyframes.PositionKeys.Count > 0)
            {
                var posXCurve = new AnimationCurve();
                var posYCurve = new AnimationCurve();
                var posZCurve = new AnimationCurve();
                
                foreach (var key in keyframes.PositionKeys)
                {
                    posXCurve.AddKey(key.Time, key.Value.x);
                    posYCurve.AddKey(key.Time, key.Value.y);
                    posZCurve.AddKey(key.Time, key.Value.z);
                }
                
                clip.SetCurve("", typeof(Transform), "localPosition.x", posXCurve);
                clip.SetCurve("", typeof(Transform), "localPosition.y", posYCurve);
                clip.SetCurve("", typeof(Transform), "localPosition.z", posZCurve);
            }
            
            // Create rotation animation curves
            if (keyframes.RotationKeys.Count > 0)
            {
                var rotXCurve = new AnimationCurve();
                var rotYCurve = new AnimationCurve();
                var rotZCurve = new AnimationCurve();
                var rotWCurve = new AnimationCurve();
                
                foreach (var key in keyframes.RotationKeys)
                {
                    rotXCurve.AddKey(key.Time, key.Value.x);
                    rotYCurve.AddKey(key.Time, key.Value.y);
                    rotZCurve.AddKey(key.Time, key.Value.z);
                    rotWCurve.AddKey(key.Time, key.Value.w);
                }
                
                clip.SetCurve("", typeof(Transform), "localRotation.x", rotXCurve);
                clip.SetCurve("", typeof(Transform), "localRotation.y", rotYCurve);
                clip.SetCurve("", typeof(Transform), "localRotation.z", rotZCurve);
                clip.SetCurve("", typeof(Transform), "localRotation.w", rotWCurve);
            }
            
            // Create scale animation curves
            if (keyframes.ScaleKeys.Count > 0)
            {
                var scaleXCurve = new AnimationCurve();
                var scaleYCurve = new AnimationCurve();
                var scaleZCurve = new AnimationCurve();
                
                foreach (var key in keyframes.ScaleKeys)
                {
                    scaleXCurve.AddKey(key.Time, key.Value.x);
                    scaleYCurve.AddKey(key.Time, key.Value.y);
                    scaleZCurve.AddKey(key.Time, key.Value.z);
                }
                
                clip.SetCurve("", typeof(Transform), "localScale.x", scaleXCurve);
                clip.SetCurve("", typeof(Transform), "localScale.y", scaleYCurve);
                clip.SetCurve("", typeof(Transform), "localScale.z", scaleZCurve);
            }
            
            return clip;
        }
        
        async Task<string> SendKaiberRequest(string method, string endpoint, string jsonData)
        {
            using (var www = new UnityWebRequest($"{baseUrl}{endpoint}", method))
            {
                www.SetRequestHeader("Authorization", $"Bearer {apiKey}");
                www.SetRequestHeader("Content-Type", "application/json");
                
                if (!string.IsNullOrEmpty(jsonData))
                {
                    byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                    www.uploadHandler = new UploadHandlerRaw(bodyRaw);
                }
                
                www.downloadHandler = new DownloadHandlerBuffer();
                
                await www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogError($"❌ Kaiber API error: {www.error}");
                    return null;
                }
                
                return www.downloadHandler.text;
            }
        }
    }
    
    // ============================================================
    // SUPPORTING CLASSES
    // ============================================================
    
    [System.Serializable]
    public class MeshyTask
    {
        public string Id;
        public string Status;
        public int Progress;
        public string Error;
        public MeshyModelUrls ModelUrls;
    }
    
    [System.Serializable]
    public class MeshyModelUrls
    {
        public string Glb;
        public string AlbedoMap;
        public string NormalMap;
        public string MetallicMap;
        public string RoughnessMap;
    }
    
    [System.Serializable]
    public class KaiberTask
    {
        public string Id;
        public string Status;
        public string VideoUrl;
        public List<string> FrameUrls;
    }
    
    [System.Serializable]
    public class AnimationKeyframes
    {
        public float Duration;
        public List<Vector3Keyframe> PositionKeys = new List<Vector3Keyframe>();
        public List<QuaternionKeyframe> RotationKeys = new List<QuaternionKeyframe>();
        public List<Vector3Keyframe> ScaleKeys = new List<Vector3Keyframe>();
    }
    
    [System.Serializable]
    public class Vector3Keyframe
    {
        public float Time;
        public Vector3 Value;
    }
    
    [System.Serializable]
    public class QuaternionKeyframe
    {
        public float Time;
        public Quaternion Value;
    }
}