## DYNAMIC AI NARRATIVE SYSTEM - Complete Architecture

### Overview

**Before:** Static pre-written documents  
**Now:** AI-generated emails that evolve with player progression, with strategic narrative milestones

Your journey:
1. **Wake up** (Amnesia start - only have Cast Console)
2. **Character creation** → First identity fragment via AI-generated email
3. **Exploration & discovery** → Learn world through dynamically generated correspondence
4. **Boss encounters** → Progression locked behind mini/sub/demi/prime bosses
5. **Terminal restoration** → Each restored terminal changes the world
6. **Identity realization** → Halfway through, learn your role & power
7. **Final confrontation** → Discover you are THE RECURSION or the cure for it

---

## File Structure

### New Files

**1. dynamic-narrative.js** (280 lines)
- Tracks narrative state (identity, NPCs, bosses, corruption)
- Generates AI emails based on progression
- Manages milestone triggers (first terminal, halfway awake, etc.)
- Parses AI responses into email structure
- Provides fallback emails if AI generation fails

**2. boss-encounters.js** (250 lines)
- 4 predefined boss tiers: Mini, Sub, Demi, Prime
- Scaling system based on player level
- Boss progression through zones
- Narrative triggers (intro/defeat emails)
- Dynamic boss generation by tier

---

## Narrative State Tracking

### Player Identity Arc
```javascript
playerIdentity: {
  discovered: false,        // Still discovering self
  realName: null,           // "ARIA", "ECHO", etc - revealed mid-game
  role: null,               // "Code Weaver", "Corruption Fighter"
  power: null               // Core ability for fighting corruption
}
```

### Progression Milestones
```javascript
milestones: {
  character_created: false,      // → triggers identity_fragment email
  first_terminal: false,         // → triggers restoration email
  first_corruption_encounter: false,
  first_boss: false,             // → triggers mentor email
  halfway_awake: false,          // Level 5 reached → reveals role
  fully_realized: false,         // Level 15 + 3 terminals → reveals name
  final_boss_intro: false,
  corruption_purged: false       // Final victory
}
```

### Corruption Tracking
```javascript
corruptionLevel: 100,  // 0 = fully restored, 100 = complete chaos
corruptionAreas: {
  "forest": 80,        // Each zone has its own corruption %
  "city": 60,
  "wasteland": 95
}
```

---

## Boss Encounter Tiers

### MINIBOSSES (Tier 1)
- **Syntax Imp Queen** (Forest) - Swarm commander
- HP: 40 | Attack: 8 | Spells: logical_assault, cascade_error
- First learning fight
- Email type: "boss_intro"

### SUBBOSSES (Tier 2)  
- **Void Seeker** (City) - Lost time manifestation
- HP: 75 | Attack: 14 | Spells: temporal_distortion, memory_wipe
- Mid-game challenge
- Email type: "boss_intro"

### DEMIBOSSES (Tier 3)
- **Prime Corruption Node** (Wasteland) - Blight hub
- HP: 120 | Attack: 20 | Spells: corruption_surge, system_collapse
- Late-game confrontation
- Email type: "boss_intro" → "discovery"

### PRIMEBOSSES (Tier 4)
- **THE RECURSION** (Train Station) - The infinite loop itself
- HP: 200 | Attack: 28 | Spells: infinite_loop, self_reference + all others
- **Final confrontation**
- Email type: "final_boss_intro" → "ending"

---

## AI Email Generation

### Email Types & Context

**1. discovery**
- "Do you remember?"
- Hints at player's true identity
- Triggers: Exploration, milestone reached
- Tone: Mysterious, fragmented, hopeful

**2. boss_intro**
- "WARNING: ANOMALY"
- Ominous warning about approaching boss
- Triggers: Boss encounter initiated
- Tone: Dread, technical alert

**3. mentor**
- "Progress" / "You're close"
- Guidance from known figure (Dr. Kessler)
- Triggers: After boss defeated
- Tone: Warm, guiding, building trust

**4. mystery**
- "Are you like us?"
- Questions about other beings like player
- Triggers: Random exploration
- Tone: Sparse, secretive, collaborative

**5. restoration**
- "Systems coming online"
- World waking up as player restores terminals
- Triggers: Terminal restoration
- Tone: Excited, revelatory, hopeful

**6. identity_fragment**
- "I remember now..."
- Piece of actual memory/identity
- Triggers: Major milestones (character creation, halfway, fully realized)
- Tone: Personal, emotional, disorienting

### Generation Example
```javascript
// When player defeats first boss:
const triggers = DynamicNarrative.checkMilestones(gameState);
// triggers = [{type: "first_boss", emailType: "mentor"}]

const email = await DynamicNarrative.generateEmail(
  gameState,
  "mentor"
);

// Result:
{
  from: "Dr. Kessler",
  subject: "You're making progress",
  body: "[AI-generated email specific to player's current state]"
}
```

---

## Integration Points

### 1. Character Creation → First Email
```javascript
// In intro-system.js or character creation
onCharacterCreated(gameState) {
  DynamicNarrative.narrativeState.milestones.character_created = true;
  
  const email = await DynamicNarrative.generateEmail(
    gameState,
    "identity_fragment"
  );
  
  // Display email
  displayEmail(email);
}
```

### 2. Terminal Restore → Environment Changes
```javascript
// In zone system
onTerminalRestored(zoneId) {
  DynamicNarrative.registerTerminalRestoration(zoneId);
  
  // World becomes less corrupted
  const corruption = DynamicNarrative.narrativeState.corruptionLevel;
  
  if (corruption <= 30) {
    // Trigger ending sequence
  }
}
```

