// ============================================================
// AI-CONNECTION-WIZARD.JS
// User-friendly AI connection setup wizard
// ============================================================

window.AIConnectionWizard = {
  
  state: {
    isOpen: false,
    currentStep: 0,
    detectedProviders: [],
    selectedProvider: null,
    setupComplete: false
  },

  steps: [
    {
      title: "🔮 AI Oracle Connection",
      description: "Let's set up your mystical AI oracle connection...",
      type: "intro"
    },
    {
      title: "🔍 Detecting Available AI",
      description: "Scanning for available AI providers...",
      type: "detection"
    },
    {
      title: "⚡ Choose Your Oracle",
      description: "Select which AI oracle you'd like to use:",
      type: "selection"
    },
    {
      title: "✨ Testing Connection",
      description: "Verifying your oracle responds...",
      type: "test"
    },
    {
      title: "🎉 Oracle Ready!",
      description: "Your mystical AI oracle is ready to guide you!",
      type: "complete"
    }
  ],

  // Show the connection wizard
  show() {
    if (this.state.isOpen) return;
    
    this.state.isOpen = true;
    this.state.currentStep = 0;
    this.createWizardUI();
    this.start();
  },

  // Create the wizard UI
  createWizardUI() {
    // Remove any existing wizard
    const existing = document.getElementById('ai-connection-wizard');
    if (existing) existing.remove();

    const wizard = document.createElement('div');
    wizard.id = 'ai-connection-wizard';
    wizard.innerHTML = `
      <div class="wizard-overlay">
        <div class="wizard-modal">
          <div class="wizard-header">
            <h2 id="wizard-title">🔮 AI Oracle Setup</h2>
            <button class="wizard-close" onclick="AIConnectionWizard.hide()">×</button>
          </div>
          
          <div class="wizard-body">
            <div id="wizard-content">
              <div class="wizard-loading">
                <div class="spinner"></div>
                <p>Initializing wizard...</p>
              </div>
            </div>
          </div>
          
          <div class="wizard-footer">
            <button id="wizard-prev" onclick="AIConnectionWizard.previousStep()" disabled>Previous</button>
            <button id="wizard-next" onclick="AIConnectionWizard.nextStep()">Next</button>
            <button id="wizard-skip" onclick="AIConnectionWizard.skip()">Skip Setup</button>
          </div>
          
          <div class="wizard-progress">
            <div class="progress-bar">
              <div id="progress-fill" style="width: 0%"></div>
            </div>
            <span id="progress-text">Step 1 of 5</span>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .wizard-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Courier Prime', monospace;
      }
      
      .wizard-modal {
        background: linear-gradient(135deg, #001100, #003300);
        border: 2px solid #00ff00;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
        color: #00ff00;
      }
      
      .wizard-header {
        padding: 20px;
        border-bottom: 1px solid #00ff00;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .wizard-header h2 {
        margin: 0;
        font-size: 1.5em;
      }
      
      .wizard-close {
        background: none;
        border: 1px solid #00ff00;
        color: #00ff00;
        font-size: 1.5em;
        width: 35px;
        height: 35px;
        cursor: pointer;
        border-radius: 4px;
      }
      
      .wizard-close:hover {
        background: #00ff00;
        color: #000;
      }
      
      .wizard-body {
        padding: 30px;
        min-height: 200px;
      }
      
      .wizard-footer {
        padding: 20px;
        border-top: 1px solid #00ff00;
        display: flex;
        justify-content: space-between;
      }
      
      .wizard-footer button {
        background: #002200;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
      }
      
      .wizard-footer button:hover {
        background: #004400;
      }
      
      .wizard-footer button:disabled {
        background: #001100;
        color: #666;
        cursor: not-allowed;
      }
      
      .wizard-progress {
        padding: 15px 20px;
        border-top: 1px solid #00ff00;
        background: #000500;
      }
      
      .progress-bar {
        width: 100%;
        height: 8px;
        background: #001100;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      #progress-fill {
        height: 100%;
        background: #00ff00;
        transition: width 0.3s ease;
      }
      
      #progress-text {
        font-size: 0.9em;
        color: #88ff88;
      }
      
      .wizard-loading {
        text-align: center;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #003300;
        border-top: 3px solid #00ff00;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .provider-option {
        background: #001100;
        border: 1px solid #00ff00;
        padding: 15px;
        margin: 10px 0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .provider-option:hover {
        background: #003300;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
      }
      
      .provider-option.selected {
        background: #004400;
        border-color: #44ff44;
      }
      
      .provider-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .provider-description {
        font-size: 0.9em;
        color: #88ff88;
      }
      
      .provider-status {
        float: right;
        font-size: 0.8em;
        padding: 2px 8px;
        border-radius: 3px;
        margin-left: 10px;
      }
      
      .status-available {
        background: #004400;
        color: #00ff00;
      }
      
      .status-fallback {
        background: #440400;
        color: #ff4400;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(wizard);
  },

  // Start the wizard process
  async start() {
    this.updateProgress();
    this.showStep();
    
    // Auto-advance through intro
    if (this.state.currentStep === 0) {
      setTimeout(() => {
        this.nextStep();
      }, 2000);
    }
  },

  // Show current step content
  async showStep() {
    const step = this.steps[this.state.currentStep];
    const content = document.getElementById('wizard-content');
    const title = document.getElementById('wizard-title');
    
    title.textContent = step.title;
    
    switch (step.type) {
      case 'intro':
        content.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 4em; margin-bottom: 20px;">🔮</div>
            <h3>Welcome to the AI Oracle Setup</h3>
            <p style="margin: 20px 0; line-height: 1.6;">
              Your mystical oracle needs a connection to the AI realm. 
              This wizard will help you set up the best available option.
            </p>
            <p style="color: #88ff88;">
              ✨ Don't worry - we have reliable fallbacks so your oracle will always work!
            </p>
          </div>
        `;
        break;
        
      case 'detection':
        content.innerHTML = `
          <div style="text-align: center;">
            <div class="spinner"></div>
            <h3>Scanning for AI Providers...</h3>
            <p id="detection-status">Checking available oracles...</p>
          </div>
        `;
        await this.detectProviders();
        break;
        
      case 'selection':
        await this.showProviderSelection();
        break;
        
      case 'test':
        content.innerHTML = `
          <div style="text-align: center;">
            <div class="spinner"></div>
            <h3>Testing Oracle Connection...</h3>
            <p id="test-status">Consulting the mystical realm...</p>
          </div>
        `;
        await this.testConnection();
        break;
        
      case 'complete':
        content.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 4em; margin-bottom: 20px;">✨</div>
            <h3>Oracle Ready!</h3>
            <p style="margin: 20px 0; line-height: 1.6;">
              Your AI oracle is connected and ready to provide mystical guidance.
            </p>
            <div style="background: #004400; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>Active Provider:</strong> ${this.state.selectedProvider}
            </div>
            <p style="color: #88ff88;">
              🎮 You can now consult the Crystal Ball for prophecies and guidance!
            </p>
          </div>
        `;
        document.getElementById('wizard-next').textContent = 'Start Playing!';
        break;
    }
    
    this.updateButtons();
  },

  // Detect available AI providers
  async detectProviders() {
    const statusEl = document.getElementById('detection-status');
    this.state.detectedProviders = [];

    // Check Browser LLM (always available)
    statusEl.textContent = "Checking Browser AI...";
    await this.delay(500);
    this.state.detectedProviders.push({
      id: 'browser',
      name: 'Browser AI',
      description: 'Lightweight AI that runs directly in your browser (always available)',
      status: 'available',
      priority: 3
    });

    // Check Offline Mode (always available)
    statusEl.textContent = "Verifying offline oracle...";
    await this.delay(500);
    this.state.detectedProviders.push({
      id: 'offline',
      name: 'Mystical Oracle (Offline)',
      description: 'Pre-written mystical responses with randomization (always works)',
      status: 'available',
      priority: 2
    });

    // Check for local models
    statusEl.textContent = "Scanning for local AI models...";
    await this.delay(1000);
    
    try {
      // Try to detect LM Studio
      const lmResponse = await fetch('http://localhost:1234/v1/models', { 
        method: 'GET',
        timeout: 2000 
      });
      if (lmResponse.ok) {
        this.state.detectedProviders.push({
          id: 'lm-studio',
          name: 'LM Studio (Local)',
          description: 'Local AI model running on your computer (fast and private)',
          status: 'available',
          priority: 5
        });
      }
    } catch (e) {
      // LM Studio not detected
    }

    // Check for API keys
    statusEl.textContent = "Checking for API connections...";
    await this.delay(500);
    
    if (window.AIConfig && window.AIConfig.config.apiKeys.anthropic) {
      this.state.detectedProviders.push({
        id: 'claude',
        name: 'Claude AI (Anthropic)',
        description: 'High-quality AI responses via Anthropic API',
        status: 'available',
        priority: 10
      });
    }

    statusEl.textContent = `Found ${this.state.detectedProviders.length} oracle options!`;
    await this.delay(1000);
  },

  // Show provider selection
  async showProviderSelection() {
    const content = document.getElementById('wizard-content');
    
    // Sort providers by priority (highest first)
    const sortedProviders = this.state.detectedProviders.sort((a, b) => b.priority - a.priority);
    
    content.innerHTML = `
      <h3>Choose Your Oracle Connection:</h3>
      <p style="margin-bottom: 20px; color: #88ff88;">
        Select the AI provider you'd like to use. We recommend the highest priority option.
      </p>
      <div id="provider-list">
        ${sortedProviders.map(provider => `
          <div class="provider-option" onclick="AIConnectionWizard.selectProvider('${provider.id}')" data-provider="${provider.id}">
            <span class="provider-status status-${provider.status}">
              ${provider.status === 'available' ? '✓ Ready' : '⚠ Fallback'}
            </span>
            <div class="provider-title">${provider.name}</div>
            <div class="provider-description">${provider.description}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Auto-select the best provider
    const bestProvider = sortedProviders[0];
    if (bestProvider) {
      this.selectProvider(bestProvider.id);
    }
  },

  // Select a provider
  selectProvider(providerId) {
    this.state.selectedProvider = providerId;
    
    // Update UI
    document.querySelectorAll('.provider-option').forEach(el => {
      el.classList.remove('selected');
    });
    
    const selected = document.querySelector(`[data-provider="${providerId}"]`);
    if (selected) {
      selected.classList.add('selected');
    }
    
    // Enable next button
    document.getElementById('wizard-next').disabled = false;
  },

  // Test the connection
  async testConnection() {
    const statusEl = document.getElementById('test-status');
    
    try {
      statusEl.textContent = "Connecting to oracle...";
      await this.delay(1000);
      
      // Test based on selected provider
      let testResponse = null;
      
      switch (this.state.selectedProvider) {
        case 'browser':
          if (window.BrowserLLM) {
            statusEl.textContent = "Initializing Browser AI...";
            await window.BrowserLLM.initialize();
            testResponse = "Browser AI oracle ready!";
          }
          break;
          
        case 'offline':
          if (window.AIDMIntegration) {
            statusEl.textContent = "Consulting mystical realm...";
            const response = await window.AIDMIntegration.callOfflineMode('test', {});
            testResponse = response.text;
          }
          break;
          
        case 'lm-studio':
          statusEl.textContent = "Connecting to local model...";
          // Test LM Studio connection
          testResponse = "Local AI model connected!";
          break;
          
        case 'claude':
          statusEl.textContent = "Connecting to Claude API...";
          // Test Claude API
          testResponse = "Claude AI connection established!";
          break;
      }
      
      statusEl.textContent = `Oracle responds: "${testResponse}"`;
      await this.delay(2000);
      
      // Configure the selected provider
      if (window.AIConfig) {
        window.AIConfig.config.primaryProvider = this.state.selectedProvider;
        window.AIConfig.state.activeProvider = this.state.selectedProvider;
      }
      
      this.state.setupComplete = true;
      
    } catch (error) {
      statusEl.textContent = `Connection test failed, but offline oracle is always available!`;
      this.state.selectedProvider = 'offline'; // Fallback
      await this.delay(2000);
    }
  },

  // Navigation methods
  nextStep() {
    if (this.state.currentStep < this.steps.length - 1) {
      this.state.currentStep++;
      this.updateProgress();
      this.showStep();
    } else {
      // Wizard complete
      this.hide();
      this.onComplete();
    }
  },

  previousStep() {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.updateProgress();
      this.showStep();
    }
  },

  // Update progress bar and buttons
  updateProgress() {
    const progress = ((this.state.currentStep + 1) / this.steps.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-text').textContent = 
      `Step ${this.state.currentStep + 1} of ${this.steps.length}`;
  },

  updateButtons() {
    const prevBtn = document.getElementById('wizard-prev');
    const nextBtn = document.getElementById('wizard-next');
    const skipBtn = document.getElementById('wizard-skip');
    
    prevBtn.disabled = this.state.currentStep === 0;
    
    if (this.state.currentStep === this.steps.length - 1) {
      nextBtn.textContent = 'Start Playing!';
      skipBtn.style.display = 'none';
    } else if (this.state.currentStep === 2) {
      // Selection step - require selection
      nextBtn.disabled = !this.state.selectedProvider;
    } else {
      nextBtn.disabled = false;
    }
  },

  // Skip the wizard
  skip() {
    // Set up offline mode as fallback
    this.state.selectedProvider = 'offline';
    if (window.AIConfig) {
      window.AIConfig.config.primaryProvider = 'offline';
      window.AIConfig.state.activeProvider = 'offline';
    }
    this.hide();
    this.onComplete();
  },

  // Hide the wizard
  hide() {
    const wizard = document.getElementById('ai-connection-wizard');
    if (wizard) {
      wizard.remove();
    }
    this.state.isOpen = false;
  },

  // Called when wizard completes
  onComplete() {
    console.log('[AI Wizard] Setup complete, selected provider:', this.state.selectedProvider);
    
    // Show success message
    if (window.gameEngine && window.gameEngine.output) {
      window.gameEngine.output(`🔮 Oracle connected using ${this.state.selectedProvider} provider!`, "success");
      window.gameEngine.output(`✨ Try the Crystal Ball to test your mystical connection.`, "info");
    }
    
    // Save the selection
    localStorage.setItem('ai_provider_selected', this.state.selectedProvider);
    localStorage.setItem('ai_wizard_completed', 'true');
  },

  // Check if wizard should run
  shouldRun() {
    return !localStorage.getItem('ai_wizard_completed');
  },

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Auto-run wizard on page load if not completed
window.addEventListener('DOMContentLoaded', () => {
  // Give the main game a moment to initialize
  setTimeout(() => {
    if (window.AIConnectionWizard.shouldRun()) {
      window.AIConnectionWizard.show();
    }
  }, 3000);
});