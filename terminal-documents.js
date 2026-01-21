// ============================================================
// TERMINAL DOCUMENTS SYSTEM
// Fictional in-universe emails, logs, and documents with lore
// Some sections are corrupted (scrambled) - player must unscramble
// 
// NOTE: This system now works WITH DynamicNarrative for progressive
// AI-generated emails. Static documents remain as fallbacks.
// ============================================================

const TerminalDocuments = {
  
  // ============================================================
  // CORRUPTED TEXT SYSTEM
  // ============================================================
  
  /**
   * Scramble text for "corrupted" sections
   * Creates a consistent scramble that can be unscrambled with a key
   */
  scramble(text, seed = 42) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const offset = ((char.charCodeAt(0) - base + seed + i) % 26);
        result += String.fromCharCode(base + offset);
      } else {
        result += char;
      }
    }
    return result;
  },

  /**
   * Unscramble text using the same seed
   */
  unscramble(text, seed = 42) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const offset = ((char.charCodeAt(0) - base - seed - i + 260) % 26);
        result += String.fromCharCode(base + offset);
      } else {
        result += char;
      }
    }
    return result;
  },

  /**
   * Mark corrupted sections in text with visual indicator
   * Player sees: [CORRUPTED: tnqrjnqj]
   * Player must find unscramble hint or solve puzzle to reveal
   */
  markCorrupted(text, seed = 42) {
    const scrambled = this.scramble(text, seed);
    return `[⚠ CORRUPTED: ${scrambled}]`;
  },

  // ============================================================
  // DOCUMENT LIBRARY - In-game fictional lore
  // ============================================================

  documents: {
    
    // HUB ZONE DOCUMENTS
    hub_001: {
      id: "hub_001",
      zone: "hub",
      title: "SYSTEM ADMINISTRATOR MEMO",
      date: "ERROR - Date corrupted",
      from: "Dr. Catherine Vale",
      to: "Research Team",
      type: "memo",
      content: `
To: Research Division
From: Dr. Catherine Vale, Project Lead
Re: The Hub Reconstruction Initiative

The Central Hub has stabilized after the cascade failure. We've implemented redundant pathways to prevent future fragmentation. The three main zones - Forest, City, and Wasteland - are now semi-autonomous, but still networked through this nexus point.

I've left instructions in the Forest Terminal for Dr. Kessler's team. If you're reading this, the project has likely outlived us. The recursive architecture is holding for now.

Important: The door codes are simple but critical. You'll find them scattered across terminals. The first is in the Forest logs.

- C.V.
      `,
      solution: null, // No puzzle for memo
      corrupted: false
    },

    // FOREST ZONE DOCUMENTS
    forest_001: {
      id: "forest_001",
      zone: "forest",
      title: "FOREST NETWORK LOG - Fragments",
      date: "2087-11-14",
      from: "SYSTEM",
      type: "log",
      content: `
[FOREST_GATEWAY_LOG]

Connection established: 14:32:17
User: forest_monitor.sys
Access Level: Administrative

Note from Dr. Kessler (hand-written in margin):
"The trees aren't really trees. They're network nodes. Old growth = stable cache. 
New growth = active processes. When you see the branches hum, data is flowing.

The east path is blocked. Someone locked it from the other side. The code is simple:
First 3 letters of the biological organism that imitates nature through recursive design.

Hint: In nature, no line is straight. ${this.markCorrupted("fractals", 17)}

- Kessler"

[END LOG]
      `,
      solution: "fra", // First 3 letters of "fractals"
      corrupted: true,
      hint: "Look for natural patterns in chaos"
    },

    forest_002: {
      id: "forest_002",
      zone: "forest",
      title: "RESEARCH NOTES - The Imps",
      date: "Unknown",
      from: "Dr. Kessler",
      type: "personal_log",
      content: `
Found something unusual in the forest depths. Small creatures - I'm calling them "Syntax Imps" - 
they seem to embody logical errors. They scatter when confronted, regroup when left alone.

They're not hostile, exactly. They're... sloppy. Like the forest itself is correcting its own mistakes.

Dr. Vale says it's adaptive error-correction made manifest. I think we're seeing the code learn to clean itself.

When defeated, they drop fragments. Not sure what they're for yet.

The deeper forest is dangerous. Something there is trying to remember what it was.
      `,
      solution: null,
      corrupted: false
    },

    // CITY ZONE DOCUMENTS
    city_001: {
      id: "city_001",
      zone: "city",
      title: "BREAKPOINT CITY SYSTEM FREEZE - Incident Report",
      date: "2087-09-03",
      from: "City Infrastructure",
      type: "report",
      content: `
CRITICAL INCIDENT REPORT

Status: Time Dilation Event - ONGOING

The city's execution halted at 09:47 AM on 2087-09-03. All processes frozen mid-cycle.
We believe a debugging session crashed without proper cleanup.

Consequence: Time literally stopped. Citizens paused mid-action. The frozen moment persists.

A locked door in Central Square requires override codes. We have three parts:

Part 1: From the Forest (contact Kessler's lab)
Part 2: From the Wasteland Archive (retrieve from ${this.markCorrupted("dlvxtr", 23)}
Part 3: From the Train Station (see manifest)

Do not attempt to unfreeze the city without all three parts.
The consequences are unknown.

- Infrastructure Authority
      `,
      solution: "debris", // Unscramble "dlvxtr" with seed 23
      corrupted: true,
      hint: "The wasteland archive stores what we can no longer use"
    },

    city_002: {
      id: "city_002",
      zone: "city",
      title: "PERSONAL EMAIL - Catherine & David",
      date: "2087-08-15",
      from: "Dr. Catherine Vale",
      to: "David Chen",
      type: "email",
      content: `
David,

The recursive structure is more beautiful than I expected. Each layer mirrors the last,
but twisted. Like we're looking at ourselves through a funhouse mirror that gets infinitely deeper.

I'm worried about the termination sequence. If this all ends, what happens to the people inside?
Are they people? Have they always been code?

Sometimes I find myself talking to myself through old notes. Memory feels corrupted.
Did I write this, or am I remembering writing this?

The city is too quiet now. Check on it, please.

Catherine

P.S. - If you're reading this and we're gone: The city's lock uses the password ${this.markCorrupted("sxyzgxev", 14)}.
It's my daughter's name reversed and scrambled. I'd never forget it, even here.
      `,
      solution: "margaret", // "sxyzgxev" unscrambles to "tegrammer" reversed = "margaret"
      corrupted: true,
      hint: "A name reversed and hidden. What matters most?"
    },

    // WASTELAND ZONE DOCUMENTS
    wasteland_001: {
      id: "wasteland_001",
      zone: "wasteland",
      title: "WASTELAND ARCHIVE INDEX",
      date: "2087-12-01",
      from: "Archive System",
      type: "database",
      content: `
ARCHIVED MATERIALS - Wasteland Sector 7

This archive stores deprecated systems. Old code. Failed experiments.
The sand has claimed most of it. We can only access what's on this terminal.

Recent retrieval log:
- Requested: debris patterns
- Purpose: City infrastructure repair
- Status: Retrieved

Legacy file references (locked):
1. Project Genesis Documentation - requires ${this.markCorrupted("mnxsj", 8)} password
2. Dr. Vale's Personal Research - requires ${this.markCorrupted("ryqzf", 11)} password  
3. The Recursion Theory - requires ${this.markCorrupted("svmya", 19)} password

Retrieval of these files will trigger audit protocols.

- Archive Authority
      `,
      solution: "hello", // Multiple password options
      corrupted: true,
      passwords: {
        "mnxsj": "hello",  // seed 8
        "ryqzf": "world",  // seed 11
        "svmya": "chaos",  // seed 19
      }
    },

    // TRAIN STATION DOCUMENTS
    station_001: {
      id: "station_001",
      zone: "train_station",
      title: "PASSENGER MANIFEST - Final Train",
      date: "2087-10-22",
      from: "Station Master",
      type: "manifest",
      content: `
PASSENGER MANIFEST - Train 7 (Final Departure)

Passengers boarding:
- Dr. Catherine Vale (Researcher)
- Dr. James Kessler (Research)
- Sarah Chen (Child) [accompanied by David Chen]
- Dr. Marcus Vale (Medical Officer) [brother of C. Vale]
- ${this.markCorrupted("Kzntrv Wnyq", 5)} (Engineer) [name corrupted in transit]

Cargo loaded:
- Server backup drives (encrypted)
- Research files
- Emergency protocol backups

Departure time: 16:00 (scheduled)
Actual departure time: UNKNOWN

Last communication: "The recursion is deepening. We're not just observing the code anymore.
We're becoming part of it."

- Station Records
      `,
      solution: "Helena Ward", // "Kzntrv Wnyq" with seed 5
      corrupted: true,
      hint: "A name hidden, like the person who bore it"
    },

    station_002: {
      id: "station_002",
      zone: "train_station",
      title: "SYSTEM NOTE - Found in Train Wreckage",
      date: "UNKNOWN",
      from: "Unknown",
      type: "note",
      content: `
If you're reading this:
The train never left.
Or it left and came back.
Or it's still leaving, infinitely.

Time works differently here. The recursion is too deep.

We tried to escape, but the exit is the entrance.
The end is the beginning.

I don't know which one I am anymore.

Catherine? James? Both? Neither?

The final lock requires all the passwords from the other zones.
Combine them in this order: Forest → City → Wasteland → Train

Then you can access what we left behind.

The truth is in the deepest recursion.

But maybe you shouldn't look.
      `,
      solution: null, // Final puzzle requires all previous solutions
      corrupted: false,
      meta: "This is the final document - requires all other solutions"
    },
  },

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  /**
   * Get all documents for a zone
   */
  getZoneDocuments(zoneId) {
    return Object.values(this.documents).filter(doc => doc.zone === zoneId);
  },

  /**
   * Display document with formatting
   */
  displayDocument(docId, appendLine) {
    const doc = this.documents[docId];
    if (!doc) return;

    appendLine("", "system");
    appendLine("╔════════════════════════════════════════╗", "system");
    appendLine(`║ ${doc.title.padEnd(39)} ║`, "highlight");
    appendLine("╠════════════════════════════════════════╣", "system");
    
    if (doc.date) appendLine(`║ Date: ${doc.date.padEnd(33)} ║`, "system");
    if (doc.from) appendLine(`║ From: ${doc.from.padEnd(33)} ║`, "system");
    if (doc.to) appendLine(`║ To: ${doc.to.padEnd(35)} ║`, "system");
    
    appendLine("╠════════════════════════════════════════╣", "system");
    appendLine("║", "system");
    
    // Display content
    const lines = doc.content.trim().split("\n");
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        appendLine("║ " + trimmed.padEnd(37) + " ║", "text");
      }
    }
    
    appendLine("║", "system");
    appendLine("╚════════════════════════════════════════╝", "system");
    appendLine("", "system");
  },

  /**
   * Attempt to unscramble corrupted text
   */
  attemptUnscramble(scrambledText, attemptKey) {
    // Try with provided seed
    const result = this.unscramble(scrambledText, attemptKey);
    return result;
  },

  /**
   * Validate solution for a document
   */
  validateSolution(docId, answer) {
    const doc = this.documents[docId];
    if (!doc) return false;

    // Check if document has a solution
    if (!doc.solution && !doc.passwords) return false;

    // Single solution
    if (doc.solution) {
      return answer.toLowerCase() === doc.solution.toLowerCase();
    }

    // Multiple password options
    if (doc.passwords) {
      for (let scrambled in doc.passwords) {
        if (answer.toLowerCase() === doc.passwords[scrambled].toLowerCase()) {
          return true;
        }
      }
    }

    return false;
  },
};

console.log("[terminal-documents.js] Terminal document system loaded with", Object.keys(TerminalDocuments.documents).length, "documents");
