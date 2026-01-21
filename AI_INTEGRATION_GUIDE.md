# 🤖 AI INTEGRATION GUIDE - TECHNOMANCER

## **Overview**

The TECHNOMANCER RPG now has a complete AI integration framework that powers three core features:

1. **💎 Crystal Ball** - Mystical prophecy generation (divination terminal)
2. **🎭 DM (Dungeon Master)** - Dynamic narrative & dialogue generation
3. **✨ Generative Content** - Procedural quest/enemy/challenge generation

All features have **graceful fallbacks** - if AI is unavailable, the game uses pre-written content.

---

## **Quick Start for Site Admins**

### **Option 1: Free HuggingFace API (No Setup)**

HuggingFace works out-of-the-box with rate limiting. Best for small deployments.

```html
<!-- In your deployment: -->
<script>
  AIConfig.setAPIKey('huggingface', 'YOUR_HUGGINGFACE_TOKEN');
  // Optional - improves reliability:
  AIConfig.initialize();
</script>
```

**Get free token:** https://huggingface.co/settings/tokens

### **Option 2: Local Model (Best Performance)**

Run **LM Studio** or **Ollama** locally, then configure:

```html
<script>
  AIConfig.setLocalModelURL('http://localhost:1234/v1/chat/completions');
  // or for Ollama:
  AIConfig.setLocalModelURL('http://localhost:11434/api/generate');
  AIConfig.initialize();
</script>
```

**Download:** https://lmstudio.ai or https://ollama.ai

### **Option 3: OpenAI API (Production Quality)**

For professional deployments:

```html
<script>
  AIConfig.setAPIKey('openai', 'sk-YOUR_OPENAI_API_KEY');
  AIConfig.initialize();
</script>
```

---

## **Architecture: AI Framework**

### **Three-Tier System**

```
┌─────────────────────────────────────────┐
│  Game Features                          │
│  (Crystal Ball, DM, Content Gen)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  AIConfig.js - Abstraction Layer        │
│  (Provider selection, fallbacks)        │
└────────────────┬────────────────────────┘
                 │
        ┌────────┼────────┬───────────┐
        │        │        │           │
┌───────▼──┐  ┌──▼──┐  ┌──▼──┐  ┌────▼────┐
│  Local   │  │ HF  │  │OpenAI│  │Fallback │
│ LM Studio│  │ API │  │ API │  │Content  │
└──────────┘  └─────┘  └─────┘  └─────────┘
```

### **Key Components**

| File | Purpose |
|------|---------|
| `ai-config.js` | Central hub for all AI operations |
| `ancient-terminals.js` | Terminal minigames using AI |
| `quest-system.js` | Quest generation (optional AI) |
| `index.html` | Initialize AI on boot |

---

## **Feature Breakdown**

### **1. Crystal Ball 💎**

**Location:** Hub Nexus Portal (terminal minigame)

**What it does:** Generates mysterious prophecies and divinations

**System Prompt:**
```
You are an ancient Oracle bound within a crystal orb. 
You speak in cryptic riddles and mysterious prophecies. 
Your responses are poetic, metaphorical, and always leave the seeker questioning.
Respond in 2-3 sentences maximum. Stay mysterious and in-character.
```

**Usage:**
```javascript
const prophecy = await AIConfig.generateCrystalBall("What awaits me in the city zone?");
// Returns: "The neon gods watch from above. A choice between power and truth."
```

**Fallback Content:**
- "The crystal grows cloudy... Your fate remains unwritten."
- "Shadows dance across the sphere. Great trials await you."
- "The future shifts. Many paths diverge from this moment."

---

### **2. DM (Dungeon Master) 🎭**

**Location:** Narrative interactions, encounters, dialogue

**What it does:** Generates responsive narrative content that reacts to player actions

**System Prompt:**
```
You are the Dungeon Master of a cyberpunk hacker RPG called TECHNOMANCER.
The player is a digital entity exploring a world of code, magic, and ancient terminals.
Generate vivid, atmospheric descriptions that blend hacker culture with fantasy.
Respond to player actions with narrative callbacks and consequences.
```

**Usage:**
```javascript
const narrative = await AIConfig.generateDMNarrative(
  "The player enters the Forest Zone for the first time"
);
// Returns: "Towering functions cast long shadows. You feel watched by ancient algorithms."
```

**Integration Points:**
- Hub Nexus Portal (narrative terminal)
- Zone transitions (entry descriptions)
- Encounter generation
- Enemy dialogue

---

### **3. Generative Content ✨**

**Location:** Quest generation, procedural content

**What it does:** Creates dynamic quest descriptions, enemy names, terminal prompts

**Usage:**
```javascript
// Generate a quest description
const questDesc = await AIConfig.generateContent("quest", 
  "theme: cyberpunk hacker, location: city zone"
);

// Generate enemy description
const enemyDesc = await AIConfig.generateContent("enemy",
  "type: corrupted algorithm"
);

// Generate terminal challenge
const challenge = await AIConfig.generateContent("challenge",
  "difficulty: beginner, skill: coding"
);
```

