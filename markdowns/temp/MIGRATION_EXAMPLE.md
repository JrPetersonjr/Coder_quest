# 📝 MIGRATION EXAMPLE: Step-by-Step

This guide shows how to migrate a real command from the old coupled system to the new modular architecture.

---

## **Example: Battle System Migration**

Let's walk through migrating the full battle system as an example.

### **Step 1: Identify What Needs to Move**

In your old `core.js`, the battle system has:

```javascript
// OLD CODE in core.js:
function cmdBattle(args) { ... }        // ← Entry point
function attack() { ... }               // ← Combat action
function enemyTurn() { ... }            // ← Enemy response
function enemyAttack() { ... }          // ← Damage calculation
function endBattle(victory) { ... }     // ← Cleanup
function handleBattleCommand(cmd, args) { ... }  // ← Battle routing
```

**Dependencies it has:**
- `gameState` (global)
- `appendLine()` (DOM function)
- `DiceSystem` (external)
- `FXSystem.playSound()` (effects)
- `FXSystem.createParticles()` (effects)

---

### **Step 2: Write It in GameEngine (No DOM)**

In `GameEngine.js`, we already have basic battle. Here's the FULL version:

```javascript
// IN GameEngine.js - Add these methods

cmdBattle(args) {
  if (this.gameState.inBattle) {
    this.output("Already in battle!", "error");
    return;
  }

  const enemyName = args.length > 0 ? args[0].toLowerCase() : "syntax-imp";
  const enemy = this.getEnemyData(enemyName);

  if (!enemy) {
    this.output(`Enemy '${enemyName}' not found.`, "error");
    return;
  }

  // Clone enemy so we don't modify original
  this.gameState.inBattle = true;
  this.gameState.currentEnemy = JSON.parse(JSON.stringify(enemy));
  
  this.output(`⚔ A ${enemy.name} appears!`, "battle");
  this.output(`HP: ${enemy.hp}`, "battle");
  this.output("Commands: attack, cast, run, stats", "battle");

  // Callback for sound effects (optional)
  this.onBattleStart?.(enemy);
}

handleBattleCommand(cmd, args) {
  if (!this.gameState.inBattle) {
    this.output("Not in battle!", "error");
    return;
  }

  switch (cmd) {
    case "attack":
      this.attack();
      break;
    case "cast":
      this.cmdCast(args);
      break;
    case "run":
      this.run();
      break;
    case "stats":
      this.cmdStats();
      break;
    default:
      this.output("Battle commands: attack, cast <spell>, run, stats", "system");
  }
}

attack() {
  if (!this.gameState.inBattle) {
    this.output("Not in battle!", "error");
    return;
  }

  const enemy = this.gameState.currentEnemy;
  
  // Damage calculation (using simple formula)
  // Could integrate DiceSystem here if needed
  const atkRoll = Math.floor(Math.random() * 6) + 1;
  const dmg = atkRoll + this.gameState.level;

  enemy.hp -= dmg;
  this.output(`You attack for ${dmg} damage!`, "battle");
  
  // Callback for sound/effects (UI layer can handle)
  this.onPlaySound?.("attack");

  if (enemy.hp <= 0) {
    this.endBattle(true);
  } else {
    // Brief delay before enemy turn
    setTimeout(() => this.enemyTurn(), 500);
  }
}

enemyTurn() {
  if (!this.gameState.inBattle) return;

  const enemy = this.gameState.currentEnemy;
  this.enemyAttack();
}

enemyAttack() {
  const enemy = this.gameState.currentEnemy;
  
  // Simple damage formula
  const dmg = Math.floor(Math.random() * 5) + 2 + (enemy.attack || 3);
  
  this.gameState.hp -= dmg;
  this.output(`${enemy.name} attacks for ${dmg} damage!`, "battle");
  
  this.onPlaySound?.("enemy_attack");

  if (this.gameState.hp <= 0) {
    this.gameState.hp = 0;
    this.output("You were defeated!", "error");
    this.endBattle(false);
    
    // Reset to hub
    this.gameState.hp = this.gameState.maxHp;
    this.gameState.zone = "hub";
    this.gameState.inBattle = false;
  }
}

endBattle(victory) {
  const enemy = this.gameState.currentEnemy;

  if (victory) {
    this.output(`Defeated ${enemy.name}!`, "battle");
    const reward = enemy.exp || 10;
    this.gameState.exp += reward;
    this.output(`Gained ${reward} EXP!`, "highlight");
    
    this.onPlaySound?.("victory");
  } else {
    this.output("Escaped from battle!", "system");
    this.onPlaySound?.("flee");
  }

  this.gameState.inBattle = false;
  this.gameState.currentEnemy = null;
  
  // Notify UI of state change
  this.onStateChange(this.gameState);
}

// Enhanced getEnemyData with more enemies
getEnemyData(enemyId) {
  const enemies = {
    "syntax-imp": {
      id: "syntax-imp",
      name: "Syntax Imp",
      hp: 15,
      attack: 3,
      exp: 10
    },
    "null-wraith": {
      id: "null-wraith",
      name: "Null Wraith",
      hp: 25,
      attack: 5,
      exp: 20
    },
    "debug-daemon": {
      id: "debug-daemon",
      name: "Debug Daemon",
      hp: 30,
      attack: 6,
      exp: 25
    },
    "void-entity": {
      id: "void-entity",
      name: "Void Entity",
      hp: 40,
      attack: 7,
      exp: 35
    }
  };

  return enemies[enemyId] || null;
}
```

