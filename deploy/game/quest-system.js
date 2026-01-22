// ============================================================
// QUEST SYSTEM - Quest tracking and progression
// ============================================================

const QUEST_DEFINITIONS = {
  tutorial_basics: {
    id: "tutorial_basics",
    name: "Welcome to TECHNOMANCER",
    description: "Learn the basic commands",
    steps: [
      {id: "help", text: "Check the help menu", command: "help"},
      {id: "stats", text: "Check your stats", command: "stats"},
      {id: "look", text: "Look around", command: "look"},
    ],
    reward: {xp: 10, message: "You've learned the basics!"},
  },
  
  explore_zones: {
    id: "explore_zones",
    name: "Explorer's Journey",
    description: "Visit all three zones",
    steps: [
      {id: "hub", text: "Visit the Central Hub", zone: "hub"},
      {id: "forest", text: "Visit the Refactor Forest", zone: "forest"},
      {id: "city", text: "Visit the Breakpoint City", zone: "city"},
    ],
    reward: {xp: 25, message: "You've explored all zones!"},
  },
  
  master_spells: {
    id: "master_spells",
    name: "Spell Apprentice",
    description: "Learn to craft spells",
    steps: [
      {id: "craft1", text: "Craft your first spell", count: 1},
      {id: "cast1", text: "Cast a spell in battle", count: 1},
      {id: "cast5", text: "Cast 5 spells total", count: 5},
    ],
    reward: {xp: 50, message: "You're becoming a spell master!"},
  },
  
  first_victory: {
    id: "first_victory",
    name: "First Blood",
    description: "Win your first battle",
    steps: [
      {id: "battle", text: "Enter a battle", enter: true},
      {id: "victory", text: "Defeat an enemy", victory: true},
    ],
    reward: {xp: 30, message: "Victory is yours!"},
  },
  
  data_collector: {
    id: "data_collector",
    name: "Data Collector",
    description: "Define 10 concepts using the 'define' command",
    steps: [
      {id: "def1", text: "Define 1 concept", count: 1},
      {id: "def5", text: "Define 5 concepts", count: 5},
      {id: "def10", text: "Define 10 concepts", count: 10},
    ],
    reward: {xp: 40, message: "You're collecting knowledge!"},
  },
  
  graphics_unlock: {
    id: "graphics_unlock",
    name: "Reality Glitch",
    description: "Complete all beginner quests to unlock visual rendering",
    steps: [
      {id: "basics_done", text: "Complete: Welcome to TECHNOMANCER", quest: "tutorial_basics"},
      {id: "zones_done", text: "Complete: Explorer's Journey", quest: "explore_zones"},
      {id: "spells_done", text: "Complete: Spell Apprentice", quest: "master_spells"},
      {id: "victory_done", text: "Complete: First Blood", quest: "first_victory"},
    ],
    reward: {
      xp: 200, 
      message: "THE GRAPHICS SYSTEM HAS BEEN UNLOCKED! The game's visual layer awakens...",
      unlock: "graphics"
    },
  },
};

// ============================================================
// QUEST SYSTEM CLASS
// ============================================================

class QuestSystem {
  constructor() {
    this.quests = {};
    this.activeQuests = [];
    this.completedQuests = [];
    this.progressTrackers = {
      battles_won: 0,
      spells_cast: 0,
      spells_crafted: 0,
      concepts_defined: 0,
      zones_visited: new Set(),
    };
    
    // Initialize all available quests
    this.initializeQuests();
  }
  
  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  initializeQuests() {
    for (let questId in QUEST_DEFINITIONS) {
      const definition = QUEST_DEFINITIONS[questId];
      this.quests[questId] = {
        ...definition,
        active: false,
        completed: false,
        progress: {},
      };
    }
    
    // Auto-start the first quest
    this.startQuest("tutorial_basics");
  }
  
  // ============================================================
  // QUEST MANAGEMENT
  // ============================================================
  
  startQuest(questId) {
    if (!this.quests[questId]) {
      console.warn(`Quest not found: ${questId}`);
      return false;
    }
    
    const quest = this.quests[questId];
    
    if (quest.completed) {
      console.log(`Quest already completed: ${questId}`);
      return false;
    }
    
    quest.active = true;
    
    if (!this.activeQuests.includes(questId)) {
      this.activeQuests.push(questId);
    }
    
    console.log(`[Quest] Started: ${quest.name}`);
    return true;
  }
  
  abandonQuest(questId) {
    if (!this.quests[questId]) return false;
    
    const quest = this.quests[questId];
    quest.active = false;
    
    const index = this.activeQuests.indexOf(questId);
    if (index > -1) {
      this.activeQuests.splice(index, 1);
    }
    
    console.log(`[Quest] Abandoned: ${quest.name}`);
    return true;
  }
  
  // ============================================================
  // PROGRESS TRACKING
  // ============================================================
  
  trackAction(action, value = 1) {
    // Track battles
    if (action === "battle_won") {
      this.progressTrackers.battles_won += value;
      this.checkProgressOnAction("battle_won");
    }
    
    // Track spells cast
    if (action === "spell_cast") {
      this.progressTrackers.spells_cast += value;
      this.checkProgressOnAction("spell_cast");
    }
    
    // Track spells crafted
    if (action === "spell_crafted") {
      this.progressTrackers.spells_crafted += value;
      this.checkProgressOnAction("spell_crafted");
    }
    
    // Track concepts defined
    if (action === "concept_defined") {
      this.progressTrackers.concepts_defined += value;
      this.checkProgressOnAction("concept_defined");
    }
    
    // Track zone visits
    if (action === "zone_visited") {
      this.progressTrackers.zones_visited.add(value);
      this.checkProgressOnAction("zone_visited", value);
    }
  }
  
