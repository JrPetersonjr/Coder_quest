// ============================================================
// AUDIO SYSTEM - Sound effects and music management
// ============================================================

class AudioSystem {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.masterVolume = options.masterVolume || 0.7;
    this.sfxVolume = options.sfxVolume || 0.5;
    this.musicVolume = options.musicVolume || 0.4;
    
    // Audio context (for Web Audio API)
    this.audioContext = null;
    
    // Current playing sounds
    this.activeSounds = new Map();
    this.currentMusic = null;
    
    // Sound library (preloaded)
    this.soundLibrary = {};
    this.musicLibrary = {};
    
    this.initializeAudioContext();
    this.loadSoundLibrary();
    
    console.log("[AudioSystem] Initialized");
  }
  
  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn("[AudioSystem] Web Audio API not supported");
      this.enabled = false;
    }
  }
  
  loadSoundLibrary() {
    // Procedurally generate simple sounds using Web Audio API
    // This allows audio without external files
    this.soundLibrary = {
      // UI sounds
      ui_select: {type: 'sine', freq: 400, duration: 0.1, ramp: -0.05},
      ui_confirm: {type: 'sine', freq: 600, duration: 0.15, ramp: -0.1},
      ui_cancel: {type: 'sine', freq: 300, duration: 0.15, ramp: -0.1},
      
      // Battle sounds
      attack_hit: {type: 'square', freq: 200, duration: 0.2, ramp: -0.3},
      attack_miss: {type: 'triangle', freq: 150, duration: 0.1, ramp: -0.1},
      enemy_hit: {type: 'square', freq: 250, duration: 0.3, ramp: -0.4},
      
      // Magic sounds
      spell_cast: {type: 'sine', freq: 800, duration: 0.3, ramp: 0.05},
      spell_fire: {type: 'sawtooth', freq: 600, duration: 0.4, ramp: -0.3},
      spell_ice: {type: 'triangle', freq: 1000, duration: 0.2, ramp: -0.2},
      spell_lightning: {type: 'square', freq: 1200, duration: 0.15, ramp: -0.4},
      
      // Victory sounds
      victory: {type: 'sine', freqs: [400, 500, 600], duration: 0.5, ramp: -0.1},
      defeat: {type: 'sine', freqs: [600, 500, 400], duration: 0.5, ramp: -0.1},
      levelup: {type: 'sine', freqs: [500, 600, 700], duration: 0.6, ramp: -0.1},
      
      // Quest sounds
      quest_complete: {type: 'sine', freqs: [600, 700, 800], duration: 0.5, ramp: -0.1},
      graphics_unlock: {type: 'sine', freqs: [800, 900, 1000], duration: 1, ramp: -0.1},
      
      // Environment sounds
      zone_enter: {type: 'triangle', freq: 500, duration: 0.3, ramp: 0},
      zone_exit: {type: 'triangle', freq: 400, duration: 0.3, ramp: 0},
    };
    
    this.musicLibrary = {
      ambient_hub: {type: 'ambient', bpm: 80, scale: 'minor'},
      ambient_forest: {type: 'ambient', bpm: 70, scale: 'minor'},
      ambient_city: {type: 'ambient', bpm: 90, scale: 'minor'},
      battle_theme: {type: 'battle', bpm: 120, scale: 'minor'},
    };
  }
  
  // ============================================================
  // SOUND EFFECTS
  // ============================================================
  
  playSFX(soundId, options = {}) {
    if (!this.enabled) return;
    
    const sound = this.soundLibrary[soundId];
    if (!sound) {
      console.warn(`[AudioSystem] Sound not found: ${soundId}`);
      return;
    }
    
    try {
      const now = this.audioContext.currentTime;
      const volume = (options.volume || 1) * this.sfxVolume * this.masterVolume;
      const duration = sound.duration || 0.3;
      
      if (sound.freqs) {
        // Play chord (multiple frequencies)
        sound.freqs.forEach((freq, index) => {
          setTimeout(() => this.playTone(freq, duration, volume, sound.type, sound.ramp), index * 50);
        });
      } else {
        // Play single tone
        this.playTone(sound.freq, duration, volume, sound.type, sound.ramp);
      }
      
      // Track for cleanup
      const soundKey = `${soundId}-${now}`;
      this.activeSounds.set(soundKey, {id: soundId, startTime: now, duration: duration});
      
      // Cleanup after sound ends
      setTimeout(() => this.activeSounds.delete(soundKey), duration * 1000 + 100);
    } catch (e) {
      console.warn(`[AudioSystem] Failed to play sound: ${soundId}`, e);
    }
  }
  
  playTone(freq, duration, volume, type = 'sine', ramp = 0) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      // Volume envelope
      gain.gain.setValueAtTime(volume, now);
      if (ramp < 0) {
        // Fade out
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      } else if (ramp > 0) {
        // Fade in
        gain.gain.exponentialRampToValueAtTime(volume, now + duration);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Silently fail if audio context doesn't support this
    }
  }
  
  // ============================================================
  // MUSIC
  // ============================================================
  
  playMusic(musicId, options = {}) {
    if (!this.enabled) return;
    
    const music = this.musicLibrary[musicId];
    if (!music) {
      console.warn(`[AudioSystem] Music not found: ${musicId}`);
      return;
    }
    
    // For now, we'll use ambient tones
    // In production, this would load actual audio files
    console.log(`[AudioSystem] Playing music: ${musicId}`);
  }
  
  stopMusic() {
    if (this.currentMusic) {
      // Stop current music
      this.currentMusic = null;
    }
  }
  
  // ============================================================
  // VOLUME CONTROL
  // ============================================================
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }
  
  toggleMute() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  // ============================================================
  // EVENT CALLBACKS
  // ============================================================
  
  onBattleStart() {
    this.playSFX("zone_enter");
    this.playMusic("battle_theme");
  }
  
  onBattleEnd(victory) {
    if (victory) {
      this.playSFX("victory");
    } else {
      this.playSFX("defeat");
    }
    this.stopMusic();
  }
  
  onAttack() {
    this.playSFX("attack_hit");
  }
  
  onSpellCast(spellType = "spell_cast") {
    this.playSFX(spellType);
  }
  
  onZoneChange(zoneName) {
    this.playSFX("zone_enter");
    if (zoneName === "hub") {
      this.playMusic("ambient_hub");
    } else if (zoneName === "forest") {
      this.playMusic("ambient_forest");
    } else if (zoneName === "city") {
      this.playMusic("ambient_city");
    }
  }
  
  onQuestComplete() {
    this.playSFX("quest_complete");
  }
  
  onGraphicsUnlock() {
    this.playSFX("graphics_unlock");
  }
  
  onLevelUp() {
    this.playSFX("levelup");
  }
  
  // ============================================================
  // PERSISTENCE
  // ============================================================
  
  save() {
    return {
      enabled: this.enabled,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
    };
  }
  
  load(data) {
    if (!data) return;
    this.enabled = data.enabled ?? true;
    this.masterVolume = data.masterVolume ?? 0.7;
    this.sfxVolume = data.sfxVolume ?? 0.5;
    this.musicVolume = data.musicVolume ?? 0.4;
  }
}

console.log("[fx-audio.js] Audio system loaded");
