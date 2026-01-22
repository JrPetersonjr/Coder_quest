// Dice registry and rolling

const Dice = {
  summoned: {
    d6: false,
    d20: false,
    "3d12": false
  },

  summon(name, zone) {
    const key = name.toLowerCase();
    if (!this.summoned.hasOwnProperty(key)) return { ok: false, msg: "Unknown die." };
    if (this.summoned[key]) return { ok: false, msg: "Already summoned." };

    this.summoned[key] = true;

    const emoji = Content.zoneEmoji[zone] || "";
    let flavor = "";

    if (zone === "forest") {
      flavor = `${emoji} A wooden ${key} forms from roots and bark.`;
    } else if (zone === "city") {
      flavor = `${emoji} Neon lattice compiles into ${key}.`;
    } else if (zone === "fantasy") {
      flavor = `${emoji} A carved stone ${key} materializes with a soft chime.`;
    } else if (zone === "wasteland") {
      flavor = `${emoji} Scrap metal fuses into a crude ${key}. Stable enough.`;
    } else if (zone === "cosmic") {
      flavor = `${emoji} A star fragment crystallizes into ${key}.`;
    } else {
      flavor = `${emoji} ${key} bound to your session.`;
    }

    return { ok: true, msg: flavor };
  },

  canRoll(name) {
    const key = name.toLowerCase();
    return !!this.summoned[key];
  },

  roll(name) {
    const key = name.toLowerCase();
    if (key === "d6") return [Dice.rollDie(6)];
    if (key === "d20") return [Dice.rollDie(20)];
    if (key === "3d12") return [Dice.rollDie(12), Dice.rollDie(12), Dice.rollDie(12)];
    return [];
  },

  rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }
};
