// ============================================================
// ARCANE-BACKGROUND.JS
// Animated background with fractals, particles, and lighting
//
// PURPOSE:
//   - Render mystical fractal patterns
//   - Particle effects (arcane sparkles, auras, orbs)
//   - Dynamic lighting and glow effects
//   - Smooth animation loop
//   - Creates immersive arcane atmosphere
// ============================================================

window.ArcaneBackground = {

  // ============================================================
  // [STATE]
  // ============================================================
  canvas: null,
  ctx: null,
  animationId: null,
  time: 0,
  particles: [],
  lights: [],
  running: false,

  // ============================================================
  // [INIT]
  // ============================================================
  initialize: function(canvas) {
    console.log("[ArcaneBackground] Initializing mystical renderer");
    
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    
    // Set canvas size to fill container
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    
    // Initialize particles and lights
    this.createParticles();
    this.createLights();
    
    // Start animation
    this.animate();
    this.running = true;
    
    console.log("[ArcaneBackground] Arcane renderer active");
  },

  // ============================================================
  // [RESIZE]
  // ============================================================
  resizeCanvas: function() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  },

  // ============================================================
  // [PARTICLES] - Create arcane sparkles and effects
  // ============================================================
  createParticles: function() {
    this.particles = [];
    
    // Create initial particles
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        life: Math.random() * 200 + 100,
        maxLife: Math.random() * 200 + 100,
        color: ["#00ff00", "#00ffaa", "#88ff00", "#00ff88", "#aa77ff"][
          Math.floor(Math.random() * 5)
        ]
      });
    }
  },

  // ============================================================
  // [LIGHTS] - Create light sources
  // ============================================================
  createLights: function() {
    this.lights = [
      {
        x: this.canvas.width * 0.25,
        y: this.canvas.height * 0.25,
        radius: 150,
        intensity: 0.4,
        color: "#00ff00"
      },
      {
        x: this.canvas.width * 0.75,
        y: this.canvas.height * 0.75,
        radius: 150,
        intensity: 0.3,
        color: "#aa77ff"
      },
      {
        x: this.canvas.width * 0.5,
        y: this.canvas.height * 0.5,
        radius: 200,
        intensity: 0.2,
        color: "#00ffaa"
      }
    ];
  },

  // ============================================================
  // [ANIMATE] - Main animation loop
  // ============================================================
  animate: function() {
    if (!this.running) return;

    this.time++;
    
    // Clear with fade (creates motion blur effect)
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw fractal background
    this.drawFractal();

    // Update and draw particles
    this.updateParticles();

    // Draw lights and glow
    this.drawLights();

    // Draw animated circuitry
    this.drawCircuitry();

    this.animationId = requestAnimationFrame(() => this.animate());
  },

  // ============================================================
  // [FRACTAL] - Render animated fractal patterns
  // ============================================================
  drawFractal: function() {
    const imageData = this.ctx.createImageData(
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    const scale = 1 + Math.sin(this.time * 0.01) * 0.3;
    const offsetX = Math.sin(this.time * 0.005) * 100;
    const offsetY = Math.cos(this.time * 0.005) * 100;

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = (pixelIndex % this.canvas.width) - this.canvas.width / 2;
      const y = Math.floor(pixelIndex / this.canvas.width) - this.canvas.height / 2;

      // Mandelbrot-like fractal
      const px = (x + offsetX) / (150 * scale);
      const py = (y + offsetY) / (150 * scale);

      let zx = 0;
      let zy = 0;
      let iter = 0;

      for (let j = 0; j < 32; j++) {
        const zx2 = zx * zx;
        const zy2 = zy * zy;

        if (zx2 + zy2 > 4) break;

        const xtemp = zx2 - zy2 + px;
        zy = 2 * zx * zy + py;
        zx = xtemp;
        iter++;
      }

      // Color based on iteration
      const hue = (iter + this.time * 0.1) % 360;
      const saturation = 50 + iter * 5;
      const lightness = Math.max(5, 30 - iter * 2);

      const color = this.hslToRgb(
        hue / 360,
        saturation / 100,
        lightness / 100
      );

      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = iter > 0 ? 10 : 0; // Very subtle
    }

    this.ctx.putImageData(imageData, 0, 0);
  },

  // ============================================================
  // [PARTICLES] - Update and draw particles
  // ============================================================
  updateParticles: function() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Decay
      p.life--;
      p.opacity = (p.life / p.maxLife) * 0.7;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw particle with glow
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;

      // Glow
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = p.color;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();

      // Remove dead particles and create new ones occasionally
      if (p.life <= 0) {
        this.particles.splice(i, 1);

        if (Math.random() < 0.3) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 3 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            life: Math.random() * 200 + 100,
            maxLife: Math.random() * 200 + 100,
            color: ["#00ff00", "#00ffaa", "#88ff00", "#00ff88", "#aa77ff"][
              Math.floor(Math.random() * 5)
            ]
          });
        }
      }
    }
  },

  // ============================================================
  // [LIGHTS] - Draw dynamic light sources
  // ============================================================
  drawLights: function() {
    // Move lights slightly
    this.lights.forEach((light, i) => {
      light.x += Math.sin((this.time + i * 60) * 0.005) * 0.5;
      light.y += Math.cos((this.time + i * 60) * 0.005) * 0.5;

      // Pulsing radius
      const pulseRadius =
        light.radius * (1 + Math.sin(this.time * 0.01 + i) * 0.2);

      // Draw light glow
      const gradient = this.ctx.createRadialGradient(
        light.x,
        light.y,
        0,
        light.x,
        light.y,
        pulseRadius
      );

      gradient.addColorStop(0, `${light.color}44`);
      gradient.addColorStop(0.5, `${light.color}22`);
      gradient.addColorStop(1, `${light.color}00`);

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Bright core
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;
      this.ctx.fillStyle = light.color;
      this.ctx.beginPath();
      this.ctx.arc(light.x, light.y, pulseRadius * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  },

  // ============================================================
  // [CIRCUITRY] - Draw animated circuit patterns
  // ============================================================
  drawCircuitry: function() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;
    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = 1;

    // Draw grid-like circuit paths
    for (let i = 0; i < 5; i++) {
      const offset = (this.time * 0.5 + i * 50) % 200;

      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.canvas.height / 5 * i + offset);
      this.ctx.lineTo(this.canvas.width, this.canvas.height / 5 * i + offset);
      this.ctx.stroke();

      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width / 5 * i + offset, 0);
      this.ctx.lineTo(
        this.canvas.width / 5 * i + offset,
        this.canvas.height
      );
      this.ctx.stroke();
    }

    this.ctx.restore();
  },

  // ============================================================
  // [UTILITY] - HSL to RGB conversion
  // ============================================================
  hslToRgb: function(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  },

  // ============================================================
  // [STOP]
  // ============================================================
  stop: function() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    console.log("[ArcaneBackground] Renderer stopped");
  }

};

console.log("[arcane-background.js] ArcaneBackground loaded");
console.log("[arcane-background.js] Call: ArcaneBackground.initialize(canvas)");
