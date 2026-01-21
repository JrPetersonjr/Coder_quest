# 🖥️ LM STUDIO LOCAL SERVER SETUP GUIDE

## **Quick Start (5 Minutes)**

### **Step 1: Download LM Studio**
- Go to: https://lmstudio.ai
- Download for your OS (Windows, Mac, Linux)
- Install like any normal application

### **Step 2: Launch LM Studio**
1. Open LM Studio
2. Click **"Search models"** (magnifying glass icon)
3. Search for: `mistral` (fast, good quality)
4. Click download on **"Mistral 7B Instruct"**
5. Wait for download (~4GB)

### **Step 3: Start Local Server**
1. In LM Studio, go to **Local Server** tab (left sidebar)
2. Select your downloaded model from dropdown
3. Click **"Start Server"**
4. You'll see: `Server is running on http://localhost:1234`

### **Step 4: Verify Connection**
Open browser console and run:
```javascript
fetch('http://localhost:1234/v1/chat/completions', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    messages: [{role: 'user', content: 'test'}],
    max_tokens: 10
  })
})
.then(r => r.json())
.then(d => console.log('✅ Connected!', d))
.catch(e => console.log('❌ Failed:', e))
```

Should see: `✅ Connected!`

---

## **TECHNOMANCER Setup**

### **In index.html, add this:**

```html
<!-- BEFORE game initialization -->
<script src="ai-config.js"></script>
<script src="ai-deployment-config.js"></script>

<script>
  // Auto-detect local LM Studio
  AIConfig.initialize().then(success => {
    if (success) {
      console.log("[Boot] ✓ AI Ready:", AIConfig.getStatus().activeProvider);
    }
  });
</script>
```

That's it! The game will:
1. ✅ Auto-detect LM Studio on localhost:1234
2. ✅ Use it if available
3. ✅ Fall back to HuggingFace if not
4. ✅ Use pre-written content if neither available

---

## **How to Know It's Working**

### **In Browser Console:**
```javascript
// Check status
AIConfig.getStatus()

// Should show:
{
  initialized: true,
  activeProvider: "local",  // ← This means LM Studio is connected!
  availableProviders: ["local"],
  requestCount: 0,
  failureCount: 0,
  features: {
    crystalBall: true,
    dmNarrative: true,
    generativeContent: true
  }
}
```

### **In Game:**
- Go to Crystal Ball terminal
- It should generate unique prophecies (not repeating fallbacks)
- Each prophecy should be different

### **If It's NOT Working:**
```javascript
// Run diagnostic
checkAIHealth()

// Should show "Local model detected"
// If not, check:
// 1. Is LM Studio running? (http://localhost:1234 in browser)
// 2. Is a model loaded? (should say "Loaded: Mistral 7B" in LM Studio)
// 3. Any error messages in console?
```

---

## **Recommended Models**

| Model | Speed | Quality | VRAM | Recommendation |
|-------|-------|---------|------|-----------------|
| **Mistral 7B** | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ | 6GB | ✅ BEST START |
| Llama 2 13B | ⚡⚡ Medium | ⭐⭐⭐⭐⭐ | 10GB | If you have VRAM |
| Phi 2.7B | ⚡⚡⚡⚡ Fastest | ⭐⭐⭐ | 3GB | If low VRAM |

**Recommendation:** Start with **Mistral 7B** - best balance of speed & quality

---

## **Troubleshooting**

### **Issue: "No local model found"**
```
Fix:
1. Check LM Studio is open and running
2. Verify "Start Server" button is active
3. Try: http://localhost:1234 in browser
4. Should get JSON response (not error)
```

### **Issue: "Server is running but AI not responding"**
```
Fix:
1. Make sure a model is selected in LM Studio
2. Check model finished downloading
3. Restart the local server
4. Run: testAISystem() in console
```

### **Issue: "Very slow responses"**
```
Reasons:
- Model is loading (first request is slow)
- VRAM is limited (system using disk cache)
- Model too large for hardware

Fix:
- Use smaller model (Phi 2.7B instead of Llama 70B)
- Or use HuggingFace cloud (faster)
- Or use OpenAI (fastest)
```

### **Issue: "LM Studio won't start / crashes"**
```
Fix:
1. Restart LM Studio completely
2. Try smaller model (Mistral 7B)
3. Check system has enough VRAM available
4. Update LM Studio to latest version
```

---

## **Advanced: Custom Server URL**

If you're running LM Studio on a different port or machine:

```javascript
AIConfig.setLocalModelURL('http://192.168.1.100:8000/v1/chat/completions');
AIConfig.initialize();
```

---

## **Switching Between Providers**

### **Use Local LM Studio:**
```javascript
setupDevelopment();  // Auto-uses localhost:1234
AIConfig.initialize();
```

