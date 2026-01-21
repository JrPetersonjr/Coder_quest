# 🔄 ARCHITECTURE FLOW DIAGRAMS

Visual guides to understand how the three layers work together.

---

## **1. Command Flow Diagram**

```
USER INPUT
    ↓
    └─ Types: "battle syntax-imp"
    ↓
HTML INPUT ELEMENT
    ↓
    └─ User presses Enter key
    ↓
GameUI.handleSend()
    ├─ Get input: "battle syntax-imp"
    ├─ Clear input field
    ├─ Call: engine.handleCommand("battle syntax-imp")
    ↓
GameEngine.handleCommand()
    ├─ Parse: cmd = "battle", args = ["syntax-imp"]
    ├─ Check game state
    ├─ Call: this.cmdBattle(["syntax-imp"])
    ↓
GameEngine.cmdBattle()
    ├─ Validate arguments
    ├─ Get enemy data
    ├─ Update this.gameState
    ├─ Call: this.output("⚔ A Syntax Imp appears!", "battle")
    ↓
GameEngine.output() [CALLBACK 1]
    ├─ Package data: {text, type, timestamp}
    ├─ Call: this.onOutput({...})
    ↓
GameUI.handleEngineOutput()
    ├─ Create <div> element
    ├─ Add CSS class
    ├─ Set text content
    ├─ Append to #output
    ↓
RENDERED TEXT
    └─ User sees: "⚔ A Syntax Imp appears!" in green text
```

---

## **2. State Change Notification**

```
Game Logic Changes State
    ↓
    └─ Example: gameState.hp = 45 (took damage)
    ↓
Engine calls: this.onStateChange(this.gameState)
    ↓
GameUI.handleStateChange()
    ├─ Call: this.updateStats()
    ├─ Call: this.updateRoom()
    ├─ Call: this.updateDefinitions()
    ↓
HTML Display Updates
    ├─ Stats div shows new HP
    ├─ Room name updates
    ├─ Definitions list updates
    ↓
USER SEES UPDATED DISPLAY
```

---

## **3. Architecture Layers**

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER DOM                           │
│  - HTML elements: <div id="output">, <input id="input">    │
│  - CSS styling: .line, .battle, etc                         │
│  - Event listeners: click, keydown                           │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────▼─────────┐
         │                 │
┌────────┴─────────────────▼────────┐
│         GAMEUI.JS (UI LAYER)       │
│                                    │
│ - Manages DOM elements             │
│ - Listens to engine callbacks      │
│ - Renders output                   │
│ - Updates display                  │
│ - Handles user input               │
│                                    │
│ Methods:                           │
│ • handleSend()                     │
│ • handleEngineOutput()             │
│ • handleStateChange()              │
│ • updateStats()                    │
│ • updateDefinitions()              │
└────────────────┬────────────────────┘
                 │
         ┌───────▼─────────┐
         │ Callbacks       │
         │ onOutput()      │
         │ onStateChange() │
         └───────┬─────────┘
                 │
┌────────────────▼────────────────────┐
│     GAMEENGINE.JS (LOGIC LAYER)     │
│                                     │
│ - Manages game state                │
│ - Parses commands                   │
│ - Executes logic                    │
│ - NO DOM ACCESS                     │
│ - NO UI DEPENDENCIES                │
│                                     │
│ Properties:                         │
│ • gameState = {...}                 │
│ • onOutput (callback)               │
│ • onStateChange (callback)          │
│                                     │
│ Methods:                            │
│ • handleCommand(input)              │
│ • cmdBattle(args)                   │
│ • cmdDefine(args)                   │
│ • attack()                          │
│ • output(text, type)                │
│ • getEnemyData(enemyId)             │
│ • getZoneData(zoneId)               │
└────────────────────────────────────┘
```

---

## **4. Data Flow: What Gets Passed**

### **User Input → Engine**
```
GameUI.input.value = "define foo bar"
    ↓
GameUI.handleSend()
    ↓
engine.handleCommand("define foo bar")
    ↓ (string is passed)
GameEngine receives: "define foo bar"
```

### **Engine Output → UI**
```
GameEngine.output("Defined: foo = bar", "highlight")
    ↓
