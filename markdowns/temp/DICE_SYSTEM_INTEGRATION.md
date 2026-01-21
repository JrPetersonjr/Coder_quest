# DICE SYSTEM - Complete Integration Guide

**Version:** Enhanced for AI DM + Modifiers + Expansion Templates  
**Date:** January 19, 2026  
**Status:** Ready for integration

---

## 📋 SYSTEM OVERVIEW

The enhanced DiceSystem now supports:

1. **Character Modifiers** - Stored on character objects (level, class, equipment, buffs, debuffs)
2. **AI DM Decision Flow** - AI silently calculates, determines roll type, player rolls, outcome resolves
3. **Dynamic Outcomes** - High/mid/low roll branches with scaling
4. **Percentage Calculations** - For HP restoration, damage as % of target, etc
5. **Template Saving** - Store encounters as expansion cards for offline processing

---

## 🎲 USAGE PATTERNS

### Pattern 1: Combat with Modifiers

```javascript
// Setup characters with modifiers
const player = {
  name: "Technomancer",
  level: 5,
  classBonus: { attack: 2, defense: 1, spell: 3 },
  equipment: { attack: 1, defense: 2 },
  activeBuffs: [
    { type: "attack", value: 2, name: "Haste" },
    { type: "all", value: 1, name: "Blessing" }
  ],
  activeDebuffs: [
    { type: "defense", value: 1, name: "Curse" }
  ]
};

const enemy = {
  name: "Goblin",
  level: 2,
  classBonus: { attack: 1, defense: 0 },
  equipment: { attack: 0, defense: 1 },
  activeBuffs: [],
  activeDebuffs: []
};

// Calculate modifiers
const playerMod = DiceSystem.calculateModifier(player, "attack");
// Result: floor(5/2) + 2 + 1 + 2 + 1 - 0 = 9

const enemyMod = DiceSystem.calculateModifier(enemy, "defense");
// Result: floor(2/2) + 0 + 1 + 0 - 0 = 2

// Combat rolls automatically include modifiers
const combat = DiceSystem.rollCombat(player, enemy);
```

---

### Pattern 2: AI DM Negotiation Flow

```javascript
// STEP 1: Player attempts action
const playerAction = "I try to negotiate with the imps";

// STEP 2: AI silently calculates outcome
const aiDecision = DiceSystem.aiCalculateOutcome({
  player: player,
  target: impLeader,
  action: "negotiate",
  difficulty: 14
});

// Result:
// {
//   rollType: "social",
//   rollDice: "3d12",
//   difficulty: 14,
//   modifier: 5,
//   silentDecision: {
//     wouldSucceed: true,
//     criticalChance: 0.15,
//     targetDifficulty: 14,
//     modifiedDifficulty: 9
//   },
//   prompt: "Roll 3d12 (DC 9)"
// }

// STEP 3: AI prompts player with roll type
console.log(`${aiDecision.prompt}`);
// Output: "Roll 3d12 (DC 9)"

// STEP 4: Player rolls
const playerRoll = DiceSystem.rollNotation("3d12");
// Let's say they get 15 total

// STEP 5: Define possible outcomes
const outcomes = {
  critical_success: {
    narrative: "The imp leader is impressed by your wisdom. 'You understand us better than most.'",
    rewards: [{ type: "ally", value: "Imp Scout" }],
    consequences: []
  },
  success: {
    narrative: "The imps lower their weapons. Most of them wander off, but the leader stays.",
    rewards: [{ type: "peace", value: true }],
    consequences: []
  },
  partial_success: {
    narrative: "They seem interested, but suspicious. 'Prove your sincerity...'",
    rewards: [],
    consequences: [{ type: "followUp", value: "prove_worth" }]
  },
  failure: {
    narrative: "The imps laugh mockingly and attack!",
    rewards: [],
    consequences: [{ type: "combat", value: true }]
  }
};

// STEP 6: Resolve based on player's roll
const result = DiceSystem.resolveRoll(playerRoll.final, aiDecision, outcomes);

// Result:
// {
//   playerRoll: 15,
//   difficulty: 14,
//   effectiveDC: 9,
//   success: true,
//   outcome: "success",
//   narrative: "The imps lower their weapons...",
//   rewards: [{ type: "peace", value: true }],
//   margin: 6
// }

// STEP 7: Apply outcome
console.log(result.narrative);
applyRewards(result.rewards);
```

---

### Pattern 3: Percentage-Based Effects

```javascript
// Spell: "Drain Life" - Deals 15% of target's HP
const targetHP = 80;
const damage = DiceSystem.calculatePercentage(15, targetHP, "damage");
// Result: { percentage: 15, baseValue: 80, amount: 12, result: 68 }

// Item: "Potion of Healing" - Restores 25% of max HP
const maxHP = 100;
const healing = DiceSystem.calculatePercentage(25, maxHP, "restore");
// Result: { percentage: 25, baseValue: 100, amount: 25, result: 125 }

// Mana drain effect - Drains 10% of target's MP
const targetMP = 50;
const manaDrain = DiceSystem.calculatePercentage(10, targetMP, "drain");
// Result: { percentage: 10, baseValue: 50, amount: 5, result: 45 }
```

---

### Pattern 4: Saving Dynamic Encounters as Expansion

