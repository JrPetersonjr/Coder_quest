// ============================================================
// COMMAND-HANDLERS.JS
// CUSTOM COMMAND SYSTEM FOR GAME ENGINE
//
// PURPOSE:
//   - Extend GameEngine with additional commands
//   - Handle tutorial commands
//   - Provide extensible command registration
//   - Bridge between UI and specialized systems
//
// ============================================================

window.CommandHandlers = {
  // ============================================================
  // [REGISTRY] - Store command handlers
  // ============================================================
  registry: {},

  // ============================================================
  // [REGISTRATION] - Add custom commands
  // ============================================================

  /**
   * Register a custom command handler
   */
  register(commandName, handler, description = "") {
    this.registry[commandName.toLowerCase()] = {
      handler,
      description,
      name: commandName,
    };
    console.log(`[CommandHandlers] Registered: ${commandName}`);
  },

  /**
   * Execute a registered command
   */
  execute(commandName, args, gameEngine) {
    const cmd = this.registry[commandName.toLowerCase()];
    if (!cmd) {
      return false; // Command not registered
    }

    try {
      cmd.handler(args, gameEngine);
      return true;
    } catch (e) {
      console.error(`[CommandHandlers] Error in ${commandName}:`, e);
      gameEngine.output(`Error: ${e.message}`, "error");
      return true; // Handled, but with error
    }
  },

  /**
   * Check if command is registered
   */
  isRegistered(commandName) {
    return this.registry[commandName.toLowerCase()] !== undefined;
  },

  /**
   * Get all registered commands
   */
  getAll() {
    return Object.values(this.registry);
  },

  // ============================================================
  // [BUILT-IN_COMMANDS] - Standard game commands
  // ============================================================

  /**
   * Tutorial command
   */
  tutorialCommand(args, gameEngine) {
    if (!window.TutorialSystem) {
      gameEngine.output("Tutorial system not initialized", "error");
      return;
    }

    const subcommand = args[0]?.toLowerCase() || "show";

    switch (subcommand) {
      case "start":
      case "begin":
        TutorialSystem.start();
        break;

      case "next":
        TutorialSystem.nextStep();
        break;

      case "skip":
        TutorialSystem.skip();
        break;

      case "hint":
        TutorialSystem.showHint(args[1] || "stuck");
        break;

      case "status":
        const status = TutorialSystem.getStatus();
        gameEngine.output("", "system");
        gameEngine.output("TUTORIAL STATUS:", "system");
        gameEngine.output(`  Completed: ${status.completed}`, "hint");
        gameEngine.output(`  Skipped: ${status.skipped}`, "hint");
        gameEngine.output(`  Progress: ${status.progress}`, "hint");
        gameEngine.output(`  Commands: ${status.commandCount}`, "hint");
        gameEngine.output(`  Hard Mode: ${status.hardMode ? "ON" : "OFF"}`, "hint");
        gameEngine.output("", "system");
        break;

      case "hardmode":
        TutorialSystem.state.hardMode = !TutorialSystem.state.hardMode;
        gameEngine.output(
          `Hard mode: ${TutorialSystem.state.hardMode ? "ENABLED (no hints)" : "DISABLED"}`,
          "system"
        );
        break;

      default:
        gameEngine.output("", "system");
        gameEngine.output("TUTORIAL COMMANDS:", "system");
        gameEngine.output("  tutorial start    - Begin tutorial", "hint");
        gameEngine.output("  tutorial next     - Show next lesson", "hint");
        gameEngine.output("  tutorial skip     - Skip tutorial", "hint");
        gameEngine.output("  tutorial hint     - Get a hint", "hint");
        gameEngine.output("  tutorial status   - Check progress", "hint");
        gameEngine.output("  tutorial hardmode - Toggle hard mode", "hint");
        gameEngine.output("", "system");
    }
  },

  /**
   * System info command
   */
  systemCommand(args, gameEngine) {
    const subcommand = args[0]?.toLowerCase() || "info";

    switch (subcommand) {
      case "info":
      case "status":
        gameEngine.output("", "system");
        gameEngine.output("=".repeat(50), "system");
        gameEngine.output("SYSTEM STATUS", "system");
        gameEngine.output("=".repeat(50), "system");
        gameEngine.output("", "system");

        // Game engine
        gameEngine.output("Game Engine: ✓ ACTIVE", "hint");
        gameEngine.output(`  Zone: ${gameEngine.gameState.zone}`, "hint");
        gameEngine.output(`  Level: ${gameEngine.gameState.level}`, "hint");
        gameEngine.output(`  HP: ${gameEngine.gameState.hp}/${gameEngine.gameState.maxHp}`, "hint");
        gameEngine.output(`  MP: ${gameEngine.gameState.mp}/${gameEngine.gameState.maxMp}`, "hint");

        // Audio system
        if (gameEngine.audioSystem) {
          gameEngine.output("", "system");
          gameEngine.output(
            `Audio System: ✓ ACTIVE (Volume: ${Math.round(
              gameEngine.audioSystem.masterVolume * 100
            )}%)`,
            "hint"
          );
        }

        // Save system
        if (gameEngine.saveSystem) {
          const saveCount = Object.keys(gameEngine.saveSystem.saves).length;
          gameEngine.output(`Save System: ✓ ACTIVE (${saveCount} saves)`, "hint");
        }

        // AI system
        if (window.AIConfig) {
          const aiStatus = AIConfig.getStatus();
          gameEngine.output(
            `AI System: ✓ ACTIVE (${aiStatus.activeProvider || "FALLBACK"})`,
            "hint"
          );
        }

        // Zone transitions
        if (window.ZoneTransitions) {
          gameEngine.output("Zone Transitions: ✓ ACTIVE", "hint");
        }

        // Battle animations
        if (window.BattleAnimations) {
          gameEngine.output("Battle Animations: ✓ ACTIVE", "hint");
        }

        // Tutorial
        if (window.TutorialSystem) {
          const tutStatus = TutorialSystem.getStatus();
          gameEngine.output(
            `Tutorial: ✓ ACTIVE (${
              tutStatus.completed
                ? "COMPLETE"
                : tutStatus.skipped
                ? "SKIPPED"
                : `${tutStatus.progress}`
            })`,
            "hint"
          );
        }

        gameEngine.output("", "system");
        break;

      case "tests":
        if (!window.IntegrationTests) {
          gameEngine.output("Integration tests not loaded", "error");
          return;
        }
        gameEngine.output("", "system");
        gameEngine.output("Running integration tests...", "system");
        gameEngine.output("", "system");
        window.IntegrationTests.runAll();
        break;

      case "ai":
        if (!window.AIConfig) {
          gameEngine.output("AI system not loaded", "error");
          return;
        }
        const status = AIConfig.getStatus();
        gameEngine.output("", "system");
        gameEngine.output("AI SYSTEM STATUS:", "system");
        gameEngine.output(`  Initialized: ${status.initialized}`, "hint");
        gameEngine.output(`  Active Provider: ${status.activeProvider || "OFFLINE"}`, "hint");
        gameEngine.output(`  Available: ${status.availableProviders.join(", ") || "None"}`, "hint");
        gameEngine.output(`  Requests: ${status.requestCount}`, "hint");
        gameEngine.output(`  Failures: ${status.failureCount}`, "hint");
        gameEngine.output("  Features:", "hint");
        gameEngine.output(`    - Crystal Ball: ${status.features.crystalBall ? "✓" : "✗"}`, "hint");
        gameEngine.output(`    - DM Narrative: ${status.features.dmNarrative ? "✓" : "✗"}`, "hint");
        gameEngine.output(
          `    - Generative Content: ${status.features.generativeContent ? "✓" : "✗"}`,
          "hint"
        );
        gameEngine.output("", "system");
        break;

      default:
        gameEngine.output("", "system");
        gameEngine.output("SYSTEM COMMANDS:", "system");
        gameEngine.output("  system info     - Show all system status", "hint");
        gameEngine.output("  system tests    - Run integration tests", "hint");
        gameEngine.output("  system ai       - Show AI system details", "hint");
        gameEngine.output("", "system");
    }
  },

  /**
   * Debug command (developer-only)
   */
  debugCommand(args, gameEngine) {
    const subcommand = args[0]?.toLowerCase() || "help";

    switch (subcommand) {
      case "state":
        gameEngine.output("Game State:", "system");
        gameEngine.output(JSON.stringify(gameEngine.gameState, null, 2), "debug");
        break;

      case "quests":
        gameEngine.output("Quests:", "system");
        gameEngine.output(JSON.stringify(gameEngine.quests, null, 2), "debug");
        break;

      case "save":
        if (gameEngine.saveSystem) {
          gameEngine.output("Saves:", "system");
          gameEngine.output(
            JSON.stringify(gameEngine.saveSystem.saves, null, 2),
            "debug"
          );
        }
        break;

      case "level":
        const newLevel = parseInt(args[1]) || 1;
        gameEngine.gameState.level = newLevel;
        gameEngine.gameState.exp = 0;
        gameEngine.output(`✓ Level set to ${newLevel}`, "system");
        break;

      case "hp":
        const newHp = parseInt(args[1]) || 100;
        gameEngine.gameState.hp = newHp;
        gameEngine.gameState.maxHp = newHp;
        gameEngine.output(`✓ HP set to ${newHp}`, "system");
        break;

      case "mp":
        const newMp = parseInt(args[1]) || 50;
        gameEngine.gameState.mp = newMp;
        gameEngine.gameState.maxMp = newMp;
        gameEngine.output(`✓ MP set to ${newMp}`, "system");
        break;

      default:
        gameEngine.output("", "system");
        gameEngine.output("DEBUG COMMANDS (developer only):", "system");
        gameEngine.output("  debug state     - Show game state JSON", "hint");
        gameEngine.output("  debug quests    - Show quests JSON", "hint");
        gameEngine.output("  debug save      - Show saves JSON", "hint");
        gameEngine.output("  debug level N   - Set level to N", "hint");
        gameEngine.output("  debug hp N      - Set HP to N", "hint");
        gameEngine.output("  debug mp N      - Set MP to N", "hint");
        gameEngine.output("", "system");
    }
  },

  // ============================================================
  // [INITIALIZATION]
  // ============================================================

  /**
   * Register all built-in commands
   */
  registerBuiltins() {
    this.register("tutorial", this.tutorialCommand.bind(this), "Tutorial system commands");
    this.register("system", this.systemCommand.bind(this), "System status and diagnostics");
    this.register("debug", this.debugCommand.bind(this), "Developer debug commands");
    console.log("[CommandHandlers] Built-in commands registered");
  },

  /**
   * Initialize command handlers
   */
  initialize(gameEngine) {
    this.registerBuiltins();
    console.log("[CommandHandlers] System initialized");
  },
};

// ============================================================
// [AUTO-INITIALIZATION]
// ============================================================

console.log("[CommandHandlers] Ready. Call: CommandHandlers.initialize(gameEngine)");
