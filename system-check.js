// Quick verification that systems are defined
console.log("Checking system definitions...");

// Check DiceSystem
if (typeof DiceSystem !== 'undefined' && DiceSystem.roll) {
  console.log("✅ DiceSystem loaded");
  console.log("   - rollD6:", typeof DiceSystem.rollD6);
  console.log("   - rollD20:", typeof DiceSystem.rollD20);
  console.log("   - calculateModifier:", typeof DiceSystem.calculateModifier);
} else {
  console.error("❌ DiceSystem missing");
}

// Check SpellTinkeringSystem
if (typeof SpellTinkeringSystem !== 'undefined') {
  console.log("✅ SpellTinkeringSystem loaded");
} else {
  console.error("❌ SpellTinkeringSystem missing");
}

// Check AIDMIntegration
if (typeof AIDMIntegration !== 'undefined') {
  console.log("✅ AIDMIntegration loaded");
} else {
  console.error("❌ AIDMIntegration missing");
}

// Check AISummonRitualsystem
if (typeof AISummonRitualsystem !== 'undefined') {
  console.log("✅ AISummonRitualsystem loaded");
} else {
  console.error("❌ AISummonRitualsystem missing");
}

// Check IntegrationBootstrap
if (typeof IntegrationBootstrap !== 'undefined') {
  console.log("✅ IntegrationBootstrap loaded");
} else {
  console.error("❌ IntegrationBootstrap missing");
}

// Check GameEngine
if (typeof GameEngine !== 'undefined') {
  console.log("✅ GameEngine loaded");
} else {
  console.error("❌ GameEngine missing");
}

console.log("\nAll systems ready for integration test!");
