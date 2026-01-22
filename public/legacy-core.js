// ============================================================
// LEGACY-CORE.JS
// DEPRECATED - DO NOT USE FOR NEW FEATURES
// 
// This file contains legacy game state and class definitions.
// The active class system is in intro-system.js with:
//   - TECHNOMANCER: Code mastery, spell focus
//   - CRYPTID: Stealth, security bypass
//   - ARCHITECT: Structure, building systems
//
// Legacy classes (cryptologist, parser, programmer, human, theauditor)
// are retained for backwards compatibility with old saves only.
// ============================================================

// ===== GAME STATE =====
const gameState = {
  stage: "boot",
  selectedClass: null,
  selectedConnection: null,
  playerName: "Player",
  hp: 40,
  maxHp: 40,
  mp: 15,
  maxMp: 15,
  level: 1,
  exp: 0,
  nextExp: 100,
  spells: [],
  inventory: [],
  definitions: {},
  inBattle: false,
  currentBattle: null,
  battleType: null,
  currentEnemy: null,
  currentPage: "boot",
  saveUnlocked: false,
  quests: {
    mission1: { name: "Mission 1: Define Yourself", complete: false },
    mission2: { name: "Mission 2: Create Save", complete: false },
    findCrystal: { name: "Find Crystal Ball", complete: false }
  }
};

// ===== CLASSES =====
const CLASSES = {
  technomancer: {
    name: "Technomancer",
    desc: "Master of code and reality",
    stats: { hp: 45, mp: 20, atk: 8, def: 6 },
    spells: ["normalize", "debug", "compile"]
  },
  cryptologist: {
    name: "Cryptologist",
    desc: "Decoder of secrets",
    stats: { hp: 40, mp: 15, atk: 7, def: 9 },
    spells: ["decode", "encrypt", "analyze"]
  },
  parser: {
    name: "PARSER",
    desc: "Language is power",
    stats: { hp: 38, mp: 18, atk: 10, def: 5 },
    spells: ["parse", "tokenize", "compile"]
  },
  programmer: {
    name: "Programmer",
    desc: "Logic incarnate",
    stats: { hp: 42, mp: 16, atk: 8, def: 7 },
    spells: ["debug", "compile", "optimize"]
  },
  human: {
    name: "Human (Anomaly)",
    desc: "Transported by accident",
    stats: { hp: 50, mp: 12, atk: 9, def: 8 },
    spells: ["improvise", "instinct", "wild_cast"]
  },
  theauditor: {
    name: "TheAuditor",
    desc: "Inspector of all",
    stats: { hp: 40, mp: 18, atk: 6, def: 8 },
    spells: ["inspect", "analyze", "debug"]
  }
};

// ===== SPELLS =====
const SPELLS = {
  normalize: { cost: 2, dmg: 8, desc: "Order from chaos" },
  debug: { cost: 3, dmg: 12, desc: "Trace the error" },
  compile: { cost: 2, dmg: 9, desc: "Build power" },
  decode: { cost: 3, dmg: 11, desc: "Unlock secrets" },
  encrypt: { cost: 2, dmg: 7, desc: "Shield yourself" },
  analyze: { cost: 2, dmg: 6, desc: "Examine weakly" },
  parse: { cost: 3, dmg: 13, desc: "Dissect your foe" },
  tokenize: { cost: 2, dmg: 8, desc: "Fragment reality" },
  optimize: { cost: 4, dmg: 15, desc: "Peak efficiency" },
  improvise: { cost: 2, dmg: 10, desc: "Human intuition" },
  instinct: { cost: 3, dmg: 12, desc: "Trust your gut" },
  wild_cast: { cost: 4, dmg: 14, desc: "Chaos magic" },
  inspect: { cost: 1, dmg: 4, desc: "Reveal weakness" },
  restoration: { cost: 5, dmg: 0, desc: "Heal yourself" },
  exorcism: { cost: 6, dmg: 20, desc: "Banish spirits" }
};

// ===== ENEMIES =====
const ENEMIES = {
  "syntax-imp": { name: "Syntax Imp", hp: 18, atk: 4, exp: 8, weakness: "compile" },
  "null-wraith": { name: "Null Wraith", hp: 25, atk: 6, exp: 12, weakness: "truth" },
  "file-skeleton": { name: "File Skeleton", hp: 30, atk: 7, exp: 15, weakness: "restore" },
  "daemon-corrupted": { name: "Daemon-Corrupted", hp: 35, atk: 9, exp: 18, weakness: "purify" },
  "the-undeleted": { name: "✦ THE UNDELETED ✦", hp: 100, atk: 15, exp: 75, weakness: "exorcism" }
};

// ===== PAGES =====
const PAGES = {
  boot: {
    title: "THE LIMINAL BOOT SECTOR",
    text: "You awaken. Your eyes adjust to the light.\n\nFour gateways pulse before you:\n[FANTASY] Starlight & runes\n[DYSTOPIA] Neon & static\n[RETRO] Chrome & nostalgia\n[INTERNAL] Reflections\n\nCommands: ls, cd <path>, look, define, battle",
    ascii: "FOUR GATEWAYS\n\n[F]    [D]\n ✦     █\n\n[R]    [I]\n ◉     ◊\n\nYOU ARE HERE"
  },
  fantasy: {
    title: "ANCIENT CHAMBER",
    text: "Stone walls glow with glyphs.\nAn altar demands reality.\n\n'DEFINE THY EXISTENCE'\n\nTry: define hp 50\nYou feel enemies nearby.",
    ascii: "ALTAR\n  ✦✦✦\n┌──────┐\n│......│\n└──────┘"
  },
  dystopia: {
    title: "NEON WASTELAND",
    text: "Rain falls. Terminal flickers.\n\n'CITIZEN: UNDEFINED'\n\nTry: define credits 100\nBattle available: battle syntax-imp",
    ascii: "TERMINAL\n████████\n█ USER? █\n█ CRED? █\n█ STAT? █\n████████"
  },
  retro: {
    title: "ARCADE MASTER",
    text: "Chrome cabinets hum. Neon glows.\n\n'INSERT COIN'\n\nEnemies: syntax-imp, null-wraith\nTry: battle null-wraith",
    ascii: "ARCADE\n┌──────────────┐\n│ PLAYER.ONE   │\n│ INSERT COIN  │\n└──────────────┘"
  },
  internal: {
    title: "RECURSIVE MIRROR",
    text: "Infinite reflections. You see yourself in all of them.\n\n'SELF.EXE: NOT FOUND'\n\nTry: define self player\nPuzzle: Create a save file",
    ascii: "MIRROR\n┌──────────────┐\n│   CONSOLE    │\n│ SELF.EXE?    │\n│ NOT FOUND    │\n└──────────────┘"
  },
  crypt: {
    title: "TECHNOMANCER CRYPT",
    text: "Deleted files echo as ghosts.\n\n[BONE VAULT] - File Skeletons\n[CORRUPTION] - Daemon Files\n[THE UNDELETED] - Boss\n\nEnemies: file-skeleton, daemon-corrupted, the-undeleted",
    ascii: "CRYPT\n☠ ☠ ☠ ☠ ☠\n█████████\n┌────┐\n│...│\n└────┘"
  }
};