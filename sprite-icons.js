// ============================================================
// SPRITE ICONS SYSTEM
// Replaces Unicode emojis with custom pixel art sprites
//
// USAGE:
//   1. Create sprite-icons.png (32x32 grid, 8 columns)
//   2. Include sprite-icons.css
//   3. Call SpriteIcons.initialize() after DOM ready
//   4. Use SpriteIcons.replace(element) for dynamic content
//
// The system automatically replaces emojis in:
//   - Initial page load
//   - Dynamically added content (via MutationObserver)
//   - Manual calls to SpriteIcons.replace()
// ============================================================

window.SpriteIcons = {
  
  // Configuration
  config: {
    enabled: true,
    spriteSheet: 'ASSETS/custom/sprite-icons.png',
    iconSize: 32,
    defaultSize: 'sm',  // sm, md, lg
    observeDOM: true,   // Auto-replace in new content
    debugMode: false,   // Shows background positions for debugging
  },

  // Emoji to icon class mapping
  // Format: 'emoji': 'icon-class'
  mapping: {
    // UI Controls
    '✕': 'close',
    '×': 'close',
    '⬈': 'popout',
    '⬋': 'popin',
    '🔊': 'sound-on',
    '🔇': 'sound-off',
    '🎤': 'mic',
    
    // Headers/Decorative
    '⬢': 'hex',
    '✦': 'star4',
    
    // Game Mechanics
    '🎲': 'dice',
    '⚔': 'combat',
    '⚔️': 'combat',
    '✨': 'sparkle',
    '🌟': 'star',
    '🔮': 'crystal',
    
    // Terminal Prompts
    '⚙': 'gear',
    '⚙️': 'gear',
    '▲': 'forest',
    '☠': 'skull',
    '☠️': 'skull',
    
    // Status Indicators
    '✓': 'check',
    '✔': 'check',
    '✔️': 'check',
    '✗': 'cross',
    '✘': 'cross',
    '⚠': 'warning',
    '⚠️': 'warning',
    '▶': 'play',
    '➤': 'pointer',
    '○': 'circle',
    '►': 'quest',
    
    // Inventory
    '⚗': 'potion',
    '⚗️': 'potion',
    '⚡': 'lightning',
    '⚡️': 'lightning',
    '💾': 'save',
    '🔓': 'unlock',
    '🔒': 'lock',
    '📖': 'book',
    
    // Shapes
    '◊': 'diamond',
    '◆': 'diamond-f',
    '□': 'square',
    '◉': 'dot',
    '•': 'bullet',
    
    // Arrows
    '←': 'left',
    '→': 'right',
    '↑': 'up',
    '↓': 'down',
    
    // Misc
    '⏳': 'hourglass',
    '✅': 'success',
    '❌': 'fail',
    '🧪': 'test',
    '📜': 'scroll',
    '🎮': 'gamepad',
    
    // Box drawing (optional - often keep as text)
    // '╔': 'box-tl',
    // '╗': 'box-tr',
    // '╚': 'box-bl',
    // '╝': 'box-br',
    // '═': 'box-h',
    // '║': 'box-v',
    // '█': 'block',
    // '░': 'shade',
  },

  // State
  state: {
    initialized: false,
    observer: null,
    spriteLoaded: false,
  },

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initialize the sprite icon system
   */
  initialize: function() {
    if (this.state.initialized) return;

    // Preload sprite sheet
    this.preloadSprite();

    // Replace existing emojis
    this.replaceAll();

    // Setup DOM observer for dynamic content
    if (this.config.observeDOM) {
      this.setupObserver();
    }

    this.state.initialized = true;
    console.log('[SpriteIcons] Initialized with', Object.keys(this.mapping).length, 'emoji mappings');
  },

  /**
   * Preload sprite sheet image
   */
  preloadSprite: function() {
    const img = new Image();
    img.onload = () => {
      this.state.spriteLoaded = true;
      console.log('[SpriteIcons] Sprite sheet loaded');
    };
    img.onerror = () => {
      console.warn('[SpriteIcons] Sprite sheet not found:', this.config.spriteSheet);
      console.warn('[SpriteIcons] Falling back to Unicode emojis');
      this.config.enabled = false;
    };
    img.src = this.config.spriteSheet;
  },

  /**
   * Setup MutationObserver for dynamic content
   */
  setupObserver: function() {
    this.state.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.replace(node);
          }
        });
      });
    });

    this.state.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  // ============================================================
  // REPLACEMENT METHODS
  // ============================================================

  /**
   * Replace all emojis in the document
   */
  replaceAll: function() {
    if (!this.config.enabled) return;
    this.replace(document.body);
  },

  /**
   * Replace emojis in a specific element
   * @param {HTMLElement} element - Element to process
   */
  replace: function(element) {
    if (!this.config.enabled || !element) return;

    // Skip if element is already an icon
    if (element.classList?.contains('icon')) return;

    // Process text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      this.processTextNode(node);
    });
  },

  /**
   * Process a single text node
   * @param {Text} textNode - Text node to process
   */
  processTextNode: function(textNode) {
    const text = textNode.textContent;
    let hasEmoji = false;

    // Check if text contains any mapped emojis
    for (const emoji of Object.keys(this.mapping)) {
      if (text.includes(emoji)) {
        hasEmoji = true;
        break;
      }
    }

    if (!hasEmoji) return;

    // Skip certain elements (inputs, scripts, styles, pre, code)
    const parent = textNode.parentNode;
    if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return;
    
    const tagName = parent.tagName?.toLowerCase();
    if (['script', 'style', 'input', 'textarea', 'pre', 'code', 'noscript'].includes(tagName)) {
      return;
    }

    // Create fragment with replaced content
    const fragment = document.createDocumentFragment();
    let remaining = text;

    while (remaining.length > 0) {
      let earliestMatch = null;
      let earliestIndex = remaining.length;
      let matchedEmoji = null;

      // Find earliest emoji match
      for (const [emoji, iconClass] of Object.entries(this.mapping)) {
        const index = remaining.indexOf(emoji);
        if (index !== -1 && index < earliestIndex) {
          earliestIndex = index;
          earliestMatch = iconClass;
          matchedEmoji = emoji;
        }
      }

      if (earliestMatch) {
        // Add text before emoji
        if (earliestIndex > 0) {
          fragment.appendChild(document.createTextNode(remaining.slice(0, earliestIndex)));
        }

        // Add icon span
        const icon = document.createElement('span');
        icon.className = `icon icon-${this.config.defaultSize} icon-${earliestMatch}`;
        icon.setAttribute('data-emoji', matchedEmoji);
        icon.setAttribute('aria-label', matchedEmoji);
        icon.setAttribute('role', 'img');
        fragment.appendChild(icon);

        // Continue with remaining text
        remaining = remaining.slice(earliestIndex + matchedEmoji.length);
      } else {
        // No more emojis, add remaining text
        fragment.appendChild(document.createTextNode(remaining));
        break;
      }
    }

    // Replace text node with fragment
    parent.replaceChild(fragment, textNode);
  },

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Create an icon element
   * @param {string} iconName - Icon class name (without 'icon-' prefix)
   * @param {string} size - Size class: 'sm', 'md', 'lg'
   * @returns {HTMLSpanElement}
   */
  create: function(iconName, size = 'md') {
    const icon = document.createElement('span');
    icon.className = `icon icon-${size} icon-${iconName}`;
    return icon;
  },

  /**
   * Get HTML string for an icon
   * @param {string} iconName - Icon class name
   * @param {string} size - Size class
   * @returns {string}
   */
  html: function(iconName, size = 'md') {
    return `<span class="icon icon-${size} icon-${iconName}"></span>`;
  },

  /**
   * Convert emoji to icon HTML
   * @param {string} emoji - Emoji character
   * @param {string} size - Size class
   * @returns {string}
   */
  fromEmoji: function(emoji, size = 'md') {
    const iconClass = this.mapping[emoji];
    if (!iconClass) return emoji;
    return this.html(iconClass, size);
  },

  /**
   * Enable/disable the system
   * @param {boolean} enabled
   */
  setEnabled: function(enabled) {
    this.config.enabled = enabled;
    if (enabled) {
      this.replaceAll();
    }
    console.log('[SpriteIcons]', enabled ? 'Enabled' : 'Disabled');
  },

  /**
   * Add a new emoji mapping
   * @param {string} emoji - Emoji character
   * @param {string} iconClass - CSS class (without 'icon-' prefix)
   */
  addMapping: function(emoji, iconClass) {
    this.mapping[emoji] = iconClass;
    console.log('[SpriteIcons] Added mapping:', emoji, '->', iconClass);
  },

  /**
   * Debug utility: Create a grid showing all sprite positions
   * Useful for figuring out correct background-position values
   * @param {number} rows - Number of rows to show
   * @param {number} cols - Number of columns to show
   */
  createDebugGrid: function(rows = 8, cols = 32) {
    const container = document.createElement('div');
    container.id = 'sprite-debug-grid';
    container.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      background: rgba(0,0,0,0.9);
      border: 2px solid #00ff00;
      padding: 20px;
      max-height: 80vh;
      overflow: auto;
      font-family: monospace;
      color: #00ff00;
    `;

    const title = document.createElement('h3');
    title.textContent = `Sprite Debug Grid (${cols}×${rows}) - Click positions to copy CSS`;
    title.style.margin = '0 0 15px 0';
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${cols}, 34px);
      gap: 2px;
      max-width: 100%;
    `;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement('div');
        const xPos = col * -32;
        const yPos = row * -32;
        
        cell.style.cssText = `
          width: 32px;
          height: 32px;
          background-image: var(--sprite-sheet);
          background-position: ${xPos}px ${yPos}px;
          background-size: ${cols * 32}px auto;
          border: 1px solid #004400;
          cursor: pointer;
          position: relative;
        `;
        
        cell.title = `Row ${row}, Col ${col}\nPosition: ${xPos}px ${yPos}px`;
        cell.onclick = () => {
          const css = `background-position: ${xPos}px ${yPos}px;`;
          navigator.clipboard.writeText(css).then(() => {
            console.log('Copied to clipboard:', css);
            cell.style.border = '2px solid #00ff00';
            setTimeout(() => cell.style.border = '1px solid #004400', 1000);
          });
        };

        // Add position label
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute;
          bottom: -15px;
          left: 0;
          font-size: 8px;
          color: #888;
          white-space: nowrap;
        `;
        label.textContent = `${row},${col}`;
        cell.appendChild(label);

        grid.appendChild(cell);
      }
    }

    container.appendChild(grid);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ff0000;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => container.remove();
    container.appendChild(closeBtn);

    document.body.appendChild(container);
    console.log('[SpriteIcons] Debug grid created. Click grid cells to copy CSS positions.');
  }
};

// Auto-initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  SpriteIcons.initialize();
});

console.log('[sprite-icons.js] Loaded. Call SpriteIcons.createDebugGrid() to debug sprite positions.');
  addMapping: function(emoji, iconClass) {
    this.mapping[emoji] = iconClass;
  },

  /**
   * Stop observing DOM changes
   */
  disconnect: function() {
    if (this.state.observer) {
      this.state.observer.disconnect();
      this.state.observer = null;
    }
  },
};

// Auto-initialize when DOM is ready (can be disabled by setting window.SPRITE_ICONS_MANUAL = true)
if (!window.SPRITE_ICONS_MANUAL) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SpriteIcons.initialize());
  } else {
    // Small delay to ensure sprite sheet CSS is loaded
    setTimeout(() => SpriteIcons.initialize(), 100);
  }
}
