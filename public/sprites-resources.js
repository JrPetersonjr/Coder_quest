// ============================================================
// SPRITES RESOURCES - Pixel Art Asset Library
// ============================================================
// Maps sprite names to sheet coordinates
// Format: {x: col, y: row, w: width, h: height} in pixels
// Sheet dimensions: Multiple asset sets combined

const SPRITE_SHEET = {
  // ============================================================
  // CHARACTERS - Player & NPCs
  // ============================================================
  characters: {
    player_male: {x: 0, y: 0, w: 32, h: 32},
    player_female: {x: 32, y: 0, w: 32, h: 32},
    npc_robe: {x: 64, y: 0, w: 32, h: 32},
    npc_hooded: {x: 96, y: 0, w: 32, h: 32},
  },

  // ============================================================
  // SPELLS & MAGIC EFFECTS (NEW - Expanded)
  // ============================================================
  spells: {
    // Fire spells
    spell_fire_1: {x: 0, y: 32, w: 32, h: 32},
    spell_fire_2: {x: 32, y: 32, w: 32, h: 32},
    spell_fire_3: {x: 64, y: 32, w: 32, h: 32},
    spell_fire_4: {x: 96, y: 32, w: 32, h: 32},
    
    // Water/Ice spells
    spell_water_1: {x: 128, y: 32, w: 32, h: 32},
    spell_water_2: {x: 160, y: 32, w: 32, h: 32},
    spell_water_3: {x: 192, y: 32, w: 32, h: 32},
    spell_water_4: {x: 224, y: 32, w: 32, h: 32},
    
    // Energy orbs
    spell_energy_green: {x: 256, y: 32, w: 32, h: 32},
    spell_energy_teal: {x: 288, y: 32, w: 32, h: 32},
    spell_energy_gold: {x: 320, y: 32, w: 32, h: 32},
    spell_energy_orb: {x: 352, y: 32, w: 32, h: 32},
    
    // Gems & Crystals
    spell_gem_skull: {x: 384, y: 32, w: 32, h: 32},
    spell_gem_dark: {x: 416, y: 32, w: 32, h: 32},
    spell_gem_green: {x: 448, y: 32, w: 32, h: 32},
    spell_gem_gold: {x: 480, y: 32, w: 32, h: 32},
    
    // Explosive effects
    spell_purple_burst_1: {x: 0, y: 64, w: 32, h: 32},
    spell_purple_burst_2: {x: 32, y: 64, w: 32, h: 32},
    spell_cyan_burst_1: {x: 64, y: 64, w: 32, h: 32},
    spell_cyan_burst_2: {x: 96, y: 64, w: 32, h: 32},
    spell_cyan_burst_3: {x: 128, y: 64, w: 32, h: 32},
    spell_cyan_burst_4: {x: 160, y: 64, w: 32, h: 32},
  },

  // ============================================================
  // POTIONS & CONSUMABLES (NEW)
  // ============================================================
  potions: {
    potion_orange: {x: 0, y: 96, w: 24, h: 32},
    potion_orange_2: {x: 24, y: 96, w: 24, h: 32},
    potion_purple: {x: 48, y: 96, w: 24, h: 32},
    potion_blue: {x: 72, y: 96, w: 24, h: 32},
    potion_pink: {x: 96, y: 96, w: 24, h: 32},
    potion_cyan: {x: 120, y: 96, w: 24, h: 32},
  },

  // ============================================================
  // EQUIPMENT & STORAGE (NEW)
  // ============================================================
  equipment: {
    disk_floppy_1: {x: 0, y: 128, w: 32, h: 32},
    disk_floppy_2: {x: 32, y: 128, w: 32, h: 32},
    disk_cd_yellow: {x: 64, y: 128, w: 32, h: 32},
    disk_cd_green: {x: 96, y: 128, w: 32, h: 32},
    disk_cd_blue: {x: 128, y: 128, w: 32, h: 32},
    disk_cd_cyan: {x: 160, y: 128, w: 32, h: 32},
    circuit_board_1: {x: 192, y: 128, w: 32, h: 32},
    circuit_board_2: {x: 224, y: 128, w: 32, h: 32},
  },

  // ============================================================
  // COMPUTERS & TERMINALS (NEW)
  // ============================================================
  terminals: {
    terminal_computer_1: {x: 0, y: 160, w: 32, h: 32},
    terminal_computer_2: {x: 32, y: 160, w: 32, h: 32},
    terminal_screen_old: {x: 64, y: 160, w: 32, h: 32},
    terminal_screen_green: {x: 96, y: 160, w: 32, h: 32},
    terminal_disk_old: {x: 128, y: 160, w: 32, h: 32},
    terminal_disk_dark: {x: 160, y: 160, w: 32, h: 32},
    terminal_disk_black: {x: 192, y: 160, w: 32, h: 32},
    headphones: {x: 224, y: 160, w: 32, h: 32},
    grenade: {x: 256, y: 160, w: 32, h: 32},
    circuit_panel_1: {x: 288, y: 160, w: 48, h: 32},
    circuit_panel_2: {x: 336, y: 160, w: 48, h: 32},
    circuit_panel_3: {x: 384, y: 160, w: 48, h: 32},
    monitor_desk: {x: 432, y: 160, w: 32, h: 32},
    robot_drone: {x: 464, y: 160, w: 32, h: 32},
  },

  // ============================================================
  // DOORS & STRUCTURES (NEW)
  // ============================================================
  structures: {
    door_green_1: {x: 0, y: 192, w: 32, h: 48},
    door_green_2: {x: 32, y: 192, w: 32, h: 48},
    gate_green: {x: 64, y: 192, w: 64, h: 32},
    gate_green_tall: {x: 128, y: 192, w: 64, h: 48},
    gate_brown: {x: 192, y: 192, w: 32, h: 32},
    keyboard: {x: 224, y: 192, w: 48, h: 24},
  },

  // ============================================================
  // WEAPONS (NEW)
  // ============================================================
  weapons: {
    joystick_wooden: {x: 0, y: 224, w: 24, h: 32},
    joystick_gold: {x: 24, y: 224, w: 24, h: 32},
    joystick_blue: {x: 48, y: 224, w: 24, h: 32},
    staff_golden: {x: 72, y: 224, w: 24, h: 48},
    staff_wooden: {x: 96, y: 224, w: 24, h: 48},
    staff_dark: {x: 120, y: 224, w: 24, h: 48},
    sword_green: {x: 144, y: 224, w: 16, h: 40},
    sword_gray: {x: 160, y: 224, w: 16, h: 40},
    wand_gold: {x: 176, y: 224, w: 16, h: 40},
    wand_blue: {x: 192, y: 224, w: 16, h: 40},
  },

  // ============================================================
  // MAGICAL ITEMS & ARTIFACTS (NEW)
  // ============================================================
  artifacts: {
    scroll: {x: 0, y: 256, w: 32, h: 32},
    scroll_bound: {x: 32, y: 256, w: 32, h: 32},
    ring_gold: {x: 64, y: 256, w: 24, h: 24},
    ring_orange: {x: 88, y: 256, w: 24, h: 24},
    ring_teal: {x: 112, y: 256, w: 24, h: 24},
    crystal_purple: {x: 136, y: 256, w: 24, h: 32},
    crystal_blue_1: {x: 160, y: 256, w: 24, h: 32},
    crystal_blue_2: {x: 184, y: 256, w: 24, h: 32},
    crystal_teal: {x: 208, y: 256, w: 24, h: 32},
  },

  // ============================================================
  // BOXES & CONTAINERS (NEW)
  // ============================================================
  containers: {
    vault_green: {x: 0, y: 288, w: 48, h: 48},
    vault_gold: {x: 48, y: 288, w: 48, h: 48},
    chest_wooden: {x: 96, y: 288, w: 48, h: 32},
    chest_dark: {x: 144, y: 288, w: 48, h: 32},
    safe_green: {x: 192, y: 288, w: 32, h: 32},
    safe_brown: {x: 224, y: 288, w: 32, h: 32},
  },

  // ============================================================
  // WEAPONS (EXPANDED)
  // ============================================================
  melee_weapons: {
    crossbow: {x: 0, y: 320, w: 40, h: 24},
    hammer: {x: 40, y: 320, w: 32, h: 32},
    pickaxe: {x: 72, y: 320, w: 32, h: 32},
    bow: {x: 104, y: 320, w: 24, h: 40},
    dagger: {x: 128, y: 320, w: 12, h: 32},
    mace: {x: 140, y: 320, w: 24, h: 40},
  },

  // ============================================================
  // UI ELEMENTS - STATS & BARS
  // ============================================================
  ui: {
    hp_label: {x: 0, y: 0, w: 24, h: 16},
    mp_label: {x: 24, y: 0, w: 24, h: 16},
    xp_label: {x: 48, y: 0, w: 24, h: 16},
    data_label: {x: 72, y: 0, w: 24, h: 16},
  },

  // ============================================================
  // TERRAIN & ENVIRONMENT (LEGACY)
  // ============================================================
  terrain: {
    tile_grass_top: {x: 0, y: 352, w: 32, h: 32},
    tile_grass_full: {x: 32, y: 352, w: 32, h: 32},
    tile_dirt: {x: 64, y: 352, w: 32, h: 32},
    tile_stone: {x: 96, y: 352, w: 32, h: 32},
    tile_brick: {x: 128, y: 352, w: 32, h: 32},
    tile_brick_dark: {x: 160, y: 352, w: 32, h: 32},
  },

  // ============================================================
  // EFFECTS - ANIMATIONS (NEW & EXPANDED)
  // ============================================================
  effects: {
    // Fire animations
    fire_1: {x: 0, y: 384, w: 32, h: 32},
    fire_2: {x: 32, y: 384, w: 32, h: 32},
    fire_3: {x: 64, y: 384, w: 32, h: 32},
    
    // Explosions
    explosion_1: {x: 96, y: 384, w: 32, h: 32},
    explosion_2: {x: 128, y: 384, w: 32, h: 32},
    
    // Glow effects
    glow_green: {x: 160, y: 384, w: 32, h: 32},
    glow_teal: {x: 192, y: 384, w: 32, h: 32},
    glow_gold: {x: 224, y: 384, w: 32, h: 32},
    
    // Particle effects
    spark_yellow: {x: 256, y: 384, w: 16, h: 16},
    spark_gold: {x: 272, y: 384, w: 16, h: 16},
  },

  // ============================================================
  // ENEMIES (LEGACY)
  // ============================================================
  enemies: {
    enemy_crab: {x: 0, y: 416, w: 32, h: 32},
    enemy_ghost_green: {x: 32, y: 416, w: 32, h: 32},
    enemy_ghost_large: {x: 64, y: 416, w: 48, h: 48},
    enemy_skeleton: {x: 112, y: 416, w: 32, h: 32},
    enemy_robot: {x: 144, y: 416, w: 32, h: 32},
  },

  // ============================================================
  // ITEMS & LOOT (LEGACY + NEW)
  // ============================================================
  items: {
    item_chest: {x: 0, y: 448, w: 32, h: 32},
    item_coin_gold: {x: 32, y: 448, w: 32, h: 32},
    item_heart_full: {x: 64, y: 448, w: 32, h: 32},
    item_heart_empty: {x: 96, y: 448, w: 32, h: 32},
    item_diamond: {x: 128, y: 448, w: 32, h: 32},
    item_key: {x: 160, y: 448, w: 32, h: 32},
  },
};

