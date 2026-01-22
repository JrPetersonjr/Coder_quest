// ============================================================
// MIDI-PLAYER.JS
// MIDI playback system for Technomancer game music
//
// PURPOSE:
//   - Parse text-format MIDI files
//   - Convert to Web Audio API for playback
//   - Support multiple tracks (lead, bass, percussion)
//   - Generate variations of base themes
//   - Integrate with game audio system
// ============================================================

window.MIDIPlayer = {
  
  // Configuration
  config: {
    enabled: true,
    volume: 0.7,
    defaultTempo: 300000, // 200 BPM (60,000,000/300,000)
    ticksPerQuarter: 96,
    currentTrack: 'technomancer_theme'
  },

  // State
  state: {
    audioContext: null,
    isPlaying: false,
    currentSong: null,
    scheduledEvents: [],
    startTime: 0,
    tracks: []
  },

  // Music database - your theme and variations
  songs: {
    technomancer_theme: {
      name: "Technomancer Theme",
      tempo: 300000,
      ticksPerQuarter: 96,
      tracks: [
        {
          name: "Lead",
          channel: 1,
          instrument: "square",
          notes: [
            {time: 0, note: 76, velocity: 100, duration: 96},
            {time: 96, note: 79, velocity: 100, duration: 96},
            {time: 192, note: 81, velocity: 100, duration: 96},
            {time: 288, note: 79, velocity: 100, duration: 96},
            {time: 384, note: 76, velocity: 100, duration: 96},
            {time: 480, note: 74, velocity: 100, duration: 96},
            {time: 576, note: 72, velocity: 100, duration: 96},
            {time: 672, note: 74, velocity: 100, duration: 96},
            {time: 768, note: 76, velocity: 100, duration: 96},
            {time: 864, note: 79, velocity: 100, duration: 96},
            {time: 960, note: 83, velocity: 100, duration: 96},
            {time: 1056, note: 81, velocity: 100, duration: 96}
          ]
        },
        {
          name: "Bass",
          channel: 2,
          instrument: "triangle",
          notes: [
            {time: 0, note: 48, velocity: 100, duration: 96},
            {time: 96, note: 50, velocity: 100, duration: 96},
            {time: 192, note: 52, velocity: 100, duration: 96},
            {time: 288, note: 50, velocity: 100, duration: 96},
            {time: 384, note: 48, velocity: 100, duration: 96},
            {time: 480, note: 45, velocity: 100, duration: 96},
            {time: 576, note: 43, velocity: 100, duration: 96},
            {time: 672, note: 45, velocity: 100, duration: 96},
            {time: 768, note: 48, velocity: 100, duration: 96},
            {time: 864, note: 50, velocity: 100, duration: 96},
            {time: 960, note: 55, velocity: 100, duration: 96},
            {time: 1056, note: 52, velocity: 100, duration: 96}
          ]
        },
        {
          name: "Percussion",
          channel: 10,
          instrument: "noise",
          notes: [
            {time: 0, note: 40, velocity: 100, duration: 48},
            {time: 96, note: 37, velocity: 100, duration: 48},
            {time: 192, note: 40, velocity: 100, duration: 48},
            {time: 288, note: 37, velocity: 100, duration: 48},
            {time: 384, note: 40, velocity: 100, duration: 48},
            {time: 480, note: 37, velocity: 100, duration: 48},
            {time: 576, note: 40, velocity: 100, duration: 48},
            {time: 672, note: 37, velocity: 100, duration: 48},
            {time: 768, note: 40, velocity: 100, duration: 48},
            {time: 864, note: 37, velocity: 100, duration: 48},
            {time: 960, note: 40, velocity: 100, duration: 48},
            {time: 1056, note: 37, velocity: 100, duration: 48}
          ]
        }
      ]
    }
  },

  // ============================================================
  // INITIALIZATION
  // ============================================================

  initialize: function() {
    if (this.state.audioContext) return;

    try {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.generateVariations();
      console.log("[MIDIPlayer] Initialized with", Object.keys(this.songs).length, "songs");
      return true;
    } catch (error) {
      console.error("[MIDIPlayer] Failed to initialize:", error);
      return false;
    }
  },

  // ============================================================
  // SONG GENERATION - Create variations of the base theme
  // ============================================================

  generateVariations: function() {
    const baseTheme = this.songs.technomancer_theme;

    // Battle variation - faster tempo, minor key
    this.songs.battle_theme = this.createVariation(baseTheme, {
      name: "Battle Theme",
      tempo: 250000, // Faster (240 BPM)
      transposeKey: -3, // Minor third down
      amplifyDrums: true
    });

    // Exploration variation - slower, ambient
    this.songs.exploration_theme = this.createVariation(baseTheme, {
      name: "Exploration Theme", 
      tempo: 400000, // Slower (150 BPM)
      transposeKey: 5, // Fifth up
      ambientMode: true
    });

    // Victory variation - major, triumphant
    this.songs.victory_theme = this.createVariation(baseTheme, {
      name: "Victory Theme",
      tempo: 280000, // Slightly faster (214 BPM)
      transposeKey: 7, // Major scale shift
      addHarmony: true
    });

    console.log("[MIDIPlayer] Generated", Object.keys(this.songs).length - 1, "variations");
  },

  createVariation: function(baseTheme, options) {
    const variation = JSON.parse(JSON.stringify(baseTheme)); // Deep copy
    
    variation.name = options.name;
    variation.tempo = options.tempo || baseTheme.tempo;

    variation.tracks.forEach(track => {
      track.notes.forEach(note => {
        // Transpose notes
        if (options.transposeKey) {
          note.note = Math.max(20, Math.min(108, note.note + options.transposeKey));
        }

        // Modify drums for battle
        if (options.amplifyDrums && track.channel === 10) {
          note.velocity = Math.min(127, note.velocity * 1.3);
          // Add extra drum hits
          if (note.time % 192 === 0) { // On strong beats
            track.notes.push({
              time: note.time + 24,
              note: 42, // Closed hi-hat
              velocity: 80,
              duration: 24
            });
          }
        }

        // Ambient mode - softer, longer notes
        if (options.ambientMode) {
          note.velocity *= 0.7;
          note.duration *= 1.5;
        }

        // Add harmony
        if (options.addHarmony && track.channel === 1) {
          // Add harmony note a third above
          track.notes.push({
            time: note.time,
            note: note.note + 4, // Major third
            velocity: note.velocity * 0.6,
            duration: note.duration
          });
        }
      });
    });

    return variation;
  },

  // ============================================================
  // PLAYBACK
  // ============================================================

  play: function(songName = 'technomancer_theme') {
    if (!this.state.audioContext || this.state.isPlaying) return;

    const song = this.songs[songName];
    if (!song) {
      console.warn("[MIDIPlayer] Song not found:", songName);
      return;
    }

    this.stop(); // Clear any existing playback
    
    console.log("[MIDIPlayer] Playing:", song.name);
    this.state.currentSong = song;
    this.state.isPlaying = true;
    this.state.startTime = this.state.audioContext.currentTime;

    // Calculate timing
    const secondsPerTick = (song.tempo / 1000000) / song.ticksPerQuarter;

    // Schedule all notes
    song.tracks.forEach(track => {
      track.notes.forEach(noteEvent => {
        const startTime = this.state.startTime + (noteEvent.time * secondsPerTick);
        const duration = noteEvent.duration * secondsPerTick;
        
        this.playNote(
          noteEvent.note,
          noteEvent.velocity,
          startTime,
          duration,
          track.instrument,
          track.channel
        );
      });
    });

    // Auto-loop after song ends
    const songDuration = song.tracks.reduce((max, track) => {
      const trackEnd = Math.max(...track.notes.map(n => n.time + n.duration));
      return Math.max(max, trackEnd);
    }, 0) * secondsPerTick;

    setTimeout(() => {
      if (this.state.isPlaying && this.state.currentSong === song) {
        this.play(songName); // Loop
      }
    }, songDuration * 1000);
  },

  playNote: function(midiNote, velocity, startTime, duration, waveform = 'square', channel = 1) {
    if (!this.state.audioContext) return;

    const frequency = this.midiNoteToFrequency(midiNote);
    const volume = (velocity / 127) * this.config.volume;

    if (channel === 10) {
      // Percussion - use noise
      this.playPercussion(startTime, duration, midiNote, volume);
    } else {
      // Melodic - use oscillator
      this.playTone(frequency, startTime, duration, volume, waveform);
    }
  },

  playTone: function(frequency, startTime, duration, volume, waveform) {
    const oscillator = this.state.audioContext.createOscillator();
    const gainNode = this.state.audioContext.createGain();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.state.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  },

  playPercussion: function(startTime, duration, note, volume) {
    // Generate noise for percussion
    const bufferSize = this.state.audioContext.sampleRate * duration;
    const buffer = this.state.audioContext.createBuffer(1, bufferSize, this.state.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Different noise patterns for different drum sounds
    for (let i = 0; i < bufferSize; i++) {
      if (note === 40) { // Snare
        data[i] = (Math.random() * 2 - 1) * volume * Math.exp(-i / bufferSize * 8);
      } else if (note === 37) { // Kick
        data[i] = (Math.random() * 2 - 1) * volume * Math.exp(-i / bufferSize * 15);
      } else { // Other
        data[i] = (Math.random() * 2 - 1) * volume * Math.exp(-i / bufferSize * 5);
      }
    }

    const source = this.state.audioContext.createBufferSource();
    const gainNode = this.state.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(volume, startTime);
    
    source.connect(gainNode);
    gainNode.connect(this.state.audioContext.destination);
    
    source.start(startTime);
  },

  stop: function() {
    this.state.isPlaying = false;
    this.state.currentSong = null;
    // Note: Individual oscillators will stop themselves
  },

  // ============================================================
  // UTILITIES
  // ============================================================

  midiNoteToFrequency: function(note) {
    // A4 = 440Hz = MIDI note 69
    return 440 * Math.pow(2, (note - 69) / 12);
  },

  setVolume: function(volume) {
    this.config.volume = Math.max(0, Math.min(1, volume));
  },

  // ============================================================
  // GAME INTEGRATION
  // ============================================================

  playTheme: function(context = 'menu') {
    const themeMap = {
      'menu': 'technomancer_theme',
      'battle': 'battle_theme', 
      'exploration': 'exploration_theme',
      'victory': 'victory_theme',
      'ambient': 'exploration_theme'
    };

    const songName = themeMap[context] || 'technomancer_theme';
    this.play(songName);
  },

  // ============================================================
  // MIDI PARSER - For adding new songs from text format
  // ============================================================

  parseMIDIText: function(midiText) {
    // Parse your text format and convert to internal format
    // This would parse the format you provided
    const lines = midiText.split('\n');
    const song = {
      tracks: [],
      tempo: 300000,
      ticksPerQuarter: 96
    };

    let currentTrack = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('MTrk')) {
        currentTrack = { notes: [], channel: 1, name: "", instrument: "square" };
        song.tracks.push(currentTrack);
      }
      else if (trimmed.startsWith('0 Tempo')) {
        song.tempo = parseInt(trimmed.split(' ')[2]);
      }
      else if (trimmed.includes('TrkName')) {
        const name = trimmed.match(/"([^"]+)"/)?.[1] || "";
        currentTrack.name = name;
        if (name === "Bass") currentTrack.instrument = "triangle";
        if (name === "Perc") currentTrack.instrument = "noise";
      }
      else if (trimmed.includes('On ch=')) {
        const match = trimmed.match(/(\d+) On ch=(\d+) n=(\d+) v=(\d+)/);
        if (match && currentTrack) {
          const [, time, channel, note, velocity] = match;
          currentTrack.channel = parseInt(channel);
          
          // Find corresponding Off event for duration
          const offPattern = new RegExp(`(\\d+) Off ch=${channel} n=${note}`);
          const offMatch = midiText.match(offPattern);
          const duration = offMatch ? parseInt(offMatch[1]) - parseInt(time) : 96;
          
          currentTrack.notes.push({
            time: parseInt(time),
            note: parseInt(note),
            velocity: parseInt(velocity),
            duration: Math.max(24, duration)
          });
        }
      }
    }

    return song;
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  if (MIDIPlayer.initialize()) {
    console.log("[MIDIPlayer] Ready to rock! 🎵");
  }
});

console.log("[midi-player.js] Loaded. Call MIDIPlayer.playTheme('battle') to start music.");