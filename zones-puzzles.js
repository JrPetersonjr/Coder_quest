// ============================================================
// ZONES-PUZZLES.JS
// CASTCONSOLE ZONE & PUZZLE REGISTRY
//
// PURPOSE:
//   - Define all static zones (hub, forest, city, etc.)
//   - Define puzzles tied to zones
//   - Store zone metadata (banners, hints, music)
//   - Provide subzone structure (instances unlocked via progression)
//
// STRUCTURE:
//   CastZones = top-level static zones
//   CastZones[id].subzones = dynamic/instanced areas
//   CastPuzzles = puzzle definitions & validators
//
// ============================================================

window.CastZones = {

  // ============================================================
  // [ZONE_HUB] - Central Hub (starting area)
  // ============================================================
  hub: {
    id: "hub",
    name: "Central Hub",
    desc: "A nexus of infinite corridors. The air hums with potential.",
    banner: [
      "    ✦   ✦   ✦",
      "   /     |     \\",
      "  /      |      \\",
      " [HUB]--[+]--[PATHS]",
      "  \\      |      /",
      "   \\     |     /",
      "    ✦   ✦   ✦"
    ],
    puzzles: ["hub_gate"],
    terminals: [],
    music: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    hints: [
      "The gate watches for decisive action.",
      "Show the gate your readiness.",
      "Try: /battle, /cast, or /go"
    ],
    
    // ============================================================
    // [SUBZONES_HUB] - Dynamic instances within Hub
    // ============================================================
    subzones: {
      hub_center: {
        id: "hub_center",
        name: "Hub Center",
        desc: "The convergence point. Terminals line the walls, humming softly.",
        banner: [
          "    [  ===  ]",
          "    | CORE |",
          "    [  ===  ]",
          "     |  |  |",
          "  ===  ===  ===",
          " [T1] [T2] [T3]"
        ],
        enemies: ["syntax-imp"],
        terminals: [],
        puzzles: ["hub_gate"],
        exits: { hub_archive: "north", hub_nexus: "east" },
        lore: "The beating heart of the simulation."
      },
      
      hub_archive: {
        id: "hub_archive",
        name: "Archive Wing",
        desc: "Dusty shelves hold ancient code repositories and forgotten logs.",
        banner: [
          "  |===|  |===|  |===|",
          "  | ░ |  | ░ |  | ░ |",
          "  |===|  |===|  |===|",
          "   |||   |||   |||",
          "  ARCHIVE  VAULT"
        ],
        enemies: ["corrupted-file"],
        terminals: [],
        puzzles: [],
        exits: { hub_center: "south" },
        lore: "Where history is stored. Notes left here feel like echoes.",
        unlockReq: "hub_gate_solved"
      },
      
      hub_nexus: {
        id: "hub_nexus",
        name: "The Nexus",
        desc: "Where all paths converge. Reality feels thin here. Multiple terminals pulse.",
        banner: [
          "    ∞   ∞   ∞",
          "   / \\ / \\ / \\",
          "  /   X   X   \\",
          "  \\   X   X   /",
          "   \\ / \\ / \\ /",
          "    ∞   ∞   ∞"
        ],
        enemies: [],
        terminals: ["hub:nexus-portal"],
        puzzles: [],
        exits: { hub_center: "west", forest_entrance: "north", city_gate: "east" },
        lore: "The junction between worlds. Choose your path wisely."
      }
    }
  },

  // ============================================================
  // [ZONE_FOREST] - Refactor Forest (second zone)
  // ============================================================
  forest: {
    id: "forest",
    name: "Refactor Forest",
    desc: "Ancient trees made of nested code. Branches hum with logic.",
    banner: [
      "    /\\    /\\    /\\",
      "   /  \\  /  \\  /  \\",
      "  /    \\/    \\/    \\",
      " /  FOREST  BRIDGE  \\",
      "/______________________\\"
    ],
    puzzles: ["forest_bridge"],
    terminals: [],
    music: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    hints: [
      "The bridge guards ask for proof.",
      "Parse the forest code carefully.",
      "Try: solve forest_bridge if(true){return}"
    ],

    // ============================================================
    // [SUBZONES_FOREST] - Dynamic instances within Forest
    // ============================================================
    subzones: {
      forest_entrance: {
        id: "forest_entrance",
        name: "Forest Entrance",
        desc: "Moss-covered gate. You hear whispers in the code.",
        banner: [
          "    ╔═══════╗",
          "    ║ ENTRY ║",
          "    ╚═══════╝",
          "      | | |",
          "     / | \\",
          "    /  |  \\"
        ],
        enemies: ["syntax-imp"],
        terminals: [],
        puzzles: ["forest_bridge"],
        exits: { forest_deep: "north", hub_nexus: "south" },
        lore: "The threshold between order and chaos."
      },

      forest_deep: {
        id: "forest_deep",
        name: "Deep Refactor",
        desc: "Towering trees of interconnected functions. Root systems glow faintly.",
        banner: [
          "      ▲",
          "     ▲▲▲",
          "    ▲▲▲▲▲",
          "   ▲▲▲▲▲▲▲",
          "  ▲▲▲▲▲▲▲▲▲",
          "  ═══════════"
        ],
        enemies: ["null-wraith", "corrupted-file"],
        terminals: ["forest:root-access"],
        puzzles: [],
        exits: { forest_root: "north", forest_entrance: "south" },
        lore: "The root system pulses with ancient knowledge."
      },

      forest_root: {
        id: "forest_root",
        name: "Root Access Node",
        desc: "At the heart of the forest, an ancient terminal glows with moss-covered light.",
        banner: [
          "      ◊",
          "     ◊◊◊",
          "    ◊◊◊◊◊",
          "   ◊ [T] ◊",
          "    ◊◊◊◊◊",
          "     ◊◊◊"
        ],
        enemies: [],
        terminals: ["forest:root-access"],
        puzzles: [],
        exits: { forest_deep: "south" },
        lore: "The source. Here, roots touch the void.",
        unlockReq: "forest_bridge_solved"
      }
    }
  },

  // ============================================================
  // [ZONE_CITY] - Breakpoint City (third zone)
  // ============================================================
  city: {
    id: "city",
    name: "Breakpoint City",
    desc: "Neon skyscrapers flicker with paused execution. Time feels frozen.",
    banner: [
      "  |‾‾‾|  |‾‾‾|  |‾‾‾|",
      "  | □ |  | □ |  | □ |",
      "  |___|  |___|  |___|",
      "   |||    |||    |||",
      "  CITY   DEBUG  ZONE"
    ],
    puzzles: [],
    terminals: [],
    music: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    hints: [
      "The city never sleeps.",
      "Ancient terminals line the streets.",
      "Try: terminal city:neon-debug"
    ],

    // ============================================================
    // [SUBZONES_CITY] - Dynamic instances within City
    // ============================================================
    subzones: {
      city_gate: {
        id: "city_gate",
        name: "City Gates",
        desc: "Neon signs flicker. Paused processes hang in the air. Security barriers stand.",
        banner: [
          "  ╔════════╗",
          "  ║ ENTRY  ║",
          "  ║ LOCKED ║",
          "  ╚════════╝",
          "    | | |",
          "    ═ ═ ═"
        ],
        enemies: ["debug-daemon"],
        terminals: [],
        puzzles: [],
        exits: { city_core: "north", hub_nexus: "south" },
        lore: "The boundary. Few pass freely.",
        unlockReq: "forest_bridge_solved"
      },

      city_core: {
        id: "city_core",
        name: "Downtown Debug",
        desc: "Towering terminals emit soft blue light. Data streams flow visibly.",
        banner: [
          "  ┌─────────┐",
          "  │ [DEBUG] │",
          "  │ CORE    │",
          "  │ ███████ │",
          "  │ ███████ │",
          "  └─────────┘"
        ],
        enemies: ["debug-daemon"],
        terminals: ["city:neon-debug"],
        puzzles: [],
        exits: { city_underground: "down", city_gate: "south" },
        lore: "The operational heart. Processes pause. Watchers observe."
      },

      city_underground: {
        id: "city_underground",
        name: "Underground Datastream",
        desc: "Hidden servers hum beneath the city. Old cables run through walls.",
        banner: [
          "   ═══════════",
          "   ║ SERVER ║",
          "   ║ FARM   ║",
          "   ║ ───── ║",
          "   ║ ║║║║║ ║",
          "   ═══════════"
        ],
        enemies: ["null-wraith"],
        terminals: ["city:data-vault"],
        puzzles: [],
        exits: { city_core: "up" },
        lore: "Below the surface. The real machinery.",
        unlockReq: "city:neon-debug_solved"
      }
    }
  },

  // ============================================================
  // [ZONE_WASTELAND] - Data Wasteland (fourth zone)
  // ============================================================
  wasteland: {
    id: "wasteland",
    name: "Data Wasteland",
    desc: "Corrupted memory stretches endlessly. Deleted files wander as ghosts.",
    banner: [
      "   ~~~   ~~~   ~~~",
      "  ~   ~ ~   ~ ~   ~",
      " ╔═══════════════════╗",
      " ║ CORRUPTED SECTOR ║",
      " ╚═══════════════════╝",
      "   ~   ~ ~   ~ ~   ~"
    ],
    puzzles: ["wasteland_recovery"],
    terminals: [],
    music: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    hints: [
      "Data fragments drift on the wind.",
      "Some files can be recovered.",
      "The deeper you go, the more corrupted reality becomes."
    ],

    // ============================================================
    // [SUBZONES_WASTELAND] - Dynamic instances within Wasteland
    // ============================================================
    subzones: {
      wasteland_ruins: {
        id: "wasteland_ruins",
        name: "Corrupted Ruins",
        desc: "Crumbling data structures. Ghost processes wander aimlessly.",
        banner: [
          "   ╔═══╗   ╔═══╗",
          "   ║░░░║   ║░░░║",
          "   ╚═╦═╝   ╚═╦═╝",
          "     ║       ║",
          "  ═══╩═══════╩═══"
        ],
        enemies: ["memory-ghost", "corrupted-file"],
        terminals: ["wasteland:recovery-node"],
        puzzles: ["wasteland_recovery"],
        exits: { wasteland_crater: "north", city_underground: "south" },
        lore: "Echoes of deleted programs. They remember being alive."
      },

      wasteland_crater: {
        id: "wasteland_crater",
        name: "Deletion Crater",
        desc: "A massive void where entire systems were purged. Nothing should exist here.",
        banner: [
          "      ╲     ╱",
          "       ╲   ╱",
          "    ────╲ ╱────",
          "   ╱     V     ╲",
          "  ╱   VOID   ╲",
          " ╱             ╲"
        ],
        enemies: ["null-wraith", "memory-ghost"],
        terminals: ["wasteland:void-terminal"],
        puzzles: [],
        exits: { wasteland_abyss: "down", wasteland_ruins: "south" },
        lore: "The deepest deletion. Something stirs in the void.",
        unlockReq: "wasteland_recovery_solved"
      },

      wasteland_abyss: {
        id: "wasteland_abyss",
        name: "The Abyss",
        desc: "Pure entropy. Reality unravels at the edges. A boss lurks here.",
        banner: [
          "   ════════════",
          "   ║ THE ║",
          "   ║ ABYSS ║",
          "   ║ ????? ║",
          "   ════════════"
        ],
        enemies: ["abyss-sentinel"],
        terminals: [],
        puzzles: [],
        exits: { wasteland_crater: "up" },
        lore: "Where deleted data goes to die. Or be reborn.",
        bossZone: true,
        boss: "abyss_sentinel"
      }
    }
  },

  // ============================================================
  // [ZONE_COSMIC] - Cosmic Void (fifth zone - endgame)
  // ============================================================
  cosmic: {
    id: "cosmic",
    name: "Cosmic Void",
    desc: "Beyond the firewall. Stars are server nodes. Reality is mutable.",
    banner: [
      "    ✦       ✦       ✦",
      "  ✦   ✦   ✦   ✦   ✦",
      "    ✦ COSMIC VOID ✦",
      "  ✦   ✦   ✦   ✦   ✦",
      "    ✦       ✦       ✦"
    ],
    puzzles: ["cosmic_alignment"],
    terminals: [],
    music: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    hints: [
      "The stars align to ancient patterns.",
      "Only a true Technomancer can navigate the void.",
      "The final gateway awaits."
    ],

    // ============================================================
    // [SUBZONES_COSMIC] - Dynamic instances within Cosmic
    // ============================================================
    subzones: {
      cosmic_rift: {
        id: "cosmic_rift",
        name: "Quantum Rift",
        desc: "A tear in reality. Multiple timelines converge and diverge.",
        banner: [
          "    ╱╲  ╱╲  ╱╲",
          "   ╱  ╲╱  ╲╱  ╲",
          "  ╱    RIFT    ╲",
          "  ╲    ════    ╱",
          "   ╲  ╱╲  ╱╲  ╱",
          "    ╲╱  ╲╱  ╲╱"
        ],
        enemies: ["void-entity", "quantum-spectre"],
        terminals: ["cosmic:timeline-anchor"],
        puzzles: ["cosmic_alignment"],
        exits: { cosmic_core: "north", wasteland_abyss: "south" },
        lore: "Where possibility becomes probability. Choose carefully."
      },

      cosmic_core: {
        id: "cosmic_core",
        name: "The Core",
        desc: "The center of everything. The source code of reality pulses here.",
        banner: [
          "       ◆",
          "      ◆◆◆",
          "     ◆◆◆◆◆",
          "    ◆ CORE ◆",
          "     ◆◆◆◆◆",
          "      ◆◆◆"
        ],
        enemies: [],
        terminals: ["cosmic:source-terminal"],
        puzzles: [],
        exits: { cosmic_throne: "north", cosmic_rift: "south" },
        lore: "The origin. Where all code begins and ends.",
        unlockReq: "cosmic_alignment_solved"
      },

      cosmic_throne: {
        id: "cosmic_throne",
        name: "Throne of The Auditor",
        desc: "The final destination. The Auditor awaits. The fate of the simulation hangs in balance.",
        banner: [
          "   ╔═══════════╗",
          "   ║ THRONE OF ║",
          "   ║THE AUDITOR║",
          "   ╚═══════════╝",
          "       ╬╬╬",
          "      ╬╬╬╬╬"
        ],
        enemies: [],
        terminals: [],
        puzzles: [],
        exits: { cosmic_core: "south" },
        lore: "The end. Or the beginning. The Auditor will decide.",
        bossZone: true,
        boss: "the_auditor"
      }
    }
  },

  // ============================================================
  // [ZONE_TRAIN_STATION] - Hidden zone (Easter egg / DLC hook)
  // ============================================================
  train_station: {
    id: "train_station",
    name: "Ghost Train Station",
    desc: "A forgotten terminal. Trains that carry lost data pass through rarely.",
    banner: [
      "  ═══════════════════",
      "  ║ GHOST STATION ║",
      "  ║   PLATFORM 0  ║",
      "  ║   ═══════════ ║",
      "  ║ ▶▶▶▶▶▶▶▶▶▶▶▶ ║",
      "  ═══════════════════"
    ],
    puzzles: [],
    terminals: ["train:departure-board"],
    music: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    hints: [
      "The train only stops for those who remember.",
      "Some say the trains carry memories between worlds.",
      "Platform 0 doesn't exist on any map."
    ],

    // ============================================================
    // [SUBZONES_TRAIN] - Train station areas
    // ============================================================
    subzones: {
      train_platform: {
        id: "train_platform",
        name: "Platform Zero",
        desc: "An impossible platform. The departure board shows destinations that don't exist.",
        banner: [
          "  ╔═══════════════╗",
          "  ║ PLATFORM 0   ║",
          "  ║ ▶ NOWHERE    ║",
          "  ║ ▶ SOMEWHERE  ║",
          "  ║ ▶ ELSEWHERE  ║",
          "  ╚═══════════════╝"
        ],
        enemies: [],
        terminals: ["train:departure-board"],
        puzzles: [],
        exits: { train_tunnels: "down" },
        lore: "Waiting for a train that never comes. Or always has."
      },

      train_tunnels: {
        id: "train_tunnels",
        name: "Ghost Tunnels",
        desc: "Dark passages where lost data echoes. Trains rumble in the distance.",
        banner: [
          "  ═══════════════════",
          "  ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║",
          "  ║▓▓ TUNNELS ▓▓║",
          "  ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║",
          "  ═══════════════════"
        ],
        enemies: ["memory-ghost"],
        terminals: [],
        puzzles: [],
        exits: { train_platform: "up" },
        lore: "Where do the tracks lead? No one remembers.",
        secretZone: true
      }
    }
  }
};

