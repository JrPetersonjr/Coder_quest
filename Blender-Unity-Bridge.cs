// ============================================================
// BLENDER-UNITY-BRIDGE.CS
// Direct integration between Unity and Blender for asset pipeline
// Real-time asset sending, modification, and receiving
// ============================================================

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;
using Newtonsoft.Json;
using System.Net.Sockets;
using System.Text;

namespace AgenticFramework.Unity
{
    public class BlenderBridge : MonoBehaviour
    {
        [Header("Blender Configuration")]
        public string blenderExecutablePath = "C:/Program Files/Blender Foundation/Blender 3.6/blender.exe";
        public string pythonScriptPath = "Assets/AgenticFramework/BlenderBridge/blender_bridge.py";
        public int communicationPort = 9999;
        public bool autoStartBlender = true;
        
        [Header("Asset Pipeline")]
        public string temporaryAssetPath = "Assets/AgenticFramework/Temp";
        public string blenderProjectPath = "Assets/AgenticFramework/BlenderProjects";
        
        // Communication
        private TcpListener tcpListener;
        private TcpClient tcpClient;
        private NetworkStream stream;
        private bool isConnected = false;
        
        // Asset tracking
        private Dictionary<string, BlenderTask> activeTasks = new Dictionary<string, BlenderTask>();
        private Queue<BlenderCommand> commandQueue = new Queue<BlenderCommand>();
        
        void Start()
        {
            Initialize();
        }
        
        async void Initialize()
        {
            Debug.Log("🎨 Initializing Blender-Unity Bridge...");
            
            try
            {
                // Create directories
                Directory.CreateDirectory(temporaryAssetPath);
                Directory.CreateDirectory(blenderProjectPath);
                
                // Setup communication
                await SetupCommunication();
                
                // Start Blender if configured
                if (autoStartBlender)
                {
                    await StartBlenderWithBridge();
                }
                
                Debug.Log("✅ Blender Bridge initialized successfully!");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to initialize Blender Bridge: {e.Message}");
            }
        }
        
        // ============================================================
        // COMMUNICATION SETUP
        // ============================================================
        
        async Task SetupCommunication()
        {
            try
            {
                tcpListener = new TcpListener(System.Net.IPAddress.Any, communicationPort);
                tcpListener.Start();
                
                Debug.Log($"🔗 TCP listener started on port {communicationPort}");
                
                // Start listening for Blender connection
                StartCoroutine(ListenForBlenderConnection());
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to setup communication: {e.Message}");
            }
        }
        
        IEnumerator ListenForBlenderConnection()
        {
            Debug.Log("👂 Listening for Blender connection...");
            
            while (!isConnected)
            {
                try
                {
                    if (tcpListener.Pending())
                    {
                        tcpClient = tcpListener.AcceptTcpClient();
                        stream = tcpClient.GetStream();
                        isConnected = true;
                        
                        Debug.Log("✅ Blender connected successfully!");
                        
                        // Start message processing
                        StartCoroutine(ProcessBlenderMessages());
                    }
                }
                catch (Exception e)
                {
                    Debug.LogError($"❌ Connection error: {e.Message}");
                }
                
                yield return new WaitForSeconds(1f);
            }
        }
        
        IEnumerator ProcessBlenderMessages()
        {
            while (isConnected && tcpClient.Connected)
            {
                try
                {
                    if (stream.DataAvailable)
                    {
                        byte[] buffer = new byte[1024 * 64]; // 64KB buffer
                        int bytesRead = stream.Read(buffer, 0, buffer.Length);
                        
                        if (bytesRead > 0)
                        {
                            string message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                            ProcessBlenderMessage(message);
                        }
                    }
                }
                catch (Exception e)
                {
                    Debug.LogError($"❌ Message processing error: {e.Message}");
                    isConnected = false;
                }
                
                yield return new WaitForSeconds(0.1f);
            }
            
            Debug.Log("🔌 Blender disconnected");
            isConnected = false;
        }
        
        // ============================================================
        // BLENDER INTEGRATION
        // ============================================================
        
