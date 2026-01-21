// ===== TECHNOMANCER UPDATE MANAGER =====
// Handles system patches (password protected) and DLC (public)

const UpdateManager = {
  currentVersion: "2.0.0",
  updateLog: [],
  installedUpdates: [],
  
  // ===== CONFIGURATION =====
  config: {
    // Change these URLs to your patch server
    systemManifestURL: "http://localhost:5000/api/system/manifest",
    systemPatchURL: "http://localhost:5000/api/system/patch",
    dlcManifestURL: "http://localhost:5000/api/dlc/manifest",
    dlcPatchURL: "http://localhost:5000/api/dlc/patch",
    healthCheckURL: "http://localhost:5000/api/health",
    checkInterval: 3600000 // Check every hour
  },

  // ===== INITIALIZE =====
  init: function() {
    console.log("[UPDATER] System initialized v" + this.currentVersion);
    this.loadLocalUpdates();
    console.log("[UPDATER] Ready for updates");
    // Don't check for updates on startup - let user trigger it manually
  },

 // ===== LOAD LOCAL UPDATES =====
loadLocalUpdates: function() {
  try {
    // Some environments disable localStorage. Never crash the engine.
    if (typeof localStorage === "undefined") {
      console.warn("[UPDATER] localStorage unavailable — skipping load");
      this.installedUpdates = [];
      return;
    }

    const saved = localStorage.getItem("technomancer_updates");
    if (!saved) {
      this.installedUpdates = [];
      return;
    }

    this.installedUpdates = JSON.parse(saved) || [];
    console.log("[UPDATER] Loaded " + this.installedUpdates.length + " installed updates");

  } catch (e) {
    console.error("[UPDATER] Failed to load local updates", e);
    this.installedUpdates = [];
  }
},

// ===== SAVE LOCAL UPDATES =====
saveLocalUpdates: function() {
  try {
    if (typeof localStorage === "undefined") {
      console.warn("[UPDATER] localStorage unavailable — skipping save");
      return;
    }

    localStorage.setItem("technomancer_updates", JSON.stringify(this.installedUpdates));
  } catch (e) {
    console.error("[UPDATER] Failed to save updates", e);
  }
},


  // ===== CHECK PATCH SERVER STATUS =====
  checkServerStatus: async function() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(this.config.healthCheckURL, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        addOutput("[UPDATER] ✓ Patch server online", "system");
        return true;
      } else {
        addOutput("[UPDATER] Patch server offline", "error");
        return false;
      }
    } catch(e) {
      addOutput("[UPDATER] Cannot reach patch server", "error");
      return false;
    }
  },

  // ===== CHECK FOR DLC UPDATES (PUBLIC) =====
  checkForDLCUpdates: async function() {
    try {
      addOutput("[UPDATER] Checking for available DLC...", "system");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(this.config.dlcManifestURL, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        addOutput("[UPDATER] Could not fetch DLC manifest", "error");
        return;
      }

      const manifest = await response.json();
      this.processDLCManifest(manifest);
    } catch(e) {
      console.error("[UPDATER] Failed to check DLC", e);
      addOutput("[UPDATER] DLC check failed (check running? continuing anyway...)", "system");
    }
  },

  // ===== PROCESS DLC MANIFEST =====
  processDLCManifest: async function(manifest) {
    if (!manifest.patches || manifest.patches.length === 0) {
      addOutput("[UPDATER] No DLC available", "system");
      return;
    }

    console.log("[UPDATER] DLC Manifest received. Available DLC:", manifest.patches.length);
    
    for (const dlc of manifest.patches) {
      const isInstalled = this.installedUpdates.find(u => u.id === dlc.id);
      
      if (!isInstalled) {
        console.log("[UPDATER] Available DLC:", dlc.name, "v" + dlc.version);
        addOutput(`[UPDATER] 📦 Available: ${dlc.name} v${dlc.version}`, "system");
      }
    }
  },

  // ===== INSTALL DLC =====
  installDLC: async function(dlcId) {
    const isInstalled = this.installedUpdates.find(u => u.id === dlcId);
    if (isInstalled) {
      addOutput(`[UPDATER] DLC "${dlcId}" already installed`, "error");
      return;
    }

    addOutput(`[UPDATER] Installing DLC: ${dlcId}...`, "system");
    
    try {
      const response = await fetch(this.config.dlcManifestURL);
      const manifest = await response.json();

      const dlcInfo = manifest.patches.find(u => u.id === dlcId);
      if (!dlcInfo) {
        addOutput(`[UPDATER] DLC "${dlcId}" not found!`, "error");
        return;
      }

      await this.downloadDLCPatch(dlcInfo);
    } catch(e) {
      addOutput("[UPDATER] DLC installation failed: " + e.message, "error");
    }
  },

  // ===== DOWNLOAD DLC PATCH =====
  downloadDLCPatch: async function(dlcInfo) {
    try {
      addOutput(`[UPDATER] Downloading: ${dlcInfo.name} v${dlcInfo.version}`, "system");
      
      const response = await fetch(this.config.dlcPatchURL + "/" + dlcInfo.id);
      
      if (!response.ok) {
        addOutput(`[UPDATER] Failed to download ${dlcInfo.id}`, "error");
        return;
      }

      const dlcData = await response.json();
      await this.applyDLCPatch(dlcData);
    } catch(e) {
      console.error("[UPDATER] DLC Download failed", e);
      addOutput("[UPDATER] Download error: " + e.message, "error");
    }
  },

  // ===== APPLY DLC PATCH =====
  applyDLCPatch: async function(dlcData) {
    try {
      addOutput(`[UPDATER] Installing: ${dlcData.name}...`, "system");

      // Apply core content (new classes, spells, enemies, pages)
      if (dlcData.core) {
        this.applyToCore(dlcData.core);
      }

      // Apply game content (quests, missions)
      if (dlcData.game) {
        this.applyToGame(dlcData.game);
      }

      // Record installation
      this.installedUpdates.push({
        id: dlcData.id,
        version: dlcData.version,
        type: "dlc",
        installedAt: new Date().toISOString()
      });

      this.saveLocalUpdates();
      this.updateLog.push({
        update: dlcData.id,
        status: "success",
        time: new Date().toISOString()
      });

      addOutput(`✓ ${dlcData.name} installed successfully!`, "highlight");
      if (dlcData.reward) {
        gameState.exp += dlcData.reward;
        addOutput(`Earned ${dlcData.reward} EXP!`, "highlight");
      }
      updateUI();

    } catch(e) {
      console.error("[UPDATER] DLC Apply failed", e);
      addOutput("[UPDATER] Installation failed: " + e.message, "error");
    }
  },

  // ===== CHECK FOR SYSTEM PATCHES (ADMIN ONLY) =====
  checkForSystemPatches: async function(adminPassword) {
    if (!adminPassword) {
      addOutput("[UPDATER] System patch check requires admin password", "error");
      return false;
    }

    try {
      addOutput("[UPDATER] Checking for system patches...", "system");
      const response = await fetch(this.config.systemManifestURL, {
        headers: {
          "Authorization": "Bearer " + adminPassword
        }
      });
      
      if (response.status === 403) {
        addOutput("[UPDATER] Invalid admin credentials", "error");
        return false;
      }

      if (!response.ok) {
        addOutput("[UPDATER] System patch server unavailable", "error");
        return false;
      }

      const manifest = await response.json();
      await this.processSystemManifest(manifest, adminPassword);
      return true;
    } catch(e) {
      console.error("[UPDATER] Failed to check system patches", e);
      addOutput("[UPDATER] Error: " + e.message, "error");
      return false;
    }
  },

  // ===== PROCESS SYSTEM MANIFEST =====
  processSystemManifest: async function(manifest, adminPassword) {
    if (!manifest.patches || manifest.patches.length === 0) {
      addOutput("[UPDATER] No system patches available", "system");
      return;
    }

    console.log("[UPDATER] System patches available:", manifest.patches.length);
    
    for (const patch of manifest.patches) {
      const isInstalled = this.installedUpdates.find(u => u.id === patch.id);
      
      if (!isInstalled) {
        const label = patch.required ? "REQUIRED" : "optional";
        addOutput(`[UPDATER] 🔧 ${label.toUpperCase()}: ${patch.name} v${patch.version}`, "system");
      }
    }
  },

  // ===== INSTALL SYSTEM PATCH =====
  installSystemPatch: async function(patchId, adminPassword) {
    if (!adminPassword) {
      addOutput("[UPDATER] Admin password required", "error");
      return false;
    }

    const isInstalled = this.installedUpdates.find(u => u.id === patchId);
    if (isInstalled) {
      addOutput(`[UPDATER] Patch "${patchId}" already installed`, "error");
      return false;
    }

    addOutput(`[UPDATER] Installing system patch: ${patchId}...`, "system");
    
    try {
      const response = await fetch(this.config.systemManifestURL, {
        headers: { "Authorization": "Bearer " + adminPassword }
      });

      if (response.status === 403) {
        addOutput("[UPDATER] Invalid admin credentials", "error");
        return false;
      }

      const manifest = await response.json();
      const patchInfo = manifest.patches.find(p => p.id === patchId);
      
      if (!patchInfo) {
        addOutput(`[UPDATER] Patch "${patchId}" not found`, "error");
        return false;
      }

      await this.downloadSystemPatch(patchInfo, adminPassword);
      return true;
    } catch(e) {
      addOutput("[UPDATER] Error: " + e.message, "error");
      return false;
    }
  },

  // ===== DOWNLOAD SYSTEM PATCH =====
  downloadSystemPatch: async function(patchInfo, adminPassword) {
    try {
      addOutput(`[UPDATER] Downloading: ${patchInfo.name} v${patchInfo.version}`, "system");
      
      const response = await fetch(this.config.systemPatchURL + "/" + patchInfo.id, {
        headers: { "Authorization": "Bearer " + adminPassword }
      });
      
      if (!response.ok) {
        addOutput(`[UPDATER] Failed to download ${patchInfo.id}`, "error");
        return;
      }

      const patchData = await response.json();
      await this.applySystemPatch(patchData);
    } catch(e) {
      console.error("[UPDATER] System Patch Download failed", e);
      addOutput("[UPDATER] Download error: " + e.message, "error");
    }
  },

  // ===== APPLY SYSTEM PATCH =====
  applySystemPatch: async function(patchData) {
    try {
      addOutput(`[UPDATER] Applying: ${patchData.name}...`, "system");

      // Apply changes to game objects
      if (patchData.changes && Array.isArray(patchData.changes)) {
        for (const change of patchData.changes) {
          this.applyChange(change);
        }
      }

      // Record installation
      this.installedUpdates.push({
        id: patchData.id,
        version: patchData.version,
        type: "system",
        installedAt: new Date().toISOString()
      });

      this.saveLocalUpdates();
      this.updateLog.push({
        update: patchData.id,
        status: "success",
        time: new Date().toISOString()
      });

      addOutput(`✓ ${patchData.name} applied successfully!`, "highlight");
      addOutput("⚠️ Refresh the page to see changes", "system");
      updateUI();

    } catch(e) {
      console.error("[UPDATER] System Patch Apply failed", e);
      addOutput("[UPDATER] Patch failed: " + e.message, "error");
    }
  },

  // ===== APPLY INDIVIDUAL CHANGE =====
  applyChange: function(change) {
    try {
      const target = window[change.file];
      
      if (!target) {
        throw new Error(`Target ${change.file} not found`);
      }

      switch(change.type) {
        case "insert":
          target[change.key] = change.value;
          console.log(`[UPDATER] Inserted ${change.file}.${change.key}`);
          break;
        case "replace":
          if (!(change.key in target)) {
            throw new Error(`Key ${change.key} not found in ${change.file}`);
          }
          target[change.key] = change.value;
          console.log(`[UPDATER] Replaced ${change.file}.${change.key}`);
          break;
        case "delete":
          delete target[change.key];
          console.log(`[UPDATER] Deleted ${change.file}.${change.key}`);
          break;
        default:
          throw new Error(`Unknown change type: ${change.type}`);
      }
    } catch(e) {
      console.error("[UPDATER] Error applying change:", e);
      throw e;
    }
  },

  // ===== INJECT INTO CORE.JS =====
  applyToCore: function(coreUpdates) {
    if (coreUpdates.classes) {
      Object.assign(CLASSES, coreUpdates.classes);
      console.log("[UPDATER] Added classes:", Object.keys(coreUpdates.classes));
    }
    if (coreUpdates.spells) {
      Object.assign(SPELLS, coreUpdates.spells);
      console.log("[UPDATER] Added spells:", Object.keys(coreUpdates.spells));
    }
    if (coreUpdates.enemies) {
      Object.assign(ENEMIES, coreUpdates.enemies);
      console.log("[UPDATER] Added enemies:", Object.keys(coreUpdates.enemies));
    }
    if (coreUpdates.pages) {
      Object.assign(PAGES, coreUpdates.pages);
      console.log("[UPDATER] Added pages:", Object.keys(coreUpdates.pages));
    }
  },

  applyToGame: function(gameUpdates) {
    if (gameUpdates.missions) {
      Object.assign(gameState.quests, gameUpdates.missions);
      console.log("[UPDATER] Added missions:", Object.keys(gameUpdates.missions));
    }
  },

  // ===== CONSOLE COMMANDS =====
  help: function() {
    addOutput("=== UPDATER COMMANDS ===", "system");
    addOutput("UpdateManager.checkForDLCUpdates() - Check for available DLC", "system");
    addOutput("UpdateManager.installDLC(dlcId) - Install specific DLC", "system");
    addOutput("UpdateManager.checkForSystemPatches(password) - Check for system updates", "system");
    addOutput("UpdateManager.installSystemPatch(patchId, password) - Install system patch", "system");
    addOutput("UpdateManager.listUpdates() - Show installed updates", "system");
  },

  listUpdates: function() {
    addOutput("=== INSTALLED UPDATES ===", "system");
    addOutput("Current Version: " + this.currentVersion, "system");
    addOutput("Installed: " + this.installedUpdates.length, "system");
    addOutput("");
    
    if (this.installedUpdates.length === 0) {
      addOutput("No updates installed", "system");
      return;
    }

    this.installedUpdates.forEach(u => {
      addOutput(`✓ ${u.id} v${u.version} (${u.type})`, "system");
    });
  }
};

// ===== INITIALIZE ON LOAD =====
window.addEventListener("load", () => {
  UpdateManager.init();
});