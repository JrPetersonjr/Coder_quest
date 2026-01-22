// ============================================================
// BATTLE-ANIMATIONS.JS
// PHASE 4: BATTLE ANIMATION SYSTEM
//
// PURPOSE:
//   - Visualize combat with animations
//   - Enemy sprite movement and attacks
//   - Damage indicators and visual feedback
//   - Victory and defeat sequences
//   - Spell effect animations
//
// FEATURES:
//   - Enemy approach/attack animations
//   - Player damage flash (red overlay)
//   - Enemy damage shake
//   - Victory celebration sequence
//   - Defeat/game over sequence
//   - Spell effect visualizations
//
// ============================================================

window.BattleAnimations = {
  // ============================================================
  // [CONFIG] - Animation settings
  // ============================================================
  config: {
    enemyApproachDuration: 500,    // ms
    attackDuration: 300,            // ms
    damageDuration: 200,            // ms
    victoryDuration: 1500,          // ms
    defeatDuration: 2000,           // ms
    spellEffectDuration: 600,       // ms
  },

  // ============================================================
  // [STATE] - Runtime state
  // ============================================================
  state: {
    isAnimating: false,
    currentEnemyName: null,
    playerHealth: 100,
    enemyHealth: 100,
  },

  // ============================================================
  // [ENEMY_ANIMATIONS] - Enemy-specific sequences
  // ============================================================

  /**
   * Enemy enters combat (approach animation)
   */
  async enemyApproach(enemyName, gameEngine) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      this.state.currentEnemyName = enemyName;
      this.state.isAnimating = true;

      // Visual: Enemy approaches (slide in from right)
      output.style.transition = `all ${this.config.enemyApproachDuration}ms ease-out`;
      output.style.borderLeft = "5px solid #ff4444";
      output.style.transform = "translateX(10px)";

      // Audio: Enemy approach sound
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("battle_start");
      }

      setTimeout(() => {
        output.style.transition = "";
        this.state.isAnimating = false;
        resolve();
      }, this.config.enemyApproachDuration);
    });
  },

  /**
   * Enemy attacks player
   */
  async enemyAttack(enemyName, damage, gameEngine) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      this.state.isAnimating = true;

      // Visual: Attack flash (red glow)
      output.style.boxShadow = "0 0 20px rgba(255, 0, 0, 0.8) inset";
      
      // Audio: Enemy attack sound
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("enemy_attack");
      }

      // Player takes damage - flash effect
      this.playerDamageFlash(damage);

      setTimeout(() => {
        output.style.boxShadow = "";
        this.state.isAnimating = false;
        resolve();
      }, this.config.attackDuration);
    });
  },

  /**
   * Player attacks enemy
   */
  async playerAttack(enemyName, damage, gameEngine) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      this.state.isAnimating = true;

      // Visual: Player attack (pulse outward)
      output.style.transform = "scale(1.05)";
      output.style.borderLeft = "5px solid #44ff44";
      
      // Audio: Player attack
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("attack_hit");
      }

      // Enemy takes damage - shake effect
      this.enemyDamageShake();

      setTimeout(() => {
        output.style.transform = "";
        output.style.borderLeft = "5px solid #2fb43a";
        this.state.isAnimating = false;
        resolve();
      }, this.config.attackDuration);
    });
  },

  /**
   * Spell effect animation
   */
  async spellEffect(spellName, gameEngine) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      this.state.isAnimating = true;

      // Visual: Spell casting glow
      output.style.transition = `all ${this.config.spellEffectDuration}ms ease-out`;
      output.style.boxShadow = "0 0 30px rgba(100, 200, 255, 0.9)";
      output.style.backgroundColor = "rgba(100, 150, 255, 0.1)";

      // Audio: Spell effect
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("spell_cast");
      }

      setTimeout(() => {
        output.style.transition = "";
        output.style.boxShadow = "";
        output.style.backgroundColor = "";
        this.state.isAnimating = false;
        resolve();
      }, this.config.spellEffectDuration);
    });
  },

  // ============================================================
  // [DAMAGE_FEEDBACK] - Visual damage indicators
  // ============================================================

  /**
   * Player takes damage - red flash
   */
  playerDamageFlash(damage) {
    const output = document.getElementById("output");
    if (!output) return;

    output.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    
    setTimeout(() => {
      output.style.backgroundColor = "";
    }, this.config.damageDuration);
  },

  /**
   * Enemy takes damage - screen shake
   */
  enemyDamageShake() {
    const output = document.getElementById("output");
    if (!output) return;

    const startTime = Date.now();
    const duration = this.config.damageDuration;

    const shake = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Intensity decreases over time
      const intensity = (1 - progress) * 3;
      const offsetX = (Math.random() - 0.5) * intensity * 15;
      const offsetY = (Math.random() - 0.5) * intensity * 10;

      output.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

      if (progress < 1) {
        requestAnimationFrame(shake);
      } else {
        output.style.transform = "";
      }
    };

    shake();
  },

  /**
   * Health bar pulse (visual indicator)
   */
  healthPulse(isPlayer = true) {
    const hpElement = document.getElementById(
      isPlayer ? "player-hp" : "enemy-hp"
    );
    
    if (!hpElement) return;

    hpElement.style.animation = "pulse 0.3s ease-out";
    
    setTimeout(() => {
      hpElement.style.animation = "";
    }, 300);
  },

  // ============================================================
  // [OUTCOME_SEQUENCES] - Victory/Defeat
  // ============================================================

  /**
   * Victory sequence
   */
  async victorySequence(gameEngine) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      this.state.isAnimating = true;

      // Audio: Victory fanfare
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("victory");
      }

      // Visual: Victory glow (expanding green)
      output.style.transition = `all ${this.config.victoryDuration}ms ease-out`;
      output.style.boxShadow = "0 0 50px rgba(0, 255, 0, 0.8)";
      output.style.borderLeft = "5px solid #44ff44";
      output.style.backgroundColor = "rgba(0, 100, 0, 0.15)";

      // Celebration text
      gameEngine.output("", "system");
      gameEngine.output("=".repeat(40), "battle");
      gameEngine.output("✓ VICTORY!", "highlight");
      gameEngine.output("=".repeat(40), "battle");
      gameEngine.output("", "system");

      setTimeout(() => {
        output.style.transition = "";
        output.style.boxShadow = "";
        output.style.borderLeft = "5px solid #2fb43a";
        output.style.backgroundColor = "";
        this.state.isAnimating = false;
        resolve();
      }, this.config.victoryDuration);
    });
  },

  /**
   * Defeat sequence
   */
  async defeatSequence(gameEngine) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      this.state.isAnimating = true;

      // Audio: Defeat sound
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("defeat");
      }

      // Visual: Defeat (red fade to black)
      output.style.transition = `all ${this.config.defeatDuration}ms ease-in`;
      output.style.boxShadow = "0 0 50px rgba(255, 0, 0, 0.8) inset";
      output.style.borderLeft = "5px solid #ff0000";
      output.style.backgroundColor = "rgba(100, 0, 0, 0.3)";
      output.style.opacity = "0.6";

      // Defeat text
      gameEngine.output("", "system");
      gameEngine.output("=".repeat(40), "error");
      gameEngine.output("✗ DEFEATED", "error");
      gameEngine.output("=".repeat(40), "error");
      gameEngine.output("", "system");

      setTimeout(() => {
        output.style.transition = "";
        output.style.boxShadow = "";
        output.style.borderLeft = "5px solid #2fb43a";
        output.style.backgroundColor = "";
        output.style.opacity = "1";
        this.state.isAnimating = false;
        resolve();
      }, this.config.defeatDuration);
    });
  },

  // ============================================================
  // [COMBAT_FLOW] - Full battle animation sequences
  // ============================================================

  /**
   * Start of battle animation
   */
  async startBattle(enemyName, gameEngine) {
    console.log(`[BattleAnimations] Starting battle vs ${enemyName}`);
    await this.enemyApproach(enemyName, gameEngine);
  },

  /**
   * Player turn animation
   */
  async playerTurn(enemyName, damage, gameEngine) {
    console.log(`[BattleAnimations] Player attacks for ${damage} damage`);
    await this.playerAttack(enemyName, damage, gameEngine);
    this.healthPulse(false); // Pulse enemy HP
  },

  /**
   * Enemy turn animation
   */
  async enemyTurn(enemyName, damage, gameEngine) {
    console.log(`[BattleAnimations] ${enemyName} attacks for ${damage} damage`);
    await this.enemyAttack(enemyName, damage, gameEngine);
    this.healthPulse(true); // Pulse player HP
  },

  /**
   * Spell cast animation
   */
  async castSpell(spellName, gameEngine) {
    console.log(`[BattleAnimations] Casting spell: ${spellName}`);
    await this.spellEffect(spellName, gameEngine);
  },

  // ============================================================
  // [INTEGRATION_HOOKS] - Connect to GameEngine
  // ============================================================

  /**
   * Hook into GameEngine battle system
   */
  setupGameEngineIntegration(gameEngine) {
    // Store reference to original attack
    const originalAttack = gameEngine.attack.bind(gameEngine);
    
    // Wrap attack with animation
    gameEngine.attack = async function(args) {
      // Show player attacking
      await BattleAnimations.playerTurn(
        this.gameState.currentEnemy?.name || "Enemy",
        this.gameState.currentEnemy?.hp || 0,
        this
      );
      
      // Call original attack logic
      return originalAttack(args);
    };

    // Store reference to original endBattle
    const originalEndBattle = gameEngine.endBattle.bind(gameEngine);
    
    // Wrap endBattle with outcome animation
    gameEngine.endBattle = async function(playerWon) {
      if (playerWon) {
        await BattleAnimations.victorySequence(this);
      } else {
        await BattleAnimations.defeatSequence(this);
      }
      
      // Call original endBattle logic
      return originalEndBattle(playerWon);
    };

    console.log("[BattleAnimations] Integrated with GameEngine");
  },

  // ============================================================
  // [CSS_ANIMATIONS] - Add to stylesheet
  // ============================================================
  // Add this to your CSS:
  /*
  @keyframes battlePulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.03);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes damageFlash {
    0%, 100% {
      background-color: transparent;
    }
    50% {
      background-color: rgba(255, 0, 0, 0.3);
    }
  }

  @keyframes victoryGlow {
    0% {
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
    }
    100% {
      box-shadow: 0 0 50px rgba(0, 255, 0, 0.4);
    }
  }

  .battle-damage {
    animation: damageFlash 0.2s ease-out;
  }

  .battle-victory {
    animation: victoryGlow 1.5s ease-out;
  }
  */
};

// ============================================================
// [AUTO-INITIALIZATION] - Register with GameEngine
// ============================================================

/**
 * Call this during game initialization to enable battle animations
 */
function initializeBattleAnimations(gameEngine) {
  BattleAnimations.setupGameEngineIntegration(gameEngine);
  console.log("[Animations] Battle animation system initialized");
}
