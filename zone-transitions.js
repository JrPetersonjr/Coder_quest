// ============================================================
// ZONE-TRANSITIONS.JS
// PHASE 4: ZONE TRANSITION VISUAL & AUDIO EFFECTS
//
// PURPOSE:
//   - Add visual polish to zone changes
//   - Fade effects, screen glitches, atmospheric transitions
//   - Audio atmosphere per zone
//   - Smooth player experience
//
// FEATURES:
//   - Fade out/in animations
//   - Zone-specific ambient music
//   - Transition sound effects
//   - Visual glitch effects (hacker theme)
//   - Progression feedback
//
// ============================================================

window.ZoneTransitions = {
  // ============================================================
  // [CONFIG] - Transition settings
  // ============================================================
  config: {
    fadeDuration: 400,        // ms
    glitchDuration: 200,      // ms
    ambientFadeIn: 800,       // ms for music
    soundVolume: 0.7,
  },

  // ============================================================
  // [STATE] - Runtime state
  // ============================================================
  state: {
    isTransitioning: false,
    currentZone: null,
    previousZone: null,
  },

  // ============================================================
  // [ZONE_ATMOSPHERE] - Zone-specific ambiance
  // ============================================================
  zoneAtmosphere: {
    hub: {
      name: "Central Hub",
      color: "#1a1a1a",
      glitch: false,
      ambientSound: "hub_ambient",
      description: "The hum of the mainframe. Endless corridors stretch in all directions.",
    },
    forest: {
      name: "The Code Forest",
      color: "#0a2a0a",
      glitch: true,
      ambientSound: "forest_ambient",
      description: "Ancient functions writhe like vines. The air hums with old magic.",
    },
    city: {
      name: "Neon City",
      color: "#1a0a2a",
      glitch: true,
      ambientSound: "city_ambient",
      description: "Neon signs flicker. Data streams flow like neon rivers.",
    },
    vault: {
      name: "The Vault",
      color: "#2a1a0a",
      glitch: false,
      ambientSound: "vault_ambient",
      description: "Silence. Everything is locked away. You can feel the weight.",
    },
    nexus: {
      name: "The Nexus",
      color: "#2a2a3a",
      glitch: true,
      ambientSound: "nexus_ambient",
      description: "Reality fractures here. Multiple timelines converge.",
    },
  },

  // ============================================================
  // [TRANSITIONS] - Fade in/out effects
  // ============================================================

  /**
   * Fade out current zone, fade in new zone
   */
  async transitionToZone(fromZone, toZone, gameEngine) {
    if (this.state.isTransitioning) {
      console.warn("[Transition] Already transitioning, ignoring");
      return;
    }

    this.state.isTransitioning = true;
    this.state.previousZone = fromZone;
    this.state.currentZone = toZone;

    try {
      // 1. Start fade out with glitch effect
      await this.fadeOut(fromZone);

      // 2. Play transition sound
      if (gameEngine.audioSystem) {
        gameEngine.audioSystem.playSFX("zone_transition");
      }

      // 3. Optional: Visual glitch during transition
      const toAtmosphere = this.zoneAtmosphere[toZone] || {};
      if (toAtmosphere.glitch) {
        await this.glitchEffect();
      }

      // 4. Update ambient music
      if (gameEngine.audioSystem) {
        await this.updateAmbientMusic(toZone, gameEngine.audioSystem);
      }

      // 5. Fade in new zone
      await this.fadeIn(toZone);

      // 6. Add atmospheric description
      gameEngine.output("", "system");
      gameEngine.output(toAtmosphere.description, "system");
      gameEngine.output("", "system");
      
      // Wire narrative: Generate restoration email on zone transition
      if (window.DynamicNarrative && gameEngine.gameState) {
        const zoneKey = toZone.toLowerCase();
        const wasRestored = !DynamicNarrative.narrativeState.terminalsRestored[zoneKey];
        
        // Mark zone as encountered/restored
        DynamicNarrative.narrativeState.terminalsRestored[zoneKey] = true;
        
        if (wasRestored) {
          DynamicNarrative.narrativeState.milestones.first_terminal = true;
          DynamicNarrative.generateEmail(gameEngine.gameState, "restoration").then(email => {
            if (email) {
              gameEngine.gameState.emails = gameEngine.gameState.emails || [];
              gameEngine.gameState.emails.push(email);
              gameEngine.output("[EMAIL] Terminal restoration detected...", "system");
            }
          }).catch(err => console.warn("[ZoneTransitions] Could not generate restoration email:", err));
        }
      }

    } catch (e) {
      console.error("[Transition] Error:", e);
    } finally {
      this.state.isTransitioning = false;
    }
  },

  /**
   * Fade out effect
   */
  async fadeOut(zone) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      const atmosphere = this.zoneAtmosphere[zone] || {};
      
      // Add fade class
      output.style.transition = `opacity ${this.config.fadeDuration}ms ease-out`;
      output.style.opacity = "0.3";

      // Add subtle color shift
      if (atmosphere.color) {
        output.style.backgroundColor = atmosphere.color;
      }

      setTimeout(() => {
        resolve();
      }, this.config.fadeDuration);
    });
  },

  /**
   * Fade in effect
   */
  async fadeIn(zone) {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      output.style.transition = `opacity ${this.config.fadeDuration}ms ease-in`;
      output.style.opacity = "1";

      setTimeout(() => {
        output.style.transition = ""; // Reset
        resolve();
      }, this.config.fadeDuration);
    });
  },

  /**
   * Glitch effect (visual corruption)
   */
  async glitchEffect() {
    return new Promise(resolve => {
      const output = document.getElementById("output");
      if (!output) {
        resolve();
        return;
      }

      const originalFilter = output.style.filter;

      // Apply glitch
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          output.style.filter = `
            hue-rotate(${Math.random() * 360}deg)
            brightness(${0.5 + Math.random() * 0.5})
            contrast(${1 + Math.random()})
          `;
        }, i * (this.config.glitchDuration / 3));
      }

      setTimeout(() => {
        output.style.filter = originalFilter;
        resolve();
      }, this.config.glitchDuration);
    });
  },

  /**
   * Update ambient music based on zone
   */
  async updateAmbientMusic(zone, audioSystem) {
    const atmosphere = this.zoneAtmosphere[zone] || {};
    
    if (!audioSystem) return;

    // Fade out old music
    audioSystem.setMusicVolume(0);

    // Optional: Play zone entry sound
    audioSystem.playSFX("zone_enter");

    // In future: Start ambient music loop
    // For now, audio system will play via callbacks

    // Fade in
    await new Promise(resolve => {
      let volume = 0;
      const fadeInterval = setInterval(() => {
        volume = Math.min(1, volume + 0.05);
        audioSystem.setMusicVolume(volume);
        
        if (volume >= 1) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, 50);
    });
  },

  // ============================================================
  // [ZONE_ENTER_DESCRIPTIONS] - Atmospheric text
  // ============================================================

  getZoneEnterDescription(zone) {
    const descriptions = {
      hub: [
        "The mainframe hums. Infinite corridors branch in all directions.",
        "You emerge in the Central Hub. The air feels heavy with data.",
        "The nexus of all networks. Reality glitches slightly at the edges.",
        "A beacon pulses in the distance. The Hub awaits your command.",
      ],
      forest: [
        "Towering functions cast shadows. Roots of code intertwine overhead.",
        "You step into the Forest. Ancient algorithms whisper in the branches.",
        "The code-trees glow faintly. Something old is watching you.",
        "Data flows like sap through massive tree structures. Magic fills the air.",
      ],
      city: [
        "Neon signs pulse with data. The City never sleeps.",
        "You enter the City. Hacker culture thrums in every pixel.",
        "Skyscrapers of corrupted data tower above. Security barriers shimmer.",
        "The City breathes. You can feel the weight of a thousand connections.",
      ],
      vault: [
        "Everything is locked. The Vault is a fortress of encryption.",
        "You stand before massive vault doors. Silence is absolute here.",
        "Security systems hum. Danger lurks in every shadow.",
        "The air is heavy. Only the most valuable secrets are kept here.",
      ],
      nexus: [
        "Reality fractures. Multiple timelines converge in this place.",
        "The Nexus stretches infinitely. You can see all possible paths.",
        "Probabilities collapse around you. The impossible seems probable here.",
        "The fundamental code is visible. The system speaks directly to you.",
      ],
    };

    const zoneDescs = descriptions[zone] || descriptions.hub;
    return zoneDescs[Math.floor(Math.random() * zoneDescs.length)];
  },

  // ============================================================
  // [ZONE_EXIT_DESCRIPTIONS] - Departure text
  // ============================================================

  getZoneExitDescription(zone) {
    const descriptions = {
      hub: "You leave the Central Hub, embarking into the depths...",
      forest: "The Code Forest recedes as you journey onward...",
      city: "The neon glow fades as you move away from the City...",
      vault: "The Vault's secrets remain locked behind you...",
      nexus: "The fractured realities settle as you depart...",
    };

    return descriptions[zone] || "You depart...";
  },

  // ============================================================
  // [VISUAL_POLISH] - Screen effects
  // ============================================================

  /**
   * Screen shake on impact
   */
  screenShake(intensity = 1, duration = 200) {
    const output = document.getElementById("output");
    if (!output) return;

    const startTime = Date.now();
    
    const shake = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out
      const shake = intensity * (1 - progress);
      const offsetX = (Math.random() - 0.5) * shake * 20;
      const offsetY = (Math.random() - 0.5) * shake * 20;
      
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
   * Pulse effect (emphasis)
   */
  pulse(duration = 300) {
    const output = document.getElementById("output");
    if (!output) return;

    output.style.animation = `pulse ${duration}ms ease-out 1`;
  },

  /**
   * Invert colors (error/danger)
   */
  invertColors(duration = 100) {
    const output = document.getElementById("output");
    if (!output) return;

    output.style.filter = "invert(1)";
    setTimeout(() => {
      output.style.filter = "";
    }, duration);
  },

  // ============================================================
  // [INTEGRATION_HOOKS] - Connect to GameEngine
  // ============================================================

  /**
   * Hook into GameEngine.cmdGo() for transitions
   */
  setupGameEngineIntegration(gameEngine) {
    const originalCmdGo = gameEngine.cmdGo.bind(gameEngine);

    gameEngine.cmdGo = async function(args) {
      const targetZone = args[0]?.toLowerCase();
      const currentZone = this.gameState.zone;

      if (targetZone && targetZone !== currentZone) {
        // Show exit message
        const exitDesc = ZoneTransitions.getZoneExitDescription(currentZone);
        this.output(exitDesc, "system");

        // Run transition
        await ZoneTransitions.transitionToZone(currentZone, targetZone, this);
      }

      // Call original (this will show the zone)
      return originalCmdGo(args);
    };
  },

  // ============================================================
  // [CSS_ANIMATIONS] - Add to stylesheet
  // ============================================================
  // Add this to your CSS:
  /*
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.02);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes glitch {
    0% {
      text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
    }
    50% {
      text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
    }
    100% {
      text-shadow: 0 0 #ff00ff, 0 0 #00ffff;
    }
  }

  @keyframes fadeInText {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .zone-transition-text {
    animation: fadeInText 0.5s ease-out;
  }
  */
};

// ============================================================
// [AUTO-INITIALIZATION] - Register with GameEngine
// ============================================================

/**
 * Call this during game initialization to enable zone transitions
 */
function initializeZoneTransitions(gameEngine) {
  ZoneTransitions.setupGameEngineIntegration(gameEngine);
  console.log("[Transitions] Zone transition system initialized");
}
