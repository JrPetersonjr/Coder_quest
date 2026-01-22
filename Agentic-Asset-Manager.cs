// ============================================================
// AGENTIC-ASSET-MANAGER.CS
// Smart asset management with AI generation, caching, and backups
// Integrates with Meshy, Kaiber, and Blender for seamless creation
// ============================================================

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using System.Threading.Tasks;
using System.IO.Compression;
using Newtonsoft.Json;

namespace AgenticFramework.Unity
{
    public class AgenticAssetManager
    {
        private string assetCachePath;
        private string backupPath;
        private Dictionary<string, AssetCacheEntry> assetCache;
        private Dictionary<string, DateTime> assetBackups;
        
        private const int MAX_CACHE_SIZE = 100;
        private const long MAX_CACHE_SIZE_BYTES = 1024 * 1024 * 1024; // 1GB
        
        public AgenticAssetManager(string cachePath, string backupPath)
        {
            this.assetCachePath = cachePath;
            this.backupPath = backupPath;
            this.assetCache = new Dictionary<string, AssetCacheEntry>();
            this.assetBackups = new Dictionary<string, DateTime>();
        }
        
        public async Task Initialize()
        {
            Debug.Log("📦 Initializing Agentic Asset Manager...");
            
            try
            {
                // Create directories
                Directory.CreateDirectory(assetCachePath);
                Directory.CreateDirectory(backupPath);
                Directory.CreateDirectory(Path.Combine(backupPath, "Zipped"));
                Directory.CreateDirectory(Path.Combine(assetCachePath, "Models"));
                Directory.CreateDirectory(Path.Combine(assetCachePath, "Textures"));
                Directory.CreateDirectory(Path.Combine(assetCachePath, "Animations"));
                Directory.CreateDirectory(Path.Combine(assetCachePath, "Materials"));
                
                // Load existing cache
                await LoadAssetCache();
                
                // Clean old assets if necessary
                await CleanupCache();
                
                // Create backup schedule
                StartBackupScheduler();
                
                Debug.Log($"✅ Asset Manager initialized - {assetCache.Count} cached assets");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to initialize Asset Manager: {e.Message}");
            }
        }
        
        // ============================================================
        // ASSET CACHING
        // ============================================================
        
        public async Task<GameObject> GetCachedAsset(string assetType, string style)
        {
            var cacheKey = GenerateCacheKey(assetType, style);
            
            if (assetCache.TryGetValue(cacheKey, out var entry))
            {
                Debug.Log($"📦 Cache hit for {assetType} ({style})");
                
                // Update access time
                entry.LastAccessed = DateTime.Now;
                entry.AccessCount++;
                
                // Load the GameObject
                return await LoadGameObjectFromCache(entry);
            }
            
            Debug.Log($"📦 Cache miss for {assetType} ({style})");
            return null;
        }
        
        public async Task CacheAsset(GameObject gameObject, string assetType, string style)
        {
            Debug.Log($"💾 Caching {assetType} asset with {style} style");
            
            try
            {
                var cacheKey = GenerateCacheKey(assetType, style);
                var assetPath = Path.Combine(assetCachePath, "Models", $"{cacheKey}.prefab");
                
                // Save GameObject as prefab data
                var assetData = await SerializeGameObject(gameObject);
                File.WriteAllText(assetPath + ".json", JsonConvert.SerializeObject(assetData));
                
                // Save mesh data
                await SaveMeshData(gameObject, cacheKey);
                
                // Save textures and materials
                await SaveMaterials(gameObject, cacheKey);
                
                // Create cache entry
                var entry = new AssetCacheEntry
                {
                    CacheKey = cacheKey,
                    AssetType = assetType,
                    Style = style,
                    FilePath = assetPath,
                    CreationTime = DateTime.Now,
                    LastAccessed = DateTime.Now,
                    AccessCount = 1,
                    FileSize = GetDirectorySize(Path.GetDirectoryName(assetPath))
                };
                
                assetCache[cacheKey] = entry;
                
                // Create backup
                await CreateAssetBackup(cacheKey, gameObject);
                
                Debug.Log($"✅ Asset cached: {assetType} ({entry.FileSize / 1024}KB)");
                
                // Cleanup if cache is full
                if (assetCache.Count > MAX_CACHE_SIZE)
                {
                    await CleanupCache();
                }
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to cache asset: {e.Message}");
            }
        }
        
