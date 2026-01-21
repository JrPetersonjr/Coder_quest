# DATA FARMING & RESOURCE ECONOMY - Companion Guide
**Version 1.0** | How data becomes the central currency of TECHNOMANCER

---

## OVERVIEW

In TECHNOMANCER, **data replaces traditional currency**. Players don't collect coins or gems—they mine, farm, and scan information. This creates a deeply thematic resource economy tied to:

- **Ancient Terminals** → Source of data collection *tools*
- **Environmental Scanning** → Collecting sensor items
- **Enemy Surveillance** → Passive harvesting from combat
- **Spell Crafting** → Primary data *sink*
- **Bitminers** → Passive background income

---

## DATA COLLECTION MECHANICS

### 1. Enemy Surveillance (Active Harvesting)

When surveillance system is active (unlocked via ancient terminals), defeating enemies yields data:

```javascript
// Base formula
Data Harvested = Enemy Level × 10 × Surveillance Efficiency Multiplier

// Example:
// Level 5 enemy × 10 = 50 base data
// With 1.2x surveillance efficiency = 60 data
```

**Activation**: Requires ancient terminal tutorial or sidequest

```javascript
// In GameEngine combat resolution:
if (victorious && spellTinkering.dataInventory.surveyenceSystemActive) {
  const dataHarvested = spellTinkering.harvestEnemyData(enemy, player);
  console.log(`+${dataHarvested} data harvested`);
}
```

### 2. Environmental Item Collection (Passive Multipliers)

Players find sensor items scattered in zones. Each type boosts specific data collection:

| Item | Collection Boost | Rarity | Found In |
|------|------------------|--------|----------|
| **Heat Sensor** | +5% overall | Common | Fire zones, lava areas |
| **Moisture Sensor** | +5% overall | Common | Water zones, caves |
| **IR Scanner** | +8% overall | Uncommon | Dark zones, electronics |
| **Density Tester** | +6% overall | Uncommon | Stone zones, deep dungeons |
| **Microscopic Sampler** | +10% overall | Rare | Ancient labs, terminals |

**Collection Mechanic**:
```javascript
// Player walks into zone pickup location
onZonePickup() {
  spellTinkering.collectEnvironmentItem('heatSensor');
  // Increases data farming efficiency for all future collections
}

// Multiplier stacks cumulatively
getDataCollectionMultiplier(character) {
  let mult = 1.0;
  mult += (heatSensors × 0.05);
  mult += (moistureSensors × 0.05);
  mult += (irScanners × 0.08);
  mult += (densityTesters × 0.06);
  mult += (microscopicSamplers × 0.10);
  mult += (character.level / 10 × 0.1);
  return mult;
}
```

**Finding Items**:
- Exploration reward (hidden in zones)
- Boss/miniboss drops
- Quest rewards
- Ancient terminal unlocks

### 3. Zone-Based Passive Collection

Zones can have passive data generation when player is present:

```javascript
// In zone encounter
setInterval(() => {
  if (playerInZone && surveillanceActive) {
    const passiveData = Math.floor(2 * multiplier);  // ~2 data per 10 seconds
    dataInventory.totalData += passiveData;
  }
}, 10000);
```

### 4. Miniboss/Boss Surge

Defeating high-tier enemies yields data surge:

```javascript
// Boss defeated
const bossData = Math.floor(
  enemy.level × 50 ×                    // Big multiplier
  getDataCollectionMultiplier(player) ×
  (hasRareItems ? 1.5 : 1.0)
);
// Example: Level 15 boss × 50 × 1.3 multiplier × 1.5 rare = 1462 data!
```

---

## DATA SINKS (Consumption)

### Primary Sink: Spell Crafting

Spell crafting is the **main data consumer**:

| Spell Type | Data Cost | Notes |
|-----------|-----------|-------|
| **Tier 1 (Basic)** | 50-100 | Single element + single code bit |
| **Tier 2 (Combo)** | 150-250 | 2 elements OR 2 code bits |
| **Tier 3 (Advanced)** | 250-400 | 3+ elements or advanced combinations |
| **Tier 4 (EPIC)** | 300-500 | Philosopher's Stone or supreme combos |

