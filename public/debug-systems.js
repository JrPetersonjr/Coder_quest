// Quick debug test for game systems
console.log("=== GAME SYSTEMS DEBUG ===");

// Test 1: Check if systems are loaded
console.log("GameEngine:", typeof window.GameEngine);
console.log("CommandParser:", typeof window.CommandParser);
console.log("DiceSystem:", typeof window.DiceSystem);
console.log("MIDIPlayer:", typeof window.MIDIPlayer);

// Test 2: Check if systems are initialized
if (window.gameEngine) {
    console.log("✓ GameEngine instance exists");
    console.log("- cmdMusic method:", typeof window.gameEngine.cmdMusic);
    console.log("- parseCommand method:", typeof window.gameEngine.parseCommand);
} else {
    console.log("✗ GameEngine instance missing");
}

if (window.CommandParser) {
    console.log("✓ CommandParser exists");
    console.log("- initialize method:", typeof window.CommandParser.initialize);
    console.log("- parse method:", typeof window.CommandParser.parse);
    console.log("- commands registered:", Object.keys(window.CommandParser.commands || {}));
} else {
    console.log("✗ CommandParser missing");
}

// Test 3: Try a music command
if (window.gameEngine && typeof window.gameEngine.cmdMusic === 'function') {
    console.log("Testing music command...");
    try {
        window.gameEngine.cmdMusic(['help']);
    } catch (e) {
        console.error("Music command error:", e);
    }
} else {
    console.log("Cannot test music command - method not available");
}

// Test 4: Check integration bootstrap
console.log("IntegrationBootstrap:", typeof window.IntegrationBootstrap);

console.log("=== DEBUG COMPLETE ===");