        async Task<GameObject> LoadGameObjectFromCache(AssetCacheEntry entry)
        {
            try
            {
                // Load serialized data
                var jsonPath = entry.FilePath + ".json";
                if (!File.Exists(jsonPath))
                {
                    Debug.LogWarning($"⚠️ Cache file not found: {jsonPath}");
                    return null;
                }
                
                var jsonData = File.ReadAllText(jsonPath);
                var assetData = JsonConvert.DeserializeObject<SerializedGameObject>(jsonData);
                
                // Reconstruct GameObject
                var gameObject = new GameObject(assetData.Name);
                
                // Load mesh
                var mesh = await LoadMeshData(entry.CacheKey);
                if (mesh != null)
                {
                    var meshFilter = gameObject.AddComponent<MeshFilter>();
                    meshFilter.mesh = mesh;
                    
                    var meshRenderer = gameObject.AddComponent<MeshRenderer>();
                    meshRenderer.materials = await LoadMaterials(entry.CacheKey);
                }
                
                // Reconstruct components
                await ReconstructComponents(gameObject, assetData);
                
                return gameObject;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to load cached asset: {e.Message}");
                return null;
            }
        }
        
        // ============================================================
        // BACKUP SYSTEM
        // ============================================================
        
        public async Task CreateAssetBackup(string cacheKey, GameObject gameObject)
        {
            try
            {
                var backupFolder = Path.Combine(backupPath, cacheKey);
                Directory.CreateDirectory(backupFolder);
                
                // Backup all asset files
                var sourceFolder = Path.Combine(assetCachePath, "Models");
                var files = Directory.GetFiles(sourceFolder, $"{cacheKey}*");
                
                foreach (var file in files)
                {
                    var fileName = Path.GetFileName(file);
                    var backupFile = Path.Combine(backupFolder, fileName);
                    File.Copy(file, backupFile, true);
                }
                
                // Create zipped backup
                var zipPath = Path.Combine(backupPath, "Zipped", $"{cacheKey}_{DateTime.Now:yyyyMMdd_HHmmss}.zip");
                ZipFile.CreateFromDirectory(backupFolder, zipPath);
                
                assetBackups[cacheKey] = DateTime.Now;
                
                Debug.Log($"💾 Created backup for {cacheKey}");
                
                // Clean old zipped backups
                await CleanupOldBackups(cacheKey);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to create backup: {e.Message}");
            }
        }
        
        public async Task<bool> RestoreAssetFromBackup(string cacheKey, DateTime backupDate)
        {
            try
            {
                var backupFile = Path.Combine(backupPath, "Zipped", $"{cacheKey}_{backupDate:yyyyMMdd_HHmmss}.zip");
                
                if (!File.Exists(backupFile))
                {
                    Debug.LogWarning($"⚠️ Backup file not found: {backupFile}");
                    return false;
                }
                
                var restoreFolder = Path.Combine(assetCachePath, "Models");
                
                // Extract backup
                using (var archive = ZipFile.OpenRead(backupFile))
                {
                    foreach (var entry in archive.Entries)
                    {
                        var filePath = Path.Combine(restoreFolder, entry.Name);
                        entry.ExtractToFile(filePath, true);
                    }
                }
                
                Debug.Log($"✅ Restored {cacheKey} from backup");
                return true;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to restore from backup: {e.Message}");
                return false;
            }
        }
        
        async Task CleanupOldBackups(string cacheKey)
        {
            try
            {
                var backupFolder = Path.Combine(backupPath, "Zipped");
                var backupFiles = Directory.GetFiles(backupFolder, $"{cacheKey}_*.zip");
                
                // Keep only the 5 most recent backups
                if (backupFiles.Length > 5)
                {
                    Array.Sort(backupFiles);
                    for (int i = 0; i < backupFiles.Length - 5; i++)
                    {
                        File.Delete(backupFiles[i]);
                    }
                }
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to cleanup old backups: {e.Message}");
            }
        }
        
