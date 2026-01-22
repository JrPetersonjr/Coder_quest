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

      case "intro":
        // Reset and restart intro sequence
        gameEngine.gameState.introComplete = false;
        if (window.IntroSystem) {
          window.IntroSystem.reset();
          gameEngine.output("✓ Intro reset. Refresh page to see intro sequence.", "system");
        }
        break;

      case "character":
        // Show character info
        if (gameEngine.gameState.character) {
          gameEngine.output("", "system");
          gameEngine.output("=== CHARACTER INFO ===", "system");
          gameEngine.output(`Name: ${gameEngine.gameState.character.name || "Unknown"}`, "hint");
          gameEngine.output(`Class: ${gameEngine.gameState.character.class || "Unknown"}`, "hint");
          gameEngine.output(`Pronouns: ${gameEngine.gameState.character.pronouns || "Unknown"}`, "hint");
          gameEngine.output(`Level: ${gameEngine.gameState.character.level || 1}`, "hint");
          gameEngine.output(`HP: ${gameEngine.gameState.character.hp}/${gameEngine.gameState.character.maxHp}`, "hint");
          gameEngine.output(`MP: ${gameEngine.gameState.character.mp}/${gameEngine.gameState.character.maxMp}`, "hint");
          gameEngine.output(`XP: ${gameEngine.gameState.character.experience || 0}`, "hint");
          gameEngine.output("", "system");
        } else {
          gameEngine.output("Character not initialized", "error");
        }
        break;

      case "graphics":
      case "gfx":
        // Graphics/2D engine debug mode
        const gfxSub = args[1]?.toLowerCase() || "show";
        switch (gfxSub) {
          case "show":
          case "on":
            // Show graphics container
            const gfxContainer = document.getElementById("graphics-container");
            if (gfxContainer) {
              gfxContainer.style.display = "block";
              gameEngine.output("✓ Graphics container visible", "system");
            } else {
              gameEngine.output("Creating graphics container...", "system");
              this.initGraphicsDebug(gameEngine);
            }
            break;
            
          case "hide":
          case "off":
            const hideContainer = document.getElementById("graphics-container");
            if (hideContainer) {
              hideContainer.style.display = "none";
              gameEngine.output("✓ Graphics container hidden", "system");
            }
            break;
            
          case "test":
            // Test animation
            const anim = args[2] || "player_attack";
            if (window.graphicsUI) {
              window.graphicsUI.queueAnimation(anim, 500);
              gameEngine.output(`✓ Playing animation: ${anim}`, "system");
            } else {
              gameEngine.output("Graphics UI not initialized - run 'debug graphics init' first", "error");
            }
            break;
            
          case "init":
            this.initGraphicsDebug(gameEngine);
            break;
            
          case "battle":
            // Start a test battle scene
            if (window.graphicsUI) {
              window.graphicsUI.currentEnemy = { name: "Debug Slime", hp: 30, maxHp: 30 };
              window.graphicsUI.playerHP = gameEngine.gameState.hp || 50;
              window.graphicsUI.enemyHP = 30;
              gameEngine.output("✓ Test battle scene active", "system");
              gameEngine.output("Try: debug graphics test player_attack", "hint");
              gameEngine.output("     debug graphics test enemy_attack", "hint");
              gameEngine.output("     debug graphics test spell_cast", "hint");
              gameEngine.output("     debug graphics test hit_flash", "hint");
              gameEngine.output("     debug graphics test enemy_death", "hint");
            } else {
              gameEngine.output("Run 'debug graphics init' first", "error");
            }
            break;
            
          case "zone":
            // Change zone
            const zone = args[2] || "hub";
            if (window.graphicsUI) {
              window.graphicsUI.currentZone = zone;
              window.graphicsUI.queueAnimation("zone_transition", 500);
              gameEngine.output(`✓ Zone set to: ${zone}`, "system");
            }
            break;
            
          default:
            gameEngine.output("", "system");
            gameEngine.output("GRAPHICS DEBUG COMMANDS:", "system");
            gameEngine.output("  debug graphics show   - Show graphics canvas", "hint");
            gameEngine.output("  debug graphics hide   - Hide graphics canvas", "hint");
            gameEngine.output("  debug graphics init   - Initialize GraphicsUI", "hint");
            gameEngine.output("  debug graphics test X - Play animation X", "hint");
            gameEngine.output("  debug graphics battle - Start test battle", "hint");
            gameEngine.output("  debug graphics zone X - Change zone to X", "hint");
            gameEngine.output("", "system");
            gameEngine.output("Animations: player_attack, enemy_attack, spell_cast,", "hint");
            gameEngine.output("            hit_flash, enemy_death, zone_transition", "hint");
        }
        break;

      case "tts":
      case "voice":
        // TTS debug mode
        const ttsSub = args[1]?.toLowerCase() || "status";
        switch (ttsSub) {
          case "status":
            gameEngine.output("", "system");
            gameEngine.output("=== TTS STATUS ===", "system");
            if (window.NeuralTTS) {
              const status = NeuralTTS.getStatus();
              gameEngine.output(`Neural TTS: ${status.initialized ? "✓ READY" : "✗ Not initialized"}`, "hint");
              gameEngine.output(`  Provider: ${status.provider}`, "hint");
              gameEngine.output(`  Backend enabled: ${status.enabled}`, "hint");
              gameEngine.output(`  Currently speaking: ${status.speaking}`, "hint");
            } else {
              gameEngine.output("Neural TTS: Not loaded", "hint");
            }
            if ('speechSynthesis' in window) {
              gameEngine.output("Browser TTS: ✓ Available", "hint");
            }
            gameEngine.output("", "system");
            break;
            
          case "test":
            // Test speak
            const testText = args.slice(2).join(" ") || "The ancient oracle speaks to you through the mists of time.";
            if (window.NeuralTTS && NeuralTTS.state.initialized && NeuralTTS.config.enabled) {
              NeuralTTS.speak(testText, { character: 'oracle' });
              gameEngine.output("✓ Speaking with Neural TTS...", "system");
            } else if (window.CastConsoleUI) {
              CastConsoleUI.ttsEnabled = true;
              CastConsoleUI.speakOracle(testText);
              gameEngine.output("✓ Speaking with browser TTS...", "system");
            }
            break;
            
          case "emotion":
            // Test emotional speech
            const emotion = args[2] || "mysterious";
            const emotionText = args.slice(3).join(" ") || "This is a test of emotional speech synthesis.";
            if (window.NeuralTTS) {
              NeuralTTS.speak(emotionText, { character: 'oracle', emotion: emotion });
              gameEngine.output(`✓ Speaking with emotion: ${emotion}`, "system");
            }
            break;
            
          case "provider":
            // Set TTS provider
            const provider = args[2];
            if (provider && window.NeuralTTS) {
              NeuralTTS.setProvider(provider);
              gameEngine.output(`✓ TTS provider set to: ${provider}`, "system");
            } else {
              gameEngine.output("Usage: debug tts provider [azure|elevenlabs|playht|google]", "hint");
            }
            break;
            
          case "stop":
            if (window.NeuralTTS) NeuralTTS.stop();
            if ('speechSynthesis' in window) speechSynthesis.cancel();
            gameEngine.output("✓ TTS stopped", "system");
            break;
            
          default:
            gameEngine.output("", "system");
            gameEngine.output("TTS DEBUG COMMANDS:", "system");
            gameEngine.output("  debug tts status        - Show TTS status", "hint");
            gameEngine.output("  debug tts test [text]   - Test TTS with text", "hint");
            gameEngine.output("  debug tts emotion X [text] - Test emotion X", "hint");
            gameEngine.output("  debug tts provider X    - Set provider", "hint");
            gameEngine.output("  debug tts stop          - Stop speaking", "hint");
            gameEngine.output("", "system");
            gameEngine.output("Emotions: calm, excited, sad, urgent, mysterious, fear", "hint");
            gameEngine.output("Providers: azure, elevenlabs, playht, google", "hint");
        }
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
        gameEngine.output("  debug intro     - Reset intro sequence", "hint");
        gameEngine.output("  debug character - Show character details", "hint");
        gameEngine.output("  debug graphics  - 2D engine debug mode", "hint");
        gameEngine.output("  debug tts       - TTS/voice debug mode", "hint");
        gameEngine.output("", "system");
    }
  },

  // ============================================================
  // [INITIALIZATION]
  // ============================================================

  /**
   * Initialize graphics debug mode
   */
  initGraphicsDebug(gameEngine) {
    if (window.graphicsUI) {
      gameEngine.output("✓ GraphicsUI already initialized", "system");
      return;
    }
    
    // Create graphics container if needed
    let container = document.getElementById("graphics-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "graphics-container";
      container.style.cssText = "position: fixed; top: 10px; right: 10px; z-index: 1000; background: #0a0e27; border: 2px solid #2fb43a; border-radius: 8px; padding: 5px;";
      document.body.appendChild(container);
    }
    container.style.display = "block";
    
    // Try to load sprite sheet and init GraphicsUI
    if (typeof GraphicsUI !== "undefined") {
      const spriteImg = new Image();
      spriteImg.onload = () => {
        window.graphicsUI = new GraphicsUI(gameEngine, spriteImg);
        gameEngine.output("✓ GraphicsUI initialized with sprite sheet", "system");
        gameEngine.output("Type 'debug graphics' for commands", "hint");
      };
      spriteImg.onerror = () => {
        // Init without sprites (will use placeholder colors)
        window.graphicsUI = new GraphicsUI(gameEngine, null);
        gameEngine.output("✓ GraphicsUI initialized (no sprite sheet)", "system");
        gameEngine.output("Type 'debug graphics' for commands", "hint");
      };
      spriteImg.src = "ASSETS/custom/sprite-sheet.png";
    } else {
      gameEngine.output("GraphicsUI class not loaded - check if GraphicsUI.js is included", "error");
    }
  },

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
