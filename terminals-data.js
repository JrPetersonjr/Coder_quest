// ============================================================
// TERMINALS-DATA.JS
// CASTCONSOLE ANCIENT TERMINAL REGISTRY
//
// PURPOSE:
//   - Define all ancient terminals (real-world code challenges)
//   - Store terminal metadata (name, type, prompt, subsystem)
//   - Define minigame structures (spoofing, decryption, code-match)
//   - Generate dynamic challenges OR use pre-built ones
//   - Store rewards (spells, items, data, unlocks)
//
// MINIGAME TYPES:
//   - coding: Direct code validation (Python/Bash/PowerShell)
//   - spoof: Network spoofing (email → netstat → IP → transfer)
//   - decrypt: Scrambled word → unscramble to get key
//   - codematch: Match code snippets to descriptions
//   - repair: Network/hardware repair challenges
//
// AI INTEGRATION NOTES:
//   - Challenges can be static (pre-written) OR dynamic (AI-generated)
//   - AI model selection happens in core.js (local vs HuggingFace)
//   - Terminal stores only the prompt/format; AI fills in specifics
//
// ============================================================

window.CastTerminals = {

  // ============================================================
  // [TERMINAL_HUB_NEXUS] - Hub portal (AI DM interaction)
  // ============================================================
  "hub:nexus-portal": {
    zone: "hub",
    subzone: "hub_nexus",
    id: "hub:nexus-portal",
    name: "Nexus Portal",
    desc: "A shimmering interface between all realities. Feels alive.",
    subsystem: "consciousness",
    type: "narrative",
    prompt: "∞ ",
    dynamic: true,
    minigame: "narrative",
    
    generateChallenge(player) {
      return {
        id: "nexus-narrative-" + Date.now(),
        desc: "The portal awaits your words. Ask, and it responds.",
        shortPrompt: "What do you ask the void?",
        hint: "Speak your intent. The portal understands.",
        isNarrative: true,
        reward: {
          exp: 15,
          data: 5,
          log: "The portal hums. You feel heard."
        }
      };
    }
  },

  // ============================================================
  // [TERMINAL_FOREST_ROOT] - Root Access Node (Python challenges)
  // ============================================================
  "forest:root-access": {
    zone: "forest",
    subzone: "forest_root",
    id: "forest:root-access",
    name: "Root Access Node",
    desc: "A moss-covered terminal grown into the roots of an ancient code-tree. Data seeps like sap.",
    subsystem: "transformation",
    type: "python",
    prompt: ">>> ",
    dynamic: true,
    minigame: "coding",

    generateChallenge(player) {
      return {
        id: "forest-normalize-" + Date.now(),
        desc: "Normalize corrupted forest logs.",
        shortPrompt: "Write a Python function clean(s) that removes all 'ERR' tokens.",
        hint: "Think: def clean(s): return s.replace('ERR','')",
        codeType: "python",
        testInput: "ERRLOG",
        expectedOutput: "LOG",
        validator: (code) => {
          try {
            const fn = eval(code);
            return fn("ERRLOG") === "LOG";
          } catch {
            return false;
          }
        },
        reward: {
          exp: 40,
          data: 20,
          spells: ["cleanse"],
          items: ["ancient_seed"],
          log: "The forest roots glow. CLEANSE spell compiled."
        }
      };
    }
  },

  // ============================================================
  // [TERMINAL_CITY_DEBUG] - Neon Debug Server (Bash challenges)
  // ============================================================
  "city:neon-debug": {
    zone: "city",
    subzone: "city_core",
    id: "city:neon-debug",
    name: "Neon Debug Server",
    desc: "A flickering neon terminal wired into the city's old-world datastream. Pulses with data.",
    subsystem: "security",
    type: "bash",
    prompt: "$ ",
    dynamic: true,
    minigame: "coding",

    generateChallenge(player) {
      return {
        id: "city-decode-" + Date.now(),
        desc: "Decode a corrupted stacktrace fragment.",
        shortPrompt: "Use a bash pipeline to extract only ERROR lines from trace.log.",
        hint: "Try: cat trace.log | grep ERROR",
        codeType: "bash",
        validator: (input) => /grep\s+ERROR/i.test(input),
        reward: {
          exp: 60,
          data: 30,
          spells: ["decrypt"],
          items: ["neon_shard"],
          log: "You isolate the error stream. DECRYPT spell compiled."
        }
      };
    }
  },

  // ============================================================
  // [TERMINAL_CITY_VAULT] - Data Vault (Decryption minigame)
  // ============================================================
  "city:data-vault": {
    zone: "city",
    subzone: "city_underground",
    id: "city:data-vault",
    name: "Data Vault",
    desc: "Encrypted servers pulse behind thick glass. Older than the city itself.",
    subsystem: "encryption",
    type: "decryption",
    prompt: "⚔ ",
    dynamic: true,
    minigame: "decrypt",

    generateChallenge(player) {
      const words = [
        { scrambled: "ACDAHA", answer: "ARCADE", clue: "Retro entertainment" },
        { scrambled: "KOTRWEN", answer: "NETWORK", clue: "Connected systems" },
        { scrambled: "PORERST", answer: "RESTORE", clue: "Repair or recover" },
        { scrambled: "PSASWORD", answer: "PASSWORD", clue: "Secret key" },
        { scrambled: "EFIRWALL", answer: "FIREWALL", clue: "Security barrier" }
      ];
      const word = words[Math.floor(Math.random() * words.length)];

      return {
        id: "city-decrypt-" + Date.now(),
        desc: "A locked server. The encryption key is hidden.",
        shortPrompt: `Unscramble: ${word.scrambled} (Hint: ${word.clue})`,
        hint: `The answer is ${word.answer.length} letters.`,
        wordData: word,
        codeType: "decrypt",
        validator: (input) => input.toUpperCase().trim() === word.answer,
        reward: {
          exp: 45,
          data: 25,
          items: ["decryption_key"],
          log: "The vault opens. Data flows forth."
        }
      };
    }
  },

  // ============================================================
  // [TERMINAL_SPOOF] - Network Spoofing Challenge
  // (Requires multiple steps: email → netstat → IP → transfer)
  // ============================================================
  "network:spoof-challenge": {
    zone: "city",
    subzone: "city_core",
    id: "network:spoof-challenge",
    name: "Network Spoof Terminal",
    desc: "An older workstation. Network traffic visible on its screen.",
    subsystem: "networking",
    type: "spoof",
    prompt: "root@ ",
    dynamic: false,
    minigame: "spoof",

    // Multi-stage minigame
    stages: [
      {
        stage: 1,
        desc: "Send a spoof email to the target",
        command: "spoof_email",
        hint: "Type: spoof_email admin@target.local"
      },
      {
        stage: 2,
        desc: "Check active network connections",
        command: "netstat",
        hint: "Type: netstat -an"
      },
      {
        stage: 3,
        desc: "Extract target IP from netstat",
        command: "get_ip",
        hint: "Type: get_ip 192.168.x.x"
      },
      {
        stage: 4,
        desc: "Transfer file to target folder",
        command: "transfer",
        hint: "Type: transfer payload.bin /var/target/"
      }
    ],

    generateChallenge(player) {
      return {
        id: "spoof-challenge-" + Date.now(),
        desc: "Gain access to the remote system through social engineering.",
        shortPrompt: "Execute multi-stage network intrusion. Follow hints.",
        hint: "Start with: spoof_email admin@target.local",
        codeType: "spoof",
        currentStage: 0,
        validator: (input) => {
          // Validator handled per-stage in core.js
          return true;
        },
        reward: {
          exp: 80,
          data: 40,
          items: ["access_token"],
          spells: ["remote_execute"],
          log: "You've breached the outer defenses. New pathways open."
        }
      };
    }
  },

  // ============================================================
  // [TERMINAL_CODE_MATCH] - Code Snippet Matching
  // ============================================================
  "logic:code-match": {
    zone: "forest",
    subzone: "forest_deep",
    id: "logic:code-match",
    name: "Logic Analyzer",
    desc: "An ancient machine for pattern recognition. Requires matching snippets.",
    subsystem: "analysis",
    type: "codematch",
    prompt: "▲ ",
    dynamic: true,
    minigame: "codematch",

    generateChallenge(player) {
      const pairs = [
        {
          snippet: "for i in range(10): print(i)",
          description: "Iterate and print numbers 0-9",
          answer: "loop"
        },
        {
          snippet: "if x > 5: return True",
          description: "Return true if x is greater than 5",
          answer: "conditional"
        },
        {
          snippet: "array.append(item)",
          description: "Add an item to a list",
          answer: "append"
        },
        {
          snippet: "def function_name():",
          description: "Define a reusable block of code",
          answer: "function"
        }
      ];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];

      return {
        id: "codematch-" + Date.now(),
        desc: "Match the code snippet to its function.",
        shortPrompt: `What does this do?\n${pair.snippet}\n\nOptions: loop, conditional, append, function`,
        hint: `Look at the keywords: ${pair.snippet.split(" ")[0]}`,
        pair: pair,
        codeType: "codematch",
        validator: (input) => input.toLowerCase().trim() === pair.answer,
        reward: {
          exp: 35,
          data: 15,
          items: ["logic_token"],
          log: "You understand the pattern. Knowledge integrated."
        }
      };
    }
  },

  // ============================================================
  // [TERMINAL_REPAIR] - Network/Hardware Repair
  // ============================================================
  "repair:network-cable": {
    zone: "hub",
    subzone: "hub_center",
    id: "repair:network-cable",
    name: "Cable Repair Junction",
    desc: "Tangled network cables. One is severed. Restoration needed.",
    subsystem: "infrastructure",
    type: "repair",
    prompt: "⚙ ",
    dynamic: false,
    minigame: "repair",

    generateChallenge(player) {
      const steps = [
        "Locate the severed cable (trace from server A)",
        "Identify the break point",
        "Reconnect both ends",
        "Verify connection with diagnostic"
      ];

      return {
        id: "repair-cable-" + Date.now(),
        desc: "The network is broken. Trace and repair the cable.",
        shortPrompt: "Follow the cable path and identify the break.",
        hint: steps[0],
        steps: steps,
        codeType: "repair",
        currentStep: 0,
        validator: (input) => {
          // Multi-step validation in core.js
          return true;
        },
        reward: {
          exp: 50,
          data: 20,
          unlocks: "network_access",
          log: "Connection restored. Remote systems now accessible."
        }
      };
    }
  },

  // ============================================================
  // [EMAIL TERMINALS] - Lore delivery through emails
  // ============================================================
  "hub:mail-archive": {
    zone: "hub",
    subzone: "hub_archive",
    id: "hub:mail-archive",
    name: "Mail Archive",
    desc: "Dusty terminals displaying old emails. Some are corrupted beyond recognition.",
    subsystem: "communications",
    type: "email",
    prompt: "MAIL> ",
    dynamic: false,
    minigame: "email",

    emails: ["hub_origin_001", "hub_identity_002"],
    
    commands: {
      "list": "List all emails in archive",
      "read <id>": "Read an email (e.g., read hub_origin_001)",
      "unscramble <id> <scrambled> <answer>": "Unscramble corrupted text",
      "codes": "Show all extracted codes"
    }
  },

  "forest:data-logs": {
    zone: "forest",
    subzone: "forest_logs",
    id: "forest:data-logs",
    name: "Data Logs Terminal",
    desc: "An old logging terminal covered in moss. Emails are preserved in the cool, damp air.",
    subsystem: "documentation",
    type: "email",
    prompt: "LOGS> ",
    dynamic: false,
    minigame: "email",

    emails: ["forest_old_001", "forest_old_002"],
    reward: {
      exp: 30,
      data: 15,
      spells: ["cleanse", "restore"],
      log: "Ancient research logs discovered. CLEANSE and RESTORE spells learned."
    }
  },

  "city:corporate-mail": {
    zone: "city",
    subzone: "city_archive",
    id: "city:corporate-mail",
    name: "Corporate Mail Server",
    desc: "A sealed terminal from the old executive offices. Email records preserved in encrypted storage.",
    subsystem: "administration",
    type: "email",
    prompt: "EXEC> ",
    dynamic: false,
    minigame: "email",

    emails: ["city_corp_001", "city_corp_002"],
    reward: {
      exp: 50,
      data: 25,
      codes: ["EXECUTIVE_ACCESS_7", "DEBUG_BYPASS_CODE"],
      log: "Corporate secrets exposed. Security codes extracted."
    }
  },

  "wasteland:archive-vault": {
    zone: "wasteland",
    subzone: "wasteland_vault",
    id: "wasteland:archive-vault",
    name: "Archive Vault",
    desc: "A sealed vault from the forgotten sanctuary. One final message preserved in the sand.",
    subsystem: "memory",
    type: "email",
    prompt: "VAULT> ",
    dynamic: false,
    minigame: "email",

    emails: ["wasteland_ruins_001"],
    reward: {
      exp: 40,
      data: 20,
      codes: ["REMEMBER_THE_FALLEN"],
      log: "The truth about the Wasteland revealed. A master key discovered."
    }
  },

  "train_station:conductor-desk": {
    zone: "train_station",
    subzone: "station_office",
    id: "train_station:conductor-desk",
    name: "Conductor's Desk",
    desc: "The old ticket office. A final manifest sits on an ancient computer, waiting to be read.",
    subsystem: "logistics",
    type: "email",
    prompt: "TICKET> ",
    dynamic: false,
    minigame: "email",

    emails: ["station_ticket_001"],
    reward: {
      exp: 60,
      data: 30,
      codes: ["DEPARTURE_SEQUENCE_ALPHA", "WHEELS_TURN_AGAIN"],
      log: "The escape route revealed. Freedom awaits beyond the tunnel."
    }
  },

// ============================================================
// [AI_MODEL_CONFIG] - Model selection for challenges
// Default: HuggingFace (no API key needed for inference)
// Override: Local model if available
// ============================================================
window.TerminalAIConfig = {
  // Default model (no key required, slower but reliable)
  default: {
    provider: "huggingface",
    model: "google/flan-t5-base",
    requiresKey: false,
    maxTokens: 256
  },

  // Narrative challenges (DM mode)
  narrative: {
    provider: "local",
    model: "auto-detect", // LM Studio / Ollama auto-detect
    fallback: "huggingface",
    requiresKey: false
  },

  // Code generation challenges
  coding: {
    provider: "local",
    model: "auto-detect",
    fallback: "huggingface",
    requiresKey: false
  },

  // Decryption/logic challenges (can run offline)
  offline: {
    provider: "local",
    model: "required",
    fallback: null,
    requiresKey: false
  }
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[terminals-data.js] CastTerminals loaded: " + Object.keys(window.CastTerminals).length + " terminals");
console.log("[terminals-data.js] TerminalAIConfig initialized");