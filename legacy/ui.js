// ===== UI RENDERING =====
function renderPage(pageId) {
  if (!PAGES[pageId]) return;
  const page = PAGES[pageId];
  document.getElementById("title").textContent = page.title;
  document.getElementById("text").textContent = page.text;
  document.getElementById("ascii").textContent = page.ascii;
  gameState.currentPage = pageId;
}

function addOutput(text, type = "") {
  const div = document.createElement("div");
  div.className = "line " + type;
  div.textContent = text;
  document.getElementById("output").appendChild(div);
  document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
}

function clearOutput() {
  document.getElementById("output").innerHTML = "";
}

function updateUI() {
  document.getElementById("hp").textContent = gameState.hp + "/" + gameState.maxHp;
  document.getElementById("mp").textContent = gameState.mp + "/" + gameState.maxMp;
  document.getElementById("level").textContent = gameState.level;
  document.getElementById("class").textContent = CLASSES[gameState.selectedClass]?.name || "None";
  document.getElementById("exp").textContent = gameState.exp + "/" + gameState.nextExp;

  const spellHTML = gameState.spells.map(s => `<div class="sidebar-item">• ${s}</div>`).join("");
  document.getElementById("spells").innerHTML = spellHTML || '<div class="sidebar-item">None</div>';

  const invHTML = gameState.inventory.length > 0
    ? gameState.inventory.map(i => `<div class="sidebar-item">• ${i}</div>`).join("")
    : '<div class="sidebar-item">Empty</div>';
  document.getElementById("inventory").innerHTML = invHTML;

  const defHTML = Object.keys(gameState.definitions).length > 0
    ? Object.entries(gameState.definitions).map(([k, v]) => `<div class="sidebar-item">${k}: ${v}</div>`).join("")
    : '<div class="sidebar-item">None</div>';
  document.getElementById("definitions").innerHTML = defHTML;

  const questHTML = Object.values(gameState.quests).map(q => 
    `<div class="sidebar-item">${q.complete ? '✓' : '•'} ${q.name}</div>`
  ).join("");
  document.getElementById("quests").innerHTML = questHTML;
}

function updateBattleUI() {
  if (!gameState.currentEnemy) return;
  const enemy = gameState.currentEnemy;
  const playerHPPercent = (gameState.hp / gameState.maxHp) * 100;
  const enemyHPPercent = (enemy.hp / enemy.maxHp) * 100;

  document.getElementById("player-hp-fill").style.width = playerHPPercent + "%";
  document.getElementById("player-hp-text").textContent = gameState.hp + "/" + gameState.maxHp;

  document.getElementById("enemy-hp-fill").style.width = enemyHPPercent + "%";
  document.getElementById("enemy-hp-text").textContent = enemy.hp + "/" + enemy.maxHp;
}

function showScreen(screenId) {
  document.getElementById("boot-screen").style.display = "none";
  document.getElementById("char-creation-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById(screenId).style.display = "block";
}

function addBattleLog(text, type = "normal") {
  const div = document.createElement("div");
  div.className = "battle-action " + type;
  div.textContent = text;
  document.getElementById("battle-log").appendChild(div);
  document.getElementById("battle-log").scrollTop = document.getElementById("battle-log").scrollHeight;
}