---

### **Step 3: Update Command Router**

In `GameEngine.handleCommand()`, update the battle command:

```javascript
handleCommand(rawInput) {
  // ... existing code ...
  
  switch (cmd) {
    // ... other commands ...
    case "battle":
      this.cmdBattle(args);
      break;
    // ... other commands ...
  }

  // IMPORTANT: If in battle, different routing
  if (this.gameState.inBattle) {
    // Instead of letting normal commands run, route to battle handler
    this.handleBattleCommand(cmd, args);
    return;  // ← DON'T process normal commands in battle
  }
}
```

Actually, let's fix this properly - update `handleCommand()` to check battle state EARLY:

```javascript
handleCommand(rawInput) {
  const input = rawInput.trim();
  if (!input) return;

  this.output(`> ${input}`, "command");

  const parts = input.split(" ");
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // ⚠️ BATTLE MODE: Different routing
  if (this.gameState.inBattle) {
    if (["attack", "cast", "run", "stats", "help"].includes(cmd)) {
      this.handleBattleCommand(cmd, args);
      return;
    } else {
      this.output("In battle! Commands: attack, cast, run, stats, help", "error");
      return;
    }
  }

  // Normal mode: route to command handlers
  switch (cmd) {
    case "help":
      this.cmdHelp();
      break;
    case "look":
      this.cmdLook();
      break;
    // ... etc ...
    case "battle":
      this.cmdBattle(args);
      break;
    // ... etc ...
    default:
      this.output("Unknown command. Type 'help'.", "error");
  }

  this.onStateChange(this.gameState);
}
```

---

### **Step 4: Add Sound Callbacks (Optional)**

In `GameUI.js`, add sound effect handling:

```javascript
// In GameUI constructor:
setupEventListeners() {
  // ... existing code ...

  // Setup optional callbacks
  this.engine.onPlaySound = (soundType) => this.handleSound(soundType);
  this.engine.onBattleStart = (enemy) => this.handleBattleStart(enemy);
}

handleSound(soundType) {
  const sounds = {
    "attack": "⚡",
    "enemy_attack": "💥",
    "victory": "✨",
    "flee": "🏃",
    "confirm": "✓"
  };
  
  // You could integrate FXSystem here:
  // if (window.FXSystem) FXSystem.playSound(soundType);
  
  console.log(`[SOUND] ${sounds[soundType] || soundType}`);
}

handleBattleStart(enemy) {
  this.output("--- BATTLE START ---", "battle");
  // Could trigger animations here
}
```

---

### **Step 5: Test It**

1. Open console
2. Type: `battle`
3. You should see enemy appear
4. Type: `attack`
5. Should see your damage
6. Should see enemy counterattack
7. Repeat until enemy dies or you escape

**Expected output:**
```
> battle
⚔ A Syntax Imp appears!
HP: 15
Commands: attack, cast, run, stats

> attack
You attack for 8 damage!
Syntax Imp attacks for 4 damage!

> attack
You attack for 6 damage!
Defeated Syntax Imp!
Gained 10 EXP!
```

---

### **Step 6: Remove from Old Code** (Later!)

ONLY after everything is working and tested:
- Comment out old `cmdBattle()` in core.js
- Comment out old `attack()`, `endBattle()`, etc.
- Keep them as reference for a few weeks
- Eventually delete

---

## **Pattern You Just Learned**

This is the pattern for migrating ANY command:

1. **Identify** - List all the code that needs to move
2. **Write** - Put it in GameEngine (no DOM calls!)
3. **Test** - Make sure it works in browser
4. **Route** - Update handleCommand() to use new version
5. **Enhance** - Add callbacks for side effects (sounds, particles, etc.)
6. **Verify** - Test all edge cases
7. **Remove** - Delete old code once confident

---

## **Commands Ready to Migrate Next**

In order of difficulty (easiest first):

1. ✅ **Battle system** - You just did this!
2. `cmdDefine()` - Simple state change
3. `cmdInspect()` - Simple lookup
4. `cmdStats()` - Display stat
5. `cmdGo()` - Zone navigation
6. `cmdCast()` - Spell casting (more complex)
7. `cmdTerminal()` - Terminal mini-games (complex)
8. Encounter system - Full encounter logic

---

## **Estimated Timeline**

- **1 command/day** = 2 weeks for all basic commands
- **Complex commands** (encounters, terminals) = 3-4 days each
- **Total refactor** = 3-4 weeks for full system

Or take it slower, 1-2 commands per week = 2-3 months for complete migration.

---

## **You Now Know**

✅ How to identify code to migrate
✅ How to write it without DOM dependencies
✅ How to route through the new system
✅ How to handle side effects via callbacks
✅ How to test each piece independently

**Ready to migrate your next command?** Pick one and we'll walk through it! 🚀
