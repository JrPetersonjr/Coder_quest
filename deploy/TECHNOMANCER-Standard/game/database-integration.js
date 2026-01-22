// ============================================================
// DATABASE-INTEGRATION.JS
// Netlify database integration for voice cache and user data
// ============================================================

window.TechnomancerDB = {
  
  // Configuration
  config: {
    baseUrl: 'https://technomancer-db.netlify.app/.netlify/functions',
    voiceCacheUrl: 'https://technomancer-db.netlify.app/.netlify/functions/voice-cache',
    userDataUrl: 'https://technomancer-db.netlify.app/.netlify/functions/user-data',
    characterCacheUrl: 'https://technomancer-db.netlify.app/.netlify/functions/character-cache',
    
    // Cache settings
    voiceCache: {
      enabled: true,
      maxCacheSize: 1000,
      cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
      preloadPopularVoices: true
    }
  },

  // ============================================================
  // [VOICE CACHE MANAGEMENT]
  // ============================================================

  /**
   * Cache voice profile to database
   */
  async cacheVoiceProfile(characterName, voiceData) {
    if (!this.config.voiceCache.enabled) return false;
    
    try {
      console.log('[TechnomancerDB] Caching voice profile:', characterName);
      
      const response = await fetch(`${this.config.voiceCacheUrl}/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          characterName,
          voiceData,
          timestamp: Date.now(),
          source: 'user_generated',
          popularity: 1
        })
      });
      
      if (response.ok) {
        console.log('[TechnomancerDB] Voice profile cached successfully');
        return true;
      } else {
        console.warn('[TechnomancerDB] Voice cache failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[TechnomancerDB] Voice cache error:', error);
      return false;
    }
  },

  /**
   * Retrieve cached voice profile
   */
  async getCachedVoice(cacheKey) {
    if (!this.config.voiceCache.enabled) return null;
    
    try {
      const response = await fetch(
        `${this.config.voiceCacheUrl}/retrieve?key=${encodeURIComponent(cacheKey)}`, 
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );
      
      if (response.ok) {
        const cachedData = await response.json();
        console.log('[TechnomancerDB] Retrieved cached voice:', cacheKey);
        
        // Update popularity
        this.incrementVoicePopularity(cacheKey);
        
        return cachedData;
      }
      return null;
    } catch (error) {
      console.error('[TechnomancerDB] Voice retrieval error:', error);
      return null;
    }
  },

  /**
   * Get popular voice profiles for preloading
   */
  async getPopularVoices(limit = 20) {
    try {
      const response = await fetch(`${this.config.voiceCacheUrl}/popular?limit=${limit}`);
      if (response.ok) {
        const popularVoices = await response.json();
        console.log(`[TechnomancerDB] Retrieved ${popularVoices.length} popular voices`);
        return popularVoices;
      }
      return [];
    } catch (error) {
      console.error('[TechnomancerDB] Popular voices error:', error);
      return [];
    }
  },

  /**
   * Increment voice popularity counter
   */
  async incrementVoicePopularity(cacheKey) {
    try {
      await fetch(`${this.config.voiceCacheUrl}/popularity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cacheKey })
      });
    } catch (error) {
      // Silent fail - popularity is not critical
      console.debug('[TechnomancerDB] Popularity update failed:', error);
    }
  },

  // ============================================================
  // [CHARACTER CACHE MANAGEMENT]
  // ============================================================

  /**
   * Cache generated character to database
   */
  async cacheGeneratedCharacter(character) {
    try {
      console.log('[TechnomancerDB] Caching generated character:', character.name);
      
      const response = await fetch(`${this.config.characterCacheUrl}/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          character,
          timestamp: Date.now(),
          source: 'autonomous_generation'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('[TechnomancerDB] Character cache error:', error);
      return false;
    }
  },

  /**
   * Retrieve cached character
   */
  async getCachedCharacter(characterName) {
    try {
      const response = await fetch(
        `${this.config.characterCacheUrl}/retrieve?name=${encodeURIComponent(characterName)}`
      );
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('[TechnomancerDB] Character retrieval error:', error);
      return null;
    }
  },

  // ============================================================
  // [USER DATA MANAGEMENT] 
  // ============================================================

  /**
   * Save user game data with persistent login
   */
  async saveUserData(userData) {
    try {
      console.log('[TechnomancerDB] Saving user data');
      
      const response = await fetch(`${this.config.userDataUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userData,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        console.log('[TechnomancerDB] User data saved successfully');
        return true;
      } else {
        console.warn('[TechnomancerDB] User data save failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[TechnomancerDB] User data save error:', error);
      return false;
    }
  },

  /**
   * Load user game data
   */
  async loadUserData() {
    try {
      const response = await fetch(`${this.config.userDataUrl}/load`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('[TechnomancerDB] User data loaded successfully');
        return userData;
      }
      return null;
    } catch (error) {
      console.error('[TechnomancerDB] User data load error:', error);
      return null;
    }
  },

  /**
   * Create or refresh authentication token
   */
  async authenticateUser(username, password) {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const authData = await response.json();
        localStorage.setItem('technomancer_auth_token', authData.token);
        localStorage.setItem('technomancer_user_id', authData.userId);
        localStorage.setItem('technomancer_token_expiry', authData.expiry);
        
        console.log('[TechnomancerDB] User authenticated successfully');
        return authData;
      }
      return null;
    } catch (error) {
      console.error('[TechnomancerDB] Authentication error:', error);
      return null;
    }
  },

  // ============================================================
  // [UTILITY METHODS]
  // ============================================================

  /**
   * Get authentication token with auto-refresh
   */
  getAuthToken() {
    const token = localStorage.getItem('technomancer_auth_token');
    const expiry = localStorage.getItem('technomancer_token_expiry');
    
    // Check if token is expired
    if (expiry && Date.now() > parseInt(expiry)) {
      console.log('[TechnomancerDB] Token expired, clearing auth data');
      localStorage.removeItem('technomancer_auth_token');
      localStorage.removeItem('technomancer_user_id');
      localStorage.removeItem('technomancer_token_expiry');
      return 'anonymous';
    }
    
    return token || 'anonymous';
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    return token !== 'anonymous';
  },

  /**
   * Check if cached data is still valid
   */
  isValidCache(cachedData) {
    const maxAge = this.config.voiceCache.cacheExpiry;
    const age = Date.now() - cachedData.timestamp;
    return age < maxAge;
  },

  /**
   * Initialize database integration
   */
  async init() {
    console.log('[TechnomancerDB] Initializing database integration...');
    
    // Test connection
    try {
      const response = await fetch(`${this.config.baseUrl}/health`);
      if (response.ok) {
        console.log('[TechnomancerDB] Database connection established');
      } else {
        console.warn('[TechnomancerDB] Database connection failed');
      }
    } catch (error) {
      console.error('[TechnomancerDB] Database initialization error:', error);
    }
    
    // Preload popular voices if enabled
    if (this.config.voiceCache.preloadPopularVoices && window.VoiceTrainer) {
      setTimeout(() => this.preloadPopularVoices(), 2000);
    }
  },

  /**
   * Preload popular voices for offline use
   */
  async preloadPopularVoices() {
    try {
      console.log('[TechnomancerDB] Preloading popular voices...');
      const popularVoices = await this.getPopularVoices(20);
      
      if (window.VoiceTrainer && popularVoices.length > 0) {
        for (const voice of popularVoices) {
          if (this.isValidCache(voice)) {
            window.VoiceTrainer.characterVoices.set(voice.characterName, voice.voiceData);
          }
        }
        
        window.VoiceTrainer.saveToStorage();
        console.log(`[TechnomancerDB] Preloaded ${popularVoices.length} popular voices`);
      }
      
    } catch (error) {
      console.error('[TechnomancerDB] Preload error:', error);
    }
  }
};

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.TechnomancerDB.init());
} else {
  window.TechnomancerDB.init();
}