5555# TECHNOMANCER - COMPLETE VISION RESTORATION

**Status:** Discovery Complete - Ready to Rebuild  
**Date:** January 19, 2026  
**Source:** CLAUDELOG.txt (6710 lines of development history)

---

## 🎮 GAME VISION - COMPLETE

### Core Identity
**TECHNOMANCER: Quest for the Code** is a hybrid adventure-hacking game where:
- **Adventure Mode** = Combat, exploration, spell management, resource gathering
- **Terminal Mode** = Real-world coding challenges that control world systems
- **Story** = Unfolds through terminals; you slowly realize you're talking to yourself

### Two Distinct Coding Styles (CRITICAL SEPARATION)
1. **Real-World Code** (Ancient Terminals)
   - Python, Bash, PowerShell
   - Actually executable/validated
   - Controls environment (doors, water systems, security, power)
   - HuggingFace + optional local model evaluation

2. **In-Game Code** (Game Mechanics)
   - Fantasy spells (normalize, debug, compile, fireball)
   - Game commands
   - Purely narrative/mechanical

---

## 🛠️ MISSING CORE SYSTEMS (MUST RESTORE)

### 1. **TERMINAL HACKING MINIGAMES** ⚙️
- **Network Spoofing**: Send spoof email → netstat → copy IP → transfer file
- **Decryption**: Scrambled tech words = unlock key
- **Code Matching**: Match code snippets to function descriptions
- **Floppy Disk Augments**: Collectible items that upgrade terminal capabilities
- **Bitminers**: Installed on upgraded terminals, passively mine HP/MP/Data

### 2. **SUBZONE SYSTEM** 🗺️
Each static zone (Hub, Forest, City) has dynamic subzones unlocked by:
- **Puzzle solves** → DM narration → Object/lore clue → Perception check → Hidden door
- **Terminal hacks** → System reboot/door unlock → New area opens
- **Miniboss defeat** → Access to new terminal/area

Example structure:
```
Hub Zone (static)
├─ hub_center (always accessible)
├─ hub_archive (unlocked by puzzle)
└─ hub_nexus (unlocked by terminal hack)

Forest Zone (static)
├─ forest_entrance (always accessible)
├─ forest_deep (unlocked by puzzle + defeat miniboss)
└─ forest_root (procedurally generated, unlocked by terminal)

City Zone (static)
├─ city_gate (always accessible)
├─ city_core (unlocked by terminal)
└─ city_underground (procedurally generated)
```

### 3. **DICE ROLLING SYSTEM** 🎲
- Generate combat rolls
- Used in encounters
- Affects damage/defense calculations
- Missing from current build!

### 4. **AI SUMMON RITUAL** 👁️
- Call forth an ally/familiar
- Uses specific incantation/ritual
- Provides combat support
- Missing from current build!

### 5. **DEFINE FEATURE** (Clarified)
Currently ambiguous. Should:
- Define new variables/concepts
- Auto-unlock spells when defined with specific properties
- Enable skill progression (unlock "cast fireball" by defining "damage: heat")
- Tie rewards to context (define spell → use in puzzle → progress)

### 6. **QUEST SYSTEM** 📜
**Built-in (No AI needed):**
- Main story quests (unlock lore, skills, items)
- Procedurally generated side quests
- Repeatable farming quests
- Mini-challenges (repair network cable, trace power line)

**Quest Structure:**
```
Quest: "Restore Power to Archive"
  Objective: Find and repair power cable
  Reward: Unlock archive_access command
  Follow-up: Use command in puzzle
  Unlock: New terminal + subzone
```

### 7. **PC BUILDING SYSTEM** 💻
- Collect PC parts as drops from minibosses
- Build custom terminals (stationary)
- Grinding feels earned
- Parts include: CPU, RAM, GPU, PSU, motherboard, HDD/SSD
- Built PCs act as portable terminal workstations

### 8. **NETWORK REPAIR SYSTEM** 🔌
- Minigames: Cable tracing, hardware repair, network patching
- Repair leads to puzzles/minibosses
- Fix network → Access remote terminals → Unlock areas
- Multi-console connectivity (build network between placed PCs)

### 9. **RESOURCE ECONOMY** 💰
```
HP = Combat resource (consumed by attacks, restored by spells/items)
MP = Spell resource (restored by meditation/items)
Data = Terminal currency (trade for floppy disks, flash drives, PC parts)
Floppy Disks = Consumables (work at specific terminals)
Flash Drives = Alternative terminal access
CD/DVD = High-capacity data storage
PC Parts = Grind rewards → Build workstations
```

### 10. **SOUND SYSTEM** 🔊
- Web Audio API synthesis
- Beeps, ambient tones, spell effects
- Battle sounds (attack, defend, victory, defeat)
- Terminal hacking audio feedback
- Currently missing functional implementation!

