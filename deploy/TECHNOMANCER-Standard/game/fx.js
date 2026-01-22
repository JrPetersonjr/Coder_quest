// ============================================================
// FX.JS
// CASTCONSOLE AUDIO & PARTICLE EFFECTS SYSTEM
//
// PURPOSE:
//   - Web Audio API synthesis (8-bit/retro feel)
//   - Dynamic sound effects (spells, combat, UI)
//   - Ambient zone music (looping data URIs)
//   - Particle effects for visual feedback
//   - Boot/theme music generation
//   - Sound toggle with graceful degradation
//
// USAGE:
//   FXSystem.playSound("spell_cast")
//   FXSystem.playMusic("zone_forest")
//   FXSystem.createParticles("spell_impact", 30)
//
// ============================================================

window.FXSystem = {

  // ============================================================
  // [AUDIO_CONTEXT] - Web Audio initialization
  // ============================================================
  audioContext: null,
  soundEnabled: true,
  masterVolume: 0.3,
  musicVolume: 0.15,
  currentMusic: null,

  /**
   * Initialize audio context (requires user gesture)
   */
  initAudio() {
    if (this.audioContext) return true;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("[FX] Audio context initialized");
      return true;
    } catch (e) {
      console.warn("[FX] Audio context unavailable:", e);
      this.soundEnabled = false;
      return false;
    }
  },

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.initAudio();
    }
    return this.soundEnabled;
  },

  // ============================================================
  // [SOUND_LIBRARY] - Pre-defined sound effects
  // ============================================================
  sounds: {
    // Combat sounds
    "attack": {
      type: "triangle",
      freq: [400, 300],
      duration: 0.15,
      envelope: "sharp",
      volume: 0.4
    },

    "spell_cast": {
      type: "sine",
      freq: [800, 1200],
      duration: 0.3,
      envelope: "swell",
      volume: 0.35
    },

    "spell_impact": {
      type: "square",
      freq: [600, 200],
      duration: 0.25,
      envelope: "decay",
      volume: 0.4
    },

    "critical_hit": {
      type: "sine",
      freq: [1000, 1500, 800],
      duration: 0.4,
      envelope: "swell",
      volume: 0.45
    },

    "enemy_hit": {
      type: "sine",
      freq: [300, 150],
      duration: 0.2,
      envelope: "sharp",
      volume: 0.3
    },

    "miss": {
      type: "square",
      freq: [200, 100],
      duration: 0.15,
      envelope: "decay",
      volume: 0.2
    },

    // UI sounds
    "success": {
      type: "sine",
      freq: [800, 1000, 1200],
      duration: 0.3,
      envelope: "ascending",
      volume: 0.35
    },

    "error": {
      type: "triangle",
      freq: [300, 200, 100],
      duration: 0.25,
      envelope: "descending",
      volume: 0.3
    },

    "select": {
      type: "sine",
      freq: [600],
      duration: 0.1,
      envelope: "sharp",
      volume: 0.2
    },

    "confirm": {
      type: "sine",
      freq: [700, 900],
      duration: 0.2,
      envelope: "swell",
      volume: 0.25
    },

    "denied": {
      type: "square",
      freq: [250, 180],
      duration: 0.2,
      envelope: "decay",
      volume: 0.25
    },

    // Spell-specific sounds
    "fire_spell": {
      type: "triangle",
      freq: [600, 800, 400],
      duration: 0.4,
      envelope: "swell",
      volume: 0.4
    },

    "ice_spell": {
      type: "sine",
      freq: [1000, 800, 600],
      duration: 0.35,
      envelope: "swell",
      volume: 0.35
    },

    "lightning": {
      type: "square",
      freq: [1500, 800, 1200, 900],
      duration: 0.25,
      envelope: "sharp",
      volume: 0.45
    },

    "healing": {
      type: "sine",
      freq: [800, 1000, 900],
      duration: 0.5,
      envelope: "ascending",
      volume: 0.3
    },

    // Exploration sounds
    "level_up": {
      type: "sine",
      freq: [500, 700, 900, 1100],
      duration: 0.6,
      envelope: "ascending",
      volume: 0.4
    },

    "item_acquire": {
      type: "sine",
      freq: [700, 900, 1100],
      duration: 0.4,
      envelope: "swell",
      volume: 0.3
    },

    "puzzle_solve": {
      type: "sine",
      freq: [600, 800, 1000, 1200],
      duration: 0.5,
      envelope: "ascending",
      volume: 0.35
    },

    "danger": {
      type: "triangle",
      freq: [300, 400, 300],
      duration: 0.3,
      envelope: "pulsing",
      volume: 0.35
    },

    // Ambient sounds
    "ambient_hum": {
      type: "sine",
      freq: [120],
      duration: 2.0,
      envelope: "sustain",
      volume: 0.1
    },

    "glitch": {
      type: "square",
      freq: [400, 600, 300, 800],
      duration: 0.15,
      envelope: "random",
      volume: 0.25
    }
  },

  // ============================================================
  // [MUSIC] - Looping background music (data URIs)
  // ============================================================
  musicTracks: {
    "zone_hub": "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    "zone_forest": "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    "zone_city": "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    "battle": "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    "boss": "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
  },

  musicElements: {
    audioElement: null,
    isPlaying: false,

    /**
     * Load and play music track
     * @param {string} trackId - Track identifier
     */
    playTrack(trackId) {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.loop = true;
        this.audioElement.volume = FXSystem.musicVolume;
      }

      const src = FXSystem.musicTracks[trackId];
      if (!src) return;

      this.audioElement.src = src;
      this.audioElement.play().catch(e => {
        console.warn("[FX] Music playback failed:", e);
      });
      this.isPlaying = true;
    },

    stopTrack() {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlaying = false;
      }
    }
  },

  // ============================================================
  // [CORE_PLAYBACK] - Main sound playback
  // ============================================================

  /**
   * Play a sound effect by ID
   * @param {string} soundId - Sound identifier
   */
  playSound(soundId) {
    if (!this.soundEnabled) return;

    const soundDef = this.sounds[soundId];
    if (!soundDef) {
      console.warn("[FX] Sound not found:", soundId);
      return;
    }

    if (!this.initAudio()) return;

    try {
      this.synthesizeSound(soundDef);
    } catch (e) {
      console.warn("[FX] Sound playback error:", e);
    }
  },

  /**
   * Synthesize sound based on definition
   * @param {object} soundDef - Sound parameters
   */
  synthesizeSound(soundDef) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = soundDef.type || "sine";
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Set frequency (single or sweep)
    const freqs = Array.isArray(soundDef.freq) ? soundDef.freq : [soundDef.freq];
    if (freqs.length === 1) {
      osc.frequency.value = freqs[0];
    } else {
      // Frequency sweep
      freqs.forEach((freq, i) => {
        const t = now + (i / (freqs.length - 1)) * soundDef.duration;
        osc.frequency.setTargetAtTime(freq, t, 0.05);
      });
    }

    // Apply envelope
    const vol = soundDef.volume || 0.3;
    const dur = soundDef.duration || 0.2;
    const envelope = soundDef.envelope || "decay";

    switch (envelope) {
      case "sharp":
        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        break;

      case "swell":
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * this.masterVolume, now + dur * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        break;

      case "decay":
        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        break;

      case "ascending":
        const steps = Array.isArray(soundDef.freq) ? soundDef.freq.length : 1;
        const stepDur = dur / steps;
        for (let i = 0; i < steps; i++) {
          gain.gain.setValueAtTime(vol * this.masterVolume * (i / steps), now + i * stepDur);
        }
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        break;

      case "descending":
        const descSteps = Array.isArray(soundDef.freq) ? soundDef.freq.length : 1;
        const descStepDur = dur / descSteps;
        for (let i = 0; i < descSteps; i++) {
          gain.gain.setValueAtTime(vol * this.masterVolume * (1 - i / descSteps), now + i * descStepDur);
        }
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        break;

      case "sustain":
        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.setValueAtTime(vol * this.masterVolume * 0.5, now + dur);
        break;

      case "pulsing":
        for (let i = 0; i < 3; i++) {
          gain.gain.setValueAtTime(vol * this.masterVolume, now + i * (dur / 3));
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 0.5) * (dur / 3));
        }
        break;

      default:
        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    }

    osc.start(now);
    osc.stop(now + dur);
  },

  // ============================================================
  // [PARTICLE_EFFECTS] - Visual feedback
  // ============================================================
  particles: [],
  particleCanvas: null,
  particleCtx: null,

  /**
   * Initialize particle canvas
   */
  initParticles() {
    if (!document.getElementById("particle-canvas")) {
      const canvas = document.createElement("canvas");
      canvas.id = "particle-canvas";
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.zIndex = "1000";
      canvas.style.pointerEvents = "none";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);

      this.particleCanvas = canvas;
      this.particleCtx = canvas.getContext("2d");
    }
  },

  /**
   * Create particle burst at location
   * @param {string} effectType - Type of effect
   * @param {number} count - Number of particles
   * @param {object} pos - Position {x, y}
   */
  createParticles(effectType, count = 20, pos = null) {
    if (!this.particleCanvas) this.initParticles();

    const position = pos || {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    const effectMap = {
      "spell_impact": { color: "rgba(100, 200, 255, 1)", speed: 4, life: 1 },
      "fire": { color: "rgba(255, 100, 0, 1)", speed: 5, life: 0.8 },
      "ice": { color: "rgba(100, 200, 255, 1)", speed: 3, life: 1 },
      "heal": { color: "rgba(100, 255, 100, 1)", speed: 2, life: 1.2 },
      "critical": { color: "rgba(255, 255, 0, 1)", speed: 6, life: 0.6 },
      "defeat": { color: "rgba(255, 50, 50, 1)", speed: 4, life: 1.5 }
    };

    const effect = effectMap[effectType] || effectMap["spell_impact"];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = effect.speed * (0.5 + Math.random());

      this.particles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        maxLife: effect.life,
        color: effect.color,
        size: 4 + Math.random() * 4
      });
    }

    this.animateParticles();
  },

  /**
   * Animate particles
   */
  animateParticles() {
    if (!this.particleCanvas || this.particles.length === 0) return;

    const ctx = this.particleCtx;
    ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.life -= 0.02;

      const opacity = p.life / p.maxLife;
      const color = p.color.replace("1)", `${opacity})`);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animateParticles());
    }
  },

  // ============================================================
  // [SPECIAL_SEQUENCES] - Multi-sound effects
  // ============================================================

  /**
   * Play spell cast sequence
   * @param {object} spell - Spell object
   */
  playSpellSequence(spell) {
    if (!this.soundEnabled) return;

    // Spell-specific sound
    const spellSoundMap = {
      fire: "fire_spell",
      ice: "ice_spell",
      lightning: "lightning",
      heal: "healing"
    };

    const soundId = spellSoundMap[spell.type] || "spell_cast";
    this.playSound(soundId);
    this.createParticles(spell.type, 30);
  },

  /**
   * Play victory sequence
   */
  playVictorySequence() {
    if (!this.soundEnabled) return;

    this.playSound("level_up");
    setTimeout(() => this.playSound("success"), 300);
    this.createParticles("critical", 50);
  },

  /**
   * Play defeat sequence
   */
  playDefeatSequence() {
    if (!this.soundEnabled) return;

    this.playSound("error");
    setTimeout(() => this.playSound("denied"), 200);
    this.createParticles("defeat", 40);
  },

  /**
   * Play boot/theme music
   */
  playBootTheme() {
    if (!this.soundEnabled) return;

    const ctx = this.audioContext;
    if (!ctx) return;

    // 8-bit style boot theme
    const notes = [
      { freq: 264, dur: 0.25 },
      { freq: 330, dur: 0.25 },
      { freq: 396, dur: 0.25 },
      { freq: 528, dur: 0.5 },
      { freq: 396, dur: 0.25 },
      { freq: 330, dur: 0.25 },
      { freq: 264, dur: 0.5 }
    ];

    let time = ctx.currentTime;
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = note.freq;

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.dur);

      osc.start(time);
      osc.stop(time + note.dur);

      time += note.dur;
    });
  }
};

// ============================================================
// [EXPORTS] - Verify globals set
// ============================================================
console.log("[fx.js] FXSystem initialized");
console.log("[fx.js] Sounds: " + Object.keys(window.FXSystem.sounds).length);
console.log("[fx.js] Music tracks: " + Object.keys(window.FXSystem.musicTracks).length);