  checkProgressOnAction(action, value = null) {
    for (let questId of this.activeQuests) {
      const quest = this.quests[questId];
      let stepCompleted = false;
      
      for (let step of quest.steps) {
        // Check battle condition
        if (action === "battle_won" && step.victory) {
          stepCompleted = true;
        }
        
        // Check spell cast condition
        if (action === "spell_cast" && step.id === "cast1") {
          stepCompleted = true;
        }
        if (action === "spell_cast" && step.count === 5 && 
            this.progressTrackers.spells_cast >= 5) {
          stepCompleted = true;
        }
        
        // Check spell crafted condition
        if (action === "spell_crafted" && step.id === "craft1") {
          stepCompleted = true;
        }
        
        // Check concept defined condition
        if (action === "concept_defined") {
          if (step.count === 1 && this.progressTrackers.concepts_defined >= 1) {
            stepCompleted = true;
          }
          if (step.count === 5 && this.progressTrackers.concepts_defined >= 5) {
            stepCompleted = true;
          }
          if (step.count === 10 && this.progressTrackers.concepts_defined >= 10) {
            stepCompleted = true;
          }
        }
        
        // Check zone visited condition
        if (action === "zone_visited" && step.zone === value) {
          stepCompleted = true;
        }
        
        if (stepCompleted && !quest.progress[step.id]) {
          quest.progress[step.id] = true;
          console.log(`[Quest Progress] ${quest.name}: ${step.text}`);
        }
      }
      
      // Check if quest is complete
      this.checkQuestCompletion(questId);
    }
  }
  
  trackQuestCompletion(completedQuestId) {
    // When a quest is completed, check dependent quests
    for (let questId in this.quests) {
      const quest = this.quests[questId];
      
      for (let step of quest.steps) {
        if (step.quest === completedQuestId && !quest.progress[step.id]) {
          quest.progress[step.id] = true;
          console.log(`[Quest Progress] ${quest.name}: ${step.text}`);
          this.checkQuestCompletion(questId);
        }
      }
    }
  }
  
  checkQuestCompletion(questId) {
    const quest = this.quests[questId];
    
    if (quest.completed) return;
    
    // Check if all steps are complete
    const allStepsComplete = quest.steps.every(step => quest.progress[step.id]);
    
    if (allStepsComplete) {
      this.completeQuest(questId);
    }
  }
  
  completeQuest(questId) {
    const quest = this.quests[questId];
    
    quest.completed = true;
    quest.active = false;
    
    const index = this.activeQuests.indexOf(questId);
    if (index > -1) {
      this.activeQuests.splice(index, 1);
    }
    
    if (!this.completedQuests.includes(questId)) {
      this.completedQuests.push(questId);
    }
    
    console.log(`[Quest Complete] ${quest.name}`);
    
    // Track for quest dependencies
    this.trackQuestCompletion(questId);
    
    return quest.reward;
  }
  
  // ============================================================
  // QUEST QUERIES
  // ============================================================
  
  getQuestStatus(questId) {
    const quest = this.quests[questId];
    if (!quest) return null;
    
    return {
      name: quest.name,
      description: quest.description,
      active: quest.active,
      completed: quest.completed,
      progress: quest.progress,
      steps: quest.steps,
    };
  }
  
  getActiveQuests() {
    const result = [];
    for (let questId of this.activeQuests) {
      const quest = this.quests[questId];
      result.push({
        id: questId,
        name: quest.name,
        progress: Object.values(quest.progress).filter(Boolean).length,
        total: quest.steps.length,
      });
    }
    return result;
  }
  
  isGraphicsUnlocked() {
    const graphicsQuest = this.quests["graphics_unlock"];
    return graphicsQuest && graphicsQuest.completed;
  }
  
  save() {
    return {
      quests: this.quests,
      activeQuests: this.activeQuests,
      completedQuests: this.completedQuests,
      progressTrackers: {
        battles_won: this.progressTrackers.battles_won,
        spells_cast: this.progressTrackers.spells_cast,
        spells_crafted: this.progressTrackers.spells_crafted,
        concepts_defined: this.progressTrackers.concepts_defined,
        zones_visited: Array.from(this.progressTrackers.zones_visited),
      },
    };
  }
  
  load(data) {
    if (!data) return;
    
    this.quests = data.quests || this.quests;
    this.activeQuests = data.activeQuests || this.activeQuests;
    this.completedQuests = data.completedQuests || this.completedQuests;
    
    if (data.progressTrackers) {
      this.progressTrackers.battles_won = data.progressTrackers.battles_won || 0;
      this.progressTrackers.spells_cast = data.progressTrackers.spells_cast || 0;
      this.progressTrackers.spells_crafted = data.progressTrackers.spells_crafted || 0;
      this.progressTrackers.concepts_defined = data.progressTrackers.concepts_defined || 0;
      this.progressTrackers.zones_visited = new Set(data.progressTrackers.zones_visited || []);
    }
  }
}

console.log("[quest-system.js] Quest system loaded");