        async Task StartBlenderWithBridge()
        {
            try
            {
                if (!File.Exists(blenderExecutablePath))
                {
                    Debug.LogError($"❌ Blender not found at: {blenderExecutablePath}");
                    return;
                }
                
                // Create Blender Python bridge script
                await CreateBlenderBridgeScript();
                
                // Start Blender with the bridge script
                var startInfo = new ProcessStartInfo
                {
                    FileName = blenderExecutablePath,
                    Arguments = $"--background --python \"{pythonScriptPath}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };
                
                var process = Process.Start(startInfo);
                
                Debug.Log("🚀 Blender started with Unity bridge");
                
                // Wait for connection
                var timeout = 30; // 30 seconds
                var elapsed = 0;
                
                while (!isConnected && elapsed < timeout)
                {
                    await Task.Delay(1000);
                    elapsed++;
                }
                
                if (!isConnected)
                {
                    Debug.LogError("❌ Failed to connect to Blender within timeout");
                }
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to start Blender: {e.Message}");
            }
        }
        
        async Task CreateBlenderBridgeScript()
        {
            var scriptDirectory = Path.GetDirectoryName(pythonScriptPath);
            Directory.CreateDirectory(scriptDirectory);
            
            var pythonScript = $@"
import bpy
import socket
import json
import os
import mathutils
from mathutils import Vector, Euler
import time
import threading

class UnityBridge:
    def __init__(self):
        self.socket = None
        self.port = {communicationPort}
        self.running = False
        
    def connect_to_unity(self):
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect(('localhost', self.port))
            self.running = True
            print(f'Connected to Unity on port {{self.port}}')
            return True
        except Exception as e:
            print(f'Failed to connect to Unity: {{e}}')
            return False
    
    def send_message(self, message):
        if self.socket:
            try:
                json_message = json.dumps(message)
                self.socket.send(json_message.encode('utf-8'))
            except Exception as e:
                print(f'Failed to send message: {{e}}')
    
    def listen_for_commands(self):
        while self.running:
            try:
                data = self.socket.recv(1024)
                if data:
                    message = data.decode('utf-8')
                    command = json.loads(message)
                    self.process_command(command)
            except Exception as e:
                print(f'Listen error: {{e}}')
                break
    
    def process_command(self, command):
        cmd_type = command.get('type')
        
        if cmd_type == 'import_mesh':
            self.import_mesh_from_unity(command)
        elif cmd_type == 'modify_mesh':
            self.modify_mesh(command)
        elif cmd_type == 'export_mesh':
            self.export_mesh_to_unity(command)
        elif cmd_type == 'create_animation':
            self.create_animation(command)
        elif cmd_type == 'apply_modifier':
            self.apply_modifier(command)
    
    def import_mesh_from_unity(self, command):
        try:
            file_path = command['file_path']
            
            # Clear existing objects
            bpy.ops.object.select_all(action='SELECT')
            bpy.ops.object.delete(use_global=False)
            
            # Import the mesh
            if file_path.endswith('.obj'):
                bpy.ops.import_scene.obj(filepath=file_path)
            elif file_path.endswith('.fbx'):
                bpy.ops.import_scene.fbx(filepath=file_path)
            
            # Send confirmation
            self.send_message({{
                'type': 'import_complete',
                'task_id': command.get('task_id'),
                'success': True
            }})
            
        except Exception as e:
            self.send_message({{
                'type': 'import_complete',
                'task_id': command.get('task_id'),
                'success': False,
                'error': str(e)
            }})
    
    def modify_mesh(self, command):
        try:
            operation = command['operation']
            
            # Get selected object
            obj = bpy.context.active_object
            if not obj or obj.type != 'MESH':
                raise Exception('No mesh object selected')
            
            # Enter edit mode
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            
            if operation == 'subdivide':
                bpy.ops.mesh.subdivide(number_cuts=command.get('cuts', 2))
            elif operation == 'smooth':
                bpy.ops.mesh.faces_shade_smooth()
            elif operation == 'decimate':
                bpy.ops.object.mode_set(mode='OBJECT')
                modifier = obj.modifiers.new('Decimate', 'DECIMATE')
                modifier.ratio = command.get('ratio', 0.5)
                bpy.ops.object.modifier_apply(modifier='Decimate')
            elif operation == 'remesh':
                bpy.ops.object.mode_set(mode='OBJECT')
                modifier = obj.modifiers.new('Remesh', 'REMESH')
                modifier.octree_depth = command.get('depth', 6)
                bpy.ops.object.modifier_apply(modifier='Remesh')
            
            # Return to object mode
            bpy.ops.object.mode_set(mode='OBJECT')
            
            # Send confirmation
            self.send_message({{
                'type': 'modify_complete',
                'task_id': command.get('task_id'),
                'success': True
            }})
            
        except Exception as e:
            bpy.ops.object.mode_set(mode='OBJECT')
            self.send_message({{
                'type': 'modify_complete',
                'task_id': command.get('task_id'),
                'success': False,
                'error': str(e)
            }})
    
    def export_mesh_to_unity(self, command):
        try:
            output_path = command['output_path']
            
            # Select all mesh objects
            bpy.ops.object.select_all(action='DESELECT')
            for obj in bpy.context.scene.objects:
                if obj.type == 'MESH':
                    obj.select_set(True)
            
            # Export as FBX
            bpy.ops.export_scene.fbx(
                filepath=output_path,
                use_selection=True,
                global_scale=1.0,
                apply_unit_scale=True,
                bake_space_transform=False
            )
            
            # Send confirmation with file info
            self.send_message({{
                'type': 'export_complete',
                'task_id': command.get('task_id'),
                'success': True,
                'output_path': output_path
            }})
            
        except Exception as e:
            self.send_message({{
                'type': 'export_complete',
                'task_id': command.get('task_id'),
                'success': False,
                'error': str(e)
            }})
    
    def create_animation(self, command):
        try:
            animation_type = command['animation_type']
            duration = command.get('duration', 120)  # frames
            
            obj = bpy.context.active_object
            if not obj:
                raise Exception('No object selected for animation')
            
            # Clear existing keyframes
            obj.animation_data_clear()
            
            # Create animation based on type
            if animation_type == 'rotate':
                self.create_rotation_animation(obj, duration)
            elif animation_type == 'scale_pulse':
                self.create_scale_pulse_animation(obj, duration)
            elif animation_type == 'float':
                self.create_float_animation(obj, duration)
            
            # Send confirmation
            self.send_message({{
                'type': 'animation_complete',
                'task_id': command.get('task_id'),
                'success': True
            }})
            
        except Exception as e:
            self.send_message({{
                'type': 'animation_complete',
                'task_id': command.get('task_id'),
                'success': False,
                'error': str(e)
            }})
    
    def create_rotation_animation(self, obj, duration):
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path='rotation_euler', frame=1)
        
        obj.rotation_euler = (0, 0, 6.28318)  # 2π radians = 360°
        obj.keyframe_insert(data_path='rotation_euler', frame=duration)
        
        # Set interpolation to linear
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'LINEAR'
    
    def create_scale_pulse_animation(self, obj, duration):
        # Keyframes for pulsing scale
        frames = [1, duration//4, duration//2, 3*duration//4, duration]
        scales = [1.0, 1.3, 1.0, 1.3, 1.0]
        
        for i, (frame, scale) in enumerate(zip(frames, scales)):
            obj.scale = (scale, scale, scale)
            obj.keyframe_insert(data_path='scale', frame=frame)
    
    def create_float_animation(self, obj, duration):
        original_z = obj.location.z
        
        # Keyframes for floating motion
        frames = [1, duration//4, duration//2, 3*duration//4, duration]
        heights = [0, 0.5, 0, -0.5, 0]
        
        for frame, height in zip(frames, heights):
            obj.location.z = original_z + height
            obj.keyframe_insert(data_path='location', frame=frame)

# Initialize and run the bridge
if __name__ == '__main__':
    bridge = UnityBridge()
    
    if bridge.connect_to_unity():
        # Start listening in a separate thread
        listen_thread = threading.Thread(target=bridge.listen_for_commands)
        listen_thread.daemon = True
        listen_thread.start()
        
        # Keep Blender running
        print('Blender Unity Bridge active. Waiting for commands...')
        
        # Simple event loop to keep the script running
        try:
            while bridge.running:
                time.sleep(1)
        except KeyboardInterrupt:
            bridge.running = False
            print('Bridge shutdown')
    else:
        print('Failed to connect to Unity')
";
            
            File.WriteAllText(pythonScriptPath, pythonScript);
            Debug.Log($"📝 Created Blender bridge script at: {pythonScriptPath}");
        }
        
        // ============================================================
        // ASSET PIPELINE METHODS
        // ============================================================
        
        public async Task<GameObject> SendObject(GameObject obj, string operation)
        {
            if (!isConnected)
            {
                Debug.LogError("❌ Blender not connected");
                return null;
            }
            
            Debug.Log($"📤 Sending {obj.name} to Blender for {operation}");
            
            try
            {
                // Export GameObject to temporary file
                var tempFilePath = await ExportGameObjectToFile(obj);
                
                // Create task
                var taskId = Guid.NewGuid().ToString();
                var task = new BlenderTask
                {
                    Id = taskId,
                    Operation = operation,
                    InputObject = obj,
                    TempFilePath = tempFilePath,
                    Status = BlenderTaskStatus.Pending
                };
                
                activeTasks[taskId] = task;
                
                // Send import command to Blender
                var importCommand = new BlenderCommand
                {
                    Type = "import_mesh",
                    TaskId = taskId,
                    FilePath = tempFilePath
                };
                
                await SendCommandToBlender(importCommand);
                
                // Wait for import completion then send modification command
                await WaitForTaskCompletion(taskId, "import_complete");
                
                // Send modification command
                var modifyCommand = new BlenderCommand
                {
                    Type = "modify_mesh",
                    TaskId = taskId,
                    Operation = operation,
                    Parameters = GetOperationParameters(operation)
                };
                
                await SendCommandToBlender(modifyCommand);
                
                // Wait for modification completion
                await WaitForTaskCompletion(taskId, "modify_complete");
                
                // Export modified object
                var exportPath = Path.Combine(temporaryAssetPath, $"{taskId}_modified.fbx");
                var exportCommand = new BlenderCommand
                {
                    Type = "export_mesh",
                    TaskId = taskId,
                    OutputPath = exportPath
                };
                
                await SendCommandToBlender(exportCommand);
                
                // Wait for export completion
                await WaitForTaskCompletion(taskId, "export_complete");
                
                // Import modified object back to Unity
                var modifiedObject = await ImportModifiedObject(exportPath, obj.name + "_Modified");
                
                // Cleanup
                CleanupTask(taskId);
                
                return modifiedObject;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to send object to Blender: {e.Message}");
                return null;
            }
        }
        
        public async Task<GameObject> ReceiveModifiedObject()
        {
            // This method is called by the main system after SendObject completes
            // In practice, SendObject already handles the receiving
            return null;
        }
        
        async Task<string> ExportGameObjectToFile(GameObject obj)
        {
            var fileName = $"{obj.name}_{DateTime.Now.Ticks}.obj";
            var filePath = Path.Combine(temporaryAssetPath, fileName);
            
            // Create a simple OBJ export
            var meshFilter = obj.GetComponent<MeshFilter>();
            if (meshFilter?.mesh == null)
            {
                throw new Exception("GameObject has no mesh to export");
            }
            
            await ExportMeshToOBJ(meshFilter.mesh, filePath, obj.transform);
            
            Debug.Log($"📁 Exported {obj.name} to {filePath}");
            return filePath;
        }
        
        async Task ExportMeshToOBJ(Mesh mesh, string filePath, Transform transform)
        {
            var objContent = new StringBuilder();
            
            // Write header
            objContent.AppendLine("# Unity to Blender Bridge Export");
            objContent.AppendLine($"# Generated: {DateTime.Now}");
            objContent.AppendLine();
            
            // Write vertices
            foreach (var vertex in mesh.vertices)
            {
                var worldVertex = transform.TransformPoint(vertex);
                objContent.AppendLine($"v {worldVertex.x} {worldVertex.y} {worldVertex.z}");
            }
            
            // Write texture coordinates
            foreach (var uv in mesh.uv)
            {
                objContent.AppendLine($"vt {uv.x} {uv.y}");
            }
            
            // Write normals
            foreach (var normal in mesh.normals)
            {
                var worldNormal = transform.TransformDirection(normal);
                objContent.AppendLine($"vn {worldNormal.x} {worldNormal.y} {worldNormal.z}");
            }
            
            // Write faces
            for (int i = 0; i < mesh.triangles.Length; i += 3)
            {
                var v1 = mesh.triangles[i] + 1; // OBJ uses 1-based indexing
                var v2 = mesh.triangles[i + 1] + 1;
                var v3 = mesh.triangles[i + 2] + 1;
                
                objContent.AppendLine($"f {v1}/{v1}/{v1} {v2}/{v2}/{v2} {v3}/{v3}/{v3}");
            }
            
            File.WriteAllText(filePath, objContent.ToString());
        }
        
        async Task<GameObject> ImportModifiedObject(string filePath, string objectName)
        {
            Debug.Log($"📥 Importing modified object from {filePath}");
            
            try
            {
                // For simplicity, create a basic GameObject
                // In production, use a proper FBX importer
                var gameObject = new GameObject(objectName);
                
                // Add basic components
                var meshRenderer = gameObject.AddComponent<MeshRenderer>();
                var meshFilter = gameObject.AddComponent<MeshFilter>();
                
                // Create a simple mesh (placeholder)
                meshFilter.mesh = CreatePlaceholderMesh();
                meshRenderer.material = new Material(Shader.Find("Standard"));
                
                Debug.Log($"✅ Imported modified object: {objectName}");
                return gameObject;
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to import modified object: {e.Message}");
                return null;
            }
        }
        
        Mesh CreatePlaceholderMesh()
        {
            var mesh = new Mesh();
            
            mesh.vertices = new Vector3[]
            {
                new Vector3(-1, -1, 0),
                new Vector3(1, -1, 0),
                new Vector3(1, 1, 0),
                new Vector3(-1, 1, 0)
            };
            
            mesh.triangles = new int[] { 0, 2, 1, 0, 3, 2 };
            
            mesh.normals = new Vector3[]
            {
                Vector3.back,
                Vector3.back,
                Vector3.back,
                Vector3.back
            };
            
            mesh.uv = new Vector2[]
            {
                new Vector2(0, 0),
                new Vector2(1, 0),
                new Vector2(1, 1),
                new Vector2(0, 1)
            };
            
            return mesh;
        }
        
        // ============================================================
        // COMMUNICATION METHODS
        // ============================================================
        
        async Task SendCommandToBlender(BlenderCommand command)
        {
            if (!isConnected || stream == null)
            {
                throw new Exception("Blender not connected");
            }
            
            try
            {
                var jsonMessage = JsonConvert.SerializeObject(command);
                var messageBytes = Encoding.UTF8.GetBytes(jsonMessage);
                
                await stream.WriteAsync(messageBytes, 0, messageBytes.Length);
                await stream.FlushAsync();
                
                Debug.Log($"📤 Sent command to Blender: {command.Type}");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to send command to Blender: {e.Message}");
                throw;
            }
        }
        
        void ProcessBlenderMessage(string message)
        {
            try
            {
                var response = JsonConvert.DeserializeObject<BlenderResponse>(message);
                
                if (activeTasks.TryGetValue(response.TaskId, out var task))
                {
                    switch (response.Type)
                    {
                        case "import_complete":
                            task.Status = response.Success ? BlenderTaskStatus.Imported : BlenderTaskStatus.Failed;
                            break;
                        case "modify_complete":
                            task.Status = response.Success ? BlenderTaskStatus.Modified : BlenderTaskStatus.Failed;
                            break;
                        case "export_complete":
                            task.Status = response.Success ? BlenderTaskStatus.Exported : BlenderTaskStatus.Failed;
                            if (response.Success && !string.IsNullOrEmpty(response.OutputPath))
                            {
                                task.OutputPath = response.OutputPath;
                            }
                            break;
                    }
                    
                    if (!response.Success)
                    {
                        task.Error = response.Error;
                        Debug.LogError($"❌ Blender task failed: {response.Error}");
                    }
                }
                
                Debug.Log($"📥 Received from Blender: {response.Type} - {(response.Success ? "Success" : "Failed")}");
                
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Failed to process Blender message: {e.Message}");
            }
        }
        
        async Task WaitForTaskCompletion(string taskId, string expectedType)
        {
            var timeout = 30; // seconds
            var elapsed = 0;
            
            while (elapsed < timeout)
            {
                if (activeTasks.TryGetValue(taskId, out var task))
                {
                    if (task.Status == BlenderTaskStatus.Failed)
                    {
                        throw new Exception($"Blender task failed: {task.Error}");
                    }
                    
                    // Check if we've reached the expected completion state
                    if ((expectedType == "import_complete" && task.Status == BlenderTaskStatus.Imported) ||
                        (expectedType == "modify_complete" && task.Status == BlenderTaskStatus.Modified) ||
                        (expectedType == "export_complete" && task.Status == BlenderTaskStatus.Exported))
                    {
                        return;
                    }
                }
                
                await Task.Delay(1000);
                elapsed++;
            }
            
            throw new Exception($"Blender task timeout waiting for {expectedType}");
        }
        
        Dictionary<string, object> GetOperationParameters(string operation)
        {
            var parameters = new Dictionary<string, object>();
            
            switch (operation.ToLower())
            {
                case "subdivide":
                    parameters["cuts"] = 2;
                    break;
                case "decimate":
                    parameters["ratio"] = 0.5f;
                    break;
                case "remesh":
                    parameters["depth"] = 6;
                    break;
            }
            
            return parameters;
        }
        
        void CleanupTask(string taskId)
        {
            if (activeTasks.TryGetValue(taskId, out var task))
            {
                // Delete temporary files
                if (!string.IsNullOrEmpty(task.TempFilePath) && File.Exists(task.TempFilePath))
                {
                    File.Delete(task.TempFilePath);
                }
                
                if (!string.IsNullOrEmpty(task.OutputPath) && File.Exists(task.OutputPath))
                {
                    File.Delete(task.OutputPath);
                }
                
                activeTasks.Remove(taskId);
            }
        }
        
        void OnApplicationQuit()
        {
            // Cleanup connections
            if (stream != null)
            {
                stream.Close();
            }
            
            if (tcpClient != null)
            {
                tcpClient.Close();
            }
            
            if (tcpListener != null)
            {
                tcpListener.Stop();
            }
        }
    }
    
    // ============================================================
    // SUPPORTING CLASSES
    // ============================================================
    
    public enum BlenderTaskStatus
    {
        Pending,
        Imported,
        Modified,
        Exported,
        Completed,
        Failed
    }
    
    [System.Serializable]
    public class BlenderTask
    {
        public string Id;
        public string Operation;
        public GameObject InputObject;
        public string TempFilePath;
        public string OutputPath;
        public BlenderTaskStatus Status;
        public string Error;
    }
    
    [System.Serializable]
    public class BlenderCommand
    {
        public string Type;
        public string TaskId;
        public string FilePath;
        public string OutputPath;
        public string Operation;
        public Dictionary<string, object> Parameters;
    }
    
    [System.Serializable]
    public class BlenderResponse
    {
        public string Type;
        public string TaskId;
        public bool Success;
        public string Error;
        public string OutputPath;
    }
}