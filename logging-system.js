// ============================================================
// LOGGING-SYSTEM.JS
// Manage separate log channels for different modules
//
// PURPOSE:
//   - Track actions across cast_log, tech_log, oracle_log
//   - Timestamp all entries
//   - Tag entries by source ([CAST], [TECH], [ORACLE], etc)
//   - Color-code output
//   - Auto-scroll to latest entries
//   - Support log clearing, export, filtering
//
// LOGS:
//   - cast_log: Cast console actions, commands, results
//   - tech_log: Technonomicon updates, spell/skill changes
//   - oracle_log: Crystal Ball responses, DM interactions
// ============================================================

window.LoggingSystem = {

  // ============================================================
  // [STATE] - Log storage and configuration
  // ============================================================
  logs: {
    cast: { entries: [], max: 100, paneId: null },
    tech: { entries: [], max: 100, paneId: null },
    oracle: { entries: [], max: 50, paneId: null }
  },

  // ============================================================
  // [INIT] - Initialize logging system
  // ============================================================
  initialize: function() {
    console.log("[LoggingSystem] Initializing");
    
    // Create log panes if PaneManager is available
    if (window.PaneManager) {
      this.setupPanes();
    }
    
    console.log("[LoggingSystem] Ready");
  },

  // ============================================================
  // [PANES] - Create log display panes
  // ============================================================
  setupPanes: function() {
    // Cast log pane
    this.logs.cast.paneId = "cast-log";
    PaneManager.createPane({
      id: "cast-log",
      title: "CAST LOG",
      x: 50,
      y: 50,
      width: 500,
      height: 300,
      minimizable: true,
      closeable: true,
      content: "<div id='cast-log-entries' style='font-family: monospace; color: #00ff00;'></div>"
    });

    // Tech log pane
    this.logs.tech.paneId = "tech-log";
    PaneManager.createPane({
      id: "tech-log",
      title: "TECHNONOMICON LOG",
      x: 600,
      y: 50,
      width: 500,
      height: 300,
      minimizable: true,
      closeable: true,
      content: "<div id='tech-log-entries' style='font-family: monospace; color: #00ff00;'></div>"
    });

    // Oracle log pane
    this.logs.oracle.paneId = "oracle-log";
    PaneManager.createPane({
      id: "oracle-log",
      title: "ORACLE LOG",
      x: 1150,
      y: 50,
      width: 500,
      height: 300,
      minimizable: true,
      closeable: true,
      content: "<div id='oracle-log-entries' style='font-family: monospace; color: #00ff00;'></div>"
    });

    console.log("[LoggingSystem] Log panes created");
  },

  // ============================================================
  // [LOG] - Add entry to a log
  // ============================================================
  log: function(channel, message, tag = null, color = "#00ff00") {
    if (!this.logs[channel]) {
      console.warn(`[LoggingSystem] Unknown log channel: ${channel}`);
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const tagStr = tag ? `[${tag}]` : "";
    const fullMessage = `${timestamp} ${tagStr} ${message}`;

    // Store entry
    const log = this.logs[channel];
    log.entries.push({
      timestamp: timestamp,
      message: message,
      tag: tag,
      color: color,
      fullMessage: fullMessage
    });

    // Trim to max
    if (log.entries.length > log.max) {
      log.entries.shift();
    }

    // Update display
    this.updateLogDisplay(channel);
  },

  // ============================================================
  // [UPDATE DISPLAY] - Refresh log pane
  // ============================================================
  updateLogDisplay: function(channel) {
    const elementId = `${channel}-log-entries`;
    const div = document.getElementById(elementId);
    if (!div) return;

    const log = this.logs[channel];
    
    div.innerHTML = log.entries.map(entry => {
      return `<div style="color: ${entry.color}; margin-bottom: 2px;">
        ${entry.fullMessage}
      </div>`;
    }).join("");

    // Auto-scroll to bottom
    const container = div.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  // ============================================================
  // [CLEAR] - Clear a log
  // ============================================================
  clear: function(channel) {
    if (this.logs[channel]) {
      this.logs[channel].entries = [];
      this.updateLogDisplay(channel);
      console.log(`[LoggingSystem] Cleared ${channel} log`);
    }
  },

  // ============================================================
  // [GET] - Retrieve log entries
  // ============================================================
  getEntries: function(channel, limit = null) {
    if (!this.logs[channel]) return [];
    
    const entries = this.logs[channel].entries;
    return limit ? entries.slice(-limit) : entries;
  },

  // ============================================================
  // [EXPORT] - Export log as text
  // ============================================================
  export: function(channel) {
    const entries = this.getEntries(channel);
    return entries.map(e => e.fullMessage).join("\n");
  },

  // ============================================================
  // [SHORTCUTS] - Convenience methods
  // ============================================================

  cast: function(message, tag = "CAST", color = "#00ff00") {
    this.log("cast", message, tag, color);
  },

  tech: function(message, tag = "TECH", color = "#88ff00") {
    this.log("tech", message, tag, color);
  },

  oracle: function(message, tag = "ORACLE", color = "#aa77ff") {
    this.log("oracle", message, tag, color);
  },

  error: function(channel, message, tag = "ERROR") {
    this.log(channel, message, tag, "#ff4444");
  },

  success: function(channel, message, tag = "SUCCESS") {
    this.log(channel, message, tag, "#44ff44");
  },

  warning: function(channel, message, tag = "WARN") {
    this.log(channel, message, tag, "#ffaa00");
  }

};

console.log("[logging-system.js] LoggingSystem loaded");
console.log("[logging-system.js] Call: LoggingSystem.initialize()");
console.log("[logging-system.js] Then: LoggingSystem.cast(message, tag, color)");
console.log("[logging-system.js]       LoggingSystem.tech(message, tag, color)");
console.log("[logging-system.js]       LoggingSystem.oracle(message, tag, color)");
