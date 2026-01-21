// ============================================================
// ANCIENT-TERMINALS.JS
// CASTCONSOLE TERMINAL INTERACTION & MINIGAME ENGINE
//
// PURPOSE:
//   - Handle terminal UI overlay & input
//   - Manage minigame sequences (spoof, decrypt, codematch, repair)
//   - Connect to AI backends (HuggingFace default, local fallback)
//   - Validate player solutions & award rewards
//   - Store terminal state & unlock progression
//
// MINIGAMES:
//   - coding: Direct code validation (Python/Bash/PowerShell)
//   - spoof: Multi-stage network intrusion
//   - decrypt: Scrambled word unscrambling
//   - codematch: Snippet to description matching
//   - repair: Step-by-step hardware/network repair
//
// AI BACKENDS:
//   - HuggingFace (default, no setup)
//   - Local model (Ollama/LM Studio auto-detect)
//
// ============================================================

window.AncientTerminal = {

  // ============================================================
  // [AI_BACKEND] - Model selection & inference
  // ============================================================
  aiBackend: {
    provider: "huggingface", // "huggingface" or "local"
    localUrl: "http://localhost:1234/v1/chat/completions", // LM Studio default
    huggingfaceToken: null, // User can set in settings
    currentModel: "google/flan-t5-base",
    fallbackTo: "huggingface",

    /**
     * Initialize AI backend (detect local model first)
     */
    async init() {
      // Try to detect local model
      try {
        const response = await fetch(this.localUrl, {
          method: "POST",
          timeout: 2000
        });

        if (response.ok) {
          console.log("[TERMINAL] Local model detected at", this.localUrl);
          this.provider = "local";
          return true;
        }
      } catch (e) {
        console.log("[TERMINAL] No local model found, using HuggingFace");
      }

      this.provider = this.fallbackTo;
      return true;
    },

    /**
     * Generate text using selected backend
     * @param {string} prompt - User prompt
     * @param {object} options - Generation options
     * @returns {string} Generated text
     */
    async generate(prompt, options = {}) {
      const maxTokens = options.maxTokens || 256;
      const temperature = options.temperature || 0.7;

      if (this.provider === "local") {
        return this.generateLocal(prompt, maxTokens, temperature);
      } else {
        return this.generateHuggingFace(prompt, maxTokens, temperature);
      }
    },

    /**
     * Generate using local model (Ollama/LM Studio)
     */
    async generateLocal(prompt, maxTokens, temperature) {
      try {
        const response = await fetch(this.localUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "You are the Ancient Terminal DM. Respond briefly (1-2 sentences). Stay in character."
              },
              { role: "user", content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: temperature
          })
        });

        if (!response.ok) {
          throw new Error(`Local model error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (e) {
        console.warn("[TERMINAL] Local model failed, falling back to HuggingFace:", e);
        this.provider = "huggingface";
        return this.generateHuggingFace(prompt, maxTokens, temperature);
      }
    },

    /**
     * Generate using HuggingFace Inference API
     */
    async generateHuggingFace(prompt, maxTokens, temperature) {
      try {
        const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-base", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": this.huggingfaceToken ? `Bearer ${this.huggingfaceToken}` : ""
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: maxTokens,
              temperature: temperature
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HuggingFace error: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          return data[0]?.generated_text || "The terminal falls silent...";
        }
        return data.generated_text || "The terminal falls silent...";
      } catch (e) {
        console.error("[TERMINAL] HuggingFace failed:", e);
        return "The terminal flickers. Connection lost.";
      }
    }
  },

  // ============================================================
  // [TERMINAL_STATE] - Active terminal tracking
  // ============================================================
  active: false,
  current: null,
  challenge: null,
  history: [],
  stage: 0,

  /**
   * Open a terminal by ID
   * @param {string} terminalId - Terminal ID (e.g., "forest:root-access")
   * @param {object} appendLine - UI output function
   */
  async open(terminalId, appendLine) {
    const terminal = CastTerminals[terminalId];
    if (!terminal) {
      appendLine("No ancient terminal exists here.", "error");
      return;
    }

    this.active = true;
    this.current = terminal;
    this.history = [];
    this.stage = 0;

    // Display header
    appendLine("", "system");
    appendLine("═══════════════════════════════════════", "system");
    appendLine("⚙ ANCIENT TERMINAL ACCESSED", "system");
    appendLine("═══════════════════════════════════════", "system");
    appendLine("", "system");
    appendLine(`Terminal: ${terminal.name}`, "system");
    appendLine(`Subsystem: ${terminal.subsystem}`, "system");
    appendLine(`Description: ${terminal.desc}`, "system");
    appendLine("", "system");
    appendLine("Type 'exit' to disconnect.", "system");
    appendLine("Type 'hint' for assistance.", "system");
    appendLine("", "system");

    // Generate challenge
    if (terminal.dynamic) {
      this.challenge = terminal.generateChallenge(gameState);
    } else if (terminal.challenges) {
      this.challenge = terminal.challenges[0];
    }

    // Show challenge
    appendLine(`Challenge: ${this.challenge.desc}`, "system");
    appendLine(`${terminal.prompt} ${this.challenge.shortPrompt}`, "system");
    appendLine("", "system");

    // Initialize minigame if needed
    if (terminal.minigame === "spoof") {
      this.initiateSpoofGame(appendLine);
    } else if (terminal.minigame === "decrypt") {
      this.initiateDecryptGame(appendLine);
    } else if (terminal.minigame === "codematch") {
      this.initiateCodeMatchGame(appendLine);
    } else if (terminal.minigame === "repair") {
      this.initiateRepairGame(appendLine);
    } else if (terminal.minigame === "narrative") {
      this.initiateNarrativeGame(appendLine);
    } else if (terminal.minigame === "email") {
      this.initiateEmailGame(appendLine, terminal);
    }
  },

  /**
   * Close terminal
   * @param {object} appendLine - UI output function
   */
  close(appendLine) {
    this.active = false;
    this.current = null;
    this.challenge = null;
    appendLine("", "system");
    appendLine("Connection to ancient terminal closed.", "system");
    appendLine("═══════════════════════════════════════", "system");
    appendLine("", "system");
  },

  // ============================================================
  // [MINIGAME_IMPLEMENTATIONS] - Individual game types
  // ============================================================

  /**
   * Spoof minigame - Multi-stage network intrusion
   */
  initiateSpoofGame(appendLine) {
    appendLine("Stages of infiltration required:", "system");
    this.challenge.stages.forEach((s, i) => {
      appendLine(`  ${i + 1}. ${s.desc}`, "hint");
    });
    appendLine("", "system");
    appendLine(this.challenge.stages[0].hint, "system");
  },

  /**
   * Decrypt minigame - Scrambled word unscrambling
   */
  initiateDecryptGame(appendLine) {
    const word = this.challenge.wordData;
    appendLine(`Scrambled: ${word.scrambled}`, "system");
    appendLine(`Hint: ${word.clue}`, "hint");
    appendLine("Unscramble and type the answer.", "system");
  },

  /**
   * Code match minigame - Match snippets to descriptions
   */
  initiateCodeMatchGame(appendLine) {
    const pair = this.challenge.pair;
    appendLine("Code snippet:", "system");
    appendLine(`  ${pair.snippet}`, "command");
    appendLine("", "system");
    appendLine(`What does this do? (${pair.description})`, "system");
    appendLine("Options: loop, conditional, append, function", "hint");
  },

  /**
   * Repair minigame - Step-by-step hardware/network repair
   */
  initiateRepairGame(appendLine) {
    appendLine("Network repair sequence initiated.", "system");
    appendLine(`Step 1: ${this.challenge.steps[0]}`, "system");
    appendLine(this.challenge.hint, "hint");
  },

  /**
   * Narrative minigame - AI DM interaction
   */
  async initiateNarrativeGame(appendLine) {
    appendLine("Connecting to the void...", "system");
    appendLine("The terminal becomes alive. Something is listening.", "highlight");
    appendLine("", "system");

    // Generate initial DM prompt
    const response = await this.aiBackend.generate(
      "You are an ancient AI oracle. A mortal approaches your terminal. Greet them mysteriously and ask what they seek. (1-2 sentences)",
      { maxTokens: 100 }
    );

    appendLine(response, "highlight");
    appendLine("", "system");
    appendLine("(Type your response to the oracle)", "system");
  },

  /**
   * Email minigame - Read and unscramble lore
   */
  initiateEmailGame(appendLine) {
    // Find a document from this zone
    const zoneId = this.current.zone || "hub";
    const zoneDocs = TerminalDocuments.getZoneDocuments(zoneId);
    
    if (!zoneDocs || zoneDocs.length === 0) {
      appendLine("No documents found in this zone.", "system");
      return;
    }

    // Pick random document
    const doc = zoneDocs[Math.floor(Math.random() * zoneDocs.length)];
    this.challenge.document = doc;

    // Display the document
    TerminalDocuments.displayDocument(doc.id, appendLine);

    if (doc.corrupted) {
      appendLine("⚠ NOTICE: This document contains corrupted sections.", "highlight");
      appendLine("Type 'unscramble [CORRUPTED_TEXT]' to attempt recovery.", "hint");
      appendLine("", "system");
    }

    if (doc.hint) {
      appendLine(`Hint: ${doc.hint}`, "hint");
      appendLine("", "system");
    }
  },
  initiateEmailGame(appendLine, terminal) {
    appendLine("Mail archive system online.", "system");
    appendLine("", "system");
    appendLine("Available commands:", "system");
    appendLine("  list              - Show all emails", "hint");
    appendLine("  read <id>         - Read an email", "hint");
    appendLine("  unscramble <id> <scrambled> <answer>  - Fix corrupted text", "hint");
    appendLine("  codes             - Show extracted codes", "hint");
    appendLine("", "system");
    appendLine("Type 'list' to begin.", "system");
  },

  // ============================================================
  // [INPUT_HANDLER] - Process terminal input
  // ============================================================

  /**
   * Handle terminal input
   * @param {string} input - Raw user input
   * @param {object} appendLine - UI output function
   * @param {object} gameState - Player game state
   */
  async handleInput(input, appendLine, gameState) {
    if (!this.active || !this.current) return;

    const terminal = this.current;
    const challenge = this.challenge;

    this.history.push(input);

    // Echo input
    appendLine(`${terminal.prompt} ${input}`, "command");

    // Handle special commands
    if (input.toLowerCase() === "exit") {
      this.close(appendLine);
      return;
    }

    if (input.toLowerCase() === "hint") {
      appendLine(`Hint: ${challenge.hint}`, "hint");
      return;
    }

    // Route to appropriate validator
    let passed = false;

    switch (terminal.minigame) {
      case "coding":
        passed = this.validateCoding(input, challenge);
        break;

      case "spoof":
        passed = await this.validateSpoof(input, challenge, appendLine);
        break;

      case "decrypt":
        passed = this.validateDecrypt(input, challenge);
        break;

      case "codematch":
        passed = this.validateCodeMatch(input, challenge);
        break;

      case "repair":
        passed = await this.validateRepair(input, challenge, appendLine);
        break;

      case "narrative":
        passed = await this.validateNarrative(input, challenge, appendLine);
        break;

      case "email":
        this.validateEmail(input, terminal, appendLine);
        return;
    }

    // Handle result
    if (!passed) {
      appendLine("The terminal rejects the input.", "error");
      return;
    }

    // Success!
    this.completeChallenge(gameState, challenge, appendLine);
  },

  /**
   * Validate coding challenge
   */
  validateCoding(input, challenge) {
    try {
      return challenge.validator(input);
    } catch (e) {
      console.warn("[TERMINAL] Code validation error:", e);
      return false;
    }
  },

  /**
   * Validate spoof challenge (multi-stage)
   */
  async validateSpoof(input, challenge, appendLine) {
    const currentStage = challenge.stages[this.stage];
    if (!currentStage) return true; // All stages complete

    const isCorrect = input.toLowerCase().includes(currentStage.command);

    if (!isCorrect) {
      appendLine("Command not recognized.", "error");
      return false;
    }

    // Advance stage
    this.stage++;

    if (this.stage < challenge.stages.length) {
      const nextStage = challenge.stages[this.stage];
      appendLine(`Stage ${this.stage + 1}: ${nextStage.desc}`, "system");
      appendLine(nextStage.hint, "hint");
      return false; // Not done yet
    }

    return true; // All stages complete
  },

  /**
   * Validate decrypt challenge
   */
  validateDecrypt(input, challenge) {
    return input.toUpperCase().trim() === challenge.wordData.answer;
  },

  /**
   * Validate code match challenge
   */
  validateCodeMatch(input, challenge) {
    return input.toLowerCase().trim() === challenge.pair.answer;
  },

  /**
   * Validate repair challenge (multi-step)
   */
  async validateRepair(input, challenge, appendLine) {
    const currentStep = challenge.steps[this.stage];
    if (!currentStep) return true; // All steps complete

    const isCorrect = input.toLowerCase().includes("done") || this.stage > 2;

    if (!isCorrect) {
      appendLine("Action incomplete.", "error");
      return false;
    }

    this.stage++;

    if (this.stage < challenge.steps.length) {
      const nextStep = challenge.steps[this.stage];
      appendLine(`Step ${this.stage + 1}: ${nextStep}`, "system");
      return false;
    }

    return true;
  },

  /**
   * Validate narrative challenge (AI-driven)
   */
  async validateNarrative(input, challenge, appendLine) {
    // Generate AI response to player input
    const response = await this.aiBackend.generate(
      `Player says: "${input}". Respond as an ancient oracle. (1-2 sentences)`,
      { maxTokens: 100 }
    );

    appendLine(response, "highlight");
    appendLine("", "system");

    // Random success chance (narrative is more forgiving)
    if (Math.random() > 0.3) {
      appendLine("The oracle seems satisfied by your words.", "system");
      return true;
    }

    appendLine("The oracle wishes to hear more...", "hint");
    return false;
  },

  /**
   * Validate email terminal commands
   */
  validateEmail(input, terminal, appendLine) {
    const cmd = input.toLowerCase().trim();

    if (cmd === "list") {
      // List all documents available in this zone
      const doc = this.challenge.document;
      const zoneId = this.current.zone || "hub";
      const zoneDocs = TerminalDocuments.getZoneDocuments(zoneId);
      
      appendLine("", "system");
      appendLine("DOCUMENTS IN THIS TERMINAL:", "system");
      zoneDocs.forEach(d => {
        appendLine(`  • ${d.title}`, "log");
      });
      appendLine("", "system");
      appendLine("Type: read <title> or 'unscramble [TEXT]' for corrupted sections", "hint");
      appendLine("", "system");
    } else if (cmd.startsWith("read ")) {
      // Read a specific document
      const titleSearch = cmd.substring(5).trim().toLowerCase();
      const zoneId = this.current.zone || "hub";
      const zoneDocs = TerminalDocuments.getZoneDocuments(zoneId);
      
      const doc = zoneDocs.find(d => d.title.toLowerCase().includes(titleSearch));
      if (!doc) {
        appendLine("Document not found.", "error");
        return;
      }

      TerminalDocuments.displayDocument(doc.id, appendLine);
      this.challenge.document = doc;

      if (doc.solution || doc.passwords) {
        appendLine("This document contains a puzzle. Type: 'answer [text]'", "hint");
      }
    } else if (cmd.startsWith("unscramble ")) {
      // Unscramble corrupted text with seed hint
      // Format: unscramble [CORRUPTED: text] <answer> <seed>
      const parts = cmd.substring(11).trim();
      const match = parts.match(/\[⚠ CORRUPTED: (.+?)\]\s+(.+?)(?:\s+(\d+))?$/);
      
      if (!match) {
        appendLine("Usage: unscramble [⚠ CORRUPTED: text] <answer> [seed]", "hint");
        return;
      }

      const scrambled = match[1];
      const answer = match[2];
      const seed = parseInt(match[3]) || 42;

      // Attempt unscramble
      const unscrambled = TerminalDocuments.unscramble(scrambled, seed);

      if (unscrambled.toLowerCase() === answer.toLowerCase()) {
        appendLine("", "system");
        appendLine("═══════════════════════════════════════", "success");
        appendLine(`✓ UNSCRAMBLED: ${scrambled}`, "success");
        appendLine(`  Revealed: ${unscrambled.toUpperCase()}`, "success");
        appendLine("═══════════════════════════════════════", "success");
        appendLine("", "system");
      } else {
        appendLine(`Got: ${unscrambled} (wrong seed?)`, "error");
        appendLine("Try different seed values or check the hint.", "hint");
      }
    } else if (cmd.startsWith("answer ")) {
      // Answer a document's puzzle
      const answer = cmd.substring(7).trim();
      const doc = this.challenge.document;

      if (!doc) {
        appendLine("No document currently loaded.", "error");
        return;
      }

      if (!doc.solution && !doc.passwords) {
        appendLine("This document has no puzzle.", "error");
        return;
      }

      if (TerminalDocuments.validateSolution(doc.id, answer)) {
        appendLine("", "system");
        appendLine("═══════════════════════════════════════", "success");
        appendLine("✓ PUZZLE SOLVED!", "success");
        appendLine("═══════════════════════════════════════", "success");
        appendLine("", "system");
        appendLine("The terminal unlocks. Files accessible.", "highlight");
        appendLine("", "system");

        // Mark as complete
        this.completeChallenge(window.gameEngine?.gameState, this.challenge, appendLine);
      } else {
        appendLine("Incorrect. Try again or check the hints.", "error");
      }
    } else if (cmd === "exit") {
      this.close(appendLine);
    } else {
      appendLine("Commands: list, read <title>, unscramble <text>, answer <text>, exit", "error");
  },

  // ============================================================
  // [REWARD_SYSTEM] - Complete challenge & award rewards
  // ============================================================

  /**
   * Complete challenge and award rewards
   */
  completeChallenge(gameState, challenge, appendLine) {
    const reward = challenge.reward || {};

    appendLine("", "system");
    appendLine("═══════════════════════════════════════", "highlight");
    appendLine("✓ TERMINAL OBJECTIVE COMPLETE", "highlight");
    appendLine("═══════════════════════════════════════", "highlight");
    appendLine("", "system");

    // Experience
    if (reward.exp) {
      gameState.exp += reward.exp;
      appendLine(`+${reward.exp} EXP`, "highlight");
    }

    // Data currency
    if (reward.data) {
      gameState.data = (gameState.data || 0) + reward.data;
      appendLine(`+${reward.data} DATA`, "highlight");
    }

    // Spells
    if (reward.spells) {
      if (!gameState.learnedSpells) gameState.learnedSpells = [];
      reward.spells.forEach(spell => {
        if (!gameState.learnedSpells.includes(spell)) {
          gameState.learnedSpells.push(spell);
          appendLine(`🔮 Learned: ${spell}`, "highlight");
        }
      });
    }

    // Items
    if (reward.items) {
      if (!gameState.inventory) gameState.inventory = [];
      reward.items.forEach(item => {
        gameState.inventory.push(item);
        appendLine(`📦 Acquired: ${item}`, "highlight");
      });
    }

    // Code bits (for spell crafting)
    if (reward.codeBits) {
      if (!gameState.learnedCodeBits) gameState.learnedCodeBits = [];
      reward.codeBits.forEach(bit => {
        if (!gameState.learnedCodeBits.includes(bit)) {
          gameState.learnedCodeBits.push(bit);
          SpellCrafting.learnCodeBit(gameState, bit);
          appendLine(`⚡ Learned code bit: ${bit}`, "highlight");
        }
      });
    }

    // Unlocks
    if (reward.unlocks) {
      appendLine(`🔓 Unlocked: ${reward.unlocks}`, "highlight");
    }

    appendLine("", "system");
    appendLine(reward.log || "The terminal hums with satisfaction.", "system");
    appendLine("", "system");

    // Mark as complete
    if (!gameState.completedTerminals) gameState.completedTerminals = {};
    gameState.completedTerminals[this.current.id] = true;

    // Close terminal
    this.close(appendLine);

    // Play success sound
    FXSystem.playSound("success");
    FXSystem.createParticles("spell_impact", 30);
  }
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[ancient-terminals.js] AncientTerminal initialized");
console.log("[ancient-terminals.js] AI Backend: auto-detect (HuggingFace fallback)");
console.log("[ancient-terminals.js] Minigames: coding, spoof, decrypt, codematch, repair, narrative");