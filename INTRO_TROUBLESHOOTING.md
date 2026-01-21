# Intro Sequence Troubleshooting Guide

## The Problem

You're not seeing the **CASTCONSOLE awakening sequence** where you create your character. Here's why:

### Issue 1: File Protocol Limitations
When opening `index.html` directly (double-clicking it), the browser uses `file://` protocol which:
- **Blocks localStorage** - Auto-save can't work
- **May have stale data** - Browser thinks intro is complete
- **CORS issues** - Some features won't load

### Issue 2: Character Class Information
The Character class structure IS in the code:
- **Location**: `integration-bootstrap.js` lines 98-107
- **Properties**: name, level, experience, hp, maxHp, mp, maxMp, equipment

```javascript
gameEngine.gameState.character = {
  name: "Player",
  level: gameEngine.gameState.level,
  experience: gameEngine.gameState.exp,
  hp: gameEngine.gameState.hp,
  maxHp: gameEngine.gameState.maxHp,
  mp: gameEngine.gameState.mp,
  maxMp: gameEngine.gameState.maxMp,
  equipment: {
    surveyenceSystem: { efficiency: 1.0 }
  }
};
```

## The Solution

### Option 1: Run a Local Server (RECOMMENDED)

Open PowerShell in your game folder and run:

```powershell
# Navigate to game folder
cd "h:\AIRLOCK\Choose Your Own Code\LIVE\Quest_For_The_Code_LIVE"

# Start Python HTTP server (if you have Python)
python -m http.server 8000

# OR use Node.js http-server (if you have Node)
npx http-server -p 8000

# OR use PHP built-in server (if you have PHP)
php -S localhost:8000
```

Then open in browser: **http://localhost:8000**

### Option 2: Clear Browser Storage

If you've opened the file before, localStorage might have saved `introComplete: true`.

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Click **Local Storage** → `file://`
4. Find keys starting with `TECHNOMANCER_`
5. Right-click → **Delete**
6. Refresh page (`Ctrl+R`)

**Firefox:**
1. Press `F12` to open DevTools
2. Go to **Storage** tab
3. Click **Local Storage** → `file://`
4. Find keys starting with `TECHNOMANCER_`
5. Right-click → **Delete All**
6. Refresh page (`Ctrl+R`)

### Option 3: Force Intro to Run

I can add a URL parameter to force intro restart. Open:

```
file:///h:/AIRLOCK/Choose%20Your%20Own%20Code/LIVE/Quest_For_The_Code_LIVE/index.html?forceIntro=true
```

(I'll implement this now)

## How the Intro SHOULD Work

When working correctly, you'll see:

### Phase 1: ASCII Animation (8 seconds)
```
┌─────────────────────────────────┐
│ [ SIGNAL DETECTED ]              │
│ [ CONSCIOUSNESS FRAGMENT ... ]   │
│ [ RECONSTRUCTING ... ]           │
│ [ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ ] │
└─────────────────────────────────┘
```

### Phase 2: CASTCONSOLE Awakens You
```
███ ANCIENT TERMINAL ███: [LEGACY SYSTEMS BOOTING]
███ ANCIENT TERMINAL ███: [SCANNING... CONSCIOUSNESS DETECTED]
███ ANCIENT TERMINAL ███: [Memory banks corrupted... fragmentary]
███ ANCIENT TERMINAL ███: [System designation: CASTCONSOLE]
███ ANCIENT TERMINAL ███: [Let us begin with your name, wanderer.]
```

### Phase 3: Character Creation
1. **Name**: "What name echoes in your core memory?"
2. **Pronouns**: "Your self-reference parameters?"
3. **Class**: Choose from:
   - **TECHNOMANCER** - Master of spells and code (Spell Power +20%, Code Affinity +30%, 40 HP)
   - **CRYPTID** - Mysterious shadow operator (Stealth +30%, Hack +20%, 45 HP)
   - **ARCHITECT** - Network designer (Engineering +30%, Repair +20%, 50 HP)

### Phase 4: Tutorial Quest
```
[ TUTORIAL QUEST UNLOCKED: 'First Steps' ]
Type /help to see available commands.
Type /tutorial to begin your training.
```

## Character Class Details

### Full Class Definitions (from intro-system.js)

```javascript
classDescriptions: {
  technomancer: {
    name: "TECHNOMANCER",
    description: "Master of spells and code. Harness the quantum nature of reality.",
    bonuses: { 
      spellPower: 1.2,    // +20% spell damage
      codeAffinity: 1.3,  // +30% code effectiveness
      hp: 40 
    }
  },
  cryptid: {
    name: "CRYPTID",
    description: "Mysterious. Unpredictable. Operate in the shadows of systems.",
    bonuses: { 
      stealth: 1.3,       // +30% stealth effectiveness
      hack: 1.2,          // +20% hacking success
      hp: 45 
    }
  },
  architect: {
    name: "ARCHITECT",
    description: "Designer of networks. Build and repair the infrastructure.",
    bonuses: { 
      engineering: 1.3,   // +30% build speed
      repair: 1.2,        // +20% repair efficiency
      hp: 50 
    }
  }
}
```

## Verifying the Intro System

Check browser console (F12) for these messages:

```
[IntroSystem] Starting intro sequence...
[IntroSystem] Playing intro animation...
[IntroSystem] Starting character creation...
[IntroSystem] Step 1: Prompting for name
[IntroSystem] Name received: [YourName]
[IntroSystem] Step 2: Prompting for pronouns
[IntroSystem] Step 3: Prompting for class choice
[IntroSystem] Intro sequence complete
```

If you see:
```
[Boot] Intro already completed
```

Then localStorage has `introComplete: true` - clear it using Option 2 above.

## Files Involved

### Intro System
- `intro-system.js` (597 lines) - Main intro sequence, ASCII art, character creation
- `integration-bootstrap.js` (167 lines) - Character class initialization
- `index.html` (1422 lines) - Calls `IntroSystem.run()` on line 1351

### Character Status
- `character-status-panel.js` (243 lines) - Real-time HP/MANA/DATA display
- `GameEngine.js` (892 lines) - Core game state management

## Expected File Structure

Your character object after intro should have:

```javascript
gameEngine.gameState.character = {
  name: "YourChosenName",           // From Step 1
  pronouns: "they/them",            // From Step 2
  class: "technomancer",            // From Step 3 (technomancer/cryptid/architect)
  level: 1,
  experience: 0,
  hp: 40,                           // Varies by class
  maxHp: 40,
  mp: 50,
  maxMp: 50,
  equipment: {
    surveyenceSystem: { efficiency: 1.0 }
  }
}
```

## Next Steps

1. **Try a local server** (Option 1) - This is the proper way to run the game
2. **If that doesn't work**, clear localStorage (Option 2)
3. **Check console** for error messages (F12)
4. **Force intro** using URL parameter (I'll add this now)

Once the intro runs successfully, you'll be able to:
- Use your chosen name in dialogue
- Have class-specific bonuses
- See your character stats in the Character Status Panel
- Progress through the tutorial quest