// ============================================================
// SPRITE ANIMATION SEQUENCES
// ============================================================
// Maps animation names to frame sequences

const SPRITE_ANIMATIONS = {
  // Fire animations
  fire_burn: {
    frames: ["fire_1", "fire_2", "fire_3"],
    duration: 150,
    loop: true,
  },
  
  // Attack animations
  attack: {
    frames: ["spell_purple_burst_1", "spell_purple_burst_2"],
    duration: 100,
    loop: false,
  },
  
  // Spell casting
  water_cast: {
    frames: ["spell_water_1", "spell_water_2", "spell_water_3", "spell_water_4"],
    duration: 150,
    loop: false,
  },
  
  lightning_bolt: {
    frames: ["spell_cyan_burst_1", "spell_cyan_burst_2", "spell_cyan_burst_3", "spell_cyan_burst_4"],
    duration: 120,
    loop: false,
  },
  
  // Explosion
  explosion: {
    frames: ["explosion_1", "explosion_2"],
    duration: 100,
    loop: false,
  },
  
  // Orb animations
  orb_spin: {
    frames: ["spell_energy_green", "spell_energy_teal", "spell_energy_gold"],
    duration: 200,
    loop: true,
  },
  
  // Crystal glow
  crystal_glow: {
    frames: ["crystal_purple", "crystal_blue_1", "crystal_blue_2"],
    duration: 150,
    loop: true,
  },
};

