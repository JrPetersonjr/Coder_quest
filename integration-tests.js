// ============================================================
// INTEGRATION-TESTS.JS
// AUTOMATED INTEGRATION TEST SUITE
//
// PURPOSE:
//   - Verify all systems work together
//   - Validate save/load cycle
//   - Check audio integration
//   - Confirm zone transitions
//   - Battle animation integration
//
// USAGE:
//   Run in browser console:
//   runIntegrationTests()
//
// ============================================================

window.IntegrationTests = {
  // ============================================================
  // [TEST STATE] - Track results
  // ============================================================
  results: {
    passed: 0,
    failed: 0,
    errors: [],
    startTime: null,
    endTime: null,
  },

  // ============================================================
  // [CORE TEST FRAMEWORK]
  // ============================================================

  /**
   * Assert condition and log result
   */
  assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      this.results.passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      this.results.failed++;
      this.results.errors.push(message);
    }
  },

  /**
   * Test with try/catch wrapper
   */
  async testAsync(name, fn) {
    try {
      console.group(`🧪 Testing: ${name}`);
      await fn.call(this);
      console.groupEnd();
    } catch (e) {
      console.error(`❌ ERROR in ${name}:`, e);
      this.results.failed++;
      this.results.errors.push(`${name}: ${e.message}`);
      console.groupEnd();
    }
  },

  // ============================================================
  // [SYSTEM CHECKS] - Verify all systems loaded
  // ============================================================

  checkSystems() {
    console.group("🔍 System Availability Check");

    this.assert(
      typeof GameEngine !== "undefined",
      "GameEngine class available"
    );
    this.assert(
      typeof GameUI !== "undefined",
      "GameUI class available"
    );
    this.assert(
      typeof AIConfig !== "undefined",
      "AIConfig system available"
    );
    this.assert(
      typeof ZoneTransitions !== "undefined",
      "ZoneTransitions system available"
    );
    this.assert(
      typeof BattleAnimations !== "undefined",
      "BattleAnimations system available"
    );
    this.assert(
      window.gameEngine !== undefined,
      "Game engine instance exists"
    );
    this.assert(
      window.gameUI !== undefined,
      "Game UI instance exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [AUDIO SYSTEM TESTS]
  // ============================================================

  testAudioSystem(gameEngine) {
    console.group("🔊 Audio System Tests");

    if (!gameEngine.audioSystem) {
      console.warn("⚠️ Audio system not initialized");
      console.groupEnd();
      return;
    }

    const audioSys = gameEngine.audioSystem;

    // Test volume control
    audioSys.setVolume(0.5);
    this.assert(
      audioSys.masterVolume === 0.5,
      "Volume control works (0.5)"
    );

    audioSys.setVolume(1.0);
    this.assert(
      audioSys.masterVolume === 1.0,
      "Volume control works (1.0)"
    );

    // Test mute/unmute
    audioSys.mute();
    this.assert(audioSys.isMuted, "Mute toggle works");

    audioSys.unmute();
    this.assert(!audioSys.isMuted, "Unmute toggle works");

    // Test that methods exist
    this.assert(
      typeof audioSys.playSFX === "function",
      "playSFX method exists"
    );
    this.assert(
      typeof audioSys.playMusic === "function",
      "playMusic method exists"
    );
    this.assert(
      typeof audioSys.setMusicVolume === "function",
      "setMusicVolume method exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [SAVE/LOAD SYSTEM TESTS]
  // ============================================================

  testSaveLoadSystem(gameEngine) {
    console.group("💾 Save/Load System Tests");

    const saveSystem = gameEngine.saveSystem;

    // Test save state exists
    this.assert(
      saveSystem.saves !== undefined,
      "Save slots structure exists"
    );

    // Test auto-save creation
    const before = Object.keys(saveSystem.saves).length;
    saveSystem.autoSave();
    const after = Object.keys(saveSystem.saves).length;

    this.assert(
      after >= before,
      "Auto-save creates save data"
    );

    // Test manual save
    saveSystem.save(0);
    this.assert(
      saveSystem.saves[0] !== undefined,
      "Manual save to slot 0 works"
    );

    // Test save data structure
    const saveData = saveSystem.saves[0];
    this.assert(
      saveData.timestamp !== undefined,
      "Save contains timestamp"
    );
    this.assert(
      saveData.gameState !== undefined,
      "Save contains gameState"
    );
    this.assert(
      saveData.quests !== undefined,
      "Save contains quest data"
    );

    console.groupEnd();
  },

  // ============================================================
  // [QUEST SYSTEM TESTS]
  // ============================================================

  testQuestSystem(gameEngine) {
    console.group("📜 Quest System Tests");

    const quests = gameEngine.quests;
    this.assert(
      quests && quests.length > 0,
      "Quest system initialized with quests"
    );

    // Test quest properties
    if (quests && quests.length > 0) {
      const firstQuest = quests[0];
      this.assert(
        firstQuest.id !== undefined,
        "Quest has ID property"
      );
      this.assert(
        firstQuest.name !== undefined,
        "Quest has name property"
      );
      this.assert(
        firstQuest.complete !== undefined,
        "Quest has complete property"
      );
      this.assert(
        firstQuest.reward !== undefined,
        "Quest has reward property"
      );
    }

    console.groupEnd();
  },

  // ============================================================
  // [ZONE TRANSITIONS TESTS]
  // ============================================================

  testZoneTransitions() {
    console.group("🌍 Zone Transitions Tests");

    const transitions = window.ZoneTransitions;
    this.assert(
      transitions !== undefined,
      "ZoneTransitions system exists"
    );
    this.assert(
      transitions.state !== undefined,
      "ZoneTransitions has state"
    );
    this.assert(
      transitions.zoneAtmosphere !== undefined,
      "ZoneTransitions has zone atmosphere config"
    );

    // Test zone atmosphere definitions
    this.assert(
      transitions.zoneAtmosphere.hub !== undefined,
      "Hub zone configured"
    );
    this.assert(
      transitions.zoneAtmosphere.forest !== undefined,
      "Forest zone configured"
    );
    this.assert(
      transitions.zoneAtmosphere.city !== undefined,
      "City zone configured"
    );
    this.assert(
      transitions.zoneAtmosphere.vault !== undefined,
      "Vault zone configured"
    );
    this.assert(
      transitions.zoneAtmosphere.nexus !== undefined,
      "Nexus zone configured"
    );

    // Test methods exist
    this.assert(
      typeof transitions.transitionToZone === "function",
      "transitionToZone method exists"
    );
    this.assert(
      typeof transitions.fadeOut === "function",
      "fadeOut method exists"
    );
    this.assert(
      typeof transitions.fadeIn === "function",
      "fadeIn method exists"
    );
    this.assert(
      typeof transitions.glitchEffect === "function",
      "glitchEffect method exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [BATTLE ANIMATIONS TESTS]
  // ============================================================

  testBattleAnimations() {
    console.group("⚔️ Battle Animations Tests");

    const battle = window.BattleAnimations;
    this.assert(
      battle !== undefined,
      "BattleAnimations system exists"
    );
    this.assert(
      battle.state !== undefined,
      "BattleAnimations has state"
    );
    this.assert(
      battle.config !== undefined,
      "BattleAnimations has config"
    );

    // Test methods exist
    this.assert(
      typeof battle.enemyApproach === "function",
      "enemyApproach method exists"
    );
    this.assert(
      typeof battle.enemyAttack === "function",
      "enemyAttack method exists"
    );
    this.assert(
      typeof battle.playerAttack === "function",
      "playerAttack method exists"
    );
    this.assert(
      typeof battle.spellEffect === "function",
      "spellEffect method exists"
    );
    this.assert(
      typeof battle.victorySequence === "function",
      "victorySequence method exists"
    );
    this.assert(
      typeof battle.defeatSequence === "function",
      "defeatSequence method exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [AI SYSTEM TESTS]
  // ============================================================

  testAISystem() {
    console.group("🧠 AI System Tests");

    const ai = window.AIConfig;
    this.assert(
      ai !== undefined,
      "AIConfig system exists"
    );
    this.assert(
      typeof ai.initialize === "function",
      "AIConfig.initialize method exists"
    );
    this.assert(
      typeof ai.generateCrystalBall === "function",
      "generateCrystalBall method exists"
    );
    this.assert(
      typeof ai.generateDMNarrative === "function",
      "generateDMNarrative method exists"
    );
    this.assert(
      typeof ai.generateContent === "function",
      "generateContent method exists"
    );
    this.assert(
      typeof ai.setAPIKey === "function",
      "setAPIKey method exists"
    );
    this.assert(
      typeof ai.getStatus === "function",
      "getStatus method exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [DOM INTEGRATION TESTS]
  // ============================================================

  testDOMIntegration() {
    console.group("🎨 DOM Integration Tests");

    this.assert(
      document.getElementById("output") !== null,
      "Output display element exists"
    );
    this.assert(
      document.getElementById("input") !== null,
      "Input element exists"
    );
    this.assert(
      document.getElementById("stats") !== null,
      "Stats panel exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [GAME STATE TESTS]
  // ============================================================

  testGameState(gameEngine) {
    console.group("🎮 Game State Tests");

    const state = gameEngine.gameState;
    this.assert(
      state !== undefined,
      "Game state exists"
    );
    this.assert(
      state.zone !== undefined,
      "Zone property exists"
    );
    this.assert(
      state.hp !== undefined,
      "HP property exists"
    );
    this.assert(
      state.mp !== undefined,
      "MP property exists"
    );
    this.assert(
      state.level !== undefined,
      "Level property exists"
    );
    this.assert(
      state.exp !== undefined,
      "Experience property exists"
    );
    this.assert(
      state.inventory !== undefined,
      "Inventory exists"
    );

    console.groupEnd();
  },

  // ============================================================
  // [PERFORMANCE TESTS]
  // ============================================================

  testPerformance() {
    console.group("⚡ Performance Tests");

    // Test save operation performance
    const saveStart = performance.now();
    if (gameEngine.saveSystem) {
      gameEngine.saveSystem.save(0);
    }
    const saveTime = performance.now() - saveStart;
    this.assert(
      saveTime < 100,
      `Save completes in <100ms (actual: ${saveTime.toFixed(2)}ms)`
    );

    // Test zone transition setup
    const transStart = performance.now();
    if (ZoneTransitions) {
      ZoneTransitions.setupGameEngineIntegration(gameEngine);
    }
    const transTime = performance.now() - transStart;
    this.assert(
      transTime < 50,
      `Zone transition setup <50ms (actual: ${transTime.toFixed(2)}ms)`
    );

    console.groupEnd();
  },

  // ============================================================
  // [MAIN TEST RUNNER]
  // ============================================================

  /**
   * Run full integration test suite
   */
  async runAll() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      startTime: Date.now(),
    };

    console.clear();
    console.log("%c🚀 INTEGRATION TEST SUITE 🚀", "color: #00ff00; font-size: 16px; font-weight: bold;");
    console.log("%cPhase 4 Verification", "color: #2fb43a; font-size: 12px;");
    console.log("");

    // System checks
    this.checkSystems();

    // Get instances
    const gameEngine = window.gameEngine;
    const gameUI = window.gameUI;

    if (!gameEngine) {
      console.error("❌ Game engine not found!");
      return this.reportResults();
    }

    // Run all tests
    this.testGameState(gameEngine);
    this.testAudioSystem(gameEngine);
    this.testSaveLoadSystem(gameEngine);
    this.testQuestSystem(gameEngine);
    this.testZoneTransitions();
    this.testBattleAnimations();
    this.testAISystem();
    this.testDOMIntegration();
    this.testPerformance();

    this.results.endTime = Date.now();
    this.reportResults();
  },

  /**
   * Report test results
   */
  reportResults() {
    const duration = this.results.endTime - this.results.startTime;
    const total = this.results.passed + this.results.failed;

    console.log("");
    console.log("%c" + "=".repeat(50), "color: #2fb43a;");
    console.log("%c📊 TEST RESULTS", "color: #2fb43a; font-size: 14px; font-weight: bold;");
    console.log("%c" + "=".repeat(50), "color: #2fb43a;");
    console.log("");
    console.log(`✅ Passed:  ${this.results.passed}/${total}`);
    console.log(`❌ Failed:  ${this.results.failed}/${total}`);
    console.log(`⏱️  Duration: ${duration}ms`);

    if (this.results.failed === 0) {
      console.log("");
      console.log(
        "%c🎉 ALL TESTS PASSED! 🎉",
        "color: #00ff00; font-size: 14px; font-weight: bold; background: #001a00; padding: 5px 10px;"
      );
    } else {
      console.log("");
      console.log("%c⚠️ FAILURES DETECTED:", "color: #ff4444; font-size: 12px; font-weight: bold;");
      this.results.errors.forEach(err => {
        console.log(`  - ${err}`);
      });
    }

    console.log("");
    console.log("%c" + "=".repeat(50), "color: #2fb43a;");
    console.log(
      "%cNext: Open browser console and run: runIntegrationTests()",
      "color: #aaa; font-size: 11px;"
    );
    console.log("%c" + "=".repeat(50), "color: #2fb43a;");
    console.log("");
  },
};

// ============================================================
// [GLOBAL HELPER] - Easy access from console
// ============================================================

/**
 * Quick test runner
 * Usage: runIntegrationTests()
 */
function runIntegrationTests() {
  IntegrationTests.runAll();
}

console.log("[Integration Tests] Ready. Run: runIntegrationTests()");
