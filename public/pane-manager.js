// ============================================================
// PANE-MANAGER.JS
// Resizable, draggable window management system
//
// PURPOSE:
//   - Create and manage draggable/resizable panes
//   - Each pane has unique ID, title, content container
//   - Support for minimizing, closing, focus management
//   - Terminal-style aesthetic with green borders
//
// PANES:
//   - engine_window: 2D game viewport
//   - cast_console: Terminal input/output
//   - technonomicon_panel: Spells, Skills, Dice tabs
//   - crystal_ball: DM/Oracle interaction
//   - cast_log: Console action log
//   - tech_log: Technonomicon activity log
//   - oracle_log: Crystal Ball response log
// ============================================================

window.PaneManager = {

  // ============================================================
  // [STATE] - Track active panes
  // ============================================================
  panes: {},
  activePane: null,
  zIndex: 1000,
  dragState: null,
  gridSize: 20, // Snap-to-grid size in pixels
  snapEnabled: true, // Enable/disable snap-to-grid
  
  // WINDOW DECK (Tarot Style Stacking)
  deck: {
    container: null,
    panes: [],
    rect: null
  },

  // ============================================================
  // [INIT] - Initialize pane manager
  // ============================================================
  initialize: function() {
    console.log("[PaneManager] Initializing");
    
    // Get or create container
    let container = document.getElementById("windows-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "windows-container";
      document.body.appendChild(container);
    }
    
    // Always apply fullscreen fixed styling with animated background
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      overflow: hidden;
      z-index: 1;
    `;
    
    // Add animated background canvas
    this.addAnimatedBackground(container);
    
    // Add circuit board pattern overlay
    this.addCircuitPattern(container);
    
    this.container = container;
    
    // Initialize the Deck
    this.createDeck();

    console.log("[PaneManager] Ready. Call createPane() to add windows");
  },

  // ============================================================
  // [DECK SYSTEM] - Tarot Card Docking
  // ============================================================
  createDeck: function() {
    const deckInfo = document.createElement("div");
    deckInfo.id = "deck-info";
    deckInfo.innerHTML = "🎴 WINDOW DECK (DROP HERE)";
    deckInfo.style.cssText = `
      color: #004400;
      font-size: 0.8em;
      margin-bottom: 10px;
      pointer-events: none;
      text-align: center; 
      width: 100%;
      letter-spacing: 2px;
    `;

    const deckContainer = document.createElement("div");
    deckContainer.id = "window-deck";
    deckContainer.appendChild(deckInfo);
    
    // Position on right side
    deckContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 300px;
      height: 80vh; /* Takes up most of right side */
      background: rgba(0, 10, 0, 0.3);
      border: 2px dashed #003300;
      border-radius: 12px;
      z-index: 900;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      transition: all 0.3s ease;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
      pointer-events: none; /* Let clicks pass through if empty, but we need drop detection */
    `;
    // Enable pointer events for drop detection calculations (rect)
    // Actually pointer-events auto is fine, dropping is calculated via coordinates
    
    this.container.appendChild(deckContainer);
    this.deck.container = deckContainer;
    
    // Update rect for collision
    this.updateDeckRect();
    window.addEventListener('resize', () => this.updateDeckRect());
  },

  updateDeckRect: function() {
    if (this.deck.container) {
      this.deck.rect = this.deck.container.getBoundingClientRect();
    }
  },

  // ============================================================
  // [CREATE] - Create a new draggable pane
  // ============================================================
  createPane: function(config) {
    const {
      id = "pane_" + Date.now(),
      title = "Window",
      width = 400,
      height = 300,
      x = 50 + Math.random() * 100,
      y = 50 + Math.random() * 100,
      minimizable = true,
      closeable = true,
      content = "<p>Pane content</p>"
    } = config;

    console.log("[PaneManager] Creating pane:", id);

    // Create pane wrapper
    const pane = document.createElement("div");
    pane.id = id;
    pane.className = "pane";
    pane.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #00ff00;
      border-radius: 8px;
      box-shadow: 
        0 0 20px rgba(0, 255, 0, 0.3),
        inset 0 0 20px rgba(0, 255, 0, 0.05);
      display: flex;
      flex-direction: column;
      z-index: ${this.zIndex++};
      user-select: none;
      font-family: 'Courier Prime', monospace;
      backdrop-filter: blur(4px);
    `;

    // Create header
    const header = document.createElement("div");
    header.className = "pane-header";
    header.style.cssText = `
      background: linear-gradient(180deg, #001a00 0%, #000a00 100%);
      border-bottom: 2px solid #00ff00;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      padding: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: grab;
      color: #00ff00;
      font-size: 0.9em;
      font-weight: bold;
      letter-spacing: 1px;
      user-select: none;
      box-shadow: 0 2px 8px rgba(0, 255, 0, 0.2);
    `;

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.textContent = `[ ${title} ]`;
    header.appendChild(titleSpan);

    // Button group
    const buttonGroup = document.createElement("div");
    buttonGroup.style.cssText = "display: flex; gap: 4px;";

    if (minimizable) {
      const minBtn = document.createElement("button");
      minBtn.textContent = "−";
      minBtn.style.cssText = `
        background: transparent;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 0.85em;
        font-family: monospace;
      `;
      minBtn.onclick = (e) => {
        e.stopPropagation();
        this.toggleMinimize(id);
      };
      buttonGroup.appendChild(minBtn);
    }

    if (closeable) {
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.style.cssText = `
        background: transparent;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 0.85em;
        font-family: monospace;
      `;
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.closePane(id);
      };
      buttonGroup.appendChild(closeBtn);
    }

    header.appendChild(buttonGroup);

    // Create content area
    const contentArea = document.createElement("div");
    contentArea.className = "pane-content";
    contentArea.style.cssText = `
      flex: 1;
      overflow: auto;
      padding: 8px;
      color: #00ff00;
      font-size: 0.85em;
      line-height: 1.4;
      resize: both;
    `;
    if (typeof content === "string") {
      contentArea.innerHTML = content;
    } else {
      contentArea.appendChild(content);
    }

    // Create resize handle (bottom-right corner)
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "pane-resize-handle";
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 15px;
      height: 15px;
      background: linear-gradient(135deg, transparent 0%, #00ff00 100%);
      cursor: nwse-resize;
      user-select: none;
    `;

    // Assemble pane
    pane.appendChild(header);
    pane.appendChild(contentArea);
    pane.appendChild(resizeHandle);

    // Add to container
    this.container.appendChild(pane);

    // Store reference
    this.panes[id] = {
      element: pane,
      header: header,
      content: contentArea,
      title: title,
      minimized: false,
      x: x,
      y: y,
      width: width,
      height: height
    };

    // Attach event listeners
    this.attachPaneEvents(id);

    // Focus pane
    this.focusPane(id);

    console.log("[PaneManager] Pane created:", id);
    return pane;
  },

  // ============================================================
  // [EVENTS] - Attach drag and resize listeners
  // ============================================================
  attachPaneEvents: function(id) {
    const pane = this.panes[id];

    // Drag from header
    pane.header.addEventListener("mousedown", (e) => {
      e.preventDefault(); // Prevent text selection/drag weirdness
      if (e.target.closest("button")) return; // Don't drag if clicking buttons

      this.focusPane(id);

      this.dragState = {
        paneId: id,
        startX: e.clientX,
        startY: e.clientY,
        paneStartX: pane.element.offsetLeft,
        paneStartY: pane.element.offsetTop,
        type: "drag"
      };

      pane.header.style.cursor = "grabbing";
    });

    // Resize from handle
    pane.element.querySelector(".pane-resize-handle").addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.focusPane(id);

      this.dragState = {
        paneId: id,
        startX: e.clientX,
        startY: e.clientY,
        paneStartWidth: pane.element.offsetWidth,
        paneStartHeight: pane.element.offsetHeight,
        type: "resize"
      };
    });

    // Focus on click
    pane.element.addEventListener("mousedown", () => {
      this.focusPane(id);
    });
  },

  // ============================================================
  // [DRAG & RESIZE] - Handle mouse movement
  // ============================================================
  updateDrag: function(e) {
    if (!this.dragState) return;

    const state = this.dragState;
    const pane = this.panes[state.paneId];

    // If dragged while docked, undock immediately
    if (pane.isInDeck && state.type === "drag") {
        // Only undock if moved significantly (hysteresis) to prevent accidental clicks
        const moveDist = Math.hypot(e.clientX - state.startX, e.clientY - state.startY);
        if (moveDist > 5) {
            this.undockPane(state.paneId, e.clientX, e.clientY);
            // Update state logic to standard drag now
            state.startX = e.clientX;
            state.startY = e.clientY;
            state.paneStartX = pane.x;
            state.paneStartY = pane.y;
        } else {
            return; // Wait for more movement
        }
    }

    if (state.type === "drag") {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      let newX = state.paneStartX + dx;
      let newY = state.paneStartY + dy;

      // Apply snap-to-grid
      newX = this.snapToGrid(newX);
      newY = this.snapToGrid(newY);

      // Keep windows within viewport
      const maxX = window.innerWidth - pane.element.offsetWidth;
      const maxY = window.innerHeight - pane.element.offsetHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      pane.element.style.left = newX + "px";
      pane.element.style.top = newY + "px";

      pane.x = newX;
      pane.y = newY;

      // Check Deck Collision
      if (this.deck.container && this.deck.rect) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        if (mouseX >= this.deck.rect.left && mouseX <= this.deck.rect.right &&
            mouseY >= this.deck.rect.top && mouseY <= this.deck.rect.bottom) {
            this.deck.container.style.borderColor = "#00ff00"; // Highlight
            this.deck.container.style.boxShadow = "0 0 20px #00ff00";
        } else {
            this.deck.container.style.borderColor = "#003300";
            this.deck.container.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.8)";
        }
      }

    } else if (state.type === "resize") {
      const dw = e.clientX - state.startX;
      const dh = e.clientY - state.startY;

      let newWidth = Math.max(200, state.paneStartWidth + dw);
      let newHeight = Math.max(150, state.paneStartHeight + dh);

      // Apply snap-to-grid for size
      newWidth = this.snapToGrid(newWidth);
      newHeight = this.snapToGrid(newHeight);

      pane.element.style.width = newWidth + "px";
      pane.element.style.height = newHeight + "px";

      pane.width = newWidth;
      pane.height = newHeight;
    }
  },

  endDrag: function() {
    if (this.dragState && this.dragState.type === "drag") {
      const pane = this.panes[this.dragState.paneId];
      pane.header.style.cursor = "grab";
      
      // Check collision and Dock
      if (this.deck.container && !pane.isInDeck && this.deck.rect) {
          const rect = pane.element.getBoundingClientRect();
          const centerX = rect.left + rect.width/2;
          const centerY = rect.top + rect.height/2;
          
          if (centerX >= this.deck.rect.left && centerX <= this.deck.rect.right &&
              centerY >= this.deck.rect.top && centerY <= this.deck.rect.bottom) {
              this.dockPane(this.dragState.paneId);
          }
      }
      
      // Reset Deck Highlight
      if (this.deck.container) {
          this.deck.container.style.borderColor = "#003300";
          this.deck.container.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.8)";
      }
    }
    this.dragState = null;
  },

  dockPane: function(id) {
      const pane = this.panes[id];
      if (!pane) return;
      
      console.log("[PaneManager] Docking pane:", id);
      pane.isInDeck = true;
      pane.savedRect = { width: pane.element.style.width, height: pane.element.style.height };
      
      // Move to deck container
      this.deck.container.appendChild(pane.element);
      
      // Apply Deck Styling (Tarot Card Stack)
      pane.element.style.position = "relative";
      pane.element.style.left = "0";
      pane.element.style.top = "0";
      pane.element.style.width = "100%";
      pane.element.style.height = "auto";
      pane.element.style.marginBottom = "-10px"; // Stack overlap
      pane.element.style.transition = "all 0.3s ease";
      
      // Minimize Content
      pane.element.querySelector(".pane-content").style.display = "none";
      pane.element.querySelector(".pane-resize-handle").style.display = "none";
      
      // Tarot Header Styling
      pane.header.style.background = "linear-gradient(45deg, #2a2a00, #001a00)";
      pane.header.style.border = "1px solid #aa8800"; // Gold border
      pane.element.style.border = "1px solid #aa8800";
      pane.element.style.boxShadow = "0 -5px 10px rgba(0,0,0,0.5)"; // Shadow up for stack effect
      
      // Add click handler to undock from deck
      const undockClickHandler = (e) => {
        // Only undock on direct clicks to the header, not buttons or inputs
        if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select")) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log("[PaneManager] Click undock triggered for:", id);
        
        // Use mouse position for undock placement
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX || rect.left + rect.width / 2;
        const mouseY = e.clientY || rect.top + 20;
        
        this.undockPane(id, mouseX, mouseY);
        
        // Aggressive handler cleanup - remove from EVERYWHERE
        pane.header.removeEventListener("click", undockClickHandler, true);
        pane.header.removeEventListener("click", undockClickHandler, false);
        pane.header.removeEventListener("click", undockClickHandler);
        delete pane.undockClickHandler;
      };
      
      // Add visual feedback for undock capability
      pane.header.style.cursor = "pointer";
      pane.header.title = "Click to undock from deck";
      
      // Add hover effects for better UX
      pane.header.addEventListener('mouseenter', () => {
        pane.header.style.background = "rgba(0, 255, 0, 0.1)";
        pane.header.style.borderColor = "#00ff00";
      });
      
      pane.header.addEventListener('mouseleave', () => {
        pane.header.style.background = "";
        pane.header.style.borderColor = "";
      });
      
      // Use capture phase for better handling and add to header directly
      pane.header.addEventListener("click", undockClickHandler, true);
      
      // Store reference to the handler so we can remove it later
      pane.undockClickHandler = undockClickHandler;
      
      // Also add double-click as alternative undock method
      const doubleClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("[PaneManager] Double-click undock for:", id);
        const rect = e.currentTarget.getBoundingClientRect();
        this.undockPane(id, rect.left + rect.width / 2, rect.top + 20);
      };
      pane.header.addEventListener("dblclick", doubleClickHandler);
      pane.undockDoubleClickHandler = doubleClickHandler;
  },
  
  undockPane: function(id, mouseX, mouseY) {
      const pane = this.panes[id];
      if (!pane) {
        console.warn("[PaneManager] Cannot undock - pane not found:", id);
        return;
      }
      
      console.log("[PaneManager] FORCE Undocking pane:", id, "from deck:", pane.isInDeck);
      
      // Force undock regardless of state
      pane.isInDeck = false;
      
      // Remove ALL deck-related event handlers aggressively
      if (pane.undockClickHandler) {
        pane.header.removeEventListener("click", pane.undockClickHandler, true);
        pane.header.removeEventListener("click", pane.undockClickHandler, false);
        delete pane.undockClickHandler;
      }
      
      if (pane.undockDoubleClickHandler) {
        pane.header.removeEventListener("dblclick", pane.undockDoubleClickHandler);
        delete pane.undockDoubleClickHandler;
      }
      
      // Force removal from deck if present
      if (pane.element.parentNode && pane.element.parentNode.classList.contains('deck-container')) {
        console.log("[PaneManager] Forcing removal from deck container");
      }
      
      // Move back to main container FORCEFULLY
      this.container.appendChild(pane.element);
      
      // Restore Position - center on mouse with bounds checking
      pane.element.style.position = "absolute";
      pane.x = Math.max(0, Math.min(window.innerWidth - 300, mouseX - 150));
      pane.y = Math.max(0, Math.min(window.innerHeight - 200, mouseY - 30));
      pane.element.style.left = pane.x + "px";
      pane.element.style.top = pane.y + "px";
      
      // Restore Size
      pane.element.style.width = pane.savedRect ? pane.savedRect.width : (pane.width + "px");
      pane.element.style.height = pane.savedRect ? pane.savedRect.height : (pane.height + "px");
      pane.element.style.marginBottom = "0";
      
      // Restore Content
      const content = pane.element.querySelector(".pane-content");
      const resizeHandle = pane.element.querySelector(".pane-resize-handle");
      
      if (content) content.style.display = "flex";
      if (resizeHandle) resizeHandle.style.display = "block";
      
      // Restore Style
      pane.header.style.cursor = "grab";
      pane.header.title = "Drag to move";
      pane.header.style.background = "linear-gradient(180deg, #001a00 0%, #000a00 100%)";
      pane.header.style.border = "none"; 
      pane.header.style.borderBottom = "2px solid #00ff00";
      pane.element.style.border = "2px solid #00ff00";
      
      // Visual feedback for successful undock
      pane.element.style.boxShadow = "0 0 30px #00ff00";
      setTimeout(() => {
        pane.element.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.3)";
      }, 800);
      
      // Remove from deck tracking
      const deckIndex = this.deck.panes.indexOf(id);
      if (deckIndex !== -1) {
        this.deck.panes.splice(deckIndex, 1);
      }
      
      // Clear saved rect
      delete pane.savedRect;
      
      console.log("[PaneManager] Pane", id, "successfully undocked");
  },

  // ============================================================
  // [FOCUS] - Bring pane to front
  // ============================================================
  focusPane: function(id) {
    if (this.activePane !== id) {
      this.activePane = id;
      for (const paneId in this.panes) {
        this.panes[paneId].element.style.zIndex = this.zIndex++;
      }
      this.panes[id].element.style.zIndex = this.zIndex++;
    }
  },

  // ============================================================
  // [MINIMIZE] - Toggle minimized state
  // ============================================================
  toggleMinimize: function(id) {
    const pane = this.panes[id];
    pane.minimized = !pane.minimized;

    if (pane.minimized) {
      pane.element.style.height = "auto";
      pane.element.querySelector(".pane-content").style.display = "none";
    } else {
      pane.element.style.height = pane.height + "px";
      pane.element.querySelector(".pane-content").style.display = "flex";
    }
  },

  // ============================================================
  // [CLOSE] - Remove pane
  // ============================================================
  closePane: function(id) {
    if (this.panes[id]) {
      this.panes[id].element.remove();
      delete this.panes[id];
      if (this.activePane === id) {
        this.activePane = null;
      }
      console.log("[PaneManager] Pane closed:", id);
    }
  },

  // ============================================================
  // [GET CONTENT] - Get content div for a pane
  // ============================================================
  getContent: function(id) {
    return this.panes[id] ? this.panes[id].content : null;
  },

  // ============================================================
  // [UPDATE CONTENT] - Update pane content
  // ============================================================
  updateContent: function(id, content) {
    const contentDiv = this.getContent(id);
    if (contentDiv) {
      if (typeof content === "string") {
        contentDiv.innerHTML = content;
      } else {
        contentDiv.innerHTML = "";
        contentDiv.appendChild(content);
      }
    }
  },

  // ============================================================
  // [APPEND] - Append to pane content
  // ============================================================
  appendContent: function(id, content) {
    const contentDiv = this.getContent(id);
    if (contentDiv) {
      if (typeof content === "string") {
        contentDiv.innerHTML += content;
      } else {
        contentDiv.appendChild(content);
      }
      contentDiv.scrollTop = contentDiv.scrollHeight;
    }
  },

  // ============================================================
  // [SNAP TO GRID] - Snap position to grid
  // ============================================================
  snapToGrid: function(value) {
    if (!this.snapEnabled) return value;
    return Math.round(value / this.gridSize) * this.gridSize;
  },

  // ============================================================
  // [CIRCUIT PATTERN] - Add circuit board background
  // ============================================================
  // ============================================================
  // [ANIMATED BACKGROUND] - Subtle flowing grid animation
  // ============================================================
  addAnimatedBackground: function(container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-animation';
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let time = 0;
    const gridSize = this.gridSize;

    const animate = () => {
      time += 0.005;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Flowing grid lines
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.04)';
      ctx.lineWidth = 1;

      // Horizontal lines with wave
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
          const wave = Math.sin((x + time * 50) * 0.01) * 2;
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      // Vertical lines with pulse
      for (let x = 0; x < canvas.width; x += gridSize) {
        const pulse = Math.sin(time + x * 0.01) * 0.02 + 0.04;
        ctx.strokeStyle = `rgba(0, 255, 0, ${pulse})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Occasional data streams
      if (Math.random() < 0.02) {
        const streamX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        for (let y = 0; y < canvas.height; y += 8) {
          if (Math.random() < 0.3) {
            ctx.fillRect(streamX - 1, y, 2, 4);
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  },

  addCircuitPattern: function(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.08;
      pointer-events: none;
      z-index: 1;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 0.5;

    // Draw circuit paths
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 20 + Math.random() * 60;

      // Circuit nodes (circles)
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();

      // Connection lines (horizontal/vertical)
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();

      // Small node dots
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw connecting traces
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Resize handler
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

};

// ============================================================
// [GLOBAL LISTENERS] - Attach to document for drag/resize
// ============================================================

document.addEventListener("mousemove", (e) => {
  if (window.PaneManager && PaneManager.dragState) {
    PaneManager.updateDrag(e);
  }
});

document.addEventListener("mouseup", () => {
  if (window.PaneManager) {
    PaneManager.endDrag();
  }
});

console.log("[pane-manager.js] PaneManager loaded");
console.log("[pane-manager.js] Call: PaneManager.initialize() then PaneManager.createPane(config)");