        // ============================================================
        // MESH AND MATERIAL MANAGEMENT
        // ============================================================
        
        async Task SaveMeshData(GameObject gameObject, string cacheKey)
        {
            try
            {
                var meshFilter = gameObject.GetComponent<MeshFilter>();
                if (meshFilter?.mesh == null) return;
                
                var mesh = meshFilter.mesh;
                var meshData = new SerializedMesh
                {
                    Name = mesh.name,
                    Vertices = mesh.vertices,
                    Triangles = mesh.triangles,
                    Normals = mesh.normals,
                    UVs = mesh.uv,
                    Bounds = mesh.bounds
                };
                
                var meshPath = Path.Combine(assetCachePath, "Models", $"{cacheKey}_mesh.json");
                var json = JsonConvert.SerializeObject(meshData);
                File.WriteAllText(meshPath, json);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to save mesh data: {e.Message}");
            }
        }
        
        async Task<Mesh> LoadMeshData(string cacheKey)
        {
            try
            {
                var meshPath = Path.Combine(assetCachePath, "Models", $"{cacheKey}_mesh.json");
                if (!File.Exists(meshPath)) return null;
                
                var json = File.ReadAllText(meshPath);
                var meshData = JsonConvert.DeserializeObject<SerializedMesh>(json);
                
                var mesh = new Mesh
                {
                    name = meshData.Name,
                    vertices = meshData.Vertices,
                    triangles = meshData.Triangles,
                    normals = meshData.Normals,
                    uv = meshData.UVs,
                    bounds = meshData.Bounds
                };
                
                return mesh;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to load mesh data: {e.Message}");
                return null;
            }
        }
        
        async Task SaveMaterials(GameObject gameObject, string cacheKey)
        {
            try
            {
                var renderer = gameObject.GetComponent<Renderer>();
                if (renderer?.materials == null) return;
                
                var materialsData = new List<SerializedMaterial>();
                
                for (int i = 0; i < renderer.materials.Length; i++)
                {
                    var material = renderer.materials[i];
                    var materialData = new SerializedMaterial
                    {
                        Name = material.name,
                        ShaderName = material.shader.name,
                        Color = material.color,
                        MainTexture = material.mainTexture?.name
                    };
                    
                    // Save texture if it exists
                    if (material.mainTexture is Texture2D texture)
                    {
                        await SaveTexture(texture, $"{cacheKey}_texture_{i}");
                        materialData.TexturePath = $"{cacheKey}_texture_{i}";
                    }
                    
                    materialsData.Add(materialData);
                }
                
                var materialsPath = Path.Combine(assetCachePath, "Materials", $"{cacheKey}_materials.json");
                var json = JsonConvert.SerializeObject(materialsData);
                File.WriteAllText(materialsPath, json);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to save materials: {e.Message}");
            }
        }
        
        async Task<Material[]> LoadMaterials(string cacheKey)
        {
            try
            {
                var materialsPath = Path.Combine(assetCachePath, "Materials", $"{cacheKey}_materials.json");
                if (!File.Exists(materialsPath)) return new Material[0];
                
                var json = File.ReadAllText(materialsPath);
                var materialsData = JsonConvert.DeserializeObject<List<SerializedMaterial>>(json);
                
                var materials = new Material[materialsData.Count];
                
                for (int i = 0; i < materialsData.Count; i++)
                {
                    var matData = materialsData[i];
                    var shader = Shader.Find(matData.ShaderName) ?? Shader.Find("Standard");
                    var material = new Material(shader)
                    {
                        name = matData.Name,
                        color = matData.Color
                    };
                    
                    // Load texture if it exists
                    if (!string.IsNullOrEmpty(matData.TexturePath))
                    {
                        var texture = await LoadTexture(matData.TexturePath);
                        if (texture != null)
                        {
                            material.mainTexture = texture;
                        }
                    }
                    
                    materials[i] = material;
                }
                
                return materials;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to load materials: {e.Message}");
                return new Material[0];
            }
        }
        
