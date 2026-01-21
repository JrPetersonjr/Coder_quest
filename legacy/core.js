// ============================================================
// CORE.JS (UPDATED)
// CASTCONSOLE MAIN GAME ENGINE
//
// PURPOSE:
//   - Game state management
//   - Command parser with new systems integrated
//   - UI rendering & updates
//   - Zone navigation with dynamic encounters
//   - Integration layer for all subsystems
//
// NEW FEATURES INTEGRATED:
//   - Dynamic encounters (DiceSystem + EncounterSystem)
//   - Spell crafting (SpellCrafting)
//   - Terminal hacking (AncientTerminal)
//   - Combat system (CastBattle, DiceSystem)
//   - Sound & effects (FXSystem)
//
// ============================================================

// DOM ELEMENTS
const output = document.getElementById("output");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");
const roomText = document.getElementById("room-text");

// GAME STATE
const gameState = {
  // Core stats
  zone: "hub",
  subzone: "hub_center",
  hp: 50,
  maxHp: 50,
  mp: 20,
  maxMp: 20,
  data: 100,
  level: 1,
  exp: 0,
  nextExp: 100,

  // Systems
  defined: {},
  inventory: [],
  learnedSpells: ["normalize", "debug", "compile"],
  learnedCodeBits: ["fire", "ice", "logic", "chaos"],
  discoveredSpells: {},
  completedTerminals: {},
  allies: [],
  hunted_by: [],
  claimed_zones: [],

  // Battle state
  inBattle: false,
  battleMode: null,
  currentEnemy: null,
  currentEncounter: null,

  // Progression
  puzzleSolved: {
    hub_gate: false,
    forest_bridge: false
  },
  visitedSubzones: {},
  questProgress: {}
};

// ============================================================
// [UI_FUNCTIONS] - Output & display management
// ============================================================

