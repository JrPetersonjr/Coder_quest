package net.agentic.framework;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.fabricmc.fabric.api.networking.v1.ServerPlayConnectionEvents;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import net.agentic.framework.commands.AgenticCommands;
import net.agentic.framework.server.CommandExecutor;
import net.agentic.framework.ai.NaturalLanguageParser;
import net.agentic.framework.integration.JavaScriptBridge;

public class AgenticFrameworkMod implements ModInitializer {
    public static final String MOD_ID = "agentic_framework";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);
    
    private static MinecraftServer server;
    private static CommandExecutor commandExecutor;
    private static NaturalLanguageParser nlpProcessor;
    private static JavaScriptBridge jsBridge;
    
    @Override
    public void onInitialize() {
        LOGGER.info("🌟 Initializing Agentic Framework for Minecraft!");
        
        // Initialize core systems
        commandExecutor = new CommandExecutor();
        nlpProcessor = new NaturalLanguageParser();
        jsBridge = new JavaScriptBridge();
        
        // Register commands
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {
            AgenticCommands.register(dispatcher);
        });
        
        // Server lifecycle events
        ServerLifecycleEvents.SERVER_STARTED.register(this::onServerStarted);
        ServerLifecycleEvents.SERVER_STOPPING.register(this::onServerStopping);
        
        // Player connection events
        ServerPlayConnectionEvents.JOIN.register(this::onPlayerJoin);
        
        LOGGER.info("✅ Agentic Framework initialized successfully!");
    }
    
    private void onServerStarted(MinecraftServer minecraftServer) {
        server = minecraftServer;
        
        // Start JavaScript bridge for web interface
        jsBridge.startBridge(8765);
        
        // Initialize voice processing
        commandExecutor.initialize(server);
        
        LOGGER.info("🚀 Agentic Framework server components started");
        LOGGER.info("🌐 JavaScript bridge available on port 8765");
        LOGGER.info("🎙️ Voice commands ready - say 'build wall 3 by 2 with stone'");
    }
    
    private void onServerStopping(MinecraftServer minecraftServer) {
        if (jsBridge != null) {
            jsBridge.stopBridge();
        }
        
        LOGGER.info("🛑 Agentic Framework shutting down");
    }
    
    private void onPlayerJoin(net.fabricmc.fabric.api.networking.v1.ServerPlayConnectionEvents.Join handler, 
                              net.fabricmc.fabric.api.networking.v1.PacketSender sender, 
                              MinecraftServer server, 
                              ServerPlayerEntity player, 
                              net.fabricmc.fabric.api.networking.v1.ServerPlayNetworkHandler networkHandler) {
        
        // Send welcome message with instructions
        player.sendMessage(Text.of("🌟 Agentic Framework loaded! Press ` for voice commands"), false);
        player.sendMessage(Text.of("🎙️ Try saying: 'build wall 3 by 2 with stone'"), false);
        
        LOGGER.info("Player {} connected to Agentic Framework", player.getName().getString());
    }
    
    // Static getters for other classes
    public static MinecraftServer getServer() {
        return server;
    }
    
    public static CommandExecutor getCommandExecutor() {
        return commandExecutor;
    }
    
    public static NaturalLanguageParser getNLPProcessor() {
        return nlpProcessor;
    }
    
    public static JavaScriptBridge getJSBridge() {
        return jsBridge;
    }
    
    // Utility method for processing voice commands
    public static void processVoiceCommand(String command, ServerPlayerEntity player) {
        try {
            LOGGER.info("🎙️ Processing voice command: '{}' from {}", command, player.getName().getString());
            
            // Parse natural language
            var intent = nlpProcessor.parseCommand(command, player);
            
            // Execute command
            var result = commandExecutor.executeIntent(intent, player);
            
            // Send feedback to player
            if (result.isSuccess()) {
                player.sendMessage(Text.of("✅ " + result.getMessage()), false);
            } else {
                player.sendMessage(Text.of("❌ " + result.getError()), false);
            }
            
            // Send to JavaScript bridge for web interface
            jsBridge.sendCommandResult(command, result, player);
            
        } catch (Exception e) {
            LOGGER.error("Error processing voice command: {}", command, e);
            player.sendMessage(Text.of("❌ Command failed: " + e.getMessage()), false);
        }
    }
}