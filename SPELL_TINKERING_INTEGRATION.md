# SPELL TINKERING SYSTEM - Integration Guide
**Version 1.0** | Spell crafting with level scaling, data economy, quantum Technonomicon

---

## SYSTEM OVERVIEW

**Spell Tinkering** is a **hybrid sandbox + linear progression system** where:
- Players combine **elements** (core + esoteric) with **code bits** (heal, damage, drain, etc)
- **Data** is the ONLY crafting resource (no recipes given)
- **Level scaling** makes god rolls feel like massive accomplishments
- **EPIC spells** require perfect rolls + specific combinations
- **Technonomicon** is quantum: has linear path + sandbox variations (observer effect)
- **Library updates** tier-gated by data cost + RNG triggers (miniboss → AI bonus spell)
- **Data collected** from enemies (surveillance), environment (items), terminals (rare tools)

### Core Philosophy
> "Data has become the resource. Every sensor, every scan, every piece of information is currency. The Technonomicon is a living grimoire that evolves based on what you observe."

---

## QUICK START INTEGRATION

### 1. Load the System

```javascript
// In GameEngine.js initialization:
const spellTinkering = new SpellTinkeringSystem(gameState, diceSystem, aiDMIntegration);
gameState.spellTinkering = spellTinkering;
```

### 2. Hook into Combat

```javascript
// When player deals damage:
const spellResult = gameState.spellTinkering.attemptCraft(
  ['fire'],           // elements
  ['damage'],         // code bits
  gameState.player
);

if (spellResult.success) {
  const damageDealt = spellResult.power;
  enemy.hp -= damageDealt;
}
```

### 3. Hook into Enemy Defeats

```javascript
// When enemy is defeated:
if (gameState.spellTinkering.dataInventory.surveyenceSystemActive) {
  const dataHarvested = gameState.spellTinkering.harvestEnemyData(
    enemy,
    gameState.player
  );
}
```

### 4. Hook into Environment Collection

```javascript
// When player finds an item in zone:
gameState.spellTinkering.collectEnvironmentItem('heatSensor');
// This increases thermal data collection efficiency
```

---

## USAGE PATTERNS

### Pattern 1: Basic Spell Casting

**Scenario**: Player learns fire + damage = fireball, attempts to cast

```javascript
const result = spellTinkering.attemptCraft(['fire'], ['damage'], player);

if (result.success) {
  console.log(`Cast ${result.spell.name}!`);
  console.log(`Power: ${result.power}`);
  console.log(`Mana: ${result.manaCost}`);
  console.log(`Data Cost: ${result.dataCost}`);
  
  // Apply spell effect
  player.mana -= result.manaCost;
  spellTinkering.dataInventory.totalData -= result.dataCost;
} else {
  console.log(`Craft failed: ${result.message}`);
}
```

### Pattern 2: God Roll Discovery

**Scenario**: Player tries unknown combination, gets critical (20) roll

```javascript
const result = spellTinkering.attemptCraft(['chaos', 'fire'], ['damage', 'drain'], player);

if (result.success && result.rollQuality === 'critical') {
  console.log(`🌟 NEW SPELL DISCOVERED: ${result.spell.name}`);
  console.log(`Added to Technonomicon permanently!`);
  
  if (result.spell.epicVariant) {
    console.log(`⭐ EPIC SPELL - Rare drop!`);
    // Trigger celebration animation
  }
}
```

### Pattern 3: Data Farming Loop

**Scenario**: Player needs 500 data to unlock library update

```javascript
// Activate surveillance (from ancient terminal)
spellTinkering.activateSurveillanceSystem();

// Combat loop:
for (let enemy of encounterEnemies) {
  // Fight enemy...
  if (enemy.defeated) {
    const dataGain = spellTinkering.harvestEnemyData(enemy, player);
    console.log(`Data: ${spellTinkering.dataInventory.totalData}/${dataCostThreshold}`);
  }
}

// Craft spells (consumes data)
const craftResult = spellTinkering.attemptCraft(elements, codeBits, player);
// Data spent, added to total_crafts counter
```

### Pattern 4: Library Update Trigger

**Scenario**: Player reaches crafting milestone, library evolves

