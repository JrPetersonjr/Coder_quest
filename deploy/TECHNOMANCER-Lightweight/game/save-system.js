// ============================================================
// SAVE SYSTEM - Game state persistence
// ============================================================

class SaveSystem {
  constructor(engine) {
    this.engine = engine;
    this.saveSlots = 3;
    this.localStoragePrefix = "TECHNOMANCER_";
  }
  
  // ============================================================
  // SAVE GAME
  // ============================================================
  
  saveGame(slotNumber = 0) {
    if (slotNumber < 0 || slotNumber >= this.saveSlots) {
      console.warn(`Invalid save slot: ${slotNumber}`);
      return false;
    }
    
    try {
      const saveData = {
        timestamp: Date.now(),
        slotNumber: slotNumber,
        
        // Game state
        gameState: this.engine.gameState,
        
        // Quest progression
        quests: this.engine.questSystem.save(),
        
        // Audio settings
        audio: this.engine.audioSystem.save(),
      };
      
      const key = this.localStoragePrefix + "SAVE_" + slotNumber;
      localStorage.setItem(key, JSON.stringify(saveData));
      
      console.log(`[SaveSystem] Game saved to slot ${slotNumber}`);
      return true;
    } catch (e) {
      console.error("[SaveSystem] Failed to save game:", e);
      return false;
    }
  }
  
  // ============================================================
  // LOAD GAME
  // ============================================================
  
  loadGame(slotNumber = 0) {
    if (slotNumber < 0 || slotNumber >= this.saveSlots) {
      console.warn(`Invalid save slot: ${slotNumber}`);
      return false;
    }
    
    try {
      const key = this.localStoragePrefix + "SAVE_" + slotNumber;
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.warn(`[SaveSystem] No save data in slot ${slotNumber}`);
        return false;
      }
      
      const saveData = JSON.parse(data);
      
      // Restore game state
      this.engine.gameState = saveData.gameState;
      
      // Restore quests
      this.engine.questSystem.load(saveData.quests);
      
      // Restore audio settings
      this.engine.audioSystem.load(saveData.audio);
      
      console.log(`[SaveSystem] Game loaded from slot ${slotNumber}`);
      return true;
    } catch (e) {
      console.error("[SaveSystem] Failed to load game:", e);
      return false;
    }
  }
  
  // ============================================================
  // SAVE LISTING
  // ============================================================
  
  getSaveInfo(slotNumber = 0) {
    try {
      const key = this.localStoragePrefix + "SAVE_" + slotNumber;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }
      
      const saveData = JSON.parse(data);
      const timestamp = new Date(saveData.timestamp);
      
      return {
        slot: slotNumber,
        timestamp: timestamp,
        timestampStr: timestamp.toLocaleString(),
        level: saveData.gameState.level,
        zone: saveData.gameState.zone,
        quests: saveData.quests.completedQuests.length,
      };
    } catch (e) {
      return null;
    }
  }
  
  getAllSaves() {
    const saves = [];
    for (let i = 0; i < this.saveSlots; i++) {
      const info = this.getSaveInfo(i);
      if (info) {
        saves.push(info);
      }
    }
    return saves;
  }
  
  // ============================================================
  // DELETION
  // ============================================================
  
  deleteSave(slotNumber = 0) {
    try {
      const key = this.localStoragePrefix + "SAVE_" + slotNumber;
      localStorage.removeItem(key);
      console.log(`[SaveSystem] Save deleted from slot ${slotNumber}`);
      return true;
    } catch (e) {
      console.error("[SaveSystem] Failed to delete save:", e);
      return false;
    }
  }
  
  // ============================================================
  // AUTO-SAVE
  // ============================================================
  
  autoSave() {
    // Save to dedicated auto-save slot (slot -1)
    try {
      const saveData = {
        timestamp: Date.now(),
        isAutoSave: true,
        
        gameState: this.engine.gameState,
        quests: this.engine.questSystem.save(),
        audio: this.engine.audioSystem.save(),
      };
      
      const key = this.localStoragePrefix + "AUTOSAVE";
      localStorage.setItem(key, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error("[SaveSystem] Auto-save failed:", e);
      return false;
    }
  }
  
  loadAutoSave() {
    try {
      const key = this.localStoragePrefix + "AUTOSAVE";
      const data = localStorage.getItem(key);
      
      if (!data) return false;
      
      const saveData = JSON.parse(data);
      
      this.engine.gameState = saveData.gameState;
      this.engine.questSystem.load(saveData.quests);
      this.engine.audioSystem.load(saveData.audio);
      
      console.log("[SaveSystem] Auto-save restored");
      return true;
    } catch (e) {
      console.error("[SaveSystem] Failed to load auto-save:", e);
      return false;
    }
  }
  
  // ============================================================
  // CLEAR ALL
  // ============================================================
  
  clearAllSaves() {
    try {
      for (let i = 0; i < this.saveSlots; i++) {
        this.deleteSave(i);
      }
      localStorage.removeItem(this.localStoragePrefix + "AUTOSAVE");
      console.log("[SaveSystem] All saves cleared");
      return true;
    } catch (e) {
      console.error("[SaveSystem] Failed to clear saves:", e);
      return false;
    }
  }
}

console.log("[save-system.js] Save system loaded");