// ============================================================
// [ENTITY_SPRITES] - Maps game entities to sprite names
// ============================================================

const ENTITY_SPRITES = {
  // Player
  player: "player_male",
  
  // Enemies (from enemies-battle.js)
  goblin: "enemy_ghost_green",
  skeleton: "enemy_skeleton",
  robot: "enemy_robot",
  crab: "enemy_crab",
  ghost: "enemy_ghost_large",
  
  // Spell effects
  fireball: "effect_fire_1",
  frostbolt: "spell_water_ice",
  lightning: "spell_lightning",
  
  // Items
  coin: "item_coin",
  potion: "item_potion_blue",
  chest: "item_chest",
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getSpriteCoords(category, spriteName) {
  if (SPRITE_SHEET[category] && SPRITE_SHEET[category][spriteName]) {
    return SPRITE_SHEET[category][spriteName];
  }
  console.warn(`Sprite not found: ${category}.${spriteName}`);
  return null;
}

function getEntitySprite(entityName) {
  const spriteName = ENTITY_SPRITES[entityName];
  if (!spriteName) {
    console.warn(`Entity sprite not found: ${entityName}`);
    return null;
  }
  
  // Find which category this sprite belongs to
  for (let category in SPRITE_SHEET) {
    if (SPRITE_SHEET[category][spriteName]) {
      return getSpriteCoords(category, spriteName);
    }
  }
  return null;
}

function getAnimation(animName) {
  if (SPRITE_ANIMATIONS[animName]) {
    return SPRITE_ANIMATIONS[animName];
  }
  console.warn(`Animation not found: ${animName}`);
  return null;
}

// ============================================================
// EXPORT
// ============================================================

console.log("[sprites-resources.js] Sprite library loaded with " + 
  Object.keys(SPRITE_SHEET).length + " categories");