```javascript
// After a successful negotiation with imps...

// Collect the data
const encounterData = {
  type: "negotiation",
  rolls: {
    initial: aiDecision,
    playerRoll: playerRoll.final,
    aiRolls: [
      { type: "silentDecision", value: aiDecision.silentDecision.wouldSucceed }
    ]
  },
  outcomes: outcomes,
  scaling: {
    difficulty: 14,
    rewardScaling: 1.0,
    enemyLevelScale: 0,
    lootMultiplier: 1.0
  },
  context: {
    location: "imp_warren",
    npcNames: ["Imp Scout", "Imp Leader"],
    theme: "negotiation",
    difficulty: "medium"
  },
  aiNarrative: "The player demonstrated diplomacy. The imps appreciated the gesture but remained wary. This could lead to an alliance questline."
};

// Create template (clean, templated format)
const template = DiceSystem.createExpansionTemplate(encounterData);

// Save for later conversion to expansion card
DiceSystem.saveTemplate(template, "Imp Warren Negotiation");

// Template saved to:
// 1. window.offlineTemplates (in-memory)
// 2. localStorage (persistent)
// 3. Ready for dev to export and process
```

---

### Pattern 5: Using //save Command

```javascript
// In game, after an encounter, dev types:
// //save -encounter

// System automatically:
// 1. Collects last encounter data
// 2. Creates expansion template
// 3. Saves to localStorage
// 4. Notifies dev: "Encounter saved: imp_warren_001"

// Later, dev can:
DiceSystem.getTemplates(); // Get all saved templates
DiceSystem.exportTemplates(); // Export as JSON for processing
// Send to expansion card converter
// Add to offline content library
```

---

## 🛠️ INTEGRATION CHECKLIST

### GameEngine.js Modifications Needed:

- [ ] Add `player` character object with modifiers
- [ ] Track `activeBuffs` and `activeDebuffs` arrays
- [ ] On each command, call `DiceSystem.calculateModifier(player, actionType)`
- [ ] In negotiation/social encounters, use `aiCalculateOutcome()` pattern
- [ ] In combat, ensure `resolveCombat()` uses character modifiers
- [ ] Hook `//save` command to save templates

### Battle System Modifications:

- [ ] Use `aiCalculateOutcome()` to determine enemy actions
- [ ] Pass enemy stats with modifiers
- [ ] Support percentage-based damage (boss abilities)
- [ ] Track battle for expansion template

### Quest System Modifications:

- [ ] AI DM generates quests using `aiCalculateOutcome()` patterns
- [ ] Dynamic difficulty scaling via modifiers
- [ ] Save completed quests as templates
- [ ] Load templates for offline quests

---

## 📊 MODIFIER EXAMPLES

### Character Setup:

```javascript
// High-level warrior
{
  level: 10,
  classBonus: { attack: 4, defense: 3 },
  equipment: { attack: 2, defense: 3 },
  activeBuffs: [{ type: "all", value: 2 }],
  activeDebuffs: []
}
// Attack modifier: 5 + 4 + 2 + 2 = 13

// Low-level rogue
{
  level: 3,
  classBonus: { attack: 2, defense: 0 },
  equipment: { attack: 0, defense: 0 },
  activeBuffs: [],
  activeDebuffs: [{ type: "defense", value: 1 }]
}
// Attack modifier: 1 + 2 + 0 + 0 - 0 = 3

// Mage with temporary power
{
  level: 5,
  classBonus: { spell: 3, attack: 1, defense: 1 },
  equipment: { spell: 2 },
  activeBuffs: [
    { type: "spell", value: 3, name: "Mana Surge" }
  ],
  activeDebuffs: [
    { type: "defense", value: 2, name: "Vulnerability" }
  ]
}
// Spell modifier: 2 + 3 + 2 + 3 = 10
// Defense modifier: 2 + 1 + 0 - 2 = 1
```

---

## 🎯 WORKFLOW SUMMARY

### Normal Combat:
```
Player attacks
  ↓
Player's modifier calculated
  ↓
Roll with modifier applied
  ↓
Damage resolved
  ↓
Potential to save as template
```

### AI DM Social Encounter:
```
Player attempts action
  ↓
AI silently decides outcome + determines roll type
  ↓
Player prompted to roll
  ↓
Roll resolved against AI's calculation
  ↓
Outcome applied with narrative
  ↓
Template saved for expansion
```

### Offline Mode:
```
Load saved templates
  ↓
Use scaled difficulty
  ↓
Procedurally generate variations
  ↓
Add to offline quest library
```

---

## ✅ NEXT STEPS

1. **Integrate into GameEngine.js**
   - Add player character object with modifiers
   - Hook commands to modifier calculations

2. **Integrate into Battle System**
   - Use percentage-based abilities
   - Track for template saving

3. **Integrate into Quest System**
   - AI DM uses aiCalculateOutcome()
   - Dynamic difficulty scaling

4. **Test Pattern 2 (Negotiation)**
   - Test high/mid/low roll outcomes
   - Verify AI decision logic

5. **Test Pattern 4 (Template Saving)**
   - Verify localStorage persistence
   - Test export format

---

**Document:** DICE_SYSTEM_INTEGRATION.md  
**Created:** January 19, 2026  
**Status:** Ready for implementation