**Cost Calculation**:
```javascript
calculateDataCost(spell) {
  let cost = spell.baseMana;
  
  // Elements tier multiplier
  spell.elements.forEach(elem => {
    const tier = elementRegistry[elem].tier;
    cost += (tier * 50);
  });
  
  // Code bit complexity
  cost += (spell.codeBits.length * 50);
  
  // EPIC penalty
  if (spell.epicVariant) cost *= 1.5;
  
  return cost;
}
```

### Secondary Sink: Library Updates

When library needs to evolve:

```javascript
const dataCostThreshold = libraryVersion × 500;
// Version 1: 500 data to unlock next tier
// Version 2: 1000 data
// Version 3: 1500 data
```

### Tertiary Sink: Ritual Crafting (AI Summons)

When summoning allies via spell rituals:

```javascript
const ritualDataCost = summonTier × 200;
// Basic summon: 200 data
// Advanced summon: 400 data
// Legendary summon: 600 data
```

---

## FARMING STRATEGIES

### Strategy 1: Early Game (Levels 1-5)

**Goal**: Accumulate first 500 data for library update

```
Session Flow:
1. Unlock surveillance system (ancient terminal intro)
2. Fight 5-10 level 1-2 enemies
3. Collect each available sensor in starter zone
4. Craft 2-3 basic spells (costs 150 total)
5. Result: 200+ data accumulated
```

**Optimal**: ~20 minutes for first library update

### Strategy 2: Mid Game (Levels 6-15)

**Goal**: Build data multiplier through item collection

```
Session Flow:
1. Exploration: Find all sensor items in current zone tier
2. Get 1.5-2.0x multiplier stack
3. Run enemy gauntlet (10-20 encounters)
4. Harvest: 800-1200 data
5. Craft 3-5 spells using new elements
6. Trigger 2nd library update
```

**Optimal**: ~1 hour for full zone progression + library tier

### Strategy 3: Late Game (Levels 16+)

**Goal**: Grind for EPIC spell access or miniboss prep

```
Session Flow:
1. Farm high-level enemies (5x+ data per kill)
2. With full multiplier stack: 300-500 per enemy
3. 30 enemies = 9000-15000 data
4. Craft multiple advanced spells
5. Stack data for supreme library roll (trigger miniboss)
```

**Optimal**: ~2 hours for miniboss preparation

### Strategy 4: The Chain Method (Farming Loop)

```
Repeat:
  1. Run encounter (get data)
  2. Craft spell (spend 50-100 data)
  3. Use spell in combat (helps clear faster)
  4. Back to step 1
  
Net effect: Accumulate while progressing
```

---

## PROGRESSION GATES

Data creates natural progression gates:

| Gate | Data Required | Unlocks |
|------|---------------|---------|
| **First Craft** | 50 | Player learns cost exists |
| **First Library Update** | 500 | New elements visible |
| **Tier 2 Spells** | 1500 total | Advanced combinations |
| **Tier 3 Access** | 3000 total | Esoteric elements |
| **Supreme Roll** | 5000 total | Miniboss instance |
| **Philosopher's Stone** | 8000+ total | Ultimate spell available |

---

## BITMINER INTEGRATION

Bitminers run passively in background (if implemented):

```javascript
// Passive generation (doesn't require spell crafting)
const bitMinerIncome = characterLevel × 5 per 5-minute idle period;
// Level 10 = 50 bitcoin per 5 min = 600 per hour

// Low priority for spell crafting (requires focus)
// More useful for: PC building, network upgrades
```

**Note**: Bitminers and spell crafting data are *separate* systems:
- **Spell crafting**: Requires active play + enemy surveillance
- **Bitminers**: Passive, background farming
- Bitminers can be converted to spell data via "data extraction" (late game)

---

## TERMINAL INTEGRATION

Ancient terminals are the **data tool shop**:

### Terminal Hacking Rewards

| Challenge | Reward |
|-----------|--------|
| **Spoofing (Easy)** | 100 data + 1 random item |
| **Decryption (Medium)** | 250 data + heat sensor |
| **Code Matching (Hard)** | 500 data + rare item |

