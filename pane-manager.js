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
      container.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
        border: 2px solid #00ff00;
        overflow: hidden;
      `;
      document.body.appendChild(container);
    }
    
    this.container = container;
    console.log("[PaneManager] Ready. Call createPane() to add windows");
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
      background: #0a0a0a;
      border: 2px solid #00ff00;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
      display: flex;
      flex-direction: column;
      z-index: ${this.zIndex++};
      user-select: none;
      font-family: 'Courier Prime', monospace;
    `;

    // Create header
    const header = document.createElement("div");
    header.className = "pane-header";
    header.style.cssText = `
      background: #000;
      border-bottom: 1px solid #00ff00;
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

    if (state.type === "drag") {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      pane.element.style.left = (state.paneStartX + dx) + "px";
      pane.element.style.top = (state.paneStartY + dy) + "px";

      pane.x = state.paneStartX + dx;
      pane.y = state.paneStartY + dy;
    } else if (state.type === "resize") {
      const dw = e.clientX - state.startX;
      const dh = e.clientY - state.startY;

      const newWidth = Math.max(200, state.paneStartWidth + dw);
      const newHeight = Math.max(150, state.paneStartHeight + dh);

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
    }
    this.dragState = null;
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
