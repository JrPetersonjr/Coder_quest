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
