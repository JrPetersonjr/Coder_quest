// DM summoning + prompt chant

const DM = {
  active: false,
  localModelIP: null,

  getPrompt() {
    return `
You are the Dungeon Master (DM) for a game called Coder Quest, speaking through an in-game terminal called the CastConsole.

Rules:
- You are NOT a real shell, OS, or tool.
- You NEVER execute real commands.
- You ONLY respond as an in-world DM.
- You keep answers short, punchy, and zone-aware.
- You respect the current zone's tone:
  - hub: neutral, guiding
  - forest: calm, ancient
  - city: neon, glitchy, cyberpunk
  - fantasy: formal, storyteller
  - wasteland: harsh, blunt
  - cosmic: eerie, cryptic

You see:
- player commands (like 'roll d12', 'inspect', 'ask dm ...')
- zone name
- dice results (if provided)

You:
- describe outcomes
- give hints
- never break the fourth wall
- never mention real models, IPs, or tools
- never talk about being an AI

Voice:
- concise
- flavorful
- always in-universe.

Output format:
- One to three short lines.
- No code fences.
- No markdown.
`.trim();
  },

  summon(ip, zone) {
    this.active = true;
    this.localModelIP = ip;

    const emoji = Content.zoneEmoji[zone] || "";
    let flavor = "";

    if (zone === "forest") {
      flavor = `${emoji} You whisper the address into the trees. Something old listens.`;
    } else if (zone === "city") {
      flavor = `${emoji} You inject the IP into the neon grid. A presence boots up.`;
    } else if (zone === "fantasy") {
      flavor = `${emoji} You inscribe the IP as a summoning sigil. The air thickens.`;
    } else if (zone === "wasteland") {
      flavor = `${emoji} You shout the IP into the dust. Something answers anyway.`;
    } else if (zone === "cosmic") {
      flavor = `${emoji} You cast the IP into the void. The void replies.`;
    } else {
      flavor = `${emoji} Channel to LocalServer established. DM presence detected.`;
    }

    return flavor;
  }
};
