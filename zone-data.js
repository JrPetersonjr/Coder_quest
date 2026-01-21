// Zone data - comprehensive zone definitions for TECHNOMANCER
const CastZones = {
  hub: {
    name: "Central Hub",
    description: "A nexus of infinite corridors. The air hums with potential.",
    banner: ["    ✦   ✦   ✦", "   /     |     \\", "  /      |      \\", " [HUB]--[+]--[PATHS]", "  \\      |      /", "   \\     |     /", "    ✦   ✦   ✦"],
    emoji: "💠"
  },
  forest: {
    name: "Refactor Forest",
    description: "Ancient trees made of nested code. Branches hum with logic.",
    banner: ["    /\\    /\\    /\\", "   /  \\  /  \\  /  \\", "  /    \\/    \\/    \\", " /  FOREST  BRIDGE  \\", "/______________________\\"],
    emoji: "🌲"
  },
  city: {
    name: "Breakpoint City",
    description: "Neon skyscrapers flicker with paused execution. Time feels frozen.",
    banner: ["  |‾‾‾|  |‾‾‾|  |‾‾‾|", "  | □ |  | □ |  | □ |", "  |___|  |___|  |___|", "   |||    |||    |||", "  CITY   DEBUG  ZONE"],
    emoji: "⚡"
  },
  wasteland: {
    name: "Wasteland",
    description: "A barren desert of sand and ruins. The wind howls over forgotten relics.",
    banner: ["   ~ ~ ~ ~ ~ ~ ~", "  /   SAND   ", " /   WASTELAND  ", "|_______________|"],
    emoji: "☣️"
  },
  train_station: {
    name: "Ruined Train Station",
    description: "A shattered station, rails twisted and trains abandoned. Echoes of journeys lost.",
    banner: ["   |====|   |====|", "  [TRAIN] [STATION]", "   |____|   |____|"],
    emoji: "🚉"
  }
};

// Legacy alias for compatibility
const zones = CastZones;

console.log("[zone-data.js] CastZones loaded with " + Object.keys(CastZones).length + " zones");