this.onOutput() callback
    ↓ (object is passed)
{
  text: "Defined: foo = bar",
  type: "highlight",
  timestamp: 1705...
}
    ↓
GameUI.handleEngineOutput()
    ↓
Renders to DOM
```

### **State Change Notification**
```
GameEngine updates: this.gameState.hp = 45
    ↓
this.onStateChange() callback
    ↓ (entire state object is passed)
{
  zone: "hub",
  hp: 45,
  maxHp: 50,
  level: 1,
  exp: 25,
  ...
}
    ↓
GameUI.handleStateChange()
    ↓
Extracts only what it needs
    ↓
Updates display
```

---

## **5. Command Execution Sequence**

```
STEP 1: User Types
┌──────────────────┐
│ help             │
│ battle syntax-imp│  ← User types a command
│ define foo bar   │
└──────────────────┘

STEP 2: UI Captures Input
┌────────────────────────────┐
│ <input> fires 'Enter' key  │
│ GameUI.handleSend() called │
└────────────────────────────┘

STEP 3: Input Goes to Engine
┌────────────────────────────────┐
│ engine.handleCommand(rawInput) │
│   - Trims whitespace           │
│   - Echoes to output           │
│   - Parses command & args      │
│   - Routes to handler          │
└────────────────────────────────┘

STEP 4: Command Executes
┌──────────────────────────────┐
│ switch(cmd) {               │
│   case "battle":            │
│     → cmdBattle(args)       │
│   case "define":            │
│     → cmdDefine(args)       │
│ }                            │
└──────────────────────────────┘

STEP 5: Logic Executes
┌────────────────────────────────┐
│ GameEngine.cmdBattle() {       │
│   - Validate input             │
│   - Get enemy data             │
│   - Update gameState           │
│   - output("⚔ Enemy appears")  │
│ }                              │
└────────────────────────────────┘

STEP 6: Output Callback Fires
┌──────────────────────────────┐
│ onOutput({                   │
│   text: "⚔ Enemy appears",  │
│   type: "battle"             │
│ })                           │
└──────────────────────────────┘

STEP 7: UI Renders
┌─────────────────────────┐
│ <div class="line battle">│
│   ⚔ Enemy appears       │
│ </div>                  │
│                         │
│ Appended to #output     │
└─────────────────────────┘

STEP 8: User Sees Result
┌──────────────────────────────┐
│ [Green text on black screen] │
│                              │
│ > battle                     │
│ ⚔ Enemy appears             │
│ HP: 15                       │
│ Commands: attack, run, stats │
│                              │
│ >_                           │
└──────────────────────────────┘
```

---

## **6. Battle System Flow (Real Example)**

```
User: "battle syntax-imp"
    ↓
