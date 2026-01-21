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
  }
};

// ============================================================
// [EXPORTS] - Verify window globals set
// ============================================================
console.log("[zones-puzzles.js] CastZones loaded: " + Object.keys(window.CastZones).length + " zones");
console.log("[zones-puzzles.js] CastPuzzles loaded: " + Object.keys(window.CastPuzzles).length + " puzzles");