**Fallback Content:**
- Quest names: "Delve Deeper into Data", "Crash the Corrupted Core"
- Descriptions: "A corrupted entity that shouldn't exist"
- Challenges: "Write a function to reverse this string"

---

## **Integration with Game Systems**

### **AncientTerminals.js Integration**

The `ancient-terminals.js` file now calls `AIConfig` instead of managing providers directly:

```javascript
// BEFORE (old way):
const response = await this.aiBackend.generate(prompt);

// AFTER (new way):
const response = await AIConfig.generate(prompt, "dm");
```

### **Quest System Integration**

Optional: Quests can use AI for descriptions:

```javascript
questSystem.onQuestCreated = async (quest) => {
  if (AIConfig.config.aiFeatures.generativeContent) {
    quest.description = await AIConfig.generateContent("quest", 
      `theme: ${quest.theme}`
    );
  }
};
```

### **Index.html Initialization**

Add to your boot sequence:

```html
<script src="ai-config.js"></script>
<script>
  // Initialize AI after page loads
  AIConfig.initialize().then(success => {
    if (success) {
      console.log("AI system ready!");
    } else {
      console.log("AI system unavailable - using fallback content");
    }
  });
</script>
```

---

## **Deployment Configurations**

### **Development (Local Model)**

```javascript
// .env or config file
AIConfig.setLocalModelURL('http://localhost:1234/v1/chat/completions');
```

**Setup:**
1. Download LM Studio: https://lmstudio.ai
2. Load any model (e.g., Mistral 7B)
3. Start local server on port 1234
4. Game will auto-detect

### **Staging (HuggingFace Free)**

```javascript
// Use free tier (rate-limited but free)
// No configuration needed - works out-of-the-box
```

**Limitations:**
- ~30 requests per minute
- Occasional rate-limiting

### **Production (HuggingFace Pro)**

```javascript
AIConfig.setAPIKey('huggingface', 'hf_YOUR_PRO_TOKEN_HERE');
```

**Benefits:**
- 1000+ requests per minute
- Dedicated resources
- Priority support

### **Production (OpenAI)**

```javascript
AIConfig.setAPIKey('openai', 'sk_YOUR_OPENAI_KEY_HERE');
```

**Benefits:**
- Highest quality responses
- GPT-4 available
- Reliable production SLA

---

## **Admin Controls**

### **Enable/Disable Features**

```javascript
// Disable Crystal Ball
AIConfig.setFeature('crystalBall', false);

// Disable DM generation
AIConfig.setFeature('dmNarrative', false);

// Disable all procedural content
AIConfig.setFeature('generativeContent', false);
```

### **Get System Status**

```javascript
const status = AIConfig.getStatus();
console.log(status);
/* Output:
{
  initialized: true,
  activeProvider: "local",
  availableProviders: ["local", "huggingface"],
  requestCount: 247,
  failureCount: 3,
  features: {
    crystalBall: true,
    dmNarrative: true,
    generativeContent: true
  }
}
*/
```

### **Tune Generation Parameters**

```javascript
AIConfig.setGenerationParams({
  maxTokens: 200,      // Longer responses
  temperature: 0.9,    // More creative
  topP: 0.95,          // Broader vocabulary
});
```

---

## **Fallback Strategy**

When AI is unavailable, the system uses pre-written content:

```
┌─────────────────────────────────────┐
│ 1. Try primary provider             │ (e.g., local model)
└──────────┬──────────────────────────┘
           │ (fails)
┌──────────▼──────────────────────────┐
│ 2. Try fallback provider            │ (e.g., HuggingFace)
└──────────┬──────────────────────────┘
           │ (fails)
┌──────────▼──────────────────────────┐
│ 3. Use pre-written fallback content │
└──────────────────────────────────────┘
```

**Fallback content is:**
- ✅ Always available
- ✅ Thematic and appropriate
- ✅ Loaded at startup (no latency)
- ✅ Rotated randomly for variety

---

## **Error Handling**

All AI calls gracefully handle failures:

```javascript
// Example: Failed AI request
try {
  const response = await AIConfig.generateDMNarrative("...");
  // If AI fails, returns fallback automatically
  console.log(response); // "The terminal falls silent..."
} catch (e) {
  // Won't throw - fallback always succeeds
  console.log("This catch block never executes");
}
```

**Failure scenarios handled:**
- ❌ API key invalid → Try fallback provider
- ❌ Network timeout → Retry with exponential backoff
- ❌ All providers down → Use pre-written content
- ❌ Invalid response format → Return fallback

---

## **Performance Considerations**

### **Request Caching (Future)**