Engine: cmdBattle() starts
    ├─ Check: !inBattle? ✓
    ├─ Get enemy: getEnemyData("syntax-imp")
    ├─ Clone enemy data (so we don't modify original)
    ├─ Set: gameState.inBattle = true
    ├─ Set: gameState.currentEnemy = {...cloned enemy...}
    ├─ Output: "⚔ A Syntax Imp appears!"
    └─ Output: "HP: 15"
    ↓
User: "attack"
    ↓
Engine: handleCommand() sees inBattle=true
    ├─ Routes to: handleBattleCommand("attack")
    └─ (NOT normal command routing!)
    ↓
Engine: attack()
    ├─ Get current enemy
    ├─ Calculate damage: 1d6 + level
    ├─ Reduce enemy HP
    ├─ Output: "You attack for 8 damage!"
    ├─ Check: enemy.hp <= 0? No...
    └─ Schedule: enemyTurn() after 500ms
    ↓
Engine: enemyTurn() [500ms later]
    ├─ Enemy attacks player
    ├─ Calculate damage: 1d5 + attack
    ├─ Reduce player HP
    ├─ Output: "Syntax Imp attacks for 3 damage!"
    ├─ Check: player.hp <= 0? No...
    └─ Wait for next player input
    ↓
User: "attack"
    ↓
Engine: attack()
    ├─ Calculate damage: 1d6 + level
    ├─ Reduce enemy HP
    ├─ Output: "You attack for 7 damage!"
    ├─ Check: enemy.hp <= 0? YES!
    ├─ Call: endBattle(true)
    │   ├─ Set: inBattle = false
    │   ├─ Set: currentEnemy = null
    │   ├─ Add exp: gameState.exp += 10
    │   ├─ Output: "Defeated Syntax Imp!"
    │   ├─ Output: "Gained 10 EXP!"
    │   └─ Fire: onStateChange()
    └─ Back to normal command mode
    ↓
User: "stats"
    ↓
Engine: handleCommand() sees inBattle=false
    ├─ Routes to: cmdStats()
    ├─ Output: "HP: 47/50"
    ├─ Output: "EXP: 35/100"
    └─ Command runs normally
```

---

## **7. How Callbacks Keep Things Decoupled**

### **Without Callbacks (Tight Coupling) ❌**
```javascript
GameEngine (engine.js):
function attack() {
  enemy.hp -= dmg;
  FXSystem.playSound("attack");  // ← Engine knows about FX system!
  updateUI();                     // ← Engine knows about UI!
  document.getElementById(...);   // ← Engine knows about DOM!
}

Problem: Can't use engine anywhere except web browser!
```

### **With Callbacks (Loose Coupling) ✅**
```javascript
GameEngine:
constructor(options) {
  this.onPlaySound = options.onPlaySound || (() => {});
}

attack() {
  enemy.hp -= dmg;
  this.onPlaySound("attack");  // ← Notify whoever is listening
}

// Browser uses it:
const engine = new GameEngine({
  onPlaySound: (sound) => FXSystem.playSound(sound)
});

// Server uses it:
const engine = new GameEngine({
  onPlaySound: (sound) => broadcast({event: "sound", type: sound})
});

// CLI uses it:
const engine = new GameEngine({
  onPlaySound: () => {}  // Do nothing
});

Same engine, different behavior, no coupling!
```

---

## **8. State Update Cycle**

```
Initial State:
{
  hp: 50,
  inBattle: false,
  ...
}

User Action:
"battle syntax-imp"
    ↓
State Changes:
{
  hp: 50,
  inBattle: true,  ← Changed!
  currentEnemy: {...}  ← Changed!
  ...
}
    ↓
Engine fires: onStateChange(newState)
    ↓
UI responds: handleStateChange(newState)
    ├─ updateStats()
    ├─ updateDisplay()
    ├─ updateDefinitions()
    ↓
HTML Updates:
- Stats div refreshes
- Buttons might appear/disappear
- Display reflects new state
```

---

## **9. Error Handling Flow**

```
Invalid Input: "battle nonexistent-enemy"
    ↓
GameEngine.cmdBattle():
    ├─ getEnemyData("nonexistent-enemy")
    ├─ Returns: null
    ├─ Check: if (!enemy)
    ├─ Output: "Enemy 'nonexistent-enemy' not found.", "error"
    └─ Return (exit function)
    ↓
OnOutput callback:
    ├─ {text: "Enemy not found...", type: "error"}
    ↓
GameUI.handleEngineOutput():
    ├─ Create: <div class="line error">
    ├─ Content: "Enemy 'nonexistent-enemy' not found."
    ├─ CSS applies red color (#ff6e6e)
    ↓
User sees: Red error message
Game state: Unchanged (no battle started)
```

---

## **Quick Reference**

### **What Goes Where**

| What | Where | Example |
|------|-------|---------|
| Game state | `GameEngine.gameState` | `{hp: 50, inBattle: false}` |
| Game logic | `GameEngine.cmdXXX()` | `cmdBattle()`, `attack()` |
| DOM refs | `GameUI` only | `document.getElementById()` |
| Callbacks | `GameEngine.onXXX` | `onOutput`, `onStateChange` |
| Rendering | `GameUI` only | Creating divs, styling |
| Input parsing | `GameEngine` | `handleCommand()` |
| Event listeners | `GameUI` | Click, keydown handlers |

### **When Something Changes**

1. **User action** → UI catches it
2. **Command sent** → Engine processes it
3. **State changes** → Engine triggers callback
4. **UI responds** → Display updates
5. **User sees** → Result on screen

### **To Add a New Feature**

1. Add logic to `GameEngine.cmdNewFeature()`
2. Call `this.output()` when needed
3. Call `this.onStateChange()` when state changes
4. `GameUI` automatically responds to callbacks
5. Done!

---

You now have a complete mental model of how the system works! 🎮
