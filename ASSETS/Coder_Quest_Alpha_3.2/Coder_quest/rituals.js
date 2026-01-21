// Ritual definitions and handling

const Rituals = {
  definitions: {
    awaken_terminal: {
      id: "awaken_terminal",
      name: "Awaken the Terminal",
      description: "Bring the dormant mossweave terminal fully online.",
      steps: [
        { action: "log", text: "You speak the word into the dark: AWAKEN." },
        { action: "wait", ms: 400 },
        { action: "log", text: "The glass hums. Mosslight stirs beneath the surface." },
        { action: "effect", type: "crt_flash" },
        { action: "unlock_codex", id: "terminal_awakened" },
        { action: "unlock_ritual", id: "attune_gemstone" },
        { action: "set_flag", key: "terminal_awake", value: true },
        { action: "set_mode", mode: "ONLINE" },
        { action: "log", text: "The Technomancer Codex is now online." },
        { action: "log", text: "Type 'help' to see what you can do." }
      ]
    },

    attune_gemstone: {
      id: "attune_gemstone",
      name: "Attune the Gemstone Cursor",
      description: "Bind your focus to the cursor of light.",
      steps: [
        { action: "log", text: "You focus on the faint gemstone glow at the edge of the screen." },
        { action: "wait", ms: 300 },
        { action: "log", text: "It pulses in time with your breath." },
        { action: "unlock_codex", id: "gemstone_cursor" },
        { action: "learn_spell", id: "glimmer" }
      ]
    }
  },

  active: null,
  queue: [],

  trigger(id) {
    const ritual = this.definitions[id];
    if (!ritual) {
      Engine.logLine("The pattern for that ritual is unknown.");
      return;
    }
    Engine.unlockRitual(id);
    this.runRitual(ritual);
  },

  runRitual(ritual) {
    let index = 0;
    const steps = ritual.steps;

    const next = () => {
      if (index >= steps.length) return;
      const step = steps[index++];
      this.executeStep(step, next);
    };

    next();
  },

  executeStep(step, done) {
    switch (step.action) {
      case "log":
        Engine.logLine(step.text || "");
        done();
        break;
      case "wait":
        setTimeout(done, step.ms || 300);
        break;
      case "effect":
        if (step.type === "crt_flash") {
          const screen = document.getElementById("terminal-screen");
          if (screen) {
            screen.style.boxShadow = "0 0 40px rgba(160, 255, 200, 0.9)";
            setTimeout(() => {
              screen.style.boxShadow = "";
            }, 200);
          }
        }
        done();
        break;
      case "unlock_codex":
        Engine.unlockCodex(step.id);
        done();
        break;
      case "unlock_ritual":
        Engine.unlockRitual(step.id);
        done();
        break;
      case "learn_spell":
        Engine.learnSpell(step.id);
        done();
        break;
      case "set_flag":
        GameState.flags[step.key] = step.value;
        done();
        break;
      case "set_mode":
        GameState.mode = step.mode;
        done();
        break;
      default:
        done();
    }
  },

  tryHandleCommand(input) {
    // Simple hook: allow "perform <ritual>" or "ritual <id>"
    const trimmed = input.trim().toLowerCase();
    if (trimmed.startsWith("perform ")) {
      const id = trimmed.slice("perform ".length).trim();
      if (this.definitions[id]) {
        this.trigger(id);
        return true;
      }
    }
    if (trimmed.startsWith("ritual ")) {
      const id = trimmed.slice("ritual ".length).trim();
      if (this.definitions[id]) {
        this.trigger(id);
        return true;
      }
    }
    return false;
  }
};