```javascript
// Cache prophecies for 1 hour
AIConfig.enableCache('crystalBall', 3600);

// Same query returns cached result (0ms vs 2000ms)
const prophecy = await AIConfig.generateCrystalBall("What's next?");
const cached = await AIConfig.generateCrystalBall("What's next?");
// cached returns instantly
```

### **Batch Requests**

```javascript
// Generate multiple challenges concurrently
const challenges = await Promise.all([
  AIConfig.generateContent("quest", "theme: security"),
  AIConfig.generateContent("enemy", "type: data-corrupted"),
  AIConfig.generateContent("challenge", "difficulty: hard"),
]);
```

### **Local Model Performance**

| Model | Speed | Quality | VRAM |
|-------|-------|---------|------|
| Mistral 7B | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ Good | 6GB |
| Llama 2 13B | ⚡⚡ Medium | ⭐⭐⭐⭐⭐ Great | 10GB |
| Llama 2 70B | ⚡ Slow | ⭐⭐⭐⭐⭐ Excellent | 40GB+ |

---

## **Troubleshooting**

### **Issue: "No AI providers available"**

```
Reason: No API keys set, no local model running
Fix: 
  1. Set HuggingFace API key: AIConfig.setAPIKey('huggingface', 'hf_...')
  2. Or start LM Studio: lmstudio.ai
  3. Or game will use fallback content (works fine)
```

### **Issue: Rate limiting errors from HuggingFace**

```
Reason: Free tier is throttled
Fix:
  - Upgrade to pro: https://huggingface.co/pricing
  - Or use local model: https://lmstudio.ai
  - Or increase cache time (TODO feature)
```

### **Issue: Local model not detected**

```
Reason: Port mismatch
Fix:
  - LM Studio uses 1234 (default)
  - Ollama uses 11434 (default)
  - Set correct URL: AIConfig.setLocalModelURL('http://localhost:1234/v1/chat/completions')
```

### **Issue: Generation is slow**

```
Reason: Model too large for hardware
Fix:
  - Switch to faster model (Mistral 7B instead of Llama 70B)
  - Use HuggingFace instead (optimized servers)
  - Enable response caching (future feature)
```

---

## **API Reference**

### **Public Methods**

```javascript
// Core generation
AIConfig.generateCrystalBall(query)           // Returns: string
AIConfig.generateDMNarrative(context)         // Returns: string
AIConfig.generateContent(type, hint)          // Returns: string
AIConfig.generate(prompt, featureType)        // Returns: string

// Configuration
AIConfig.setAPIKey(provider, key)             // Returns: boolean
AIConfig.setLocalModelURL(url)                // Returns: void
AIConfig.setFeature(feature, enabled)         // Returns: boolean
AIConfig.setGenerationParams(params)          // Returns: void
AIConfig.initialize()                         // Returns: Promise<boolean>

// Status
AIConfig.getStatus()                          // Returns: object
AIConfig.loadConfig()                         // Returns: void
AIConfig.saveConfig()                         // Returns: void
```

### **Configuration Object**

```javascript
AIConfig.config = {
  apiKeys: {
    huggingface: null,  // Set your token here
    openai: null,
    anthropic: null,
  },
  primaryProvider: "huggingface",  // "local", "huggingface", "openai"
  fallbackProviders: ["local", "huggingface"],
  localModelUrl: "http://localhost:1234/v1/chat/completions",
  aiFeatures: {
    crystalBall: true,
    dmNarrative: true,
    generativeContent: true,
  },
}
```

---

## **Example: Complete Setup**

```html
<!-- In index.html -->

<!-- Load AI config before game engine -->
<script src="ai-config.js"></script>

<!-- Load game -->
<script src="GameEngine.js"></script>
<script src="ancient-terminals.js"></script>

<script>
  // Option A: Use local model (LM Studio)
  AIConfig.setLocalModelURL('http://localhost:1234/v1/chat/completions');

  // Option B: Use HuggingFace (uncomment and set your token)
  // AIConfig.setAPIKey('huggingface', 'hf_YOUR_TOKEN_HERE');

  // Initialize AI system
  AIConfig.initialize().then(success => {
    console.log(`AI System ${success ? 'Ready' : 'Using Fallbacks'}`);
    
    // Start game...
    gameEngine.boot();
  });
</script>
```

---

## **Future Enhancements**

- [ ] Response caching (1-24 hour TTL)
- [ ] Batch API requests for cost savings
- [ ] Fine-tuned models per feature
- [ ] Streaming responses (for long narratives)
- [ ] Multi-language support
- [ ] Model A/B testing framework
- [ ] Usage analytics & cost tracking

---

## **Support & Questions**

For questions about AI integration:
1. Check this guide first
2. Review `AIConfig.getStatus()` output
3. Check browser console for `[AI]` logs
4. Check `ai-config.js` source code comments

---

**Status:** ✅ Ready for production deployment