### Unlocks

```javascript
// Completing terminal challenges unlocks:
- Surveillance system (primary income)
- Data extraction algorithms (convert other resources)
- Sensor blueprints (craft own sensor items)
- Network access (share data with allies - later feature)
```

---

## BALANCING DATA ECONOMY

### Player Expectations

```
"I should be able to afford 1-2 spells per enemy encounter"
"I should reach next library tier in 30-60 minutes"
"Grinding shouldn't feel punishing"
```

### Tuning Knobs

```javascript
// In SpellTinkeringSystem:

// Enemy surveillance rate:
const baseDataPerLevel = 10;  // Increase for faster farming
// Change to 15 for +50% faster

// Item multiplier:
const itemBoosts = 0.05;      // Each item = 5% bonus
// Change to 0.08 for faster stacking

// Spell costs:
const spellBaseCost = 100;    // Starting cost
// Change to 75 for cheaper casting

// Library threshold:
const libraryVersion = version × 500;
// Change to version × 400 for faster updates
```

### Balancing Principle

> **Data scarcity creates meaning**
> 
> Players should sometimes have *enough* data (comfortable cast), sometimes be *close* (exciting grind), never be *desperate* (frustration). This sweet spot creates engagement loops.

---

## ECONOMY PROGRESSION TABLE

| Level | Per-Enemy Data | Spell Cost Range | Total Available | Recommended Data Usage |
|-------|---|---|---|---|
| 1-3 | 10-30 | 50-100 | 50-150 | Save for library |
| 4-6 | 40-60 | 100-150 | 300-500 | Craft 1-2 spells |
| 7-10 | 70-100 | 150-250 | 800-1500 | Craft + library tier |
| 11-15 | 110-150 | 250-400 | 2000-4000 | Craft often |
| 16-20 | 160-200 | 300-500 | 5000-8000 | Grind for miniboss |
| 20+ | 200-300 | 400-600 | 8000+ | Access ultimate spells |

---

## UI/UX RECOMMENDATIONS

### Command Structure

```
/data                           Show current data inventory
/data history                   Last 10 transactions
/farm [zone]                    Quick farming guide for zone
/spells [affordable]            Show spells player can craft now
/technonomicon [items]          Show item collection progress
```

### Display Elements

```
Game Screen:
  [Data: 234/500] [Items: Heat×2, IR×1]  // HUD corner
  
Inventory Screen:
  Data Inventory:
    Total: 234
    By Type:
      Enemy Surveillance: 100
      Environmental Scans: 134
    Collection Items:
      Heat Sensor: 2
      IR Scanner: 1
  
Spell Screen:
  Can Craft Now:
    Fireball (100 data)
    Healing Light (75 data)
  Need More Data:
    Inferno (200 data - need 150 more)
```

---

## ECONOMY HEALTH INDICATORS

Monitor if economy is healthy:

### Green Flags ✅
- Players craft 3-5 spells per 30-min session
- Data never completely empty after first unlock
- Library updates feel achievable (not too grindy)
- Players explore zones looking for items

### Red Flags 🚩
- Players can't afford *any* spell after first encounter
- Data accumulation feels impossibly slow
- Items never found (or too rare)
- Players grinding mindlessly without progression

---

## FUTURE EXPANSION

### Phase 2: Data Sharing
```
Party members pool data
Shared library (co-op spell learning)
Data trading between players
```

### Phase 3: Data Processing
```
Convert bitminers → spell data
Process environmental data → more efficient harvesting
Cleanse corrupted data → special effect unlock
```

### Phase 4: Data Mastery
```
Data-only spells (no mana cost, data cost only)
Spell templates saved as data (share discoveries)
Community data sharing (cloud library)
```

---

## THEMATIC ALIGNMENT

Data farming ties beautifully to the game's cyberpunk + fantasy hybrid:

- **Ancient Terminals** = Sources of knowledge (data)
- **Surveillance Systems** = Information harvesting
- **Sensor Items** = Tools for measurement
- **Spell Data Costs** = Information has value
- **Library Evolution** = Knowledge accumulates

Every session reinforces: *"In this world, information is power. Literally."*