```javascript
// After 5th successful craft, checkLibraryUpdate() auto-called
// If data invested > (version * 500), roll for update

// Good roll (13-18) unlocks multiple features:
console.log(`New elements unlocked:`, Array.from(spellTinkering.technonomicon.discoveredElements));
console.log(`New code bits unlocked:`, Array.from(spellTinkering.technonomicon.discoveredCodeBits));

// Supreme roll (20) triggers miniboss:
const miniboss = spellTinkering.triggerLibraryMiniboss();
// After defeat:
const bonusSpell = spellTinkering.generateAIBonusSpell('aggressive', ['fire', 'chaos']);
// AI generated spell tailored to player's playstyle!
```

### Pattern 5: Experimental Sandbox

**Scenario**: Player combines 3 elements + 2 code bits they've never tried

```javascript
// Unknown combination = experimental spell
const result = spellTinkering.attemptCraft(
  ['liminality', 'obsession', 'atoms'],
  ['transmute', 'steal'],
  player
);

if (result.success && result.rollQuality !== 'critical') {
  console.log(`Experimental spell: ${result.spell.name}`);
  console.log(`This spell works, but is not yet permanent.`);
  console.log(`Find the exact combination again + god roll to add to Technonomicon.`);
} else if (result.rollQuality === 'critical') {
  console.log(`🌟 EXPERIMENTAL SPELL BECOMES PERMANENT!`);
  console.log(`${result.spell.name} added to Technonomicon.`);
}
```

### Pattern 6: Level Scaling Impact

**Scenario**: Same spell cast at level 5 vs level 20

```javascript
// Level 5 character, high roll
const low_result = spellTinkering.attemptCraft(['fire'], ['damage'], level5Char);
console.log(`Power: ${low_result.power}`); // ~25

// Level 20 character, same high roll
const high_result = spellTinkering.attemptCraft(['fire'], ['damage'], level20Char);
console.log(`Power: ${high_result.power}`); // ~60

// But god roll at level 5 is STILL special
const god_roll_5 = spellTinkering.calculateSpellPower(spell, level5Char, 'critical');
console.log(`Power: ${god_roll_5}`); // ~50 - feels huge at low level!
```

### Pattern 7: Environment Item Collection

**Scenario**: Player collects 5 heat sensors, then fights enemies

```javascript
// Collect items over time
spellTinkering.collectEnvironmentItem('heatSensor');     // x1
spellTinkering.collectEnvironmentItem('heatSensor');     // x2
spellTinkering.collectEnvironmentItem('irScanner');      // x1

// When harvesting from enemy:
const multiplier = spellTinkering.getDataCollectionMultiplier(player);
// With items: 1.0 + (0.05 * 2 heat) + (0.08 * 1 ir) = 1.18x
// So 100 base data becomes 118 data!

const harvested = spellTinkering.harvestEnemyData(enemy, player);
// Gets boosted by item multiplier automatically
```

### Pattern 8: Technonomicon Export/Import (Save System)

**Scenario**: Save player's spell progress, load into new session

```javascript
// SAVE:
const saveData = {
  technonomicon: spellTinkering.exportTechnonomicon(),
  dataInventory: spellTinkering.exportDataInventory(),
};
localStorage.setItem('player_spells', JSON.stringify(saveData));

// LOAD:
const saveData = JSON.parse(localStorage.getItem('player_spells'));
spellTinkering.technonomicon.discoveredSpells = new Map(saveData.technonomicon.discoveredSpells);
spellTinkering.technonomicon.discoveredElements = new Set(saveData.technonomicon.discoveredElements);
spellTinkering.technonomicon.discoveredCodeBits = new Set(saveData.technonomicon.discoveredCodeBits);
spellTinkering.dataInventory = saveData.dataInventory;
```

---

## ELEMENT SYSTEM

### Core Elements (Tier 1 - Always Available)
- `earth` - defensive, stability
- `fire` - aggressive, damage
- `wind` - speed, quick effects
- `water` - healing, restoration
- `heart` - emotion, connection

### Esoteric Elements (Tier 2-4 - Discovered via Library)
- `chaos` (Tier 2) - unpredictability, wild effects
- `entropy` (Tier 2) - degradation, time effects
- `obsession` (Tier 2) - focus, multiplied effects
- `limerance` (Tier 2) - attraction, charm effects
- `liminality` (Tier 3) - boundaries, reality bending
- `plasma` (Tier 3) - extreme effects, high damage
- `atoms` (Tier 3) - microscopic, precision effects
- `philosophersStone` (Tier 4) - ultimate transmutation, rarest

