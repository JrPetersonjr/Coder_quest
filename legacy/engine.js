// ============================================================
// ENGINE.JS
// CASTCONSOLE BOOTSTRAP & SYSTEM VALIDATION
// 
// PURPOSE:
//   - Load and validate all global registries
//   - Check for critical dependencies
//   - Initialize audio context
//   - Hand off to core.js for game loop
//
// NOTE: This is the legacy boot system. The new modular system
// uses GameEngine.js and GameUI.js instead. This file serves
// as a fallback and compatibility layer.
//
// HEADER FORMAT:
//   [SECTION_NAME] - Description of what loads here
//   Dependencies listed below each section
//
// ============================================================

(function() {
  // COMPATIBILITY MODE: If new system is active, don't fully boot
  if (window.GameEngine && window.GameUI) {
    console.log("[ENGINE] New modular system detected. Running in compatibility mode.");
    return;
  }

  const BOOT_PREFIX = "[ENGINE]";
  
  function log(msg) {
    console.log(`${BOOT_PREFIX} ${msg}`);
  }
  
  function warn(msg) {
    console.warn(`${BOOT_PREFIX} WARN: ${msg}`);
  }
  
  function error(msg) {
    console.error(`${BOOT_PREFIX} ERROR: ${msg}`);
  }

  // ============================================================
  // [AUDIO_CONTEXT] - Initialize Web Audio API
  // ============================================================
  function initAudioContext() {
    try {
      if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        log("Audio context initialized.");
      }
      return true;
    } catch (e) {
      warn("Audio context unavailable. Sound disabled.");
      return false;
    }
  }

  // ============================================================
  // [REGISTRY_VALIDATION] - Check for required global objects
  // ============================================================
  function validateRegistries() {
    const required = [
      { name: "CastZones", file: "zones-puzzles.js" },
      { name: "CastPuzzles", file: "zones-puzzles.js" },
      { name: "CastTerminals", file: "terminals-data.js" },
      { name: "CastEnemies", file: "enemies-battle.js" },
      { name: "CastSpells", file: "spells-data.js" }
    ];

    const optional = [
      { name: "CastBattle", file: "battle-core.js" },
      { name: "AncientTerminal", file: "ancient-terminals.js" },
      { name: "CONTENT_INDEX", file: "content-index.js" }
    ];

    let allPresent = true;

    log("Validating required registries...");
    required.forEach(reg => {
      if (typeof window[reg.name] === "undefined") {
        error(`${reg.name} missing (${reg.file}). CRITICAL.`);
        allPresent = false;
      } else {
        log(`✓ ${reg.name} loaded.`);
      }
    });

    log("Validating optional registries...");
    optional.forEach(reg => {
      if (typeof window[reg.name] === "undefined") {
        warn(`${reg.name} missing (${reg.file}). Some features disabled.`);
      } else {
        log(`✓ ${reg.name} loaded.`);
      }
    });

    return allPresent;
  }

  // ============================================================
  // [DOM_READINESS] - Check for critical DOM elements
  // ============================================================
  function validateDOM() {
    const required = [
      "output",
      "console-input",
      "room-text",
      "boot-screen"
    ];

    let allPresent = true;

    log("Validating DOM elements...");
    required.forEach(id => {
      if (!document.getElementById(id)) {
        error(`DOM element missing: #${id}`);
        allPresent = false;
      } else {
        log(`✓ #${id} found.`);
      }
    });

    return allPresent;
  }

  // ============================================================
  // [BOOT_SEQUENCE] - Main initialization
  // ============================================================
  function boot() {
    log("===== BOOT SEQUENCE START =====");

    const audioOk = initAudioContext();
    const registriesOk = validateRegistries();
    const domOk = validateDOM();

    if (!registriesOk) {
      error("CRITICAL: Required registries missing. Game may not function.");
    }

    if (!domOk) {
      error("CRITICAL: Required DOM elements missing. Game may not function.");
    }

    if (registriesOk && domOk) {
      log("All systems nominal. Handing control to core.js...");
      log("===== BOOT SEQUENCE COMPLETE =====");
    } else {
      log("===== BOOT SEQUENCE FAILED =====");
      return;
    }

    // core.js handles init() from here
  }

  // ============================================================
  // [DOM_READY_HOOK] - DISABLED (use new modular system)
  // ============================================================
  // OLD SYSTEM DISABLED - using GameEngine.js + GameUI.js instead
  // if (document.readyState === "loading") {
  //   document.addEventListener("DOMContentLoaded", boot);
  // } else {
  //   boot();
  // }
})();