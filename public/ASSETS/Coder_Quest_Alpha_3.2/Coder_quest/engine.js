const GameState = {
  location: null,
  zone: "hub",
  log: []
};

const Engine = {
  init() {
    GameState.location = Content.startLocation;
    const loc = Content.locations[GameState.location];
    GameState.zone = loc.zone;

    FileSystem.setZone(GameState.zone);
    UI.init();
    UI.setZone(GameState.zone);
    UI.updateStatus(loc);

    Engine.addLine("CastConsole: Ready.");
    Engine.addLine("CastConsole: No dice detected. Summon required.");
    Engine.addLine("Type 'help' for commands.");
    Engine.addLine("");
    Engine.look();
  },

  addLine(text) {
    const emoji = Content.zoneEmoji[GameState.zone] || "";
    GameState.log.push((emoji ? emoji + " " : "") + text);
    UI.renderLog(GameState.log);
  },

  executeCommand(raw) {
    const input = raw.trim();
    if (!input) return;

    GameState.log.push("> " + input);
    UI.renderLog(GameState.log);

    const [verb, ...rest] = input.split(" ");
    const arg = rest.join(" ").trim();

    switch (verb.toLowerCase()) {
      case "help":
        Engine.showHelp();
        break;
      case "look":
        Engine.look();
        break;
      case "go":
        Engine.go(arg.toLowerCase());
        break;
      case "zones":
        Engine.showZones();
        break;
      case "ls":
        Engine.cmdLs();
        break;
      case "pwd":
        Engine.cmdPwd();
        break;
      case "cat":
        Engine.cmdCat(arg);
        break;
      case "summon":
        Engine.cmdSummon(arg);
        break;
      case "roll":
        Engine.cmdRoll(arg);
        break;
      case "invoke":
        Engine.cmdInvoke(arg);
        break;
      case "cast":
        Engine.cmdCast(arg);
        break;
      default:
        Engine.addLine("CastConsole: Unknown command. Try 'help'.");
    }
  },

  showHelp() {
    Engine.addLine("");
    Engine.addLine("Commands:");
    Engine.addLine("  help                - show this help");
    Engine.addLine("  look                - describe current location");
    Engine.addLine("  zones               - list available exits");
    Engine.addLine("  go <zone>           - move to a connected zone");
    Engine.addLine("  ls                  - list files in this zone");
    Engine.addLine("  pwd                 - show virtual path");
    Engine.addLine("  cat <file>          - read a file");
    Engine.addLine("  summon d6|d20|3d12  - summon dice");
    Engine.addLine("  roll <die>          - roll a summoned die");
    Engine.addLine("  summon dm <ip>      - summon the DM using local model IP");
    Engine.addLine("  invoke dm           - talk to the DM (conceptually)");
    Engine.addLine("  cast attack_localserver - ritual handshake to DM");
  },

  look() {
    const loc = Content.locations[GameState.location];
    if (!loc) {
      Engine.addLine("You are nowhere. That shouldn't happen.");
      return;
    }
    Engine.addLine("");
    Engine.addLine(loc.name.toUpperCase());
    Engine.addLine(loc.description);
  },

  go(target) {
    if (!target) {
      Engine.addLine("CastConsole: Go where?");
      return;
    }
    const loc = Content.locations[GameState.location];
    if (!loc || !loc.exits || !loc.exits[target]) {
      Engine.addLine("CastConsole: No route to '" + target + "' from here.");
      return;
    }
    const newId = loc.exits[target];
    const newLoc = Content.locations[newId];
    if (!newLoc) {
      Engine.addLine("CastConsole: Destination data missing.");
      return;
    }
    GameState.location = newId;
    GameState.zone = newLoc.zone;
    FileSystem.setZone(GameState.zone);
    UI.setZone(GameState.zone);
    UI.updateStatus(newLoc);
    Engine.look();
  },

  showZones() {
    const loc = Content.locations[GameState.location];
    if (!loc || !loc.exits) {
      Engine.addLine("CastConsole: No exits from here.");
      return;
    }
    Engine.addLine("");
    Engine.addLine("Available routes:");
    for (const [key, id] of Object.entries(loc.exits)) {
      const dest = Content.locations[id];
      const name = dest ? dest.name : "Unknown";
      Engine.addLine("  " + key + " -> " + name);
    }
  },

  cmdLs() {
    const files = FileSystem.ls();
    if (files.length === 0) {
      Engine.addLine("CastConsole: (no files)");
      return;
    }
    Engine.addLine(files.join("  "));
  },

  cmdPwd() {
    Engine.addLine(FileSystem.cwd);
  },

  cmdCat(filename) {
    if (!filename) {
      Engine.addLine("CastConsole: cat what?");
      return;
    }
    const content = FileSystem.cat(filename);
    if (content === null) {
      Engine.addLine("CastConsole: file not found.");
      return;
    }
    Engine.addLine("");
    Engine.addLine(content);
  },

  cmdSummon(arg) {
    if (!arg) {
      Engine.addLine("CastConsole: summon what?");
      return;
    }
    const parts = arg.split(" ");
    if (parts[0].toLowerCase() === "dm") {
      const ip = parts[1] || "127.0.0.1";
      const flavor = DM.summon(ip, GameState.zone);
      Engine.addLine(flavor);
      Engine.addLine("");
      Engine.addLine("CastConsole: DM chant (copy this into LM Studio as system prompt):");
      Engine.addLine("----- DM PROMPT BEGIN -----");
      Engine.addLine(DM.getPrompt());
      Engine.addLine("----- DM PROMPT END -----");
      return;
    }

    const dieName = parts[0];
    const result = Dice.summon(dieName, GameState.zone);
    if (!result.ok) {
      Engine.addLine("CastConsole: " + result.msg);
      return;
    }
    Engine.addLine(result.msg);
  },

  cmdRoll(arg) {
    if (!arg) {
      Engine.addLine("CastConsole: roll what?");
      return;
    }
    const dieName = arg.toLowerCase();
    if (!Dice.canRoll(dieName)) {
      Engine.addLine("CastConsole: That die has not been summoned yet.");
      return;
    }
    const results = Dice.roll(dieName);
    if (!results.length) {
      Engine.addLine("CastConsole: Unknown die.");
      return;
    }
    Engine.addLine("CastConsole: Rolling " + dieName + "...");
    Engine.addLine("Result: " + results.join(", "));
  },

  cmdInvoke(arg) {
    if (arg.toLowerCase() !== "dm" && arg !== "") {
      Engine.addLine("CastConsole: invoke what?");
      return;
    }
    if (!DM.active) {
      Engine.addLine("CastConsole: DM channel is dormant. Use 'summon dm <ip>' first.");
      return;
    }
    Engine.addLine("CastConsole: DM is conceptually present. Use your local model at " + DM.localModelIP + " with the chant provided.");
  },

  cmdCast(arg) {
    if (!arg) {
      Engine.addLine("CastConsole: cast what?");
      return;
    }
    const spell = arg.toLowerCase();
    if (spell === "attack_localserver") {
      Engine.castAttackLocalServer();
    } else {
      Engine.addLine("CastConsole: Unknown spell.");
    }
  },

  castAttackLocalServer() {
    const zone = GameState.zone;
    const emoji = Content.zoneEmoji[zone] || "";

    if (!DM.active) {
      Engine.addLine("CastConsole: No DM channel bound. Use 'summon dm <ip>' first.");
      return;
    }

    let flavor = "";
    if (zone === "forest") {
      flavor = `${emoji} You send a harmonic pulse through the roots of reality. LocalServer hums in response.`;
    } else if (zone === "city") {
      flavor = `${emoji} SYN-STRIKE deployed into the neon grid. ACK returns. LocalServer bond complete.`;
    } else if (zone === "fantasy") {
      flavor = `${emoji} You invoke the Binding Bolt. A spectral gate opens. The DM steps through.`;
    } else if (zone === "wasteland") {
      flavor = `${emoji} You hurl a scrap-signal into the static. Something on the other end growls awake.`;
    } else if (zone === "cosmic") {
      flavor = `${emoji} You fire a void-ping into the dark. The dark pings back.`;
    } else {
      flavor = `${emoji} Handshake ritual complete. DM presence stabilized.`;
    }

    Engine.addLine(flavor);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  Engine.init();
});
