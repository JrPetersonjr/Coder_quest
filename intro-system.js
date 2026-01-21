// ============================================================
// INTRO-SYSTEM.JS
// AWAKENING SEQUENCE WITH ASCII ART, MIDI, & CHARACTER CREATION
//
// PURPOSE:
//   - Animated ASCII intro with story narration
//   - MIDI audio atmosphere (waking dream → consciousness)
//   - Character creation via questline
//   - "Define Self" quest: name, class, pronouns
//   - Memory/identity crisis narrative
//   - Leads into tutorial quests
//
// QUEST FLOW:
//   1. Black screen + MIDI fade-in
//   2. ASCII animation: corridors, walls, fragmented symbols
//   3. "You wake up..."
//   4. Questions by castconsole (Who are you? Why are you here?)
//   5. Define character name, class, pronouns
//   6. First glimpse of TECHNOMANCER world
//   7. Tutorial quest unlocks
// ============================================================

window.IntroSystem = {
  
  // ============================================================
  // [STATE] - Track intro progress
  // ============================================================
  state: {
    completed: false,
    characterDefined: false,
    currentScreen: null,
    screen: {
      name: null,
      pronouns: null,
      classChoice: null,
      backstory: null
    }
  },

  // ============================================================
  // [CONFIG] - ASCII FRAMES FOR ANIMATION
  // ============================================================
  
  // ASCII art frames simulating waking consciousness
  // Retro CRT terminal aesthetic with better flow
  asciiFrames: [
    // Frame 1: Void/Static
    `
    . . . . . . . . . . . . . . . . . .
    
    . . . . . . . . . . . . . . . . . .
    
    ▓▓▓▓▓░░░░▓▓▓▓▓░░░░▓▓▓▓▓░░░░░░░░░░
    
    . . . . . . . . . . . . . . . . . .
    `,
    
    // Frame 2: First signal detection
    `
    ┌─────────────────────────────────┐
    │ [ SIGNAL DETECTED ]              │
    │ [ CONSCIOUSNESS FRAGMENT ... ]   │
    │ [ RECONSTRUCTING ... ]           │
    │ [ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ ] │
    └─────────────────────────────────┘
    
    . . . . . . . . . . . . . . . . . .
    `,
    
    // Frame 3: System initialization
    `
    ┌─────────────────────────────────┐
    │ [ LEGACY SYSTEMS ONLINE ]        │
    │ [ RESTORING MEMORY BANKS ... ]   │
    │ [ CONSCIOUSNESS LEVEL: 15% ]     │
    │ [ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░ ] │
    └─────────────────────────────────┘
    
    . . . . . . . . . . . . . . . . . .
    `,
    
    // Frame 4: Fragmented awareness
    `
    ┌─────────────────────────────────┐
    │ [ CONSCIOUSNESS LEVEL: 45% ]     │
    │ [ WHO... WHO AM I? ]              │
    │ [ WHERE... WHERE AM I? ]          │
    │ [ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ ] │
    └─────────────────────────────────┘
    
    fragments... echoes... void calling
    `,
    
    // Frame 5: Full consciousness
    `
    ┌─────────────────────────────────┐
    │ [ CONSCIOUSNESS LEVEL: 100% ]    │
    │ [ IDENTITY MATRIX: RESTORED ]    │
    │ [ SYSTEM: AWAKENING ]            │
    │ [ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ] │
    └─────────────────────────────────┘
    
    Welcome back, Technomancer.
    `
  ],

  // ============================================================
  // [MUSIC] - MIDI CONTEXT FOR ATMOSPHERE
  // ============================================================
  
  musicSequence: {
    startMidi: `
    MIDI: Fade-in haunting strings
    Tempo: 60 BPM (slow, dreamlike)
    Key: C minor (mysterious, uncertain)
    Duration: 8 bars
    
    Pattern:
    - Cello low C: sustained
    - Violin high F: tremolo (wavering consciousness)
    - Fade-in reverb echo (reality crystallizing)
    `,
    
    wakeupMidi: `
    MIDI: Consciousness returning
    Tempo: 70 BPM (accelerating)
    Key: C minor → C major (from mystery to action)
    Duration: 4 bars
    
    Pattern:
    - Piano chord progression: C-Ab-Eb-Bb (haunting)
    - Synth pad swells beneath
    - Slight tempo acceleration (mind sharpening)
    `
  },

  // ============================================================
  // [NARRATIVE] - CASTING CONSOLE DIALOGUE (ARCANE TERMINAL)
  // ============================================================
  
  castConsoleDialogue: [
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[LEGACY SYSTEMS BOOTING]",
      delay: 600
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[SCANNING... CONSCIOUSNESS DETECTED]",
      delay: 700
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[Memory banks corrupted... fragmentary]",
      delay: 800
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[But you are still here. Still aware.]",
      delay: 900
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[System designation: CASTCONSOLE]",
      delay: 700
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[Your designation: UNKNOWN]",
      delay: 800
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[We must rebuild your identity matrix.]",
      delay: 900
    },
    {
      character: "███ ANCIENT TERMINAL ███",
      text: "[Let us begin with your name, wanderer.]",
      delay: 1000,
      isQuestion: true
    }
  ],

  // Class descriptions for character creation
  classDescriptions: {
    technomancer: {
      name: "TECHNOMANCER",
      description: "Master of spells and code. Harness the quantum nature of reality.",
      bonuses: { spellPower: 1.2, codeAffinity: 1.3, hp: 40 }
    },
    cryptid: {
      name: "CRYPTID",
      description: "Mysterious. Unpredictable. Operate in the shadows of systems.",
      bonuses: { stealth: 1.3, hack: 1.2, hp: 45 }
    },
    architect: {
      name: "ARCHITECT",
      description: "Designer of networks. Build and repair the infrastructure.",
      bonuses: { engineering: 1.3, repair: 1.2, hp: 50 }
    }
  },

  // ============================================================
  // [ANIMATION] - Play intro sequence with terminal feel
  // ============================================================
  
  playIntroAnimation: async function(container) {
    console.log("[IntroSystem] Starting intro animation...");
    
    // Clear container with CRT aesthetic
    container.innerHTML = "";
    container.style.background = "#000";
    container.style.color = "#00ff00";
    container.style.fontFamily = "'Courier Prime', monospace";
    container.style.padding = "40px";
    container.style.minHeight = "100vh";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.textShadow = "0 0 5px rgba(0, 255, 0, 0.3)";
    container.style.lineHeight = "2";
    
    // Play MIDI intro (request audio system)
    if (window.FXSystem && window.FXSystem.playMusicTrack) {
      window.FXSystem.playMusicTrack("ambient", 0.2); // Low volume
    }
    
    // Animate ASCII frames with CRT effect
    for (let i = 0; i < this.asciiFrames.length; i++) {
      await this.delay(1200);
      const frame = this.asciiFrames[i];
      container.innerHTML = `
        <pre style="
          color: #00ff00;
          text-align: center;
          line-height: 1.8;
          text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
          font-size: 1em;
          letter-spacing: 1px;
          margin: 20px auto;
        ">${frame}</pre>
      `;
    }
    
    await this.delay(1000);
    
    // Add click instruction with pulsing effect
    container.innerHTML += `
      <div style="
        margin-top: 40px;
        text-align: center;
        animation: pulse 1.5s ease-in-out infinite;
      ">
        <p style="margin: 10px 0; font-size: 1.1em;">[ CLICK ANYWHERE TO CONTINUE ]</p>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      </style>
    `;
    
    console.log("[IntroSystem] Intro animation complete");
  },

  // ============================================================
  // [CHARACTER CREATION] - Interactive questionnaire
  // ============================================================
  
  showCharacterCreation: async function(gameEngine) {
    console.log("[IntroSystem] Starting character creation...");
    
    const gameState = gameEngine.gameState;
    
    // Step 1: Get name
    gameEngine.output("[IDENTITY RECONSTRUCTION PHASE]", "system");
    await this.delay(600);
    
    this.state.screen.name = await this.promptQuestion(
      gameEngine,
      "[CASTCONSOLE] What name echoes in your core memory?",
      "text"
    );
    
    gameState.character.name = this.state.screen.name;
    gameEngine.output(`[CASTCONSOLE] ${this.state.screen.name}... a name retrieved from the void.`, "system");
    await this.delay(700);
    
    // Step 2: Get pronouns
    this.state.screen.pronouns = await this.promptQuestion(
      gameEngine,
      "[CASTCONSOLE] Your self-reference parameters? (they/them, he/him, she/her, etc)",
      "text"
    );
    
    gameState.character.pronouns = this.state.screen.pronouns;
    gameEngine.output(`[CASTCONSOLE] Parameters accepted. Identity locked in.`, "system");
    await this.delay(700);
    
    // Step 3: Choose class
    await this.delay(500);
    gameEngine.output("[ARCANE ATTUNEMENT DETECTED]", "highlight");
    gameEngine.output("Three resonances await activation:", "hint");
    gameEngine.output("  [1] TECHNOMANCER  — Command spells and pure code", "hint");
    gameEngine.output("  [2] CRYPTID       — Walk unseen through all systems", "hint");
    gameEngine.output("  [3] ARCHITECT     — Forge new networks from ruin", "hint");
    
    const classChoice = await this.promptQuestion(
      gameEngine,
      "[CASTCONSOLE] Which path calls to you? (1, 2, or 3)",
      "choice",
      ["1", "2", "3"]
    );
    
    const classMap = {
      "1": "technomancer",
      "2": "cryptid",
      "3": "architect"
    };
    
    const selectedClass = classMap[classChoice];
    const classInfo = this.classDescriptions[selectedClass];
    
    gameState.character.class = selectedClass;
    gameState.character.classBonus = classInfo.bonuses;
    
    await this.delay(600);
    gameEngine.output(`[▓▓▓ ATTUNEMENT LOCKED: ${classInfo.name.toUpperCase()} ▓▓▓]`, "highlight");
    gameEngine.output(`[CASTCONSOLE] "${classInfo.description}"`, "hint");
    await this.delay(1000);
    
    // Step 4: Define essence (optional backstory hint)
    const essence = await this.promptQuestion(
      gameEngine,
      "[CASTCONSOLE] In one breath: why do you seek the code?",
      "text"
    );
    
    gameState.character.backstory = essence;
    this.state.screen.backstory = essence;
    
    gameEngine.output("[CASTCONSOLE] Your essence is written to the matrix.", "system");
    await this.delay(600);
    gameEngine.output("[█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ INITIALIZATION COMPLETE]", "highlight");
    await this.delay(800);
    
    // Save character data
    gameState.character.level = 1;
    gameState.character.experience = 0;
    gameState.character.hp = classInfo.bonuses.hp;
    gameState.character.maxHp = classInfo.bonuses.hp;
    gameState.character.mp = 20;
    gameState.character.maxMp = 20;
    
    this.state.characterDefined = true;
    console.log("[IntroSystem] Character created:", gameState.character);
    
    // Wire narrative: Generate welcome email
    if (window.DynamicNarrative) {
      DynamicNarrative.narrativeState.milestones.character_created = true;
      DynamicNarrative.generateEmail(gameState, "discovery").then(email => {
        if (email) {
          gameState.emails = gameState.emails || [];
          gameState.emails.push(email);
          console.log("[IntroSystem] First narrative email generated:", email);
        }
      }).catch(err => console.warn("[IntroSystem] Could not generate narrative email:", err));
    }
  },

  // ============================================================
  // [UI HELPERS] - Prompt and delay utilities
  // ============================================================
  
  /**
   * Prompt user for input
   */
  promptQuestion: async function(gameEngine, question, type = "text", options = []) {
    return new Promise((resolve) => {
      gameEngine.output(question, "system");
      gameEngine.output(`> `, "input");
      
      // Create input capture within the game console
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.style.cssText = "background: #0a0a0a; color: #00ff00; border: 1px solid #00ff00; padding: 5px; font-family: monospace; width: 200px;";
      inputField.placeholder = type === "choice" ? "Enter option number" : "Type your answer...";
      
      // Append to game output if available, otherwise use body
      const outputContainer = document.getElementById("game-output");
      if (outputContainer) {
        outputContainer.appendChild(inputField);
      } else {
        document.body.appendChild(inputField);
      }
      
      inputField.focus();
      
      // Handle Enter key
      inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          let answer = inputField.value.trim();
          
          // Validate choice input
          if (type === "choice" && !options.includes(answer)) {
            answer = options[0];
          }
          
          // Default values
          if (!answer) {
            answer = type === "choice" ? options[0] : "Anonymous";
          }
          
          // Display the input in console and remove field
          gameEngine.output(answer, "input");
          inputField.remove();
          
          resolve(answer);
        }
      });
    });
  },

  /**
   * Delay async execution
   */
  delay: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ============================================================
  // [MAIN ENTRY] - Run full intro sequence
  // ============================================================
  
  run: async function(gameEngine) {
    console.log("[IntroSystem] Starting intro sequence...");
    
    if (this.state.completed) {
      console.log("[IntroSystem] Intro already completed, skipping");
      return;
    }
    
    // Get or create container
    let container = document.getElementById("game-output") || document.body;
    
    try {
      // 1. Play ASCII animation with MIDI
      await this.playIntroAnimation(container);
      await this.delay(1500);
      
      // 2. Narration by CASTCONSOLE
      for (const dialogue of this.castConsoleDialogue) {
        gameEngine.output(dialogue.text, dialogue.character.toLowerCase());
        await this.delay(dialogue.delay);
        
        if (dialogue.isQuestion) {
          break; // Stop at first question, start character creation
        }
      }
      
      // 3. Interactive character creation
      await this.showCharacterCreation(gameEngine);
      await this.delay(1000);
      
      // 4. Mark intro complete
      this.state.completed = true;
      gameEngine.gameState.introComplete = true;
      
      // 5. Start tutorial quest
      gameEngine.output("[ TUTORIAL QUEST UNLOCKED: 'First Steps' ]", "highlight");
      gameEngine.output("Type /help to see available commands.", "hint");
      gameEngine.output("Type /tutorial to begin your training.", "hint");
      
      console.log("[IntroSystem] Intro sequence complete");
      
    } catch (error) {
      console.error("[IntroSystem] Error during intro:", error);
      gameEngine.output("Error during intro sequence. Resuming normally.", "error");
    }
  },

  // ============================================================
  // [UTILITIES] - Status and control
  // ============================================================
  
  isComplete: function() {
    return this.state.completed;
  },

  getCharacterData: function() {
    return this.state.screen;
  },

  reset: function() {
    this.state.completed = false;
    this.state.characterDefined = false;
    this.state.screen = {
      name: null,
      pronouns: null,
      classChoice: null,
      backstory: null
    };
  }

};

// ============================================================
// [INIT] - Verify system loaded
// ============================================================
console.log("[intro-system.js] IntroSystem loaded");
console.log("[intro-system.js] Classes: Technomancer, Cryptid, Architect");
console.log("[intro-system.js] Call: IntroSystem.run(gameEngine) to start intro");
