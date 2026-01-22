// ============================================================
// ZONE-BACKGROUNDS.JS
// Dynamic Zone Background & Atmosphere System
//
// PURPOSE:
//   - Apply theme-appropriate backgrounds to zones
//   - Create atmospheric effects (scanlines, particles, etc.)
//   - Enhance immersion with visual polish
//   - Support both images and CSS effects
// ============================================================

window.ZoneBackgrounds = {
  
  // Current state
  state: {
    currentZone: null,
    currentBackground: null,
    isEnabled: true,
    effectsActive: []
  },

  // ============================================================
  // [INITIALIZATION] - Setup background system
  // ============================================================
  initialize() {
    console.log("[ZoneBackgrounds] Initializing zone background system...");
    
    // Ensure main game area exists
    if (!document.querySelector('.main-display')) {
      console.warn("[ZoneBackgrounds] Main display not found, will retry when ready");
      setTimeout(() => this.initialize(), 1000);
      return;
    }
    
    // Create background layer
    this.createBackgroundLayer();
    
    // Hook into zone changes
    this.hookZoneTransitions();
    
    // Apply initial background if already in a zone
    if (window.gameEngine && gameEngine.gameState && gameEngine.gameState.zone) {
      this.applyZoneBackground(gameEngine.gameState.zone);
    }
    
    console.log("[ZoneBackgrounds] System initialized");
  },

  // Create the background overlay layer
  createBackgroundLayer() {
    // Remove existing background layer
    const existing = document.getElementById('zone-background-layer');
    if (existing) {
      existing.remove();
    }
    
    // Create new background container
    const backgroundLayer = document.createElement('div');
    backgroundLayer.id = 'zone-background-layer';
    backgroundLayer.className = 'zone-background-layer';
    
    // Insert before main display but after CRT frame
    const mainDisplay = document.querySelector('.main-display');
    if (mainDisplay) {
      mainDisplay.style.position = 'relative';
      mainDisplay.style.zIndex = '10';
      mainDisplay.insertAdjacentElement('afterbegin', backgroundLayer);
    } else {
      document.body.appendChild(backgroundLayer);
    }
    
    // Add CSS for background layer
    this.addBackgroundCSS();
  },

  // Add CSS styles for background system
  addBackgroundCSS() {
    if (document.getElementById('zone-background-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'zone-background-styles';
    style.textContent = `
      .zone-background-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.15;
        z-index: 1;
        pointer-events: none;
        transition: all 0.8s ease-in-out;
        filter: sepia(20%) hue-rotate(90deg) brightness(0.7);
      }

      /* Atmospheric effects */
      .zone-background-layer.scanlines::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 255, 0, 0.03) 2px,
          rgba(0, 255, 0, 0.03) 4px
        );
        pointer-events: none;
        z-index: 2;
      }

      .zone-background-layer.neon {
        filter: sepia(30%) hue-rotate(180deg) brightness(0.8) contrast(1.2);
        box-shadow: inset 0 0 200px rgba(0, 150, 255, 0.1);
      }

      .zone-background-layer.corruption {
        filter: sepia(80%) hue-rotate(300deg) brightness(0.6) contrast(1.5);
        animation: corruptionFlicker 3s infinite ease-in-out;
      }

      .zone-background-layer.epic-effect {
        filter: sepia(50%) hue-rotate(270deg) brightness(0.9) contrast(1.3);
        box-shadow: inset 0 0 300px rgba(255, 0, 255, 0.2);
        animation: epicPulse 2s infinite ease-in-out;
      }

      @keyframes corruptionFlicker {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.25; filter: sepia(90%) hue-rotate(320deg) brightness(0.5); }
      }

      @keyframes epicPulse {
        0%, 100% { opacity: 0.15; box-shadow: inset 0 0 300px rgba(255, 0, 255, 0.1); }
        50% { opacity: 0.25; box-shadow: inset 0 0 400px rgba(255, 0, 255, 0.3); }
      }

      /* Zone-specific themes */
      .zone-bg-hub {
        filter: sepia(20%) hue-rotate(90deg) brightness(0.7);
      }

      .zone-bg-forest {
        filter: sepia(40%) hue-rotate(60deg) brightness(0.6);
      }

      .zone-bg-city {
        filter: sepia(10%) hue-rotate(180deg) brightness(0.8) contrast(1.1);
      }

      .zone-bg-wasteland {
        filter: sepia(70%) hue-rotate(20deg) brightness(0.5) contrast(1.3);
      }

      .zone-bg-depths {
        filter: sepia(30%) hue-rotate(200deg) brightness(0.6) contrast(1.2);
      }

      .zone-bg-core {
        filter: sepia(60%) hue-rotate(270deg) brightness(0.8) contrast(1.4);
      }
    `;
    document.head.appendChild(style);
  },

  // ============================================================
  // [ZONE INTEGRATION] - Hook into zone changes
  // ============================================================
  hookZoneTransitions() {
    // Hook into GameEngine's cmdGo if available
    if (window.gameEngine && typeof gameEngine.cmdGo === 'function') {
      const originalCmdGo = gameEngine.cmdGo.bind(gameEngine);
      gameEngine.cmdGo = async function(args) {
        // Call original function
        const result = await originalCmdGo(args);
        
        // Apply background after zone change
        setTimeout(() => {
          ZoneBackgrounds.applyZoneBackground(this.gameState.zone);
        }, 500);
        
        return result;
      };
    }

    // Also hook into direct zone changes
    if (window.gameEngine) {
      const originalOutput = gameEngine.output.bind(gameEngine);
      gameEngine.output = function(text, type) {
        // Call original output
        const result = originalOutput(text, type);
        
        // Check if this is a zone change message
        if (type === 'system' && text.includes('You travel to')) {
          setTimeout(() => {
            ZoneBackgrounds.applyZoneBackground(this.gameState.zone);
          }, 600);
        }
        
        return result;
      };
    }
  },

  // ============================================================
  // [BACKGROUND APPLICATION] - Apply zone-specific backgrounds
  // ============================================================
  applyZoneBackground(zoneId) {
    if (!this.state.isEnabled || !zoneId) return;

    console.log(`[ZoneBackgrounds] Applying background for zone: ${zoneId}`);
    
    // Get zone data
    const zoneData = this.getZoneData(zoneId);
    if (!zoneData) {
      console.warn(`[ZoneBackgrounds] No data found for zone: ${zoneId}`);
      return;
    }

    // Get background layer
    const backgroundLayer = document.getElementById('zone-background-layer');
    if (!backgroundLayer) {
      console.warn("[ZoneBackgrounds] Background layer not found");
      return;
    }

    // Clear existing classes and effects
    backgroundLayer.className = 'zone-background-layer';
    
    // Apply background image if available
    if (zoneData.background) {
      backgroundLayer.style.backgroundImage = `url('${zoneData.background}')`;
    } else {
      // Use generated gradient based on zone theme
      backgroundLayer.style.backgroundImage = this.generateZoneGradient(zoneId);
    }

    // Apply zone theme class
    const zoneTheme = this.getZoneTheme(zoneId);
    if (zoneTheme) {
      backgroundLayer.classList.add(`zone-bg-${zoneTheme}`);
    }

    // Apply atmospheric effects
    if (zoneData.atmosphere) {
      this.applyAtmosphericEffects(backgroundLayer, zoneData.atmosphere);
    }

    // Update state
    this.state.currentZone = zoneId;
    this.state.currentBackground = zoneData.background || 'generated';
    
    console.log(`[ZoneBackgrounds] Background applied: ${this.state.currentBackground}`);
  },

  // Get zone data from CastZones or fallback
  getZoneData(zoneId) {
    // First check main zones
    if (window.CastZones && window.CastZones[zoneId]) {
      return window.CastZones[zoneId];
    }
    
    // Check subzones
    if (window.CastZones && zoneId.includes('_')) {
      for (const [mainZoneId, mainZone] of Object.entries(window.CastZones)) {
        if (mainZone.subzones && mainZone.subzones[zoneId]) {
          return mainZone.subzones[zoneId];
        }
      }
    }
    
    return null;
  },

  // Get zone theme identifier
  getZoneTheme(zoneId) {
    if (zoneId.includes('hub')) return 'hub';
    if (zoneId.includes('forest')) return 'forest';
    if (zoneId.includes('city')) return 'city';
    if (zoneId.includes('waste')) return 'wasteland';
    if (zoneId.includes('depth') || zoneId.includes('server')) return 'depths';
    if (zoneId.includes('core') || zoneId.includes('boss')) return 'core';
    return 'hub'; // Default
  },

  // Generate gradient background for zones without images
  generateZoneGradient(zoneId) {
    const gradients = {
      hub: 'radial-gradient(ellipse at center, #001122 0%, #000011 100%)',
      forest: 'radial-gradient(ellipse at center, #001100 0%, #000800 100%)',
      city: 'radial-gradient(ellipse at center, #000033 0%, #000011 100%)',
      wasteland: 'radial-gradient(ellipse at center, #220000 0%, #110000 100%)',
      depths: 'radial-gradient(ellipse at center, #002211 0%, #001100 100%)',
      core: 'radial-gradient(ellipse at center, #220022 0%, #110011 100%)'
    };
    
    const theme = this.getZoneTheme(zoneId);
    return gradients[theme] || gradients.hub;
  },

  // Apply atmospheric effects
  applyAtmosphericEffects(backgroundLayer, atmosphere) {
    if (atmosphere.scanlines) {
      backgroundLayer.classList.add('scanlines');
    }
    
    if (atmosphere.neon) {
      backgroundLayer.classList.add('neon');
    }
    
    if (atmosphere.corruption) {
      backgroundLayer.classList.add('corruption');
    }
    
    if (atmosphere.epicEffect) {
      backgroundLayer.classList.add('epic-effect');
    }
  },

  // ============================================================
  // [CONTROLS] - Enable/disable system
  // ============================================================
  enable() {
    this.state.isEnabled = true;
    console.log("[ZoneBackgrounds] Background system enabled");
  },

  disable() {
    this.state.isEnabled = false;
    const backgroundLayer = document.getElementById('zone-background-layer');
    if (backgroundLayer) {
      backgroundLayer.style.backgroundImage = 'none';
    }
    console.log("[ZoneBackgrounds] Background system disabled");
  },

  toggle() {
    if (this.state.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  },

  // Get status for debugging
  getStatus() {
    return {
      enabled: this.state.isEnabled,
      currentZone: this.state.currentZone,
      currentBackground: this.state.currentBackground,
      effectsActive: this.state.effectsActive,
      layerExists: !!document.getElementById('zone-background-layer')
    };
  }
};

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ZoneBackgrounds.initialize(), 1000);
  });
} else {
  setTimeout(() => ZoneBackgrounds.initialize(), 1000);
}

console.log("[zone-backgrounds.js] Zone background system loaded");