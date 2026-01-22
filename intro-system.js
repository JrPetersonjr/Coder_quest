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
//   6. First glimpse of Coder's Quest world
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
    
    Welcome back, Coder.
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
    codeweaver: {
      name: "CODEWEAVER",
      description: "Master of spells and code. Harness the quantum nature of reality.",
      bonuses: { spellPower: 1.2, codeAffinity: 1.3, hp: 40 }
    },
    debugger: {
      name: "DEBUGGER",
      description: "Unstoppable tank. Resolves conflicts by force and resilience.",
      bonuses: { defense: 1.3, fortitude: 1.2, hp: 70 }
    },
    compiler: {
      name: "COMPILER",
      description: "Optimized damage dealer. Executes enemies with extreme efficiency.",
      bonuses: { attack: 1.3, speed: 1.2, hp: 55 }
    },
    sysadmin: {
      name: "SYSADMIN",
      description: "Utility master. Controls the environment and manages resources.",
      bonuses: { utility: 1.3, control: 1.2, hp: 50 }
    }
  },

  // ============================================================
  // [ANIMATION] - Play intro sequence with terminal feel
  // ============================================================
  
  playIntroAnimation: async function(container) {
    console.log("[IntroSystem] Starting intro animation...");
    
    // Create intro pane if PaneManager is available
    if (window.PaneManager) {
      const introPane = document.createElement("div");
      introPane.id = "intro-animation";
      introPane.style.cssText = `
        background: #000;
        color: #00ff00;
        font-family: 'Courier Prime', monospace;
        padding: 40px;
        text-align: center;
        overflow: hidden;
      `;
      
      PaneManager.createPane({
        id: "intro-pane",
        title: "⬢ SYSTEM BOOT ⬢",
        x: 100,
        y: 100,
        width: 800,
        height: 500,
        minimizable: false,
        closeable: false,
        content: introPane
      });
      
      container = introPane;
    } else {
      // Fallback to body if no PaneManager
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
    }
    
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
    
    // Wait for click
    await new Promise(resolve => {
      container.addEventListener('click', resolve, { once: true });
    });
    
    console.log("[IntroSystem] Intro animation complete");
  },

  // ============================================================
  // [CHARACTER CREATION] - Interactive questionnaire
  // ============================================================
  
  showCharacterCreation: async function(gameEngine) {
    console.log("[IntroSystem] Starting character creation...");
    const gameState = gameEngine.gameState;
    
    // Ensure character object exists
    if (!gameState.character) gameState.character = {};

    // Step 1: Name (Check existing or Prompt)
    if (gameState.character.name) {
      console.log("[IntroSystem] Identity detected:", gameState.character.name);
      gameEngine.output(`[CASTCONSOLE] Identity confirmed: ${gameState.character.name.toUpperCase()}`, "system");
      await this.delay(800);
      this.state.screen.name = gameState.character.name;
    } else {
      console.log("[IntroSystem] Step 1: Prompting for name");
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
    }
    
    // Step 2: Pronouns (Check existing or Prompt)
    // Note: server.js defaults pronouns to 'they/them', so we might want to ask anyway if it's the default? 
    // For now, let's assume if they registered, they might want to customize, but usually web registration doesn't ask pronouns.
    // Let's ask pronouns if they are missing OR if this is a first-run (introComplete is false) and we want to be polite.
    // But to keep it simple: if present, use them. 
    // actually, let's always ask pronouns for Web Users since web form didn't ask.
    // Web users have name, but class is 'Unassigned'. 
    
    if (gameState.character.pronouns && gameState.character.pronouns !== 'they/them') {
       // If set to something specific (not default), assume they set it.
       this.state.screen.pronouns = gameState.character.pronouns;
    } else {
      console.log("[IntroSystem] Step 2: Prompting for pronouns");
      this.state.screen.pronouns = await this.promptQuestion(
        gameEngine,
        "[CASTCONSOLE] Your self-reference parameters? (they/them, he/him, she/her, etc)",
        "text"
      );
      gameState.character.pronouns = this.state.screen.pronouns;
      gameEngine.output(`[CASTCONSOLE] Parameters accepted. Identity locked in.`, "system");
      await this.delay(700);
    }

    // Step 3: Class (Check existing or Interview)
    const existingClass = gameState.character.class ? gameState.character.class.toLowerCase() : "";
    
    if (existingClass && existingClass !== 'unassigned' && existingClass !== 'codeweaver') {
        // If they have a valid class (and not the default fallback if that was an issue), skip interview.
        // Note: server.js defaults to 'codeweaver' if null. But our web intro sends 'Unassigned'.
        // So 'Unassigned' is the trigger for interview.
        // Also if server defaults to codeweaver (legacy), we might skip interview.
        // Let's assume 'codeweaver' meant they picked it, unless we change server.js default. 
        // But for this specific 'Unassigned' case:
        
        console.log("[IntroSystem] Existing class found:", existingClass);
        gameEngine.output(`[CASTCONSOLE] Class Specification: ${existingClass.toUpperCase()}`, "highlight");
        await this.delay(600);
    } else {
      // START AI INTERVIEW OR SELECTION
      console.log("[IntroSystem] Step 3: Initiating AI Class Determination");
      await this.delay(500);
      gameEngine.output("[ARCANE RELEVANCE DETECTED]", "highlight");
      gameEngine.output("The system must calibrate to your frequency...", "hint");
      
      let classChoice = null;
      
      // If AI is available, run the interview
      if (window.AIConfig && window.AIConfig.state.initialized) {
          gameEngine.output("[CASTCONSOLE] I will ask you three questions. Answer truthfully.", "system");
          
          const q1 = await this.promptQuestion(gameEngine, "[CASTCONSOLE] When a system breaks, what is your first instinct? (Analyze/Attack/Rewire/Observe)", "text");
          const q2 = await this.promptQuestion(gameEngine, "[CASTCONSOLE] What do you fear most? (Irrelevance/Failure/Chaos/Stillness)", "text");
          const q3 = await this.promptQuestion(gameEngine, "[CASTCONSOLE] describe your perfect reality in one sentence.", "text");

          gameEngine.output("[CASTCONSOLE] Processing psychometric data...", "system");
          
          try {
              const prompt = `
              Analyze these three user answers and assign them one of the following classes:
              - Codeweaver (Creative, magic-focused, reality manipulation)
              - Debugger (Tank, conflict resolution, resilience)
              - Compiler (Efficiency, speed, aggressive optimization)
              - Sysadmin (Control, resource management, utility)

              Answers:
              1. System Break Instinct: ${q1}
              2. Greatest Fear: ${q2}
              3. Perfect Reality: ${q3}

              Respond ONLY with the class name (Codeweaver, Debugger, Compiler, or Sysadmin).
              `;
              
              const aiResponse = await window.AIConfig.chat(prompt, "You are the Ancient Terminal. Analyze the user's soul.");
              const detectedClass = aiResponse.trim().toLowerCase();
              
              if (detectedClass.includes("codeweaver")) classChoice = "1";
              else if (detectedClass.includes("debugger")) classChoice = "2";
              else if (detectedClass.includes("compiler")) classChoice = "3";
              else if (detectedClass.includes("sysadmin")) classChoice = "4";
              
              gameEngine.output(`[CASTCONSOLE] Analysis Complete. Your soul resonance is: ${detectedClass.toUpperCase()}`, "highlight");
              await this.delay(1000);
          } catch (e) {
              console.warn("[IntroSystem] AI analysis failed, falling back to manual selection", e);
              gameEngine.output("[CASTCONSOLE] Automated analysis failed. Manual override engaged.", "error");
          }
      }

      // Fallback if AI failed or not initialized
      if (!classChoice) {
          gameEngine.output("Manual Selection Required:", "hint");
          gameEngine.output("  [1] CODEWEAVER  — Master effects and reality manipulation", "hint");
          gameEngine.output("  [2] DEBUGGER    — Unstoppable tank and resolution", "hint");
          gameEngine.output("  [3] COMPILER    — Extreme efficiency and speed", "hint");
          gameEngine.output("  [4] SYSADMIN    — Control and resource management", "hint");
          
          classChoice = await this.promptQuestion(
              gameEngine,
              "[CASTCONSOLE] Which path calls to you? (1-4)",
              "choice",
              ["1", "2", "3", "4"]
          );
      }
      
      console.log("[IntroSystem] Class choice received:", classChoice);
      const classMap = {
        "1": "codeweaver",
        "2": "debugger",
        "3": "compiler",
        "4": "sysadmin"
      };
      
      const selectedClass = classMap[classChoice];
      const classInfo = this.classDescriptions[selectedClass];
      
      gameState.character.class = selectedClass;
      gameState.character.classBonus = classInfo.bonuses;
      
      await this.delay(600);
      gameEngine.output(`[▓▓▓ ATTUNEMENT LOCKED: ${classInfo.name.toUpperCase()} ▓▓▓]`, "highlight");
      gameEngine.output(`[CASTCONSOLE] "${classInfo.description}"`, "hint");
      await this.delay(1000);
    }
      
      // Step 4: Define essence (optional backstory hint)
      console.log("[IntroSystem] Step 4: Prompting for essence/backstory");
      const essence = await this.promptQuestion(
        gameEngine,
        "[CASTCONSOLE] In one breath: why do you seek the code?",
        "text"
      );
      
      console.log("[IntroSystem] Essence received:", essence);
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
      gameState.character.mp = 80;
      gameState.character.maxMp = 80;
      
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
      
    } catch (error) {
      console.error("[IntroSystem] ERROR in character creation:", error);
      console.error("[IntroSystem] Stack:", error.stack);
      gameEngine.output("Error during character creation: " + error.message, "error");
      throw error;
    }
  },

  // ============================================================
  // [UI HELPERS] - Prompt and delay utilities
  // ============================================================
  
  /**
   * Prompt user for input - works with pane UI
   */
  promptQuestion: async function(gameEngine, question, type = "text", options = []) {
    console.log("[PromptQuestion] Question:", question, "Type:", type);
    
    return new Promise((resolve) => {
      try {
        // Output the question to game console
        gameEngine.output(question, "system");
        
        // Try to find intro pane or create input in existing pane
        let outputContainer = document.querySelector("#intro-pane .pane-content");
        
        if (!outputContainer) {
          // Fallback: try main game output or use browser prompt
          outputContainer = document.getElementById("output") || document.querySelector(".pane-content");
        }
        
        console.log("[PromptQuestion] Output container found:", !!outputContainer);
        
        if (!outputContainer) {
          console.error("[PromptQuestion] No suitable container found!");
          // Fallback: use browser prompt
          const answer = window.prompt(question, type === "choice" ? options[0] : "");
          resolve(answer || (type === "choice" ? options[0] : "Anonymous"));
          return;
        }
        
        // Add question text to container
        const questionDiv = document.createElement("div");
        questionDiv.style.cssText = "margin: 15px 0; color: #00ff00; font-family: monospace;";
        questionDiv.textContent = question;
        outputContainer.appendChild(questionDiv);
        
        // Create a wrapper div for the input line
        const lineDiv = document.createElement("div");
        lineDiv.style.cssText = "display: flex; align-items: center; gap: 5px; margin: 10px 0;";
        
        // Create prompt indicator
        const promptSpan = document.createElement("span");
        promptSpan.textContent = "> ";
        promptSpan.style.cssText = "color: #00ff00; font-family: monospace; font-size: 16px;";
        
        // Create input field
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.style.cssText = `
          background: #0a0a0a;
          color: #00ff00;
          border: 1px solid #00ff00;
          padding: 8px;
          font-family: monospace;
          font-size: 14px;
          width: 300px;
          outline: none;
        `;
        inputField.placeholder = type === "choice" ? `Enter: ${options.join(" or ")}` : "Type and press Enter...";
        
        // Assemble line
        lineDiv.appendChild(promptSpan);
        lineDiv.appendChild(inputField);
        
        // Append to game output
        outputContainer.appendChild(lineDiv);
        console.log("[PromptQuestion] Input field appended to container");
        
        // Scroll to bottom
        outputContainer.scrollTop = outputContainer.scrollHeight;
        
        // Focus immediately
        inputField.focus();
        console.log("[PromptQuestion] Input field focused");
        
        // Handle Enter key
        const handleEnter = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            let answer = inputField.value.trim();
            console.log("[PromptQuestion] User input received:", answer);
            
            // Validate choice input
            if (type === "choice") {
              if (!options.includes(answer)) {
                console.log("[PromptQuestion] Invalid choice, showing options");
                gameEngine.output(`Invalid choice. Try: ${options.join(", ")}`, "hint");
                inputField.value = "";
                inputField.focus();
                return;
              }
            }
            
            // Default values
            if (!answer) {
              answer = type === "choice" ? options[0] : "Anonymous";
              console.log("[PromptQuestion] Using default answer:", answer);
            }
            
            // Display the answer in console
            gameEngine.output(answer, "input");
            
            // Remove input line and handler
            inputField.removeEventListener("keydown", handleEnter);
            lineDiv.remove();
            
            console.log("[PromptQuestion] Resolving with:", answer);
            resolve(answer);
          }
        };
        
        inputField.addEventListener("keydown", handleEnter);
        
      } catch (error) {
        console.error("[PromptQuestion] Error:", error);
        // Fallback to browser prompt
        const answer = window.prompt(question, type === "choice" ? options[0] : "");
        resolve(answer || (type === "choice" ? options[0] : "Anonymous"));
      }
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
      
      // 5. Close intro pane if it exists
      if (window.PaneManager && PaneManager.panes["intro-pane"]) {
        PaneManager.closePane("intro-pane");
      }
      
      // 6. Show character summary
      gameEngine.output("", "system");
      gameEngine.output("=".repeat(50), "system");
      gameEngine.output("  CHARACTER CREATION COMPLETE", "highlight");
      gameEngine.output("=".repeat(50), "system");
      gameEngine.output(`Name: ${gameEngine.gameState.character.name}`, "system");
      gameEngine.output(`Pronouns: ${gameEngine.gameState.character.pronouns}`, "system");
      gameEngine.output(`Class: ${gameEngine.gameState.character.class.toUpperCase()}`, "system");
      gameEngine.output(`HP: ${gameEngine.gameState.character.hp}/${gameEngine.gameState.character.maxHp}`, "system");
      gameEngine.output(`MP: ${gameEngine.gameState.character.mp}/${gameEngine.gameState.character.maxMp}`, "system");
      gameEngine.output("=".repeat(50), "system");
      gameEngine.output("", "system");
      
      // 7. Start tutorial quest
      gameEngine.output("[ TUTORIAL QUEST UNLOCKED: 'First Steps' ]", "highlight");
      gameEngine.output("Type help to see available commands.", "hint");
      gameEngine.output("Type tutorial to begin your training.", "hint");
      gameEngine.output("Type debug character to see your full stats.", "hint");
      
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