function appendLine(text, cls = "system") {
  const div = document.createElement("div");
  div.className = "line " + cls;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function clearOutput() {
  output.innerHTML = "";
}

function setRoomText(text) {
  roomText.textContent = text;
}

function updateUI() {
  // Update stats display
  const statsDiv = document.getElementById("stats");
  if (statsDiv) {
    statsDiv.innerHTML = `
      HP: ${gameState.hp}/${gameState.maxHp} | 
      MP: ${gameState.mp}/${gameState.maxMp} | 
      DATA: ${gameState.data} | 
      LVL: ${gameState.level} (${gameState.exp}/${gameState.nextExp} EXP)
    `;
  }

  // Update inventory display
  const invDiv = document.getElementById("inventory-list");
  if (invDiv) {
    invDiv.innerHTML = gameState.inventory.length > 0
      ? gameState.inventory.map(i => `<div>• ${i}</div>`).join("")
      : "<div>Empty</div>";
  }

  // Update spells display
  const spellDiv = document.getElementById("spells-list");
  if (spellDiv) {
    spellDiv.innerHTML = gameState.learnedSpells.length > 0
      ? gameState.learnedSpells.map(s => `<div>• ${s}</div>`).join("")
      : "<div>None</div>";
  }
}

// ============================================================
// [BOOT_SEQUENCE] - Initialize game
// ============================================================

async function bootSequence() {
  clearOutput();

  appendLine("█████████████████████████████████████", "system");
  appendLine("█ TECHNOMANCER: QUEST FOR CODE v2.1 █", "system");
  appendLine("█████████████████████████████████████", "system");
  appendLine("", "system");

  // Initialize subsystems
  appendLine("Initializing subsystems...", "system");

  FXSystem.initAudio();
  await AncientTerminal.aiBackend.init();
  DiceSystem.config.verbose = false;

  appendLine("✓ Audio system ready", "system");
  appendLine("✓ AI backend ready (" + AncientTerminal.aiBackend.provider + ")", "system");
  appendLine("✓ Encounter system ready", "system");
  appendLine("✓ Spell crafting ready", "system");
  appendLine("", "system");

  // Play boot theme
  FXSystem.playBootTheme();
  FXSystem.playSound("select");

  appendLine("You awaken in the Central Hub.", "system");
  appendLine("Type 'help' to begin.", "system");
  appendLine("", "system");

  setRoomText(CastZones.hub.name);
  cmdLook();
  input.focus();
  updateUI();
}

// ============================================================
// [COMMAND_HANDLER] - Main input parser
// ============================================================

function handleCommand() {
  const raw = input.value.trim();
  if (!raw) return;

  appendLine("> " + raw, "command");
  input.value = "";

  const parts = raw.split(" ");
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Terminal input override
  if (AncientTerminal.active) {
    AncientTerminal.handleInput(raw, appendLine, gameState);
    return;
  }

  // Battle input override
  if (gameState.inBattle) {
    if (["attack", "cast", "run", "stats", "help"].includes(cmd)) {
      handleBattleCommand(cmd, args);
      return;
    } else {
      appendLine("In battle! Commands: attack, cast <spell>, run, stats, help", "error");
      return;
    }
  }

  // Encounter choice handler
  if (gameState.currentEncounter && gameState.currentEncounter.active) {
    EncounterSystem.resolveChoice(gameState, raw.toLowerCase(), appendLine, cmdBattle, cmdGo);
    return;
  }

  // Normal commands
  switch (cmd) {
    case "help": cmdHelp(); break;
    case "look": cmdLook(); break;
    case "zone": cmdZone(); break;
    case "go": cmdGo(args); break;
    case "define": cmdDefine(args); break;
    case "inspect": cmdInspect(args); break;
    case "cast": cmdCast(args); break;
    case "stats": cmdStats(); break;
    case "battle": cmdBattle(args); break;
    case "terminal": cmdTerminal(args); break;
    case "craft": cmdCraft(args); break;
    case "dice": cmdDice(args); break;
    case "mine": cmdMine(args); break;
    case "sound": cmdSound(args); break;
    case "hint": cmdHint(); break;
    case "inventory": cmdInventory(); break;
    case "solve": cmdSolve(args); break;
    default:
      appendLine("Unknown command. Type 'help'.", "error");
  }
}

// ============================================================
// [CORE_COMMANDS] - Game mechanics
// ============================================================

function cmdHelp() {
  appendLine("═══════════════════════════════════", "system");
  appendLine("CORE COMMANDS", "system");
  appendLine("═══════════════════════════════════", "system");
  appendLine("  look - Observe current zone", "system");
  appendLine("  go <zone> - Travel to zone", "system");
  appendLine("  zone - Show current location", "system");
  appendLine("  define <name> <value> - Define a variable", "system");
  appendLine("  inspect <name> - Inspect definition", "system");
  appendLine("", "system");
  appendLine("BATTLE COMMANDS", "system");
  appendLine("  battle [enemy] - Start JRPG battle", "system");
  appendLine("  attack - Attack in battle", "system");
  appendLine("  cast <spell> - Cast spell in battle", "system");
  appendLine("  run - Flee from battle", "system");
  appendLine("", "system");
  appendLine("TERMINAL & CRAFTING", "system");
  appendLine("  terminal <id> - Access ancient terminal", "system");
  appendLine("  craft - Open spell crafting menu", "system");
  appendLine("  inventory - View items", "system");
  appendLine("", "system");
  appendLine("UTILITY", "system");
  appendLine("  stats - View character stats", "system");
  appendLine("  dice <notation> - Roll dice (e.g., '3d12')", "system");
  appendLine("  mine <type> - Mine for resources (hp/mp/data)", "system");
  appendLine("  sound on/off - Toggle audio", "system");
  appendLine("  hint - Get hint for current zone", "system");
}

function cmdLook() {
  const zone = CastZones[gameState.zone];
  if (!zone) return;

  const subzone = zone.subzones[gameState.subzone];
  if (!subzone) {
    appendLine(`${zone.name}: ${zone.desc}`, "system");
    return;
  }

  appendLine(`${subzone.name}`, "highlight");
  appendLine(subzone.desc, "system");
  appendLine("", "system");

  // Show banner
  if (subzone.banner) {
    subzone.banner.forEach(line => appendLine(line, "ascii"));
    appendLine("", "system");
  }

  // Show available exits
  if (subzone.exits) {
    appendLine("Exits: " + Object.keys(subzone.exits).join(", "), "hint");
  }

  // Show enemies
  if (subzone.enemies && subzone.enemies.length > 0) {
    appendLine("Enemies present: " + subzone.enemies.map(e => CastEnemies[e]?.name || e).join(", "), "battle");
  }

  // Show terminals
  if (subzone.terminals && subzone.terminals.length > 0) {
    appendLine("Terminals: " + subzone.terminals.join(", "), "highlight");
  }

  // Show puzzles
  if (subzone.puzzles && subzone.puzzles.length > 0) {
    subzone.puzzles.forEach(pid => {
      const p = CastPuzzles[pid];
      if (!gameState.puzzleSolved[pid]) {
        appendLine("", "system");
        appendLine(`📍 Puzzle: ${p.description}`, "puzzle");
        appendLine(`"${p.inscription}"`, "puzzle");
      }
    });
  }

  appendLine("", "system");

  // Check for encounter
  if (Math.random() < 0.25) {
    setTimeout(() => {
      const roll = DiceSystem.rollEncounter();
      if (roll.roll > 15) {
        EncounterSystem.triggerEncounter(gameState, gameState.zone, roll, appendLine);
      }
    }, 500);
  }
}

function cmdZone() {
  const zone = CastZones[gameState.zone];
  const subzone = zone?.subzones[gameState.subzone];
  appendLine(`Zone: ${zone?.name || "Unknown"}`, "system");
  appendLine(`Subzone: ${subzone?.name || "Unknown"}`, "system");
}

function cmdGo(args) {
  if (args.length === 0) {
    appendLine("Usage: go <subzone>", "error");
    return;
  }

  const zone = CastZones[gameState.zone];
  if (!zone) return;

  const subzone = zone.subzones[gameState.subzone];
  if (!subzone || !subzone.exits) {
    appendLine("No exits available.", "error");
    return;
  }

  const target = args.join("_").toLowerCase();
  const targetKey = Object.keys(subzone.exits).find(k => k.toLowerCase() === target);

  if (!targetKey) {
    appendLine("No exit in that direction.", "error");
    return;
  }

  // Check unlock requirements
  const targetSubzone = zone.subzones[targetKey];
  if (targetSubzone?.unlockReq) {
    if (!gameState.puzzleSolved[targetSubzone.unlockReq]) {
      appendLine("This area is sealed. An ancient barrier blocks your way.", "puzzle");
      return;
    }
  }

  gameState.subzone = targetKey;
  setRoomText(zone.name);
  appendLine(`You move to ${targetSubzone.name}.`, "system");
  FXSystem.playSound("select");

  cmdLook();

  // Check for encounter on entry
  if (Math.random() < 0.3) {
    const roll = DiceSystem.rollEncounter();
    if (roll.roll > 10) {
      setTimeout(() => {
        EncounterSystem.triggerEncounter(gameState, gameState.zone, roll, appendLine);
      }, 800);
    }
  }
}

function cmdDefine(args) {
  if (args.length < 2) {
    appendLine("Usage: define <name> <value>", "error");
    return;
  }

  const name = args[0].toLowerCase();
  const value = args.slice(1).join(" ");

  gameState.defined[name] = value;
  appendLine(`Defined: ${name} = ${value}`, "highlight");
  gameState.exp += 5;

  FXSystem.playSound("confirm");
  updateUI();
}

function cmdInspect(args) {
  if (args.length < 1) {
    appendLine("Usage: inspect <name>", "error");
    return;
  }

  const name = args[0].toLowerCase();
  if (!(name in gameState.defined)) {
    appendLine(`Nothing defined as '${name}'.`, "error");
    return;
  }

  appendLine(`${name} = ${gameState.defined[name]}`, "system");
}

async function cmdCast(args) {
  if (args.length < 1) {
    appendLine("Usage: cast <spell>", "error");
    return;
  }

  const spellId = args[0].toLowerCase();
  const result = CastSpells[spellId] || gameState.discoveredSpells[spellId];

  if (!result) {
    appendLine(`Spell '${spellId}' not known.`, "error");
    return;
  }

  if (!gameState.inBattle) {
    appendLine("No battle to cast in.", "error");
    return;
  }

  const castResult = DiceSystem.roll(6);
  const spellDamage = Math.floor((result.dmg || 8) * (castResult / 3.5));

  const enemy = gameState.currentEnemy;
  enemy.hp -= spellDamage;

  appendLine(`Cast ${result.name}! ${spellDamage} damage!`, "battle");
  FXSystem.playSpellSequence(result);

  if (enemy.hp <= 0) {
    endBattle(true);
  } else {
    enemyTurn();
  }
}

function cmdStats() {
  appendLine("═══════════════════════════════════", "system");
  appendLine("CHARACTER STATS", "system");
  appendLine("═══════════════════════════════════", "system");
  appendLine(`HP: ${gameState.hp}/${gameState.maxHp}`, "system");
  appendLine(`MP: ${gameState.mp}/${gameState.maxMp}`, "system");
  appendLine(`DATA: ${gameState.data}`, "system");
  appendLine(`Level: ${gameState.level}`, "system");
  appendLine(`EXP: ${gameState.exp}/${gameState.nextExp}`, "system");
  appendLine(`Allies: ${gameState.allies.length}`, "system");
  appendLine("", "system");
}

function cmdBattle(args) {
  if (gameState.inBattle) {
    appendLine("Already in battle!", "error");
    return;
  }

  let enemyId = null;

  if (args.length > 0) {
    enemyId = args[0].toLowerCase();
  } else {
    const enemies = Object.values(CastEnemies).filter(e => e.zone === gameState.zone);
    if (enemies.length === 0) {
      appendLine("No enemies here.", "system");
      return;
    }
    enemyId = enemies[Math.floor(Math.random() * enemies.length)].id;
  }

  const base = CastEnemies[enemyId];
  if (!base) {
    appendLine("No such enemy.", "error");
    return;
  }

  gameState.currentEnemy = JSON.parse(JSON.stringify(base));
  gameState.inBattle = true;
  gameState.battleMode = "jrpg";

  appendLine("", "system");
  appendLine("⚔ BATTLE INITIATED", "battle");
  appendLine("", "system");
  appendLine(`A ${base.name} appears!`, "battle");
  appendLine(`HP: ${base.hp}`, "battle");
  appendLine("", "system");
  appendLine("Commands: attack, cast <spell>, run, stats", "battle");

  FXSystem.playSound("danger");
}

async function cmdTerminal(args) {
  if (args.length < 1) {
    appendLine("Usage: terminal <id>", "error");
    return;
  }

  await AncientTerminal.open(args[0], appendLine);
}

function cmdCraft(args) {
  appendLine("═══════════════════════════════════", "system");
  appendLine("SPELL CRAFTING MENU", "system");
  appendLine("═══════════════════════════════════", "system");
  appendLine("", "system");
  appendLine("Learned code bits:", "system");
  gameState.learnedCodeBits.forEach(bit => {
    const bitObj = SpellCrafting.codeBits[bit];
    appendLine(`  • ${bitObj?.name || bit}`, "system");
  });
  appendLine("", "system");
  appendLine("Available materials:", "system");
  SpellCrafting.getAvailableObjects(gameState.inventory).forEach(obj => {
    appendLine(`  • ${obj.name}`, "system");
  });
  appendLine("", "system");
  appendLine("Cost per craft: " + (10 + gameState.level * 5) + " DATA", "hint");
  appendLine("", "system");
  appendLine("(Crafting not yet implemented in chat - use UI)", "system");
}

function cmdDice(args) {
  if (args.length < 1) {
    appendLine("Usage: dice <notation> (e.g., '3d12', '2d6+3')", "error");
    return;
  }

  const notation = args.join("");
  const result = DiceSystem.rollNotation(notation);

  if (result.error) {
    appendLine("Invalid notation.", "error");
    return;
  }

  appendLine(`${notation} → ${result.rolls.join("+")} = ${result.final}`, "highlight");
}

function cmdMine(args) {
  if (args.length < 1) {
    appendLine("Usage: mine <hp|mp|data>", "error");
    return;
  }

  const type = args[0].toLowerCase();
  const amount = Math.floor(Math.random() * 10) + 5;

  switch (type) {
    case "hp":
      gameState.hp = Math.min(gameState.maxHp, gameState.hp + amount);
      appendLine(`Mined ${amount} HP. Current: ${gameState.hp}/${gameState.maxHp}`, "highlight");
      break;

    case "mp":
      gameState.mp = Math.min(gameState.maxMp, gameState.mp + amount);
      appendLine(`Mined ${amount} MP. Current: ${gameState.mp}/${gameState.maxMp}`, "highlight");
      break;

    case "data":
      gameState.data += amount;
      appendLine(`Mined ${amount} DATA. Total: ${gameState.data}`, "highlight");
      break;

    default:
      appendLine("Unknown resource type.", "error");
  }

  FXSystem.playSound("item_acquire");
  updateUI();
}

function cmdSound(args) {
  if (args.length < 1) {
    appendLine(`Sound: ${FXSystem.soundEnabled ? "ON" : "OFF"}`, "system");
    return;
  }

  const mode = args[0].toLowerCase();
  if (mode === "on") {
    FXSystem.soundEnabled = true;
    FXSystem.initAudio();
    appendLine("Sound enabled.", "system");
  } else if (mode === "off") {
    FXSystem.soundEnabled = false;
    appendLine("Sound disabled.", "system");
  }
}

function cmdHint() {
  const zone = CastZones[gameState.zone];
  const hints = zone?.hints || [];

  if (hints.length === 0) {
    appendLine("No hints available.", "system");
    return;
  }

  const hint = hints[Math.floor(Math.random() * hints.length)];
  appendLine(`Hint: ${hint}`, "hint");
}

function cmdInventory() {
  appendLine("═══════════════════════════════════", "system");
  appendLine("INVENTORY", "system");
  appendLine("═══════════════════════════════════", "system");

  if (gameState.inventory.length === 0) {
    appendLine("Empty", "system");
    return;
  }

  gameState.inventory.forEach(item => {
    appendLine(`• ${item}`, "system");
  });
}

function cmdSolve(args) {
  if (args.length < 2) {
    appendLine("Usage: solve <puzzle> <code>", "error");
    return;
  }

  const puzzleName = args[0].toLowerCase();
  const code = args.slice(1).join(" ");
  const puzzle = CastPuzzles[puzzleName];

  if (!puzzle) {
    appendLine(`No puzzle named '${puzzleName}'.`, "error");
    return;
  }

  if (puzzle.check(code)) {
    if (!gameState.puzzleSolved[puzzleName]) {
      gameState.puzzleSolved[puzzleName] = true;
      appendLine(puzzle.successText, "highlight");

      if (puzzle.reward) {
        gameState.exp += puzzle.reward.exp || 0;
      }

      FXSystem.playSound("puzzle_solve");
      FXSystem.createParticles("spell_impact", 40);
      updateUI();
    } else {
      appendLine("Already solved.", "system");
    }
  } else {
    appendLine("Rejected. " + puzzle.failureHint, "error");
    FXSystem.playSound("error");
  }
}

// ============================================================
// [BATTLE_SYSTEM] - Combat mechanics
// ============================================================

function handleBattleCommand(cmd, args) {
  switch (cmd) {
    case "attack":
      attack();
      break;

    case "cast":
      cmdCast(args);
      break;

    case "run":
      run();
      break;

    case "stats":
      cmdStats();
      break;

    case "help":
      appendLine("Battle commands: attack, cast <spell>, run, stats", "system");
      break;
  }
}

function attack() {
  const enemy = gameState.currentEnemy;
  if (!enemy) return;

  const atkRoll = DiceSystem.roll(6);
  const dmg = atkRoll + gameState.level;

  enemy.hp -= dmg;

  appendLine(`You attack for ${dmg} damage!`, "battle");
  FXSystem.playSound("attack");

  if (enemy.hp <= 0) {
    endBattle(true);
  } else {
    enemyTurn();
  }
}

function enemyTurn() {
  const enemy = gameState.currentEnemy;
  const dmg = Math.max(1, enemy.attack - Math.floor(gameState.level / 2));

  gameState.hp -= dmg;

  appendLine(`${enemy.name} attacks for ${dmg} damage!`, "battle");
  FXSystem.playSound("enemy_hit");

  if (gameState.hp <= 0) {
    appendLine("You fall in battle...", "error");
    gameState.hp = gameState.maxHp;
    gameState.zone = "hub";
    gameState.subzone = "hub_center";
    appendLine("You awaken in the Central Hub.", "system");
    endBattle(false);
  }

  updateUI();
}

function run() {
  const success = Math.random() > 0.3;

  if (success) {
    appendLine("You flee from battle!", "system");
    FXSystem.playSound("select");
  } else {
    appendLine("You can't escape!", "error");
    enemyTurn();
  }

  endBattle(false);
}

function endBattle(victory) {
  const enemy = gameState.currentEnemy;

  if (victory) {
    appendLine(`Defeated ${enemy.name}!`, "highlight");
    gameState.exp += enemy.exp;
    gameState.data += enemy.data || 5;

    if (enemy.loot) {
      enemy.loot.forEach(item => gameState.inventory.push(item));
      appendLine(`Loot: ${enemy.loot.join(", ")}`, "highlight");
    }

    FXSystem.playVictorySequence();
  }

  gameState.inBattle = false;
  gameState.battleMode = null;
  gameState.currentEnemy = null;

  updateUI();
}

// ============================================================
// [EVENT_HANDLERS] - Input & initialization
// ============================================================

// Note: sendBtn and input handling is now done in GameUI.js
// This code is kept for compatibility with legacy system
if (sendBtn) sendBtn.onclick = handleCommand;

const inputEl = document.getElementById("console-input") || document.getElementById("input");
if (inputEl) {
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") handleCommand();
  });
}

// ============================================================
// [STARTUP] - Initialize on load
// ============================================================

// ============================================================
// LEGACY BOOTSTRAP - DISABLED IN FAVOR OF NEW MODULAR SYSTEM
// ============================================================
// This old bootstrap is now disabled.
// The new system uses GameEngine.js + GameUI.js instead.
// Keep this file for reference/backwards compatibility only.
// ============================================================

// DISABLED: window.addEventListener("load", bootSequence);