### Element Properties
```javascript
{
  tier: 1-4,              // progression tier
  dataWeight: 1-5,        // affects data cost when combined
  color: '#XXXXXX',       // UI display color
}
```

---

## CODE BITS SYSTEM

Code bits are the *functions* that spells can perform:

| Bit | Tier | Base Mana | Data Req | Purpose |
|-----|------|-----------|----------|---------|
| `heal` | 1 | 20 | 50 | Restore HP |
| `damage` | 1 | 15 | 50 | Deal damage |
| `shield` | 1 | 20 | 75 | Absorb damage |
| `drain` | 2 | 25 | 100 | Drain enemy HP |
| `delete` | 2 | 35 | 150 | Remove status/buff |
| `steal` | 3 | 40 | 200 | Take enemy resource |
| `summon` | 3 | 50 | 250 | Summon ally |
| `transmute` | 4 | 60 | 300 | Change matter/state |

### Combining Code Bits
```javascript
// Single bit: basic spell
['fire'] + ['damage'] = Fireball (15 mana, 50 data)

// Two bits: combo spell
['chaos'] + ['damage', 'drain'] = ChaosDrain (40 mana, 150 data)

// Three+ bits: EPIC spell (requires god roll)
['liminality'] + ['transmute', 'steal', 'delete'] = Reality Splice (80+ mana, 400+ data)
```

---

## DATA ECONOMY

### Data Sources

| Source | Rate | Notes |
|--------|------|-------|
| **Enemy Surveillance** | level × 10 | Passive, needs surveillance system |
| **Heat Sensor** | +5% collection | Environmental item |
| **Moisture Sensor** | +5% collection | Environmental item |
| **IR Scanner** | +8% collection | Environmental item |
| **Density Tester** | +6% collection | Environmental item |
| **Microscopic Sampler** | +10% collection | Environmental item |
| **Character Level** | +0.1% per level | Mastery bonus |

### Data Sinks

| Activity | Cost | Notes |
|----------|------|-------|
| **Basic Spell Craft** | 50-100 | Tier 1 spells |
| **Combo Spell** | 150-250 | Tier 2-3 combinations |
| **EPIC Spell** | 300-500 | Tier 3-4, rare drops |
| **Library Update** | version × 500 | Trigger evolution |

### Data Economy Loop

```
Combat Loop:
  Enemy Defeated
    ↓
  Surveillance System Harvests (100-200 data)
    ↓
  Player Collects Environmental Items
    ↓
  Next Combat: Better Collection Rate (items boost %)
    ↓
  When Data ≥ Spell Cost: Player Crafts
    ↓
  Craft Counter ++ (every 5th triggers library check)
    ↓
  Library needs Data Investment: triggers update
```

---

## LEVEL SCALING

### Spell Power Scaling

```
Base Power = spell.baseMana
Level Bonus = character.level × 1.5
Roll Multiplier = varies (0.6 to 2.0)

Total Power = (Base + Level Bonus) × Roll Multiplier
```

### Roll Quality Multipliers
- **critical** (god roll, 18+): 2.0x - **FEELS MASSIVE**
- **high** (15-17): 1.5x
- **medium** (10-14): 1.0x
- **low** (< 10): 0.6x - **Failed**

### Example Progression
```
Level 5:  Fireball = (15 + 7.5) × 2.0 = 45 power (god roll feels huge!)
Level 10: Fireball = (15 + 15) × 2.0 = 60 power (still impressive)
Level 20: Fireball = (15 + 30) × 2.0 = 90 power (god rolls ARE massive)
```

---

## LIBRARY UPDATES

### Update Trigger Conditions
1. Every 5th successful craft
2. Data invested > (current_version × 500)
3. Minimum level 5

### Update Roll Results

| Roll | Result |
|------|--------|
| 1-5 | No update |
| 6-12 | +1 element, +1 code bit |
| 13-18 | +2 elements, +2 code bits |
| 19 (GOD) | Unlock ALL elements + ALL code bits |
| 20 (SUPREME) | Trigger Library Miniboss encounter |

