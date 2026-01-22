// ============================================================
// GRAPHICS UI - Canvas Rendering Layer
// ============================================================
// Extends GameUI to add visual rendering alongside text
// Reads GameEngine callbacks and draws pixel art sprites

class GraphicsUI extends GameUI {
  constructor(engine, spriteSheetImage) {
    super(engine);
    
    // Canvas setup
    this.canvasContainer = document.getElementById("graphics-container");
    if (!this.canvasContainer) {
      console.warn("[GraphicsUI] graphics-container not found, creating...");
      this.canvasContainer = document.createElement("div");
      this.canvasContainer.id = "graphics-container";
      document.body.insertBefore(this.canvasContainer, document.body.firstChild);
    }
    
    this.canvas = document.createElement("canvas");
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.canvas.style.cssText = "border: 2px solid #2fb43a; background: #0a0e27; display: block; margin: 0 auto;";
    this.canvasContainer.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext("2d");
    this.spriteSheet = spriteSheetImage;
    
    // Game state for rendering
    this.currentZone = "hub";
    this.currentEnemy = null;
    this.playerHP = 50;
    this.enemyHP = 30;
    this.animationQueue = [];
    
    // Hook into engine callbacks to trigger graphics
    const originalOnOutput = this.engine.onOutput;
    this.engine.onOutput = (output) => {
      this.handleEngineOutput(output);    // Text output
      this.parseAndAnimate(output);       // Graphics animation
      if (originalOnOutput) originalOnOutput(output);
    };
    
    // Start render loop
    this.startRenderLoop();
    
    console.log("[GraphicsUI] Canvas graphics layer initialized");
  }
  
  // ============================================================
  // ANIMATION PARSING - Convert text events to graphics
  // ============================================================
  
  parseAndAnimate(output) {
    const text = output.text.toLowerCase();
    
    // Battle animations
    if (text.includes("you attack")) {
      this.queueAnimation("player_attack", 300);
    }
    if (text.includes("deals")) {
      this.queueAnimation("hit_flash", 200);
    }
    if (text.includes("enemy attacks")) {
      this.queueAnimation("enemy_attack", 300);
    }
    if (text.includes("cast")) {
      this.queueAnimation("spell_cast", 400);
    }
    if (text.includes("defeated")) {
      this.queueAnimation("enemy_death", 600);
    }
    
    // Movement
    if (text.includes("you go")) {
      this.queueAnimation("zone_transition", 500);
    }
  }
  
  queueAnimation(name, duration) {
    this.animationQueue.push({
      name: name,
      startTime: Date.now(),
      duration: duration,
      progress: 0,
    });
  }
  
  updateAnimations() {
    const now = Date.now();
    
    // Update animation progress
    for (let i = this.animationQueue.length - 1; i >= 0; i--) {
      const anim = this.animationQueue[i];
      anim.progress = Math.min(1, (now - anim.startTime) / anim.duration);
      
      if (anim.progress >= 1) {
        this.animationQueue.splice(i, 1);
      }
    }
  }
  
  // ============================================================
  // RENDERING CORE
  // ============================================================
  
