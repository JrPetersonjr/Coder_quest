# Quick Fix: Intro Sequence Not Running

## ❌ Problem
The CASTCONSOLE awakening sequence isn't appearing when you load the game.

## ✅ Solutions (Try in Order)

### Solution 1: Run on Local Server (BEST)

**Windows PowerShell:**
```powershell
cd "h:\AIRLOCK\Choose Your Own Code\LIVE\Quest_For_The_Code_LIVE"
python -m http.server 8000
```

Then open: **http://localhost:8000**

---

### Solution 2: Force Intro with URL Parameter

Add `?forceIntro=true` to the URL:

**File protocol:**
```
file:///h:/AIRLOCK/Choose%20Your%20Own%20Code/LIVE/Quest_For_The_Code_LIVE/index.html?forceIntro=true
```

**Local server:**
```
http://localhost:8000/index.html?forceIntro=true
```

---

### Solution 3: Clear Browser Storage

**Press F12 → Application/Storage tab**

Find and delete all keys starting with: `TECHNOMANCER_`

Then refresh the page.

---

### Solution 4: Use Debug Commands

Once the game loads, type:

```
debug character
```

This shows your current character info.

To reset intro:
```
debug intro
```

Then refresh the page.

---

## 🎮 What the Intro Should Look Like

### 1. ASCII Animation
```
┌─────────────────────────────────┐
│ [ SIGNAL DETECTED ]              │
│ [ CONSCIOUSNESS FRAGMENT ... ]   │
│ [ RECONSTRUCTING ... ]           │
│ [ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ ] │
└─────────────────────────────────┘
```

### 2. CASTCONSOLE Speaks
```
███ ANCIENT TERMINAL ███: [LEGACY SYSTEMS BOOTING]
███ ANCIENT TERMINAL ███: [SCANNING... CONSCIOUSNESS DETECTED]
███ ANCIENT TERMINAL ███: [System designation: CASTCONSOLE]
███ ANCIENT TERMINAL ███: [Let us begin with your name, wanderer.]
```

### 3. Character Creation Questions

**Question 1: Name**
```
[CASTCONSOLE] What name echoes in your core memory?
> [Type your name and press Enter]
```

**Question 2: Pronouns**
```
[CASTCONSOLE] Your self-reference parameters? (they/them, he/him, she/her, etc)
> [Type pronouns and press Enter]
```

**Question 3: Class**
```
[CASTCONSOLE] Which path calls to you?

1. TECHNOMANCER
   Master of spells and code. Harness the quantum nature of reality.
   Bonuses: Spell Power +20%, Code Affinity +30%, 40 HP

2. CRYPTID
   Mysterious. Unpredictable. Operate in the shadows of systems.
   Bonuses: Stealth +30%, Hack +20%, 45 HP

3. ARCHITECT
   Designer of networks. Build and repair the infrastructure.
   Bonuses: Engineering +30%, Repair +20%, 50 HP

> [Type 1, 2, or 3]
```

---

## 📊 Character Class Info (Found!)

Your Character class is defined in `integration-bootstrap.js` line 98:

```javascript
gameEngine.gameState.character = {
  name: "Player",              // Set during intro
  class: "technomancer",       // Set during intro
  pronouns: "they/them",       // Set during intro
  level: 1,
  experience: 0,
  hp: 40,
  maxHp: 40,
  mp: 50,
  maxMp: 50,
  equipment: {
    surveyenceSystem: { efficiency: 1.0 }
  }
}
```

### Class Definitions

Full class data is in `intro-system.js` lines 180-200:

**TECHNOMANCER**
- Spell Power: 1.2× (20% bonus)
- Code Affinity: 1.3× (30% bonus)
- Starting HP: 40

**CRYPTID**
- Stealth: 1.3× (30% bonus)
- Hack: 1.2× (20% bonus)
- Starting HP: 45

**ARCHITECT**
- Engineering: 1.3× (30% bonus)
- Repair: 1.2× (20% bonus)
- Starting HP: 50

---

## 🔍 Checking Console Logs

Press **F12** and look for these messages:

### If Intro Runs:
```
[IntroSystem] Starting intro sequence...
[IntroSystem] Playing intro animation...
[IntroSystem] Starting character creation...
[IntroSystem] Name received: YourName
[IntroSystem] Intro sequence complete
```

### If Intro is Skipped:
```
[Boot] Intro already completed, skipping
```

If you see "already completed", use Solution 2, 3, or 4 above.

---

## 🚀 Testing After Fix

Once intro runs successfully:

1. Type `debug character` to see your stats
2. Type `help` to see all commands
3. Type `quests` to see tutorial quest
4. Type `look` to start playing

---

## Need More Help?

See **INTRO_TROUBLESHOOTING.md** for detailed explanations.

Your intro system IS working - it's just being blocked by:
- localStorage saving `introComplete: true` 
- OR file:// protocol restrictions

Use one of the 4 solutions above! 🎮