### Supreme Roll: Library Miniboss

When player rolls 20 on library update:
1. **The Technonomicon Warden** appears (Level 25, 500 HP)
2. Player must defeat it in combat
3. Upon victory: AI generates **bonus spell** tailored to player's playstyle
   - Evaluates: favorite elements, crafting style, progression
   - Creates custom EPIC spell as reward

```javascript
// Example AI bonus spell:
{
  name: "Inferno's Requiem",
  tier: 4,
  elements: ['fire', 'obsession'],  // Based on player's favorites
  codeBits: ['damage', 'drain'],
  epicVariant: true,
  custom: true,                      // AI generated
  dataCost: 400,
}
```

---

## QUANTUM TECHNONOMICON

### How It Works

The Technonomicon exists in **superposition**:
- **Linear Path**: Known spells follow clear progression (Tier 1 → Tier 4)
- **Sandbox Path**: Unknown combinations create experimental spells
- **Observer Effect**: What you craft, you learn. What you discover, you find again.

### Progression Modes

#### Mode 1: Following the Linear Path
```
Player discovers Tier 1 spells (fire+damage, heal+heart, etc)
  ↓
Player masters combinations through crafting
  ↓
Player reaches library update threshold
  ↓
New esoteric elements unlock (chaos, entropy, etc)
  ↓
New Tier 2-3 spells become possible
  ↓
Eventually: Philosopher's Stone + Transmute (ultimate spell)
```

#### Mode 2: Sandbox Experimentation
```
Player tries: [plasma] + [drain, steal]
  ↓
Experimental spell generated (not yet permanent)
  ↓
Player tries again: gets god roll
  ↓
Spell becomes PERMANENT discovery
  ↓
Adds to personal Technonomicon
```

#### Mode 3: Mixed (Recommended)
```
Linear path guides progression
But sandbox rewards creative experimentation
God rolls on unknowns make discoveries feel earned
Library updates gradually expand possibilities
```

---

## INTEGRATION CHECKLIST

- [ ] Add `spellTinkering` instance to `gameState` in GameEngine.js
- [ ] Hook `attemptCraft()` into spell casting commands
- [ ] Hook `harvestEnemyData()` into enemy defeat logic
- [ ] Hook `collectEnvironmentItem()` into item pickup logic
- [ ] Hook `checkLibraryUpdate()` into crafting success (every 5th)
- [ ] Add UI command: `/craft [elements] [codebits]` for player input
- [ ] Add UI command: `/spells` to list available spells
- [ ] Add UI command: `/data` to show current data inventory
- [ ] Add UI command: `/technonomicon` to show grimoire progress
- [ ] Add save/load hooks for `exportTechnonomicon()` and `exportDataInventory()`
- [ ] Connect ancient terminals to provide data collection items
- [ ] Connect AI DM system to generate bonus spells on supreme roll
- [ ] Test god roll feeling (should be memorable/rare)
- [ ] Tune data costs (balance grinding vs discovery)

---

## DEBUGGING COMMANDS

```javascript
// Force library update
spellTinkering.checkLibraryUpdate();

// Spawn miniboss
const miniboss = spellTinkering.triggerLibraryMiniboss();

// Give data
spellTinkering.dataInventory.totalData += 1000;

// Unlock all elements
spellTinkering.unlockAllElements();

// List available spells
const available = spellTinkering.getAvailableSpells(player);

// Export state
const state = spellTinkering.exportTechnonomicon();
console.log(state);
```

---

## PHILOSOPHY

> **Data is the new Magic**
> 
> Every sensor, every scan, every piece of information is currency. Players don't trade gold or gems—they trade raw information. This ties perfectly into the ancient terminals: they are data *sources*, the mines from which all crafting resources flow.
> 
> **The Technonomicon is Alive**
> 
> It's not a static recipe book. It's a *quantum grimoire* that evolves based on observation. The linear path shows what *could* be, but the sandbox lets players discover what *is*. God rolls on unknowns feel like genuine breakthroughs because they *are*.
> 
> **Level Scaling Makes Moments Matter**
> 
> A god roll at level 5 feels amazing. A god roll at level 20 feels legendary. By scaling spell power with level, higher-level god rolls become *truly* memorable, rare achievements worth celebrating.

