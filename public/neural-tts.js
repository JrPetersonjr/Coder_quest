// ============================================================
// NEURAL-TTS.JS
// High-Realism Neural Text-to-Speech System
// ============================================================
// Supports: Azure Neural TTS, ElevenLabs, PlayHT, Google Cloud
// Features: SSML generation, emotional prosody, streaming audio
// ============================================================

window.NeuralTTS = {
  // ============================================================
  // [CONFIG] - TTS Provider Settings
  // ============================================================
  config: {
    enabled: false,
    provider: 'azure',  // 'azure', 'elevenlabs', 'playht', 'google'
    
    // Backend endpoint (Render server will proxy to TTS API)
    backendUrl: 'https://coder-quest.onrender.com',
    
    // Azure Neural TTS
    azure: {
      voice: 'en-US-JennyNeural',  // Natural female voice
      style: 'default',            // Can be: cheerful, sad, angry, terrified, etc.
      rate: '0%',                  // -50% to +100%
      pitch: '0%',                 // -50% to +50%
    },
    
    // ElevenLabs
    elevenlabs: {
      voice_id: 'EXAVITQu4vr4xnSDxMaL',  // "Sarah" - natural female
      model_id: 'eleven_monolingual_v1',
      stability: 0.5,
      similarity_boost: 0.75,
    },
    
    // PlayHT
    playht: {
      voice: 's3://peregrine-voices/donna_parrot_saad/manifest.json',
      quality: 'high',
      speed: 1.0,
    },
    
    // Google Cloud TTS
    google: {
      voice: 'en-US-Neural2-F',
      speakingRate: 1.0,
      pitch: 0,
    },
    
    // Game-specific voice profiles
    voices: {
      oracle: {
        azure: { voice: 'en-US-JennyNeural', style: 'whispering', pitch: '+5%' },
        elevenlabs: { voice_id: 'EXAVITQu4vr4xnSDxMaL' },
        description: 'Mystical, ethereal oracle voice'
      },
      mentor: {
        azure: { voice: 'en-US-GuyNeural', style: 'friendly', pitch: '-5%' },
        elevenlabs: { voice_id: 'VR6AewLTigWG4xSOukaG' },
        description: 'Warm, wise mentor voice'
      },
      enemy: {
        azure: { voice: 'en-US-DavisNeural', style: 'angry', pitch: '-10%' },
        elevenlabs: { voice_id: 'pNInz6obpgDQGcFmaJgB' },
        description: 'Threatening enemy voice'
      },
      system: {
        azure: { voice: 'en-US-AriaNeural', style: 'newscast', pitch: '0%' },
        elevenlabs: { voice_id: 'MF3mGyEYCl7XYWbV9V6O' },
        description: 'Clear system announcements'
      }
    }
  },

  // ============================================================
  // [STATE] - Runtime State
  // ============================================================
  state: {
    speaking: false,
    audioContext: null,
    currentSource: null,
    queue: [],
    initialized: false,
  },

  // ============================================================
  // [INITIALIZATION]
  // ============================================================
  
  /**
   * Initialize Neural TTS system
   */
  async init() {
    console.log("[NeuralTTS] Initializing...");
    
    // Create audio context (required for Web Audio API)
    try {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("[NeuralTTS] AudioContext created");
    } catch (e) {
      console.error("[NeuralTTS] Failed to create AudioContext:", e);
      return false;
    }
    
    // Load saved settings
    this.loadSettings();
    
    // Check if backend supports TTS
    await this.checkBackendTTS();
    
    this.state.initialized = true;
    console.log("[NeuralTTS] Initialized - Provider:", this.config.provider);
    return true;
  },

  /**
   * Check if backend has TTS endpoint
   */
  async checkBackendTTS() {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/tts/status`);
      if (response.ok) {
        const data = await response.json();
        this.config.enabled = data.enabled;
        console.log("[NeuralTTS] Backend TTS:", data.enabled ? "Available" : "Not configured");
      }
    } catch (e) {
      console.log("[NeuralTTS] Backend TTS check failed - will use fallback browser TTS");
    }
  },

  // ============================================================
  // [SSML GENERATION] - Create emotional speech markup
  // ============================================================

  /**
   * Generate SSML from text with emotional context
   */
  generateSSML(text, options = {}) {
    const {
      character = 'oracle',
      emotion = 'default',
      intensity = 'medium',
      gameContext = {}
    } = options;

    // Get voice profile
    const profile = this.config.voices[character] || this.config.voices.oracle;
    const azure = profile.azure || this.config.azure;

    // Map emotions to Azure styles
    const emotionMap = {
      calm: 'calm',
      excited: 'cheerful',
      sad: 'sad',
      angry: 'angry',
      fear: 'terrified',
      mysterious: 'whispering',
      urgent: 'newscast-formal',
      friendly: 'friendly',
      default: azure.style || 'default'
    };

    const style = emotionMap[emotion] || emotionMap.default;

    // Adjust rate based on emotion
    const rateMap = {
      excited: '+10%',
      sad: '-15%',
      urgent: '+15%',
      mysterious: '-10%',
      calm: '-5%',
      default: azure.rate || '0%'
    };
    const rate = rateMap[emotion] || rateMap.default;

    // Build SSML
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;
    ssml += `<voice name="${azure.voice}">`;
    
    // Add emotional expression (Azure-specific)
    if (style !== 'default') {
      ssml += `<mstts:express-as style="${style}" styledegree="${intensity === 'high' ? '2' : '1'}">`;
    }
    
    // Add prosody adjustments
    ssml += `<prosody rate="${rate}" pitch="${azure.pitch || '0%'}">`;
    
    // Process text for natural pauses
    let processedText = this.addNaturalPauses(text);
    ssml += processedText;
    
    ssml += `</prosody>`;
    
    if (style !== 'default') {
      ssml += `</mstts:express-as>`;
    }
    
    ssml += `</voice></speak>`;
    
    return ssml;
  },

  /**
   * Add natural pauses to text
   */
  addNaturalPauses(text) {
    // Add pauses after punctuation
    let processed = text
      .replace(/\.\.\./g, '<break time="600ms"/>')  // Ellipsis = longer pause
      .replace(/\./g, '.<break time="300ms"/>')     // Period
      .replace(/\?/g, '?<break time="350ms"/>')     // Question
      .replace(/!/g, '!<break time="250ms"/>')      // Exclamation
      .replace(/,/g, ',<break time="150ms"/>')      // Comma
      .replace(/—/g, '<break time="200ms"/>');      // Em dash
    
    return processed;
  },

  /**
   * Detect emotion from text content
   */
  detectEmotion(text) {
    const lower = text.toLowerCase();
    
    // Threat/danger detection
    if (lower.match(/danger|threat|enemy|attack|warning|beware/)) {
      return 'urgent';
    }
    
    // Sad/loss detection
    if (lower.match(/sorry|lost|gone|fallen|died|failed|regret/)) {
      return 'sad';
    }
    
    // Mystery detection
    if (lower.match(/secret|hidden|ancient|whisper|unknown|mystery|curious/)) {
      return 'mysterious';
    }
    
    // Excitement detection
    if (lower.match(/amazing|incredible|success|victory|found|discovered|excellent/)) {
      return 'excited';
    }
    
    // Fear detection
    if (lower.match(/fear|terrified|horror|nightmare|dread/)) {
      return 'fear';
    }
    
    // Calm/peaceful
    if (lower.match(/peace|calm|rest|safe|gentle|quiet/)) {
      return 'calm';
    }
    
    return 'default';
  },

  // ============================================================
  // [AUDIO PLAYBACK] - Web Audio API
  // ============================================================

  /**
   * Speak text with neural TTS
   */
  async speak(text, options = {}) {
    if (!text || !text.trim()) return;

    // Auto-detect emotion if not provided
    if (!options.emotion) {
      options.emotion = this.detectEmotion(text);
    }

    // If neural TTS not available, fall back to browser TTS
    if (!this.config.enabled) {
      return this.fallbackSpeak(text, options);
    }

    // Cancel current speech
    this.stop();

    // Generate SSML
    const ssml = this.generateSSML(text, options);
    console.log("[NeuralTTS] Speaking with emotion:", options.emotion);

    try {
      this.state.speaking = true;
      this.onSpeakStart();

      // Request audio from backend
      const response = await fetch(`${this.config.backendUrl}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          ssml: ssml,
          provider: this.config.provider,
          options: {
            ...this.config[this.config.provider],
            character: options.character,
            emotion: options.emotion
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Get audio data
      const audioData = await response.arrayBuffer();
      
      // Decode and play
      await this.playAudioBuffer(audioData);

    } catch (error) {
      console.error("[NeuralTTS] Error:", error);
      // Fall back to browser TTS
      this.fallbackSpeak(text, options);
    }
  },

  /**
   * Play audio buffer through Web Audio API
   */
  async playAudioBuffer(audioData) {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume context if suspended (browser autoplay policy)
    if (this.state.audioContext.state === 'suspended') {
      await this.state.audioContext.resume();
    }

    try {
      const audioBuffer = await this.state.audioContext.decodeAudioData(audioData);
      
      const source = this.state.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.state.audioContext.destination);
      
      source.onended = () => {
        this.state.speaking = false;
        this.state.currentSource = null;
        this.onSpeakEnd();
        this.processQueue();
      };

      this.state.currentSource = source;
      source.start(0);

    } catch (e) {
      console.error("[NeuralTTS] Audio decode error:", e);
      this.state.speaking = false;
      this.onSpeakEnd();
    }
  },

  /**
   * Fallback to browser's built-in TTS
   */
  fallbackSpeak(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn("[NeuralTTS] No TTS available");
      return;
    }

    speechSynthesis.cancel();

    // Clean text
    const cleanText = text
      .replace(/\[.*?\]/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice based on character
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(v => 
      v.name.includes('Google UK English Female') ||
      v.name.includes('Microsoft Zira') ||
      v.name.includes('Samantha')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    // Adjust based on emotion
    const emotionSettings = {
      excited: { rate: 1.1, pitch: 1.2 },
      sad: { rate: 0.8, pitch: 0.9 },
      urgent: { rate: 1.15, pitch: 1.1 },
      mysterious: { rate: 0.85, pitch: 1.05 },
      calm: { rate: 0.9, pitch: 1.0 },
      default: { rate: 0.9, pitch: 1.1 }
    };
    
    const settings = emotionSettings[options.emotion] || emotionSettings.default;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 0.9;

    utterance.onstart = () => {
      this.state.speaking = true;
      this.onSpeakStart();
    };

    utterance.onend = () => {
      this.state.speaking = false;
      this.onSpeakEnd();
      this.processQueue();
    };

    speechSynthesis.speak(utterance);
  },

  /**
   * Stop current speech
   */
  stop() {
    // Stop Web Audio
    if (this.state.currentSource) {
      try {
        this.state.currentSource.stop();
      } catch (e) {}
      this.state.currentSource = null;
    }

    // Stop browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    this.state.speaking = false;
    this.state.queue = [];
    this.onSpeakEnd();
  },

  /**
   * Queue speech (for multiple messages)
   */
  queueSpeak(text, options = {}) {
    this.state.queue.push({ text, options });
    
    if (!this.state.speaking) {
      this.processQueue();
    }
  },

  /**
   * Process speech queue
   */
  processQueue() {
    if (this.state.queue.length === 0) return;
    
    const { text, options } = this.state.queue.shift();
    this.speak(text, options);
  },

  // ============================================================
  // [EVENT CALLBACKS]
  // ============================================================

  onSpeakStart() {
    const display = document.getElementById("crystal-ball-display");
    if (display) display.classList.add("active");
    
    // Trigger visual effect
    if (window.BattleAnimations) {
      BattleAnimations.triggerEffect('oracle_speaking');
    }
  },

  onSpeakEnd() {
    const display = document.getElementById("crystal-ball-display");
    if (display) display.classList.remove("active");
  },

  // ============================================================
  // [SETTINGS]
  // ============================================================

  /**
   * Load saved settings
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('neuralTTS_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(this.config, settings);
      }
    } catch (e) {}
  },

  /**
   * Save settings
   */
  saveSettings() {
    try {
      localStorage.setItem('neuralTTS_settings', JSON.stringify({
        enabled: this.config.enabled,
        provider: this.config.provider,
        azure: this.config.azure,
        elevenlabs: this.config.elevenlabs
      }));
    } catch (e) {}
  },

  /**
   * Set TTS provider
   */
  setProvider(provider) {
    if (['azure', 'elevenlabs', 'playht', 'google'].includes(provider)) {
      this.config.provider = provider;
      this.saveSettings();
      console.log("[NeuralTTS] Provider set to:", provider);
    }
  },

  /**
   * Enable/disable neural TTS
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    this.saveSettings();
    console.log("[NeuralTTS]", enabled ? "Enabled" : "Disabled");
  },

  /**
   * Get status
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      provider: this.config.provider,
      speaking: this.state.speaking,
      initialized: this.state.initialized,
      queueLength: this.state.queue.length
    };
  }
};

// ============================================================
// [AUTO-INIT]
// ============================================================
console.log("[NeuralTTS] Module loaded. Call NeuralTTS.init() to initialize.");