---

## 🤖 AI INTEGRATION (DUAL BACKEND)

### Default: HuggingFace
- Always available
- DM narration of subzones
- Dynamic encounter generation
- Terminal challenge generation
- Player API keys or pre-set

### Optional: Local Model
- LM Studio / Ollama
- Privacy-first option
- Better for power users
- Toggle in settings

### AI DM Responsibilities
1. Generate subzone descriptions on first visit
2. Create dynamic encounters/NPCs
3. Generate terminal minigame content
4. Evaluate terminal code submissions
5. Provide narrative branching

### AI Notes System
- Leave notes for player
- Sometimes player recognizes themselves in the notes
- Creates identity blur/discovery mechanic

---

## 📊 PROGRESSION FLOW

```
Player boots → Choose AI backend (HuggingFace vs Local)
               ↓
Intro sequence (boot narrative)
               ↓
Hub Zone (safe zone, tutorial content)
               ↓
Explore, battle, gather resources
               ↓
Solve puzzle → Perception check → Discover hidden subzone
               ↓
Enter subzone → Find terminal
               ↓
Hack terminal (minigame)
               ↓
Solve minigame → System unlocks
                → New command available
                → Lore revealed
                → Resource drop (PC part, floppy disk, data)
               ↓
Leave terminal → Use new command in next puzzle
               ↓
Command unlock completes quest → New quest appears
               ↓
Repeat: explore, hack, build, repeat
```

---

## 📁 FILE STRUCTURE (MODULAR)

```
TECHNOMANCER/
├── index.html (HTML scaffold)
├── engine.js (bootstrap, validation)
├── zones-puzzles.js (world definition)
├── terminals-data.js (terminal definitions)
├── ancient-terminals.js (terminal UI + minigames) [NEEDS MAJOR WORK]
├── battle-core.js (JRPG + typing battles)
├── enemies-battle.js (enemy data)
├── spells-data.js (spell registry)
├── core.js (main game loop) [NEEDS EXPANSION]
├── fx.js (sound + particles)
├── intro.js (boot sequence)
├── subzones.js (NEW - dynamic subzone system)
├── quest-system.js (NEW - quest engine)
├── network-repair.js (NEW - network minigames)
├── pc-building.js (NEW - PC crafting system)
└── ai-integration.js (NEW - HuggingFace + local model)
```

---

## 🎯 IMMEDIATE PRIORITIES

### Phase 1: Restore Core Missing Systems
- [ ] Dice rolling system
- [ ] AI summon ritual
- [ ] Fix define feature clarity
- [ ] Sound system (functional)

### Phase 2: Expand Zones & Subzones
- [ ] Add subzone definitions to zones-puzzles.js
- [ ] Create subzone system (subzones.js)
- [ ] Add procedural generation logic
- [ ] Define unlock triggers

### Phase 3: Terminal Hacking Minigames
- [ ] Network spoofing minigame
- [ ] Decryption minigame
- [ ] Code matching minigame
- [ ] Integrate into ancient-terminals.js

### Phase 4: New Systems
- [ ] Quest system
- [ ] PC building system
- [ ] Network repair system
- [ ] Bitminers + passive regen

### Phase 5: AI Integration
- [ ] HuggingFace setup
- [ ] Local model fallback
- [ ] DM narration hooks
- [ ] Dynamic content generation

### Phase 6: Polish
- [ ] Story integration
- [ ] Note/identity blur mechanics
- [ ] Grinding feel balance
- [ ] Audio design

---

## 💡 KEY DESIGN PRINCIPLES

1. **Separation of Concerns**
   - Real-world code ≠ Game code
   - Adventure ≠ Hacking
   - Static ≠ Dynamic

2. **Earned Progression**
   - PC parts from grinding (minibosses)
   - Commands unlocked by quest context
   - Spells use managed resources (MP)

3. **Story Through Systems**
   - Terminals reveal story
   - Notes create identity mystery
   - Unlock commands, unlock lore

4. **Resource Balance**
   - HP/MP = Adventure currency
   - Data = Terminal currency
   - Parts = Grind reward

5. **Modular Architecture**
   - Each system standalone
   - Clean headers for patching
   - No circular dependencies

---

## 📝 NEXT STEPS

**Goal:** Rebuild TECHNOMANCER with complete vision intact

**Method:** One file at a time
1. You provide current file
2. I ask clarifying questions
3. You answer
4. I provide enhanced code
5. Next file

**Current Status:** All vision documented. Ready to rebuild when you are.

---

**Document:** TECHNOMANCER_COMPLETE_VISION.md  
**Created:** January 19, 2026  
**Status:** Reference Document - Use as blueprint for restoration