        async Task SaveTexture(Texture2D texture, string fileName)
        {
            try
            {
                var bytes = texture.EncodeToPNG();
                var texturePath = Path.Combine(assetCachePath, "Textures", $"{fileName}.png");
                File.WriteAllBytes(texturePath, bytes);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to save texture: {e.Message}");
            }
        }
        
        async Task<Texture2D> LoadTexture(string fileName)
        {
            try
            {
                var texturePath = Path.Combine(assetCachePath, "Textures", $"{fileName}.png");
                if (!File.Exists(texturePath)) return null;
                
                var bytes = File.ReadAllBytes(texturePath);
                var texture = new Texture2D(2, 2);
                texture.LoadImage(bytes);
                
                return texture;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to load texture: {e.Message}");
                return null;
            }
        }
        
        // ============================================================
        // CACHE MANAGEMENT
        // ============================================================
        
        async Task LoadAssetCache()
        {
            try
            {
                var cacheFile = Path.Combine(assetCachePath, "cache_index.json");
                if (!File.Exists(cacheFile)) return;
                
                var json = File.ReadAllText(cacheFile);
                var cacheEntries = JsonConvert.DeserializeObject<List<AssetCacheEntry>>(json);
                
                foreach (var entry in cacheEntries)
                {
                    assetCache[entry.CacheKey] = entry;
                }
                
                Debug.Log($"📦 Loaded {assetCache.Count} assets from cache index");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to load asset cache: {e.Message}");
            }
        }
        
        async Task SaveAssetCache()
        {
            try
            {
                var cacheFile = Path.Combine(assetCachePath, "cache_index.json");
                var cacheEntries = new List<AssetCacheEntry>(assetCache.Values);
                
                var json = JsonConvert.SerializeObject(cacheEntries, Formatting.Indented);
                File.WriteAllText(cacheFile, json);
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to save asset cache: {e.Message}");
            }
        }
        
        async Task CleanupCache()
        {
            try
            {
                Debug.Log("🧹 Cleaning up asset cache...");
                
                var totalSize = GetTotalCacheSize();
                var sortedAssets = new List<AssetCacheEntry>(assetCache.Values);
                
                // Sort by last accessed (oldest first)
                sortedAssets.Sort((a, b) => a.LastAccessed.CompareTo(b.LastAccessed));
                
                // Remove assets if we exceed limits
                while ((assetCache.Count > MAX_CACHE_SIZE || totalSize > MAX_CACHE_SIZE_BYTES) 
                       && sortedAssets.Count > 0)
                {
                    var toRemove = sortedAssets[0];
                    sortedAssets.RemoveAt(0);
                    
                    await RemoveAssetFromCache(toRemove.CacheKey);
                    totalSize = GetTotalCacheSize();
                }
                
                await SaveAssetCache();
                
                Debug.Log($"🧹 Cache cleanup complete - {assetCache.Count} assets remaining");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to cleanup cache: {e.Message}");
            }
        }
        
        async Task RemoveAssetFromCache(string cacheKey)
        {
            try
            {
                if (!assetCache.ContainsKey(cacheKey)) return;
                
                var entry = assetCache[cacheKey];
                
                // Delete all related files
                var modelFiles = Directory.GetFiles(
                    Path.Combine(assetCachePath, "Models"), 
                    $"{cacheKey}*"
                );
                
                foreach (var file in modelFiles)
                {
                    File.Delete(file);
                }
                
                // Delete textures
                var textureFiles = Directory.GetFiles(
                    Path.Combine(assetCachePath, "Textures"), 
                    $"{cacheKey}*"
                );
                
                foreach (var file in textureFiles)
                {
                    File.Delete(file);
                }
                
                // Delete materials
                var materialFiles = Directory.GetFiles(
                    Path.Combine(assetCachePath, "Materials"), 
                    $"{cacheKey}*"
                );
                
                foreach (var file in materialFiles)
                {
                    File.Delete(file);
                }
                
                assetCache.Remove(cacheKey);
                
                Debug.Log($"🗑️ Removed {cacheKey} from cache");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to remove asset from cache: {e.Message}");
            }
        }
        