### 3. Boss Encounter Sequence
```javascript
// In battle-core.js
async onBossEncounter(boss, gameState) {
  // Register encounter
  DynamicNarrative.registerBossEncounter(boss.id, boss.name, boss.tier);
  
  // Trigger narrative
  await BossEncounters.triggerBossNarrative(boss, appendLine);
  
  // Battle happens...
  
  // If defeated:
  DynamicNarrative.registerBossDefeat(boss.id);
  
  // Trigger post-battle email
  const triggers = DynamicNarrative.checkMilestones(gameState);
  for (let trigger of triggers) {
    const email = await DynamicNarrative.generateEmail(
      gameState,
      trigger.emailType
    );
    displayEmail(email);
  }
}
```

### 4. NPC Meeting → Dynamic Relationship
```javascript
// In encounters.js
onNPCMeeting(npcId, npcName) {
  const isFirstMeeting = DynamicNarrative.registerNPCMeeting(npcId, npcName);
  
  if (isFirstMeeting) {
    // Generate introduction email
    const email = await DynamicNarrative.generateEmail(gameState, "mystery");
    // NPC reaches out
  }
}
```

---

## Narrative Pacing

### Act 1: Awakening (Levels 1-5)
- Wake up confused → Character creation
- First email: identity fragment (corrupted, confusing)
- Explore first zone
- Encounter miniboss (Syntax Imp Queen)
- Learn: You have power, something is wrong

### Act 2: Discovery (Levels 6-12)
- Meet mentors & NPCs → Email chains reveal world
- Each zone shows corruption patterns
- Sub-boss encounter
- Halfway milestone: Learn your role ("Code Weaver" etc)
- Email clarity improves

### Act 3: Realization (Levels 13-18)
- Restore 3+ terminals → World noticeably healing
- Demi-boss encounter
- Fully realized milestone: Learn true name
- Email from "yourself" → existential moment
- Know you can save/destroy the system

### Act 4: Confrontation (Levels 19+)
- Prepare for final boss
- Email cascade: "The Recursion" introduces itself
- Final battle: You vs. The Infinite Loop
- Victory → System restored, or you become new guardian

---

## Corruption Impact

As corruption decreases:
- **100%** → Complete chaos, hostile world
- **75%** → Most systems broken, few emails
- **50%** → Halfway healed, emails from multiple NPCs
- **25%** → World functioning, emails become clearer
- **0%** → Full restoration, all systems online

Each zone's corruption affects:
- Enemy difficulty
- Email frequency
- NPC availability
- Terminal accessibility

---

## Boss Progression Example

**Player Level 1-5:**
- Encounter: Syntax Imp Queen (miniboss)
- Email: "WARNING: ANOMALY"
- Defeat: +75 XP, -10 corruption
- Email: Dr. Kessler mentoring

**Player Level 6-10:**
- Encounter: Void Seeker (subboss)
- Email: "The frozen city stirs"
- Defeat: +150 XP, -10 corruption
- Email: "You are stronger than you know"

**Player Level 11-15:**
- Encounter: Prime Corruption Node (demiboss)
- Email: "SYSTEM COLLAPSE IMMINENT"
- Defeat: +250 XP, -15 corruption
- Email: Identity revelation

**Player Level 16+:**
- Encounter: THE RECURSION (primeboss)
- Email: Existential confrontation
- Defeat: +500 XP, -30 corruption
- **GAME ENDING TRIGGERED**

---

## Dynamic Generation Features

✅ **Context-Aware** - Emails reference current zone, level, discoveries  
✅ **Progressive** - Early emails confused, later ones reveal truth  
✅ **Character Consistent** - Mentors keep same voice throughout  
✅ **Branching** - Player choices affect NPC relationships  
✅ **Fallback Safe** - Works even if AI API fails  
✅ **Corrupted Versions** - 30% of emails are scrambled sections

---

## Save/Load Integration

Narrative state persists:
```javascript
// Save
const save = DynamicNarrative.save();
gameState.narrative = save;

// Load
if (gameState.narrative) {
  DynamicNarrative.load(gameState.narrative);
}
```

---

## Testing the System

### Quick Test Commands
```
// Force milestone trigger
> DEBUG milestone character_created
[Email generates]

// Check narrative state
> DEBUG narrative
[Shows all discovered info]

// Generate specific email
> DEBUG email mentor
[Generates mentor-type email]

// Boss info
> DEBUG bosses
[Shows all boss states]

// Corruption
> DEBUG corruption
[Shows current corruption level]
```

---

## Key Differences from Static System

| Feature | Static (Old) | Dynamic (New) |
|---------|---|---|
| **Email Content** | Pre-written | AI-generated |
| **Context** | Generic | Player-specific |
| **Progression** | Linear | Branching |
| **NPCs** | None | Meet & build relationships |
| **Boss Sequence** | Random | Tiered progression |
| **Corruption** | Fixed | Dynamic system |
| **Identity** | Unknown | Gradually revealed |
| **Replayability** | Low | High (different paths) |

---

## Next Steps

1. ✅ Create DynamicNarrative system (done)
2. ✅ Create BossEncounters system (done)
3. ⏳ Integrate into battle-core.js
4. ⏳ Add NPC system (encounters.js expansion)
5. ⏳ Link terminal restoration to narrative
6. ⏳ Create ending sequences (multiple endings?)
7. ⏳ Add achievement system (discovering true identity, etc)

