# 🎭 QWEN ROLEPLAY V2 SETUP GUIDE
**Automatic Role Enforcement for Coder's Quest**

## 🚀 Quick Setup

### 1. **Install Qwen in LM Studio**
```bash
# In LM Studio, search for and download:
- bartowski/Qwen2.5-14B-Instruct-GGUF
- Or: bartowski/Qwen2.5-7B-Instruct-GGUF (lighter)
- Or: bartowski/Qwen2.5-3B-Instruct-GGUF (fastest)
```

### 2. **Configure LM Studio**
- **Server Settings:**
  - Port: `1234` (default)
  - Enable CORS: ✅
  - Model Context: 4096+ tokens
  
- **Generation Settings:**
  - Temperature: `0.7`
  - Max Tokens: `300`
  - Top P: `0.9`

### 3. **Start the Server**
```bash
# In LM Studio, click "Start Server"
# Verify it's running at: http://localhost:1234
```

## 🎯 **Role Enforcement Features**

Your game now automatically ensures AI stays in character through:

### **✅ Oracle Character**
- **Automatic Corrections:** "I think" → "I foresee"
- **Required Elements:** Must mention crystal, prophecy, visions
- **Mystical Endings:** Auto-adds "...and the crystal dims"
- **Prohibited:** Never breaks character as helpful AI

### **✅ Dungeon Master**
- **Immersion Protection:** "As a DM" → "From the digital realm"  
- **Cyberpunk Vocabulary:** "Room" → "Data chamber"
- **Present Tense:** Always "You see..." never "The player..."
- **No Meta-Gaming:** Removes dice/mechanic references

### **✅ NPCs/Entities**
- **Digital Identity:** Maintains they're programs, not people
- **Personality Consistency:** Hostile ICE vs helpful assistant AI
- **Tech Terminology:** Uses appropriate cyberpunk language

## 🧪 **Testing Character Consistency**

### **In-Game Commands:**
```bash
# Test overall Qwen integration
test qwen

# Test specific character types
test character oracle       # Test crystal ball prophecies
test character dungeonMaster # Test world narration  
test character npcEntity     # Test NPC dialogue

# Test AI connections
test ai                      # Overall AI system
test local                   # Local model specifically
```

### **Manual Testing:**
```bash
# Test Oracle consistency
/crystal "What is my coding destiny?"

# Test DM consistency  
go hub_archive
look

# Test generative content
# (Terminal emails, boss intros, etc.)
```

## 🔧 **Customization**

### **Adjust Model Settings:**
Edit `qwen-roleplay-config.js`:
```javascript
qwenSettings: {
  model: "your-exact-model-name",
  generationParams: {
    temperature: 0.7,    // Lower = more consistent
    max_tokens: 300,     // Adjust response length
    top_p: 0.9          // Adjust creativity
  }
}
```

### **Modify Character Rules:**
```javascript
characterTemplates: {
  oracle: {
    validation: {
      mustContain: ["crystal", "foresee"],
      prohibited: ["I think", "maybe"],
      maxLength: 250
    }
  }
}
```

## 🚨 **Troubleshooting**

### **Common Issues:**

**"Qwen API error: 400"**
- Check model name matches LM Studio exactly
- Verify server is running on port 1234

**"Role violations detected"**
- This is GOOD! System is working
- Check console for auto-corrections
- Increase `maxRetries` if needed

**"Empty response from Qwen"**
- Model might be overloaded
- Try lowering temperature or max_tokens
- Restart LM Studio

### **Performance Tuning:**
```javascript
// For faster responses (lower quality):
temperature: 0.5
max_tokens: 200

// For better quality (slower):
temperature: 0.8  
max_tokens: 400
```

## 📊 **Monitoring**

### **Console Logs:**
```bash
[Qwen] Response corrected for oracle character consistency
Original: I think you might have some coding challenges...
Corrected: I foresee thy algorithms shall face great trials...
```

### **Character Validation:**
- ✅ **Valid:** No corrections needed
- ⚠️ **Modified:** Auto-corrected for consistency  
- ❌ **Failed:** Exceeded retry limit (rare)

## 🎮 **Benefits for Players**

### **Immersive Experience:**
- Oracle always speaks in character as mystical entity
- DM maintains cyberpunk atmosphere consistently
- NPCs have consistent personalities and motivations

### **No Manual Policing:**
- System automatically fixes out-of-character responses
- Players never see "I'm an AI assistant" messages
- Maintains game immersion without user intervention

### **Adaptive Quality:**
- Retries generation if character rules violated
- Falls back to other AI providers if needed
- Logs all corrections for monitoring

---

**🎯 Result:** Your Coder's Quest game now has bulletproof character consistency with zero manual policing required!