// Simple virtual filesystem per zone

const FileSystem = {
  cwd: "/hub",
  tree: {
    "/hub": ["readme.txt", "routes.log"],
    "/forest": ["bark_rune.txt", "whisper.log"],
    "/city": ["neon_adverts.sys", "alley_map.txt"],
    "/fantasy": ["royal_decree.txt", "gate_runes.spell"],
    "/wasteland": ["scrap_notes.txt", "radiation.log"],
    "/cosmic": ["anomaly_report.log", "star_chart.txt"]
  },

  zoneRoot(zone) {
    return "/" + zone;
  },

  setZone(zone) {
    this.cwd = this.zoneRoot(zone);
  },

  ls() {
    return this.tree[this.cwd] || [];
  },

  cat(filename) {
    const files = this.tree[this.cwd] || [];
    if (!files.includes(filename)) return null;

    const zone = this.cwd.replace("/", "") || "hub";

    const lore = {
      hub: {
        "readme.txt":
          "Welcome to Coder Quest.\nUse 'help' to see commands.\nUse 'zones' to see where you can go.",
        "routes.log":
          "Available routes: forest, city, fantasy, wasteland, cosmic.\nUse 'go <zone>' to travel."
      },
      forest: {
        "bark_rune.txt":
          "A rune carved into bark: \"DEFINE TO FIND\".",
        "whisper.log":
          "You hear faint words: \"Summon the dice before you summon the DM.\""
      },
      city: {
        "neon_adverts.sys":
          "Scrolling ads: \"UPGRADE YOUR REALITY. PATCH YOUR SOUL.\"",
        "alley_map.txt":
          "A rough map of the alley. Someone circled a door labeled: LOCALSERVER."
      },
      fantasy: {
        "royal_decree.txt":
          "By order of the Crown: All casters must register their spells.",
        "gate_runes.spell":
          "Runes etched into the gate: \"CAST ATTACK_LOCALSERVER TO SUMMON THE MASTER.\""
      },
      wasteland: {
        "scrap_notes.txt":
          "Scrawled notes: \"Nothing works until the dice are bound.\"",
        "radiation.log":
          "Levels: unsafe.\nRecommendation: don't lick anything."
      },
      cosmic: {
        "anomaly_report.log":
          "Anomalies detected near the star platform. DM presence stronger here.",
        "star_chart.txt":
          "A chart of stars that don't exist. Some are crossed out."
      }
    };

    return lore[zone] && lore[zone][filename]
      ? lore[zone][filename]
      : "(file is empty)";
  }
};
