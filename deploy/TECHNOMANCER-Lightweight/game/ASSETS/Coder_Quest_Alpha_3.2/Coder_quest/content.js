// Locations and zone metadata

const Content = {
  startLocation: "hub",

  zoneEmoji: {
    hub: "💠",
    forest: "🌲",
    city: "⚡",
    fantasy: "🏰",
    wasteland: "☣️",
    cosmic: "🌌"
  },

  locations: {
    hub: {
      id: "hub",
      name: "Central Hub",
      zone: "hub",
      description:
        "You stand before the CastConsole, a living command line that responds to your words.\n" +
        "From here, you can route into different zones of the simulation.",
      exits: {
        forest: "forest_edge",
        city: "neon_alley",
        fantasy: "castle_gate",
        wasteland: "ruined_outpost",
        cosmic: "star_platform"
      }
    },

    forest_edge: {
      id: "forest_edge",
      name: "Forest Edge",
      zone: "forest",
      description:
        "Tall trees loom overhead, their branches forming a tangled canopy. The air smells of pine and rain.\n" +
        "The CastConsole interface persists, overlaying this world like a HUD.",
      exits: {
        hub: "hub"
      }
    },

    neon_alley: {
      id: "neon_alley",
      name: "Neon Alley",
      zone: "city",
      description:
        "Neon signs flicker above a narrow alleyway. Holographic ads glitch in and out of existence.\n" +
        "The CastConsole glows brighter here, tuned to the city's data streams.",
      exits: {
        hub: "hub"
      }
    },

    castle_gate: {
      id: "castle_gate",
      name: "Castle Gate",
      zone: "fantasy",
      description:
        "A massive stone gate towers above you, banners fluttering in a wind you cannot feel.\n" +
        "The CastConsole feels almost out of place, yet perfectly functional.",
      exits: {
        hub: "hub"
      }
    },

    ruined_outpost: {
      id: "ruined_outpost",
      name: "Ruined Outpost",
      zone: "wasteland",
      description:
        "Broken metal, scorched earth, and the skeletons of machines long dead. The sky is a dull, toxic haze.\n" +
        "The CastConsole hums quietly, a stable anchor in a broken world.",
      exits: {
        hub: "hub"
      }
    },

    star_platform: {
      id: "star_platform",
      name: "Star Platform",
      zone: "cosmic",
      description:
        "You stand on a platform suspended in a starfield. Gravity is a suggestion.\n" +
        "The CastConsole feels closest to its true nature here.",
      exits: {
        hub: "hub"
      }
    }
  }
};