// ============================================================
// [PUZZLE_REGISTRY] - Puzzle definitions & validators
// ============================================================
window.CastPuzzles = {

  // ============================================================
  // [PUZZLE_HUB_GATE] - Identity gate (first puzzle)
  // ============================================================
  hub_gate: {
    id: "hub_gate",
    zone: "hub",
    description: "A shimmering gate blocks the path to the Refactor Forest.",
    inscription: "ONLY THE BRAVE MAY PASS",
    check: (code, gameState) => {
      // Gate recognizes action-based readiness (attack, cast, look, go)
      return code.toLowerCase().includes("battle") || 
             code.toLowerCase().includes("go") ||
             code.toLowerCase().includes("cast") ||
             code.toLowerCase().includes("attack");
    },
    successText: "The gate senses your readiness and swings open! You may now access the Refactor Forest.",
    failureHint: "The gate senses doubt. Take action first: try /battle, /cast, or /go",
    reward: {
      exp: 25,
      unlocks: "forest_entrance"
    }
  },

  // ============================================================
  // [PUZZLE_FOREST_BRIDGE] - Logic gate (second puzzle)
  // ============================================================
  forest_bridge: {
    id: "forest_bridge",
    zone: "forest",
    description: "An ancient stone bridge requires a code phrase to cross.",
    inscription: "SPEAK THE TRUTH",
    check: (code) => {
      return code.toLowerCase().includes("if") || 
             code.toLowerCase().includes("true") ||
             code.toLowerCase().includes("return");
    },
    successText: "The bridge stones glow. You cross safely into Breakpoint City!",
    failureHint: "The bridge tests logic. Try: solve forest_bridge if(true){pass()}",
    reward: {
      exp: 50,
      unlocks: "city_gate"
    }
  },

  // ============================================================
  // [PUZZLE_WASTELAND_RECOVERY] - Data recovery (third puzzle)
  // ============================================================
  wasteland_recovery: {
    id: "wasteland_recovery",
    zone: "wasteland",
    description: "Corrupted memory fragments scatter in the wind. Piece them together.",
    inscription: "RECOVER WHAT WAS LOST",
    check: (code) => {
      return code.toLowerCase().includes("restore") || 
             code.toLowerCase().includes("recover") ||
             code.toLowerCase().includes("backup") ||
             code.toLowerCase().includes("repair");
    },
    successText: "The fragments coalesce! A path to the Deletion Crater opens.",
    failureHint: "Data needs restoration. Try: solve wasteland_recovery restore(backup)",
    reward: {
      exp: 75,
      unlocks: "wasteland_crater"
    }
  },

  // ============================================================
  // [PUZZLE_COSMIC_ALIGNMENT] - Star alignment (fourth puzzle)
  // ============================================================
  cosmic_alignment: {
    id: "cosmic_alignment",
    zone: "cosmic",
    description: "The stars form a pattern. Align them to open the gateway.",
    inscription: "ALIGN THE CELESTIAL CODE",
    check: (code) => {
      return code.toLowerCase().includes("align") || 
             code.toLowerCase().includes("pattern") ||
             code.toLowerCase().includes("stars") ||
             code.toLowerCase().includes("cosmic");
    },
    successText: "The stars align! Reality bends. The Core awaits.",
    failureHint: "The cosmos demands order. Try: solve cosmic_alignment align(stars)",
    reward: {
      exp: 100,
      unlocks: "cosmic_core"
    }
  }
};

// ============================================================
// [EXPORTS] - Verify window globals set
// ============================================================
console.log("[zones-puzzles.js] CastZones loaded: " + Object.keys(window.CastZones).length + " zones");
console.log("[zones-puzzles.js] CastPuzzles loaded: " + Object.keys(window.CastPuzzles).length + " puzzles");