### **Use HuggingFace Cloud:**
```javascript
setupStaging();  // Uses free cloud tier
AIConfig.initialize();
```

### **Use OpenAI:**
```javascript
setupProductionOpenAI('sk_your_key');
AIConfig.initialize();
```

### **Use Hybrid (Local + Cloud Fallback):**
```javascript
setupProductionHybrid('hf_token');  // Local first, HF backup
AIConfig.initialize();
```

---

## **Performance Tips**

### **For Best Speed:**
1. Use LM Studio + Mistral 7B locally
2. First request: ~2-3 seconds (loading)
3. Subsequent requests: <1 second
4. Keep LM Studio running in background

### **For Best Quality:**
1. Use OpenAI GPT-4 (or GPT-3.5)
2. Cost: ~$0.001 per request
3. Speed: <500ms per request
4. Reliability: 99.9% SLA

### **For Offline/Demo:**
1. Use `setupOffline()`
2. Speed: Instant (<10ms)
3. Uses pre-written fallback content
4. No internet needed

---

## **System Requirements**

### **For LM Studio + Mistral 7B:**
- **RAM:** 12GB+ (6GB model + OS overhead)
- **GPU:** Recommended (10x faster with GPU)
- **CPU:** 4+ cores
- **Disk:** 10GB free (for model)

### **GPU Acceleration:**
LM Studio auto-detects:
- NVIDIA CUDA (fastest)
- AMD ROCm (good)
- Apple Metal (M1/M2 optimized)
- CPU fallback (slowest)

---

## **Keeping LM Studio Running**

### **During Development:**
1. Open LM Studio once
2. Start the server
3. Leave it running in background
4. Game auto-connects

### **For Deployment:**
```bash
# You could automate server startup:
# (Platform-specific)

# Windows batch file:
@echo off
start "" "C:\Users\YourName\AppData\Local\LM Studio\LMStudio.exe"
timeout /t 5
REM Now open game
```

### **Or use cloud providers for production:**
- No need to manage local server
- Automatic scaling
- 99.9% uptime SLA

---

## **Testing AI Features**

### **Test Crystal Ball:**
```javascript
AIConfig.generateCrystalBall("What is my destiny?")
  .then(prophecy => console.log(prophecy))
```

### **Test DM Narrative:**
```javascript
AIConfig.generateDMNarrative("The player enters a mysterious cave")
  .then(narrative => console.log(narrative))
```

### **Test Generative Content:**
```javascript
AIConfig.generateContent("quest", "theme: security hacking")
  .then(quest => console.log(quest))
```

### **Full System Test:**
```javascript
testAISystem()  // Runs all tests + diagnostics
```

---

## **Full Integration Example**

```html
<!DOCTYPE html>
<html>
<head>
  <title>TECHNOMANCER</title>
</head>
<body>
  <div id="game-container"></div>

  <!-- Load AI system -->
  <script src="ai-config.js"></script>
  <script src="ai-deployment-config.js"></script>
  
  <!-- Load game -->
  <script src="GameEngine.js"></script>
  <script src="ancient-terminals.js"></script>
  
  <!-- Initialize -->
  <script>
    async function init() {
      // Setup AI (auto-detects local LM Studio)
      setupDevelopment();
      
      // Initialize
      await AIConfig.initialize();
      
      // Check status
      const status = AIConfig.getStatus();
      console.log("[Boot] AI Status:", status);
      
      // Start game
      const gameEngine = new GameEngine({...});
      gameEngine.boot();
    }
    
    // Start when ready
    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
```

---

## **LM Studio + TECHNOMANCER Workflow**

```
1. Morning: Open LM Studio
   └─ Click "Start Server" (stays running)

2. Development: Open TECHNOMANCER in browser
   └─ Auto-detects local LM Studio
   └─ AI features work instantly
   └─ Responses <1 second

3. Testing: Run testAISystem()
   └─ Verifies all features working
   └─ Shows any errors

4. Playthrough: Enjoy dynamic AI narratives
   └─ Each prophecy is unique
   └─ Each zone description is fresh
   └─ Never see same generated content twice

5. End of day: Close LM Studio
   └─ Can reopen next day, same model loaded
```

---

## **One-Command Setup**

If you want a completely automated setup:

**Windows Batch (setup-lm-studio.bat):**
```batch
@echo off
echo Starting LM Studio...
start "" "C:\Users\%USERNAME%\AppData\Local\LM Studio\LMStudio.exe"
timeout /t 3
echo LM Studio starting...
echo Once it loads, click: Local Server > Start Server
echo Then open the game
pause
```

---

**You're all set! LM Studio will power your game with locally-hosted AI that never leaves your computer.** 🚀

