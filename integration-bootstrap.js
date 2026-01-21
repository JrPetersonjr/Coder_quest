/**
 * INTEGRATION BOOTSTRAP
 * Ties together all major systems: GameEngine + Dice + AI DM + Spell Tinkering
 * Run this AFTER all systems are loaded
 */

class IntegrationBootstrap {
  static initialize(gameEngine, diceSystem, aiDMIntegration) {
    console.log("[Integration] Bootstrapping systems...");

    // Ensure diceSystem is the singleton DiceSystem object
    if (!diceSystem) {
      diceSystem = window.DiceSystem;
    }

    // 1. Connect spell tinkering to GameEngine
    gameEngine.spellTinkering = new SpellTinkeringSystem(
      gameEngine.gameState,
      diceSystem,
      aiDMIntegration
    );

    // Initialize starting data
    gameEngine.spellTinkering.dataInventory.totalData = gameEngine.gameState.data || 100;

    // 2. Connect summon ritual system to GameEngine
    gameEngine.summonRituals = new AISummonRitualsystem(
      gameEngine.spellTinkering,
      aiDMIntegration,
      diceSystem
    );

    // 3. Sync character between GameEngine gameState and systems
    // Update character object whenever state changes
    const syncCharacter = () => {
      const gs = gameEngine.gameState;
      gs.character.level = gs.level;
      gs.character.hp = gs.hp;
      gs.character.maxHp = gs.maxHp;
      gs.character.mp = gs.mp;
      gs.character.maxMp = gs.maxMp;
      gs.character.experience = gs.exp;
    };
    
    // Call once on startup
    syncCharacter();
    
    // Setup state change hook to sync character
    const originalOnStateChange = gameEngine.onStateChange;
    gameEngine.onStateChange = (newState) => {
      syncCharacter();
      if (originalOnStateChange) {
        originalOnStateChange(newState);
      }
    };

    // 3. Register spell casting with AI DM for storytelling
    // When player casts a spell, AI DM can narrate the effect
    const originalCastSpell = gameEngine.castSpell.bind(gameEngine);
    gameEngine.castSpell = function(args) {
      originalCastSpell(args);
      
      // After casting, dispatch to AI DM for narrative integration
      if (this.spellTinkering && args.length >= 2) {
        const elements = [args[0].toLowerCase()];
        const codeBits = args.slice(1).map(b => b.toLowerCase());
        
        aiDMIntegration.dispatch({
          actionType: 'spell_cast',
          elements: elements,
          codeBits: codeBits,
          caster: this.gameState.character.name,
          inBattle: this.gameState.inBattle,
        });
      }
    };

    // 4. Register enemy defeat with AI DM + data harvesting
    const originalEndBattle = gameEngine.endBattle.bind(gameEngine);
    gameEngine.endBattle = function(victory) {
      originalEndBattle(victory);
      
      if (victory && this.gameState.currentEnemy) {
        const enemy = this.gameState.currentEnemy;
        
        // Dispatch to AI DM for narrative
        aiDMIntegration.dispatch({
          actionType: 'encounter',
          encounter: 'boss_defeat',
          enemyName: enemy.name,
          level: enemy.level,
          player: this.gameState.character.name,
        });
      }
    };

    // 5. Bootstrap character profile
    gameEngine.gameState.character = {
      name: "Player",
      level: gameEngine.gameState.level,
      experience: gameEngine.gameState.exp,
      hp: gameEngine.gameState.hp,
      maxHp: gameEngine.gameState.maxHp,
      mp: gameEngine.gameState.mp,
      maxMp: gameEngine.gameState.maxMp,
      equipment: {
        surveyenceSystem: { efficiency: 1.0 }
      }
    };

    // 6. Add help text for new commands
    gameEngine.helpText = {
      ...gameEngine.helpText,
      cast: "cast [element] [codebit]  - Craft and cast a spell (e.g., 'cast fire damage')",
      spells: "spells                   - List all spells you can currently craft",
      data: "data                     - Show your data inventory and collection items",
    };

    console.log("[Integration] ✅ All systems connected!");
    console.log("  - SpellTinkering: Ready");
    console.log("  - AI Summon Rituals: Ready");
    console.log("  - Dice System: Ready");
    console.log("  - AI DM Integration: Ready");
    console.log("  - GameEngine: Ready");
    console.log("[Integration] Commands available: cast, summon, allies, spells, data");
  }

  /**
   * Utility: Export full game state for saves
   */
  static exportGameState(gameEngine) {
    return {
      gameState: gameEngine.gameState,
      technonomicon: gameEngine.spellTinkering?.exportTechnonomicon(),
      dataInventory: gameEngine.spellTinkering?.exportDataInventory(),
      timestamp: Date.now(),
    };
  }

  /**
   * Utility: Import full game state from saves
   */
  static importGameState(gameEngine, savedState) {
    gameEngine.gameState = savedState.gameState;
    
    if (savedState.technonomicon && gameEngine.spellTinkering) {
      gameEngine.spellTinkering.technonomicon.discoveredSpells = new Map(savedState.technonomicon.discoveredSpells);
      gameEngine.spellTinkering.technonomicon.discoveredElements = new Set(savedState.technonomicon.discoveredElements);
      gameEngine.spellTinkering.technonomicon.discoveredCodeBits = new Set(savedState.technonomicon.discoveredCodeBits);
      gameEngine.spellTinkering.technonomicon.libraryVersion = savedState.technonomicon.libraryVersion;
      gameEngine.spellTinkering.technonomicon.totalCrafts = savedState.technonomicon.totalCrafts;
      gameEngine.spellTinkering.technonomicon.totalCombinations = new Set(savedState.technonomicon.totalCombinations);
    }

    if (savedState.dataInventory && gameEngine.spellTinkering) {
      gameEngine.spellTinkering.dataInventory = savedState.dataInventory;
    }

    console.log("[Integration] Game state restored from save");
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationBootstrap;
}
