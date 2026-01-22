// Inject this into browser console to test commands
console.log("=== TESTING GAME COMMANDS ===");

// Test if gameEngine exists
if (typeof window.gameEngine !== 'undefined') {
    console.log("✓ GameEngine found");
    
    // Test music command directly
    console.log("Testing music command...");
    if (typeof window.gameEngine.cmdMusic === 'function') {
        window.gameEngine.cmdMusic(['help']);
        console.log("✓ Music command executed");
    } else {
        console.log("✗ Music command not found");
    }
    
    // Test help command
    console.log("Testing help command...");
    if (typeof window.gameEngine.cmdHelp === 'function') {
        window.gameEngine.cmdHelp([]);
        console.log("✓ Help command executed");
    } else {
        console.log("✗ Help command not found");
    }
    
    // Test parseCommand
    console.log("Testing parseCommand...");
    window.gameEngine.parseCommand("help");
    window.gameEngine.parseCommand("music");
    
} else {
    console.log("✗ GameEngine not found");
}

// Test CommandParser
if (typeof window.CommandParser !== 'undefined') {
    console.log("✓ CommandParser found");
    console.log("Commands registered:", Object.keys(window.CommandParser.commands || {}));
} else {
    console.log("✗ CommandParser not found");
}

console.log("=== TEST COMPLETE ===");