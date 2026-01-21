# AI-DM INTEGRATION GUIDE

**Version:** Multi-Agent Coordinator with Persistent NPC Memory  
**Date:** January 19, 2026  
**Status:** Ready for GameEngine integration

---

## 🎯 SYSTEM OVERVIEW

The AI DM Integration provides:

1. **Persistent NPC Memory** with semantic compression
2. **Multi-Provider Support** (Claude, Ollama, LM Studio, NVIDIA-ready)
3. **Central Dispatcher** (invisible routing)
4. **Human-like Memory Decay** (short/medium/long-term tiers)
5. **Choice Consequence Tracking** (events affect future interactions)
6. **Connectivity Quest** (hidden API setup)
7. **Dual Storage** (localStorage + IndexedDB)

---

## 💾 MEMORY SYSTEM

### Three Memory Tiers

```
SHORT-TERM (Current Session + Last 2)
├─ Verbatim conversation history
├─ Recent choices with full context
└─ Expires after 3 sessions

MEDIUM-TERM (Compressed, Sessions 3-10)
├─ Semantic summaries of old interactions
├─ "You were helpful to me before"
├─ Details blur, gist remains
└─ Expires after 10 sessions

LONG-TERM (Permanent)
├─ ONLY major events saved
├─ Quest completions
├─ Betrayals, alliances, defeats
├─ "You saved my tribe" - NEVER forgotten
└─ Never expires
```

### Big Events (Auto-Tagged)

```javascript
const bigEventTypes = [
  "boss_battle",           // Major combat
  "player_defeated",       // Player died
  "treasure_acquired",     // Epic loot
  "epic_item_found",       // Legendary item
  "quest_completed",       // Quest finished
  "npc_quest_completed",   // NPC side quest
  "betrayal",              // Player betrayed NPC
  "insult",                // Player insulted NPC
  "theft",                 // Player stole from NPC
  "moral_choice",          // Significant choice
  "alliance_formed",       // New ally
  "enemy_made",            // New enemy
  "player_saved_npc",      // Hero moment
  "player_sacrificed_for_npc" // Huge character moment
];
```

---

## 🎲 USAGE PATTERNS

### Pattern 1: Initialize System

```javascript
// On game boot
await AIDMIntegration.initialize();

// Returns:
{
  initialized: true,
  provider: "ollama",  // or "claude", "lm-studio", "offline"
  localModelFound: "ollama",
  npcCount: 5,
  totalEvents: 42,
  currentSession: 7
}
```

### Pattern 2: NPC Interaction with Memory Recall

```javascript
// Player encounters an NPC
const goblinLeaderId = "npc_goblin_leader";

// System recalls NPC's memory of player
const memory = AIDMIntegration.recallMemory(goblinLeaderId);

// Result:
{
  npcName: "Gruk",
  relationshipStatus: "ally",
  lastInteraction: "You gave me a floppy disk upgrade",
  summary: "We have a strong bond of trust. Last time we met, you gave me a floppy disk. We formed an alliance.",
  keyEvents: [
    { type: "alliance_formed", data: "Pact signed" },
    { type: "treasure_acquired", data: "Shared loot" }
  ],
  preferences: {
    likedBy: ["clever hacks", "technology", "loyalty"],
    dislikes: [],
    hobbies: ["terminal upgrading"]
  }
}
```

### Pattern 3: Record Event (Auto-Tagged)

```javascript
// Big event: Player completes NPC's quest
AIDMIntegration.recordEvent(goblinLeaderId, "quest_completed", {
  npcName: "Gruk",
  playerChoice: "heroic_sacrifice",
  outcome: "NPC saved, new terminal unlocked",
  forceImportant: false // Auto-tags as big event
});

// Result: Gruk will NEVER forget this
// Memory saved to long-term, available forever
```

### Pattern 4: Player-Initiated Memory

```javascript
// Player says: "Remember, I like sneaky hacking"
AIDMIntegration.playerSaysRemember(goblinLeaderId, "sneaky hacking");

// Gruk now remembers this preference
// Next interaction: "I recall you prefer... the subtle approach"
```

### Pattern 5: AI-Committed Memory

```javascript
// AI DM decides something is important
AIDMIntegration.aiCommitsToMemory(
  npcId,
  "Player hummed an ancient song - Gruk recognized it as his mother's lullaby",
  "important"
);

// This detail saved to long-term memory
// May affect future emotional responses
```

### Pattern 6: Central Dispatcher (Invisible)

```javascript
// Player: "I try to negotiate with the Goblins"

// Behind scenes, dispatcher routes:
const result = await AIDMIntegration.dispatch({
  playerAction: "I try to negotiate with the Goblins",
  npcId: "npc_goblin_leader",
  location: "imp_warren",
  actionType: "npc_interaction"
});

// Result:
{
  npcResponse: "Gruk's eyes narrow. 'You return... and alone? Bold, Technomancer.'",
  nextActions: ["attack", "talk", "flee"]
}

// Player never sees the routing, just the response
```

### Pattern 7: Memory Decay (Between Sessions)

```javascript
// After session ends, apply decay
AIDMIntegration.decayMemory();

// Automatically:
// 1. Compresses short-term to medium-term (if > 3 sessions old)
// 2. Fades medium-term details (if > 10 sessions old)
// 3. Preserves long-term forever

// Session 1: Player helps Gruk
// → Saved verbatim in short-term

// Session 4: Player returns
// → Old interaction compressed to summary
// → Gruk remembers: "You've been helpful"
// → Details fade, gist remains

// Session 15: Player betrays Gruk
// → New big event in long-term
// → Gruk remembers: "You saved me before, but you betrayed me. I won't forget."
```

