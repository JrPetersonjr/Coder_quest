// ============================================================
// AUTH-SYSTEM.JS
// User authentication and cloud save sync
// ============================================================

window.AuthSystem = {
  // ============================================================
  // [STATE]
  // ============================================================
  state: {
    loggedIn: false,
    username: null,
    token: null,
    characterClass: null,
    stats: null,
    gameState: null
  },

  // Backend URL
  backendUrl: 'https://coder-quest.onrender.com',

  // ============================================================
  // [INITIALIZATION]
  // ============================================================

  /**
   * Initialize auth system - check for existing session
   */
  async init() {
    console.log('[Auth] Initializing...');

    // Check URL params for auto-login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoLogin') === 'true') {
      const token = urlParams.get('token') || localStorage.getItem('technomancer_token');
      if (token) {
        const success = await this.verifyToken(token);
        if (success) {
          // Remove URL params
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
      }
    }

    // Check for stored token
    const storedToken = localStorage.getItem('technomancer_token');
    if (storedToken) {
      const success = await this.verifyToken(storedToken);
      if (success) return true;
    }

    // No valid session - show login
    return false;
  },

  /**
   * Verify token with backend
   */
  async verifyToken(token) {
    try {
      const response = await fetch(`${this.backendUrl}/api/user/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const data = await response.json();
      
      if (data.success) {
        this.state.loggedIn = true;
        this.state.username = data.username;
        this.state.token = token;
        this.state.characterClass = data.characterClass;
        this.state.stats = data.stats;
        this.state.gameState = data.gameState;

        localStorage.setItem('technomancer_token', token);
        localStorage.setItem('technomancer_username', data.username);

        console.log(`[Auth] Session restored: ${data.username}`);
        return true;
      }
    } catch (error) {
      console.warn('[Auth] Token verification failed:', error.message);
    }
    
    return false;
  },

  // ============================================================
  // [LOGIN / REGISTER]
  // ============================================================

  /**
   * Login with username and password
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.backendUrl}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        this.state.loggedIn = true;
        this.state.username = data.username;
        this.state.token = data.token;
        this.state.characterClass = data.characterClass;
        this.state.stats = data.stats;
        this.state.gameState = data.gameState;

        localStorage.setItem('technomancer_token', data.token);
        localStorage.setItem('technomancer_username', data.username);

        console.log(`[Auth] Logged in: ${data.username}`);
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: 'Could not connect to server' };
    }
  },

  /**
   * Logout
   */
  logout() {
    this.clearSession();
    window.location.reload();
  },

  /**
   * Clear session data
   */
  clearSession() {
    this.state.loggedIn = false;
    this.state.username = null;
    this.state.token = null;
    this.state.characterClass = null;
    this.state.stats = null;
    this.state.gameState = null;

    localStorage.removeItem('technomancer_token');
    localStorage.removeItem('technomancer_username');
  },

  // ============================================================
  // [CLOUD SAVE]
  // ============================================================

  /**
   * Save game state to cloud
   */
  async saveToCloud(gameState) {
    if (!this.state.loggedIn || !this.state.token) {
      console.warn('[Auth] Not logged in - cannot save to cloud');
      return false;
    }

    try {
      const response = await fetch(`${this.backendUrl}/api/user/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.state.token,
          gameState: gameState
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('[Auth] Game saved to cloud');
        return true;
      }
    } catch (error) {
      console.error('[Auth] Cloud save error:', error);
    }

    return false;
  },

  /**
   * Load game state from cloud
   */
  async loadFromCloud() {
    if (!this.state.loggedIn || !this.state.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.backendUrl}/api/user/save/${this.state.username}`, {
        headers: {
          'Authorization': `Bearer ${this.state.token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        this.state.gameState = data.gameState;
        return data.gameState;
      }
    } catch (error) {
      console.error('[Auth] Cloud load error:', error);
    }

    return null;
  },

  // ============================================================
  // [LOGIN UI]
  // ============================================================

  /**
   * Show login screen
   */
  showLoginScreen() {
    // Check if login screen already exists
    if (document.getElementById('login-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.innerHTML = `
      <style>
        #login-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(10, 14, 26, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          font-family: 'Share Tech Mono', monospace;
        }

        .login-panel {
          background: #0d1117;
          border: 2px solid #2fb43a;
          border-radius: 8px;
          padding: 40px;
          width: 400px;
          max-width: 90vw;
          text-align: center;
        }

        .login-title {
          font-family: 'VT323', monospace;
          font-size: 2.5rem;
          color: #00d4ff;
          margin-bottom: 10px;
          text-shadow: 0 0 20px #00d4ff;
        }

        .login-subtitle {
          color: #888;
          margin-bottom: 30px;
        }

        .login-form .form-group {
          margin-bottom: 20px;
          text-align: left;
        }

        .login-form label {
          display: block;
          color: #2fb43a;
          margin-bottom: 8px;
        }

        .login-form input {
          width: 100%;
          padding: 12px;
          background: #1a1a2e;
          border: 2px solid #333;
          border-radius: 4px;
          color: #2fb43a;
          font-family: inherit;
          font-size: 1rem;
        }

        .login-form input:focus {
          outline: none;
          border-color: #00d4ff;
        }

        .login-error {
          color: #ff4444;
          margin-bottom: 15px;
          display: none;
        }

        .login-error.visible {
          display: block;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          background: transparent;
          border: 2px solid #2fb43a;
          color: #2fb43a;
          font-family: 'VT323', monospace;
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 15px;
        }

        .login-btn:hover {
          background: #2fb43a;
          color: #0a0e1a;
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .login-link {
          color: #00d4ff;
          text-decoration: none;
          cursor: pointer;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .login-divider {
          margin: 20px 0;
          color: #555;
          position: relative;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: #333;
        }

        .login-divider::before { left: 0; }
        .login-divider::after { right: 0; }
      </style>

      <div class="login-panel">
        <h1 class="login-title">TECHNOMANCER</h1>
        <p class="login-subtitle">Enter your credentials to continue</p>

        <form class="login-form" onsubmit="AuthSystem.handleLogin(event)">
          <div class="form-group">
            <label for="login-username">USERNAME</label>
            <input type="text" id="login-username" placeholder="Your technomancer name" autocomplete="username" required>
          </div>

          <div class="form-group">
            <label for="login-password">PASSWORD</label>
            <input type="password" id="login-password" placeholder="Your password" autocomplete="current-password" required>
          </div>

          <div class="login-error" id="login-error"></div>

          <button type="submit" class="login-btn" id="login-submit">
            LOGIN
          </button>
        </form>

        <div class="login-divider">or</div>

        <button class="login-btn" style="border-color: #ffd700; color: #ffd700;" onclick="AuthSystem.goToRegister()">
          CREATE NEW ACCOUNT
        </button>

        <p style="margin-top: 20px; color: #555; font-size: 0.9rem;">
          <span class="login-link" onclick="AuthSystem.playOffline()">Play Offline</span>
          (progress won't sync)
        </p>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById('login-username').focus();
  },

  /**
   * Hide login screen
   */
  hideLoginScreen() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
      overlay.remove();
    }
  },

  /**
   * Handle login form submission
   */
  async handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit');

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'LOGGING IN...';
    errorEl.classList.remove('visible');

    const result = await this.login(username, password);

    if (result.success) {
      this.hideLoginScreen();
      this.onLoginSuccess();
    } else {
      errorEl.textContent = result.error;
      errorEl.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'LOGIN';
    }
  },

  /**
   * Go to registration page
   */
  goToRegister() {
    window.location.href = 'web-intro.html';
  },

  /**
   * Play without account
   */
  playOffline() {
    this.hideLoginScreen();
    this.state.loggedIn = false;
    this.state.username = 'Guest_' + Math.random().toString(36).substr(2, 6);
    this.onLoginSuccess();
  },

  /**
   * Called when login is successful
   */
  onLoginSuccess() {
    console.log('[Auth] Login successful, starting game...');
    
    // Load cloud save into game engine if available
    if (this.state.gameState && window.gameEngine) {
      Object.assign(gameEngine.gameState, this.state.gameState);
      console.log('[Auth] Cloud save loaded');
    }

    // Trigger game start if needed
    if (window.IntroSystem && !this.state.gameState?.introComplete) {
      // New player - show intro
      IntroSystem.start();
    } else if (window.gameEngine) {
      // Returning player - resume game
      gameEngine.output(`Welcome back, ${this.state.username}!`, 'system');
      gameEngine.output('Your progress has been restored.', 'hint');
    }
  },

  // ============================================================
  // [UTILITIES]
  // ============================================================

  /**
   * Get current user info
   */
  getUser() {
    return {
      loggedIn: this.state.loggedIn,
      username: this.state.username,
      characterClass: this.state.characterClass,
      stats: this.state.stats
    };
  },

  /**
   * Check if logged in
   */
  isLoggedIn() {
    return this.state.loggedIn;
  }
};

// ============================================================
// [AUTO-INIT]
// ============================================================
console.log('[AuthSystem] Module loaded');
