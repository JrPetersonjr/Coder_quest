// ============================================================
// TUTORIAL-SYSTEM.JS
// PHASE 5: GUIDED FIRST-TIME PLAYER EXPERIENCE
//
// PURPOSE:
//   - Welcome new players with guided intro
//   - Explain core mechanics (commands, combat, quests)
//   - Teach spell system basics
//   - Hint system for stuck players
//   - Accessibility options
//
// FEATURES:
//   - Auto-triggered on first game launch
//   - Command-based progression (can be skipped)
//   - Context-sensitive hints
//   - Tutorial bookmarks (save/resume progress)
//   - Optional "hard mode" (no hints)
//
// ============================================================

window.TutorialSystem = {
  // ============================================================
  // [CONFIG] - Tutorial settings
  // ============================================================
  config: {
    enabled: true,
    autoStart: true,
    hintFrequency: 3,     // Show hint every N commands
    showOnFirstPlay: true,
  },

  // ============================================================
  // [STATE] - Track tutorial progress
  // ============================================================
  state: {
    completed: false,
    currentStep: 0,
    commandCount: 0,
    seenHints: [],
    skipped: false,
    hardMode: false,
    startedAt: null,
  },

  // ============================================================
  // [TUTORIAL_STEPS] - Sequence of lessons
  // ============================================================
  steps: [
    {
      id: "welcome",
      title: "Welcome, Technomancer",
      content: `
You stand in the CENTRAL HUB, a nexus of infinite systems.
The air hums with digital potential. The code awaits your command.

Your mission: Journey through the systems, defeat enemies,
master ancient spells, and become a true TECHNOMANCER.

Type 'help' to see all available commands.
Type 'tutorial' to see this message again.
Type 'skip' to skip the tutorial.
      `,
      trigger: "start",
      duration: 0,  // Infinite until dismissed
    },

    {
      id: "basic_commands",
      title: "Basic Commands",
      content: `
Learn the fundamental commands:

  look              - Examine your surroundings
  stats             - Check your character stats
  inventory         - View your inventory
  go <zone>         - Travel to a new zone (go forest, go city, etc)
  help              - Full command reference

Try: 'look'
      `,
      trigger: "after_steps",
      step: 1,
      hint: "Use 'look' to understand where you are",
    },

    {
      id: "battle_intro",
      title: "Combat Basics",
      content: `
Combat is your path to power.

In battle you can:
  attack            - Strike your enemy
  cast <spell>      - Use a learned spell
  defend            - Reduce incoming damage
  flee              - Attempt escape (may fail)

Enemy defeated? Gain EXP and loot!
Enemy wins? Game over (but you can load a save).

Tip: Check your spells with 'spells'

Try: 'battle' to fight your first enemy
      `,
      trigger: "after_steps",
      step: 2,
    },

    {
      id: "spell_system",
      title: "Master Spellcraft",
      content: `
Spells are your greatest weapon.

Commands:
  spells            - View learned spells
  cast <spell>      - Use a spell in battle
  define <word>     - Learn new spell concepts
  spell <name>      - Details about a spell

Example spells: fireball, iceblast, lightning, heal

Try: 'define fireball' to learn a spell
      `,
      trigger: "after_steps",
      step: 3,
    },

    {
      id: "quest_system",
      title: "The Quest System",
      content: `
Quests drive your journey forward.

Commands:
  quests            - See active quests
  quest <id>        - View quest details
  quest complete    - Mark manual quest complete

Quests reward:
  - Experience (EXP)
  - Loot (items)
  - Graphics unlock (unlock visual layer)
  - Story progression

Warning: Complete 4 beginner quests to unlock GRAPHICS mode!

Try: 'quests' to see what awaits
      `,
      trigger: "after_steps",
      step: 4,
    },

    {
      id: "zones",
      title: "Explore the Code World",
      content: `
The world is divided into zones, each unique:

  hub               - Safe central hub (you are here)
  forest            - Ancient code trees (dangerous)
  city              - Neon data city (medium difficulty)
  vault             - Locked secrets (hard)
  nexus             - Reality breaks (very hard)

Each zone has:
  - Unique enemies
  - Hidden treasures
  - Quest opportunities
  - Atmospheric audio

Start easy: 'go forest' (low-level enemies)

Try: 'go forest' to begin your first real journey
      `,
      trigger: "after_steps",
      step: 5,
    },

    {
      id: "save_system",
      title: "Saving Your Progress",
      content: `
Never lose your progress!

Commands:
  save <slot>       - Save to slot 0-2
  load <slot>       - Load from slot 0-2
  autosave          - Game auto-saves every 2 minutes

Auto-save always restores when you reload the page.

Strategy: Save before tough battles!

Try: 'save 0' to save your progress
      `,
      trigger: "after_steps",
      step: 6,
    },

    {
      id: "audio_system",
      title: "Audio Settings",
      content: `
Immerse yourself in sound!

Commands:
  audio on/off       - Toggle audio
  audio volume X     - Set volume (0.0 to 1.0)
  audio test         - Hear sample sounds

Audio includes:
  - Battle effects (attack, victory, defeat)
  - Zone atmosphere
  - Quest completion chimes
  - Spell cast sounds

Optimize for your preference: 'audio volume 0.7'

Try: 'audio test' to hear the audio system
      `,
      trigger: "after_steps",
      step: 7,
    },

    {
      id: "graphics_unlock",
      title: "The Graphics Unlock Secret",
      content: `
A hidden layer awaits...

Complete 4 beginner quests to unlock GRAPHICS MODE:
  - Master the Basics (complete 'help' and 'stats')
  - Defeat Your First Enemy (win a battle)
  - Learn a Spell (define any concept)
  - Complete a Zone Exploration (visit forest or city)

Once unlocked:
  - Visual combat animations appear
  - Enemy sprites render
  - Spell effects animate
  - Screen effects trigger on damage
  - Victory celebrations visualize

Current quests: 'quests'

Try: 'quests' to see your progress toward unlock
      `,
      trigger: "after_steps",
      step: 8,
    },

    {
      id: "advanced",
      title: "Advanced Play (Optional)",
      content: `
Ready for more?

Advanced mechanics:
  - Spell combinations (chain spells for damage)
  - Inventory management (different armors affect stats)
  - Trading with NPCs (barter your discoveries)
  - Hidden zones (secret areas in each zone)
  - Boss battles (legendary enemies with unique rewards)

You don't need to master these immediately.
Discover them naturally as you play.

Remember: 'help' is always available!

You're ready, Technomancer. The systems await your command.
      `,
      trigger: "after_steps",
      step: 9,
    },
  ],

  // ============================================================
  // [HINT_SYSTEM] - Context-sensitive help
  // ============================================================
  hints: {
    combat: [
      "Try: 'attack' to strike your enemy",
      "Your spells are more effective than basic attacks",
      "Defend when your HP is low",
      "Victory grants EXP for leveling up",
    ],
    exploration: [
      "Use 'go <zone>' to travel",
      "Each zone has unique enemies and loot",
      "Some zones are harder than others",
      "Check 'look' to understand your surroundings",
    ],
    spells: [
      "Use 'define <concept>' to learn new spells",
      "Different spells work better against different enemies",
      "More powerful spells cost more MP",
      "Cast spells with 'cast <spell>' in battle",
    ],
    quests: [
      "Use 'quests' to see what you need to do",
      "Complete quests for rewards",
      "4 beginner quests unlock GRAPHICS mode",
      "Quest completion updates automatically",
    ],
    stuck: [
      "Type 'help' for command reference",
      "Type 'quests' to see active objectives",
      "Type 'stats' to check your progress",
      "Type 'save 0' before difficult battles",
    ],
  },

  // ============================================================
  // [INITIALIZATION]
  // ============================================================

  /**
   * Initialize tutorial system
   */
  initialize(gameEngine) {
    this.gameEngine = gameEngine;
    this.state.startedAt = Date.now();

    // Check if first play
    const isFirstPlay = !localStorage.getItem("TECHNOMANCER_PLAYED_BEFORE");

    if (isFirstPlay && this.config.autoStart) {
      this.start();
      localStorage.setItem("TECHNOMANCER_PLAYED_BEFORE", "true");
    }

    console.log("[Tutorial] System initialized");
  },

  /**
   * Start tutorial sequence
   */
  start() {
    this.state.completed = false;
    this.state.currentStep = 0;
    this.showWelcome();
  },

  /**
   * Show welcome message
   */
  showWelcome() {
    const welcomeStep = this.steps[0];
    
    this.gameEngine.output("", "system");
    this.gameEngine.output("=".repeat(50), "tutorial");
    this.gameEngine.output(`▓ ${welcomeStep.title.toUpperCase()} ▓`, "tutorial");
    this.gameEngine.output("=".repeat(50), "tutorial");
    this.gameEngine.output("", "system");
    this.gameEngine.output(welcomeStep.content.trim(), "tutorial");
    this.gameEngine.output("", "system");
  },

  /**
   * Advance to next tutorial step
   */
  nextStep() {
    this.state.currentStep++;

    if (this.state.currentStep >= this.steps.length) {
      this.complete();
      return;
    }

    const step = this.steps[this.state.currentStep];

    this.gameEngine.output("", "system");
    this.gameEngine.output("=".repeat(50), "tutorial");
    this.gameEngine.output(`▓ ${step.title.toUpperCase()} ▓`, "tutorial");
    this.gameEngine.output("=".repeat(50), "tutorial");
    this.gameEngine.output("", "system");
    this.gameEngine.output(step.content.trim(), "tutorial");
    this.gameEngine.output("", "system");
  },

  /**
   * Mark tutorial complete
   */
  complete() {
    this.state.completed = true;
    
    this.gameEngine.output("", "system");
    this.gameEngine.output("=".repeat(50), "tutorial");
    this.gameEngine.output("✓ TUTORIAL COMPLETE", "tutorial");
    this.gameEngine.output("=".repeat(50), "tutorial");
    this.gameEngine.output("", "system");
    this.gameEngine.output("You have mastered the basics.", "tutorial");
    this.gameEngine.output("The systems are yours to command.", "tutorial");
    this.gameEngine.output("", "system");
    this.gameEngine.output("Type 'help' anytime for reference.", "hint");
    this.gameEngine.output("", "system");

    localStorage.setItem("TECHNOMANCER_TUTORIAL_COMPLETE", "true");
  },

  /**
   * Skip tutorial
   */
  skip() {
    this.state.skipped = true;
    
    this.gameEngine.output("", "system");
    this.gameEngine.output("Tutorial skipped.", "system");
    this.gameEngine.output("Type 'help' for command reference.", "hint");
    this.gameEngine.output("", "system");

    localStorage.setItem("TECHNOMANCER_TUTORIAL_SKIPPED", "true");
  },

  /**
   * Show hint based on context
   */
  showHint(context = "stuck") {
    if (this.state.hardMode) return; // No hints in hard mode

    const contextHints = this.hints[context] || this.hints.stuck;
    const randomHint = contextHints[Math.floor(Math.random() * contextHints.length)];

    this.gameEngine.output("", "system");
    this.gameEngine.output(`💡 HINT: ${randomHint}`, "hint");
    this.gameEngine.output("", "system");

    this.state.seenHints.push({ context, hint: randomHint, timestamp: Date.now() });
  },

  /**
   * Check if hint should show (periodic)
   */
  maybeShowHint() {
    if (this.state.hardMode || this.state.completed) return;

    this.state.commandCount++;

    if (this.state.commandCount % this.config.hintFrequency === 0) {
      this.showHint("stuck");
    }
  },

  /**
   * Get tutorial status
   */
  getStatus() {
    return {
      completed: this.state.completed,
      skipped: this.state.skipped,
      currentStep: this.state.currentStep,
      progress: `${this.state.currentStep}/${this.steps.length}`,
      commandCount: this.state.commandCount,
      hardMode: this.state.hardMode,
    };
  },

  // ============================================================
  // [COMMANDS] - Integration with command system
  // ============================================================

  /**
   * Handle 'tutorial' command
   */
  handleTutorialCommand(args, gameEngine) {
    if (args[0] === "skip") {
      this.skip();
    } else if (args[0] === "next") {
      this.nextStep();
    } else if (args[0] === "status") {
      gameEngine.output(JSON.stringify(this.getStatus(), null, 2), "system");
    } else if (args[0] === "hint") {
      this.showHint(args[1] || "stuck");
    } else if (args[0] === "hardmode") {
      this.state.hardMode = !this.state.hardMode;
      gameEngine.output(
        `Hard mode: ${this.state.hardMode ? "ENABLED (no hints)" : "DISABLED"}`,
        "system"
      );
    } else {
      gameEngine.output("", "system");
      gameEngine.output("Tutorial Commands:", "system");
      gameEngine.output("  tutorial next     - Show next lesson", "hint");
      gameEngine.output("  tutorial skip     - Skip tutorial", "hint");
      gameEngine.output("  tutorial hint     - Get a hint", "hint");
      gameEngine.output("  tutorial status   - Check progress", "hint");
      gameEngine.output("  tutorial hardmode - Toggle hard mode", "hint");
      gameEngine.output("", "system");
    }
  },
};

// ============================================================
// [AUTO-INITIALIZATION]
// ============================================================

/**
 * Initialize tutorial system with game engine
 */
function initializeTutorial(gameEngine) {
  TutorialSystem.initialize(gameEngine);
  console.log("[Tutorial] System ready");
}