### Pattern 8: Connectivity Quest (Hidden Setup)

```javascript
// First time player accesses a terminal:
const quest = AIDMIntegration.getConnectivityQuest();

// Result:
{
  id: "dial_out",
  name: "DIAL OUT",
  steps: [
    { id: "detect", action: "auto_detect_local" },
    { id: "api_setup", action: "api_setup_prompt" },
    { id: "test", action: "test_connection" }
  ]
}

// Flow:
// 1. "Scanning for local quantum tunnel..."
//    → Auto-detects Ollama/LM Studio
//    → IF found: "✓ Local quantum tunnel established"
//    → IF not: Prompts for cloud setup

// 2. If cloud setup: Hidden input for API key
//    → Never shows key in clear text
//    → Validates connection
//    → Saves securely

// 3. Test connection
//    → "Cloud backend synced. Expanded content available."

// Player never sees "configure API key"
// Just: "Establishing connection... Done!"
```

---

## 🔧 INTEGRATION CHECKLIST

### GameEngine.js Modifications

- [ ] Import ai-dm-integration.js
- [ ] Call `await AIDMIntegration.initialize()` in `initGame()`
- [ ] Store current NPC interactions in `gameState.currentNPC`
- [ ] On NPC encounter, call `AIDMIntegration.recallMemory(npcId)`
- [ ] Display recalled memory as NPC greeting
- [ ] On big events (quest complete, defeat), call `AIDMIntegration.recordEvent()`
- [ ] Hook `dispatch()` for all NPC interactions
- [ ] Implement Connectivity Quest as first terminal

### NPC Integration

```javascript
// In cmdInteractWithNPC(npcId):
const memory = AIDMIntegration.recallMemory(npcId);

// Display greeting based on memory
if (memory.relationshipStatus === "trusted") {
  output(`${memory.npcName}: "${memory.summary}"`);
} else if (memory.relationshipStatus === "enemy") {
  output(`${memory.npcName}: "You! I haven't forgotten..."`);
}

// Get NPC response
const response = await AIDMIntegration.dispatch({
  playerAction: input,
  npcId: npcId,
  location: gameState.zone,
  actionType: "npc_interaction"
});

output(response.npcResponse);
```

### Event Recording

```javascript
// On quest completion:
AIDMIntegration.recordEvent(npcId, "quest_completed", {
  npcName: npc.name,
  playerChoice: playerAction,
  outcome: "quest_completed",
  reward: questReward
});

// On defeat:
AIDMIntegration.recordEvent(npcId, "player_defeated", {
  npcName: npc.name,
  playerChoice: "defeated",
  outcome: "fled_to_hub"
});

// On betrayal:
AIDMIntegration.recordEvent(npcId, "betrayal", {
  npcName: npc.name,
  playerChoice: "stole_item",
  outcome: "relationship_damaged",
  forceImportant: true
});
```

---

## 📊 MEMORY EXAMPLE WALKTHROUGH

```
SESSION 1:
  Player: "I want to help you"
  Gruk: "I need a power upgrade for my terminal"
  Player: Gives floppy disk
  
  → Recorded: SHORT-TERM (verbatim)
  → Gruk's memory: "Technomancer gave me floppy disk. Helpful."

SESSION 2:
  Player: Helps Gruk defeat miniboss
  
  → Recorded: SHORT-TERM (new event)
  → Gruk's memory: "Fought together. Growing bond."

SESSION 3:
  Player: Other adventures
  
  → Both old events still in SHORT-TERM (verbatim)
  → Gruk remembers exact details

SESSION 4:
  Player: Returns to Gruk
  
  → Memory decay triggers
  → Session 1-2 events COMPRESS to summary:
    "This Technomancer has been consistently helpful. Multiple positive interactions."
  → Moved to MEDIUM-TERM
  
  Gruk: "You've been a good friend to me, Technomancer."
  
  [Details fade, gist remains - just like remembering an old friend]

SESSION 15:
  Player: Steals Gruk's prized terminal part
  
  → BIG EVENT - goes to LONG-TERM
  → Never expires, never fades
  
  Gruk: "You were my friend. But you took from me. I won't forget this."

SESSION 25:
  Player: Returns to Gruk
  
  → SHORT-TERM: Empty (many sessions passed)
  → MEDIUM-TERM: Vague summaries (helpful friend)
  → LONG-TERM: Betrayal (still fresh in memory)
  
  Gruk: "You return... after all this time. I remember when we were allies...
         and I remember when you betrayed me. Why should I trust you again?"
  
  [Human-like memory: faded details + lasting emotional scars]
```

---

## 🚀 NEXT STEPS

1. **Integrate into GameEngine.js**
   - Add AI DM initialization
   - Hook NPC interactions
   - Record events

2. **Test Memory Recall**
   - Meet NPC, record events
   - Leave session
   - Return and verify memory works

3. **Test Connectivity Quest**
   - First terminal interaction
   - Verify API setup is hidden
   - Confirm local model detection

4. **Implement Dispatcher**
   - Route NPC interactions
   - Route terminal challenges
   - Route encounters

5. **Build Provider Integration**
   - Implement callLocalModel()
   - Implement callClaude()
   - Implement callOfflineMode()

---

**Document:** AI_DM_INTEGRATION_GUIDE.md  
**Created:** January 19, 2026  
**Status:** Ready for implementation
