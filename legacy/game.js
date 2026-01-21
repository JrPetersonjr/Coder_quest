// ===== BOOT SEQUENCE =====
// At game start, restore saved state
function initGame() {
  // Try to load existing save
  const saved = window.storage.get("game:state");
  if (saved) {
    Object.assign(gameState, JSON.parse(saved.value));
    addOutput("Previous save restored!", "highlight");
  }
  
  // Try to load terminal progress
  loadTerminalProgress();
  
  // Setup auto-save every 30 seconds
  setInterval(() => {
    saveGameState();
    saveTerminalProgress();
  }, 30000);
  
  updateUI();
  dramaticIntro();
}
async function bootSequence() {
  const bootFill = document.getElementById("boot-fill");
  const bootPercent = document.getElementById("boot-percent");
  const bootText = document.getElementById("boot-text");

  const bootMessages = [
    "Loading reality engine...",
    "Syncing consciousness...",
    "Calibrating definitions...",
    "Initializing particle system...",
    "Connecting to void...",
    "Awaiting your arrival...",
    "TECHNOMANCER READY"
  ];

  // Try to generate boot MIDI if function exists
  if (typeof generateBootMIDI === 'function') {
    generateBootMIDI();
  }

  for (let i = 0; i <= 100; i++) {
    bootFill.style.width = i + "%";
    bootPercent.textContent = i + "%";
    bootText.textContent = bootMessages[Math.floor(i / 15)];
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  setTimeout(() => {
    document.getElementById("boot-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    gameState.stage = "game";
    dramaticIntro();
  }, 500);
}

// ===== CHARACTER CREATION =====
async function startCharCreation() {
  const content = document.getElementById("char-content");
  content.innerHTML = `
    <div class="char-creation">
      <h2>INITIALIZING CONSCIOUSNESS</h2>
      <div class="question-box">
        <p>Consulting Hugging Face...</p>
        <button class="choice-btn" onclick="askAI()">CONSULT AI</button>
        <button class="choice-btn" onclick="skipAI()">SKIP AI</button>
      </div>
    </div>
  `;
}

async function askAI() {
  const content = document.getElementById("char-content");
  content.innerHTML = `<div class="char-creation"><p>Contacting Hugging Face...</p></div>`;
  skipAI(); // Fallback for now
}

function skipAI() {
  const questions = [
    "Do you approach problems with logic or intuition?",
    "What is your relationship with chaos and order?",
    "How do you respond to the unexpected?"
  ];
  const q = questions[Math.floor(Math.random() * questions.length)];
  showClassSelection(q);
}

function showClassSelection(question) {
  const content = document.getElementById("char-content");
  content.innerHTML = `
    <div class="char-creation">
      <h2>INITIALIZING CONSCIOUSNESS</h2>
      <div class="question-box">
        <p><em>${question}</em></p>
        <p style="margin-top: 20px;">Choose your class:</p>
        <div class="class-grid">
          ${Object.entries(CLASSES).map(([key, cls]) => `
            <div class="class-card" onclick="selectClass('${key}')">
              <h3>${cls.name}</h3>
              <p>${cls.desc}</p>
              <div class="class-stats">
                HP: ${cls.stats.hp} | MP: ${cls.stats.mp}<br>
                ATK: ${cls.stats.atk} | DEF: ${cls.stats.def}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function selectClass(classKey) {
  gameState.selectedClass = classKey;
  const cls = CLASSES[classKey];
  gameState.hp = cls.stats.hp;
  gameState.maxHp = cls.stats.hp;
  gameState.mp = cls.stats.mp;
  gameState.maxMp = cls.stats.mp;
  gameState.spells = cls.spells;

  const content = document.getElementById("char-content");
  content.innerHTML = `
    <div class="char-creation">
      <h2>INITIALIZING CONSCIOUSNESS</h2>
      <div class="question-box">
        <p>You are now a <strong>${cls.name}</strong></p>
        <p style="margin-top: 20px;">Choose your connection to The Consciousness:</p>
        <button class="choice-btn" onclick="selectConnection('online')">🌐 ONLINE (AI-Guided)</button>
        <button class="choice-btn" onclick="selectConnection('local')">🖥️ LOCAL (Simulation)</button>
        <button class="choice-btn" onclick="selectConnection('none')">⚙️ NONE (Logic Only)</button>
      </div>
    </div>
  `;
}

function selectConnection(conn) {
  gameState.selectedConnection = conn;
  showScreen("game-screen");
  initGame();
}

// ===== GAME INITIALIZATION =====
function initGame() {
  const cls = CLASSES[gameState.selectedClass];
  addOutput(`Welcome, ${cls.name}!`, "system");
  addOutput(`Connection: ${gameState.selectedConnection.toUpperCase()}`, "system");
  addOutput("Type 'help' for commands", "system");
  addOutput("");
  renderPage("boot");
  updateUI();
  playSound("success");
}

// ===== COMMAND HANDLER =====
function handleCommand() {
  const inputEl = document.getElementById("input");
  const input = inputEl.value.trim();
  inputEl.value = "";
  if (!input) return;

  // If in a real-world terminal, route input there
  if (terminalState.active) {
    handleTerminalInput(input);
    return;
  }

  addOutput("> " + input, "cmd");
  const parts = input.toLowerCase().split(" ");
  const cmd = parts[0];
  const args = parts.slice(1).join(" ");

  switch(cmd) {
    case "help":
      addOutput("=== CORE COMMANDS ===");
      addOutput("look - observe current area");
      addOutput("cd <zone> - travel: fantasy, dystopia, retro, internal, crypt");
      addOutput("ls - list zones");
      addOutput("=== GAME ===");
      addOutput("define <n> <v> - create concept");
      addOutput("cast <spell> - cast spell");
      addOutput("battle <enemy> - JRPG battle");
      addOutput("attack | run - battle actions");
      addOutput("stats - view stats");
      addOutput("=== ADVANCED ===");
      addOutput("debug <enemy> - reveal weakness");
      addOutput("mkdir save - create save folder");
      addOutput("touch save/game.dat - unlock save!");
      break;

    case "look":
      addOutput(PAGES[gameState.currentPage].text);
      break;

    case "ls":
      addOutput("Zones: fantasy, dystopia, retro, internal, crypt");
      break;

    case "cd":
      if (PAGES[args]) {
        renderPage(args);
        addOutput(`Traveled to ${args}`);
        playSound("success");

        // Zone terminal hint
        const zoneTerminals = Object.values(TERMINALS).filter(t => t.zone === args);
        if (zoneTerminals.length > 0) {
          addOutput("You sense an old-world terminal nearby. Try: terminals", "system");
        }
      } else {
        addOutput("Unknown zone", "error");
      }
      break;

    case "define":
      const parts2 = input.split(" ");
      if (parts2.length < 3) {
        addOutput("Usage: define <n> <value>", "error");
        break;
      }
      const key = parts2[1];
      const val = parts2.slice(2).join(" ");
      gameState.definitions[key] = val;
      addOutput("✦ Reality shifts...", "system");
      addOutput(`"${key}" = ${val}`);
      playSound("spell");
      updateUI();
      break;

    case "battle":
      startJRPGBattle(args || "syntax-imp");
      break;

    case "cast":
      castSpell(args);
      break;

    case "attack":
      playerAttack();
      break;

    case "run":
      playerRun();
      break;

    case "debug":
      if (ENEMIES[args]) {
        addOutput(`${args}: Weakness is '${ENEMIES[args].weakness}'`, "system");
      } else {
        addOutput("Unknown enemy", "error");
      }
      break;

    case "mkdir":
      if (args === "save") {
        if (!gameState.inventory.includes("save folder")) {
          gameState.inventory.push("save folder");
          addOutput("Directory created: save/", "system");
          updateUI();
        }
      }
      break;

    case "touch":
      if (args === "save/game.dat" && gameState.inventory.includes("save folder")) {
        gameState.saveUnlocked = true;
        gameState.quests.mission2.complete = true;
        gameState.inventory.push("game.dat");
        addOutput("✦ MISSION 2 COMPLETE!", "system");
        addOutput("Save function UNLOCKED!", "system");
        gameState.exp += 50;
        updateUI();
      } else if (!gameState.inventory.includes("save folder")) {
        addOutput("Error: Directory does not exist. Try: mkdir save", "error");
      }
      break;

    case "stats":
      addOutput(`HP: ${gameState.hp}/${gameState.maxHp} | MP: ${gameState.mp}/${gameState.maxMp}`);
      addOutput(`Level ${gameState.level} | EXP ${gameState.exp}/${gameState.nextExp}`);
      addOutput(`Class: ${CLASSES[gameState.selectedClass].name}`);
      break;

    default:
      addOutput("Unknown command. Type 'help'", "error");
  }
}

// ===== INITIALIZE =====
// Note: Input handling is now done in GameUI.js
// This code is kept for compatibility with legacy system
const gameInputEl = document.getElementById("console-input") || document.getElementById("input");
if (gameInputEl) {
  gameInputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleCommand();
  });
}

// DISABLED in favor of new modular GameEngine + GameUI system
// window.addEventListener("load", () => {
//   bootSequence();
// });