        // ============================================================
        // UTILITY METHODS
        // ============================================================
        
        void StartBackupScheduler()
        {
            // Schedule automatic backups every hour
            UnityMainThreadDispatcher.Instance().StartCoroutine(BackupSchedulerCoroutine());
        }
        
        IEnumerator BackupSchedulerCoroutine()
        {
            while (true)
            {
                yield return new WaitForSeconds(3600); // 1 hour
                
                try
                {
                    await SaveAssetCache();
                    Debug.Log("💾 Automatic cache backup completed");
                }
                catch (Exception e)
                {
                    Debug.LogError($"❌ Automatic backup failed: {e.Message}");
                }
            }
        }
        
        string GenerateCacheKey(string assetType, string style)
        {
            return $"{assetType}_{style}".Replace(" ", "_").ToLower();
        }
        
        long GetDirectorySize(string directory)
        {
            if (!Directory.Exists(directory)) return 0;
            
            var files = Directory.GetFiles(directory, "*", SearchOption.AllDirectories);
            long size = 0;
            
            foreach (var file in files)
            {
                size += new FileInfo(file).Length;
            }
            
            return size;
        }
        
        long GetTotalCacheSize()
        {
            return GetDirectorySize(assetCachePath);
        }
        
        async Task<SerializedGameObject> SerializeGameObject(GameObject obj)
        {
            var serialized = new SerializedGameObject
            {
                Name = obj.name,
                Position = obj.transform.position,
                Rotation = obj.transform.rotation,
                Scale = obj.transform.localScale,
                Layer = obj.layer,
                Tag = obj.tag,
                Components = new List<string>()
            };
            
            // Serialize component types
            var components = obj.GetComponents<Component>();
            foreach (var component in components)
            {
                if (component != null && component.GetType() != typeof(Transform))
                {
                    serialized.Components.Add(component.GetType().Name);
                }
            }
            
            return serialized;
        }
        
        async Task ReconstructComponents(GameObject obj, SerializedGameObject data)
        {
            // Set transform
            obj.transform.position = data.Position;
            obj.transform.rotation = data.Rotation;
            obj.transform.localScale = data.Scale;
            obj.layer = data.Layer;
            obj.tag = data.Tag;
            
            // Add components
            foreach (var componentName in data.Components)
            {
                switch (componentName)
                {
                    case "Rigidbody":
                        obj.AddComponent<Rigidbody>();
                        break;
                    case "MeshCollider":
                        var collider = obj.AddComponent<MeshCollider>();
                        collider.convex = true;
                        break;
                    case "BoxCollider":
                        obj.AddComponent<BoxCollider>();
                        break;
                    // Add more component types as needed
                }
            }
        }
    }
    
    // ============================================================
    // SERIALIZATION CLASSES
    // ============================================================
    
    [System.Serializable]
    public class AssetCacheEntry
    {
        public string CacheKey;
        public string AssetType;
        public string Style;
        public string FilePath;
        public DateTime CreationTime;
        public DateTime LastAccessed;
        public int AccessCount;
        public long FileSize;
    }
    
    [System.Serializable]
    public class SerializedGameObject
    {
        public string Name;
        public Vector3 Position;
        public Quaternion Rotation;
        public Vector3 Scale;
        public int Layer;
        public string Tag;
        public List<string> Components;
    }
    
    [System.Serializable]
    public class SerializedMesh
    {
        public string Name;
        public Vector3[] Vertices;
        public int[] Triangles;
        public Vector3[] Normals;
        public Vector2[] UVs;
        public Bounds Bounds;
    }
    
    [System.Serializable]
    public class SerializedMaterial
    {
        public string Name;
        public string ShaderName;
        public Color Color;
        public string MainTexture;
        public string TexturePath;
    }
}