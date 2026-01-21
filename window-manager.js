// ============================================================
// WINDOW-MANAGER.JS
// MULTI-WINDOW DESKTOP ENVIRONMENT
//
// PURPOSE:
//   - Draggable, resizable windows (tablet-style)
//   - Multiple window types (console, panel, terminal, 2d-render)
//   - Z-index management (bring to front)
//   - Window state persistence
//   - CRT styling for terminals
//   - Dashboard layout: CastConsole top, Technonomicon bottom
//
// ARCHITECTURE:
//   WindowManager
//   ├─ createWindow(config) → Window object
//   ├─ registerPanel(name, config) → Panel system
//   ├─ makeWindowDraggable(element)
//   ├─ makeWindowResizable(element)
//   ├─ bringToFront(windowId)
//   ├─ toggleWindow(windowId)
//   └─ saveWindowStates()
//
// WINDOW TYPES:
//   - "console" (CastConsole at top)
//   - "panel" (Inventory, HoloDice, etc - movable)
//   - "terminal" (CRT-style for Ancient Terminals)
//   - "render-2d" (2D engine canvas)
//   - "technonomicon" (Spell library at bottom)
// ============================================================

window.WindowManager = {

  // ============================================================
  // [STATE] - Global window registry
  // ============================================================
  
  state: {
    windows: {},           // windowId → window object
    zIndex: 1000,          // Current z-index counter
    activeWindow: null,    // Currently focused window
    panels: {},            // Panel definitions
    savedStates: {}        // Window position/size state
  },

  // ============================================================
  // [CONFIG] - Window defaults and templates
  // ============================================================
  
  templates: {
    console: {
      width: "100%",
      height: "22%",
      top: "0",
      left: "0",
      title: "[ CASTCONSOLE ]",
      draggable: false,  // Fixed at top
      resizable: false,
      crt: false,
      zoned: "top"
    },
    
    technonomicon: {
      width: "100%",
      height: "18%",
      bottom: "0",
      left: "0",
      title: "[ TECHNONOMICON ]",
      draggable: false,  // Fixed at bottom
      resizable: false,
      crt: false,
      zoned: "bottom"
    },
    
    inventory: {
      width: "24%",
      height: "35%",
      top: "25%",
      left: "2%",
      title: "[ INVENTORY ]",
      draggable: true,
      resizable: true,
      crt: false,
      content: "inventory"
    },
    
    holoDice: {
      width: "24%",
      height: "35%",
      top: "25%",
      right: "2%",
      left: "auto",
      title: "[ HOLODICE ]",
      draggable: true,
      resizable: true,
      crt: false,
      content: "holoDice"
    },
    
    terminal: {
      width: "60%",
      height: "50%",
      top: "25%",
      left: "25%",
      title: "[ ANCIENT TERMINAL ]",
      draggable: true,
      resizable: true,
      crt: true,  // CRT styling
      modal: true  // Blocks interaction with other windows
    },
    
    render2d: {
      width: "50%",
      height: "50%",
      top: "25%",
      left: "25%",
      title: "[ 2D ENGINE ]",
      draggable: true,
      resizable: true,
      crt: false,
      content: "canvas"
    }
  },

  // ============================================================
  // [CORE] - Window creation and management
  // ============================================================
  
  /**
   * Create a new window
   */
  createWindow: function(config) {
    const windowId = config.id || `window-${Date.now()}`;
    const template = this.templates[config.type] || {};
    const merged = { ...template, ...config };
    
    // Create DOM element
    const windowEl = document.createElement("div");
    windowEl.id = windowId;
    windowEl.className = `window window-${merged.type}`;
    if (merged.crt) windowEl.classList.add("window-crt");
    if (merged.modal) windowEl.classList.add("window-modal");
    
    // Window styles
    windowEl.style.cssText = `
      position: fixed;
      width: ${merged.width};
      height: ${merged.height};
      top: ${merged.top || "auto"};
      left: ${merged.left || "auto"};
      right: ${merged.right || "auto"};
      bottom: ${merged.bottom || "auto"};
      background: #1a1a1a;
      border: 2px solid ${merged.crt ? "#00ff00" : "#a8a882"};
      border-radius: ${merged.crt ? "0" : "4px"};
      display: flex;
      flex-direction: column;
      z-index: ${this.state.zIndex++};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
      font-family: 'Courier Prime', monospace;
      color: ${merged.crt ? "#0f0" : "#a8a882"};
      overflow: hidden;
    `;
    
    // Create title bar
    const titleBar = document.createElement("div");
    titleBar.className = "window-title-bar";
    titleBar.textContent = merged.title;
    titleBar.style.cssText = `
      background: ${merged.crt ? "#001a00" : "#2d2d1f"};
      color: ${merged.crt ? "#0f0" : "#2fb43a"};
      padding: 8px;
      border-bottom: 1px solid ${merged.crt ? "#0f0" : "#a8a882"};
      font-weight: bold;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
    `;
    
    // Create close button
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
      cursor: pointer;
      margin-left: 10px;
      color: ${merged.crt ? "#0f0" : "#2fb43a"};
      font-weight: bold;
    `;
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeWindow(windowId);
    };
    
    if (merged.draggable && merged.zoned !== "top" && merged.zoned !== "bottom") {
      titleBar.appendChild(closeBtn);
    }
    
    windowEl.appendChild(titleBar);
    
    // Create content area
    const contentArea = document.createElement("div");
    contentArea.className = "window-content";
    contentArea.style.cssText = `
      flex: 1;
      overflow: auto;
      padding: 12px;
      background: ${merged.crt ? "#000" : "#1a1a1a"};
    `;
    
    if (merged.content === "canvas") {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "width: 100%; height: 100%; display: block;";
      contentArea.appendChild(canvas);
      merged.canvas = canvas;
    }
    
    windowEl.appendChild(contentArea);
    
    // Append to DOM
    document.body.appendChild(windowEl);
    
    // Make draggable/resizable if configured
    if (merged.draggable) {
      this.makeWindowDraggable(windowEl, titleBar);
    }
    if (merged.resizable) {
      this.makeWindowResizable(windowEl);
    }
    
    // Register window
    const windowObj = {
      id: windowId,
      element: windowEl,
      contentArea: contentArea,
      config: merged,
      isVisible: true,
      zIndex: this.state.zIndex - 1
    };
    
    this.state.windows[windowId] = windowObj;
    
    // Click to bring to front
    windowEl.addEventListener("mousedown", () => this.bringToFront(windowId));
    
    console.log(`[WindowManager] Created window: ${windowId}`);
    return windowObj;
  },

  /**
   * Make window draggable
   */
  makeWindowDraggable: function(windowEl, titleBar) {
    const handle = titleBar || windowEl;
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    handle.addEventListener("mousedown", (e) => {
      if (e.target.textContent === "✕") return; // Don't drag on close button
      
      isDragging = true;
      initialX = e.clientX - windowEl.offsetLeft;
      initialY = e.clientY - windowEl.offsetTop;
      
      handle.style.cursor = "grabbing";
    });
    
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      windowEl.style.left = currentX + "px";
      windowEl.style.top = currentY + "px";
      windowEl.style.right = "auto";
      windowEl.style.bottom = "auto";
    });
    
    document.addEventListener("mouseup", () => {
      isDragging = false;
      handle.style.cursor = "grab";
    });
    
    handle.style.cursor = "grab";
  },

  /**
   * Make window resizable with corner handles
   */
  makeWindowResizable: function(windowEl) {
    const minWidth = 200;
    const minHeight = 150;
    
    // Create resize handle (bottom-right corner)
    const resizeHandle = document.createElement("div");
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      cursor: se-resize;
      background: repeating-linear-gradient(
        45deg,
        #a8a882,
        #a8a882 2px,
        transparent 2px,
        transparent 4px
      );
    `;
    windowEl.appendChild(resizeHandle);
    
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = windowEl.offsetWidth;
      startHeight = windowEl.offsetHeight;
      e.preventDefault();
    });
    
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(minWidth, startWidth + (e.clientX - startX));
      const newHeight = Math.max(minHeight, startHeight + (e.clientY - startY));
      
      windowEl.style.width = newWidth + "px";
      windowEl.style.height = newHeight + "px";
    });
    
    document.addEventListener("mouseup", () => {
      isResizing = false;
    });
  },

  /**
   * Bring window to front (update z-index)
   */
  bringToFront: function(windowId) {
    const windowObj = this.state.windows[windowId];
    if (!windowObj) return;
    
    windowObj.element.style.zIndex = ++this.state.zIndex;
    windowObj.zIndex = this.state.zIndex;
    this.state.activeWindow = windowId;
  },

  /**
   * Close window
   */
  closeWindow: function(windowId) {
    const windowObj = this.state.windows[windowId];
    if (windowObj) {
      windowObj.element.remove();
      delete this.state.windows[windowId];
      console.log(`[WindowManager] Closed window: ${windowId}`);
    }
  },

  /**
   * Toggle window visibility
   */
  toggleWindow: function(windowId) {
    const windowObj = this.state.windows[windowId];
    if (windowObj) {
      windowObj.isVisible = !windowObj.isVisible;
      windowObj.element.style.display = windowObj.isVisible ? "flex" : "none";
    }
  },

  /**
   * Get window content area
   */
  getContentArea: function(windowId) {
    const windowObj = this.state.windows[windowId];
    return windowObj ? windowObj.contentArea : null;
  },

  /**
   * Get all windows
   */
  getAllWindows: function() {
    return this.state.windows;
  },

  /**
   * Save window states to localStorage
   */
  saveWindowStates: function() {
    const states = {};
    for (const [id, window] of Object.entries(this.state.windows)) {
      states[id] = {
        top: window.element.style.top,
        left: window.element.style.left,
        width: window.element.style.width,
        height: window.element.style.height,
        visible: window.isVisible
      };
    }
    try {
      localStorage.setItem("windowStates", JSON.stringify(states));
    } catch (e) {
      console.warn("[WindowManager] Failed to save window states:", e);
    }
  },

  /**
   * Restore window states from localStorage
   */
  restoreWindowStates: function() {
    try {
      const states = JSON.parse(localStorage.getItem("windowStates"));
      if (!states) return;
      
      for (const [id, state] of Object.entries(states)) {
        const windowObj = this.state.windows[id];
        if (windowObj) {
          windowObj.element.style.top = state.top;
          windowObj.element.style.left = state.left;
          windowObj.element.style.width = state.width;
          windowObj.element.style.height = state.height;
          if (!state.visible) this.toggleWindow(id);
        }
      }
    } catch (e) {
      console.warn("[WindowManager] Failed to restore window states:", e);
    }
  },

  // ============================================================
  // [UTILITIES] - Panel registration and shortcuts
  // ============================================================
  
  /**
   * Register a named panel for easy access
   */
  registerPanel: function(name, config) {
    const id = `panel-${name}`;
    config.id = id;
    config.type = config.type || "panel";
    
    const window = this.createWindow(config);
    this.state.panels[name] = window;
    
    return window;
  },

  /**
   * Get panel by name
   */
  getPanel: function(name) {
    return this.state.panels[name];
  },

  /**
   * Show/hide panel by name
   */
  togglePanel: function(name) {
    const panel = this.state.panels[name];
    if (panel) {
      this.toggleWindow(panel.id);
    }
  }

};

// ============================================================
// [INIT] - System loaded
// ============================================================
console.log("[window-manager.js] WindowManager initialized");
console.log("[window-manager.js] Call: WindowManager.createWindow(config)");
console.log("[window-manager.js] Window types: console, panel, terminal, render-2d, technonomicon");