  startRenderLoop() {
    const render = () => {
      this.update();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
  
  update() {
    this.updateAnimations();
    
    // Update from engine state
    if (this.engine.gameState) {
      const state = this.engine.gameState;
      this.playerHP = state.hp || 50;
      this.currentZone = state.zone || "hub";
    }
  }
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#0a0e27";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw based on game state
    if (this.engine.gameState && this.engine.gameState.inBattle) {
      this.drawBattle();
    } else {
      this.drawZone();
    }
    
    // Draw UI overlay
    this.drawUI();
    
    // Draw active animations on top
    this.drawAnimations();
  }
  
  // ============================================================
  // ZONE RENDERING
  // ============================================================
  
  drawZone() {
    // Draw zone-specific background image if available
    let zoneKey = this.currentZone;
    if (typeof zoneKey === 'object' && zoneKey.id) zoneKey = zoneKey.id;
    if (window.AssetLibrary && AssetLibrary.backgrounds[zoneKey]) {
      if (!this._bgImages) this._bgImages = {};
      if (!this._bgImages[zoneKey]) {
        // Pick a random background for this zone
        const bgList = AssetLibrary.backgrounds[zoneKey];
        const bgSrc = bgList[Math.floor(Math.random() * bgList.length)];
        const img = new window.Image();
        img.src = bgSrc;
        this._bgImages[zoneKey] = img;
      }
      const bgImg = this._bgImages[zoneKey];
      if (bgImg && bgImg.complete) {
        this.ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
      } else {
        // fallback color while loading
        this.ctx.fillStyle = "#1a2740";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    } else {
      // fallback color if no background
      this.ctx.fillStyle = "#1a2740";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Zone title
    this.ctx.fillStyle = "#2fb43a";
    this.ctx.font = "bold 24px 'Courier New'";
    this.ctx.textAlign = "center";
    this.ctx.fillText((this.engine.getCurrentZone && this.engine.getCurrentZone().name) || this.currentZone.toUpperCase(), this.canvas.width / 2, 40);

    // Player sprite in center
    if (this.spriteSheet) {
      const coords = getEntitySprite("player");
      if (coords) {
        this.drawSprite("player", this.canvas.width / 2 - 16, this.canvas.height / 2 - 16, coords);
      }
    }

    // Description text (from engine state)
    this.ctx.fillStyle = "#2fb43a";
    this.ctx.font = "14px 'Courier New'";
    this.ctx.textAlign = "center";
    if (this.engine.gameState && this.engine.gameState.zoneDescription) {
      const text = this.engine.gameState.zoneDescription;
      this.drawWrappedText(text, this.canvas.width / 2, this.canvas.height / 2 + 80, 300, 16);
    }
  }
  
  // ============================================================
  // BATTLE RENDERING
  // ============================================================
  
  drawBattle() {
    // Battle background
    this.ctx.fillStyle = "#2a3a50";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Enemy side (right)
    this.ctx.fillStyle = "#1a2a40";
    this.ctx.fillRect(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height);
    
    // Draw player (left)
    if (this.spriteSheet) {
      const playerCoords = getEntitySprite("player");
      if (playerCoords) {
        this.drawSprite("player", 80, 200, playerCoords);
      }
    }
    
    // Draw enemy (right)
    if (this.spriteSheet && this.engine.gameState.currentEnemy) {
      const enemyName = this.engine.gameState.currentEnemy;
      const enemyCoords = getEntitySprite(enemyName);
      if (enemyCoords) {
        this.drawSprite(enemyName, 480, 200, enemyCoords);
      }
    }
    
    // Battle UI: HP bars
    this.drawHPBars();
  }
  
  drawHPBars() {
    const barWidth = 120;
    const barHeight = 16;
    
    // Player HP (top left)
    this.ctx.fillStyle = "#2fb43a";
    this.ctx.font = "12px 'Courier New'";
    this.ctx.fillText("HP:", 20, 30);
    
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(50, 20, barWidth, barHeight);
    
    const hpPercent = this.playerHP / 50;
    this.ctx.fillStyle = "#ff3333";
    this.ctx.fillRect(50, 20, barWidth * hpPercent, barHeight);
    
    this.ctx.strokeStyle = "#2fb43a";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(50, 20, barWidth, barHeight);
    
    // Enemy HP (top right)
    const enemyHP = this.engine.gameState?.currentEnemyHP || 30;
    const enemyMaxHP = this.engine.gameState?.currentEnemyMaxHP || 30;
    
    this.ctx.fillStyle = "#2fb43a";
    this.ctx.fillText("ENEMY HP:", this.canvas.width - 180, 30);
    
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(this.canvas.width - 120, 20, barWidth, barHeight);
    
    const enemyPercent = enemyHP / enemyMaxHP;
    this.ctx.fillStyle = "#ff3333";
    this.ctx.fillRect(this.canvas.width - 120, 20, barWidth * enemyPercent, barHeight);
    
    this.ctx.strokeStyle = "#2fb43a";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.canvas.width - 120, 20, barWidth, barHeight);
  }
  
  // ============================================================
  // SPRITE RENDERING
  // ============================================================
  
  drawSprite(name, x, y, coords) {
    if (!this.spriteSheet || !coords) return;
    
    try {
      this.ctx.drawImage(
        this.spriteSheet,
        coords.x, coords.y,           // Source position
        coords.w, coords.h,           // Source size
        x, y,                         // Destination position
        coords.w * 2, coords.h * 2    // Destination size (2x scale)
      );
    } catch (e) {
      console.warn(`Failed to draw sprite: ${name}`, e);
    }
  }
  
  // ============================================================
  // ANIMATION EFFECTS
  // ============================================================
  
  drawAnimations() {
    for (let anim of this.animationQueue) {
      const progress = anim.progress;
      
      if (anim.name === "player_attack") {
        this.drawAttackAnimation(progress, false);
      } else if (anim.name === "enemy_attack") {
        this.drawAttackAnimation(progress, true);
      } else if (anim.name === "spell_cast") {
        this.drawSpellAnimation(progress);
      } else if (anim.name === "hit_flash") {
        this.drawHitFlash(progress);
      } else if (anim.name === "enemy_death") {
        this.drawDeathAnimation(progress);
      }
    }
  }
  
  drawAttackAnimation(progress, isEnemy) {
    // Slash effect
    const startX = isEnemy ? this.canvas.width - 100 : 100;
    const endX = isEnemy ? 400 : 250;
    
    const x = startX + (endX - startX) * progress;
    const alpha = 1 - progress;
    
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = "#ff6633";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 20, 150);
    this.ctx.lineTo(x + 20, 250);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }
  
  drawSpellAnimation(progress) {
    // Purple spell arc
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = 100 * progress;
    
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.fillStyle = "#9966ff";
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }
  
  drawHitFlash(progress) {
    // Red flash overlay
    const alpha = (1 - progress) * 0.5;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
  }
  
  drawDeathAnimation(progress) {
    // Enemy dissolves/fades
    this.ctx.globalAlpha = 1 - progress;
    if (this.spriteSheet && this.engine.gameState.currentEnemy) {
      const coords = getEntitySprite(this.engine.gameState.currentEnemy);
      if (coords) {
        this.drawSprite(this.engine.gameState.currentEnemy, 480, 200, coords);
      }
    }
    this.ctx.globalAlpha = 1;
  }
  
  // ============================================================
  // UI DRAWING
  // ============================================================
  
  drawUI() {
    // Placeholder for UI elements (menus, buttons, etc.)
  }
  
  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  
  drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lineNum = 0;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        this.ctx.fillText(line, x, y + lineNum * lineHeight);
        line = words[i] + " ";
        lineNum++;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, y + lineNum * lineHeight);
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

console.log("[GraphicsUI.js] Graphics layer loaded");
