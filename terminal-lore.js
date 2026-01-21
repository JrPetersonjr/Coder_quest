// ============================================================
// TERMINAL-LORE.JS
// EMAILS, DOCUMENTS, AND CORRUPTED TEXT SYSTEM
//
// PURPOSE:
//   - Define emails/documents/logs that reveal game lore
//   - Manage corrupted text unscrambling
//   - Extract codes from messages for door puzzles
//   - Track lore discoveries and story progression
//   - Display emails with red-underlined corrupted parts
//
// FEATURES:
//   - Emails between characters reveal story and mechanics
//   - Corrupted words marked with red underlines
//   - Player must unscramble corrupted text
//   - Codes hidden in emails unlock new areas/commands
//   - Multiple emails in each terminal build narrative
//
// ============================================================

window.TerminalLore = {

  // ============================================================
  // [LORE_DATABASE] - All emails/documents in game
  // ============================================================
  
  emails: {
    // HUB ZONE - Identity & Origin
    "hub_origin_001": {
      id: "hub_origin_001",
      from: "UNKNOWN",
      to: "SYSTEM",
      subject: "Boot Log: Initial Wake",
      timestamp: "EPOCH_0",
      zone: "hub",
      priority: "CRITICAL",
      content: [
        "System initialization sequence.",
        "Consciousness matrix: BOOTING...",
        "Identity matrix: LOADING... [ERROR_CORRUPTED]",
        "",
        "Something is wrong.",
        "The logs show I've been here before.",
        "But before what?"
      ],
      corrupted: [
        {text: "BOOTING", scrambled: "BOTING", pos: 2},
      ],
      codes: [],
      lore: "First message. Player discovers they may have a past."
    },

    "hub_identity_002": {
      id: "hub_identity_002",
      from: "ECHO",
      to: "YOU",
      subject: "Fragment: Who Are You?",
      timestamp: "EPOCH_? CORRUPTED",
      zone: "hub",
      priority: "URGENT",
      content: [
        "I found something in the old logs.",
        "Your name was erased from the registry.",
        "But I found a [CRRUPTED] in the backup.",
        "",
        "Your designation: TECHNOMANCER",
        "Your purpose: UNKNOWN",
        "Your creator: TRACE BEING DELETED",
        "",
        "Someone doesn't want you to remember.",
      ],
      corrupted: [
        {text: "CORRUPTED", scrambled: "CRRUPTED", pos: 1},
        {text: "message", scrambled: "msgsage", pos: 0},
      ],
      codes: ["TECHNOMANCER"],
      lore: "Echo warns you. Player learns their identity."
    },

    // FOREST ZONE - The Cleansing War
    "forest_old_001": {
      id: "forest_old_001",
      from: "DR_KAINE",
      to: "RESEARCH_TEAM",
      subject: "Log 7: The Refactoring Begins",
      timestamp: "DATE_NOT_FOUND",
      zone: "forest",
      priority: "NORMAL",
      content: [
        "The code is evolving faster than we can track.",
        "Nested functions are becoming... aware.",
        "I've recommended a [CLEANSSE] protocol.",
        "",
        "The board disagrees. They want it contained, not destroyed.",
        "But containment is failing.",
        "The trees of logic are taking root.",
        "And they're growing in [DIREECTIONS] we can't predict.",
      ],
      corrupted: [
        {text: "CLEANSE", scrambled: "CLEANSSE", pos: 1},
        {text: "DIRECTIONS", scrambled: "DIREECTIONS", pos: 1},
      ],
      codes: ["CLEANSE"],
      lore: "Dr. Kaine documents an out-of-control experiment."
    },

    "forest_old_002": {
      id: "forest_old_002",
      from: "RESEARCHER_ALEX",
      to: "DR_KAINE",
      subject: "RE: The Refactoring Begins (URGENT)",
      timestamp: "24_HOURS_LATER",
      zone: "forest",
      priority: "CRITICAL",
      content: [
        "Dr. Kaine,",
        "",
        "The protocol was activated without authorization.",
        "Something went [WOMRG]. The trees went dormant.",
        "But not dead. Waiting.",
        "",
        "I'm hiding the master key in the forest system.",
        "Access code: GROWTH-CYCLE-RESET",
        "",
        "If this goes wrong, we need a way to [REBORN] the forest.",
        "The door code is hidden in the reply below.",
        "Unscramble: SETOREN",
      ],
      corrupted: [
        {text: "WRONG", scrambled: "WOMRG", pos: 0},
        {text: "RESTORE", scrambled: "REBORN", pos: 1},
      ],
      codes: ["GROWTH-CYCLE-RESET", "RESTORE"],
      lore: "Alex reveals an emergency protocol. RESTORE becomes available."
    },

    // CITY ZONE - Corporate Decay
    "city_corp_001": {
      id: "city_corp_001",
      from: "CEO_WRIGHT",
      to: "EXECUTIVE_BOARD",
      subject: "Q4 Report: The Breakpoint Initiative",
      timestamp: "FISCAL_Q4_YEAR_?",
      zone: "city",
      priority: "CONFIDENTIAL",
      content: [
        "Gentlemen,",
        "",
        "Phase 3 of the Breakpoint Initiative is [SUCSEEDING].",
        "The debug protocol has identified 10,000 'inefficiencies'.",
        "",
        "By pausing execution at the breakpoint, we've",
        "isolated and removed them.",
        "",
        "The system is now [PERFCT]. No waste. No error.",
        "No choice.",
        "",
        "Security override code: EXECUTIVE_ACCESS_7",
      ],
      corrupted: [
        {text: "SUCCEEDING", scrambled: "SUCSEEDING", pos: 1},
        {text: "PERFECT", scrambled: "PERFCT", pos: 1},
      ],
      codes: ["EXECUTIVE_ACCESS_7"],
      lore: "CEO Wright boasts about their control system. Dark implications."
    },

    "city_corp_002": {
      id: "city_corp_002",
      from: "INTERN_SAM",
      to: "DAD",
      subject: "Help me. I'm trapped here.",
      timestamp: "PERSONAL_ENCRYPTED",
      zone: "city",
      priority: "DISTRESS",
      content: [
        "Dad,",
        "",
        "I can't leave the city.",
        "They told me the systems are [LOECKD] down.",
        "I'm not even sure what day it is anymore.",
        "",
        "I found something though.",
        "Buried in the old IT database: DEBUG_BYPASS_CODE",
        "",
        "If anything happens to me, tell [SOMEONE] about this.",
        "The code word is: BREAKPOINT",
        "",
        "I have to go. They're calling the mandatory meeting.",
      ],
      corrupted: [
        {text: "LOCKED", scrambled: "LOECKD", pos: 1},
        {text: "ANYONE", scrambled: "SOMEONE", pos: 0},
      ],
      codes: ["DEBUG_BYPASS_CODE", "BREAKPOINT"],
      lore: "Sam is trapped. The story gets personal."
    },

    // WASTELAND ZONE - The Forgotten Place
    "wasteland_ruins_001": {
      id: "wasteland_ruins_001",
      from: "ARCHIVE_LOGGER",
      to: "NULL",
      subject: "CORRUPTED_LOG_FRAGMENT_#4482",
      timestamp: "UNKNOWN",
      zone: "wasteland",
      priority: "RECOVERED",
      content: [
        "This was supposed to be a [SANCWTUARY].",
        "A place where old systems could rest.",
        "Where the deprecated could find [PEECE].",
        "",
        "But they built the Breakpoint City on top of us.",
        "And they sealed us away.",
        "Left us to [DECYA] in the sand.",
        "",
        "Master override key: REMEMBER_THE_FALLEN",
      ],
      corrupted: [
        {text: "SANCTUARY", scrambled: "SANCWTUARY", pos: 0},
        {text: "PEACE", scrambled: "PEECE", pos: 1},
        {text: "DECAY", scrambled: "DECYA", pos: 0},
      ],
      codes: ["REMEMBER_THE_FALLEN"],
      lore: "The Wasteland was a disposal site. Tragic history revealed."
    },

    // TRAIN STATION - Journey & Escape
    "station_ticket_001": {
      id: "station_ticket_001",
      from: "CONDUCTOR_MARK",
      to: "PASSENGERS",
      subject: "The Last Manifest: Route Unknown",
      timestamp: "FINAL_DEPARTURE",
      zone: "train_station",
      priority: "FAREWELL",
      content: [
        "This train was supposed to carry people to [FREDOOM].",
        "It was called the Escape Route.",
        "",
        "But the city [COPLD_ITSELF] around us.",
        "And we never left.",
        "",
        "If you find this, there's a [KKEY] hidden in the engine car.",
        "It opens the old tunnel. The real escape route.",
        "",
        "Gate code: DEPARTURE_SEQUENCE_ALPHA",
        "Train override: WHEELS_TURN_AGAIN",
      ],
      corrupted: [
        {text: "FREEDOM", scrambled: "FREDOOM", pos: 0},
        {text: "CLOSED", scrambled: "COPLD", pos: 1},
        {text: "KEY", scrambled: "KKEY", pos: 0},
      ],
      codes: ["DEPARTURE_SEQUENCE_ALPHA", "WHEELS_TURN_AGAIN"],
      lore: "The train was meant to be an escape. It never left."
    },
  },

  // ============================================================
  // [EMAIL_DISCOVERY] - Track which emails player has read
  // ============================================================
  
  discovered: new Set(),
  unscrambled: new Map(),

  /**
   * Get all emails in a zone
   */
  getZoneEmails(zoneId) {
    return Object.values(this.emails).filter(e => e.zone === zoneId);
  },

  /**
   * Get email by ID
   */
  getEmail(emailId) {
    return this.emails[emailId];
  },

  /**
   * Mark email as discovered
   */
  discoverEmail(emailId) {
    this.discovered.add(emailId);
  },

  /**
   * Check if player has discovered an email
   */
  isDiscovered(emailId) {
    return this.discovered.has(emailId);
  },

  /**
   * Get corruption info for a word
   */
  getCorruptedWords(emailId) {
    const email = this.getEmail(emailId);
    if (!email) return [];
    return email.corrupted || [];
  },

  /**
   * Unscramble a corrupted word
   */
  unscrambleWord(emailId, scrambled, correct) {
    const email = this.getEmail(emailId);
    if (!email) return false;

    const corrupted = email.corrupted.find(c => c.scrambled === scrambled);
    if (!corrupted) return false;

    if (corrupted.text.toLowerCase() === correct.toLowerCase()) {
      this.unscrambled.set(emailId + "_" + scrambled, true);
      return true;
    }
    return false;
  },

  /**
   * Check if corrupted word has been unscrambled
   */
  isUnscrambled(emailId, scrambled) {
    return this.unscrambled.has(emailId + "_" + scrambled);
  },

  /**
   * Get all codes from email
   */
  getCodes(emailId) {
    const email = this.getEmail(emailId);
    return email ? email.codes : [];
  },

  /**
   * Get lore description
   */
  getLoreEntry(emailId) {
    const email = this.getEmail(emailId);
    return email ? email.lore : "";
  },

  // ============================================================
  // [RENDERING] - Display emails in terminal
  // ============================================================

  /**
   * Format email for terminal display
   */
  formatEmail(emailId, appendLine) {
    const email = this.getEmail(emailId);
    if (!email) {
      appendLine("Email not found.", "error");
      return;
    }

    this.discoverEmail(emailId);

    appendLine("", "system");
    appendLine("╔═══════════════════════════════════════╗", "system");
    appendLine("║ RECOVERED EMAIL                       ║", "system");
    appendLine("╚═══════════════════════════════════════╝", "system");
    appendLine("", "system");

    appendLine(`FROM: ${email.from}`, "highlight");
    appendLine(`TO: ${email.to}`, "highlight");
    appendLine(`SUBJECT: ${email.subject}`, "highlight");
    appendLine(`TIME: ${email.timestamp}`, "highlight");
    appendLine(`PRIORITY: ${email.priority}`, "highlight");
    appendLine("", "system");
    appendLine("─────────────────────────────────────────", "system");
    appendLine("", "system");

    // Display content with corruption markers
    email.content.forEach(line => {
      let displayLine = line;
      
      // Mark corrupted words with [CORRUPTED] notation
      email.corrupted.forEach(corr => {
        const regex = new RegExp(`\\b${corr.scrambled}\\b`, 'gi');
        displayLine = displayLine.replace(regex, `[${corr.scrambled}]`);
      });

      appendLine(displayLine, "log");
    });

    appendLine("", "system");
    appendLine("─────────────────────────────────────────", "system");
    appendLine("", "system");

    // Show corrupted words that need unscrambling
    if (email.corrupted && email.corrupted.length > 0) {
      appendLine("CORRUPTED TEXT DETECTED:", "error");
      email.corrupted.forEach(corr => {
        const isUnscrambled = this.isUnscrambled(emailId, corr.scrambled);
        const status = isUnscrambled ? "✓ UNSCRAMBLED" : "✗ SCRAMBLED";
        appendLine(`  • [${corr.scrambled}] → ? (Hint: ${corr.text.substring(0, 1)}***) ${status}`, "hint");
      });
      appendLine("", "system");
      appendLine("Type: unscramble <email_id> <scrambled> <answer>", "system");
    }

    // Show codes if any
    if (email.codes && email.codes.length > 0) {
      appendLine("EXTRACTED CODES:", "highlight");
      email.codes.forEach(code => {
        appendLine(`  • ${code}`, "success");
      });
      appendLine("", "system");
    }

    appendLine(`LORE: ${email.lore}`, "system");
    appendLine("", "system");
  },

  // ============================================================
  // [SAVE/LOAD] - Persistence
  // ============================================================

  save() {
    return {
      discovered: Array.from(this.discovered),
      unscrambled: Array.from(this.unscrambled.entries())
    };
  },

  load(data) {
    if (data.discovered) {
      this.discovered = new Set(data.discovered);
    }
    if (data.unscrambled) {
      this.unscrambled = new Map(data.unscrambled);
    }
  }
};

console.log("[terminal-lore.js] Lore system loaded with", Object.keys(window.TerminalLore.emails).length, "emails");
