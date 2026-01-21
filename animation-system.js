// ============================================================
// ANIMATION SYSTEM - Enhanced graphics effects
// ============================================================

class AnimationSystem {
  constructor() {
    this.particles = [];
    this.effects = [];
  }
  
  // ============================================================
  // PARTICLE EFFECTS
  // ============================================================
  
  createParticles(x, y, type = "spark", count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3 + 1;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        lifetime: 1000 + Math.random() * 500,
        age: 0,
        type: type,
      });
    }
  }
  
  createExplosion(x, y) {
    this.createParticles(x, y, "explosion", 15);
  }
  
  createSpellEffect(x, y, color = "#ff00ff") {
    // Create expanding circle
    this.effects.push({
      type: "expanding_circle",
      x: x,
      y: y,
      startRadius: 5,
      endRadius: 60,
      color: color,
      lifetime: 400,
      age: 0,
    });
  }
  
  createSlash(startX, startY, endX, endY, color = "#ff6633") {
    this.effects.push({
      type: "slash",
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      color: color,
      lifetime: 300,
      age: 0,
      width: 4,
    });
  }
  
  // ============================================================
  // UPDATE
  // ============================================================
  
  update(deltaTime) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += deltaTime;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      
      if (p.age > p.lifetime) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.age += deltaTime;
      
      if (e.age > e.lifetime) {
        this.effects.splice(i, 1);
      }
    }
  }
  
  // ============================================================
  // RENDERING
  // ============================================================
  
  render(ctx) {
    // Render particles
    for (let p of this.particles) {
      const alpha = 1 - (p.age / p.lifetime);
      ctx.globalAlpha = alpha;
      
      if (p.type === "spark") {
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(p.x, p.y, 3, 3);
      } else if (p.type === "explosion") {
        ctx.fillStyle = "#ff6633";
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    }
    
    // Render effects
    for (let e of this.effects) {
      const alpha = 1 - (e.age / e.lifetime);
      ctx.globalAlpha = alpha;
      
      if (e.type === "expanding_circle") {
        const progress = e.age / e.lifetime;
        const radius = e.startRadius + (e.endRadius - e.startRadius) * progress;
        
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.type === "slash") {
        const progress = e.age / e.lifetime;
        
        ctx.strokeStyle = e.color;
        ctx.lineWidth = e.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(e.startX, e.startY);
        ctx.lineTo(
          e.startX + (e.endX - e.startX) * progress,
          e.startY + (e.endY - e.startY) * progress
        );
        ctx.stroke();
      }
    }
    
    ctx.globalAlpha = 1;
  }
  
  clear() {
    this.particles = [];
    this.effects = [];
  }
}

console.log("[animation-system.js] Animation system loaded");
