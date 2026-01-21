// ============================================================
// CASTCONSOLE — UNIFIED BATTLE CORE
// JRPG + Typing battles, zone perks, level scaling
// ============================================================

window.CastBattle = {

  // ------------------------------------------------------------
  // JRPG BATTLE START
  // ------------------------------------------------------------
  startJRPG(gameState, enemyKey, log) {
    const base = CastEnemies[enemyKey];
    if (!base) {
      log("No such enemy manifests.", "error");
      return;
    }

    const enemy = JSON.parse(JSON.stringify(base));
    gameState.inBattle = true;
    gameState.battleMode = "jrpg";
    gameState.currentEnemy = enemy;

    log(`⚔ A ${enemy.name} materializes!`, "battle");
    log("Commands: attack, cast <spell>, run, stats, help.", "battle");
    
    // Wire narrative: Generate boss intro email
    if (window.BossEncounters && window.DynamicNarrative) {
      const bossConfig = window.BossEncounters.bosses[enemyKey];
      if (bossConfig) {
        DynamicNarrative.narrativeState.milestones.first_boss = true;
        DynamicNarrative.generateEmail(gameState, "boss_intro").then(email => {
          if (email) {
            gameState.emails = gameState.emails || [];
            gameState.emails.push(email);
            console.log("[BattleCore] Boss intro email generated for:", enemyKey);
          }
        }).catch(err => console.warn("[BattleCore] Could not generate boss email:", err));
      }
    }
  },

  // ------------------------------------------------------------
  // TYPING BATTLE START
  // ------------------------------------------------------------
  startTyping(gameState, enemyKey, log, setTypingPrompt) {
    const base = CastEnemies[enemyKey];
    if (!base) {
      log("No such enemy manifests.", "error");
      return;
    }

    const enemy = JSON.parse(JSON.stringify(base));
    gameState.inBattle = true;
    gameState.battleMode = "typing";
    gameState.currentEnemy = enemy;
    gameState.typingTarget = enemy.typingPrompt;

    log(`⌨ A ${enemy.name} phases in! TYPEBATTLE engaged.`, "battle");
    log(`Type exactly: ${enemy.typingPrompt}`, "battle");
    setTypingPrompt(enemy.typingPrompt);
  },

  // ------------------------------------------------------------
  // TYPING BATTLE RESOLUTION
  // ------------------------------------------------------------
  resolveTyping(gameState, input, log, enemyTurn, endBattle, setTypingPrompt) {
    const enemy = gameState.currentEnemy;
    if (!enemy) {
      log("No enemy to type against.", "error");
      return;
    }

    const target = gameState.typingTarget.trim();
    const attempt = input.trim();

    if (attempt === target) {
      const dmg = 10 + gameState.level * 2;
      enemy.hp -= dmg;
      log(`Perfect input! You deal ${dmg} damage to ${enemy.name}.`, "battle");

      if (enemy.hp <= 0) {
        endBattle(true);
        setTypingPrompt("");
      } else {
        enemyTurn();
      }
    } else {
      log("Your input glitches. The enemy surges!", "battle");
      enemyTurn();
    }
  }
};
